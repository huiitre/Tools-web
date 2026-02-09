<script setup lang="ts">
import { useClipboard } from '@/composables/useClipboard'
import { useImagePreview } from '@/composables/useImagePreview'
import ItemContextTrigger from '@/modules/Dofus/item/components/ItemContextTrigger.vue'
import { Item } from '@/modules/Dofus/item/types/item.types'
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import type { WorkshopItemIngredient } from '@/modules/Dofus/workshop/types/workshop.types'
import { normalizePositiveIntegerInput } from '@/utils/formatNumber'
import { storeToRefs } from 'pinia'

interface Resource {
  id: number
  name: string
  icon: string
  item: Item
  price: number
  qty: number
  max: number
}

type Props = {
  resource: Resource
  condensed: boolean
}

const props = defineProps<Props>()

const { copy } = useClipboard()
const { open: openImagePreview } = useImagePreview()

const workshopDetailStore = useWorkshopDetailStore()
const { isOwner } = storeToRefs(workshopDetailStore)

function findAllIngredients(itemId: number): WorkshopItemIngredient[] {
  const ingredients: WorkshopItemIngredient[] = []
  for (const item of workshopDetailStore.items) {
    for (const ing of item.ingredients) {
      if (ing.item.id === itemId) {
        ingredients.push(ing)
      }
    }
  }
  return ingredients
}

async function setMin() {
  const ingredients = findAllIngredients(props.resource.item.id)
  const toUpdate = ingredients
    .filter(ing => ing.quantityObtained > 0)
    .map(ing => ({ id: ing.id, quantity: 0 }))
  
  if (toUpdate.length > 0) {
    await workshopDetailStore.setIngredientsQuantityObtained(toUpdate)
  }
}

async function setMax() {
  const ingredients = findAllIngredients(props.resource.item.id)
  const toUpdate = ingredients
    .filter(ing => ing.quantityObtained < ing.quantityRequired)
    .map(ing => ({ id: ing.id, quantity: ing.quantityRequired }))
  
  if (toUpdate.length > 0) {
    await workshopDetailStore.setIngredientsQuantityObtained(toUpdate)
  }
}

async function decrement() {
  const ingredients = findAllIngredients(props.resource.item.id)
  const toDecrement = ingredients.find(ing => ing.quantityObtained > 0)
  
  if (toDecrement) {
    await workshopDetailStore.setIngredientsQuantityObtained([
      { id: toDecrement.id, quantity: toDecrement.quantityObtained - 1 }
    ])
  }
}

async function increment() {
  const ingredients = findAllIngredients(props.resource.item.id)
  const toIncrement = ingredients.find(ing => ing.quantityObtained < ing.quantityRequired)
  
  if (toIncrement) {
    await workshopDetailStore.setIngredientsQuantityObtained([
      { id: toIncrement.id, quantity: toIncrement.quantityObtained + 1 }
    ])
  }
}

async function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const value = normalizePositiveIntegerInput(input.value)
  input.value = String(value)

  const targetQty = Number(value)
  const ingredients = findAllIngredients(props.resource.item.id)
  
  let remaining = targetQty
  const toUpdate: { id: number; quantity: number }[] = []
  
  for (const ing of ingredients) {
    const maxForThis = ing.quantityRequired
    const assignedQty = Math.min(remaining, maxForThis)
    
    if (assignedQty !== ing.quantityObtained) {
      toUpdate.push({ id: ing.id, quantity: assignedQty })
    }
    
    remaining -= assignedQty
    if (remaining <= 0) break
  }
  
  if (toUpdate.length > 0) {
    await workshopDetailStore.setIngredientsQuantityObtained(toUpdate)
  }
}

</script>

<template>
  <div
    class="resource"
    :class="{ complete: resource.qty === resource.max }"
  >
    <ItemContextTrigger :item="resource.item">
      <img :src="resource.icon" :alt="resource.name" @click="openImagePreview(resource.icon, resource.name)">
    </ItemContextTrigger>

    <div class="resource-info">
      <div class="name copyable" @click="copy(resource.name)">{{ resource.name }}</div>
      <div class="price-details" v-if="!condensed">
        <span>Prix unitaire : {{ resource.price.toLocaleString() }} ₭</span>
        <span>Prix total : {{ (resource.price * resource.max).toLocaleString() }} ₭</span>
        <span>Restant : <span class="colored">{{ (resource.price * (resource.max - resource.qty)).toLocaleString() }} ₭</span></span>
      </div>
    </div>

    <div class="controls">
      <button class="min" @click="setMin" v-if="isOwner">min</button>
      <button class="max" @click="setMax" v-if="isOwner">max</button>
      <button class="decrement" @click="decrement" v-if="isOwner">−</button>
      <input
        type="number"
        :value="resource.qty"
        @input="onInput"
        min="0"
        :max="resource.max"
        :disabled="!isOwner"
      >
      <button class="increment" @click="increment" v-if="isOwner">+</button>
      <span class="max">/ {{ resource.max }}</span>
    </div>
  </div>
</template>

<style scoped>
.resource {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.3rem;
  border-radius: var(--pico-border-radius);
  transition: background 0.15s;

  &:hover {
    background: var(--pico-card-sectioning-background-color);
  }

  &.complete {
    opacity: 0.5;
  }

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    cursor: pointer;
  }
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;

  .name {
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.price-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.7rem;
  color: var(--pico-muted-color);
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.2rem;

  button {
    padding: 0.05rem 0.25rem;
    font-size: 0.65rem;
    line-height: 1.2;
    background: var(--pico-form-element-background-color);
    border: 1px solid var(--pico-form-element-border-color);
    color: var(--pico-form-element-color);
    border-radius: var(--pico-border-radius);
    cursor: pointer;
    transition: all 0.15s;
    margin: 0;
    height: auto;

    &:hover {
      background: var(--pico-primary-background);
      border-color: var(--pico-primary-border);
      color: var(--pico-primary-inverse);
    }
  }

  input {
    width: 2.8rem;
    padding: 0.1rem 0.2rem;
    text-align: center;
    font-size: 0.7rem;
    margin: 0;
    height: auto;
  }

  .decrement,
  .increment {
    font-size: 0.98rem;
  }
}

input[type='number'] {
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;
}

.colored {
  color: var(--pico-primary);
}
</style>