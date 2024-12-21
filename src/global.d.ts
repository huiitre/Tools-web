declare global {
  interface Window {
    google?: any;
  }
}

declare module '@vitejs/plugin-vue';

export {};