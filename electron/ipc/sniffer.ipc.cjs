const { ipcMain, BrowserWindow } = require('electron');
const snifferService = require('../sniffer/SnifferService.cjs');
const { checkRequirements } = require('../sniffer/SnifferDoctor.cjs'); // On importe le vérificateur

function registerSnifferIpc() {
    // 1. Vérification des prérequis (tcpdump + permissions)
    ipcMain.handle('sniffer:check-requirements', async () => {
        try {
            return checkRequirements();
        } catch (error) {
            return { tcpdumpInstalled: false, hasPermissions: false, error: error.message };
        }
    });

    // 2. Démarrage du sniffer
    ipcMain.handle('sniffer:start', async () => {
        try {
            snifferService.start((data) => {
                // On récupère la fenêtre principale dynamiquement
                const win = BrowserWindow.getAllWindows()[0]; 
                if (win && !win.isDestroyed()) {
                    win.webContents.send('sniffer:data', data);
                }
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // 3. Arrêt du sniffer
    ipcMain.handle('sniffer:stop', () => {
        snifferService.stop();
        return { success: true };
    });
}

module.exports = { registerSnifferIpc };