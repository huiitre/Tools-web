<script setup lang="ts">
import { getTheme, setTheme } from '@/ui/theme'
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import BurgerMenu from './BurgerMenu.vue'
import { useFetchLogout } from '@/modules/Auth/hooks/useFetchLogout'
import { useRouter } from 'vue-router'

type ThemeMode = 'auto' | 'light' | 'dark'

const router = useRouter()
const auth = useAuthStore()

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
const openBurger = () => { isBurgerOpen.value = true }
const closeBurger = () => { isBurgerOpen.value = false }

onMounted(() => {
  theme.value = getTheme() as ThemeMode
})

const cycleTheme = () => {
  const next: Record<ThemeMode, ThemeMode> = {
    auto: 'light',
    light: 'dark',
    dark: 'auto'
  }

  theme.value = next[theme.value]
  setTheme(theme.value)
}

const themeIcon = computed(() => {
  switch (theme.value) {
    case 'light': return 'mdi-weather-sunny'
    case 'dark': return 'mdi-weather-night'
    default: return 'mdi-theme-light-dark'
  }
})

const themeLabel = computed(() => {
  switch (theme.value) {
    case 'light': return 'Light'
    case 'dark': return 'Dark'
    default: return 'Auto'
  }
})

const handleLogout = async () => {
  await useFetchLogout()
  auth.logout()
  closeBurger()
  router.push('/login')
}
</script>

<template>
  <header class="app-header" role="banner">
    <div class="header-left">
      <button
        v-if="auth.isAuthenticated"
        class="icon-button"
        aria-label="Ouvrir le menu"
        @click="openBurger"
      >
        <i class="fa-solid fa-bars" aria-hidden="true"></i>
      </button>

      <RouterLink to="/" class="app-title">Tools</RouterLink>
    </div>

    <div class="header-center"></div>

    <div class="header-right">
      <button
        class="theme-button"
        :title="`Thème : ${themeLabel}`"
        aria-label="Changer le thème"
        @click="cycleTheme"
      >
        <i class="mdi" :class="themeIcon" aria-hidden="true"></i>
        <span class="theme-label">{{ themeLabel }}</span>
      </button>
    </div>
  </header>

  <BurgerMenu
    :open="isBurgerOpen"
    @close="closeBurger"
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

  background: var(--pico-background-color);
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

.app-title:hover {
  text-decoration: none;
  color: inherit;
}

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
  line-height: 1;
}

.icon-button:hover {
  color: var(--pico-muted-color);
}

/* Theme button */
.theme-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  height: 2.25rem;
  padding: 0 0.5rem;

  border: 1px solid var(--pico-muted-border-color);
  border-radius: var(--pico-border-radius);
  background: transparent;
  cursor: pointer;

  color: inherit;
}

.theme-button:hover {
  background: var(--pico-muted-background-color);
}

.theme-button i {
  font-size: 1.25rem;
  line-height: 1;
}

/* Label responsive */
.theme-label {
  display: none;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
}

/* Desktop / largeur suffisante */
@media (min-width: 768px) {
  .theme-label {
    display: inline;
  }
}
</style>
