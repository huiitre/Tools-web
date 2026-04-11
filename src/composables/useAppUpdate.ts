import { ref } from 'vue'
import { updateService } from '@/services/update/update.service'

const updateAvailable = ref(false)

updateService.onUpdateAvailable(() => {
  updateAvailable.value = true
})

export function useAppUpdate() {
  return {
    updateAvailable,
    applyUpdate: () => updateService.applyUpdate(),
  }
}
