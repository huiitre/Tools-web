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
})