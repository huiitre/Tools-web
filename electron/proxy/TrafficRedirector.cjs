const { exec } = require('child_process');
const os = require('os');

class TrafficRedirector {
    constructor() {
        this.platform = os.platform();
        this.activeRules = [];
    }

    async enable(targetIp, targetPort, localPort) {
        // Au démarrage, on commence par purger tout ce qui aurait pu rester d'une session précédente
        await this.disable();

        if (this.platform === 'linux') {
            return this._enableLinux(targetIp, targetPort, localPort);
        } else if (this.platform === 'win32') {
            return this._enableWindows(targetIp, targetPort, localPort);
        }
        throw new Error(`Plateforme non supportée : ${this.platform}`);
    }

    async disable() {
        if (this.platform === 'linux') {
            const uid = process.getuid();
            // On purge TOUTES les règles NAT OUTPUT qui appartiennent à notre UID
            // C'est radical mais c'est la seule façon d'être sûr de ne pas laisser de merde
            try {
                // On récupère les numéros de ligne pour ne pas supprimer les règles d'autres apps
                const listCmd = `iptables -t nat -L OUTPUT --line-numbers -n | grep "owner UID match ${uid}" | awk '{print $1}' | tac`;
                const script = `
                    lines=$(${listCmd})
                    for line in $lines; do
                        iptables -t nat -D OUTPUT $line
                    done
                `;
                await this._runCommand(`pkexec sh -c "${script}"`);
            } catch (err) {
                // Si aucune règle n'existe, grep va renvoyer une erreur, on ignore
            }
        } else if (this.platform === 'win32') {
            for (const rule of this.activeRules) {
                if (rule.port) {
                    await this._runCommand(`netsh interface portproxy delete v4tov4 listenaddress=127.0.0.1 listenport=${rule.port}`);
                }
            }
        }
        this.activeRules = [];
    }

    _enableLinux(targetIpOrCidr, targetPort, localPort) {
        const uid = process.getuid();
        // Plages englobant tout le pool Ankama en Irlande (AWS eu-west-1)
        const targets = targetIpOrCidr ? [targetIpOrCidr] : ['18.200.0.0/15', '34.240.0.0/12'];
        
        return new Promise(async (resolve, reject) => {
            try {
                let commands = [];
                for (const target of targets) {
                    const redirectRule = `-p tcp -d ${target} --dport ${targetPort} -m owner --uid-owner ${uid} -j REDIRECT --to-ports ${localPort}`;
                    const bypassRule = `-p tcp -d ${target} --dport ${targetPort} -m owner --uid-owner ${uid} --sport 60000:60100 -j RETURN`;
                    
                    // L'ordre est crucial : d'abord le REDIRECT, puis le BYPASS par dessus (INSERT à la position 1)
                    commands.push(`iptables -t nat -I OUTPUT ${redirectRule}`);
                    commands.push(`iptables -t nat -I OUTPUT ${bypassRule}`);
                    
                    this.activeRules.push(redirectRule);
                    this.activeRules.push(bypassRule);
                }

                await this._runCommand(`pkexec sh -c "${commands.join(' && ')}"`);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    _enableWindows(targetIp, targetPort, localPort) {
        return new Promise((resolve, reject) => {
            this._runCommand(`netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=${targetPort} connectaddress=${targetIp} connectport=${targetPort}`)
                .then(() => {
                    this.activeRules.push({ port: targetPort });
                    resolve();
                })
                .catch(reject);
        });
    }

    _runCommand(cmd) {
        return new Promise((resolve, reject) => {
            console.log(`[TrafficRedirector] Execution : ${cmd}`);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                resolve(stdout);
            });
        });
    }
}

module.exports = new TrafficRedirector();
