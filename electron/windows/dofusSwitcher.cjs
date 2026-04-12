const { BrowserWindow } = require('electron')
const path = require('path')

let switcherWindow = null

function createSwitcherWindow() {
  if (switcherWindow && !switcherWindow.isDestroyed()) {
    switcherWindow.focus()
    return switcherWindow
  }

  switcherWindow = new BrowserWindow({
    width: 360,
    height: 600,
    minWidth: 300,
    minHeight: 400,
    alwaysOnTop: true,
    title: 'Dofus Switcher',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preloads', 'switcher.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const isDev = process.env.ELECTRON_DEV === 'true'
  if (isDev) {
    switcherWindow.loadURL('http://localhost:5173/#/dofus-switcher')
  } else {
    switcherWindow.loadFile(
      path.join(__dirname, '..', '..', 'dist', 'index.html'),
      { hash: '/dofus-switcher' }
    )
  }

  switcherWindow.webContents.on('did-finish-load', () => {
    switcherWindow.setTitle('Dofus Switcher')
  })

  switcherWindow.on('closed', () => {
    switcherWindow = null
    const { BrowserWindow } = require('electron')
    const mainWindow = BrowserWindow.getAllWindows().find(w => w !== switcherWindow)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('switcher:closed')
    }
  })


  return switcherWindow
}

function getSwitcherWindow() {
  return switcherWindow
}

module.exports = { createSwitcherWindow, getSwitcherWindow }