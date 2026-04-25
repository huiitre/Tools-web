import { defineStore } from 'pinia';
import { useSnifferConfigStore } from '@/modules/Dofus/shared/snifferConfig.store';
import { useDofusStore } from '@/modules/Dofus/dofus.store';
import { IndexedDBBankAdapter } from './infrastructure/IndexedDBBankAdapter';
import { SyncBankService } from './application/services/SyncBankService';
import type { BankItem } from './domain/BankItem';
import type { RawBankItem } from './application/dtos/RawBankItem';
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices';

const repository = new IndexedDBBankAdapter();
const syncService = new SyncBankService(repository);

export const useBankManagementStore = defineStore('bankmanagement', {
  state: () => ({
    items: [] as BankItem[],
    lastSync: null as number | null,
    isListenerActive: false,
    isSyncing: false,
    
    // Buffer temporaire pour le sniffer
    rawBuffer: [] as RawBankItem[],
    isFullDumpPending: false,
    syncTimeout: null as any | null
  }),

  getters: {
    isSniffing(): boolean {
      const config = useSnifferConfigStore();
      return config.isSniffing && config.modules.bank;
    }
  },

  actions: {
    async init() {
      await this.loadFromDB();
      this.setupListener();
    },

    async loadFromDB() {
      const dofusStore = useDofusStore();
      const versionId = dofusStore.currentGameVersionId;
      const serverId = dofusStore.currentGameServerId;

      if (versionId && serverId) {
        this.items = await repository.getByServer(versionId, serverId);
        this.lastSync = await repository.getLastSync(versionId, serverId);

        // Refresh des prix
        const itemIds = this.items
          .map(i => i.metadata?.id)
          .filter((id): id is number => id !== undefined);
        
        if (itemIds.length > 0) {
          const { load } = useItemPrices();
          await load(itemIds);
        }
      }
    },

    setupListener() {
      if (this.isListenerActive || !window.electron) return;
      
      window.electron.onBankFullDump(() => {
        if (!this.isSniffing) return;
        this.isFullDumpPending = true;
      });

      window.electron.onBankItemCaptured((item: RawBankItem) => {
        if (!this.isSniffing) return;

        const capturedItems = Array.isArray(item) ? item : [item];
        this.rawBuffer.push(...capturedItems);

        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(async () => {
          await this.triggerSync();
        }, 1200);
      });
      
      this.isListenerActive = true;
    },

    async triggerSync() {
      const dofusStore = useDofusStore();
      const versionId = dofusStore.currentGameVersionId;
      const serverId = dofusStore.currentGameServerId;

      if (!versionId || !serverId || this.rawBuffer.length === 0) return;

      this.isSyncing = true;
      try {
        await syncService.sync(this.rawBuffer, versionId, serverId, this.isFullDumpPending);
        
        // Mettre à jour la date de synchro (uniquement si c'est un dump complet ou si on veut tracker chaque petite modif)
        // On décide de tracker chaque synchro réussie
        const now = Date.now();
        await repository.saveLastSync(versionId, serverId, now);
        this.lastSync = now;

        await this.loadFromDB();
        
        this.rawBuffer = [];
        this.isFullDumpPending = false;
      } finally {
        this.isSyncing = false;
        this.syncTimeout = null;
      }
    },

    async clearBank() {
      const dofusStore = useDofusStore();
      if (dofusStore.currentGameVersionId && dofusStore.currentGameServerId) {
        await repository.clearServer(dofusStore.currentGameVersionId, dofusStore.currentGameServerId);
        this.items = [];
        this.lastSync = null;
      }
    }
  }
});
