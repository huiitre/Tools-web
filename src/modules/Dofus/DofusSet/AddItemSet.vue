<script setup lang="ts">
import { reactive, defineEmits } from 'vue';
import { useFetchItemListWeb } from '../hooks/useFetchItemList'

const emit = defineEmits(['add-items'])

const props = defineProps({
  isVisible: {
    type: [Boolean, null],
    required: true
  },
  itemListSet: {
    type: Array,
    required: true,
    default: []
  }
})

const addItems = reactive({
  itemsList: [] as any[],
  selectedItems: [] as any[],
  loadingSearch: false
})

const updateAddItemsList = async(query: string) => {
  if (!query || query.length < 3) {
    addItems.itemsList = []
    return;
  }

  try {
    addItems.loadingSearch = true
    const { data } = await useFetchItemListWeb({ search: query, onlyCraftable: true, sortBy :[{ key: "item_name", order: "asc" }] })

    if (!data?.status)
      throw data

    if (data.data.length > 0) {
      const existingItemIds = new Set(props.itemListSet.map((item: any) => item.iditem)); // IDs déjà dans le set
      const itemsMap = new Map();

      // Ajouter les items sélectionnés
      addItems.selectedItems.forEach((item: any) => itemsMap.set(item.iditem, item));

      // Ajouter les nouveaux items, en excluant ceux déjà dans itemListSet
      data.data
        .filter((item: any) => !existingItemIds.has(item.iditem))
        .forEach((item: any) => itemsMap.set(item.iditem, item));

      addItems.itemsList = Array.from(itemsMap.values());
    }
  } catch(err) {
    console.log("%c DofusSet.vue #44 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  } finally {
    addItems.loadingSearch = false
  }
}

const addSelectedItems = () => {
  emit('add-items', addItems.selectedItems);
  addItems.selectedItems = []
}

</script>

<template>
  <v-card class="mb-4 px-4 py-3 bg-blue-grey-lighten-4 opacity-100" outlined v-if="props.isVisible">
    <!-- Titre stylisé -->
    <v-card-title class="text-h6 font-weight-bold">
      Ajouter un item
    </v-card-title>

    <!-- Contenu principal -->
    <v-card-text>
      <v-row>
        <!-- Autocomplete -->
        <v-col cols="8" class="">
          <v-autocomplete
            clearable
            chips
            label="Rechercher un item"
            :items="addItems.itemsList"
            item-title="item_name"
            item-value=""
            multiple
            return-object
            :loading="addItems.loadingSearch"
            v-model="addItems.selectedItems"
            class="align-self-center"
            @update:search="updateAddItemsList"
            closable-chips
            no-data-text=""
          ></v-autocomplete>
        </v-col>

        <!-- Bouton à droite -->
        <v-col cols="4" class="d-flex align-center">
          <v-btn
            color="success"
            block
            class="ml-2 align-self-center"
            @click="addSelectedItems"
            :disabled="addItems.selectedItems.length === 0"
          >
            Ajouter
          </v-btn>
        </v-col>

      </v-row>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
</style>