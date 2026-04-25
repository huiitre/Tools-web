<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useHdvSnifferStore } from '../hdvSniffer.store';
import { useDofusStore } from '@/modules/Dofus/dofus.store';
import { useOS } from '@/composables/useOS';
import { useEnv } from '@/composables/useEnv';
import HdvSnifferRow from '../components/HdvSnifferRow.vue';

const hdvStore = useHdvSnifferStore();
const dofusStore = useDofusStore();
const { isLinux } = useOS();
const { isElectron } = useEnv();

const isRetro = computed(() => dofusStore.currentGameVersion?.code === 'retro');
const isEnvCompatible = computed(() => isElectron && isLinux && isRetro.value);

const isSystemReady = computed(() => 
  hdvStore.systemStatus.tcpdumpInstalled && hdvStore.systemStatus.hasPermissions
);

const expandedCaptureId = ref<string | null>(null);

const toggleExpand = (captureId: string) => {
  if (expandedCaptureId.value === captureId) {
    expandedCaptureId.value = null;
  } else {
    expandedCaptureId.value = captureId;
  }
};

onMounted(() => {
  if (isEnvCompatible.value) {
    hdvStore.checkSystem();
    hdvStore.setupListener();
  }
});
</script>

<template>
  <div class="container-fluid bank-management-page">
    <!-- Bloc Compatibilité -->
    <div class="container">
      <aside v-if="!isEnvCompatible" class="compatibility-warning">
        <header><strong>Accès restreint</strong></header>
        <ul class="warning-list">
          <li v-if="!isElectron">L'usage du sniffer nécessite l'application Desktop</li>
          <li v-else-if="!isLinux">Cette fonctionnalité est réservée à Linux</li>
          <li v-if="!isRetro">Le sniffer est configuré pour Dofus Retro uniquement</li>
        </ul>
      </aside>

      <aside v-else-if="hdvStore.systemStatus.checked && !isSystemReady" class="system-warning">
        <div class="warning-header">
          <strong>Dépendances système manquantes</strong>
          <button class="outline contrast refresh-btn" @click="hdvStore.checkSystem()" data-tooltip="Actualiser l'état">
            <span class="mdi mdi-refresh"></span>
          </button>
        </div>
        <ul class="warning-list">
          <li v-if="!hdvStore.systemStatus.tcpdumpInstalled" class="error">
            <span class="mdi mdi-close-circle-outline"></span> 
            <code>tcpdump</code> n'est pas installé.
          </li>
          <li v-if="!hdvStore.systemStatus.hasPermissions" class="error">
            <span class="mdi mdi-close-circle-outline"></span>
            Permissions insuffisantes.
          </li>
        </ul>
      </aside>
    </div>

    <!-- Header HDV (Style original, comportement fixe) -->
    <header class="bank-header-sticky sniffer-hero-header">
      <div class="container hero-content">
        <hgroup class="text-center">
          <h1>Sniffer HDV</h1>
          <p>Capture automatique des prix en atelier et hôtel de vente</p>
        </hgroup>

        <div class="main-controls">
          <div class="sniffer-status-badge" :class="{ active: hdvStore.isSniffing }">
            <span class="mdi" :class="hdvStore.isSniffing ? 'mdi-record-circle' : 'mdi-pause-circle'"></span>
            {{ hdvStore.isSniffing ? 'SCAN ACTIF' : 'SCAN PAUSE' }}
          </div>
          
          <button 
            v-if="hdvStore.captures.length > 0"
            class="outline contrast btn-clear"
            @click="hdvStore.captures = []"
            data-tooltip="Effacer les logs"
          >
            <span class="mdi mdi-delete-sweep-outline"></span>
            VIDER
          </button>
        </div>
      </div>
    </header>

    <!-- Zone de défilement unique -->
    <main class="bank-container">
      <div class="container results-container">
        <article v-if="hdvStore.error" class="error-banner">
          <strong>Erreur :</strong> {{ hdvStore.error }}
        </article>

        <div v-if="hdvStore.captures.length > 0" class="results-list">
          <HdvSnifferRow 
            v-for="capture in hdvStore.captures" 
            :key="capture.id"
            :capture-id="capture.id"
            :item="hdvStore.itemsMetadata[capture.itemId]"
            :item-id="capture.itemId"
            :instances="capture.instances"
            :average-price="capture.averagePrice"
            :is-expanded="expandedCaptureId === capture.id"
            @toggle="toggleExpand(capture.id)"
          />
        </div>

        <div v-else-if="hdvStore.isSniffing" class="empty-state">
          <div class="status-indicator"></div>
          <h3>Capture en cours</h3>
          <p class="muted">En attente de paquets... Veuillez consulter un objet en jeu.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.bank-management-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 108px);
}

.bank-header-sticky {
  background-color: var(--pico-background-color);
  border-bottom: 1px solid var(--pico-muted-border-color);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  display: flex;
  justify-content: center;

  &.sniffer-hero-header .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    hgroup { margin: 0; }
  }
}

.main-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sniffer-status-badge {
  display: flex;
  align-items: center; gap: 0.5rem;
  padding: 0.4rem 0.8rem; border-radius: 2rem;
  font-weight: 800; font-size: 0.7rem;
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-muted-border-color);
  color: var(--pico-muted-color);
  &.active {
    color: var(--pico-ins-color); border-color: var(--pico-ins-color);
    .mdi { animation: blink 2s infinite; }
  }
}

.btn-clear {
  margin: 0; padding: 0.4rem 0.8rem;
  font-size: 0.7rem; font-weight: 800;
  border-radius: 2rem;
  display: flex; align-items: center; gap: 0.3rem;
}

.bank-container {
  flex: 1;
  padding: 2rem 0;
  overflow-y: auto;
}

.results-container {
  max-width: 900px;
  margin: 0 auto;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.text-center { text-align: center; }

.compatibility-warning, .system-warning {
  border: 1px solid var(--pico-form-element-invalid-border-color);
  background-color: var(--pico-card-background-color);
  padding: 1rem; margin-top: 1rem; margin-bottom: 1rem; border-radius: var(--pico-border-radius);
  .warning-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; color: var(--pico-del-color); }
  .warning-list { margin: 0; padding-left: 0; list-style: none; font-size: 0.9rem; li { display: flex; align-items: center; gap: 0.5rem; &.error { color: var(--pico-del-color); } } }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 4rem 2rem; text-align: center; border-radius: var(--pico-border-radius); background-color: var(--pico-card-background-color);
  .status-indicator { width: 12px; height: 12px; background-color: var(--pico-ins-color); border-radius: 50%; margin-bottom: 1.5rem; animation: blink 2s infinite ease-in-out; }
}

@keyframes blink { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }

.muted { color: var(--pico-muted-color); }
</style>
