import { pwa } from "@/services/update/pwa"
import type { IUpdateService } from '@/services/update/IUpdateService'

export class WebUpdateService implements IUpdateService {
  onUpdateAvailable(callback: () => void): void {
    pwa.onNeedRefresh = callback
  }

  applyUpdate(): void {
    pwa.updateSW?.(true)
  }
}