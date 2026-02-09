<script setup lang="ts">
import WorkshopItemSearchDropdown from './WorkshopItemSearchDropdown.vue'

interface Props {
  showCompleted: boolean
  condensed: boolean
  activeSortMode: 'quantity' | 'name'
}

interface Emits {
  (e: 'update:showCompleted', value: boolean): void
  (e: 'update:condensed', value: boolean): void
  (e: 'sortByQuantity'): void
  (e: 'sortByName'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="options">
    <label>
      <input 
        type="checkbox" 
        :checked="showCompleted"
        @change="emit('update:showCompleted', ($event.target as HTMLInputElement).checked)"
      >
      Ressources complètes
    </label>
    <label>
      <input 
        type="checkbox" 
        :checked="condensed"
        @change="emit('update:condensed', ($event.target as HTMLInputElement).checked)"
      >
      Affichage condensé
    </label>

    <div class="sort-buttons">
      <button 
        type="button" 
        class="sort-btn" 
        :class="{ active: activeSortMode === 'quantity' }"
        @click="emit('sortByQuantity')"
        title="Trier par quantité"
      >
        <i class="fa-solid fa-arrow-down-1-9"></i>
      </button>
      <button 
        type="button" 
        class="sort-btn" 
        :class="{ active: activeSortMode === 'name' }"
        @click="emit('sortByName')"
        title="Trier par nom"
      >
        <i class="fa-solid fa-arrow-down-a-z"></i>
      </button>
    </div>

    <WorkshopItemSearchDropdown />
  </div>
</template>

<style scoped>
.options {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.options label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}

.options input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.sort-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-btn {
  padding: 0.2rem 0.35rem;
  font-size: 0.75rem;
  line-height: 1;
  background: var(--pico-form-element-background-color);
  border: 1px solid var(--pico-form-element-border-color);
  color: var(--pico-form-element-color);
  border-radius: var(--pico-border-radius);
  cursor: pointer;
  transition: all 0.15s;
  margin: 0;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-btn:hover:not(.active) {
  color: var(--pico-primary);
}

.sort-btn.active {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-border);
  color: var(--pico-primary-inverse);
}

.sort-btn i {
  font-size: 0.75rem;
}
</style>