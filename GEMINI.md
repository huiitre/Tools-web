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

[Autofocus] Intégration du moteur `tshark` pour le focus automatique basé sur l'initiative (paquets `6a626c`, `697977`, `6a6163`).

[Autofocus] Mapping ID/Nom persisté dans IndexedDB (v4) avec synchronisation bidirectionnelle Electron/Renderer.

[Workshop/Liens] Chaque atelier supporte jusqu'à 3 liens (DOFUSBOOK ou CUSTOM). Visualisation via `WorkshopLinkViewer.vue` : popup 85vw×85vh, `<webview>` Electron (contourne X-Frame-Options, nécessite `webviewTag: true` dans main.cjs) ou fallback web. Gestion add/edit/delete dans les cartes liste (WorkshopEditor) et dans un floating panel (`@floating-ui/vue`) sur la page détail (WorkshopLinksButton). Le scroll ferme le panel sauf scroll interne (fix paste/coller). `<webview>` déclarée custom element natif dans vite.config.ts.

[Admin] Module `/admin` réservé aux rôles ADMIN / TECH / OWNER. Guard dans `router.ts` (`requireAdmin` meta). `isAdmin` getter dans `auth.store.ts`. Bouton "Admin" dans le header principal (sans icône, même style que les boutons de thème). Structure : `admin.routes.ts` → `Admin.vue` (layout + `AdminNav`) → sous-vues `dashboard/` et `users/`.

[Admin/Dashboard] KPIs (totalUsers, activeUsers, newUsersThisWeek) via `GET /api/v3/admin/stats`. Liste des modules avec barres de progression (userCount / totalUsers). Skeleton loading.

[Admin/Users] Tableau colonnes triables/filtrables/paginées côté client (même pattern que catalogue Dofus). Avatar avec fallback initiales (`@error` → `avatarError = true`). Popup édition de rôle inline au clic sur la colonne rôle (même pattern que tags workshop). API retourne `roles: number[]` — résolution via `store.roles.find(sr => sr.code === String(r) || String(sr.id) === String(r))`. Hiérarchie : `READ_ONLY < USER < MODERATOR < ADMIN < TECH < OWNER`.

[Admin/Modules] Page `/admin/modules` — split view sidebar + DnD. Sidebar : liste des modules avec dot actif/inactif. Panneau droit : header module (nom/code/badge actif) + 2 colonnes drag & drop "Disponibles" / "Membres". Glisser vers Membres → `ModuleRolePickerModal` → `POST /modules/:id/users/:userId` puis `PUT .../role { roleId }`. Glisser vers Disponibles → `DELETE`. Rôle inline cliquable → popup liste rôles → `PUT .../role { roleId }`. Popup fermée au clic extérieur et scroll. Création : `POST /modules` (toujours inactif par défaut). Édition : `PUT /modules/:id` (4 champs optionnels : name, code, description, active). Le code doit correspondre à l'enum Java `ModuleCode`. `ModuleUser` = `{ userId: number, name, email, roleId, roleCode }`. `SimpleUser` supprimé — `AdminUser` utilisé à la place. 3 modales extraites : `ModuleCreateModal`, `ModuleEditModal`, `ModuleRolePickerModal`.

[Riot/Valorant] Le refresh token **ne peut pas** être échangé directement (CORS Riot). Passe par `POST /api/v3/riot/valorant/refresh-token` (backend proxy). Réponse `{ accessToken, refreshToken }` en camelCase. Les cookies `__Secure-access_token` et `__Secure-refresh_token` sont HttpOnly → non lisibles en JS, récupérables uniquement via DevTools → Application → Cookies.

[Riot/Valorant/Architecture] Module découpé en 4 fichiers après refactoring (1173 → ~160 lignes pour la vue) : `fetch/valorantShop.fetch.ts` (appels API purs), `composables/useValorantShop.ts` (toute la logique : timer, renewal, bundles, store), `components/ValorantAuthCard.vue` (formulaire avec état interne), `components/ValorantBundleCard.vue` (affichage bundle + timer). `ValorantDailyShop.vue` est un orchestrateur pur qui importe les deux composants et le composable.

[Riot/Valorant/Bundles] `fetchStorefront` retourne aussi `bundles: RawBundle[]` extraits de `FeaturedBundle` (filtrage par `SKIN_TYPE_ID = e7c63390...`). `RawBundle.items` = `Array<{ itemId: string; cost: number }>`. `fetchBundleMeta(uuid)` récupère nom + image depuis valorant-api.com (`displayIcon2` en priorité). Dans `useValorantShop.ts` : `expiresAt` calculé au chargement, `bundleNow` ref mis à jour chaque seconde dans le `timerInterval` existant pour un timer live "Xj Xh Xmin". `ValorantBundleCard` reçoit `now: number` comme prop (réactif). `BundleSkin.cost === 0` → badge "OFFERT" (vert). Layout carte : bannière pleine largeur `height: auto` + info row (nom/prix/discount à gauche, timer à droite) + grille skins (72px). Script Node `doc/valorant-skin-daily/refresh-auth.js` affiche aussi les packs via `getBundles()` avec `buildSkinMap()` partagé.

[useImagePreview] Paramètre optionnel `minSize` (px) sur `open(url, alt?, minSize?)`. `ImagePreviewModal` applique `min-width/min-height` en inline style. Utilisé par le tableau admin pour afficher les avatars en 200px minimum (URLs Google souvent petites : 96×96).

[Settings] Nav simplifiée : sections `account-profile`, `account-security`, `module-dofus` uniquement. Suppression de "Préférences" et "Comptes liés". Fix PicoCSS : `justify-content: flex-start` sur `nav` (PicoCSS force `space-between` par défaut sur les éléments `nav`).

[Updates] Double mécanisme géré par `useAppUpdate.ts` et `update.service.ts` :
- **Web (PWA)** : Polling toutes les 10s via `ServiceWorkerRegistration.update()`. Si une mise à jour est trouvée, `WebUpdateService` envoie `SKIP_WAITING` au worker. Le rechargement est déclenché par l'événement `statechange` -> `activated`.
- **Electron** : Utilise `electron-updater`. Le `main.cjs` vérifie les updates au boot. Communication via IPC (`update-available` / `apply-update`). L'installation finale utilise `autoUpdater.quitAndInstall()`.