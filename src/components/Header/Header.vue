<script setup lang="ts">
import router from '@/router/router';
import store from '@/store/store';
import { computed, reactive, Ref, ref, watch } from 'vue';

import toast from '@/services/toast';
import { useMutationAddFeedback } from './hooks/useMutationFeedback';

const appVersion = computed(() => store.getters['Core/getVersion'])

const requiresFrontUpdate = computed(() => store.getters['Core/getRequiresFrontUpdate'])

const showReleaseNotes = ref(false)

function compareSemVer(a: string, b: string) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return -1;
    if ((pa[i] || 0) < (pb[i] || 0)) return 1;
  }

  return 0;
}

const handleRefresh = () => window.location.reload()

const rawNotes = computed(() => store.getters['Core/getReleasesNote']);
const groupedNotes = computed<any[]>(() => {
  const groups: any = {};

  for (const entry of rawNotes.value) {
    const v = entry.version;

    if (!groups[v]) {
      groups[v] = {
        version: v,
        createdAt: entry.createdAt,
        notes: []
      };
    }

    groups[v].notes.push({
      module: entry.module,
      description: entry.description,
      createdAt: entry.createdAt,
      requiresFrontUpdate: entry.requiresFrontUpdate
    });
  }

  // Transformer en tableau + tri DESC par version (SemVer possible)
  return Object.values(groups).sort((a: any, b: any) => {
    return compareSemVer(a.version, b.version);
  });
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
      
      <v-badge
        v-if="requiresFrontUpdate"
        content="1"
        color="red"
        offset-x="5"
        offset-y="5"
      >
        <v-btn class="text-caption font-weight-light" @click="showReleaseNotes = true">
          {{ appVersion || '...' }}
        </v-btn>
      </v-badge>
      <v-btn
        v-else
        class="text-caption font-weight-light"
        @click="showReleaseNotes = true"
      >
        {{ appVersion || '...' }}
      </v-btn>

      <v-btn icon color="grey lighten-1" @click="showBugReportDialog = true">
        <v-icon>mdi-bug</v-icon>
      </v-btn>
    </v-app-bar>
  </div>

  <v-dialog v-model="showReleaseNotes" max-width="700px">
    <v-card>
      <v-card-title v-on:click="handleRefresh" v-if="requiresFrontUpdate" class="new-version headline text-center text-h5 font-weight-bold bg-success text-white">
        Une nouvelle version ({{ appVersion }}) est disponible. Cliquez ici pour mettre à jour le site.
      </v-card-title>
      <v-card-title v-else class="headline text-center text-h5 font-weight-bold bg-grey text-white">
        Notes de version - {{ appVersion }}
      </v-card-title>

      <v-card-text>
        <div v-for="(release, index) in groupedNotes" :key="index" class="mb-6">
          
          <!-- Titre de la version -->
          <div
            class="d-inline-block rounded-lg px-3 py-2 font-weight-bold text-subtitle-1 bg-grey-lighten-3"
          >
            {{ release.version }} - 
            {{ new Date(release.createdAt).toLocaleDateString('fr-FR').replace(/\//g, '-') }}
          </div>

          <!-- Notes -->
          <ul class="mt-2 pl-4 text-body-2">
            <li
              v-for="(note, idx) in release.notes"
              :key="idx"
              class="mb-2"
            >
              <strong>{{ note.module }} :</strong>
              <span>{{ note.description }}</span>
            </li>
          </ul>
        </div>
      </v-card-text>

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
.new-version {
  cursor: pointer;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: initial !important;
}
</style>