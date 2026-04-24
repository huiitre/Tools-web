const { spawn } = require('child_process');
const { getDofusConnection } = require('./SnifferDetector.cjs');

class SnifferService {
    constructor() {
        this.process = null;
        this.dataBuffer = '';
        this.parseTimeout = null;
    }

    start(onPriceCallback) {
        const config = getDofusConnection();
        if (!config) throw new Error("Dofus non détecté.");

        console.log("[DEBUG] Config trouvée :", config);

        const args = ['-i', 'any', '-A', '-l', '-nn', '-q', 'tcp', 'port', config.remotePort, 'and', 'host', config.remoteIp];
        
        this.process = spawn('tcpdump', args);

        this.process.stdout.on('data', (data) => {
            // On accumule le texte ASCII
            this.dataBuffer += data.toString('latin1');

            // On attend 50ms pour être sûr d'avoir le burst complet (les 50 items)
            clearTimeout(this.parseTimeout);
            this.parseTimeout = setTimeout(() => {
                this.processFullBuffer(onPriceCallback);
            }, 50); 
        });
    }

    processFullBuffer(onPriceCallback) {
        const ehlIndex = this.dataBuffer.indexOf('EHl');
        if (ehlIndex === -1) {
            this.dataBuffer = '';
            return;
        }

        const results = this.parseHDV(this.dataBuffer.substring(ehlIndex));
        if (results.length > 0) {
            onPriceCallback(results);
        }
        
        this.dataBuffer = '';
    }

    parseHDV(rawContent) {
        // 1. On split par pipe. SURTOUT PAS DE REPLACE ICI.
        const segments = rawContent.split('|');
        if (segments.length < 2) return [];

        // 2. Extraction PROPRE de l'itemId (uniquement les chiffres collés à EHl)
        const itemIdMatch = segments[0].match(/EHl(\d+)/);
        if (!itemIdMatch) return [];
        const itemId = parseInt(itemIdMatch[1]);

        const allInstances = [];

        // 3. On traite chaque ligne de l'HDV
        for (let i = 1; i < segments.length; i++) {
            const fields = segments[i].split(';');
            if (fields.length < 5) continue;

            // FONCTION DE NETTOYAGE CHIRURGICALE
            const cleanValue = (val) => {
                if (!val) return 0;
                // A. On prend ce qu'il y a AVANT la virgule (pour virer le flag ,0 ou ,1)
                const beforeComma = val.split(',')[0];
                // B. On vire les résidus de texte tcpdump (points, lettres)
                const digitsOnly = beforeComma.replace(/\D/g, '');
                const num = parseInt(digitsOnly);
                
                // Sécurité : si c'est l'itemId ou un nombre de baisé (> 1 milliard), c'est une erreur de parsing
                if (isNaN(num) || num === itemId || num > 1000000000) return 0;
                return num;
            };

            const p1 = cleanValue(fields[2]);
            const p10 = cleanValue(fields[3]);
            const p100 = cleanValue(fields[4]);

            if (p1 > 0 || p10 > 0 || p100 > 0) {
                allInstances.push({
                    itemId: itemId,
                    instanceId: fields[0].replace(/\D/g, ''), // Nettoyage de l'instanceId aussi
                    p1, p10, p100
                });
            }
        }
        return allInstances;
    }

    stop() {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.dataBuffer = '';
        }
    }
}

module.exports = new SnifferService();