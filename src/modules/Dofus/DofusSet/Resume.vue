<script setup lang="ts">
import { reactive, defineEmits, computed, ref, Ref, watch } from 'vue';
import { useFetchItemListWeb } from '../hooks/useFetchItemList'
import { useMutationCreateShareLink } from '../hooks/useMutationSet';
import { copyToClipboard } from '@/utils/Core/string';
import toast from '@/services/toast';

const emit = defineEmits([''])

const props = defineProps({
  isVisible: {
    type: [Boolean, null],
    required: true
  },
  itemList: {
    type: Array,
    required: true,
    default: []
  },
  readonly: {
    type: Boolean,
    default: false
  },
  idset: {
    type: Number || null,
    required: true
  }
})

const showShareDialog = ref(false)
const shareLink = ref('')
const isLoadingShare = ref(false)

const shareSet = async () => {
  try {
    isLoadingShare.value = true;
    shareLink.value = ''; // Réinitialiser le lien
    const { data } = await useMutationCreateShareLink(props.idset)

    if (!data.status) {
      throw new Error(data.msg || 'Erreur inconnue');
    }

    shareLink.value = data.data.link;
  } catch (error) {
    console.error('Erreur lors du partage du set:', error);
  } finally {
    isLoadingShare.value = false;
  }
};

const handleCopyToClipboard = async() => {
  if (!shareLink.value) return;

  const result = await copyToClipboard(shareLink.value)
  if (result)
    toast.success(`Lien du set copié dans le presse-papier`)
  else
    toast.error(`Erreur lors de la copie dans le presse-papier`)
}

watch(showShareDialog, (newValue) => {
  if (newValue) {
    shareLink.value = '';
  }
});

// States
const showCompleteResources = ref(false);

// Calculs dynamiques
const totalItemsToCraft = computed(() => props.itemList.length);

const totalSetPrice: Ref<any> = computed(() =>
  props.itemList.reduce((sum: any, item: any) => sum + item.item_average_price, 0)
);

const craftableSetPrice: Ref<any> = computed(() =>
  props.itemList.reduce((sum: any, item: any) => {
    return (
      sum +
      item.recipe.reduce((recipeSum: any, ingredient: any) => {
        const remainingQty = ingredient.total_quantity_required - ingredient.quantity_already_obtained;
        return recipeSum + Math.max(remainingQty, 0) * ingredient.item_average_price;
      }, 0)
    );
  }, 0)
);

const totalCraftPriceAdjusted = computed(() =>
  craftableSetPrice.value // Peut-être affiné avec d'autres règles si nécessaire
);

// Liste des ressources agrégées
const resources = computed(() => {
  const resourceMap = new Map();

  props.itemList.forEach((item: any) => {
    item.recipe.forEach((ingredient: any) => {
      const existingResource = resourceMap.get(ingredient.iditem);

      if (existingResource) {
        existingResource.total += ingredient.total_quantity_required;
        existingResource.obtained += ingredient.quantity_already_obtained;
      } else {
        resourceMap.set(ingredient.iditem, {
          id: ingredient.iditem,
          name: ingredient.item_name,
          item_img: ingredient.item_img,
          total: ingredient.total_quantity_required,
          obtained: ingredient.quantity_already_obtained
        });
      }
    });
  });

  return Array.from(resourceMap.values());
});

// Ressources filtrées en fonction de la checkbox
const filteredResources = computed(() => {
  const sortedResources = resources.value.sort((a, b) => a.name.localeCompare(b.name));

  if (showCompleteResources.value) {
    return sortedResources.sort((a, b) => {
      const isCompleteA = a.obtained >= a.total;
      const isCompleteB = b.obtained >= b.total;

      // Priorité aux ressources complètes
      if (isCompleteA && !isCompleteB) return -1;
      if (!isCompleteA && isCompleteB) return 1;

      // Sinon, tri par nom
      return a.name.localeCompare(b.name);
    });
  }

  // Si la checkbox est décochée, ne garde que les incomplètes et tri par nom
  return sortedResources.filter((res) => res.obtained < res.total);
});

const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

</script>

<template>
  <v-card class="mb-4 px-4 py-3 bg-blue-grey opacity-100" outlined v-if="isVisible">
    <!-- Titre -->
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 font-weight-bold">Résumé</span>
      <v-icon
        size="48"
        color="white"
        :disabled="readonly"
        style="cursor: pointer;"
        class="ml-4"
        @click="showShareDialog = true"
      >
        mdi-share
      </v-icon>

      <!-- Dialog -->
      <v-dialog v-model="showShareDialog" max-width="400">
        <v-card class="bg-blue-grey pa-4 rounded elevation-2">
          <!-- Titre -->
          <v-card-title class="text-h6 text-white justify-center pb-4">
            Actions de partage
          </v-card-title>

          <!-- Contenu principal -->
          <v-card-text class="d-flex flex-column gap-4">
            <!-- Bouton pour partager le set -->
            <v-btn
              color="cyan darken-2"
              variant="flat"
              rounded
              :loading="isLoadingShare"
              :disabled="isLoadingShare"
              @click="shareSet"
            >
              Partager le set
            </v-btn>

            <!-- Input pour afficher le lien généré -->
            <v-text-field
              v-if="shareLink"
              v-model="shareLink"
              @click="handleCopyToClipboard"
              @focus="(event: any) => event.target.select()"
              label="Lien de partage"
              readonly
              outlined
              density="compact"
              hide-details
              class="bg-blue-grey-lighten-3 rounded"
            />

            <!-- Bouton pour exporter le set -->
            <v-btn color="grey darken-1" variant="flat" block rounded disabled>
              Exporter le set
            </v-btn>
          </v-card-text>

          <!-- Bouton de fermeture -->
          <v-card-actions class="justify-end pt-4">
            <v-btn
              color="red darken-2"
              variant="text"
              rounded
              @click="showShareDialog = false"
            >
              Fermer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-card-title>

    <v-divider color="white" class="my-4" :thickness="3"></v-divider>

    <!-- Informations globales -->
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <div>Nombre d'objets à craft : <strong>{{ totalItemsToCraft }}</strong></div>
          <div>Prix moyen total du set : <strong>{{ formatPrice(totalSetPrice) }} Kamas</strong></div>
          <div>Prix du set à craft : <strong>{{ formatPrice(craftableSetPrice) }} Kamas</strong></div>
          <div>
            Prix total ajusté (après ressources existantes) : 
            <strong>{{ formatPrice(totalCraftPriceAdjusted) }} Kamas</strong>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider color="white" class="my-4" :thickness="3"></v-divider>

    <!-- Informations sur les ressources -->
    <v-card-text>
      <v-row>
        <v-col cols="8">
          <div>Nombre de ressources : <strong>{{ resources.length }}</strong></div>
          <div>
            Ressources manquantes : 
            <strong>
              {{
                resources.filter((res) => res.obtained < res.total).length
              }}
            </strong>
          </div>
          <div>
            Ressources complètes : 
            <strong>
              {{
                resources.filter((res) => res.obtained >= res.total).length
              }}
            </strong>
          </div>
        </v-col>
        <v-col cols="4" class="d-flex align-center justify-end">
          <v-checkbox
            v-model="showCompleteResources"
            label="Afficher ressources complètes"
            density="compact"
            color="green"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider color="white" class="my-4" :thickness="3"></v-divider>

    <!-- Liste des ressources -->
    <v-card-text>
      <v-list class="bg-blue-grey-lighten-1" dense>
        <v-list-item
          v-for="resource in filteredResources"
          :key="resource.id"
          class="resource-list-item"
          :class="{
            'bg-success': resource.obtained >= resource.total && showCompleteResources,
          }"
        >
          <!-- Partie gauche : Image et nom -->
          <div class="d-flex align-center" style="flex: 1;">
            <v-avatar size="32">
              <v-img
                :src="resource.item_img || 'https://via.placeholder.com/32'"
                alt="resource-image"
              />
            </v-avatar>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ resource.name }}
            </span>
          </div>

          <!-- Partie droite : Quantité -->
          <div style="flex-shrink: 0; text-align: right;">
            {{ resource.obtained }} / {{ resource.total }}
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>

  </v-card>
</template>

<style lang="scss" scoped>
.v-list-item {
  padding: 4px 8px; /* Réduction de l'espacement */
}
.v-avatar {
  flex-shrink: 0;
}
.d-flex {
  gap: 8px; /* Ajustement des écarts */
}
::v-deep(.resource-list-item .v-list-item__content) {
  width: 100% !important;
  display: flex !important;
}
</style>