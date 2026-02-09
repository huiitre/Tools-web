import { ref } from 'vue'

const isOpen = ref(false)
const imageUrl = ref('')
const imageAlt = ref('')

export const useImagePreview = () => {
  const open = (url: string, alt = '') => {
    imageUrl.value = url
    imageAlt.value = alt
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    imageUrl.value = ''
    imageAlt.value = ''
  }

  return {
    isOpen,
    imageUrl,
    imageAlt,
    open,
    close,
  }
}