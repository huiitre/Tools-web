const { spawn, execSync } = require('child_process');

class AutofocusService {
    constructor() {
        this.process = null;
        this.mapping = {};
        this.initiativeOrder = [];
        this.lastCharId = null;
        this.mainWindow = null;
        this.switcherService = null;
        this.interface = 'any'; // Par défaut 'any' pour plus de compatibilité
    }

    setMainWindow(window) {
        this.mainWindow = window;
    }

    setSwitcherService(service) {
        this.switcherService = service;
    }

    setMapping(mapping) {
        this.mapping = mapping || {};
        console.log("[Autofocus] Mapping mis à jour :", Object.keys(this.mapping).length, "personnages.");
    }

    getMapping() {
        return this.mapping;
    }

    start(config = {}) {
        if (this.process) this.stop();

        this.initiativeOrder = [];
        this.lastCharId = null;

        if (config.interface) this.interface = config.interface;
        if (config.mapping) this.mapping = config.mapping;

        console.log(`[Autofocus] Démarrage sur l'interface ${this.interface}...`);

        // Utilisation de tshark comme demandé
        const args = ['-i', this.interface, '-f', 'tcp port 5555', '-l', '-T', 'fields', '-e', 'data.data'];
        
        try {
            this.process = spawn('tshark', args);
        } catch (e) {
            console.error("[Autofocus] Erreur au lancement de tshark :", e);
            throw e;
        }

        this.process.stdout.on('data', (data) => {
            const line = data.toString().trim();
            if (!line) return;

            // Détection du mapping (paquets 6a626c)
            if (line.includes("6a626c")) {
                this.extractAndUpdateMapping(line);
                return;
            }

            // Détection de l'ordre d'initiative (paquets 697977)
            if (line.includes("697977")) {
                this.processInitiative(line);
                return;
            }

            // Détection du début de tour (paquets 6a6163)
            if (line.includes("6a6163")) {
                this.processTurn(line);
            }
        });

        this.process.stderr.on('data', (data) => {
            // Souvent des warnings tshark, on ne logge que si nécessaire
            // console.debug("[Autofocus TShark stderr]", data.toString());
        });

        this.process.on('exit', () => {
            console.log("[Autofocus] Processus tshark arrêté.");
            this.process = null;
        });
    }

    stop() {
        if (this.process) {
            console.log("[Autofocus] Arrêt du moteur (SIGTERM)...");
            this.process.kill('SIGTERM');
            this.process = null;
        }
        this.initiativeOrder = [];
        this.lastCharId = null;
        console.log("[Autofocus] Service stoppé et état réinitialisé.");
    }

    extractAndUpdateMapping(line) {
        const idx = line.indexOf("6a626c");
        if (idx === -1) return;
        
        const segment = line.substring(idx);
        const regex = /18(e082[a-f0-9]{6})22[0-9a-f]{2}0a[0-9a-f]{2}([0-9a-f]+?)20/g;
        let match;
        let updated = false;

        while ((match = regex.exec(segment)) !== null) {
            const id = match[1];
            const name = Buffer.from(match[2], 'hex').toString('utf8').trim();
            
            if (name.length > 0 && this.mapping[id] !== name) {
                this.mapping[id] = name;
                updated = true;
                console.log(`[Autofocus] Nouveau personnage détecté: ${id} -> ${name}`);
            }
        }

        if (updated && this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('autofocus:mapping-updated', this.mapping);
        }
    }

    processInitiative(line) {
        const idx = line.indexOf("697977");
        if (idx === -1) return;

        const segment = line.substring(idx);
        const ids = [];
        const regex = /0a0608(e082[a-f0-9]{6})/g;
        let match;

        while ((match = regex.exec(segment)) !== null) {
            if (this.mapping[match[1]] && !ids.includes(match[1])) {
                ids.push(match[1]);
            }
        }

        if (ids.length > 0) {
            const orderStr = ids.join(",");
            const currentStr = this.initiativeOrder.join(",");
            if (orderStr !== currentStr) {
                this.initiativeOrder = ids;
                this.lastCharId = null;
                console.log("[Autofocus] Ordre d'initiative:", ids.map(id => this.mapping[id]).join(" -> "));
                
                if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                    this.mainWindow.webContents.send('autofocus:initiative-updated', this.initiativeOrder);
                }
            }
        }
    }

    processTurn(line) {
        if (this.initiativeOrder.length === 0) return;

        const idxJ = line.indexOf("6a6163");
        if (idxJ === -1) return;

        const match = line.substring(idxJ).match(/e082[a-f0-9]{6}/);
        const charId = match ? match[0] : null;

        if (!charId || !this.mapping[charId]) return;
        if (charId === this.lastCharId) return;
        
        this.lastCharId = charId;

        const idx = this.initiativeOrder.indexOf(charId);
        if (idx === -1) return;

        // On cherche le personnage suivant dans l'ordre d'initiative
        const nextId = this.initiativeOrder[(idx + 1) % this.initiativeOrder.length];
        const windowName = this.mapping[nextId];

        console.log(`[Autofocus] ${this.mapping[charId]} finit -> focus ${windowName}`);

        setTimeout(() => {
            this.focusByName(windowName);
            
            // Synchronisation avec le SwitcherService
            if (this.switcherService) {
                try {
                    const wid = execSync(`xdotool search --name "^${windowName}$"`).toString().trim().split('\n')[0];
                    if (wid) {
                        this.switcherService.focusWindow(wid);
                        
                        // Notifier l'UI du Switcher du changement de fenêtre courante
                        const { getSwitcherWindow } = require('../windows/dofusSwitcher.cjs');
                        const swin = getSwitcherWindow();
                        if (swin && !swin.isDestroyed()) {
                            swin.webContents.send('switcher:current-changed', wid);
                        }
                    }
                } catch (e) {}
            }
        }, 150);
    }

    focusByName(name) {
        try {
            const wid = execSync(`xdotool search --name "^${name}$"`).toString().trim().split('\n')[0];
            if (wid) {
                execSync(`xdotool windowactivate ${wid}`);
            }
        } catch (e) {
            // Fenêtre non trouvée ou erreur xdotool
        }
    }
}

module.exports = new AutofocusService();
