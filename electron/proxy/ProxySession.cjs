const net = require('net');
const EventEmitter = require('events');

class ProxySession extends EventEmitter {
    constructor(clientSocket, remoteHost, remotePort) {
        super();
        this.clientSocket = clientSocket;
        this.remoteHost = remoteHost;
        this.remotePort = remotePort;
        this.serverSocket = null;
        
        this.serverBuffer = "";
        this.lastBlob = "";
        
        this.isDestroyed = false;
        
        this._setup();
    }

    _setup() {
        this.clientSocket.setNoDelay(true);
        
        // On utilise un port source aléatoire dans une plage réservée (60000-60100)
        // pour que iptables puisse nous laisser passer sans boucler.
        const localPort = 60000 + Math.floor(Math.random() * 100);

        this.serverSocket = net.connect({
            host: this.remoteHost,
            port: this.remotePort,
            localPort: localPort
        }, () => {
            this.serverSocket.setNoDelay(true);
            this.emit('connected');
        });

        this.serverSocket.on('error', (err) => {
            console.error(`[ProxySession] Erreur socket serveur : ${err.message}`);
            this.destroy();
        });

        // Data Client -> Serveur
        this.clientSocket.on('data', (data) => {
            if (this.isDestroyed) return;
            
            const raw = data.toString('latin1');
            const sigMatch = raw.match(/(Ã¹.*?Ã¹)/);
            if (sigMatch) {
                this.lastBlob = sigMatch[1].replace(/Ã¹/g, '').substring(24);
            }
            
            if (this.serverSocket.writable) {
                this.serverSocket.write(data);
            }
        });

        // Data Serveur -> Client
        this.serverSocket.on('data', (data) => {
            if (this.isDestroyed) return;

            const rawChunk = data.toString('latin1');
            this.serverBuffer += rawChunk;

            let messages = this.serverBuffer.split('\0');
            this.serverBuffer = messages.pop();

            for (let msg of messages) {
                if (!msg) continue;
                const cleanMsg = msg.replace(/^Ã¹.*?Ã¹/, '');
                this.emit('message', cleanMsg);
            }

            if (this.clientSocket.writable) {
                this.clientSocket.write(data);
            }
        });

        const onClose = () => this.destroy();
        this.clientSocket.on('error', onClose);
        this.clientSocket.on('close', onClose);
        this.serverSocket.on('close', onClose);
    }

    inject(packetContent, b64Hash) {
        if (!this.lastBlob || !this.serverSocket.writable) return false;
        
        const forgedPacket = `Ã¹${b64Hash}${this.lastBlob}Ã¹${packetContent}\n\0`;
        this.serverSocket.write(forgedPacket, 'latin1');
        return true;
    }

    /**
     * Injecte un paquet brut vers le client (ex: pour la redirection de serveur AYK)
     */
    injectRaw(packetContent) {
        if (this.clientSocket.writable) {
            this.clientSocket.write(packetContent + '\0', 'latin1');
        }
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        
        if (this.clientSocket) this.clientSocket.destroy();
        if (this.serverSocket) this.serverSocket.destroy();
        
        this.emit('disconnected');
    }
}

module.exports = ProxySession;
