<script setup lang="ts">
import Page from '@/router/Page.vue'
</script>

<template>
  <router-view v-slot="{ Component }">
    <Page>
      <component :is="Component" />
    </Page>
  </router-view>
</template>