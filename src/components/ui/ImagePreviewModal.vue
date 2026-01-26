<script setup lang="ts">
import { useImagePreview } from '@/composables/useImagePreview'

const { isOpen, imageUrl, imageAlt, close } = useImagePreview()
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="image-preview-overlay" @click="close">
      <img :src="imageUrl" :alt="imageAlt" class="image-preview-content" />
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  cursor: pointer;
}

.image-preview-content {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 0.5rem;
}
</style>