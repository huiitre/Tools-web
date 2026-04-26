const hdvParser = require('./parsers/HDVParser.cjs');

class MessageDispatcher {
    constructor() {
        this.mainWindow = null;
    }

    setMainWindow(window) {
        this.mainWindow = window;
    }

    dispatch(message, session) {
        const prefix = message.substring(0, 3);
        let result = null;

        switch (prefix) {
            case 'EHl':
                result = hdvParser.parsePrices(message);
                if (result && this.mainWindow && !this.mainWindow.isDestroyed()) {
                    this.mainWindow.webContents.send('proxy:hdv-prices', result.data);
                }
                break;
            case 'EHL':
                result = hdvParser.parseCategory(message);
                if (result && this.mainWindow && !this.mainWindow.isDestroyed()) {
                    this.mainWindow.webContents.send('proxy:hdv-category', result.data);
                }
                break;
        }
    }
}

module.exports = new MessageDispatcher();
