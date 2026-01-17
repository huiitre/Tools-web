// src/composables/useScreen.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useScreen() {
  const isDesktop = ref(window.innerWidth >= 1024)

  const onResize = () => {
    isDesktop.value = window.innerWidth >= 1024
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))

  return { isDesktop }
}
