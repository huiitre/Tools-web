<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { clientV3 } from '@/services/axiosInstance'
import { useImagePreview } from '@/composables/useImagePreview'
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

const skins = ref<ValorantSkin[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const { open: openImagePreview } = useImagePreview()

onMounted(async () => {
  try {
    const { data } = await clientV3.get<ValorantSkin[]>('/riot/valorant/skins')
    skins.value = data
  } catch {
    error.value = 'Impossible de charger les skins.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="catalog-wrapper">

    <!-- ── TOOLBAR ───────────────────────────────────────────── -->
    <div class="catalog-toolbar">
      <span class="catalog-count">
        <template v-if="loading">
          <div class="skeleton-line" style="width: 100px; height: 0.85rem;" />
        </template>
        <template v-else-if="!error">
          {{ skins.length.toLocaleString('fr-FR') }} skins
        </template>
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
        v-for="skin in skins"
        :key="skin.id"
        :skin="skin"
        @preview="(url, name) => openImagePreview(url, name)"
      />
    </div>

  </div>
</template>

<style lang="scss" scoped>
.catalog-wrapper {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.catalog-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  min-height: 2rem;
}

.catalog-count {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
  display: flex;
  align-items: center;
}

.catalog-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: var(--pico-del-color);
  font-size: 0.9rem;
}

.skin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
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
</style>
