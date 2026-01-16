<script setup lang="ts">
import Page from '@/router/Page.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import toast from '@/services/toast'
import AppHeader from '@/components/Header/Header.vue'

const route = useRoute()
const router = useRouter()

const onAuthExpired = () => {
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
