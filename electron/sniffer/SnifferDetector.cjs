const { execSync } = require('child_process');

function getDofusConnection() {
    try {
        // -4 pour l'IPv4, -t pour TCP, -p pour le process, -n pour les chiffres
        const output = execSync('ss -4tpn').toString();
        const lines = output.split('\n');
        
        // On cherche la ligne du jeu
        const candidates = lines.filter(l => 
            l.includes('ESTAB') && 
            (l.toLowerCase().includes('dofus') || l.toLowerCase().includes('ankama'))
        );

        if (candidates.length === 0) return null;

        // On prend la dernière connexion active
        const lastLine = candidates[candidates.length - 1];
        const parts = lastLine.trim().split(/\s+/);
        
        // Dans 'ss', il y a deux colonnes avec IP:Port
        // La 4ème (index 3) c'est LOCAL (Toi)
        // La 5ème (index 4) c'est PEER (Le serveur)
        // On va filtrer intelligemment pour prendre celle qui n'est pas une IP privée
        const remoteAddr = parts.find(p => 
            p.includes('.') && 
            p.includes(':') && 
            !p.startsWith('127.') && 
            !p.startsWith('192.168.') && // On dégage ton IP locale
            !p.startsWith('10.') &&
            !p.startsWith('172.')
        );

        if (!remoteAddr) {
            // Si on n'a rien trouvé avec le filtre, on tente de prendre la colonne 5 par défaut
            // qui est statistiquement la "Peer Address" dans ss
            const fallback = parts[4] || parts[3]; 
            if (!fallback || !fallback.includes(':')) return null;
            return formatResult(fallback);
        }

        return formatResult(remoteAddr);
    } catch (error) {
        return null;
    }
}

function formatResult(addr) {
    const separator = addr.lastIndexOf(':');
    return {
        remoteIp: addr.substring(0, separator).replace('[::ffff:', '').replace(']', '').trim(),
        remotePort: addr.substring(separator + 1).trim()
    };
}

module.exports = { getDofusConnection };