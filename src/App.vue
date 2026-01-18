<script setup lang="ts">
import Page from '@/router/Page.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import toast from '@/services/toast'
import { clientInit } from './services/axiosInstance'
import FullPageLoader from './components/ui/FullPageLoader.vue'
import { useUIStore } from '@/stores/ui.store'

const uiStore = useUIStore()

const route = useRoute()
const router = useRouter()

const onAuthExpired = async () => {
  uiStore.setLoading(true)

  try {
    await clientInit.post('/auth/logout')
  } catch {
    // ignore
  }

  toast.error('Votre session a expiré. Veuillez vous reconnecter.')

  if (route.meta.requireAuth === true) {
    await router.push('/login')
  }

  uiStore.setLoading(false)
}

onMounted(() => {
  window.addEventListener('auth:expired', onAuthExpired)
})

onBeforeUnmount(() => {
  window.removeEventListener('auth:expired', onAuthExpired)
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <Page>
      <component :is="Component" />
    </Page>
  </router-view>

  <FullPageLoader :visible="uiStore.isLoading" />
</template>
