<script setup lang="ts">
import router from '@/router/router';
import { computed, reactive, Ref, ref, watch } from 'vue';

import toast from '@/services/toast';

const drawer = ref(false)
const toggleDrawer = () => drawer.value = !drawer.value

const navigateToModule = (mod: any) => {
  if (mod && mod.code) router.push({ name: mod.code })
}

const handleDisconnect = () => {

  router.push('/login')
}

</script>

<template>
  <div id="header">
    <v-navigation-drawer
      v-model="drawer"
      temporary
      app
      width="300"
    >
      <!-- <v-list-item
        :prepend-avatar="userInfos.google_picture"
        :title="userInfos.name"
        :subtitle="userInfos.email"
      ></v-list-item> -->

      <v-divider></v-divider>
      <v-list nav>
        <v-list-item 
          prepend-icon="mdi-home" 
          title="Home" 
          value="home"
          @click="router.push({ name: 'home' })"
        ></v-list-item>
        <v-list-item 
          prepend-icon="mdi-cog" 
          title="Paramètres" 
          value="settings"
          :disabled="true"
          @click="router.push({ name: 'settings' })"
        ></v-list-item>
        <v-list-item 
          prepend-icon="mdi-logout" 
          title="Déconnexion" 
          value="logout"
          @click="handleDisconnect"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list nav>
        <!-- <v-list-item
          v-for="mod of userModules"
          :key="mod.idmodule"
          nav
          :value="mod.code"
          @click="navigateToModule(mod)"
        >
          <template v-slot:prepend>
            <v-avatar>
              <template v-if="mod.picture">
                <img :src="mod.picture" :alt="mod.idmodule" />
              </template>
              <template v-else>
                <v-icon>mdi-apps</v-icon>
              </template>
            </v-avatar>
          </template>
          <v-list-item-title>{{ mod.name }}</v-list-item-title>
        </v-list-item> -->
      </v-list>
    </v-navigation-drawer>

  </div>

</template>

<style lang="scss" scoped>
.new-version {
  cursor: pointer;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: initial !important;
}
</style>