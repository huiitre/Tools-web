const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback)
  },
  applyUpdate: () => {
    ipcRenderer.send('apply-update')
  },
  openSwitcher: () => {
    ipcRenderer.invoke('switcher:open')
  },
  onSwitcherClosed: (callback) => ipcRenderer.on('switcher:closed', () => callback()),
  offSwitcherClosed: () => ipcRenderer.removeAllListeners('switcher:closed'),

  // Proxy
  startProxy: (config) => ipcRenderer.invoke('proxy:start', config),
  stopProxy: () => ipcRenderer.invoke('proxy:stop'),
  onProxyStatus: (callback) => ipcRenderer.on('proxy:status', (event, status) => callback(status)),
  onProxyHdvPrices: (callback) => ipcRenderer.on('proxy:hdv-prices', (event, data) => callback(data)),
  onProxyHdvCategory: (callback) => ipcRenderer.on('proxy:hdv-category', (event, data) => callback(data)),

  // Sniffer (Old)
  startSniffing: (forcedConfig = null) => ipcRenderer.invoke('sniffer:start', forcedConfig),
  stopSniffing: () => ipcRenderer.invoke('sniffer:stop'),
  onSnifferData: (callback) => ipcRenderer.on('sniffer:data', (event, data) => callback(data)),
  detectCandidates: () => ipcRenderer.invoke('sniffer:detect-candidates'),
  getActiveConfig: () => ipcRenderer.invoke('sniffer:get-active-config'),
  updateSnifferModules: (config) => ipcRenderer.invoke('sniffer:update-modules', config),
  checkSnifferRequirements: () => ipcRenderer.invoke('sniffer:check-requirements'),

  // Bank
  startBankSniffing: () => ipcRenderer.invoke('sniffer:bank-start'),
  stopBankSniffing: () => ipcRenderer.invoke('sniffer:bank-stop'),
  onBankItemsUpdate: (callback) => ipcRenderer.on('bank-items-update', (event, items) => callback(items)),
  onBankItemCaptured: (callback) => ipcRenderer.on('bank-item-captured', (event, item) => callback(item)),
  onBankFullDump: (callback) => ipcRenderer.on('bank-full-dump', (event) => callback()),
})
