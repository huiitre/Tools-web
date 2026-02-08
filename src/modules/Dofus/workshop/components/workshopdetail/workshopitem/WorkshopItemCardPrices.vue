<script setup lang="ts">
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'
import { useDofusConfigStore } from '@/modules/Dofus/preferences/preferences.store'
import { getItemPriceByMode } from '@/modules/Dofus/item/utils/itemPriceSelector'
import type { WorkshopItem, WorkshopItemIngredient } from '@/modules/Dofus/workshop/types/workshop.types'
import { formatNumber, normalizePositiveIntegerInput } from '@/utils/formatNumber'
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import { storeToRefs } from 'pinia'

type CraftCard = {
  type: 'main' | 'craft'
  workshopItem: WorkshopItem
  craftedIngredient?: WorkshopItemIngredient
}

const props = defineProps<{
  card: CraftCard
}>()

const { get: getPrice } = useItemPrices()
const config = useDofusConfigStore()
const workshopDetailStore = useWorkshopDetailStore()
const { isOwner } = storeToRefs(workshopDetailStore)

function getUnitPrice(itemId: number): number {
  const p = getPrice(itemId)
  return p ? getItemPriceByMode(p, config.priceDisplayMode) : 0
}

function getFormattedUnitPrice(itemId: number): string {
  return formatNumber(getUnitPrice(itemId))
}

function getCraftPrice(itemId: number): number {
  const p = getPrice(itemId)
  if (!p) return 0

  return config.priceDisplayMode === 'USER'
    ? p.craftUserPrice
    : config.priceDisplayMode === 'COMMUNITY'
      ? p.craftCommunityPrice
      : p.craftLastPrice
}

const onInput = (event: Event) => {
  const input = event.target as HTMLInputElement

  const raw = input.value

  const normalized = normalizePositiveIntegerInput(raw)

  const formatted = formatNumber(normalized)

  input.value = formatted
}

</script>

<template>
  <section class="item-prices">

    <!-- LIGNE 1 -->
    <div class="row row-unit">
      <div class="cell">
        <span class="price-label">Prix unitaire</span>
        <input
          type="text"
          inputmode="numeric"
          :value="getFormattedUnitPrice(
            props.card.type === 'main'
              ? props.card.workshopItem.item.id
              : props.card.craftedIngredient!.item.id
          )"
          class="price-input"
          @input="onInput"
          :disabled="!isOwner"
        />
      </div>

      <div class="cell value">
        <span class="price-label">Prix unitaire multiplié</span>
        <strong class="price-value">
          {{
            props.card.type === 'main'
              ? (getUnitPrice(props.card.workshopItem.item.id) * props.card.workshopItem.quantity).toLocaleString()
              : (getUnitPrice(props.card.craftedIngredient!.item.id) * props.card.craftedIngredient!.quantityRequired).toLocaleString()
          }} ₭
        </strong>
      </div>
    </div>

    <!-- LIGNE 2 -->
    <div class="row row-craft">
      <div class="cell value">
        <span class="price-label">Prix craft</span>
        <strong class="price-value">
          {{
            getCraftPrice(
              props.card.type === 'main'
                ? props.card.workshopItem.item.id
                : props.card.craftedIngredient!.item.id
            ).toLocaleString()
          }} ₭
        </strong>
      </div>

      <div class="cell value">
        <span class="price-label">Prix craft multiplié</span>
        <strong class="price-value">
          {{
            props.card.type === 'main'
              ? (getCraftPrice(props.card.workshopItem.item.id) * props.card.workshopItem.quantity).toLocaleString()
              : (getCraftPrice(props.card.craftedIngredient!.item.id) * props.card.craftedIngredient!.quantityRequired).toLocaleString()
          }} ₭
        </strong>
      </div>

      <div class="cell value highlight">
        <span class="price-label">Prix total craft</span>
        <strong class="price-value">
          {{
            props.card.type === 'main'
              ? (getCraftPrice(props.card.workshopItem.item.id) * props.card.workshopItem.quantity).toLocaleString()
              : (getCraftPrice(props.card.craftedIngredient!.item.id) * props.card.craftedIngredient!.quantityRequired).toLocaleString()
          }} ₭
        </strong>
      </div>
    </div>

  </section>
</template>

<style scoped>
.item-prices {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.5rem;
  background: var(--pico-card-sectioning-background-color);
  border-radius: var(--pico-border-radius);
  font-size: 0.75rem;

  .row {
    display: grid;
    gap: 0.5rem;

    &.row-unit {
      grid-template-columns: 1fr 1fr;
    }

    &.row-craft {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .cell {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    align-items: center;

    &.value {
      /* justify-content: flex-end; */
    }

    &.highlight {
      .price-value {
        color: var(--pico-primary);
      }
    }
  }

  .price-label {
    font-size: 0.65rem;
    color: var(--pico-muted-color);
    text-align: center;
  }

  .price-value {
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
  }

  .price-input {
    width: 50%;
    padding: 0.15rem 0.3rem;
    font-size: 0.7rem;
    margin: 0 !important;
    height: auto;
    text-align: right;
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
}
</style>
