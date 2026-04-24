const { execSync } = require('child_process');

function checkRequirements() {
    const results = {
        tcpdumpInstalled: false,
        hasPermissions: false,
        error: null
    };

    try {
        // 1. Vérifier si tcpdump est installé
        try {
            execSync('which tcpdump');
            results.tcpdumpInstalled = true;
        } catch (e) {
            results.tcpdumpInstalled = false;
        }

        // 2. Vérifier les permissions (setcap)
        if (results.tcpdumpInstalled) {
            const capOutput = execSync('getcap $(which tcpdump)').toString();
            // On vérifie si la ligne contient les bonnes capabilities
            if (capOutput.includes('cap_net_admin') && capOutput.includes('cap_net_raw')) {
                results.hasPermissions = true;
            }
        }
    } catch (err) {
        results.error = err.message;
    }

    return results;
}

module.exports = { checkRequirements };