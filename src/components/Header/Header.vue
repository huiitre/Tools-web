<script setup lang="ts">
import { getTheme, toggleTheme } from '@/ui/theme'
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import BurgerMenu from './BurgerMenu.vue'
import { useFetchLogout } from '@/modules/Auth/hooks/useFetchLogout'
import { useRouter } from 'vue-router'

const router = useRouter()

const auth = useAuthStore()
const theme = ref<'dark' | 'light'>('dark')

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
  theme.value = getTheme()
})

const onToggleTheme = () => {
  theme.value = toggleTheme()
}

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
      <button v-if="auth.isAuthenticated" class="icon-button" aria-label="Ouvrir le menu" @click="openBurger">
        <i class="fa-solid fa-bars" aria-hidden="true"></i>
      </button>

      <RouterLink to="/" class="app-title">Tools</RouterLink>
    </div>

    <div class="header-center"></div>

    <div class="header-right">
      <label class="theme-switch">
        <input
          type="checkbox"
          role="switch"
          :checked="theme === 'dark'"
          @change="onToggleTheme"
        />
        <span class="icon" aria-hidden="true">
          {{ theme === 'dark' ? '🌙' : '☀️' }}
        </span>
      </label>
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

.icon-button > i {
  display: block;
  color: currentColor;
}

.icon-button:hover {
  color: var(--pico-muted-color);
}

.theme-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-switch .icon {
  line-height: 1;
  user-select: none;
}
</style>
