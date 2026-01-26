<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useFloating, offset } from '@floating-ui/vue'
import { useCatalogueStore } from '@/modules/Dofus/catalogue/catalogue.store'
import CataloguePreferencesPanel from '@/modules/Dofus/catalogue/components/CataloguePreferencesPanel.vue'

const catalogueStore = useCatalogueStore()

/* ======================
   SEARCH
====================== */

const searchValue = ref(catalogueStore.q ?? '')

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    catalogueStore.setQuery(searchValue.value.trim() || null)
  }
}

/* ======================
   PAGINATION (STORE)
====================== */

const page = computed(() => catalogueStore.page)
const lastPage = computed(() => catalogueStore.lastPage)

const hasPrevious = computed(() => catalogueStore.previousPage !== null)
const hasNext = computed(() => catalogueStore.nextPage !== null)

const goFirst = () => {
  if (page.value !== 1) catalogueStore.setPage(1)
}

const goPrevious = () => {
  if (catalogueStore.previousPage !== null) {
    catalogueStore.setPage(catalogueStore.previousPage)
  }
}

const goNext = () => {
  if (catalogueStore.nextPage !== null) {
    catalogueStore.setPage(catalogueStore.nextPage)
  }
}

const goLast = () => {
  if (
    catalogueStore.lastPage !== null &&
    page.value !== catalogueStore.lastPage
  ) {
    catalogueStore.setPage(catalogueStore.lastPage)
  }
}

/* ======================
   FLOATING UI
====================== */

const isOpen = ref(false)
const reference = ref<HTMLElement | null>(null)
const floating = ref<HTMLElement | null>(null)

const { floatingStyles } = useFloating(reference, floating, {
  placement: 'right-start',
  middleware: [offset(6)],
})

const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (
    reference.value &&
    floating.value &&
    !reference.value.contains(target) &&
    !floating.value.contains(target)
  ) {
    isOpen.value = false
  }
}

const onScroll = () => {
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('scroll', onScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('scroll', onScroll, true)
})
</script>

<template>
  <div class="catalogue-toolbar">
    <!-- LEFT -->
    <div class="toolbar-left">
      <button
        class="icon"
        :disabled="page === 1"
        @click="goFirst"
      >
        <i class="mdi mdi-page-first" />
      </button>

      <button
        class="icon"
        :disabled="!hasPrevious"
        @click="goPrevious"
      >
        <i class="mdi mdi-chevron-left" />
      </button>

      <span class="page-indicator">
        Page <strong>{{ page }}</strong>
        <span v-if="lastPage"> / {{ lastPage }}</span>
      </span>

      <button
        class="icon"
        :disabled="!hasNext"
        @click="goNext"
      >
        <i class="mdi mdi-chevron-right" />
      </button>

      <button
        class="icon"
        :disabled="!hasNext"
        @click="goLast"
      >
        <i class="mdi mdi-page-last" />
      </button>

      <!-- PREFERENCES -->
      <button
        ref="reference"
        class="icon preferences"
        aria-label="Préférences catalogue"
        @click="isOpen = !isOpen"
      >
        <i class="mdi mdi-tune" />
      </button>

      <div
        v-if="isOpen"
        ref="floating"
        class="floating-panel"
        :style="floatingStyles"
      >
        <CataloguePreferencesPanel />
      </div>
    </div>

    <!-- RIGHT -->
    <div class="toolbar-right">
      <input
        type="search"
        placeholder="Rechercher un objet…"
        v-model="searchValue"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.catalogue-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.25rem 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

button {
  background: none;
  border: none;
  color: var(--pico-muted-color);
  cursor: pointer;
}

button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  color: var(--pico-primary);
}

button.icon {
  padding: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

button.icon i {
  font-size: 1.1rem;
}

.page-indicator {
  margin: 0 0.5rem;
  font-size: 0.85rem;
  color: var(--pico-muted-color);
  user-select: none;
}

.preferences {
  margin-left: 0.5rem;
}

.toolbar-right input[type='search'] {
  min-width: 520px;
}

.floating-panel {
  position: absolute;
  z-index: 1000;
  padding: 0.5rem 0.65rem;
  background: var(--pico-background-color);
  border: 1px solid var(--pico-muted-border-color);
  border-radius: var(--pico-border-radius);
  box-shadow: var(--pico-card-box-shadow);
}
</style>
