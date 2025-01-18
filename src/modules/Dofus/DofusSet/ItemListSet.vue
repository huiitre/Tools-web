<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { useMutationAveragePrice } from '../hooks/useMutationAveragePrice';
import toast from '@/services/toast';

const timeoutFn = globalThis.setTimeout;

const props = defineProps({
  itemList: {
    type: Array,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false,
    required: false
  }
});

const isReadonly = () => {
  if (props.readonly) {
    toast.warning('Les modifications sont désactivées pour ce set.');
    return true;
  }
}

const emit = defineEmits(['fetch-set', 'delete-item', 'update-multiplier', 'update-qty-already-obtained', 'add-custom-item']);

const handleDelete = (item: any) => {
  emit('delete-item', item);
};

const handlePriceUpdate = async(item: any) => {
  if (isReadonly()) return;
  console.log('Prix mis à jour pour l\'item', item.item_name, ':', item.item_average_price);
  const averagePrice = item.item_average_price || 0;

  try {
    const { data } = await useMutationAveragePrice(item.iditem, averagePrice);
    if (!data?.status) throw data?.msg ? data?.msg : 'Erreur useMutationAveragePrice'
    emit('fetch-set');
  } catch(err) {
    console.log("%c ItemListSet.vue #44 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
};

const handleMultiplierUpdate = (item: any, timeout: number = 0) => {
  if (isReadonly()) return;
  setTimeout(() => {
    emit('update-multiplier', item);
  }, timeout);
};

const handleQtyAlreadyObtainedUpdate = (ingredient: any, timeout: number = 0) => {
  if (isReadonly()) return;
  setTimeout(() => {
    emit('update-qty-already-obtained', ingredient);
  }, timeout);
};

const calculateTotalCraft = (item: any): number => {
  return item.recipe?.reduce((total: number, ingredient: any) => {
    return total + (ingredient.total_quantity_required * (ingredient.item_average_price || 0));
  }, 0) || 0;
};

const calculateTotalCraftMultiplied = (item: any): number => {
  const totalCraft = calculateTotalCraft(item);
  return totalCraft * (item.multiplier || 1);
};

const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const sanitizeInput = (value: any, min: number = 1, max: number | null = null): number => {
    const sanitizedValue = value.replace(/[^\d]/g, ''); // Supprime tous les caractères non numériques

    const numericValue = parseInt(sanitizedValue, 10) || 0; // Convertit en nombre, retourne 0 si NaN

    if (max !== null && max < min) {
        console.error("Max value is less than min value. Adjust your parameters.");
        return min; // Retourne la valeur minimale par sécurité
    }

    if (max !== null) {
        const constrainedValue = Math.min(max, Math.max(min, numericValue)); // Contraint entre min et max
        return constrainedValue;
    }

    const constrainedValue = Math.max(min, numericValue); // Contraint uniquement par min
    return constrainedValue;
};

const calculateTotalCraftFinal = (item: any): number => {
  return item.recipe?.reduce((total: number, ingredient: any) => {
    const remainingQuantity = Math.max(0, ingredient.total_quantity_required * (item.multiplier || 1) - ingredient.quantity_already_obtained);
    return total + (remainingQuantity * (ingredient.item_average_price || 0));
  }, 0) || 0;
};

const handleCustomAddItem = (item: any) => {
  if (isReadonly()) return;
  emit('add-custom-item', [item]);
}

</script>

<template>
  <div class="d__container d__center">
    <div v-if="Array.isArray(itemList) && itemList.length > 0" class="item-cards">
      <v-row dense>
        <v-col
          v-for="(item, index) in itemList"
          :key="item.iditem_has_set || `item-${index}`"
          cols="12"
          md="6"
        >
          <v-card
            class="item-card bg-blue-grey-lighten-1"
            outlined
          >
            <!-- Header de la carte -->
            <v-card-title class="d-flex justify-space-between align-center" style="gap: 16px;">
            <!-- Image de l'item -->
            <v-avatar size="64">
              <v-img 
                :src="item.item_img || 'https://via.placeholder.com/64'" 
                alt="item-image" 
              />
            </v-avatar>

            <!-- Bloc Nom et Informations -->
            <div class="flex-grow-1" style="min-width: 0;">
              <h3 class="text-h6 font-weight-bold m-0" style="white-space: normal; word-break: break-word;">
                {{ item.item_name || 'Nom inconnu' }}
              </h3>
              <p class="text-caption m-0">
                {{ item.item_type_name || 'Type inconnu' }} - Niveau {{ item.item_level || 'N/A' }}
              </p>
            </div>

            <!-- Input Multiplicateur et Icône poubelle -->
            <div class="d-flex align-center">
              <!-- Input Multiplicateur -->
              <v-text-field
                :disabled="readonly"
                v-model="item.multiplier"
                type="text"
                label="Multiplicateur"
                density="compact"
                variant="outlined"
                style="width: 100px; height: 50px; margin-right: 16px;"
                @update:model-value="(event: any) => {
                  item.multiplier = sanitizeInput(event, 1, 9999)
                }"
                @keydown.enter.prevent="(event: any) => {
                  event.target.blur();
                }"
                @blur="() => {
                  handleMultiplierUpdate(item)
                }"
              />

              <!-- Icône poubelle -->
              <v-icon
                :disabled="readonly"
                color="red"
                style="font-size: 40px; cursor: pointer;"
                @click.stop="handleDelete(item)"
              >
                mdi-delete
              </v-icon>
            </div>
          </v-card-title>

            <v-card-subtitle class="bg-blue-grey-lighten-2">
              <!-- Section d'informations calculées -->
              <div class="d-flex flex-column mb-4 pa-2">
                <!-- Prix moyen -->
                <div class="d-flex justify-space-between align-center">
                  <v-text-field
                    :disabled="readonly"
                    :model-value="formatPrice(item.item_average_price)"
                    label="Prix unitaire"
                    @input="(event: any) => {
                      item.item_average_price = sanitizeInput(event.target.value, 0)
                    }"
                    persistent-hint
                    type="text"
                    variant="outlined"
                    density="compact"
                    style="max-width: 200px; height: 40px; font-size: 14px;"
                    class="text-right"
                    @keydown.enter.prevent="(event: any) => {
                      event.target.blur();
                    }"
                    @blur="() => {
                      handlePriceUpdate(item)
                    }"
                  >
                  </v-text-field>
                  <span class="text-caption font-weight-bold">Prix unitaire multiplié :</span>
                  <span>{{ formatPrice(item.item_average_price * item.multiplier) }} Kamas</span>
                </div>

                <!-- Total du craft -->
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold">Craft :</span>
                  <span>
                    <v-icon
                      :color="item.item_average_price > calculateTotalCraft(item) ? 'success' : 'error'"
                      style="font-size: 30px; font-weight: bold;"
                    >
                      {{
                        item.item_average_price > calculateTotalCraft(item)
                          ? 'mdi-arrow-down-bold'
                          : 'mdi-arrow-up-bold'
                      }}
                    </v-icon>
                    {{ formatPrice(calculateTotalCraft(item)) }} Kamas
                  </span>
                </div>

                <!-- Total du craft multiplié -->
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold">Craft multiplié :</span>
                  <span>{{ formatPrice(calculateTotalCraftMultiplied(item)) }} Kamas</span>
                </div>

                <!-- Total du craft -->
                <div class="d-flex justify-space-between align-center">
                  <span class="font-weight-bold">Total craft :</span>
                  <span class="font-weight-bold">{{ formatPrice(calculateTotalCraftFinal(item)) }} Kamas</span>
                </div>
              </div>
            </v-card-subtitle>

            <!-- Contenu : Liste des ingrédients -->
            <v-card-text class="ingredient-list">
              <v-list dense class="bg-blue-grey-lighten-3 pb-2">
                <template v-for="(ingredient, i) in item.recipe" :key="ingredient.idrecipe_item_has_set || `ingredient-${i}`">
                  <v-list-item
                    class="ingredient-item"
                    :class="{
                      'text-success': ingredient.quantity_already_obtained >= (ingredient.total_quantity_required * item.multiplier)
                    }"
                  >
                    <!-- Partie gauche : Image et nom -->
                    <div class="d-flex align-center" style="flex-shrink: 1; gap: 8px; min-width: 0;">
                      <!-- Image -->
                      <v-avatar size="32">
                        <v-img
                          :src="ingredient.item_img || 'https://via.placeholder.com/32'"
                          alt="ingredient-image"
                        />
                      </v-avatar>

                      <!-- Nom -->
                      <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <div style="position: absolute; bottom: 38px; left: 5px; display: flex; gap: 8px;">
                          <v-chip
                            density="comfortable"
                            size="x-small"
                            color="blue"
                            text-color="white"
                            variant="flat"
                          >
                            Prix total : {{ formatPrice((ingredient.total_quantity_required * (item.multiplier || 1)) * (ingredient.item_average_price || 0)) }}
                          </v-chip>
                          <v-chip
                            density="comfortable"
                            size="x-small"
                            color="green font-weight-bold"
                            text-color="white"
                            variant="flat"
                          >
                            Prix Final : {{ formatPrice((ingredient.total_quantity_required * (item.multiplier || 1) - ingredient.quantity_already_obtained) * (ingredient.item_average_price || 0)) }}
                          </v-chip>
                        </div>
                        <span>{{ ingredient.item_name || 'Nom inconnu' }}</span>
                        <v-chip
                          v-if="ingredient.hasrecipe && !itemList.some(item => item.iditem === ingredient.iditem)"
                          :disabled="readonly"
                          density="comfortable"
                          size="x-small"
                          color="orange"
                          variant="elevated"
                          class="ml-2 v-chip-add-item"
                          @click="handleCustomAddItem(ingredient)"
                          append-icon="mdi-plus"
                        >
                          Ajouter
                        </v-chip>
                        <!-- Affiche "Ajouté" avec une icône de validation -->
                        <v-chip
                          v-else-if="ingredient.hasrecipe && itemList.some(item => item.iditem === ingredient.iditem)"
                          density="comfortable"
                          size="x-small"
                          color="success"
                          variant="tonal"
                          class="ml-2 v-chip-add-item"
                          append-icon="mdi-check"
                        >
                          Ajouté
                        </v-chip>
                      </div>
                    </div>

                    <!-- Partie droite : Inputs et icônes -->
                    <div class="d-flex align-center" style="flex-shrink: 0; gap: 8px;">
                      <!-- Input prix moyen -->
                      <v-text-field
                        :disabled="readonly"
                        :model-value="formatPrice(ingredient.item_average_price)"
                        density="compact"
                        variant="outlined"
                        style="width: 100px; height: 40px;"
                        type="text"
                        @input="(event: any) => {
                          ingredient.item_average_price = sanitizeInput(event.target.value, 0)
                        }"
                        label="Prix unitaire"
                        @keydown.enter.prevent="(event: any) => {
                          event.target.blur();
                        }"
                        @blur="(event: any) => {
                          handlePriceUpdate(ingredient)
                        }"
                      />

                      <!-- Input quantité obtenue -->
                      <v-text-field
                        :disabled="readonly"
                        v-model="ingredient.quantity_already_obtained"
                        density="compact"
                        variant="outlined"
                        style="width: 75px; height: 40px;"
                        type="text"
                        @update:model-value="(value: any) => {
                          ingredient.quantity_already_obtained = sanitizeInput(value, 0, ingredient.total_quantity_required * item.multiplier)
                        }"
                        @keydown.enter.prevent="(event: any) => {
                          event.target.blur();
                        }"
                        @blur="(event: any) => {
                          //todo ici on fait l'update
                          handleQtyAlreadyObtainedUpdate(ingredient)
                        }"
                        label="Quantité"
                      />
                      <span style="font-size: 20px; margin-left: 8px;">/ {{ formatPrice(ingredient.total_quantity_required * item.multiplier) }}</span>
                    </div>
                  </v-list-item>
                  <v-divider v-if="i < item.recipe.length - 1" />
                </template>
              </v-list>
            </v-card-text>

          </v-card>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <p>Aucun set sélectionné.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.text-right input {
  text-align: right; /* Aligne le contenu de l'input à droite */
}

.v-list-item {
  display: flex;
  align-items: center;
}

.d__container.d__center {
  padding: 16px;
}
.v-col {
  margin-right: 16px; /* Ajoute une marge entre les colonnes */
}
.v-chip-add-item {
  position: absolute;
  top: 40px; /* Ajustez la position verticale */
  left: 40px; /* Ajustez la position horizontale */
  z-index: 10;
}


.ingredient-item ::v-deep(.v-list-item__content) {
  display: flex !important;
  justify-content: space-between !important;
  width: 100% !important;
  // overflow: inherit !important;
  padding-top: 0.5rem !important;
}
.ingredient-list {
  font-size: 0.8rem !important;
  font-weight: bold !important;
}
</style>