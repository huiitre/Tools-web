const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  onUpdateAvailable: (callback) => {
    // branché plus tard sur electron-updater
  },
  applyUpdate: () => {
    // branché plus tard sur electron-updater
  }
})
