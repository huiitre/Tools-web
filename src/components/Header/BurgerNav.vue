<script setup lang="ts">
import { ModuleType } from '@/stores/auth.store';
import { RouterLink } from 'vue-router'

defineProps<{
  showSettings?: boolean
  modules?: Array<ModuleType>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'logout'): void
}>()

const onLogoutClick = () => {
  emit('logout')
}
</script>

<template>
  <nav class="burger-nav">
    <!-- CORE NAV -->
    <RouterLink to="/" @click="emit('close')" class="nav-item">
      <i class="fa-solid fa-house"></i>
      Home
    </RouterLink>

    <RouterLink
      v-if="showSettings !== false"
      to="/settings"
      @click="emit('close')"
      class="nav-item"
    >
      <i class="fa-solid fa-gear"></i>
      Paramètres
    </RouterLink>

    <button type="button" class="nav-item" @click="onLogoutClick">
      <i class="fa-solid fa-right-from-bracket"></i>
      Déconnexion
    </button>

    <!-- MODULES -->
    <template v-if="modules && modules.length">
      <hr />

      <div class="modules-title">
        Modules
      </div>

      <RouterLink
        v-for="module in modules"
        :key="module.id"
        :to="`/${module.code}`"
        @click="emit('close')"
        class="nav-item"
      >
        <i class="mdi mdi-apps"></i>
        {{ module.name }}
      </RouterLink>
    </template>
  </nav>
</template>

<style scoped>
.burger-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  padding: 0.5rem 0.6rem;
  border-radius: 0.35rem;

  background: transparent;
  border: 0;

  color: inherit;
  cursor: pointer;
  text-decoration: none;

  transition: background-color 120ms ease, color 120ms ease;
}

.nav-item:hover {
  background: var(--pico-muted-border-color);
  color: inherit;
}

.modules-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>
