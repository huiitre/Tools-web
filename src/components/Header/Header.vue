<script setup lang="ts">
import { useFetchUserInfos } from '@/modules/Login/hooks/useFetchUserInfos'
import store from '@/store/store';

const handleDisconnect = () => {
  store.dispatch('Core/clearUser')
}

const handleTest = async() => {
  try {
    const { data } = await useFetchUserInfos()
    console.log("%c Header.vue #7 || data : ", 'background:red;color:#fff;font-weight:bold;', data);
  } catch (err: any) {
    console.log("%c Header.vue #9 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
}
</script>

<template>
  <div id="header">
    <button v-on:click="handleTest">TEST /AUTH/ME</button>
    <router-link to="/">
      <button>Retour à l'accueil</button>
    </router-link>
    <router-link to="/login">
      <button v-on:click="handleDisconnect">Déconnexion</button>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>

</style>