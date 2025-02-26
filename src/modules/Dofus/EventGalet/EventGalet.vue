<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFetchEventGalet } from '../hooks/useFetchEventGalet';

const data = ref<any[]>([]);
const loadingData = ref(false);
const headersRef = ref<any[]>([
  { title: 'Nom', value: 'dungeon_name', sortable: true },
  { title: 'Niveau', value: 'dungeon_level', sortable: true },
  { title: 'Coût total', value: 'total_cost', sortable: true },
  { title: 'Prix Clé', value: 'key_final_price', sortable: true },
  { title: 'Prix Pierre', value: 'stone_final_price', sortable: true }
]); // ✅ Headers définis dès le départ

const formattedData = ref<any[]>([]);

const fetchData = async () => {
  try {
    loadingData.value = true;
    const { data: response } = await useFetchEventGalet();
    if (!response.status) throw response;
    data.value = response.data;
  } catch (err) {
    console.error(err);
  } finally {
    loadingData.value = false;
  }
};

onMounted(fetchData);

// ✅ Mise à jour dynamique des headers après chargement des données
watch(data, (newData) => {
  if (newData.length > 0) {
    headersRef.value = [
      { title: 'Nom', value: 'dungeon_name', sortable: true },
      { title: 'Niveau', value: 'dungeon_level', sortable: true },
      { title: 'Coût total', value: 'total_cost', sortable: true },
      { title: 'Prix Clé', value: 'key_final_price', sortable: true },
      { title: 'Prix Pierre', value: 'stone_final_price', sortable: true },
      ...newData[0].ratios.map((galet: any) => ({
        title: galet.name,  // ✅ Utiliser `title` au lieu de `text`
        value: `ratio_${galet.iditem}`,
        sortable: true
      }))
    ];
  }
}, { immediate: true });

// ✅ Formatage des données sans duplication ni recalcul constant
watch(data, (newData) => {
  formattedData.value = newData.map(dungeon => ({
    id: dungeon.iddungeon, // ✅ Ajout d'un identifiant unique
    dungeon_name: dungeon.dungeon_name,
    dungeon_level: Number(dungeon.dungeon_level),
    total_cost: Number(dungeon.total_cost),
    key_final_price: Number(dungeon.key?.final_price ?? 0),
    stone_final_price: Number(dungeon.stone?.final_price ?? 0),
    ...Object.fromEntries(
      dungeon.ratios.map((galet: any) => [
        `ratio_${galet.iditem}`,
        Number(galet.ratioBrut.toFixed(2))
      ])
    )
  }));
}, { immediate: true });

// 🔍 Debugging : Vérifier les valeurs après mise à jour
watch(formattedData, (newData) => {
  console.log("Données formatées mises à jour:", newData);
});
</script>

<template>
  <div class="dofus-event-galet pa-4">
    <v-btn color="primary" @click="fetchData" :loading="loadingData">
      Recharger
    </v-btn>

    <v-data-table
      v-if="formattedData.length > 0"
      :items="formattedData"
      :headers="headersRef"
      :items-per-page="-1"
      item-value="id"
      dense
      must-sort
    />

    <v-alert v-else type="info" class="mt-4">
      Aucune donnée disponible.
    </v-alert>
  </div>
</template>

<style lang="scss" scoped>
.dofus-event-galet {
  padding: 1rem 0 4rem 0;
}
</style>
