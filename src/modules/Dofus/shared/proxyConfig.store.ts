import { defineStore } from 'pinia';
import { toRaw } from 'vue';

export interface ProxyConfig {
  remoteIp: string;
  remotePort: string;
  localPort: string;
  forceManual: boolean;
}

export interface ProxyStatus {
  active: boolean;
  connections: number;
  config: any;
}

export const useProxyConfigStore = defineStore('proxyConfig', {
  state: () => ({
    config: {
      remoteIp: '34.253.140.241',
      remotePort: '443',
      localPort: '5555',
      forceManual: false
    } as ProxyConfig,
    status: {
      active: false,
      connections: 0,
      config: null
    } as ProxyStatus,
    candidates: [] as any[],
    isScanning: false
  }),

  actions: {
    hydrate() {
      const stored = localStorage.getItem('proxy.config');
      if (stored) {
        this.config = JSON.parse(stored);
      }
      
      if (window.electron) {
        window.electron.onProxyStatus((status: ProxyStatus) => {
          this.status = status;
          // On synchronise l'IP réelle affichée avec celle reçue du proxy si actif
          if (status.active && status.config) {
            this.config.remoteIp = status.config.remoteIp;
          }
        });
      }
    },

    async toggleProxy() {
      if (!window.electron) return;
      
      if (this.status.active) {
        await window.electron.stopProxy();
      } else {
        const config = toRaw(this.config);
        const result = await window.electron.startProxy({
            remoteIp: config.remoteIp,
            remotePort: parseInt(config.remotePort),
            localPort: parseInt(config.localPort),
            manualMode: config.forceManual // On passe le mode manuel ici
        });
        if (!result.success && result.error) {
            console.error('[ProxyStore] Erreur démarrage:', result.error);
        }
      }
    },

    saveConfig(ip: string, port: string, localPort: string, force: boolean) {
      this.config = { remoteIp: ip, remotePort: port, localPort, forceManual: force };
      localStorage.setItem('proxy.config', JSON.stringify(this.config));
    },

    async scan() {
      if (!window.electron) return;
      this.isScanning = true;
      try {
        this.candidates = await window.electron.detectCandidates();
      } finally {
        this.isScanning = false;
      }
    }
  }
});
