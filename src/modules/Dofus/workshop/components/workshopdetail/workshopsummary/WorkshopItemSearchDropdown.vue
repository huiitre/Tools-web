<script setup lang="ts">
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Item {
  id: number
  name: string
  icon: string
  type: string
  level: number
}

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'select', item: Item): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const workshopDetailStore = useWorkshopDetailStore()
const { isOwner } = storeToRefs(workshopDetailStore)

const isOpen = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

// Données de test
const allItems: Item[] = [
  { id: 1, name: 'Plume Vibrante du Tofu Royal', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/17188-128.png', type: 'Ressource', level: 120 },
  { id: 2, name: 'Gelée Bleuet Royale', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/9201-128.png', type: 'Ressource', level: 60 },
  { id: 3, name: 'Gelée Menthe Royale', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/9202-128.png', type: 'Ressource', level: 60 },
  { id: 4, name: 'Peau de Rouquette', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/462-128.png', type: 'Ressource', level: 140 },
  { id: 5, name: 'Cloche de Bardéryl Clocheculvre', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/1785-128.png', type: 'Ressource diverse', level: 190 },
  { id: 6, name: 'Moustache du Shogun Tofugawa', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/9207-128.png', type: 'Poil', level: 160 },
  { id: 7, name: 'Anneau Royal Tofu', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/16349-128.png', type: 'Anneau', level: 120 },
  { id: 8, name: 'Cape du Tofu Royal', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/16350-128.png', type: 'Cape', level: 115 },
  { id: 9, name: 'Bottes du Tofu Royal', icon: 'https://assets.tools.huiitre.fr/tools_dofus/dofus3/img/item/2x/16351-128.png', type: 'Bottes', level: 110 }
]

const filteredItems = computed(() => {
  if (!props.modelValue || props.modelValue.length < 2) {
    return []
  }
  
  const query = props.modelValue.toLowerCase()
  return allItems.filter(item => 
    item.name.toLowerCase().includes(query)
  ).slice(0, 8) // Limite à 8 résultats
})

function updateSearch(value: string) {
  emit('update:modelValue', value)
  isOpen.value = value.length >= 2
}

function selectItem(item: Item) {
  emit('select', item)
  emit('update:modelValue', '')
  isOpen.value = false
  searchInput.value?.focus()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (
    dropdownRef.value && 
    !dropdownRef.value.contains(target) && 
    searchInput.value && 
    !searchInput.value.contains(target)
  ) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="search-wrapper">
    <input
      ref="searchInput"
      type="search"
      :value="modelValue"
      @input="updateSearch(($event.target as HTMLInputElement).value)"
      @focus="isOpen = modelValue.length >= 2 && filteredItems.length > 0"
      placeholder="Rechercher ou ajouter..."
      class="search-input"
      :disabled="!isOwner"
    >

    <div 
      v-if="isOpen && filteredItems.length > 0"
      ref="dropdownRef"
      class="search-dropdown"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="search-item"
        @click="selectItem(item)"
      >
        <img :src="item.icon" :alt="item.name" />
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">{{ item.type }} - Niv. {{ item.level }}</div>
        </div>
      </div>
    </div>

    <div 
      v-if="isOpen && modelValue.length >= 2 && filteredItems.length === 0"
      ref="dropdownRef"
      class="search-dropdown"
    >
      <div class="search-empty">Aucun résultat</div>
    </div>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  margin: 0;
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  height: auto;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-muted-border-color);
  border-radius: var(--pico-border-radius);
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.search-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: var(--pico-card-sectioning-background-color);
}

.search-item img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.item-name {
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  font-size: 0.7rem;
  color: var(--pico-muted-color);
}

.search-empty {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--pico-muted-color);
}

/* Scrollbar styling */
.search-dropdown::-webkit-scrollbar {
  width: 6px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: var(--pico-card-background-color);
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: var(--pico-muted-border-color);
  border-radius: var(--pico-border-radius);
}

.search-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--pico-muted-color);
}
</style>