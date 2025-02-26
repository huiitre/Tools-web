<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';
import changelog from '@/CHANGELOG.js'

const appVersion = __APP_VERSION__;
const releaseNotes: Ref<any> = ref([])

const fetchReleaseNote = async () => {
  try {
    releaseNotes.value = changelog.map((entry: any) => ({
      ...entry,
      isCurrent: entry.version == appVersion,
      isLatest: entry.version == changelog[0].version,
    }));
  } catch (err) {
    console.error("%c Home.vue || err : ", 'background:red;color:#fff;', err);
    releaseNotes.value = [];
  }
};

onMounted(() => fetchReleaseNote())
</script>

<template>
  <div id="home">
    <v-container fluid>
      <v-row justify="center">
        <!-- Ajustez la largeur de la colonne selon vos besoins -->
        <v-col cols="12" md="8">
          <v-card>
            <!-- Titre principal -->
            <v-card-title class="headline text-center text-h5 font-weight-bold bg-success text-white">
              Notes de version - {{ appVersion }}
            </v-card-title>
  
            <v-card-text>
              <!-- Liste des versions -->
              <div v-for="(release, index) in releaseNotes" :key="index" class="mb-6">
                <!-- Version avec background colorisé -->
                <div class="d-inline-block rounded-lg px-3 py-2 font-weight-bold text-subtitle-1 bg-grey-lighten-3">
                  {{ release.version }} - {{ new Date(release.releaseDate).toLocaleDateString('fr-FR').replace(/\//g, '-') }}
                </div>
  
                <!-- Notes -->
                <ul class="mt-2 pl-4 text-body-2">
                  <li v-for="(note, idx) in release.notes" :key="idx" class="mb-2">
                    <span class="font-weight-bold">{{ note.split(':')[0] }}:</span>
                    <span> {{ note.split(':').slice(1).join(':') }}</span>
                  </li>
                </ul>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
#home {
  width: 100%;
  margin: 2rem 0;
}
</style>
