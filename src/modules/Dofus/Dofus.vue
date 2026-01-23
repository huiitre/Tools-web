<script setup lang="ts">
import { onMounted, watch } from 'vue'

import DofusNav from '@/modules/Dofus/shared/components/DofusNav.vue'
import toast from '@/services/toast'
import { useFetchGameVersions } from '@/modules/Dofus/game/fetch/game.fetch'
import { useFetchGameServers } from '@/modules/Dofus/game/fetch/game.fetch'
import { useDofusStore } from '@/modules/Dofus/dofus.store'

const dofusStore = useDofusStore()

const loadGameServers = async () => {
  if (dofusStore.currentGameVersionId === null) return

  const { data: gameServers } = await useFetchGameServers()
  dofusStore.setGameServers(gameServers)

  if (
    dofusStore.currentGameServerId === null &&
    gameServers.length > 0
  ) {
    dofusStore.setCurrentGameServer(gameServers[0].id)
  }
}

const loadDofusModuleData = async () => {
  try {
    dofusStore.hydrateFromStorage()

    const { data: gameVersions } = await useFetchGameVersions()
    dofusStore.setGameVersions(gameVersions)

    if (dofusStore.currentGameVersionId === null && gameVersions.length > 0) {
      dofusStore.setCurrentGameVersion(gameVersions[0].id)
    }

  } catch (e: any) {
    console.error('Dofus.vue | loadDofusModuleData', e)
    toast.error(e?.message || 'Erreur lors du chargement des données du module Dofus')
  }
}

watch(
  () => dofusStore.currentGameVersionId,
  async () => {
    dofusStore.setGameServers([])
    await loadGameServers()
  }
)

onMounted(() => {
  loadDofusModuleData()
})
</script>

<template>
  <div id="dofus">
    <DofusNav />

    <section class="dofus-content">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="dofusStore.renderKey" />
        </Transition>
      </router-view>
    </section>
  </div>
</template>

<style lang="scss" scoped>
/* Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
