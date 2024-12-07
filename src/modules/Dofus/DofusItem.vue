<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetchItemList } from './hooks/useFetchItemList'

const itemList = ref([]);

onMounted(async() => {
  try {
    const response = await useFetchItemList()
    itemList.value = response.data
    console.log("%c DofusItem.vue #10 || response : ", 'background:red;color:#fff;font-weight:bold;', response);
  } catch(err) {
    console.log("%c DofusItem.vue #10 || ERROR : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
})

</script>

<template>
  <div>DOFUS ITEM</div>
</template>

<style lang="scss" scoped>

</style>