<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkshopSummary } from '@/modules/Dofus/workshop/composables/useWorkshopSummary'
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'
import { useDofusConfigStore } from '@/modules/Dofus/preferences/preferences.store'
import { getItemPriceByMode } from '@/modules/Dofus/item/utils/itemPriceSelector'
import { AssetResolution } from '@/modules/Dofus/item/types/assetResolution.enum'
import { getItemImageByResolution } from '@/modules/Dofus/item/utils/itemImageSelector'
import WorkshopStats from './WorkshopStats.vue'
import WorkshopPrices from './WorkshopPrices.vue'
import WorkshopFilters from './WorkshopFilters.vue'
import WorkshopResourcesList from './WorkshopResourcesList.vue'

const { summary } = useWorkshopSummary()
const { get: getPrice } = useItemPrices()
const dofusConfigStore = useDofusConfigStore()

/* ========================= FILTERS ========================= */
const showCompleted = ref(false)
const condensed = ref(true)
const searchQuery = ref('')
const sortMode = ref<'quantity' | 'name'>('quantity') // Par défaut trié par quantité

/* ========================= COMPUTED DATA ========================= */
const stats = computed(() => ({
  items: summary.value.totalItems,
  totalRes: summary.value.totalResources,
  missing: summary.value.totalMissing,
  complete: summary.value.totalComplete
}))

const prices = computed(() => ({
  buy: summary.value.totalCost,
  craft: summary.value.craftCost,
  best: summary.value.bestPrice,
  buyAdjusted: summary.value.adjustedCost,
  craftAdjusted: summary.value.adjustedCost,
  bestAdjusted: summary.value.adjustedCost
}))

const zones = computed(() => {
  let processedZones = summary.value.zones.map(zone => ({
    name: zone.name,
    percent: zone.percent,
    resources: zone.resources.map(resource => {
      const itemPrice = getPrice(resource.item.id)
      const unitPrice = itemPrice ? getItemPriceByMode(itemPrice, dofusConfigStore.priceDisplayMode) : 0
      const img = getItemImageByResolution(resource.item.images ?? [], AssetResolution.X2)

      return {
        id: resource.item.id,
        name: resource.item.name,
        icon: img?.url ?? '',
        item: resource.item,
        price: unitPrice,
        qty: resource.quantityObtained,
        max: resource.quantityRequired
      }
    })
  }))

  // Appliquer le tri
  processedZones = processedZones.map(zone => ({
    ...zone,
    resources: [...zone.resources].sort((a, b) => {
      if (sortMode.value === 'quantity') {
        return a.max - b.max
      } else {
        return a.name.localeCompare(b.name)
      }
    })
  }))

  return processedZones
})

/* ========================= HANDLERS ========================= */
function updateResourceQty(itemId: number, value: number) {
  // TODO: Mutation API
  console.log('Update resource qty', { itemId, value })
}

function sortByQuantity() {
  sortMode.value = 'quantity'
}

function sortByName() {
  sortMode.value = 'name'
}

function handleItemSelect(item: any) {
  // TODO: Ajouter item au workshop
  console.log('Item selected:', item)
}
</script>

<template>
  <aside class="workshop-summary">
    <div class="top-row">
      <WorkshopStats
        :items="stats.items"
        :total-res="stats.totalRes"
        :missing="stats.missing"
        :complete="stats.complete"
      />

      <div class="right-side">
        <WorkshopPrices
          :buy="prices.buy"
          :craft="prices.craft"
          :best="prices.best"
          :buy-adjusted="prices.buyAdjusted"
          :craft-adjusted="prices.craftAdjusted"
          :best-adjusted="prices.bestAdjusted"
        />

        <WorkshopFilters
          v-model:show-completed="showCompleted"
          v-model:condensed="condensed"
          v-model:search-query="searchQuery"
          :active-sort-mode="sortMode"
          @sort-by-quantity="sortByQuantity"
          @sort-by-name="sortByName"
          @item-selected="handleItemSelect"
        />
      </div>
    </div>

    <WorkshopResourcesList
      :zones="zones"
      :show-completed="showCompleted"
      :condensed="condensed"
      @update:resource-qty="updateResourceQty"
    />
  </aside>
</template>

<style scoped>
.workshop-summary {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-size: 0.8rem;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.right-side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>