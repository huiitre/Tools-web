const { ipcMain, BrowserWindow } = require('electron');
const autofocusService = require('../sniffer/AutofocusService.cjs');

function registerAutofocusIpc(switcherService) {
    autofocusService.setSwitcherService(switcherService);
    
    ipcMain.handle('autofocus:start', async (_, config) => {
        try {
            const win = BrowserWindow.getAllWindows()[0];
            if (win) {
                autofocusService.setMainWindow(win);
            }
            autofocusService.start(config);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('autofocus:stop', async () => {
        autofocusService.stop();
        return { success: true };
    });

    ipcMain.handle('autofocus:set-mapping', async (_, mapping) => {
        autofocusService.setMapping(mapping);
        return { success: true };
    });

    ipcMain.handle('autofocus:get-mapping', async () => {
        return autofocusService.getMapping();
    });
}

module.exports = { registerAutofocusIpc };
