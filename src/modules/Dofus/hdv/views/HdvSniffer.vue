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

const isCompatible = computed(() => isEnvCompatible.value && isSystemReady.value);

const expandedCaptureId = ref<string | null>(null);

const toggleSniffer = () => {
  if (!isCompatible.value) return;
  
  if (hdvStore.isSniffing) {
    hdvStore.stop();
  } else {
    hdvStore.start();
  }
};

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
  }
});
</script>

<template>
  <div class="container sniffer-page">
    <!-- Bloc Environnement -->
    <aside v-if="!isEnvCompatible" class="compatibility-warning">
      <header>
        <strong>Accès restreint</strong>
      </header>
      <ul class="warning-list">
        <li v-if="!isElectron">L'usage du sniffer nécessite l'application Desktop</li>
        <li v-else-if="!isLinux">Cette fonctionnalité est réservée à Linux</li>
        <li v-if="!isRetro">Le sniffer est configuré pour Dofus Retro uniquement</li>
      </ul>
    </aside>

    <!-- Bloc Requirements Système -->
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
          <code>tcpdump</code> n'est pas installé sur votre système.
        </li>
        <li v-if="!hdvStore.systemStatus.hasPermissions" class="error">
          <span class="mdi mdi-close-circle-outline"></span>
          Permissions insuffisantes pour capturer les paquets.
        </li>
      </ul>
      <footer v-if="!hdvStore.systemStatus.tcpdumpInstalled">
        <small>Installation suggérée : <code>sudo dnf install tcpdump</code></small>
      </footer>
    </aside>

    <header class="sniffer-hero">
      <hgroup class="text-center">
        <h1>Sniffer HDV</h1>
        <p>Capture automatique des prix en atelier et hôtel de vente</p>
      </hgroup>

      <div class="main-controls">
        <button 
          class="sniffer-toggle"
          :class="hdvStore.isSniffing ? 'secondary' : 'primary'" 
          :disabled="!isCompatible"
          @click="toggleSniffer"
        >
          <span class="mdi" :class="hdvStore.isSniffing ? 'mdi-stop-circle-outline' : 'mdi-play-circle-outline'"></span>
          {{ hdvStore.isSniffing ? 'Arrêter la capture' : 'Démarrer la capture' }}
        </button>
        
        <button 
          v-if="hdvStore.captures.length > 0"
          class="outline contrast icon-only"
          @click="hdvStore.captures = []"
          data-tooltip="Effacer les logs"
        >
          <span class="mdi mdi-delete-outline"></span>
        </button>
      </div>
    </header>

    <article v-if="hdvStore.error" class="error-banner">
      <strong>Erreur :</strong> {{ hdvStore.error }}
    </article>

    <main class="sniffer-content">
      <div v-if="hdvStore.isSniffing && hdvStore.captures.length === 0" class="empty-state">
        <div class="status-indicator"></div>
        <h3>Capture en cours</h3>
        <p class="muted">En attente de paquets... Veuillez consulter un objet en jeu.</p>
      </div>
      
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
    </main>
  </div>
</template>

<style scoped lang="scss">
.sniffer-page {
  max-width: 900px;
  margin: 0 auto;
  padding-top: 1rem;
}

.compatibility-warning, .system-warning {
  border: 1px solid var(--pico-form-element-invalid-border-color);
  background-color: var(--pico-card-background-color);
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: var(--pico-border-radius);

  header, .warning-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    color: var(--pico-del-color);
    
    strong {
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.05rem;
    }
  }

  .warning-list {
    margin: 0;
    padding-left: 0;
    list-style: none;
    font-size: 0.9rem;
    color: var(--pico-muted-color);

    li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;

      &.error {
        color: var(--pico-del-color);
      }
    }
  }

  footer {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--pico-muted-border-color);
  }

  .refresh-btn {
    width: auto;
    margin-bottom: 0;
    padding: 0.2rem 0.5rem;
  }
}

.text-center {
  text-align: center;
}

.sniffer-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;

  hgroup {
    margin-bottom: 0;
  }
}

.main-controls {
  display: flex;
  align-items: center;
  gap: 1rem;

  .sniffer-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 240px;
    margin-bottom: 0;
    font-weight: 600;
  }

  .icon-only {
    width: auto;
    margin-bottom: 0;
    padding: 0.5rem 0.75rem;
  }
}

.mdi {
  font-size: 1.2rem;
  line-height: 1;
}

.error-banner {
  border: 1px solid var(--pico-form-element-invalid-border-color);
  color: var(--pico-del-color);
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: var(--pico-border-radius);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: var(--pico-border-radius);
  background-color: var(--pico-card-background-color);

  .status-indicator {
    width: 12px;
    height: 12px;
    background-color: var(--pico-ins-color);
    border-radius: 50%;
    margin-bottom: 1.5rem;
    animation: blink 2s infinite ease-in-out;
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.muted {
  color: var(--pico-muted-color);
}

@keyframes blink {
  0% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(0.9); }
}
</style>