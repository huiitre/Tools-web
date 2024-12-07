<script setup lang="ts">
import Page from '@/router/Page.vue';
import Header from './components/Header/Header.vue';
import store from '@/store/store';
import { computed } from 'vue';

const isLogged = computed(() => store.getters['Core/isLogged'])
console.log("%c App.vue #8 || isLogged : ", 'background:red;color:#fff;font-weight:bold;', isLogged.value);

const body = document.querySelector('body')
body?.classList.add('main-theme')
</script>

<template>
  <Header v-if="isLogged" />
  <router-view v-slot="{ Component }">
    <!-- <transition name="fade" mode="out-in"> -->
    <Page>
      <component :is="Component" />
    </Page>
    <!-- </transition> -->
  </router-view>
</template>

<style scoped>

</style>
