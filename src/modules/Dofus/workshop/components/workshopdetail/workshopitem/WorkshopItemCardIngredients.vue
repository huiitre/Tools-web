<script setup lang="ts">
import { useClipboard } from '@/composables/useClipboard'
import ItemContextTrigger from '@/modules/Dofus/item/components/ItemContextTrigger.vue'
import { AssetResolution } from '@/modules/Dofus/item/types/assetResolution.enum'
import { getItemImageByResolution } from '@/modules/Dofus/item/utils/itemImageSelector'
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import type { WorkshopItem, WorkshopItemIngredient } from '@/modules/Dofus/workshop/types/workshop.types'
import { normalizePositiveIntegerInput } from '@/utils/formatNumber'
import { storeToRefs } from 'pinia'

type CraftCard = {
  type: 'main' | 'craft'
  workshopItem: WorkshopItem
  subIngredients?: WorkshopItemIngredient[]
}

const props = defineProps<{
  card: CraftCard
}>()

const { isOwner } = storeToRefs(useWorkshopDetailStore())

const { copy } = useClipboard();

function getIngredientsByParent(
  ingredients: WorkshopItemIngredient[],
  parentId: number | null | undefined
) {
  return ingredients.filter(ing => ing.parentIngredientId === parentId)
}

const onInput = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const value = normalizePositiveIntegerInput(input.value)
  input.value = String(value)
}

</script>

<template>
  <section class="item-ingredients">
    <div
      v-for="ingredient in props.card.type === 'main'
        ? getIngredientsByParent(props.card.workshopItem.ingredients, null)
        : props.card.subIngredients"
      :key="ingredient.id"
      :class="['ingredient-row', { complete: ingredient.quantityObtained >= ingredient.quantityRequired }]"
    >
      <!-- <img
        :src="getItemImageByResolution(ingredient.item.images, AssetResolution.X2)?.url"
        :alt="ingredient.item.name"
        class="ing-icon"
      /> -->
      <ItemContextTrigger :item="ingredient.item">
        <img
          :src="getItemImageByResolution(ingredient.item.images, AssetResolution.X2)?.url"
          :alt="ingredient.item.name"
          class="ing-icon"
        />
      </ItemContextTrigger>
      <span class="ing-name copyable" @click="copy(ingredient.item.name)">{{ ingredient.item.name }}</span>

      <div class="ing-controls">
        <button class="ing-btn min" v-if="isOwner">min</button>
        <button class="ing-btn max" v-if="isOwner">max</button>
        <button class="ing-btn decrement" v-if="isOwner">−</button>
        <input
          type="number"
          :value="ingredient.quantityObtained"
          class="ing-input"
          @input="onInput"
          :disabled="!isOwner"
        />
        <button class="ing-btn increment" v-if="isOwner">+</button>
        <span class="ing-max">/ {{ ingredient.quantityRequired }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.item-ingredients {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  .ingredient-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.4rem;
    align-items: center;
    padding: 0.25rem;
    border-radius: var(--pico-border-radius);
    transition: background 0.15s;

    &.complete {
      opacity: 0.5;
    }

    &:hover {
      background: var(--pico-card-sectioning-background-color);
    }

    .ing-icon {
      width: 20px;
      height: 20px;
      object-fit: contain;
      cursor: pointer;
    }

    .ing-name {
      font-size: 0.7rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ing-controls {
      display: flex;
      align-items: center;
      gap: 0.15rem;

      .ing-btn {
        padding: 0.05rem 0.2rem;
        font-size: 0.6rem;
        line-height: 1.2;
        background: var(--pico-form-element-background-color);
        border: 1px solid var(--pico-form-element-border-color);
        color: var(--pico-form-element-color);
        border-radius: var(--pico-border-radius);
        cursor: pointer;
        transition: all 0.15s;
        margin: 0 !important;
        height: auto;

        &.decrement,
        &.increment {
          font-size: 0.9rem;
        }

        &:hover {
          background: var(--pico-primary-background);
          border-color: var(--pico-primary-border);
          color: var(--pico-primary-inverse);
        }
      }

      .ing-input {
        width: 2.8rem;
        padding: 0.1rem 0.2rem;
        text-align: center;
        font-size: 0.65rem;
        margin: 0 !important;
        height: auto;
      }

      .ing-max {
        font-size: 0.6rem;
        color: var(--pico-muted-color);
        margin: 0 0 0 0.1rem;
      }
    }
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
}
</style>
