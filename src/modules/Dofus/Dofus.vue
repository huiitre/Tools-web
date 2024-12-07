<script setup lang="ts">
console.log("%c Dofus.vue #2 || DOFUS", 'background:blue;color:#fff;font-weight:bold;');
</script>

<template>
  <div>
    <h1>DOFUS</h1>
    <router-link :to="{ path: '/dofus/item' }">
      <button>Recherche item</button>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>

</style>