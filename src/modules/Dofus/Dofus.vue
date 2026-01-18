<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// route parente (/dofus)
const parentRoute = computed(() =>
  route.matched.find(r => r.name === 'dofus')
)

// onglets = enfants de /dofus
const tabs = computed(() => {
  if (!parentRoute.value?.children) return []

  return parentRoute.value.children.map(child => ({
    name: child.name as string,
    label: child.meta?.label as string,
  }))
})

// onglet actif
const isActive = (tabName: string) =>
  route.name === tabName

// navigation
const goTo = (tabName: string) => {
  if (route.name !== tabName) {
    router.push({ name: tabName })
  }
}
</script>

<template>
  <nav class="dofus-nav">
    <ul class="dofus-nav-list">
      <li
        v-for="tab in tabs"
        :key="tab.name"
        class="dofus-nav-item"
        :class="{ active: isActive(tab.name) }"
        @click="goTo(tab.name)"
      >
        {{ tab.label }}
      </li>
    </ul>
  </nav>

  <section class="dofus-content">
    <router-view />
  </section>
</template>

<style lang="scss" scoped>
.dofus-nav {
  position: fixed;
  top: var(--header-height, 56px);
  left: 0;
  right: 0;
  height: 52px;

  background-color: var(--pico-background-color);

  display: flex;
  justify-content: center;
  align-items: center;
}

.dofus-nav-list {
  display: flex;
  gap: 2.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dofus-nav-item {
  position: relative;
  cursor: pointer;

  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  color: var(--pico-muted-color);
  padding: 0.5rem 0;

  transition: color 0.2s ease;
}

.dofus-nav-item::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;

  width: 100%;
  height: 1px;

  background-color: var(--pico-primary);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s ease;
}

.dofus-nav-item:hover {
  color: var(--pico-color);
}

.dofus-nav-item.active {
  color: var(--pico-primary);
}

.dofus-nav-item.active::after {
  transform: scaleX(1);
}

.dofus-content {
  padding-top: calc(var(--header-height, 64px) + 52px + 1.5rem);
}
</style>
