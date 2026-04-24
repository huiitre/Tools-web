declare global {
  interface Window {
    google?: any
    electron?: {
      onUpdateAvailable: (callback: () => void) => void
      applyUpdate: () => void
      openSwitcher: () => void
      onSwitcherClosed: (callback: () => void) => void
      offSwitcherClosed: () => void
      startSniffing: () => Promise<{ success: boolean; error?: string }>;
      stopSniffing: () => Promise<{ success: boolean }>;
      onSnifferData: (callback: (data: any[]) => void) => void;
      checkSnifferRequirements: () => Promise<{ tcpdumpInstalled: boolean; hasPermissions: boolean } | null>;
    }
    switcher?: {
      scan: () => Promise<DofusWindow[]>
      focusNext: () => Promise<void>
      focusPrev: () => Promise<void>
      focusWindow: (windowId: string) => Promise<void>
      setEnabled: (windowId: string, enabled: boolean) => Promise<DofusWindow[]>
      setOrder: (windowIds: string[]) => Promise<DofusWindow[]>
      renameWindow: (windowId: string, name: string) => Promise<DofusWindow[]>
      getWindows: () => Promise<DofusWindow[]>
      getCurrent: () => Promise<string | null>
      configureHotkeys: (config: { prevKeycode: number | null; nextKeycode: number | null; debounce: number }) => Promise<void>
      startHotkeys: () => Promise<void>
      stopHotkeys: () => Promise<void>
      captureKey: () => Promise<number>
      onCurrentChanged: (callback: (windowId: string | null) => void) => void
      offCurrentChanged: () => void
    }
  }

  interface DofusWindow {
    windowId: string
    pid: number
    characterName: string | null
    enabled: boolean
  }
}

declare module '@vitejs/plugin-vue';

export {};