<script setup lang="ts">
import Page from '@/router/Page.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import toast from '@/services/toast'
import { clientInit } from './services/axiosInstance'

const route = useRoute()
const router = useRouter()

const onAuthExpired = async() => {

  try {
    await clientInit.post('/auth/logout')
  } catch {}

  toast.error('Votre session a expiré. Veuillez vous reconnecter.')

  if (route.meta.requireAuth === true) {
    router.push('/login')
  }
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
</template>
