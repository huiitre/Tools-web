# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev                  # Vite dev server (port 5173)
npm run dev:qa               # QA mode
npm run electron:watch       # Electron + Vite dev server with live reload

# Build
npm run build                # vue-tsc type-check + Vite production build
npm run electron:build       # Build Electron distributable (Linux AppImage, Windows NSIS)

# Lint
npm run lint:script          # ESLint on .ts/.vue files
npm run lint:markup          # Type-check via vue-tsc --noEmit

# Utilities
npm run preview              # Preview production build
npm run reset                # Clean node_modules + lock file
```

There is no test framework configured in this project.

## Architecture

**Electron + Vue 3** desktop/web app. The same frontend is deployed as a Docker web app and as a packaged Electron application. Vue Router uses hash history in Electron mode and HTML5 history in web mode — the `useEnv` composable and router guards handle the difference.

### Frontend (`src/`)

Feature modules live under `src/modules/`. Each module owns its routes (`*.routes.ts`), Pinia store (`*.store.ts`), fetch functions, and components. The main modules are:

- **Auth** — login/logout, token storage, refresh flow
- **Dofus** — game tooling with sub-features: `hdv/` (market sniffer), `bankmanagement/` (bank sniffer), `workshop/`, `catalogue/`, `almanax/`, `switcher/` (account switcher)
- **Settings**, **Downloads**, **Legal**

Shared infrastructure:
- `src/services/axiosInstance.ts` — four versioned Axios clients (v1, v2, v3, v3Dofus), each with request interceptors that inject the Bearer token and response interceptors that handle 401 → token refresh → retry.
- `src/stores/` — global Pinia stores for UI state and session cleanup on logout (`resetSessionStores()`).
- `src/composables/` — Vue 3 composables: `useEnv`, `useOS`, `useDevice`, `useScreen`, `useAppUpdate`, etc.
- `src/ui/` — theme management (dark/light + PicoCSS color scheme).

### Electron Main Process (`electron/`)

The main process is split into services using Node.js EventEmitter patterns:

| Directory | Purpose |
|-----------|---------|
| `electron/main.cjs` | App lifecycle, window creation |
| `electron/preload.cjs` | Context bridge — exposes IPC API to renderer |
| `electron/ipc/` | IPC handler registration (`sniffer`, `proxy`, `switcher`, `autofocus`) |
| `electron/sniffer/` | Packet capture via tcpdump (SnifferService, BankSniffer, etc.) |
| `electron/proxy/` | MITM proxy using Node `net` module + iptables traffic redirection |
| `electron/switcher/` | Account switcher with global hotkeys (uiohook-napi) |

### IPC Pattern

All IPC goes through the preload context bridge. The renderer calls `window.electron.<method>()`, which maps to `ipcRenderer.invoke()` or `ipcRenderer.on()`. Handlers in `electron/ipc/*.ipc.cjs` register with `ipcMain.handle()`.

Key channels:
- `sniffer:*` — start/stop packet capture, detect game clients, stream captured data back via `sniffer:data`
- `proxy:*` — start/stop MITM proxy, update active modules, stream results via `proxy:hdv-prices`, `proxy:bank-items`, `proxy:scan-progress`
- `switcher:*` — open switcher window, hotkey binding
- `autofocus:*` — monitor and redirect window focus between game accounts
- `update-available` / `apply-update` — electron-updater flow

## Dofus Autofocus

Moteur de focus automatique pour le multi-compte Dofus Retro, intégré via `tshark` et `xdotool`.

- **Moteur :** `electron/sniffer/AutofocusService.cjs` (spawn `tshark`).
- **Détection :**
    - `6a626c` : Mapping ID réseau → Nom du personnage.
    - `697977` : Ordre d'initiative.
    - `6a6163` : Changement de tour (déclenche le focus xdotool après 150ms).
- **Persistance :** IndexedDB store `autofocus_mapping` (front-end) synchronisé via IPC.
- **UI :**
    - Gestion du mapping dans `Settings > Modules > Dofus`.
    - Toggle d'activation dans les paramètres du `Switcher`.
- **Dépendances système :** `tshark` (avec accès non-root aux interfaces), `xdotool`.

### API Clients

Four Axios instances are exported from `src/services/axiosInstance.ts`: `axiosV1`, `axiosV2`, `axiosV3`, `axiosV3Dofus`. The Dofus client adds `X-Game-Version-Id` and `X-Game-Server-Id` headers. All clients share the same 401-refresh-retry interceptor logic.

## Key Configuration

- `vite.config.ts` — Vue plugin, PWA (workbox), `@/` path alias
- `tsconfig.json` — ESNext, strict mode, `@/*` alias maps to `src/*`
- `.env` — `VITE_TOOLS_API_BASE_URL`, Google/GitHub OAuth client IDs
- `package.json` `build` key — electron-builder config (Linux AppImage, Windows NSIS)
- `.releaserc.json` — semantic-release for CI versioning

## Deployment

- **Web**: Docker image `huiitre/tools_web:latest` via `npm run deploy`
- **Electron**: GitHub releases via `electron-updater` (`.github/workflows/deploy.yml` on master)
- **QA**: separate workflow `deploy-qa.yml` on the `qa` branch
