<script setup lang="ts">
import Page from '@/router/Page.vue';
import Header from './components/Header/Header.vue';
import store from '@/store/store';
import { computed, onMounted } from 'vue';

import { initGapi } from "@/services/googleApi"
import toast from './services/toast';
onMounted(async () => {
  try {
    await initGapi()
    console.log("✅ GAPI prêt")
  } catch (err) {
    console.error("Erreur init GAPI :", err)
    toast.error("Erreur lors de l'initialisation de Google API")
  }
})

const isLogged = computed(() => store.getters['Core/isLogged'])

const body = document.querySelector('body')
body?.classList.add('main-theme')

const isLoading = computed(() => store.getters['Core/isLoading'])
</script>

<template>
  <v-app>
    <Header v-if="isLogged" />

    <v-main>
      <router-view v-slot="{ Component }">
        <!-- <transition name="fade" mode="out-in"> -->
        <Page>
          <component :is="Component" />
        </Page>
        <!-- </transition> -->
      </router-view>
    </v-main>
    <v-overlay
      :model-value="isLoading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<style scoped>

</style>
