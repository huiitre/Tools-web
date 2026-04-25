Projet : Tools Web (Mini-ERP Frontend)

1. Mission & Stack

Rôle : Interface utilisateur Mini-ERP.

Stack : Vue.js 3 (Composition API).

Styling : PicoCSS (Variables CSS strictes).

Documentation : Un dossier /doc à la racine contient les guides Markdown, notamment celui sur l'implémentation de PicoCSS.

2. Protocole d'Initialisation (OBLIGATOIRE)

Utiliser @Google Drive pour lire le fichier INDEX_PROJETS dans le dossier Projets AI.

Scanner le contenu du sous-dossier /Tools.

Analyse Locale : Lire systématiquement les fichiers dans /doc pour les conventions de style et composants.

Confirmer que le contexte est à jour.

3. Architecture Frontend

DDD : Séparation des services de données (Infrastructure) et de la logique de présentation.

Conformité : Utilisation impérative du guide de variables PicoCSS fourni dans /doc.

4. Discovery Log (Auto-Updated)

<!-- L'agent CLI consigne ici ses découvertes techniques via edit_file -->

[Style] Dossier /doc identifié comme source de vérité pour PicoCSS et le design system.

[Architecture] Vue.js 3 orienté services métier (Clean Arch).

[Sniffer] Nécessite un environnement Electron sous Linux (dépendances `ss -tpn` et `tcpdump`).

[Protocol] Dofus Retro utilise les paquets `EHl` pour les prix HDV.

[Sync] Pattern Batch/Debounce (2s) unifié pour le fetch des métadonnées et la synchronisation des prix.

[Prix] Synchronisation couplée à `useItemPrices.refreshRecursive` pour mettre à jour le cache local et recalculer les crafts dépendants.