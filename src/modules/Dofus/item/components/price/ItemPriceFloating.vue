<script setup lang="ts">
import type { ItemPrice } from '@/modules/Dofus/item/types/item.types'
import { formatNumber } from '@/utils/formatNumber'
import { PriceDisplayMode } from '@/modules/Dofus/preferences/types/priceDisplayMode.enum'

defineProps<{
  price: ItemPrice
  visible: boolean
  x: number
  y: number
  priceDisplayMode: PriceDisplayMode
}>()
</script>

<template>
  <div
    v-if="visible"
    class="item-price-floating"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
  >
    <div
      class="price-line"
      :class="{ primary: priceDisplayMode === PriceDisplayMode.USER }"
    >
      <span class="label">
        <span class="icon">👤</span>
        Mon prix
      </span>
      <strong class="value">
        {{ formatNumber(price.userPrice) }} ₭
      </strong>
    </div>

    <div
      class="price-line"
      :class="{ primary: priceDisplayMode === PriceDisplayMode.COMMUNITY }"
    >
      <span class="label">
        <span class="icon">🌍</span>
        Prix moyen communautaire
      </span>
      <strong class="value">
        {{ formatNumber(price.communityAveragePrice) }} ₭
      </strong>
    </div>

    <div
      class="price-line"
      :class="{ primary: priceDisplayMode === PriceDisplayMode.LAST }"
    >
      <span class="label">
        <span class="icon">🕒</span>
        Dernier prix enregistré
      </span>
      <strong class="value">
        {{ formatNumber(price.lastUpdatedPrice) }} ₭
      </strong>
    </div>
  </div>
</template>

<style scoped>
.item-price-floating {
  position: fixed;
  z-index: 1000;
  pointer-events: none;

  min-width: 240px;

  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  box-shadow: var(--pico-card-box-shadow);
  border-radius: 8px;

  padding: 0.6rem 0.75rem;
  font-size: 0.8rem;
  color: var(--pico-color);
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 0.75rem;
  padding: 0.25rem 0;
}

.price-line + .price-line {
  border-top: 1px dashed var(--pico-muted-border-color);
}

.label {
  display: flex;
  align-items: center;
  gap: 0.35rem;

  color: var(--pico-muted-color);
  white-space: nowrap;
}

.icon {
  font-size: 0.85rem;
  opacity: 0.8;
}

.value {
  font-weight: 600;
  white-space: nowrap;
}

.price-line.primary .label,
.price-line.primary .value {
  color: var(--pico-primary);
}
</style>
