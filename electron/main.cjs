const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const { createSwitcherWindow } = require('./windows/dofusSwitcher.cjs')
const { registerSwitcherIpc } = require('./ipc/switcher.ipc.cjs')
const { registerSnifferIpc } = require('./ipc/sniffer.ipc.cjs')
const { registerProxyIpc } = require('./ipc/proxy.ipc.cjs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 960,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  const isDev = process.env.ELECTRON_DEV === 'true'

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
    win.webContents.on('devtools-opened', () => {
      win.webContents.closeDevTools()
    })

    autoUpdater.on('checking-for-update', () => {
      console.log('[updater] Vérification des mises à jour...')
    })

    autoUpdater.on('update-available', (info) => {
      console.log('[updater] Mise à jour disponible :', info.version)
      win.webContents.send('update-available')
    })

    autoUpdater.on('update-not-available', (info) => {
      console.log('[updater] Pas de mise à jour. Version actuelle :', info.version)
    })

    autoUpdater.on('error', (err) => {
      console.error('[updater] Erreur :', err.message)
    })

    autoUpdater.on('download-progress', (progress) => {
      console.log(`[updater] Téléchargement : ${Math.round(progress.percent)}%`)
    })

    autoUpdater.on('update-downloaded', (info) => {
      console.log('[updater] Mise à jour téléchargée :', info.version)
    })

    ipcMain.on('apply-update', () => {
      console.log('[updater] Installation...')
      autoUpdater.quitAndInstall()
    })

    autoUpdater.checkForUpdates()
  }

  ipcMain.handle('switcher:open', () => {
    createSwitcherWindow()
  })
}

app.commandLine.appendSwitch('disable-features', 'ServiceWorker')

app.whenReady().then(() => {
  registerSwitcherIpc()
  registerSnifferIpc()
  registerProxyIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
