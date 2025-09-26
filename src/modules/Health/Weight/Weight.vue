<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Calcule le parent réel: /health/weight
const tabs = computed(() => {
  const segments = route.path.split('/').filter(Boolean);
  const parentPath = '/' + segments.slice(0, 2).join('/'); // -> "/health/weight"
  const parentRoute = router.options.routes.find(r => r.path === parentPath);

  if (!parentRoute?.children) return [];

  return parentRoute.children.map((child, index) => ({
    label: child?.meta?.label || child.name,
    path: `${parentRoute.path}/${child.path}`,
    rawPath: `${parentRoute.path}/${child.path}`,
    value: index + 1,
  }));
});

// Onglet actif par défaut
const currentTab = ref(
  tabs.value.length > 0
    ? tabs.value.find(tab => route.matched.some(m => m.path === tab.rawPath))?.value || tabs.value[0].value
    : null
);

// Met à jour l'onglet actif selon la route
watch(route, () => {
  const tab = tabs.value.find(tab => route.matched.some(m => m.path === tab.rawPath));
  if (tab) currentTab.value = tab.value;
});

// Navigation lors du changement d’onglet
watch(currentTab, (newValue) => {
  const tab = tabs.value.find(t => t.value === newValue);
  if (tab) router.push(tab.path);
});
</script>

<template>
  <v-card class="health-card">
    <v-tabs v-model="currentTab" align-tabs="center">
      <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <router-view />
  </v-card>
</template>

<style scoped>
.health-card { width: 100%; }
</style>
