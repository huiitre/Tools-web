<script setup lang="ts">
import { AssetResolution } from '@/modules/Dofus/item/types/assetResolution.enum'
import { getItemImageByResolution } from '@/modules/Dofus/item/utils/itemImageSelector'
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import type { WorkshopItem, WorkshopItemIngredient } from '@/modules/Dofus/workshop/types/workshop.types'
import { normalizePositiveIntegerInput } from '@/utils/formatNumber'
import { storeToRefs } from 'pinia'

type CraftCard = {
  type: 'main' | 'craft'
  workshopItem: WorkshopItem
  craftedIngredient?: WorkshopItemIngredient
}

const props = defineProps<{
  card: CraftCard
}>()

const store = useWorkshopDetailStore()
const { isOwner } = storeToRefs(store)

const onQtyInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = normalizePositiveIntegerInput(input.value)
  input.value = String(value)
}

</script>

<template>
  <header class="item-header">
    <img
      class="item-icon"
      :src="getItemImageByResolution(
        props.card.type === 'main'
          ? props.card.workshopItem.item.images
          : props.card.craftedIngredient!.item.images,
        AssetResolution.X2
      )?.url"
      :alt="props.card.type === 'main'
        ? props.card.workshopItem.item.name
        : props.card.craftedIngredient!.item.name"
    />

    <div class="item-title">
      <strong>
        {{ props.card.type === 'main'
          ? props.card.workshopItem.item.name
          : props.card.craftedIngredient!.item.name }}
      </strong>
      <small>
        {{ props.card.type === 'main'
          ? props.card.workshopItem.item.type.name
          : props.card.craftedIngredient!.item.type.name }}
        · Niv {{ props.card.type === 'main'
          ? props.card.workshopItem.item.level
          : props.card.craftedIngredient!.item.level }}
      </small>
    </div>

    <div v-if="props.card.type === 'main'" class="item-qty-controls">
      <button class="qty-btn" v-if="isOwner">−</button>
      <input
        type="text"
        inputmode="numeric"
        :value="props.card.workshopItem.quantity"
        class="qty-input"
        @input="onQtyInput"
        :disabled="!isOwner"
      />
      <button class="qty-btn" v-if="isOwner">+</button>
    </div>

    <div v-else class="item-qty-static">
      × {{ props.card.craftedIngredient!.quantityRequired }}
    </div>
  </header>
</template>

<style scoped>
.item-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;

  .item-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }

  .item-title {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    line-height: 1.2;
    min-width: 0;

    strong {
      font-size: 0.85rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      font-size: 0.7rem;
      color: var(--pico-muted-color);
    }
  }

  .item-qty-controls {
    display: flex;
    align-items: center;
    gap: 0.2rem;

    .qty-btn {
      padding: 0.15rem 0.3rem;
      font-size: 1.1rem;
      background: var(--pico-form-element-background-color);
      border: 1px solid var(--pico-form-element-border-color);
      color: var(--pico-form-element-color);
      border-radius: var(--pico-border-radius);
      cursor: pointer;
      margin: 0 !important;
      line-height: 1;
      transition: all 0.15s;

      &:hover {
        background: var(--pico-primary-background);
        border-color: var(--pico-primary-border);
        color: var(--pico-primary-inverse);
      }
    }

    .qty-input {
      width: 3.5rem;
      padding: 0.15rem 0.3rem;
      text-align: center;
      font-size: 0.75rem;
      margin: 0 !important;
      height: auto;

      /* Chrome / Edge / Safari */
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      &[type='number'] {
        -moz-appearance: textfield;
      }
    }
  }

  .item-qty-static {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--pico-muted-color);
  }
}
</style>
