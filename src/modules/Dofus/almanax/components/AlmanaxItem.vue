<script setup lang="ts">
import type { Item } from '@/modules/Dofus/item/types/item.types'
import { computed } from 'vue'
import { getItemImageByResolution } from '@/modules/Dofus/item/utils/itemImageSelector'
import { AssetResolution } from '@/modules/Dofus/item/types/assetResolution.enum'
import { useDofusConfigStore } from '@/modules/Dofus/preferences/preferences.store'
import { getItemPriceByMode } from '@/modules/Dofus/item/utils/itemPriceSelector'

const dofusConfig = useDofusConfigStore()

const props = defineProps<{
  item: Item,
  quantity: number
}>()

const itemImageX1 = computed(() =>
  getItemImageByResolution(props.item.images, AssetResolution.X1)
)

const price = computed(() => {
  return getItemPriceByMode(props.item.prices, dofusConfig.priceDisplayMode)
})

const totalPrice = computed(() => price.value * props.quantity)
</script>

<template>
  <div class="almanax-item-wrapper">
    <!-- Bloc haut : image + nom -->
    <div class="almanax-item-top">
      <div class="almanax-picture">
        <img
          v-if="itemImageX1"
          :src="itemImageX1.url"
          :alt="item.name"
        />
      </div>

      <div class="almanax-item-header">
        <span class="almanax-item-name">
          {{ item.name }}
          <span class="almanax-item-quantity">
            × {{ quantity }}
          </span>
        </span>
      </div>
    </div>

    <!-- Bloc bas : prix -->
    <div class="almanax-item-bottom">
      <div class="almanax-item-total">
        💰
        <span class="price-value">
          {{ totalPrice }} ₭ 
          <span v-if="price > 0">
            ({{ price }} ₭ / u)
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.almanax-item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.almanax-item-top {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.almanax-picture img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.almanax-item-header {
  display: flex;
  align-items: baseline;
}

.almanax-item-name {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--pico-color);
}

.almanax-item-quantity {
  font-size: 0.90rem;
  color: var(--pico-muted-color);
  margin-left: 0.15rem;
}

.almanax-item-bottom {
  display: flex;
  align-items: center;
}

.almanax-item-total {
  display: flex;
  align-items: center;
  gap: 0.3rem;

  font-size: 0.8rem;
  font-weight: 600;

  color: var(--pico-color);
  cursor: default;

  transition: color 0.15s ease;
}

.almanax-item-total:hover {
  color: var(--pico-primary);
}

.price-value {
  line-height: 1;
}
</style>
