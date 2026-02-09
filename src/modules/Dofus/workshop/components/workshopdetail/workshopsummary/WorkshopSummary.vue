<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkshopSummary } from '@/modules/Dofus/workshop/composables/useWorkshopSummary'
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'
import { useDofusConfigStore } from '@/modules/Dofus/preferences/preferences.store'
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import { getItemPriceByMode } from '@/modules/Dofus/item/utils/itemPriceSelector'
import { AssetResolution } from '@/modules/Dofus/item/types/assetResolution.enum'
import { getItemImageByResolution } from '@/modules/Dofus/item/utils/itemImageSelector'
import WorkshopStats from './WorkshopStats.vue'
import WorkshopPrices from './WorkshopPrices.vue'
import WorkshopFilters from './WorkshopFilters.vue'
import WorkshopResourcesList from './WorkshopResourcesList.vue'
import { storeToRefs } from 'pinia'

const { summary } = useWorkshopSummary()
const { get: getPrice } = useItemPrices()
const dofusConfigStore = useDofusConfigStore()
const workshopDetailStore = useWorkshopDetailStore()
/* ========================= FILTERS ========================= */
const showCompleted = ref(false)
const condensed = storeToRefs(workshopDetailStore).condensed
const sortMode = ref<'quantity' | 'name'>('quantity')

/* ========================= COMPUTED DATA ========================= */
const stats = computed(() => ({
  items: summary.value.totalItems,
  totalRes: summary.value.totalResources,
  missing: summary.value.totalMissing,
  complete: summary.value.totalComplete
}))

const prices = computed(() => ({
  buyItems: summary.value.buyItemsCost,
  buyItemsRemaining: summary.value.buyItemsRemaining, // NOUVEAU
  // buy: summary.value.totalCost, ← SUPPRIMÉ (deprecated)
  craft: summary.value.craftCost,
  craftAdjusted: summary.value.craftAdjusted,
  mixedCost: summary.value.mixedCost,
  mixedAdjusted: summary.value.mixedAdjusted
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
          :buy-items="prices.buyItems"
          :buy-items-remaining="prices.buyItemsRemaining"
          :craft="prices.craft"
          :craft-adjusted="prices.craftAdjusted"
          :mixed="prices.mixedCost"
          :mixed-adjusted="prices.mixedAdjusted"
        />

        <WorkshopFilters
          v-model:show-completed="showCompleted"
          v-model:condensed="condensed"
          :active-sort-mode="sortMode"
          @sort-by-quantity="sortByQuantity"
          @sort-by-name="sortByName"
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