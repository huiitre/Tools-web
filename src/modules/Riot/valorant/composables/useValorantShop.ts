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
  type RawBundle,
} from '../fetch/valorantShop.fetch'

export type View = 'form' | 'loading' | 'shop'
export type AuthMode = 'access' | 'refresh'

export interface BundleSkin {
  id: string
  name: string
  icon: string
  cost: number
}

export interface ShopBundle {
  uuid: string
  name: string
  displayIcon: string
  baseCost: number
  discountedCost: number
  discountPercent: number
  expiresAt: number
  skins: BundleSkin[]
}

export const REGIONS: { value: RiotRegion; label: string }[] = [
  { value: 'eu', label: 'EU — Europe' },
  { value: 'na', label: 'NA — Amérique du Nord' },
  { value: 'ap', label: 'AP — Asie-Pacifique' },
  { value: 'kr', label: 'KR — Corée' },
  { value: 'br', label: 'BR — Brésil' },
  { value: 'latam', label: 'LATAM — Amérique latine' },
]

export function useValorantShop() {
  const riotStore = useRiotStore()

  const view = ref<View>('form')
  const skins = ref<{ id: string; name: string; icon: string; cost: number }[]>([])
  const bundles = ref<ShopBundle[]>([])
  const currentSkinIds = ref<string[]>([])
  const cachedSkinsMap = ref<Record<string, any> | null>(null)
  const isRenewing = ref(false)
  const error = ref<string | null>(null)
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

  const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

  function mapSkin(id: string, cost: number, skinsMap: Record<string, any>) {
    const skin = skinsMap[id]
    return {
      id,
      name: skin?.displayName ?? 'Skin inconnu',
      icon: skin?.levels?.[0]?.displayIcon ?? skin?.displayIcon ?? skin?.chromas?.[0]?.fullRender ?? '',
      cost,
    }
  }

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
        skins: b.items.map(item => mapSkin(item.itemId, item.cost, skinsMap)),
      }
    }))
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
          skins.value = offers.map(({ id, cost }) => mapSkin(id, cost, map))
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
      skins.value = offers.map(({ id, cost }) => mapSkin(id, cost, skinsMap))
      currentSkinIds.value = offers.map(o => o.id)
      bundles.value = await buildBundles(rawBundles, skinsMap)

      riotStore.setAuth(token, region)
      startTimer(remainingSeconds)
      view.value = 'shop'
    } catch (e: any) {
      error.value = e?.message ?? 'Erreur lors du chargement de la boutique'
      riotStore.clearAll()
      view.value = 'form'
    }
  }

  async function handleSubmit(token: string, region: RiotRegion, mode: AuthMode) {
    if (mode === 'access') {
      await loadShop(token, region)
    } else {
      view.value = 'loading'
      error.value = null
      try {
        const { accessToken, refreshToken: newRefresh } = await refreshToAccessToken(token)
        riotStore.setRefreshToken(newRefresh)
        riotStore.setRegion(region)
        await loadShop(accessToken, region)
      } catch (e: any) {
        error.value = e?.message ?? 'Refresh token invalide ou expiré'
        riotStore.clearAll()
        view.value = 'form'
      }
    }
  }

  function reset() {
    stopTimer()
    stopRenewal()
    riotStore.clearAll()
    skins.value = []
    bundles.value = []
    currentSkinIds.value = []
    cachedSkinsMap.value = null
    error.value = null
    view.value = 'form'
  }

  function currentRegionLabel() {
    return REGIONS.find(r => r.value === riotStore.region)?.label ?? riotStore.region.toUpperCase()
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

  onBeforeUnmount(() => {
    stopTimer()
    stopRenewal()
  })

  return {
    view,
    skins,
    bundles,
    isRenewing,
    error,
    bundleNow,
    formattedTime,
    handleSubmit,
    reset,
    currentRegionLabel,
  }
}
