<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Calculer les onglets à partir des routes enfants
const tabs = computed(() => {
  const parentPath = `/${route.path.split('/')[1]}`; // Identifier le parent
  const parentRoute = router.options.routes.find(r => r.path === parentPath);

  if (!parentRoute) {
    console.warn("Aucune route parente trouvée pour :", parentPath);
    return [];
  }

  if (!parentRoute.children) {
    console.warn("La route parente n'a pas d'enfants :", parentRoute);
    return [];
  }

  // Construire les onglets
  return parentRoute.children.map((child, index) => ({
    label: child?.meta?.label || child.name,
    path: `${parentRoute.path}/${child.path}`,
    value: index + 1,
  }));
});

// Onglet actif par défaut
const currentTab = ref(
  tabs.value.length > 0 
    ? tabs.value.find(tab => tab.path === route.path)?.value || tabs.value[0].value 
    : null
);

// Mettre à jour l'onglet actif selon la route
watch(route, () => {
  const tab = tabs.value.find(tab => tab.path === route.path);
  if (tab) {
    currentTab.value = tab.value;
  }
});

// Naviguer à l'onglet sélectionné
watch(currentTab, (newValue) => {
  const tab = tabs.value.find(tab => tab.value === newValue);
  if (tab) {
    router.push(tab.path);
  }
});
</script>

<template>
  <v-card class="dofus-card">
    <v-tabs
      v-model="currentTab"
      align-tabs="center"
      color="deep-purple-accent-4"
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
      >
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <router-view />
  </v-card>
</template>

<style scoped>
.dofus-card {
  width: 100%;
}
</style>
