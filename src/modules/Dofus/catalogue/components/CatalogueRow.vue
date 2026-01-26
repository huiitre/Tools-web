<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import CatalogueHeader from './CatalogueHeader.vue'
import { useCatalogueStore } from '@/modules/Dofus/catalogue/catalogue.store'
import { useCatalogueGrid } from '@/modules/Dofus/catalogue/composables/useCatalogueGrid'
import type { CatalogueItem } from '@/modules/Dofus/catalogue/types/catalogue.types'
import { AssetResolution } from '@/modules/Dofus/item/types/assetResolution.enum'
import { getItemImageByResolution } from '@/modules/Dofus/item/utils/itemImageSelector'
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'
import { getItemPriceByMode } from '@/modules/Dofus/item/utils/itemPriceSelector'
import { useDofusConfigStore } from '@/modules/Dofus/preferences/preferences.store'
import { formatNumber } from '@/utils/formatNumber'
import { useClipboard } from '@/composables/useClipboard'
import { useImagePreview } from '@/composables/useImagePreview'

defineOptions({ name: 'CatalogueRow' })

const props = defineProps<{
  item: CatalogueItem
  depth: number
  maxDepth: number
  isOpen: (id: number) => boolean
  toggleItem: (id: number) => void
  getIngredients: (itemId: number) => CatalogueItem[]
}>()

/* ========================= STORES ========================= */
const catalogueStore = useCatalogueStore()
const { copy } = useClipboard()
const { open: openImagePreview } = useImagePreview()
/* ========================= COPY COLUMNS DEF ========================= */
const copyableKeys = ['id', 'asset_id', 'type', 'name', 'level', 'description']
const handleCellClick = (key: string) => {
  if (!copyableKeys.includes(key)) return
  const value = getCellValue(key)
  const col = visibleColumns.value.find(c => c.key === key)
  copy(value, col?.label)
}

/* ========================= GRID ========================= */
const { gridTemplateColumns, getIndentPx } = useCatalogueGrid()
const visibleColumns = computed(() => catalogueStore.visibleCatalogueColumns)

/* ========================= TREE ========================= */
const canExpand = computed(() => props.item.hasRecipe && props.depth < props.maxDepth - 1)
const shouldShowChildren = computed(() => canExpand.value && props.isOpen(props.item.id))
const children = computed(() => props.getIngredients(props.item.id))

/* ========================= IMAGE ========================= */
const imageUrl = computed(() => {
  const img = getItemImageByResolution(props.item.images ?? [], AssetResolution.X2)
  return img?.url ?? ''
})

/* ========================= PRICES ========================= */
const { get, load } = useItemPrices()
onMounted(() => load([props.item.id]))
const prices = computed(() => get(props.item.id))

/* ========================= CELL RENDERERS ========================= */
const getCellValue = (key: string): string | number => {

  const craftKeys = ['craft_user_price', 'craft_community_price', 'craft_last_price', 'craft_calculated_price']
  if (craftKeys.includes(key) && !props.item.hasRecipe) {
    return '—'
  }

  const renderers: Record<string, () => string | number> = {
    id: () => props.item.id,
    asset_id: () => props.item.assetId,
    type: () => props.item.type,
    name: () => props.item.name,
    description: () => props.item.description,
    level: () => props.item.level,
    user_price: () => formatNumber(prices.value?.userPrice ?? 0) + ' ₭',
    community_average_price: () => formatNumber(prices.value?.communityAveragePrice ?? 0) + ' ₭',
    last_updated_price: () => formatNumber(prices.value?.lastUpdatedPrice ?? 0) + ' ₭',
    craft_user_price: () => formatNumber(prices.value?.craftUserPrice ?? 0) + ' ₭',
    craft_community_price: () => formatNumber(prices.value?.craftCommunityPrice ?? 0) + ' ₭',
    craft_last_price: () => formatNumber(prices.value?.craftLastPrice ?? 0) + ' ₭',
    craft_calculated_price: () => formatNumber(prices.value?.craftCalculatedPrice ?? 0) + ' ₭',
  }
  return renderers[key]?.() ?? ''
}

const isRightAligned = (key: string) => key.includes('price') || key.startsWith('craft_')
</script>

<template>
  <!-- ROW -->
  <div
    class="catalogue-card"
    :style="{
      marginLeft: `${getIndentPx(depth)}px`,
      gridTemplateColumns,
    }"
  >
    <!-- CHEVRON -->
    <div class="cell chevron" @click="canExpand && toggleItem(item.id)">
      <i
        v-if="canExpand"
        class="mdi"
        :class="isOpen(item.id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
      />
    </div>

    <!-- IMAGE -->
    <div class="cell image" @click="imageUrl && openImagePreview(imageUrl, item.name)">
      <img v-if="imageUrl" :src="imageUrl" :alt="item.name" />
    </div>

    <!-- COLONNES DYNAMIQUES -->
    <div
      v-for="col in visibleColumns"
      :key="col.key"
      class="cell"
      :class="{
        right: isRightAligned(col.key),
        strong: col.key === 'craft_calculated_price',
        name: col.key === 'name',
        copyable: copyableKeys.includes(col.key)
      }"
      :title="String(getCellValue(col.key))"
      @click="handleCellClick(col.key)"
    >
      {{ getCellValue(col.key) }}
    </div>

    <!-- ACTIONS -->
    <div class="cell actions">
      <i class="mdi mdi-dots-horizontal" />
    </div>
  </div>

  <!-- CHILD HEADER -->
  <CatalogueHeader v-if="shouldShowChildren" :depth="depth + 1" />

  <!-- CHILD ROWS -->
  <template v-if="shouldShowChildren">
    <CatalogueRow
      v-for="child in children"
      :key="child.id"
      :item="child"
      :depth="depth + 1"
      :maxDepth="maxDepth"
      :isOpen="isOpen"
      :toggleItem="toggleItem"
      :getIngredients="getIngredients"
    />
  </template>
</template>

<style scoped lang="scss">
.catalogue-card {
  display: grid;
  align-items: center;
  column-gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: 0.45rem;
  overflow: hidden;
}

.catalogue-card:hover {
  box-shadow: inset 0 0 0 2px var(--pico-primary-border);
}

.cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.chevron {
  text-align: center;
  cursor: pointer;
}

.image img {
  width: 28px;
  height: 28px;
  cursor: pointer;
}

.name {
  font-weight: 600;
}

.right {
  text-align: right;
}

.strong {
  font-weight: 600;
}

.actions {
  text-align: center;
  cursor: pointer;
}

.copyable {
  cursor: pointer;

  &:hover {
    color: var(--pico-primary);
  }
}
</style>