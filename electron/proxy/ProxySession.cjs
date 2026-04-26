const net = require('net');
const EventEmitter = require('events');
const crypto = require('crypto');

class ProxySession extends EventEmitter {
    constructor(clientSocket, remoteHost, remotePort) {
        super();
        this.clientSocket = clientSocket;
        this.remoteHost = remoteHost;
        this.remotePort = remotePort;
        this.serverSocket = null;
        this.serverBuffer = "";
        this.lastBlob = "";
        this.itemQueue = [];
        this.autoRequestedIds = new Set(); // Pour identifier ce que le proxy demande
        this.totalInQueue = 0;
        this.currentProcessed = 0;
        this.isProcessing = false;
        this.isDestroyed = false;
        this.modules = { hdvAuto: true, hdvManual: true, bank: true };
        this._setup();
    }

    setModules(modules) {
        this.modules = modules;
        console.log('[ProxySession] Configuration modules :', modules);
    }

    _setup() {
        this.clientSocket.setNoDelay(true);
        const localPort = 60000 + Math.floor(Math.random() * 100);
        this.serverSocket = net.connect({ host: this.remoteHost, port: this.remotePort, localPort: localPort }, () => {
            this.serverSocket.setNoDelay(true);
            this.emit('connected');
        });

        this.serverSocket.on('error', () => this.destroy());

        // TRAFIC CLIENT -> SERVEUR (Manuel)
        this.clientSocket.on('data', (data) => {
            if (this.isDestroyed) return;
            const raw = data.toString('latin1');
            const sigMatch = raw.match(/(Ã¹.*?Ã¹)/);
            if (sigMatch) this.lastBlob = sigMatch[1].replace(/Ã¹/g, '').substring(24);
            
            if (raw.includes('EV')) { 
                this.itemQueue = []; 
                this.autoRequestedIds.clear();
                this.totalInQueue = 0; 
                this.currentProcessed = 0; 
            }

            if (this.serverSocket.writable) this.serverSocket.write(data);
        });

        // TRAFIC SERVEUR -> CLIENT (Réponses)
        this.serverSocket.on('data', (data) => {
            if (this.isDestroyed) return;
            this.serverBuffer += data.toString('latin1');
            let messages = this.serverBuffer.split('\0');
            this.serverBuffer = messages.pop();

            for (let rawMessage of messages) {
                if (!rawMessage) continue;
                const cleanMsg = rawMessage.replace(/^Ã¹.*?Ã¹/, '');
                if (cleanMsg.startsWith('AYK')) { this.emit('message', cleanMsg); continue; }

                // Réception liste catégorie
                if (cleanMsg.startsWith('EHL')) {
                    if (this.modules.hdvAuto) this._handleCategoryMessage(cleanMsg);
                }

                // Réception prix
                if (cleanMsg.startsWith('EHl')) {
                    const idMatch = cleanMsg.match(/EHl(\d+)/);
                    const id = idMatch ? parseInt(idMatch[1]) : null;
                    
                    const wasRequestedByAuto = id && this.autoRequestedIds.has(id);

                    // LOGIQUE DE FILTRAGE PAR SWITCHS
                    let shouldDispatch = false;
                    if (wasRequestedByAuto) {
                        if (this.modules.hdvAuto) shouldDispatch = true;
                        this.autoRequestedIds.delete(id); // On libère l'ID après réception
                    } else {
                        if (this.modules.hdvManual) shouldDispatch = true;
                    }

                    if (shouldDispatch) {
                        this.emit('message', cleanMsg);
                    }
                } else {
                    this.emit('message', cleanMsg);
                }

                if (this.clientSocket.writable) this.clientSocket.write(rawMessage + '\0', 'latin1');
            }
        });

        const onClose = () => this.destroy();
        this.clientSocket.on('error', onClose);
        this.clientSocket.on('close', onClose);
        this.serverSocket.on('close', onClose);
    }

    _handleCategoryMessage(message) {
        const content = message.split('|')[1];
        if (!content) return;
        const ids = content.split(';').filter(id => id.length > 0).map(id => parseInt(id));
        this.itemQueue = ids;
        this.totalInQueue = ids.length;
        this.currentProcessed = 0;
        this._processQueue();
    }

    async _processQueue() {
        if (this.isProcessing || this.itemQueue.length === 0) return;
        this.isProcessing = true;

        while (this.itemQueue.length > 0) {
            if (this.isDestroyed || !this.modules.hdvAuto) break;
            if (!this.lastBlob) { await new Promise(r => setTimeout(r, 1000)); continue; }

            const id = this.itemQueue.shift();
            this.autoRequestedIds.add(id); // On enregistre que c'est une demande Auto
            
            const packetContent = `EHl${id}`;
            const hash = crypto.createHash('md5').update(packetContent + "cC+*#!$pie").digest('hex');
            const b64Hash = Buffer.from(hash, 'hex').toString('base64');
            const forgedPacket = `Ã¹${b64Hash}${this.lastBlob}Ã¹${packetContent}\n\0`;
            
            if (this.serverSocket.writable) {
                this.serverSocket.write(forgedPacket, 'latin1');
                this.emit('scan-progress', { 
                    current: ++this.currentProcessed, 
                    total: this.totalInQueue,
                    remaining: this.itemQueue.length 
                });
            }
            await new Promise(r => setTimeout(r, 200));
        }
        this.isProcessing = false;
    }

    injectRaw(packetContent) { if (this.clientSocket.writable) this.clientSocket.write(packetContent + '\0', 'latin1'); }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.itemQueue = [];
        this.autoRequestedIds.clear();
        if (this.clientSocket) this.clientSocket.destroy();
        if (this.serverSocket) this.serverSocket.destroy();
        this.emit('disconnected');
    }
}

module.exports = ProxySession;
