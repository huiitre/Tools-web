<script setup lang="ts">
import AdminNav from '@/modules/Admin/shared/components/AdminNav.vue'
</script>

<template>
  <div id="admin">
    <AdminNav />

    <section class="admin-content">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </section>
  </div>
</template>

<style lang="scss" scoped>
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
