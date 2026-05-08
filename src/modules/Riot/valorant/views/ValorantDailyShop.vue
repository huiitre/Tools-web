<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRiotStore, type RiotRegion } from '@/modules/Riot/riot.store'
import {
  extractPuuid,
  fetchEntitlementToken,
  fetchClientVersion,
  fetchStorefront,
  fetchSkinsMap,
  fetchBundleMeta,
  refreshToAccessToken,
  isAccessTokenExpired,
  type ShopSkin,
  type RawBundle,
} from '@/modules/Riot/valorant/fetch/valorantShop.fetch'

type View = 'form' | 'loading' | 'shop'
type AuthMode = 'access' | 'refresh'

interface BundleSkin {
  id: string
  name: string
  icon: string
}

interface ShopBundle {
  uuid: string
  name: string
  displayIcon: string
  baseCost: number
  discountedCost: number
  discountPercent: number
  expiresAt: number
  skins: BundleSkin[]
}

const REGIONS: { value: RiotRegion; label: string }[] = [
  { value: 'eu', label: 'EU — Europe' },
  { value: 'na', label: 'NA — Amérique du Nord' },
  { value: 'ap', label: 'AP — Asie-Pacifique' },
  { value: 'kr', label: 'KR — Corée' },
  { value: 'br', label: 'BR — Brésil' },
  { value: 'latam', label: 'LATAM — Amérique latine' },
]

const riotStore = useRiotStore()

const view = ref<View>('form')
const authMode = ref<AuthMode>('access')
const skins = ref<ShopSkin[]>([])
const bundles = ref<ShopBundle[]>([])
const currentSkinIds = ref<string[]>([])
const cachedSkinsMap = ref<Record<string, any> | null>(null)
const isRenewing = ref(false)
const error = ref<string | null>(null)
const tokenInput = ref('')
const showToken = ref(false)
const selectedRegion = ref<RiotRegion>(riotStore.region)

const remainingMs = ref(0)
const bundleNow = ref(Date.now())
let timerInterval: ReturnType<typeof setInterval> | null = null
let renewalActive = false

const formattedTime = computed(() => {
  const total = Math.max(0, remainingMs.value)
  const h = Math.floor(total / 3_600_000)
  const m = Math.floor((total % 3_600_000) / 60_000)
  const s = Math.floor((total % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const tokenLabel = computed(() =>
  authMode.value === 'access' ? 'Access Token' : 'Refresh Token'
)

const tokenPlaceholder = computed(() =>
  authMode.value === 'access'
    ? 'Collez votre __Secure-access_token ici...'
    : 'Collez votre __Secure-refresh_token ici...'
)

const submitLabel = computed(() => 'Afficher ma boutique')

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

async function buildBundles(rawBundles: RawBundle[], skinsMap: Record<string, any>): Promise<ShopBundle[]> {
  return Promise.all(rawBundles.map(async (b) => {
    const meta = await fetchBundleMeta(b.dataAssetId)
    return {
      uuid: b.dataAssetId,
      name: meta.name,
      displayIcon: meta.displayIcon,
      baseCost: b.totalBaseCost,
      discountedCost: b.totalDiscountedCost,
      discountPercent: b.discountPercent,
      expiresAt: Date.now() + b.remainingSeconds * 1_000,
      skins: b.skinItemIds.map(id => {
        const skin = skinsMap[id]
        return {
          id,
          name: skin?.displayName ?? 'Skin inconnu',
          icon: skin?.levels?.[0]?.displayIcon ?? skin?.displayIcon ?? skin?.chromas?.[0]?.fullRender ?? '',
        }
      }),
    }
  }))
}

function bundleFormattedTime(b: ShopBundle): string {
  const ms = Math.max(0, b.expiresAt - bundleNow.value)
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return d > 0 ? `${d}j ${h}h ${m}min` : `${h}h ${m}min`
}

function startTimer(seconds: number) {
  stopTimer()
  const expiresAt = Date.now() + seconds * 1_000
  remainingMs.value = expiresAt - Date.now()
  timerInterval = setInterval(() => {
    const now = Date.now()
    remainingMs.value = Math.max(0, expiresAt - now)
    bundleNow.value = now
    if (remainingMs.value === 0) {
      stopTimer()
      startRenewal()
    }
  }, 1_000)
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function stopRenewal() {
  renewalActive = false
  isRenewing.value = false
}

async function ensureAccessToken(): Promise<string | null> {
  const current = riotStore.accessToken
  if (current && !isAccessTokenExpired(current)) return current

  if (riotStore.refreshToken) {
    try {
      const { accessToken, refreshToken: newRefresh } = await refreshToAccessToken(riotStore.refreshToken)
      riotStore.setAccessToken(accessToken)
      riotStore.setRefreshToken(newRefresh)
      return accessToken
    } catch {
      riotStore.clearAll()
      return null
    }
  }

  return null
}

async function fetchOffers(token: string, region: RiotRegion) {
  const puuid = extractPuuid(token)
  const [entitlementsToken, clientVersion] = await Promise.all([
    fetchEntitlementToken(token),
    fetchClientVersion(),
  ])
  return fetchStorefront(puuid, region, token, entitlementsToken, clientVersion)
}

async function startRenewal() {
  if (renewalActive) return
  renewalActive = true
  isRenewing.value = true

  const prevIds = currentSkinIds.value.join(',')
  let attempts = 0

  while (renewalActive && attempts < 30) {
    await sleep(10_000)
    if (!renewalActive) break

    attempts++

    const token = await ensureAccessToken()
    if (!token) {
      stopRenewal()
      error.value = 'Session expirée, veuillez vous reconnecter'
      view.value = 'form'
      return
    }

    try {
      const { offers, remainingSeconds, bundles: rawBundles } = await fetchOffers(token, riotStore.region)
      const newIds = offers.map(o => o.id).join(',')

      if (newIds !== prevIds && renewalActive) {
        const map = cachedSkinsMap.value ?? await fetchSkinsMap()
        cachedSkinsMap.value = map
        skins.value = offers.map(({ id, cost }) => {
          const skin = map[id]
          return {
            id,
            name: skin?.displayName ?? 'Skin inconnu',
            icon: skin?.levels?.[0]?.displayIcon ?? skin?.displayIcon ?? skin?.chromas?.[0]?.fullRender ?? '',
            cost,
          }
        })
        currentSkinIds.value = offers.map(o => o.id)
        bundles.value = await buildBundles(rawBundles, map)
        startTimer(remainingSeconds)
        stopRenewal()
        return
      }
    } catch {
      // retry next iteration
    }
  }

  if (renewalActive) stopRenewal()
}

async function loadShop(token: string, region: RiotRegion) {
  view.value = 'loading'
  error.value = null

  try {
    const [{ offers, remainingSeconds, bundles: rawBundles }, skinsMap] = await Promise.all([
      fetchOffers(token, region),
      fetchSkinsMap(),
    ])

    cachedSkinsMap.value = skinsMap
    skins.value = offers.map(({ id, cost }) => {
      const skin = skinsMap[id]
      return {
        id,
        name: skin?.displayName ?? 'Skin inconnu',
        icon: skin?.levels?.[0]?.displayIcon ?? skin?.displayIcon ?? skin?.chromas?.[0]?.fullRender ?? '',
        cost,
      }
    })
    currentSkinIds.value = offers.map(o => o.id)
    bundles.value = await buildBundles(rawBundles, skinsMap)

    riotStore.setAuth(token, region)
    startTimer(remainingSeconds)
    view.value = 'shop'
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement de la boutique'
    riotStore.clearAll()
    tokenInput.value = ''
    view.value = 'form'
  }
}

onMounted(async () => {
  if (riotStore.refreshToken) {
    view.value = 'loading'
    if (riotStore.accessToken && !isAccessTokenExpired(riotStore.accessToken)) {
      await loadShop(riotStore.accessToken, riotStore.region)
    } else {
      const token = await ensureAccessToken()
      if (token) {
        await loadShop(token, riotStore.region)
      } else {
        error.value = 'Session expirée, veuillez vous reconnecter'
        view.value = 'form'
      }
    }
  } else if (riotStore.accessToken && !isAccessTokenExpired(riotStore.accessToken)) {
    await loadShop(riotStore.accessToken, riotStore.region)
  }
})

async function onSubmit() {
  const token = tokenInput.value.trim()
  if (!token) return

  if (authMode.value === 'access') {
    await loadShop(token, selectedRegion.value)
  } else {
    view.value = 'loading'
    error.value = null
    try {
      const { accessToken, refreshToken: newRefresh } = await refreshToAccessToken(token)
      riotStore.setRefreshToken(newRefresh)
      riotStore.setRegion(selectedRegion.value)
      await loadShop(accessToken, selectedRegion.value)
    } catch (e: any) {
      error.value = e?.message ?? 'Refresh token invalide ou expiré'
      riotStore.clearAll()
      tokenInput.value = ''
      view.value = 'form'
    }
  }
}

function resetAuth() {
  stopTimer()
  stopRenewal()
  riotStore.clearAll()
  tokenInput.value = ''
  skins.value = []
  bundles.value = []
  currentSkinIds.value = []
  cachedSkinsMap.value = null
  error.value = null
  selectedRegion.value = 'eu'
  view.value = 'form'
}

function currentRegionLabel() {
  return REGIONS.find(r => r.value === riotStore.region)?.label ?? riotStore.region.toUpperCase()
}

onBeforeUnmount(() => {
  stopTimer()
  stopRenewal()
})
</script>

<template>
  <!-- ── FORM ───────────────────────────────────────────────── -->
  <div v-if="view === 'form'" class="form-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <i class="mdi mdi-crosshairs auth-icon" />
        <div>
          <h3 class="auth-title">Valorant Daily Shop</h3>
          <p class="auth-subtitle">Consultez votre boutique sans ouvrir le jeu</p>
        </div>
      </div>

      <div v-if="error" class="error-banner" role="alert">
        <i class="mdi mdi-alert-circle-outline" />
        {{ error }}
      </div>

      <div class="auth-mode-switch">
        <button
          :class="['mode-btn', { active: authMode === 'access' }]"
          @click="authMode = 'access'; tokenInput = ''"
        >
          Access Token
        </button>
        <button
          :class="['mode-btn', { active: authMode === 'refresh' }]"
          @click="authMode = 'refresh'; tokenInput = ''"
        >
          Refresh Token
        </button>
      </div>

      <label>
        Région
        <select v-model="selectedRegion">
          <option v-for="r in REGIONS" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
      </label>

      <label>
        {{ tokenLabel }}
        <div class="token-input-wrap">
          <input
            :type="showToken ? 'text' : 'password'"
            v-model="tokenInput"
            :placeholder="tokenPlaceholder"
          />
          <button
            type="button"
            class="token-eye"
            aria-label="Afficher/masquer le token"
            @click="showToken = !showToken"
          >
            <i :class="['mdi', showToken ? 'mdi-eye-off' : 'mdi-eye']" />
          </button>
        </div>
      </label>

      <p v-if="authMode === 'refresh'" class="help-note">
        Le refresh token dure plusieurs semaines — vous n'aurez plus besoin de le renouveler régulièrement.
      </p>
      <p v-else class="help-note">
        L'access token expire après ~1h. Préférez le Refresh Token pour ne pas avoir à revenir ici régulièrement.
      </p>

      <details>
        <summary>Comment récupérer mon token ?</summary>
        <div class="help-content">

          <!-- Access token help -->
          <template v-if="authMode === 'access'">
            <ol class="help-steps">
              <li>Connectez-vous sur <a href="https://playvalorant.com" target="_blank" rel="noopener">playvalorant.com</a></li>
              <li>Ouvrez les DevTools (F12) → onglet <strong>Application</strong></li>
              <li>Dans le panneau gauche : <strong>Cookies</strong> → <code>https://playvalorant.com</code></li>
              <li>Cherchez <code>__Secure-access_token</code> et copiez la colonne <strong>Value</strong></li>
            </ol>
            <p class="help-note" style="background: transparent; border-color: transparent; color: var(--pico-muted-color);">
              Ces cookies sont HttpOnly — non lisibles via la console JS, utilisez uniquement l'onglet Application.
            </p>
          </template>

          <!-- Refresh token help -->
          <template v-else>
            <ol class="help-steps">
              <li>Connectez-vous sur <a href="https://playvalorant.com" target="_blank" rel="noopener">playvalorant.com</a></li>
              <li>Ouvrez les DevTools (F12) → onglet <strong>Application</strong></li>
              <li>Dans le panneau gauche : <strong>Cookies</strong> → <code>https://playvalorant.com</code></li>
              <li>Cherchez <code>__Secure-refresh_token</code> et copiez la colonne <strong>Value</strong></li>
            </ol>
            <p class="help-note" style="background: transparent; border-color: transparent; color: var(--pico-muted-color);">
              Ces cookies sont HttpOnly — non lisibles via la console JS, utilisez uniquement l'onglet Application.
            </p>
          </template>

        </div>
      </details>

      <button :disabled="!tokenInput.trim()" @click="onSubmit">
        {{ submitLabel }}
      </button>
    </div>
  </div>

  <!-- ── LOADING (skeleton) ─────────────────────────────────── -->
  <div v-else-if="view === 'loading'" class="shop-wrapper">
    <div class="shop-meta skeleton-meta">
      <div class="skeleton-line" style="width: 160px; height: 0.85rem;" />
    </div>
    <div class="shop-timer skeleton-timer">
      <div class="skeleton-line" style="width: 200px; height: 3rem; border-radius: 8px;" />
    </div>
    <div class="skin-grid">
      <div v-for="i in 4" :key="i" class="skin-card skin-card--skeleton">
        <div class="skeleton-image" />
        <div class="skin-info">
          <div class="skeleton-line" style="width: 72%; height: 1rem;" />
          <div class="skeleton-line" style="width: 38%; height: 0.85rem; margin-top: 0.35rem;" />
        </div>
      </div>
    </div>
  </div>

  <!-- ── SHOP ───────────────────────────────────────────────── -->
  <div v-else class="shop-wrapper">
    <div class="shop-meta">
      <span class="shop-region">
        <i class="mdi mdi-map-marker-outline" />
        {{ currentRegionLabel() }}
      </span>
      <button class="reset-btn" @click="resetAuth">
        <i class="mdi mdi-refresh" />
        Changer de token
      </button>
    </div>

    <div class="shop-timer" :class="{ 'shop-timer--renewing': isRenewing }">
      {{ formattedTime }}
    </div>
    <Transition name="fade">
      <div v-if="isRenewing" class="renewing-hint">
        <i class="mdi mdi-refresh renewing-spin" />
        Vérification des nouveaux skins...
      </div>
    </Transition>

    <div class="skin-grid">
      <article
        v-for="(skin, i) in skins"
        :key="skin.id"
        class="skin-card"
        :style="{ '--delay': `${i * 110}ms` }"
      >
        <div class="skin-image-wrap">
          <img :src="skin.icon" :alt="skin.name" class="skin-image" loading="lazy" />
        </div>
        <div class="skin-info">
          <div class="skin-name">{{ skin.name }}</div>
          <div class="skin-price">
            <span class="vp-badge">{{ skin.cost.toLocaleString('fr-FR') }} VP</span>
          </div>
        </div>
      </article>
    </div>

    <template v-if="bundles.length">
      <div class="bundle-section-header">
        <i class="mdi mdi-package-variant-closed" />
        Pack{{ bundles.length > 1 ? 's' : '' }} en vente
      </div>
      <article v-for="b in bundles" :key="b.uuid" class="bundle-card">
        <!-- Image pleine largeur -->
        <div class="bundle-banner">
          <img v-if="b.displayIcon" :src="b.displayIcon" :alt="b.name" loading="lazy" />
          <div v-else class="bundle-banner-placeholder" />
        </div>
        <!-- Info -->
        <div class="bundle-info-row">
          <div class="bundle-info-left">
            <div class="bundle-name">{{ b.name }}</div>
            <div class="bundle-price-row">
              <span class="vp-badge">{{ b.discountedCost.toLocaleString('fr-FR') }} VP</span>
              <template v-if="b.discountPercent > 0">
                <span class="bundle-original">{{ b.baseCost.toLocaleString('fr-FR') }} VP</span>
                <span class="bundle-discount-badge">-{{ Math.round(b.discountPercent * 100) }}%</span>
              </template>
            </div>
          </div>
          <div class="bundle-timer-block">
            <div class="bundle-countdown">{{ bundleFormattedTime(b) }}</div>
            <div class="bundle-timer-label">restant</div>
          </div>
        </div>
        <!-- Skins inclus -->
        <div v-if="b.skins.length" class="bundle-skins-grid">
          <div v-for="skin in b.skins" :key="skin.id" class="bundle-skin-item">
            <div class="bundle-skin-img">
              <img v-if="skin.icon" :src="skin.icon" :alt="skin.name" loading="lazy" />
            </div>
            <span class="bundle-skin-label">{{ skin.name }}</span>
          </div>
        </div>
      </article>
    </template>
  </div>
</template>

<style lang="scss" scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 56px - 52px);
  padding: 2rem 1rem;
}

.shop-wrapper {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Auth card ───────────────────────────────────────────────────────────── */
.auth-card {
  width: 100%;
  max-width: 520px;
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.auth-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-icon {
  font-size: 2.25rem;
  color: var(--pico-primary);
  flex-shrink: 0;
}

.auth-title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.2;
}

.auth-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

/* ── Auth mode switch ────────────────────────────────────────────────────── */
.auth-mode-switch {
  display: flex;
  background: var(--pico-muted-border-color);
  border-radius: 8px;
  padding: 3px;
  gap: 3px;
}

.mode-btn {
  flex: 1;
  padding: 0.4rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--pico-muted-color);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  margin: 0;
  width: auto;

  &.active {
    background: var(--pico-card-background-color);
    color: var(--pico-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  &:not(.active):hover {
    color: var(--pico-color);
    background: transparent;
  }
}

/* ── Error ───────────────────────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: color-mix(in srgb, #e53e3e 10%, transparent);
  border: 1px solid color-mix(in srgb, #e53e3e 25%, transparent);
  color: #e53e3e;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* ── Labels ──────────────────────────────────────────────────────────────── */
.auth-card label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0;
}

/* ── Token input ─────────────────────────────────────────────────────────── */
.token-input-wrap {
  position: relative;

  input {
    padding-right: 2.75rem;
    margin: 0;
  }
}

.token-eye {
  position: absolute;
  top: 50%;
  right: 0.6rem;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 0.25rem;
  margin: 0;
  cursor: pointer;
  color: var(--pico-muted-color);
  font-size: 1.1rem;
  line-height: 1;
  transition: color 0.15s ease;
  width: auto;

  &:hover {
    color: var(--pico-color);
    background: transparent;
  }
}

/* ── Help ────────────────────────────────────────────────────────────────── */
details a {
  color: var(--pico-primary);
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    text-decoration: underline;
  }
}

.help-content {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.help-note {
  margin: 0;
  font-size: 0.82rem;
  color: var(--pico-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: color-mix(in srgb, var(--pico-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--pico-primary) 20%, transparent);
}

.help-steps {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: var(--pico-muted-color);

  code {
    font-size: 0.8em;
    background: var(--pico-code-background-color);
    padding: 0.1em 0.35em;
    border-radius: 4px;
    color: var(--pico-code-color);
  }
}

.help-alt-label {
  margin: 0;
  font-size: 0.82rem;
  color: var(--pico-muted-color);
}

.help-code {
  margin: 0;
  padding: 0.6rem 0.8rem;
  background: var(--pico-code-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: 6px;
  font-size: 0.76rem;
  overflow-x: auto;
  white-space: pre;

  code {
    background: transparent;
    padding: 0;
    color: var(--pico-code-color);
    font-size: inherit;
  }
}

/* ── Shop meta bar ───────────────────────────────────────────────────────── */
.shop-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  min-height: 2rem;
}

.skeleton-meta {
  pointer-events: none;
}

.shop-region {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  background: transparent;
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 6px;
  color: var(--pico-muted-color);
  cursor: pointer;
  width: auto;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: var(--pico-primary);
    color: var(--pico-primary);
    background: transparent;
  }
}

/* ── Timer ───────────────────────────────────────────────────────────────── */
.shop-timer {
  text-align: center;
  font-size: 3rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  color: var(--pico-primary);
  margin-bottom: 0.75rem;
  transition: opacity 0.3s ease;
}

.skeleton-timer {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.shop-timer--renewing {
  opacity: 0.35;
  animation: pulse 1.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.6; }
}

.renewing-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--pico-muted-color);
  margin-bottom: 1.5rem;
}

.renewing-spin {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Skin grid ───────────────────────────────────────────────────────────── */
.skin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-top: 0.75rem;
}

/* ── Skin card ───────────────────────────────────────────────────────────── */
.skin-card {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
  animation: card-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay, 0ms);

  &:hover {
    transform: translateY(-7px);
    border-color: color-mix(in srgb, var(--pico-primary) 45%, transparent);
    box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.22),
      0 0 0 1px color-mix(in srgb, var(--pico-primary) 18%, transparent);

    .skin-image {
      transform: scale(1.07);
    }
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Skin image ──────────────────────────────────────────────────────────── */
.skin-image-wrap {
  background: #0d0d1a;
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1.25rem;
}

.skin-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.32s ease;
}

/* ── Skin info ───────────────────────────────────────────────────────────── */
.skin-info {
  padding: 1rem 1.1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skin-name {
  flex: 1;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--pico-color);
  line-height: 1.3;
}

.skin-price {
  margin-top: auto;
}

.vp-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, #ff4655 10%, transparent);
  border: 1px solid color-mix(in srgb, #ff4655 28%, transparent);
  font-size: 0.82rem;
  font-weight: 700;
  color: #ff4655;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
.skin-card--skeleton {
  animation: none;
  pointer-events: none;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

%shimmer {
  background: linear-gradient(
    90deg,
    var(--pico-card-background-color) 0%,
    var(--pico-muted-border-color) 50%,
    var(--pico-card-background-color) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

.skeleton-image {
  @extend %shimmer;
  height: 210px;
}

.skeleton-line {
  @extend %shimmer;
  display: block;
  border-radius: 6px;
}

/* ── Bundle section ──────────────────────────────────────────────────────── */
.bundle-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--pico-color);

  .mdi { font-size: 1.15rem; color: var(--pico-primary); }
}

.bundle-card {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  animation: card-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 80ms;
}

/* Bannière pleine largeur */
.bundle-banner {
  width: 100%;
  background: #0d0d1a;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
  }
}

.bundle-banner-placeholder {
  width: 100%;
  height: 100%;
}

/* Ligne info : nom+prix à gauche, timer à droite */
.bundle-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--pico-card-border-color);

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }
}

.bundle-info-left {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bundle-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--pico-color);
  line-height: 1.3;
}

.bundle-price-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.bundle-original {
  font-size: 0.82rem;
  color: var(--pico-muted-color);
  text-decoration: line-through;
}

.bundle-discount-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: #22c55e;
  background: color-mix(in srgb, #22c55e 12%, transparent);
  border: 1px solid color-mix(in srgb, #22c55e 28%, transparent);
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}

/* Timer bundle */
.bundle-timer-block {
  text-align: right;
  flex-shrink: 0;

  @media (max-width: 520px) { text-align: left; }
}

.bundle-countdown {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--pico-primary);
  line-height: 1.2;
}

.bundle-timer-label {
  font-size: 0.75rem;
  color: var(--pico-muted-color);
  margin-top: 0.1rem;
}

/* Grille de skins */
.bundle-skins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0;
  border-top: 1px solid var(--pico-card-border-color);
}

.bundle-skin-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.85rem 0.75rem;
  border-right: 1px solid var(--pico-card-border-color);
  border-bottom: 1px solid var(--pico-card-border-color);

  &:last-child { border-right: none; }
}

.bundle-skin-img {
  width: 100%;
  height: 72px;
  background: #0d0d1a;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }
}

.bundle-skin-label {
  font-size: 0.75rem;
  color: var(--pico-muted-color);
  text-align: center;
  line-height: 1.3;
}
</style>
