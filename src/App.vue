<script setup lang="ts">
import Page from '@/router/Page.vue';

const body = document.querySelector('body')
body?.classList.add('main-theme')
</script>

<template>
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
