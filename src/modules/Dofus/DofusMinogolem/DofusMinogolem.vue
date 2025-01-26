<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue';

// Importation des images des Minogolems
import or from '@/assets/img/Dofus/DofusMinogolem/or.png?url';
import sang from '@/assets/img/Dofus/DofusMinogolem/sang.png?url';
import sel from '@/assets/img/Dofus/DofusMinogolem/sel.png?url';
import seculaire from '@/assets/img/Dofus/DofusMinogolem/seculaire.png?url';

// Liste des Minogolems dans le menu de gauche
const minogolems: Ref<any> = ref([
  { id: 1, name: 'Minogolem Sang', src: sang },
  { id: 2, name: 'Minogolem Or', src: or },
  { id: 3, name: 'Minogolem Sel', src: sel },
  { id: 4, name: 'Minogolem Seculaire', src: seculaire }
]);

// Positions de départ
const positions: Ref<any> = ref([
  {}, {}, {}, {} // 4 cases vides
]);

// Etat réactif pour gérer le menu actif
const activeMenuIndex: Ref<any> = ref<number | null>(null);

// Fonction pour ouvrir ou fermer un menu
const toggleMenu = async(index: number) => {
  if (activeMenuIndex.value === index) {
    // Si le menu est déjà ouvert, on le ferme
    activeMenuIndex.value = null;
  } else {
    // Si un autre menu est ouvert, on le ferme avant d'ouvrir le nouveau
    activeMenuIndex.value = null;

    // Petite pause pour laisser le DOM se mettre à jour
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Ouvrir le nouveau menu
    activeMenuIndex.value = index;
  }
};

// Fonction pour fermer le menu (appelée avec @click:outside)
const closeMenu = () => {
  activeMenuIndex.value = null;
};

// Fonction pour sélectionner un Minogolem
const selectMinogolem = (index: number, mino: any) => {
  // Vérifier si le Minogolem est déjà dans une autre case
  const currentIndex = positions.value.findIndex(
    (position: any) => position.id === mino.id
  );

  // Si trouvé, on le retire de la case actuelle
  if (currentIndex !== -1) {
    positions.value[currentIndex] = {}; // Réinitialise la case
  }

  // Ajouter le Minogolem à la nouvelle position
  positions.value[index] = mino;

  // Fermer le menu
  activeMenuIndex.value = null;
};

// Fonction pour réinitialiser une position
const resetPosition = (index: number) => {
  positions.value[index] = {}; // Supprime le Minogolem de la case
  activeMenuIndex.value = null; // Fermer le menu après réinitialisation
};
const resetAllPositions = () => {
  positions.value = Array(4).fill({}); // Réinitialise les 4 positions à vide
  activeMenuIndex.value = null; // Ferme tous les menus
}

// Stockage des Minogolems pour les tours (8 tours vides au départ)
const tours = ref(Array(8).fill({})); // 8 cases vides

// Fonction pour sélectionner un Minogolem dans un tour
const selectTourMinogolem = (index: number, mino: any) => {
  // Ajouter le Minogolem au tour sélectionné
  tours.value[index] = mino;

  // Fermer le menu
  activeMenuIndex.value = null;
};

// Fonction pour réinitialiser un tour spécifique
const resetTour = (index: number) => {
  tours.value[index] = {}; // Supprime le Minogolem du tour
  activeMenuIndex.value = null; // Fermer le menu après réinitialisation
};
const resetAllTours = () => {
  tours.value = Array(8).fill({}); // Réinitialise tous les tours à vide
  activeMenuIndex.value = null; // Ferme tous les menus
};
const continueNextTour = () => {
  // Vérifier si le tour 5 est défini
  const tour5Positions = calculatedResults.value[4]; // Index 4 correspond au Tour 5 (5ème card)

  if (tour5Positions) {
    // Mettre à jour les positions de départ avec celles du Tour 5
    positions.value = [...tour5Positions];
  }

  // Copier les contenus des tours 5 à 8 dans les 4 premiers
  tours.value = [
    tours.value[4] || {}, // Tour 5 devient Tour 1
    tours.value[5] || {}, // Tour 6 devient Tour 2
    tours.value[6] || {}, // Tour 7 devient Tour 3
    tours.value[7] || {}, // Tour 8 devient Tour 4
    {}, // Tour 5 vidé
    {}, // Tour 6 vidé
    {}, // Tour 7 vidé
    {}, // Tour 8 vidé
  ];
};

// Réinitialiser les cards cochées (grisées)
const resetGreyedOutCards = () => {
  greyedOutCards.value = Array(calculatedResults.value.length).fill(false);
};

// Vérifie si toutes les positions et tous les tours sont remplis
const arePositionsAndToursComplete = computed(() => {
  // Vérifie que chaque position et chaque tour a un `name` défini
  return (
    positions.value.every((position: any) => position.name) &&
    tours.value.every((tour) => tour.name)
  );
});

const calculatedResults = computed(() => {
  // Copier les positions de départ pour commencer les calculs
  let currentPositions = [...positions.value];
  const results = [];

  // Ajouter la position de départ comme première card
  results.push([...currentPositions]);

  // Parcourir les tours (maximum 7 tours)
  tours.value.forEach((tour, index) => {
    if (index >= 7) return; // Stopper après 7 tours
    if (!tour.name) return; // Si un tour n'est pas rempli, on saute

    // Trouver l'index du séculaire et du Minogolem qui joue
    const seculaireIndex = currentPositions.findIndex((pos) => pos.name === "Minogolem Seculaire");
    const playingIndex = currentPositions.findIndex((pos) => pos.name === tour.name);

    if (seculaireIndex !== -1 && playingIndex !== -1) {
      // Échanger les positions entre le séculaire et le Minogolem qui joue
      [currentPositions[seculaireIndex], currentPositions[playingIndex]] =
      [currentPositions[playingIndex], currentPositions[seculaireIndex]];
    }

    // Ajouter l'état actuel des positions au résultat
    results.push([...currentPositions]);
  });

  return results; // Retourne exactement 8 résultats
});
// Surveiller les changements dans les résultats
watch(calculatedResults, () => {
  resetGreyedOutCards();
});

// Suivre l'état des tours "grisés" (true = grisé, false = actif)
const greyedOutCards = ref(Array(8).fill(false)); // 8 tours, tous actifs par défaut

// Fonction pour basculer l'état d'une card (grisé ou actif)
const toggleCardState = (index: number) => {
  greyedOutCards.value[index] = !greyedOutCards.value[index];
};
</script>

<template>
  <div class="dofus-set" style="padding: 1rem 0 4rem 0;">
    <v-container>
      <v-row>
        <!-- Partie Liste des Minogolems -->
        <v-col cols="1">
          <v-card>
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-img
                  v-bind="props"
                  :src="sang"
                  alt="Minogolem Sang"
                  height="80px"
                  class="mb-2"
                />
              </template>
              <span>Minogolem Sang</span>
            </v-tooltip>
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-img
                  v-bind="props"
                  :src="or"
                  alt="Minogolem Or"
                  height="80px"
                  class="mb-2"
                />
              </template>
              <span>Minogolem Or</span>
            </v-tooltip>
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-img
                  v-bind="props"
                  :src="sel"
                  alt="Minogolem Sel"
                  height="80px"
                  class="mb-2"
                />
              </template>
              <span>Minogolem Sel</span>
            </v-tooltip>
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-img
                  v-bind="props"
                  :src="seculaire"
                  alt="Minogolem Seculaire"
                  height="80px"
                  class="mb-2"
                />
              </template>
              <span>Minogolem Seculaire</span>
            </v-tooltip>
          </v-card>

          <!-- Nouvelle carte pour les boutons -->
          <!-- <v-card class="mt-4">
            <v-card-title>Actions</v-card-title>
            <v-card-actions>
              <v-btn
                class="text-none text-subtitle-1"
                color="blue-grey"
                size="small"
                variant="flat"
              >Réinitialiser</v-btn>
            </v-card-actions>
          </v-card> -->

        </v-col>

        <!-- Partie Droite : Position de départ et Sélection des Minogolems -->
        <v-col cols="5">
          <v-row>

            <!-- Partie Position de départ -->
            <v-col cols="12">
              <v-card class="pb-4">
                <v-card-title>Position de départ</v-card-title>
                <v-card-subtitle class="mb-4">
                  <v-btn
                    class="text-none text-subtitle-1"
                    color="blue-grey"
                    size="small"
                    variant="flat"
                    @click="resetAllPositions"
                  >
                    Réinitialiser
                  </v-btn>
                </v-card-subtitle>
                <v-row>
                  <!-- Cases de positionnement -->
                  <v-col
                    v-for="(position, index) in positions"
                    :key="index"
                    cols="6"
                    class="d-flex justify-center"
                  >

                    <v-menu
                      :value="activeMenuIndex === index"
                      location="end"
                      @click:outside="closeMenu"
                    >
                      <template #activator="{ props }">
                        <div
                        v-bind="props"
                        @click.stop="toggleMenu(index)"
                        class="text-center d-flex justify-center align-center border"
                        style="width: 80px; height: 80px; cursor: pointer;"
                      >
                        <template v-if="position && position.name">
                          <!-- Tooltip avec Minogolem -->
                          <v-tooltip>
                            <template v-slot:activator="{ props: tooltipProps }">
                              <v-img
                                v-bind="tooltipProps"
                                :src="position.src"
                                height="80px"
                              />
                            </template>
                            <span>{{ position.name }}</span>
                          </v-tooltip>
                        </template>
                        <template v-else>
                          <!-- Texte par défaut si pas de Minogolem -->
                          <span>
                            {{ ['Haut Gauche', 'Haut Droite', 'Bas Gauche', 'Bas Droite'][index] }}
                          </span>
                        </template>
                      </div>
                      </template>
                      <v-list v-if="activeMenuIndex === index" class="pa-0">
                        <!-- Bloc pour réinitialiser -->
                        <v-list-item @click="resetPosition(index)" class="pa-0">
                          <div
                            class="text-center d-flex justify-center align-center"
                            style="width: 80px; height: 80px; cursor: pointer; background-color: #f5f5f5;"
                          >
                            <span style="font-size: 24px; color: #ff5252;">&#x2716;</span>
                          </div>
                        </v-list-item>
                        <!-- Liste des Minogolems -->
                        <v-list-item
                          v-for="mino in minogolems"
                          :key="mino.id"
                          @click="selectMinogolem(index, mino)"
                          class="pa-0"
                        >
                          <div
                            class="text-center d-flex justify-center align-center border"
                            style="width: 80px; height: 80px; cursor: pointer;"
                          >
                            <v-tooltip>
                              <template v-slot:activator="{ props }">
                                <v-img
                                  v-bind="props"
                                  :src="mino.src"
                                  height="80px"
                                />
                              </template>
                              <span>{{ mino.name }}</span>
                            </v-tooltip>
                          </div>
                        </v-list-item>
                      </v-list>
                    </v-menu>

                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <!-- Partie Sélection des Minogolems par Tour -->
            <v-col cols="12">
              <v-card class="pb-4">
                <v-card-title class="d-flex justify-between align-center">Sélection des Minogolems par Tour</v-card-title>
                <v-card-subtitle class="mb-4">
                  <v-btn
                    class="text-none text-subtitle-1"
                    color="blue-grey"
                    size="small"
                    variant="flat"
                    @click="resetAllTours"
                  >
                    Réinitialiser
                  </v-btn>
                  <v-btn
                    class="text-none text-subtitle-1 ml-2"
                    color="green"
                    size="small"
                    variant="flat"
                    @click="continueNextTour"
                    :disabled="!arePositionsAndToursComplete"
                  >
                    Continuer
                  </v-btn>
                </v-card-subtitle>
                <v-row>
                  <v-col
                    v-for="(_, index) in 8"
                    :key="index"
                    cols="3"
                    class="d-flex justify-center"
                  >
                    <v-menu
                      :value="activeMenuIndex === index"
                      location="end"
                      @click:outside="closeMenu"
                    >
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          @click.stop="toggleMenu(index)"
                          class="text-center d-flex justify-center align-center border hover-border"
                          style="width: 80px; height: 80px; cursor: pointer;"
                        >
                          <template v-if="tours[index] && tours[index].name">
                            <!-- Tooltip avec Minogolem -->
                            <v-tooltip>
                              <template v-slot:activator="{ props: tooltipProps }">
                                <v-img
                                  v-bind="tooltipProps"
                                  :src="tours[index].src"
                                  height="80px"
                                />
                              </template>
                              <span>{{ tours[index].name }}</span>
                            </v-tooltip>
                          </template>
                          <template v-else>
                            <!-- Texte par défaut si pas de Minogolem -->
                            <span>Tour {{ index + 1 }}</span>
                          </template>
                        </div>
                      </template>
                      <v-list v-if="activeMenuIndex === index" class="pa-0">
                        <!-- Bloc pour réinitialiser -->
                        <v-list-item @click="resetTour(index)" class="pa-0">
                          <div
                            class="text-center d-flex justify-center align-center"
                            style="width: 80px; height: 80px; cursor: pointer; background-color: #f5f5f5;"
                          >
                            <span style="font-size: 24px; color: #ff5252;">&#x2716;</span>
                          </div>
                        </v-list-item>
                        <!-- Liste des Minogolems -->
                        <v-list-item
                          v-for="mino in minogolems.filter((m: any) => m.name !== 'Minogolem Seculaire')"
                          :key="mino.id"
                          @click="selectTourMinogolem(index, mino)"
                          class="pa-0"
                        >
                          <div
                            class="text-center d-flex justify-center align-center border"
                            style="width: 80px; height: 80px; cursor: pointer;"
                          >
                            <v-tooltip>
                              <template v-slot:activator="{ props }">
                                <v-img
                                  v-bind="props"
                                  :src="mino.src"
                                  height="80px"
                                />
                              </template>
                              <span>{{ mino.name }}</span>
                            </v-tooltip>
                          </div>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

          </v-row>
        </v-col>

        <!-- Partie Résultat -->
        <v-col cols="6">
          <v-card class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-card-title>Résultat</v-card-title>
            <v-card-text color="error" v-if="!arePositionsAndToursComplete" class="text-center text-red-600 text-lg">
              Veuillez remplir toutes les positions et tous les tours.
            </v-card-text>
            <v-card-text v-else class="text-center">
              
              <v-row>
                <v-col
                  v-for="(result, index) in calculatedResults"
                  :key="index"
                  cols="6"
                >
                  <v-card
                    class="pa-4 relative"
                    :style="{
                      backgroundColor: greyedOutCards[index] ? 'rgba(128, 128, 128, 0.5)' : 'white',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.3s ease',
                    }"
                    @click="toggleCardState(index)"
                  >
                    <v-card-title class="text-center">Tour {{ index + 1 }}</v-card-title>
                    <!-- Croix si grisé -->
                    <div
                      v-if="greyedOutCards[index]"
                      :style="{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '48px',
                        color: 'red',
                        pointerEvents: 'none',
                      }"
                    >
                      &#x2716;
                    </div>

                    <!-- Minogolem qui joue -->
                    <div
                      v-if="tours[index]"
                      :style="{
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }"
                    >
                      <!-- Wrapper pour aligner l'image et l'épée -->
                      <div
                        :style="{
                          display: 'flex',
                          alignItems: 'center',
                        }"
                      >
                        <!-- Image du Minogolem qui joue -->
                        <v-img
                          :src="tours[index].src"
                          height="50px"
                          width="50px"
                          :style="{
                            marginRight: '10px',
                          }"
                        />
                        <!-- Icône épée -->
                        <v-icon
                          color="red"
                          :style="{
                            fontSize: '24px',
                          }"
                        >
                          mdi-sword
                        </v-icon>
                      </div>
                    </div>


                    <!-- Contenu des positions -->
                    <div
                      :style="{
                        position: 'relative',
                        height: '200px',
                        width: '100%',
                      }"
                    >
                      <!-- Haut Gauche -->
                      <div :style="{ position: 'absolute', top: '0', left: '0' }">
                        <v-img
                          v-if="result[0]"
                          :src="result[0].src"
                          height="80px"
                          width="80px"
                          :style="{
                            border: result[0].id === tours[index]?.id ? '3px solid green' : 'none',
                            borderRadius: '50%',
                          }"
                        />
                      </div>
                      <!-- Haut Droite -->
                      <div :style="{ position: 'absolute', top: '0', right: '0' }">
                        <v-img
                          v-if="result[1]"
                          :src="result[1].src"
                          height="80px"
                          width="80px"
                          :style="{
                            border: result[1].id === tours[index]?.id ? '3px solid green' : 'none',
                            borderRadius: '50%',
                          }"
                        />
                      </div>
                      <!-- Bas Gauche -->
                      <div :style="{ position: 'absolute', bottom: '0', left: '0' }">
                        <v-img
                          v-if="result[2]"
                          :src="result[2].src"
                          height="80px"
                          width="80px"
                          :style="{
                            border: result[2].id === tours[index]?.id ? '3px solid green' : 'none',
                            borderRadius: '50%',
                          }"
                        />
                      </div>
                      <!-- Bas Droite -->
                      <div :style="{ position: 'absolute', bottom: '0', right: '0' }">
                        <v-img
                          v-if="result[3]"
                          :src="result[3].src"
                          height="80px"
                          width="80px"
                          :style="{
                            border: result[3].id === tours[index]?.id ? '3px solid green' : 'none',
                            borderRadius: '50%',
                          }"
                        />
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

            </v-card-text>
          </v-card>
        </v-col>

      </v-row>
    </v-container>
  </div>


</template>

<style lang="scss" scoped>

</style>