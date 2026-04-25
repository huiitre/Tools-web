const { execSync } = require('child_process');

function detectPotentialConnections() {
    try {
        const output = execSync('ss -4tpn').toString();
        const lines = output.split('\n');

        const { switcherService } = require('../ipc/switcher.ipc.cjs');
        const knownWindows = switcherService ? switcherService.getWindows() : [];

        const candidates = lines
            .filter(l => l.includes('ESTAB') && (l.toLowerCase().includes('dofus') || l.toLowerCase().includes('ankama')))
            .map(l => {
                const parts = l.trim().split(/\s+/);
                const localAddr = parts[3];  // Ton IP:Port local
                const remoteAddr = parts[4]; // IP:Port du serveur
                const processPart = parts[6] || ""; 

                if (!remoteAddr || !remoteAddr.includes(':')) return null;

                const remoteSep = remoteAddr.lastIndexOf(':');
                const ip = remoteAddr.substring(0, remoteSep).replace('[::ffff:', '').replace(']', '').trim();
                const port = remoteAddr.substring(remoteSep + 1).trim();

                if (ip === '127.0.0.1') return null;

                // Extraction du Port Local
                const localSep = localAddr.lastIndexOf(':');
                const localPort = localAddr.substring(localSep + 1).trim();

                let pid = null;
                const pidMatch = processPart.match(/pid=(\d+)/);
                if (pidMatch) pid = parseInt(pidMatch[1]);

                let processName = "Inconnu";
                if (pid) {
                    const window = knownWindows.find(w => w.pid === pid);
                    if (window && window.characterName) {
                        processName = window.characterName;
                    } else {
                        const binMatch = processPart.match(/"([^"]+)"/);
                        if (binMatch) processName = binMatch[1];
                    }
                }

                return {
                    ip,
                    port,
                    localPort, // On transmet le port local
                    processName: `${processName} (Port: ${localPort})`,
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
    if (!gameConn) gameConn = candidates[candidates.length - 1];

    return {
        remoteIp: gameConn.ip,
        remotePort: gameConn.port,
        localPort: gameConn.localPort // Inclus ici aussi
    };
}

module.exports = { getDofusConnection, detectPotentialConnections };