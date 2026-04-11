import { pwa } from "@/services/update/pwa"
import type { IUpdateService } from '@/services/update/IUpdateService'

export class WebUpdateService implements IUpdateService {
  onUpdateAvailable(callback: () => void): void {
    pwa.onNeedRefresh = callback
  }

  applyUpdate(): void {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        reg.waiting.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') {
            window.location.reload()
          }
        })
      } else {
        window.location.reload()
      }
    })
  }
}