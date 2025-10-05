<template>
  <div class="lab-container">
    <h2 class="text-center text-xl font-bold mb-4">🧭 Labyrinthe du Minotoror</h2>

    <div class="layout">
      <div class="sidebar">
        <div class="sidebar-block pawns-block">
          <div
            class="pawn red"
            :class="{ disabled: team1 !== null }"
            draggable="true"
            @dragstart="onDragStart('team1')"
          >
            <span>1</span>
          </div>

          <div
            class="pawn blue"
            :class="{ disabled: team2 !== null }"
            draggable="true"
            @dragstart="onDragStart('team2')"
          >
            <span>2</span>
          </div>

          <div
            class="pawn gold"
            :class="{ disabled: destination !== null }"
            draggable="true"
            @dragstart="onDragStart('dest')"
          >
            <span>★</span>
          </div>
        </div>

        <div class="sidebar-block instructions-block">
          <h3 class="block-title">📜 Instructions</h3>

          <div class="instructions-list">
            <div v-if="instructions.length === 0" class="empty-msg">
              Aucune instruction pour le moment.
            </div>

            <ul v-else>
              <li v-for="(inst, idx) in instructions" :key="idx">
                {{ inst }}
              </li>
            </ul>
          </div>

          <div class="btn-group">
            <button v-if="!hasCalculated" class="btn primary" @click="calculate">
              Calculer
            </button>

            <template v-else>
              <button class="btn warning" @click="recalculate">Recalculer</button>
              <button class="btn danger" @click="resetAll">Réinitialiser</button>
            </template>
          </div>
        </div>
      </div>

      <div class="lab-grid">
        <div
          v-for="n in 25"
          :key="n"
          class="lab-cell"
          @click="handleClick(n)"
          @dragover.prevent
          @drop="onDropMap(n)"
        >
          <img
            v-if="images[n]"
            :src="images[n]"
            :alt="`Map ${n}`"
            class="lab-img"
            draggable="false"
          />

          <div class="map-number">{{ n }}</div>

          <div
            v-for="dir in doorDirs(n)"
            :key="dir"
            class="door"
            :class="[dir, { open: doors[n][dir] }]"
            @click.stop="toggleDoor(n, dir)"
          >
            <span>
              {{
                dir === 'top'
                  ? '▲'
                  : dir === 'bottom'
                  ? '▼'
                  : dir === 'left'
                  ? '◀'
                  : '▶'
              }}
            </span>
          </div>

          <template v-for="(pawn, i) in getPawnsAtMap(n)" :key="i">
            <div
              class="pawn placed"
              :class="[pawn.color, getPawnPositionClass(i)]"
              @click.stop="removePawn(pawn.type)"
              draggable="true"
              @dragstart="onDragStart(pawn.type)"
            >
              <span>{{ pawn.label }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Chargement dynamique des images du labyrinthe
const imageModules = import.meta.glob(
  '@/assets/img/Dofus/DofusMinotororLab/*.png',
  { eager: true, import: 'default' }
)

// Construction du dictionnaire d’images (clé numérique → chemin)
const images: Record<number, string> = {}
for (const path in imageModules) {
  const match = path.match(/(\d+)\.png$/)
  if (match) {
    const num = parseInt(match[1])
    images[num] = imageModules[path] as string
  }
}

// État des pions (position sur la map)
const team1 = ref<number | null>(null)
const team2 = ref<number | null>(null)
const destination = ref<number | null>(null)
const dragging = ref<'team1' | 'team2' | 'dest' | null>(null)

// Structure des portes : pour chaque map, on stocke les états haut/droite/bas/gauche
type Dir = 'top' | 'right' | 'bottom' | 'left'
type DoorState = Record<number, { top: boolean; right: boolean; bottom: boolean; left: boolean }>
const doors = ref<DoorState>({})

// Initialisation des 25 maps avec portes fermées
for (let i = 1; i <= 25; i++) {
  doors.value[i] = { top: false, right: false, bottom: false, left: false }
}

// Fonctions utilitaires pour déterminer la ligne et colonne d’une map
function rowOf(map: number) { return Math.ceil(map / 5) }
function colOf(map: number) { return ((map - 1) % 5) + 1 }

// Détermine la map voisine selon la direction donnée
function getNeighbor(map: number, dir: Dir): number | null {
  const r = rowOf(map)
  const c = colOf(map)
  if (dir === 'top' && r > 1) return map - 5
  if (dir === 'bottom' && r < 5) return map + 5
  if (dir === 'left' && c > 1) return map - 1
  if (dir === 'right' && c < 5) return map + 1
  return null
}

// Donne la direction opposée à une autre (utile pour synchroniser les deux côtés d’une porte)
function getOpposite(dir: Dir): Dir {
  return dir === 'top' ? 'bottom'
    : dir === 'bottom' ? 'top'
    : dir === 'left' ? 'right'
    : 'left'
}

// Liste les directions valides (on ne crée pas de porte au bord du labyrinthe)
function doorDirs(map: number): Dir[] {
  const dirs: Dir[] = []
  if (getNeighbor(map, 'top')) dirs.push('top')
  if (getNeighbor(map, 'right')) dirs.push('right')
  if (getNeighbor(map, 'bottom')) dirs.push('bottom')
  if (getNeighbor(map, 'left')) dirs.push('left')
  return dirs
}

// Définit l’état d’une porte et synchronise la porte correspondante sur la map voisine
function setDoor(map: number, dir: Dir, isOpen: boolean) {
  const nb = getNeighbor(map, dir)
  if (!nb) return
  doors.value[map][dir] = isOpen
  doors.value[nb][getOpposite(dir)] = isOpen
}

// Les deux portes par défaut (map 1 → droite et bas ouvertes)
setDoor(1, 'right', true)
setDoor(1, 'bottom', true)

// Inverse l’état d’une porte (ouverture/fermeture)
function toggleDoor(map: number, dir: Dir) {
  const nb = getNeighbor(map, dir)
  if (!nb) return
  const next = !doors.value[map][dir]
  setDoor(map, dir, next)
}

// État et gestion des instructions textuelles affichées
const instructions = ref<string[]>([])
const hasCalculated = ref(false)

// Simule un calcul pour afficher des instructions de test
function calculate() {
  instructions.value = [
    "Équipe 1 (rouge) va 2x à droite",
    "Équipe 1 active le levier du bas",
    "Équipe 2 (bleu) va 1x à gauche",
  ]
  hasCalculated.value = true
}

// Ajoute une entrée simulée lors d’un recalcul
function recalculate() {
  instructions.value.push("🔁 Recalcul effectué.")
}

// Réinitialise totalement la scène : pions, portes et instructions
function resetAll() {
  team1.value = null
  team2.value = null
  destination.value = null

  for (let i = 1; i <= 25; i++) {
    doors.value[i] = { top: false, right: false, bottom: false, left: false }
  }

  // Rétablit les deux portes ouvertes par défaut
  setDoor(1, 'right', true)
  setDoor(1, 'bottom', true)

  instructions.value = []
  hasCalculated.value = false
}

// Gère le début du drag d’un pion
function onDragStart(type: 'team1' | 'team2' | 'dest') {
  dragging.value = type
}

// Gère le dépôt d’un pion sur une map donnée
function onDropMap(n: number) {
  if (!dragging.value) return
  if (dragging.value === 'team1') team1.value = n
  if (dragging.value === 'team2') team2.value = n
  if (dragging.value === 'dest') destination.value = n
  dragging.value = null
}

// Supprime un pion de sa map (le remet disponible à gauche)
function removePawn(type: 'team1' | 'team2' | 'dest') {
  if (type === 'team1') team1.value = null
  if (type === 'team2') team2.value = null
  if (type === 'dest') destination.value = null
}

// Retourne la liste des pions présents sur une map (pour affichage)
function getPawnsAtMap(map: number) {
  const list: { type: 'team1' | 'team2' | 'dest'; color: string; label: string }[] = []
  if (team1.value === map) list.push({ type: 'team1', color: 'red', label: '1' })
  if (team2.value === map) list.push({ type: 'team2', color: 'blue', label: '2' })
  if (destination.value === map) list.push({ type: 'dest', color: 'gold', label: '★' })
  return list
}

// Calcule la position visuelle du pion sur la map (coin haut-gauche, bas-droite, etc.)
function getPawnPositionClass(index: number) {
  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
  return positions[index] || 'top-left'
}

// Simple trace en console au clic sur une map (debug)
function handleClick(id: number) {
  console.log(`🧩 Map ${id} cliquée`)
}
</script>

<style scoped>
/* Conteneur principal du labyrinthe */
.lab-container {
  user-select: none;
}

/* Mise en page globale : sidebar + zone de labyrinthe */
.layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
}

/* Colonne latérale (à gauche) */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: stretch;
  margin-top: 10px;
  min-width: 260px;
}

/* Bloc générique dans la sidebar (cadre noir translucide) */
.sidebar-block {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid black;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Bloc des pions affichés horizontalement */
.pawns-block {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

/* Style commun des pions */
.pawn {
  flex: 0 0 auto;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 28px;
  color: white;
  cursor: grab;
  border: 3px solid #000;
  text-shadow:
    -2px -2px 0 #000,
     2px -2px 0 #000,
    -2px  2px 0 #000,
     2px  2px 0 #000;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
  transition: transform 0.15s, opacity 0.15s;
}
.pawn.disabled { opacity: 0.3; cursor: not-allowed; }
.pawn.red  { background: radial-gradient(circle at 30% 30%, #ff5555, #aa0000); }
.pawn.blue { background: radial-gradient(circle at 30% 30%, #55aaff, #0044aa); }
.pawn.gold { background: radial-gradient(circle at 30% 30%, #ffe066, #b8860b); }

/* Position et taille des pions une fois posés sur la map */
.pawn.placed {
  position: absolute;
  width: 48px;
  height: 48px;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
}

/* Positionnement selon le coin de la map */
.pawn.top-left { top: 10px; left: 10px; }
.pawn.top-right { top: 10px; right: 10px; }
.pawn.bottom-left { bottom: 10px; left: 10px; }
.pawn.bottom-right { bottom: 10px; right: 10px; }

/* Bloc des instructions et boutons d'action */
.instructions-block { font-size: 14px; }
.block-title {
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
}
.instructions-list {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid #333;
  border-radius: 6px;
  padding: 6px;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
}
.instructions-list ul { list-style-type: none; padding: 0; margin: 0; }
.instructions-list li { margin: 4px 0; }
.empty-msg { text-align: center; opacity: 0.7; font-style: italic; }

/* Groupe de boutons (calcul / reset) */
.btn-group {
  display: flex;
  justify-content: space-around;
  gap: 8px;
  margin-top: 10px;
}
.btn {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary { background: #0066ff; color: #fff; }
.btn.warning { background: #ffaa00; color: #000; }
.btn.danger  { background: #cc0000; color: #fff; }
.btn:hover { opacity: 0.9; }

/* Grille principale du labyrinthe */
.lab-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px;
  border-radius: 8px;
}

/* Cellule individuelle de la map */
.lab-cell {
  position: relative;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
}

/* Icônes des portes entre les maps */
.door {
  position: absolute;
  color: #ccc;
  font-size: 28px;
  opacity: 0.8;
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease, text-shadow 0.15s ease;
}
.door.open { color: #00ff66; text-shadow: 0 0 10px #00ff66; }
.door:hover { transform: scale(1.3); color: #fff; text-shadow: 0 0 8px #ffffff; }

/* Positionnement des icônes de porte selon leur direction */
.door.top { top: 3px; left: 50%; transform: translateX(-50%); }
.door.bottom { bottom: 3px; left: 50%; transform: translateX(-50%); }
.door.left { left: 3px; top: 50%; transform: translateY(-50%); }
.door.right { right: 3px; top: 50%; transform: translateY(-50%); }

/* Numéro affiché sur chaque map */
.map-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  font-weight: 900;
  color: #fff;
  text-shadow:
    -2px -2px 0 #000,
     2px -2px 0 #000,
    -2px  2px 0 #000,
     2px  2px 0 #000;
  opacity: 0.85;
  pointer-events: none;
}
</style>
