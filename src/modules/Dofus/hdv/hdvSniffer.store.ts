import { defineStore } from 'pinia';
import { useFetchItemsByAssetIds, useMutationItemPrices } from '@/modules/Dofus/item/fetch/item.fetch';
import { ItemLight } from '@/modules/Dofus/item/types/item.types';
import { calculateAverageUnitPrice } from './utils/priceAverageCalculator';
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices';
import { useSnifferConfigStore } from '@/modules/Dofus/shared/snifferConfig.store';

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
    pendingPrices: new Map<number, number>(),
    fetchTimeout: null as any | null,
    error: null as string | null,
    isListenerActive: false,
    systemStatus: {
      tcpdumpInstalled: true,
      hasPermissions: true,
      checked: false
    }
  }),

  getters: {
    isSniffing(): boolean {
      const config = useSnifferConfigStore();
      return config.isSniffing && config.modules.hdv;
    }
  },

  actions: {
    async checkSystem() {
      const status = await window.electron?.checkSnifferRequirements();
      if (status) {
        this.systemStatus = { ...status, checked: true };
      }
      return this.systemStatus;
    },

    setupListener() {
      if (this.isListenerActive || !window.electron) return;
      
      window.electron.onSnifferData((data: any[]) => {
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
        this.queueCapture(itemId, averagePrice);
      });
      
      this.isListenerActive = true;
    },

    async processBatchTasks() {
      if (this.fetchTimeout) clearTimeout(this.fetchTimeout);
      this.fetchTimeout = setTimeout(async () => {
        const assetIdsToFetch = Array.from(this.pendingAssetIds).filter(id => !this.itemsMetadata[id]);
        const pricesSnapshot = Array.from(this.pendingPrices.entries());
        this.pendingAssetIds.clear();
        this.pendingPrices.clear();
        this.fetchTimeout = null;

        if (assetIdsToFetch.length > 0) {
          try {
            const { data } = await useFetchItemsByAssetIds(assetIdsToFetch);
            data.forEach(item => { this.itemsMetadata[item.assetId] = item; });
          } catch (e) { console.error('[SnifferStore] Metadata fetch error:', e); }
        }

        const priceBatch = pricesSnapshot
          .map(([assetId, price]) => {
            const meta = this.itemsMetadata[assetId];
            return meta ? { itemId: meta.id, price } : null;
          })
          .filter((p): p is { itemId: number; price: number } => p !== null);

        if (priceBatch.length > 0) {
          try {
            await useMutationItemPrices(priceBatch);
            const { refreshRecursive } = useItemPrices();
            await refreshRecursive(priceBatch.map(p => p.itemId));
          } catch (e) { console.error('[SnifferStore] Price sync error:', e); }
        }
      }, 2000);
    },

    async queueCapture(itemId: number, averagePrice: number) {
      if (!this.itemsMetadata[itemId]) this.pendingAssetIds.add(itemId);
      this.pendingPrices.set(itemId, averagePrice);
      this.processBatchTasks();
    }
  }
});
