<template>
  <v-dialog v-model="model" max-width="900px">
    <v-card>

      <v-card-title class="text-h6">
        Import du set : {{ previewSet.title }}
      </v-card-title>

      <v-card-text>

        <!-- STEP 1 : SOURCE + VALUE -->
        <div v-if="step === 1">

          <!-- Source -->
          <v-select
            label="Source de l'import"
            :items="sources"
            v-model="source"
            item-disabled="disabled"
          />

          <!-- Champ token / URL -->
          <v-text-field
            label="Token ou URL"
            v-model="inputValue"
            placeholder="Collez ici le token ou l'URL de partage"
          />

          <v-btn 
            color="primary" 
            :loading="isLoading"
            @click="handleImport"
          >
            Importer
          </v-btn>

          <div v-if="error" class="text-red mt-2">{{ error }}</div>
        </div>

        <div v-if="step === 2">

          <div class="controls-section">
            <v-btn 
              color="red-darken-1"
              variant="tonal"
              @click="resetAllQuantities"
            >
              Réinitialiser les quantités à 0
            </v-btn>
          </div>

          <!-- STEP 2 : PREVIEW DU SET -->
          <div  class="items-grid">

            <div 
              v-for="item in previewSet.items" 
              :key="item.iditem" 
              class="item-card"
            >
              <div class="item-header">
                <img :src="item.img" class="item-img-large" />
                <div class="item-title">{{ item.name }} x {{ item.multiplier || 1 }}</div>
              </div>

              <div class="ingredients">
                <div 
                  v-for="ing in item.ingredients" 
                  :key="ing.iditem"
                  class="ingredient-row"
                >
                  <img :src="ing.img" class="ing-img" />

                  <div class="ingredient-info">
                    <div class="ingredient-name">{{ ing.name }}</div>

                    <div class="ingredient-quantities">
                      <v-text-field
                        v-model.number="ing.quantityHave"
                        type="number"
                        class="qty-input"
                        hide-details
                        density="compact"
                        @blur="sanitizeQuantity(ing)"
                        @input="sanitizeQuantity(ing)"
                      />
                      <span class="qty-total"> / {{ ing.quantityTotal }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn variant="text" @click="close">Annuler</v-btn>

        <v-btn 
          v-if="step === 2"
          color="primary" 
          @click="confirmImport"
        >
          Créer le set
        </v-btn>

      </v-card-actions>

    </v-card>
  </v-dialog>
</template>


<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { getImportData } from "../hooks/useFetchSet";

const model = defineModel<boolean>();

const emit = defineEmits(['confirm'])

interface PreviewSet {
  title: string;
  items: ImportedItem[];
}

interface Ingredient {
  iditem: number;
  name: string;
  quantityTotal: number;
  quantityHave: number;
  img: string;
}

interface ImportedItem {
  iditem: number;
  name: string;
  multiplier: number;
  img: string;
  ingredients: Ingredient[];
}

const step = ref(1);
const inputValue = ref("");
const isLoading = ref(false);
const error = ref("");

const source = ref("local");

const sources = [
  { title: "Importer localement", value: "local" },
  { title: "Importer depuis l'atelier DofusBook", value: "dofusbook-workshop" },
  { title: "Importer un stuff DofusBook", value: "dofusbook-build", props: { disabled: true } },
  // { label: "Importer depuis DofusDB", value: "dofusdb" }
];

// LE SET PRÉVIEW : structure identique au retour API
const previewSet = ref<PreviewSet>({
  title: "",
  items: []
});

const resetAllQuantities = () => {
  previewSet.value.items.forEach(item => {
    item.ingredients.forEach(ing => {
      ing.quantityHave = 0;
    });
  });
};

const resetState = () => {
  previewSet.value = { title: "", items: [] };
  step.value = 1;
  error.value = "";
  inputValue.value = "";
  source.value = "local";
};

const handleImport = async () => {
  error.value = "";
  isLoading.value = true;

  try {
    const { data } = await getImportData(source.value, inputValue.value);

    previewSet.value = data.data;

    step.value = 2;
  } catch (err: any) {
    console.error(err);
    error.value = "Impossible d'importer ce set.";
  } finally {
    isLoading.value = false;
  }
};

const close = () => {
  step.value = 1;
  inputValue.value = "";
  previewSet.value = { title: "", items: [] };
  model.value = false;
};

const sanitizeQuantity = (ing: any) => {
  // Si vide → 0
  if (ing.quantityHave === "" || ing.quantityHave === null || ing.quantityHave === undefined) {
    ing.quantityHave = 0;
    return;
  }

  // Forcer en entier numérique
  ing.quantityHave = parseInt(ing.quantityHave, 10);

  // Si NaN → 0
  if (isNaN(ing.quantityHave)) {
    ing.quantityHave = 0;
  }

  // Bornes min / max
  if (ing.quantityHave < 0) ing.quantityHave = 0;
  if (ing.quantityHave > ing.quantityTotal) ing.quantityHave = ing.quantityTotal;
};

const confirmImport = () => {
  console.log("IMPORT CONFIRMÉ :", previewSet.value);
  emit("confirm", previewSet.value)
};

watch(model, (val) => {
  if (val === false) {
    resetState();
  }
});

</script>


<style scoped>
.items-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 10px;
}

.item-card {
  border: 1px solid #444;
  border-radius: 12px;
  padding: 12px;
  /* background: #222; */
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.item-img-large {
  width: 56px;
  height: 56px;
  margin-right: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  /* color: #fff; */
}

.ingredient-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.ing-img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.ingredient-info {
  flex: 1;
}

.ingredient-name {
  /* color: #ddd; */
  font-size: 14px;
  margin-bottom: 3px;
}

.ingredient-quantities {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-total {
  /* color: #aaa; */
  font-size: 12px;
}

.qty-input {
  max-width: 10rem;
}

.controls-section {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
