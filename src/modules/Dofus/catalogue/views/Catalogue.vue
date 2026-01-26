<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import CatalogueToolbar from '@/modules/Dofus/catalogue/components/CatalogueToolbar.vue'
import CatalogueHeader from '@/modules/Dofus/catalogue/components/CatalogueHeader.vue'
import CatalogueRow from '@/modules/Dofus/catalogue/components/CatalogueRow.vue'
import { useFetchColumns } from '@/modules/Dofus/catalogue/fetch/catalogue.fetch'
import { useCatalogueStore } from '@/modules/Dofus/catalogue/catalogue.store'
import toast from '@/services/toast'

const catalogueStore = useCatalogueStore()

/* =========================
   TREE UI
========================= */

const openedItems = ref<Set<number>>(new Set())

const toggleItem = (id: number) => {
  openedItems.value.has(id)
    ? openedItems.value.delete(id)
    : openedItems.value.add(id)
}

const isOpen = (id: number) => openedItems.value.has(id)

/* =========================
   INGREDIENTS
========================= */

const getIngredients = (itemId: number) =>
  catalogueStore.ingredients.filter(i => i.item_id === itemId)

const maxDepth = 4

/* =========================
   INIT
========================= */

onMounted(async () => {
  try {
    const { data: columns } = await useFetchColumns()
    catalogueStore.hydrateColumns(columns)
  } catch (e: any) {
    toast.error(e?.message ?? 'Erreur chargement colonnes')
  }
})

watch(
  () => [
    catalogueStore.q,
    catalogueStore.page,
    catalogueStore.pageSize,
    catalogueStore.sort,
    catalogueStore.dir,
  ],
  () => catalogueStore.search(),
  { immediate: true },
)
</script>

<template>
  <main id="dofus-catalogue">
    <CatalogueToolbar />

    <CatalogueHeader :depth="0" />

    <template
      v-for="item in catalogueStore.items"
      :key="item.id"
    >
      <CatalogueRow
        :item="item"
        :depth="0"
        :maxDepth="maxDepth"
        :isOpen="isOpen"
        :toggleItem="toggleItem"
        :getIngredients="getIngredients"
      />
    </template>
  </main>
</template>

<style scoped lang="scss">
#dofus-catalogue {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
}
</style>
