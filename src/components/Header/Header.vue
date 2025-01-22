<script setup lang="ts">
import { useFetchUserInfos } from '@/modules/Login/hooks/useFetchUserInfos'
import router from '@/router/router';
import store from '@/store/store';
import { computed, Ref, ref, watch } from 'vue';

import changelog from '@/CHANGELOG.js'
import toast from '@/services/toast';
import { useMutationAddFeedback } from './hooks/useMutationFeedback';

const appVersion = __APP_VERSION__;
const releaseNotes: Ref<any> = ref([])
const showReleaseNotes = ref(false)

const fetchReleaseNote = async () => {
  try {
    releaseNotes.value = changelog.map((entry: any) => ({
      ...entry,
      isCurrent: entry.version == appVersion,
      isLatest: entry.version == changelog[0].version,
    }));
  } catch (err) {
    console.error("%c Header.vue || err : ", 'background:red;color:#fff;', err);
    releaseNotes.value = [];
  }
};

watch(showReleaseNotes, (newValue) => {
  if (newValue) {
    fetchReleaseNote();
  }
});

const showBugReportDialog = ref(false)
const bugReportMessage = ref('')
const submitBugReport = async() => {
  if (bugReportMessage.value.trim() === '') {
    toast.error('Veuillez entrer un message avant de soumettre.');
    return;
  }

  try {
    await useMutationAddFeedback(bugReportMessage.value.trim());
    toast.success('Votre message a bien été envoyé. Merci pour votre retour !');
    closeDialog();
  } catch (error) {
    toast.error('Une erreur est survenue lors de l’envoi de votre message. Veuillez réessayer.');
  }
}
const closeDialog = () => {
  showBugReportDialog.value = false
  bugReportMessage.value = ''
}
watch(showBugReportDialog, (val) => {
  if (!val) {
    bugReportMessage.value = ''
  }
})

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
      <v-btn class="text-caption font-weight-light" @click="showReleaseNotes = true">
        {{ appVersion }}
      </v-btn>
      <v-btn icon color="grey lighten-1" @click="showBugReportDialog = true">
        <v-icon>mdi-bug</v-icon>
      </v-btn>
    </v-app-bar>
  </div>

  <v-dialog v-model="showReleaseNotes" max-width="700px">
    <v-card>
      <!-- Titre principal -->
      <v-card-title class="headline text-center text-h5 font-weight-bold bg-success text-white">
        Notes de version - {{ appVersion }}
      </v-card-title>

      <v-card-text>
        <!-- Liste des versions -->
        <div v-for="(release, index) in releaseNotes" :key="index" class="mb-6">
          <!-- Version avec background colorisé -->
          <div
            class="d-inline-block rounded-lg px-3 py-2 font-weight-bold text-subtitle-1 bg-grey-lighten-3"
          >
            {{ release.version }} - {{ new Date(release.releaseDate).toLocaleDateString('fr-FR').replace(/\//g, '-') }}
          </div>

          <!-- Notes -->
          <ul class="mt-2 pl-4 text-body-2">
            <li
              v-for="(note, idx) in release.notes"
              :key="idx"
              class="mb-2"
            >
              <span class="font-weight-bold">{{ note.split(':')[0] }}:</span>
              <span> {{ note.split(':').slice(1).join(':') }}</span>
            </li>
          </ul>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="showReleaseNotes = false">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showBugReportDialog" max-width="500px">
    <v-card>
      <!-- Titre principal avec une croix pour fermer -->
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <span class="headline font-weight-bold">Reporter un bug / Proposer une amélioration</span>
      </v-card-title>

      <!-- Contenu principal -->
      <v-card-text>
        <v-textarea
          v-model="bugReportMessage"
          label="Décrivez votre problème ou votre idée d'amélioration"
          rows="5"
          outlined
          dense
          auto-grow
          maxlength="500"
          counter="500"
          class="mt-3"
        ></v-textarea>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" variant="text" @click="submitBugReport">Envoyer</v-btn>
        <v-btn variant="text" @click="closeDialog">Annuler</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style lang="scss" scoped>

</style>