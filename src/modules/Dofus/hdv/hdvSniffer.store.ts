import { defineStore } from 'pinia';
import { useFetchItemsByAssetIds, useMutationItemPrices } from '@/modules/Dofus/item/fetch/item.fetch';
import { ItemLight } from '@/modules/Dofus/item/types/item.types';
import { calculateAverageUnitPrice } from './utils/priceAverageCalculator';
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices';

export interface SnifferCapture {
  id: string;
  itemId: number;
  timestamp: number;
  instances: any[];
  averagePrice: number;
}

export const useHdvSnifferStore = defineStore('hdvSniffer', {
  state: () => ({
    isSniffing: false,
    captures: [] as SnifferCapture[], 
    itemsMetadata: {} as Record<number, ItemLight>,
    pendingAssetIds: new Set<number>(),
    pendingPrices: new Map<number, number>(), // itemId -> averagePrice
    fetchTimeout: null as any | null,
    error: null as string | null,
    isListenerActive: false,
    systemStatus: {
      tcpdumpInstalled: true,
      hasPermissions: true,
      checked: false
    }
  }),

  actions: {
    async checkSystem() {
      const status = await window.electron?.checkSnifferRequirements();
      if (status) {
        this.systemStatus = { ...status, checked: true };
      }
      return this.systemStatus;
    },

    async processBatchTasks() {
      if (this.fetchTimeout) clearTimeout(this.fetchTimeout);

      this.fetchTimeout = setTimeout(async () => {
        // 1. Snapshot des files d'attente pour libérer le store immédiatement
        const assetIdsToFetch = Array.from(this.pendingAssetIds).filter(id => !this.itemsMetadata[id]);
        const pricesSnapshot = Array.from(this.pendingPrices.entries());
        
        // On vide tout de suite les files d'attente du store
        this.pendingAssetIds.clear();
        this.pendingPrices.clear();
        this.fetchTimeout = null;

        // 2. Fetch Metadata (si nécessaire) - on attend la réponse pour avoir les IDs
        if (assetIdsToFetch.length > 0) {
          try {
            const { data } = await useFetchItemsByAssetIds(assetIdsToFetch);
            data.forEach(item => {
              this.itemsMetadata[item.assetId] = item;
            });
          } catch (e) {
            console.error('[SnifferStore] Metadata fetch error:', e);
          }
        }

        // 3. Préparation et envoi des prix (non bloquant pour le store)
        const priceBatch = pricesSnapshot
          .map(([assetId, price]) => {
            const meta = this.itemsMetadata[assetId];
            return meta ? { itemId: meta.id, price } : null;
          })
          .filter((p): p is { itemId: number; price: number } => p !== null);

        if (priceBatch.length > 0) {
          try {
            await useMutationItemPrices(priceBatch);
            console.log(`[SnifferStore] 💰 ${priceBatch.length} prix synchronisés (ID Database)`);

            // 4. Mise à jour du cache local et récursion des crafts
            const { refreshRecursive } = useItemPrices();
            await refreshRecursive(priceBatch.map(p => p.itemId));
            
          } catch (e) {
            console.error('[SnifferStore] Price sync error:', e);
          }
        }
      }, 2000);
    },

    async queueCapture(itemId: number, averagePrice: number) {
      if (!this.itemsMetadata[itemId]) {
        this.pendingAssetIds.add(itemId);
      }
      
      // On stocke/écrase le dernier prix moyen calculé pour cet item
      this.pendingPrices.set(itemId, averagePrice);
      
      // On (re)lance le chrono de 2 secondes à chaque clic
      this.processBatchTasks();
    },

    async start() {
      this.error = null;
      const response = await window.electron?.startSniffing();
      
      if (response?.success) {
        this.isSniffing = true;

        if (!this.isListenerActive) {
          window.electron?.onSnifferData((data: any[]) => {
            if (!data || data.length === 0) return;
            
            const itemId = data[0].itemId;
            const averagePrice = calculateAverageUnitPrice(data);
            
            const capture: SnifferCapture = {
              id: `${Date.now()}-${Math.random()}`,
              itemId,
              timestamp: Date.now(),
              instances: data,
              averagePrice
            };

            this.captures = [capture, ...this.captures].slice(0, 50);
            
            // On gère la file d'attente metadata + prix
            this.queueCapture(itemId, averagePrice);
          });
          this.isListenerActive = true;
        }
      } else {
        this.error = response?.error || "Erreur inconnue";
      }
    },

    async stop() {
      await window.electron?.stopSniffing();
      this.isSniffing = false;
    }
  }
});
