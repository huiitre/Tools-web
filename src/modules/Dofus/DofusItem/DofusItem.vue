<script setup lang="ts">
// @ts-nocheck
import { Ref, ref } from 'vue';
import { useFetchItemListWeb } from '../hooks/useFetchItemList'
import { useMutationAveragePrice } from '../hooks/useMutationAveragePrice';

const loading = ref(false)
const searchItem = ref('')
const itemList: Ref<any> = ref([]);
const itemListCount = ref(0);
const itemsPerPage = ref(10)
const headers: Array<{
  key?: string;
  value?: string | ((item: any) => any);
  title?: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  width?: string;
  children?: Array<any>;
}> = [
  { title: '', value: 'data-table-expand', key: 'expand', align: 'center', sortable: false },
  { title: '', value: 'item_img', sortable: false, key: 'item_img', align: 'center' },
  { title: 'Categorie', value: 'category_name', sortable: true, key: 'category_name', align: 'center' },
  { title: 'Type', value: 'item_type_name', sortable: true, key: 'item_type_name', align: 'center' },
  { title: 'Nom', value: 'item_name', sortable: true, key: 'item_name', align: 'center' },
  { title: 'Niveau', value: 'item_level', sortable: true, key: 'item_level', align: 'center' },
  { title: 'Prix unitaire', value: 'item_average_price', sortable: true, key: 'item_average_price', align: 'center' },
  { title: 'Prix craft', value: 'craft_price', sortable: true, key: 'craft_price', align: 'center' }
];
const recipeHeaders: Array<{
  key?: string;
  value?: string | ((item: any) => any);
  title?: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  width?: string;
  children?: Array<any>;
}> = [
  { title: '', value: 'item_img', sortable: false, key: 'item_img', align: 'center' },
  { title: 'Categorie', value: 'category_name', sortable: false, key: 'category_name', align: 'center' },
  { title: 'Type', value: 'item_type_name', align: 'center', sortable: false },
  { title: 'Nom', value: 'item_name', align: 'center', sortable: false },
  { title: 'Niveau', value: 'item_level', align: 'center', sortable: false },
  { title: 'Prix unitaire', value: 'item_average_price', sortable: false, key: 'item_average_price', align: 'center' },
  { title: 'Quantité', value: 'item_quantity', align: 'center', sortable: false },
  { title: 'Prix total', value: 'total_price', key: 'total_price', align: 'center' },
];

const calculateCraftPrice = (recipe: any) => {
  if (!recipe || !Array.isArray(recipe) || recipe.length === 0) {
    return 0; // Retourne 0 si aucune recette
  }

  return recipe.reduce((total, ingredient) => {
    const price = unformatPrice(ingredient.item_average_price) || 0;
    const quantity = ingredient.item_quantity || 1;
    return total + price * quantity;
  }, 0);
};

const calculateTotalPrice = (recipeItem: any) => {
  const price = unformatPrice(recipeItem.item_average_price) || 0;
  const quantity = parseInt(recipeItem.item_quantity) || 0;
  return formatPrice((price * quantity)); // Formate avec des séparateurs
}

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
const unformatPrice = (formattedPrice: any): number => {
  if (typeof formattedPrice === 'string') {
    return parseInt(formattedPrice.replace(/\s/g, ''), 10);
  }
  return formattedPrice;
};

// Ajout du "Prix craft" aux items
const formatItems = (items: any) => {
  return items.map((item: any) => ({
    ...item,
    craft_price: formatPrice(calculateCraftPrice(item.recipe)),
    editedPrice: formatPrice(item.item_average_price),
    item_average_price: formatPrice(item.item_average_price),
    recipe: item.recipe?.map((ingredient: any) => ({
      ...ingredient,
      editedPrice: formatPrice(ingredient.item_average_price),
      item_average_price: formatPrice(ingredient.item_average_price),
    })),
  }));
};

const expanded: Ref<any> = ref([]);
const toggleRowExpansion = (item: any) => {
  const index = expanded.value.indexOf(item.iditem);
  if (index === -1) {
    expanded.value.push(item.iditem);
  } else {
    expanded.value.splice(index, 1);
  }
};
const toggleAllRowsExpansion = () => {
  expanded.value = []
};

const getImageUrl = (path: string) => {
  return `${path}`;
};

const dialog = ref(false);
const selectedImage = ref({});

const openImageDialog = (item: object) => {
  selectedImage.value = item;
  dialog.value = true;
};

const handleSaveAveragePrice = async(item: any) => {
  const cleanedPrice = unformatPrice(item.editedPrice);

  if (cleanedPrice == item.item_average_price) {
    console.log("%c Aucune modification détectée, sauvegarde ignorée.", 'background:orange;color:#fff;font-weight:bold;');
    return;
  }

  try {
    const { data } = await useMutationAveragePrice(item.iditem, Number(cleanedPrice))

    if (!data?.status) throw data?.msg ? data?.msg : 'Erreur useMutationAveragePrice'

    const price = Number(cleanedPrice);
    item.item_average_price = isNaN(price) || price <= 0 ? 0 : price;

    itemList.value = itemList.value.map((parent: any) => {
      if (parent.recipe && parent.recipe.length > 0) {
        const updatedRecipe = parent.recipe.map((ingredient: any) => {
          if (ingredient.iditem === item.iditem) {
            return {
              ...ingredient,
              item_average_price: item.item_average_price
            }
          }
          return ingredient
        })
        return {
          ...parent,
          recipe: updatedRecipe
        }
      }
      if (parent.iditem === item.iditem) {
        parent = {
          ...parent,
          item_average_price: item.item_average_price,
          editedPrice: item.editedPrice, // Mettez à jour aussi editedPrice
        };
      }
      return parent
    })

    itemList.value = formatItems(itemList.value)
  } catch(err) {
    console.log("%c DofusItem.vue #95 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
    handleCancelUpdateAveragePrice(item)
  } finally {

  }
}

const hasInvalidIngredients = (recipe: any) => {
  if (!recipe || recipe.length === 0) return false; // Aucun ingrédient, pas d'icône

  const hasPrice = recipe.some((ingredient: any) => ingredient.item_average_price && ingredient.item_average_price > 0);
  const hasZeroPrice = recipe.some((ingredient: any) => !ingredient.item_average_price || ingredient.item_average_price <= 0);

  // Affiche l'icône si certains ingrédients ont un prix, mais pas tous
  return hasPrice && hasZeroPrice;
};

const handleCancelUpdateAveragePrice = (item: any) => {
  item.editedPrice = item.item_average_price;
  console.log(`Modification annulée pour l'item : ${item.iditem}`);
};

const loadItems = async({ page, itemsPerPage, sortBy, search }: any) => {
  try {
    loading.value = true
    toggleAllRowsExpansion()
    const { data } = await useFetchItemListWeb({ page, itemsPerPage, sortBy, search })
    if (!data?.status) throw data?.msg

    const itemsFormateds = formatItems(data.data)

    itemList.value = itemsFormateds
    itemListCount.value = data.count

  } catch(err) {
    console.log("%c DofusItem.vue #50 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <v-card class="dofus-item" flat>
    <v-card-title class="d-flex align-center pe-2" style="font-size: 1.5rem; font-weight: bold;">
      <v-icon icon="mdi-sword" size="36" class="me-2"></v-icon>
      Rechercher un objet

      <v-spacer></v-spacer>

      <v-text-field
        v-model="searchItem"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        single-line
        clearable
      ></v-text-field>
    </v-card-title>
  </v-card>

  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="itemList"
    :items-length="itemListCount"
    :loading="loading"
    :search="searchItem"
    item-value="name"
    show-expand
    @update:options="loadItems"
    class="main-table"
  >
    <!-- Header personnalisé -->
    <template v-slot:headers="{ props }: any">
      <tr>
        <!-- Colonne pour l'icône d'expansion globale -->
        <th class="text-center">
          <v-icon
            icon="mdi-chevron-down"
            @click="toggleAllRowsExpansion"
            :class="{ 'rotate-180': expanded.length > 0 }"
            style="cursor: pointer; transition: transform 0.3s; font-size: 30px;"
          ></v-icon>
        </th>
        <!-- Colonnes principales -->
        <th v-for="header in headers.slice(1)" :key="header.value?.toString()" class="text-center">
          {{ header.title }}
        </th>
      </tr>
    </template>

    <template v-slot:body="{ items }:any">
      <template v-for="(item, index) in items" :key="item.iditem">
        <!-- Ligne principale -->
        <tr :class="{
          'expanded-row-parent-odd': index % 2 !== 0,
          'expanded-row-parent-even': index % 2 === 0
        }">
          <!-- Colonne pour l'icône d'expansion -->
          <td class="text-center">
            <v-icon
              v-if="item.recipe && item.recipe.length > 0"
              icon="mdi-chevron-down"
              @click="toggleRowExpansion(item)"
              :class="{ 'rotate-180': expanded.includes(item.iditem) }"
              style="cursor: pointer; transition: transform 0.3s; font-size: 30px;"
            ></v-icon>
          </td>

          <!-- Colonne pour l'image -->
          <td class="text-center">
            <img
              :src="getImageUrl(item.item_img)"
              alt="item image"
              style="height: 60px; cursor: pointer;"
              @click="openImageDialog({ iditem: item.iditem, url: getImageUrl(item.item_img) })"
            />
          </td>

          <td v-for="header in headers.slice(2)" :key="header.value?.toString()" class="text-center">
            <!-- Colonne "Prix moyen" avec input -->
            <template v-if="header.value === 'item_average_price'">
              <div class="d-flex align-center justify-center">
                <v-text-field
                  v-model="item.editedPrice"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dense
                  class="price-input"
                  @keydown.enter.prevent="handleSaveAveragePrice(item)"
                ></v-text-field>
                <v-icon
                  icon="mdi-content-save"
                  :class="{ 'icon-active': item.editedPrice != item.item_average_price }"
                  style="cursor: pointer; margin-left: 8px;"
                  @click="handleSaveAveragePrice(item)"
                ></v-icon>
                <!-- Icône de croix rouge -->
                <v-icon
                  :class="{ 'icon-active': item.editedPrice != item.item_average_price }"
                  icon="mdi-close-circle"
                  class="cancel-icon"
                  style="cursor: pointer; margin-left: 8px;"
                  @click="handleCancelUpdateAveragePrice(item)"
                ></v-icon>
              </div>
            </template>
            <template v-else-if="header.value === 'craft_price'">
              <div class="d-flex align-center justify-center">
                <v-icon
                  v-if="hasInvalidIngredients(item.recipe)"
                  icon="mdi-alert-circle"
                  color="red"
                  style="font-size: 20px; margin-right: 4px;"
                  title="Certains ingrédients ont un prix unitaire nul ou à 0."
                ></v-icon>
                <span>{{ item[header.value] }}</span>
              </div>
            </template>
            <!-- Autres colonnes normales -->
            <template v-else>
              <span :style="{ fontWeight: header.value === 'item_name' ? 'bold' : 'normal' }">
                {{ item[header.value] }}
              </span>
            </template>
          </td>

        </tr>

        <!-- Ligne étendue -->
        <tr v-if="expanded.includes(item.iditem)" class="v-data-table__expanded-row">
          <td :colspan="headers.length" class="text-center">
            <div>
                <!-- Tableau des recettes -->
                <v-data-table
                    density="compact"
                    :headers="recipeHeaders"
                    :items="item.recipe"
                    :items-per-page="-1"
                    hide-default-footer
                    class="custom-recipe-table"
                >
                  <template v-slot:body="{ items }: any">
                    <tr v-for="(recipeItem, index) in items" :key="index" style="font-size: 0.9em;">
                      <td v-for="header in recipeHeaders" :key="header.value?.toString()" class="text-center">
                        <!-- Colonne pour l'image -->
                        <span v-if="header.value === 'item_img'">
                          <img
                            :src="getImageUrl(recipeItem.item_img)"
                            alt="ingredient image"
                            style="height: 40px; cursor: pointer;"
                            @click="openImageDialog({ iditem: recipeItem.iditem, url: getImageUrl(recipeItem.item_img) })"
                          />
                        </span>
                        <!-- Colonne "Prix moyen" avec input -->
                        <template v-else-if="header.value === 'item_average_price'">
                          <div class="d-flex align-center justify-center">
                            <v-text-field
                              v-model="recipeItem.editedPrice"
                              variant="outlined"
                              density="compact"
                              hide-details
                              dense
                              class="price-input"
                              @keydown.enter.prevent="handleSaveAveragePrice(recipeItem)"
                            ></v-text-field>
                            <v-icon
                              icon="mdi-content-save"
                              :class="{ 'icon-active': recipeItem.editedPrice != recipeItem.item_average_price }"
                              style="cursor: pointer; margin-left: 8px;"
                              @click="handleSaveAveragePrice(recipeItem)"
                            ></v-icon>
                            <!-- Icône de croix rouge -->
                            <v-icon
                              :class="{ 'icon-active': recipeItem.editedPrice != recipeItem.item_average_price }"
                              icon="mdi-close-circle"
                              class="cancel-icon"
                              style="cursor: pointer; margin-left: 8px;"
                              @click="handleCancelUpdateAveragePrice(recipeItem)"
                            ></v-icon>
                          </div>
                        </template>
                        <template v-else-if="header.value === 'total_price'">
                          <span>
                            {{ calculateTotalPrice(recipeItem) }}
                          </span>
                        </template>
                        <!-- Autres colonnes normales -->
                        <template v-else>
                          <span>
                            {{ recipeItem[header.value] }}
                          </span>
                        </template>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
            </div>
          </td>
        </tr>

      </template>
    </template>
  </v-data-table-server>

  <!-- Dialog to show image -->
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-text>{{ selectedImage.iditem }}</v-card-text>
      <v-card-text class="d-flex justify-center">
        <img :src="selectedImage.url" alt="Large item image" style="max-width: 100%; max-height: 80vh;" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.dofus-item {
  margin: 3rem;
}

::v-deep(.v-data-table__td.v-data-table-column--align-center.v-data-table__th) {
  vertical-align: middle !important;
}

/* Appliquer les couleurs alternées uniquement aux lignes principales */
.main-table tbody > tr:nth-child(even):not(.v-data-table__expanded-row) {
  background-color: #f9f9f9; /* Gris clair */
}

.main-table tbody > tr:nth-child(odd):not(.v-data-table__expanded-row) {
  background-color: #e0e0e0; /* Gris moyen */
}

/* Couleur spécifique pour les lignes des sous-tableaux (recettes) */
.main-table .v-data-table__expanded-row .custom-table tbody > tr {
  background-color: inherit !important; /* Hérite de la ligne parente */
}

.v-icon.mdi-content-save.icon-active {
  font-size: 24px; /* Taille de l'icône */
  color: #4caf50; /* Couleur verte pour l'icône active */
}

.v-icon.mdi-content-save {
  font-size: 24px; /* Taille uniforme pour toutes les icônes */
  color: #9e9e9e; /* Couleur grise pour l'icône inactive */
}

.v-icon.cancel-icon.icon-active {
  font-size: 24px; /* Taille de l'icône */
  color: #f44336; /* Couleur rouge pour l'icône de suppression */
}

.v-icon.cancel-icon {
  font-size: 24px; /* Taille uniforme pour toutes les icônes */
  color: #9e9e9e; /* Couleur grise pour l'icône inactive */
}

.rotate-180 {
  transform: rotate(180deg);
}

.v-table {
  max-height: none !important; /* Supprime les contraintes imposées par Vuetify */
}

.v-table th {
  vertical-align: middle !important;
}

.v-data-table th,
.v-data-table td {
  text-align: center !important;
  vertical-align: middle !important;
}
.font-bold {
  font-weight: bold;
}
.text-center {
  text-align: center;
  vertical-align: middle;
}
</style>