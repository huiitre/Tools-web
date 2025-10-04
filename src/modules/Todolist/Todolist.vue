<script setup lang="ts">
import { computed, ref, watch, provide } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store/store'

const router = useRouter();
const route = useRoute();

const userModule = computed(() => store.getters['Core/getUserModules']?.find((module: any) => module.code === 'todolist') || null);
provide('userModule', userModule.value)

// Calculer les onglets à partir des routes enfants
const tabs = computed(() => {
  const parentPath = `/${route.path.split('/')[1]}`
  const parentRoute = router.options.routes.find(r => r.path === parentPath)

  if (!parentRoute?.children) return []

  return parentRoute.children
    .filter(child => {
      if (child.name === 'todolist-element' && route.name !== 'todolist-element') {
        return false
      }
      return true
    })
    .map((child, index) => {
      let label = child?.meta?.label || child.name

      // Cas particulier : page d'une todolist
      if (child.name === "todolist-element") {
        if (route.name === "todolist-element" && route.query?.label) {
          label = String(route.query.label)
        } else {
          // si on n'est pas dessus → on cache cet onglet
          return null
        }
      }

      let path
      if (child.name === "todolist-element") {
        path = `${parentRoute.path}/${route.params.idtodolist || ''}`
      } else {
        path = `${parentRoute.path}/${child.path}`
      }

      return {
        label,
        path,
        rawPath: `${parentRoute.path}/${child.path}`,
        value: index + 1,
      }
    })
    .filter((t): t is { label: string, path: string, rawPath: string, value: number } => t !== null)
})

// Onglet actif par défaut
const currentTab = ref(
  tabs.value.length > 0 
    ? tabs.value.find(tab => route.matched.some(m => m.path === tab?.rawPath))?.value || tabs.value[0]?.value 
    : null
);

// Mettre à jour l'onglet actif selon la route
watch(route, () => {
  const tab = tabs.value.find(tab => route.matched.some(m => m.path === tab?.rawPath));
  if (tab) {
    currentTab.value = tab.value;
  }
});

// Naviguer à l'onglet sélectionné
watch(currentTab, (newValue) => {
  const tab = tabs.value.find(tab => tab?.value === newValue);
  if (tab) {
    router.push(tab.path);
  }
});
</script>

<template>
  <v-card class="todolist-card">
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
.todolist-card {
  width: 100%;
}
</style>
