<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useFetchUpdateItemTypes, useFetchUpdateItems, useFetchUpdateRecipes } from '../hooks/useFetchDofusConfig'

const userModule: any = inject('userModule', null)

const isReadonly = computed(() => {
  return !userModule || !userModule.moduleRole || userModule.moduleRole < 10
})

const isLoading = ref(false)
const progress = ref(0)
const messages = ref<{ type: string; message: string }[]>([])
const showConsole = ref(false)

const updateTypes = () => {
  if (isReadonly.value) return

  isLoading.value = true
  progress.value = 0
  messages.value = []
  showConsole.value = true

  const eventSource = useFetchUpdateItemTypes((data) => {
    if (data.type === 'progress') {
      progress.value = Math.round((data.current / data.total) * 100)
    } else {
      messages.value.push({ type: data.type, message: data.message })
    }

    if (data.type === 'end') {
      isLoading.value = false
      eventSource?.close()
    }
  }, (err) => {
    isLoading.value = false
    messages.value.push({ type: 'error', message: 'Erreur SSE : ' + err })
  })
}

const updateItems = () => {
  if (isReadonly.value) return

  isLoading.value = true
  progress.value = 0
  messages.value = []
  showConsole.value = true

  const eventSource = useFetchUpdateItems((data) => {
    if (data.type === 'progress') {
      progress.value = Math.round((data.current / data.total) * 100)
    } else {
      messages.value.push({ type: data.type, message: data.message })
    }

    if (data.type === 'end') {
      isLoading.value = false
      eventSource?.close()
    }
  }, (err) => {
    isLoading.value = false
    messages.value.push({ type: 'error', message: 'Erreur SSE : ' + err })
  })
}

const updateRecipes = () => {
  if (isReadonly.value) return

  isLoading.value = true
  progress.value = 0
  messages.value = []
  showConsole.value = true

  const eventSource = useFetchUpdateRecipes((data) => {
    if (data.type === 'progress') {
      progress.value = Math.round((data.current / data.total) * 100)
    } else {
      messages.value.push({ type: data.type, message: data.message })
    }

    if (data.type === 'end') {
      isLoading.value = false
      eventSource?.close()
    }
  }, (err) => {
    isLoading.value = false
    messages.value.push({ type: 'error', message: 'Erreur SSE : ' + err })
  })
}

const closeConsole = () => {
  showConsole.value = false
  messages.value = []
}
</script>

<template>
  <div class="dofus-config">
    <h2>⚙️ Configuration Dofus</h2>

    <!-- Zone console déplacée AVANT les boutons -->
    <div v-if="showConsole" class="console">
      <div class="console-header">
        <h3>📜 Logs</h3>
        <button class="close-btn" @click="closeConsole">✖</button>
      </div>
      <ul>
        <li v-for="(msg, i) in messages" :key="i" :class="msg.type">
          {{ msg.message }}
        </li>
      </ul>
    </div>

    <div class="buttons">
      <button
        @click="updateTypes"
        :disabled="isReadonly || isLoading"
        :style="{
          background: isLoading
            ? `linear-gradient(90deg, #673ab7 ${progress}%, #ccc ${progress}%)`
            : '#673ab7'
        }"
      >
        {{ isLoading ? progress + '%' : 'Mettre à jour les Types (depuis dofusdb)' }}
      </button>

      <button
        @click="updateItems"
        :disabled="isReadonly || isLoading"
        :style="{
          background: isLoading
            ? `linear-gradient(90deg, #673ab7 ${progress}%, #ccc ${progress}%)`
            : '#673ab7'
        }"
      >
        Mettre à jour les Objets (depuis dofusdb)
      </button>

      <button
        @click="updateRecipes"
        :disabled="isReadonly || isLoading"
        :style="{
          background: isLoading
            ? `linear-gradient(90deg, #673ab7 ${progress}%, #ccc ${progress}%)`
            : '#673ab7'
        }"
      >
        Mettre à jour les Recettes (depuis dofusdb)
      </button>
    </div>

    <div v-if="isReadonly" class="warning">
      ⚠️ Vous n’avez pas les droits suffisants pour exécuter ces actions
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dofus-config {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;

  h2 {
    text-align: center;
    font-size: 1.2rem;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    button {
      width: 100%;
      padding: 0.8rem;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;

      &:disabled {
        background-color: #aaa !important;
        cursor: not-allowed;
      }
    }
  }

  .warning {
    text-align: center;
    font-size: 0.9rem;
    color: #d32f2f;
    font-weight: bold;
  }

  .console {
    background: #f5f5f5; /* 👈 fond clair */
    color: #333;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    max-height: 300px; /* 👈 plus haut */
    overflow-y: auto;
    border: 1px solid #ddd;

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      h3 {
        margin: 0;
        font-size: 1rem;
      }

      .close-btn {
        background: transparent;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #666;

        &:hover {
          color: #000;
        }
      }
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        margin: 0.2rem 0;
      }
      .info { color: #2e7d32; }
      .error { color: #c62828; }
      .progress { color: #1565c0; }
    }
  }
}
</style>
