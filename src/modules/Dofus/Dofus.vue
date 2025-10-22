<script setup lang="ts">
import { computed, ref, watch, provide, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store/store'
import dayjs from "dayjs"
import LS from '@/services/localStorage';

const router = useRouter();
const route = useRoute();

const LS_KEY_FAVORITES = "dofus_almanax_favorites"

const hasTodayFavorite = ref(false)

function checkTodayFavorite() {
  const savedFavorites = LS.get(LS_KEY_FAVORITES)
  if (!Array.isArray(savedFavorites)) {
    hasTodayFavorite.value = false
    return
  }

  const todayKey = dayjs().format("YYYY-MM-DD")
  hasTodayFavorite.value = savedFavorites.some(f => f.date === todayKey)
}

onMounted(() => {
  checkTodayFavorite()
  window.addEventListener("storage", checkTodayFavorite)
})

onUnmounted(() => {
  window.removeEventListener("storage", checkTodayFavorite)
})

const userModule = computed(() => store.getters['Core/getUserModules']?.find((module: any) => module.code === 'dofus') || null);
provide('userModule', userModule.value)

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
  return parentRoute.children
    .filter(child => {
      // Exclure "Set Partagé" si on n'est pas sur une route partagée
      if (child.name === 'dofus-set-shared' && route.name !== 'dofus-set-shared') {
        return false;
      }
      return true;
    })
    .map((child, index) => ({
      label: child?.meta?.label || child.name,
      path: `${parentRoute.path}/${child.path.replace(/:setCode\??/, '')}`, // Remplacer les paramètres dynamiques
      rawPath: `${parentRoute.path}/${child.path}`, // Garder le chemin brut pour comparer dynamiquement
      value: index + 1,
    }));
});

// Onglet actif par défaut
const currentTab = ref(
  tabs.value.length > 0 
    ? tabs.value.find(tab => route.matched.some(m => m.path === tab.rawPath))?.value || tabs.value[0].value 
    : null
);

// Mettre à jour l'onglet actif selon la route
watch(route, () => {
  const tab = tabs.value.find(tab => route.matched.some(m => m.path === tab.rawPath));
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
        <span>
          {{ tab.label }}
          <i
            v-if="tab.label === 'Almanax' && hasTodayFavorite"
            class="fa-solid fa-bell favorite-icon"
            title="Almanax favori aujourd'hui"
          ></i>
        </span>
      </v-tab>
    </v-tabs>

    <router-view />
  </v-card>
</template>

<style scoped>
.dofus-card {
  width: 100%;
}
.favorite-icon {
  margin-left: 6px;
  color: #f5c518;
  font-size: 0.85em;
}
</style>
