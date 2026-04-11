declare global {
  interface Window {
    google?: any;
    electron?: {
      onUpdateAvailable: (callback: () => void) => void
      applyUpdate: () => void
    }
  }
}

declare module '@vitejs/plugin-vue';

export {};