<script setup lang="ts">
import { ref } from 'vue';

// Dimensions de la map
const rows = 19;
const cols = 19;

// Initialisation de la matrice de la map
// `1` = praticable (vert), `0` = impraticable (gris)
const mapMatrix = ref(
  Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) =>
      rowIndex === 0 || colIndex === 0 || rowIndex === rows - 1 || colIndex === cols - 1 ? 1 : 0
    )
  )
);

// Position actuelle du joueur
const playerPosition = ref({ row: 0, col: 0 });

// Fonction pour déplacer le joueur (si la case est praticable)
const movePlayer = (row: number, col: number) => {
  if (mapMatrix.value[row][col] === 1) {
    playerPosition.value = { row, col };
  }
};

// Fonction pour obtenir la couleur de la case
const getCellColor = (row: number, col: number) => {
  if (playerPosition.value.row === row && playerPosition.value.col === col) {
    return 'lightblue'; // Case où se trouve le joueur
  }
  return mapMatrix.value[row][col] === 1 ? 'lightgreen' : 'lightgray'; // Praticable = vert, impraticable = gris
};
</script>

<template>
  <div class="map-container">
    <!-- Grille de la carte -->
    <v-card class="pa-0" style="max-width: 100%; overflow: auto;">
      <v-card-title class="d-flex justify-between align-center">Map</v-card-title>
      <v-row dense class="no-margin">
        <!-- Lignes de la carte -->
        <v-col
          v-for="(row, rowIndex) in mapMatrix"
          :key="rowIndex"
          cols="auto"
          class="pa-0 no-margin"
        >
          <!-- Colonnes de la carte -->
          <v-row dense class="no-margin">
            <v-col
              v-for="(cell, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              cols="auto"
              class="d-flex align-center justify-center pa-0 no-margin"
              style="width: 25px; height: 25px; border: 1px solid #ccc;"
              :style="{
                backgroundColor: getCellColor(rowIndex, colIndex),
                cursor: cell === 1 ? 'pointer' : 'not-allowed',
              }"
              @click="movePlayer(rowIndex, colIndex)"
            >
              <!-- Joueur (affiché uniquement sur sa position actuelle) -->
              <span v-if="playerPosition.row === rowIndex && playerPosition.col === colIndex">
                🧍‍♂️
              </span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
  </div>

</template>

<style lang="scss" scoped>
.map-container {
  max-width: 600px;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto; /* Permettre le défilement si nécessaire */
}

.cell {
  border: 1px solid rgba(0, 0, 0, 0.1); /* Bordure légère pour séparer les cases */
  cursor: pointer;
}
</style>
