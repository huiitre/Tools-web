<script setup lang="ts">
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'

const showHeader = false
</script>

<template>
  <main class="page">
    <Header v-if="showHeader" />

    <slot />

    <Footer />
  </main>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100dvh;
  width: 100%;

  display: flex;
  flex-direction: column;

  overflow-x: hidden;
}
</style>
