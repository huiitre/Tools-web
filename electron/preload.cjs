const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback)
  },
  applyUpdate: () => {
    ipcRenderer.send('apply-update')
  }
})
