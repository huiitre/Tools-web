const net = require('net');
const ProxySession = require('./ProxySession.cjs');
const trafficRedirector = require('./TrafficRedirector.cjs');
const messageDispatcher = require('./MessageDispatcher.cjs');

class ProxyService {
    constructor() {
        this.server = null;
        this.gameServers = new Map(); // Port local -> { ip, port }
        this.sessions = new Set();
        this.mainWindow = null;
        this.config = {
            localPort: 5558,
            remoteIp: '34.253.140.241', 
            remotePort: 443,
            manualMode: false,
            modules: { hdvAuto: true, hdvManual: true, bank: true }
        };
    }

    setMainWindow(window) {
        this.mainWindow = window;
        messageDispatcher.setMainWindow(window);
    }

    async start(customConfig = null) {
        if (this.server) await this.stop();
        
        if (customConfig) {
            this.config = { ...this.config, ...customConfig };
        }

        return new Promise((resolve, reject) => {
            this.server = net.createServer((socket) => {
                this._createSession(socket, this.config.remoteIp, this.config.remotePort);
            });

            this.server.listen(this.config.localPort, '127.0.0.1', async () => {
                console.log(`[ProxyService] Serveur Login sur 127.0.0.1:${this.config.localPort}`);
                try {
                    const target = this.config.manualMode ? this.config.remoteIp : null;
                    await trafficRedirector.enable(target, this.config.remotePort, this.config.localPort);
                    this._updateStatus();
                    resolve({ success: true });
                } catch (err) {
                    await this.stop();
                    reject(err);
                }
            });

            this.server.on('error', (err) => reject(err));
        });
    }

    updateModules(modules) {
        this.config.modules = modules;
        console.log('[ProxyService] Mise à jour des modules pour toutes les sessions');
        for (const session of this.sessions) {
            session.setModules(modules);
        }
    }

    _createSession(socket, targetIp, targetPort) {
        const session = new ProxySession(socket, targetIp, targetPort);
        session.setModules(this.config.modules);
        this.sessions.add(session);
        
        session.on('message', (msg) => {
            if (msg.startsWith('AYK')) {
                this._handleServerSwitch(msg, session);
            }
            messageDispatcher.dispatch(msg, session);
        });

        session.on('scan-progress', (progress) => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('proxy:scan-progress', progress);
            }
        });

        session.on('disconnected', () => {
            this.sessions.delete(session);
            this._updateStatus();
        });

        this._updateStatus();
    }

    async _handleServerSwitch(msg, session) {
        const parts = msg.substring(3).split(';');
        if (parts.length < 2) return;
        const remoteIp = parts[0];
        const remotePort = parseInt(parts[1]);
        const localPort = 5556 + this.gameServers.size;
        const gameServer = net.createServer((socket) => {
            this._createSession(socket, remoteIp, remotePort);
        });
        gameServer.listen(localPort, '127.0.0.1', () => {
            this.gameServers.set(localPort, gameServer);
            const forgedAyk = `AYK127.0.0.1;${localPort};${parts[2] || ''}`;
            session.injectRaw(forgedAyk);
        });
    }

    async stop() {
        await trafficRedirector.disable();
        for (const session of this.sessions) session.destroy();
        this.sessions.clear();
        for (const [port, server] of this.gameServers) server.close();
        this.gameServers.clear();
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    this.server = null;
                    this._updateStatus();
                    resolve();
                });
            });
        }
    }

    _updateStatus() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('proxy:status', {
                active: !!this.server,
                connections: this.sessions.size,
                config: {
                    ...this.config,
                    remoteIp: this.config.manualMode ? this.config.remoteIp : "Automatique (Plages Ankama)"
                }
            });
        }
    }
}

module.exports = new ProxyService();
