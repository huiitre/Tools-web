const { execSync } = require('child_process');

function detectPotentialConnections() {
    try {
        const output = execSync('ss -4tpn').toString();
        const lines = output.split('\n');

        // On importe le switcherService dynamiquement pour éviter les dépendances circulaires
        const { switcherService } = require('../ipc/switcher.ipc.cjs');
        const knownWindows = switcherService ? switcherService.getWindows() : [];

        // On cherche toutes les connexions établies par des processus liés à Dofus ou Ankama
        const candidates = lines
            .filter(l => l.includes('ESTAB') && (l.toLowerCase().includes('dofus') || l.toLowerCase().includes('ankama')))
            .map(l => {
                const parts = l.trim().split(/\s+/);
                const remoteAddr = parts[4];
                const processPart = parts[6] || ""; 

                if (!remoteAddr || !remoteAddr.includes(':')) return null;

                const separator = remoteAddr.lastIndexOf(':');
                let ip = remoteAddr.substring(0, separator);
                ip = ip.replace('[::ffff:', '').replace(']', '').trim();
                const port = remoteAddr.substring(separator + 1).trim();

                if (ip === '127.0.0.1') return null;

                // Extraire le PID
                // Format ss: users:(("Dofus.exe",pid=1234,fd=5))
                let pid = null;
                const pidMatch = processPart.match(/pid=(\d+)/);
                if (pidMatch) pid = parseInt(pidMatch[1]);

                // Tenter de matcher avec une fenêtre connue via le PID
                let processName = "Inconnu";
                if (pid) {
                    const window = knownWindows.find(w => w.pid === pid);
                    if (window && window.characterName) {
                        processName = window.characterName;
                    } else {
                        // Fallback sur le nom du binaire si possible
                        const binMatch = processPart.match(/"([^"]+)"/);
                        if (binMatch) processName = binMatch[1];
                    }
                }

                return {
                    ip,
                    port,
                    processName,
                    isRecommended: port === "443" || port === "5555"
                };
            })
            .filter(c => c !== null);

        return candidates;
    } catch (error) {
        console.error("[Detector] Erreur scan :", error.message);
        return [];
    }
}

function getDofusConnection() {
    const candidates = detectPotentialConnections();
    if (candidates.length === 0) return null;

    let gameConn = candidates.find(c => c.isRecommended);

    if (!gameConn) {
        gameConn = candidates[candidates.length - 1];
    }

    return {
        remoteIp: gameConn.ip,
        remotePort: gameConn.port
    };
}

module.exports = { getDofusConnection, detectPotentialConnections };
