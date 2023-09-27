<script setup lang="ts">
import { useFetchUserInfos } from '@/modules/Login/hooks/useFetchUserInfos'

const handleTest = async() => {
  console.log("%c Home.vue #3 || handleTest", 'background:blue;color:#fff;font-weight:bold;');

  try {
    const { data } = await useFetchUserInfos()
    console.log("%c Home.vue #9 || data : ", 'background:red;color:#fff;font-weight:bold;', data);
  } catch (err: any) {
    console.log("%c Home.vue #8 || error me : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
}
</script>

<template>
  <button v-on:click="handleTest">TEST /AUTH/ME</button>
</template>

<style lang="scss" scoped>

</style>