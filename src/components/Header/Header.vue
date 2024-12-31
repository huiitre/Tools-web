<script setup lang="ts">
import { useFetchUserInfos } from '@/modules/Login/hooks/useFetchUserInfos'
import router from '@/router/router';
import store from '@/store/store';
import { computed, ref } from 'vue';

const appVersion = __APP_VERSION__;

const drawer = ref(false)
const toggleDrawer = () => drawer.value = !drawer.value

const userInfos = computed(() => store.getters['Core/getUserInfos'])
const userModules = computed(() => store.getters['Core/getUserModules'])

const navigateToModule = (mod: any) => {
  if (mod && mod.code) router.push({ name: mod.code })
}

const handleDisconnect = () => {
  store.dispatch('Core/clearUser')
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
      <v-list-item
        :prepend-avatar="userInfos.google_picture"
        :title="userInfos.name"
        :subtitle="userInfos.email"
      ></v-list-item>

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
        <v-list-item 
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
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :elevation="24">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title>
        <router-link to="/">
          Tools
        </router-link>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn class="text-caption font-weight-light" style="pointer-events: none;">
        {{ appVersion }}
      </v-btn>
    </v-app-bar>

    <!-- <v-btn v-on:click="handleTest">TEST /AUTH/ME</v-btn> -->
    <!-- <router-link to="/">
      <v-btn>Retour à l'accueil</v-btn>
    </router-link>
    <router-link to="/login">
      <v-btn v-on:click="handleDisconnect">Déconnexion</v-btn>
    </router-link> -->
  </div>
</template>

<style lang="scss" scoped>

</style>