<script setup lang="ts">
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
</script>

<template>
  <main class="page">
    <Header />

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
}
</style>
