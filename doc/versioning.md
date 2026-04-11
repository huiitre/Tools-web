# Versioning automatique

Les releases sont générées automatiquement à chaque push sur `master` via `semantic-release`.

## Convention de commits

Le type du commit détermine le niveau d'incrément de version :

| Préfixe | Exemple | Impact |
|---------|---------|--------|
| `fix:` | `fix: correction du calcul de prix` | Patch `1.0.0` → `1.0.1` |
| `feat:` | `feat: ajout du module almanax` | Minor `1.0.0` → `1.1.0` |
| `feat!:` | `feat!: refonte de l'authentification` | Major `1.0.0` → `2.0.0` |
| *(rien)* | `mise à jour du readme` | Aucune release |

## Comportement

- Si aucun commit ne correspond à la convention → pas de release, pas de tag
- Plusieurs commits patch regroupés → un seul bump patch
- Le niveau le plus élevé parmi les commits gagne (`feat:` + `fix:` → minor)

## Releases GitHub

Chaque release crée automatiquement :
- Un tag GitHub (`v1.0.1`, `v1.1.0`, etc.)
- Une release GitHub avec les notes générées depuis les commits
- Les binaires Electron joints (AppImage Linux + exe Windows)

## Conseil pratique

Pour les commits courants sans impact de version (refacto, doc, style) :
utilise des préfixes non reconnus comme `chore:`, `docs:`, `style:`, `refactor:`.
Ils ne déclencheront pas de release.