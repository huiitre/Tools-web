<script setup lang="ts">
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import { normalizePositiveIntegerInput } from '@/utils/formatNumber'
import { storeToRefs } from 'pinia'

interface Resource {
  id: number
  name: string
  icon: string
  price: number
  qty: number
  max: number
}

interface Props {
  resource: Resource
  condensed: boolean
}

interface Emits {
  (e: 'update:qty', value: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const workshopDetailStore = useWorkshopDetailStore()
const { isOwner } = storeToRefs(workshopDetailStore)

function setMin(res: Resource) {
  emit('update:qty', 0)
}

function setMax(res: Resource) {
  emit('update:qty', res.max)
}

function decrement(res: Resource) {
  if (res.qty > 0) {
    emit('update:qty', res.qty - 1)
  }
}

function increment(res: Resource) {
  if (res.qty < res.max) {
    emit('update:qty', res.qty + 1)
  }
}

const onInput = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const value = normalizePositiveIntegerInput(input.value)
  input.value = String(value)

  emit('update:qty', value)
}

</script>

<template>
  <div
    class="resource"
    :class="{ complete: resource.qty === resource.max }"
  >
    <img :src="resource.icon" :alt="resource.name">

    <div class="resource-info">
      <div class="name">{{ resource.name }}</div>
      <div class="price-details" v-if="!condensed">
        <span>Prix unitaire : {{ resource.price.toLocaleString() }} ₭</span>
        <span>Prix total : {{ (resource.price * resource.max).toLocaleString() }} ₭</span>
        <span>Restant : <span class="colored">{{ (resource.price * (resource.max - resource.qty)).toLocaleString() }} ₭</span></span>
      </div>
    </div>

    <div class="controls">
      <button class="min" @click="setMin(resource)" v-if="isOwner">min</button>
      <button class="max" @click="setMax(resource)" v-if="isOwner">max</button>
      <button class="decrement" @click="decrement(resource)" v-if="isOwner">−</button>
      <input
        type="number"
        :value="resource.qty"
        @input="onInput"
        min="0"
        :max="resource.max"
        :disabled="!isOwner"
      >
      <button class="increment" @click="increment(resource)" v-if="isOwner">+</button>
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