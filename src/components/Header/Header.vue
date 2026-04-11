<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/modules/Auth/auth.store'
import BurgerMenu from './BurgerMenu.vue'
import ThemePaletteButton from './ThemePaletteButton.vue'
import ThemeModeButton from './ThemeModeButton.vue'
import { useFetchLogout } from '@/modules/Auth/fetch/auth.fetch'
import { useRouter } from 'vue-router'
import { getTheme } from '@/ui/theme'
import { useUIStore } from '@/stores/ui.store'
import UpdateButton from '@/components/Header/UpdateButton.vue'

type ThemeMode = 'auto' | 'light' | 'dark'

const env = import.meta.env.MODE
const showEnvBadge = env === 'development' || env === 'qa'

const router = useRouter()
const auth = useAuthStore()
const ui = useUIStore()

const theme = ref<ThemeMode>('auto')

const user = computed(() => auth.user)
const userName = computed(() => user.value?.name ?? 'NAME UNKNOWN')
const userEmail = computed(() => user.value?.email ?? 'EMAIL UNKNOWN')

const avatar = computed(() => {
  if (user.value?.avatarUrl) return user.value.avatarUrl
  if (user.value?.name) return user.value.name.charAt(0).toUpperCase()
  return '?'
})

const modules = computed(() => user.value?.modules ?? [])

const isBurgerOpen = ref(false)
const toggleBurger = () => {
  isBurgerOpen.value = !isBurgerOpen.value
}

onMounted(() => {
  theme.value = getTheme() as ThemeMode
})

const handleLogout = async () => {
  ui.setLoading(true)
  await useFetchLogout()
  auth.logout()
  toggleBurger()
  router.push('/login')
  ui.setLoading(false)
}
</script>

<template>
  <header class="app-header" role="banner">
    <div class="header-left">
      <button
        v-if="auth.isAuthenticated"
        class="icon-button"
        aria-label="Ouvrir le menu"
        @click="toggleBurger"
      >
        <i class="fa-solid fa-bars" aria-hidden="true"></i>
      </button>

      <RouterLink to="/" class="app-title">Tools</RouterLink> <span v-if="showEnvBadge" class="env-badge">{{ env }}</span>
    </div>

    <div class="header-center"></div>

    <div class="header-right">
      <!-- Update button -->
      <UpdateButton />

      <!-- Theme color -->
      <div class="theme-accent">
        <ThemePaletteButton />
      </div>

      <!-- Theme mode -->
      <ThemeModeButton />
    </div>
  </header>

  <BurgerMenu
    :open="isBurgerOpen"
    @close="toggleBurger"
    @logout="handleLogout"
    :modules="modules"
    :name="userName"
    :email="userEmail"
    :avatar="avatar"
  />
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 56px;
  padding: 0 1rem;

  background: var(--pico-card-background-color);
  border-bottom: 1px solid var(--pico-muted-border-color);
  color: var(--pico-color);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-center {
  flex: 1;
}

.app-title {
  text-decoration: none;
  font-weight: 600;
  line-height: 1;
  color: inherit;
}

/* Boutons icône */
.icon-button {
  width: 2rem;
  height: 2rem;

  display: inline-flex;
  align-items: center;
  justify-content: center; 

  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  color: inherit;
}

.icon-button:hover {
  color: var(--pico-muted-color);
}

/* Accent thème (palette uniquement) */
.theme-accent :deep(.theme-button) {
  color: var(--pico-primary);
}

.theme-accent :deep(.theme-button:hover) {
  color: var(--pico-primary-hover);
}

.env-badge {
  font-size: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.20rem 0.20rem;
  border-radius: var(--pico-border-radius);
  background: var(--pico-primary-background);
  color: var(--pico-primary-inverse);
}

</style>
