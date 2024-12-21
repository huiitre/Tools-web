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
    <v-btn v-on:click="handleTest">TEST /AUTH/ME</v-btn>
    <router-link to="/">
      <v-btn>Retour à l'accueil</v-btn>
    </router-link>
    <router-link to="/login">
      <v-btn v-on:click="handleDisconnect">Déconnexion</v-btn>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>

</style>