<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { clientV3 } from '@/services/axiosInstance'
import { useImagePreview } from '@/composables/useImagePreview'
import { fetchWeapons, type ValorantWeapon } from '../fetch/valorantShop.fetch'
import ValorantSkinCard from '../components/ValorantSkinCard.vue'

interface ValorantSkinLevel {
  assetId: string
  levelIndex: number
  displayIconUrl: string | null
  streamedVideoUrl: string | null
}

interface ValorantSkin {
  id: number
  assetId: string
  name: string
  iconUrl: string | null
  themeUuid: string | null
  contentTierUuid: string | null
  weaponId: number | null
  levels: ValorantSkinLevel[]
}

type SortBy = 'name' | 'id'
type SortDir = 'asc' | 'desc'

const skins = ref<ValorantSkin[]>([])
const weapons = ref<ValorantWeapon[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Filters & Sort
const q = ref('')
const weaponId = ref<number | null>(null)
const sortBy = ref<SortBy>('name')
const sortDir = ref<SortDir>('asc')

// Progressive Rendering
const PAGE_SIZE = 48
const limit = ref(PAGE_SIZE)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Back to Top
const showBackToTop = ref(false)

const { open: openImagePreview } = useImagePreview()

const filteredSkins = computed(() => {
  let result = [...skins.value]

  // Search
  if (q.value.trim()) {
    const search = q.value.toLowerCase().trim()
    result = result.filter(s => s.name.toLowerCase().includes(search))
  }

  // Weapon Filter
  if (weaponId.value !== null) {
    result = result.filter(s => s.weaponId === weaponId.value)
  }

  // Sort
  result.sort((a, b) => {
    let valA: string | number = ''
    let valB: string | number = ''

    if (sortBy.value === 'name') {
      valA = a.name.toLowerCase()
      valB = b.name.toLowerCase()
    } else {
      valA = a.id
      valB = b.id
    }

    if (valA < valB) return sortDir.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

const displayedSkins = computed(() => filteredSkins.value.slice(0, limit.value))
const hasMore = computed(() => limit.value < filteredSkins.value.length)

function toggleSortDir() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 600
}

// Reset limit on filter/sort change
watch([q, weaponId, sortBy, sortDir], () => {
  limit.value = PAGE_SIZE
  scrollToTop()
})

function initObserver() {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value) {
      limit.value += PAGE_SIZE
    }
  }, { rootMargin: '400px' })

  if (sentinel.value) observer.observe(sentinel.value)
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  try {
    const [skinsRes, weaponsRes] = await Promise.all([
      clientV3.get<ValorantSkin[]>('/riot/valorant/skins'),
      fetchWeapons()
    ])
    skins.value = skinsRes.data
    weapons.value = weaponsRes.sort((a, b) => a.name.localeCompare(b.name))

    await nextTick()
    initObserver()
  } catch {
    error.value = 'Impossible de charger les skins.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="catalog-wrapper">

    <!-- ── TOOLBAR ───────────────────────────────────────────── -->
    <div class="catalog-toolbar">
      <input
        v-model="q"
        type="search"
        placeholder="Rechercher un skin..."
        class="search-input"
      />

      <select v-model="weaponId" class="toolbar-select">
        <option :value="null">Toutes les armes</option>
        <option v-for="w in weapons" :key="w.id" :value="w.id">
          {{ w.name }}
        </option>
      </select>

      <select v-model="sortBy" class="toolbar-select sort-select">
        <option value="name">Nom</option>
        <option value="id">ID</option>
      </select>

      <button class="sort-dir-btn" @click="toggleSortDir">
        <i :class="['mdi', sortDir === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending']" />
      </button>

      <span v-if="!loading && !error" class="catalog-count">
        <span class="count-sep" />
        <strong>{{ filteredSkins.length.toLocaleString('fr-FR') }}</strong>
        / {{ skins.length.toLocaleString('fr-FR') }} skins
      </span>
    </div>

    <!-- ── ERROR ─────────────────────────────────────────────── -->
    <div v-if="error" class="catalog-error">
      <i class="mdi mdi-alert-circle-outline" />
      {{ error }}
    </div>

    <!-- ── SKELETON ──────────────────────────────────────────── -->
    <div v-else-if="loading" class="skin-grid">
      <div v-for="i in 24" :key="i" class="skin-card-skeleton">
        <div class="skeleton-image" />
        <div class="skeleton-line" style="width: 70%; height: 0.8rem; margin: 0.6rem auto;" />
      </div>
    </div>

    <!-- ── GRID ──────────────────────────────────────────────── -->
    <div v-else class="skin-grid">
      <ValorantSkinCard
        v-for="skin in displayedSkins"
        :key="skin.id"
        :skin="skin"
        @preview="(url, name) => openImagePreview(url, name)"
      />
    </div>

    <!-- ── SENTINEL (Intersection Observer) ──────────────────── -->
    <div ref="sentinel" class="sentinel">
      <div v-if="hasMore" class="loading-more">
        <div class="spinner" />
        Chargement des skins suivants...
      </div>
    </div>

    <!-- ── EMPTY ─────────────────────────────────────────────── -->
    <div v-if="!loading && !error && filteredSkins.length === 0" class="catalog-empty">
      <i class="mdi mdi-magnify-close" />
      Aucun skin ne correspond à vos critères.
    </div>

    <!-- ── BACK TO TOP ────────────────────────────────────────── -->
    <Transition name="fade">
      <button
        v-if="showBackToTop"
        class="back-to-top"
        title="Retour en haut"
        @click="scrollToTop"
      >
        <i class="mdi mdi-chevron-up" />
      </button>
    </Transition>

  </div>
</template>

<style lang="scss" scoped>
.catalog-wrapper {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Toolbar ────────────────────────────────────────────────────────────── */
.catalog-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search-input {
  margin: 0;
  height: 2rem;
  font-size: 0.75rem;
  width: 200px;
}

.toolbar-select {
  margin: 0;
  height: 2rem;
  padding: 0 2rem 0 0.5rem;
  font-size: 0.75rem;
  width: auto;

  &.sort-select { min-width: 80px; }
}

.sort-dir-btn {
  margin: 0;
  height: 2rem;
  width: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--pico-form-element-background-color);
  border: 1px solid var(--pico-form-element-border-color);
  color: var(--pico-form-element-color);
  cursor: pointer;
  border-radius: var(--pico-border-radius);
  flex-shrink: 0;

  &:hover {
    border-color: var(--pico-primary);
    color: var(--pico-primary);
    background: var(--pico-form-element-background-color);
  }

  i { font-size: 1rem; }
}

.catalog-count {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--pico-muted-color);
  white-space: nowrap;
  margin-left: auto;

  strong {
    color: var(--pico-primary);
    font-weight: 700;
  }
}

.count-sep {
  display: inline-block;
  width: 1px;
  height: 1rem;
  background: var(--pico-muted-border-color);
  margin-right: 0.15rem;
}

/* ── States ─────────────────────────────────────────────────────────────── */
.catalog-error, .catalog-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 5rem 2rem;
  color: var(--pico-muted-color);
  font-size: 1rem;

  i { font-size: 3rem; opacity: 0.5; }
}

.catalog-error { color: var(--pico-del-color); }

/* ── Grid ───────────────────────────────────────────────────────────────── */
.skin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.skin-card-skeleton {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: 10px;
  overflow: hidden;
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
  aspect-ratio: 1 / 1;
}

.skeleton-line {
  @extend %shimmer;
  display: block;
  border-radius: 6px;
}

/* ── Sentinel & Infinite Scroll ─────────────────────────────────────────── */
.sentinel {
  min-height: 100px;
  margin-top: 2rem;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--pico-muted-color);
  font-size: 0.9rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--pico-muted-border-color);
  border-top-color: var(--pico-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Back to Top ───────────────────────────────────────────────────────── */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    background: var(--pico-primary-hover);
    transform: scale(1.1);
  }

  i { font-size: 1.5rem; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }

</style>
