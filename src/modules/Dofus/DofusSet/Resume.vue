<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, Ref, watch } from 'vue';
import { useMutationCreateShareLink } from '../hooks/useMutationSet';
import { copyToClipboard } from '@/utils/Core/string';
import toast from '@/services/toast';

const emit = defineEmits(['']);

const props = defineProps({
  isVisible: {
    type: [Boolean, null],
    required: true,
  },
  itemList: {
    type: Array,
    required: true,
    default: [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  idset: {
    type: Number || null,
    required: true,
  },
});

const showShareDialog = ref(false);
const shareLink = ref('');
const isLoadingShare = ref(false);

const shareSet = async () => {
  try {
    isLoadingShare.value = true;
    shareLink.value = '';
    const { data } = await useMutationCreateShareLink(props.idset);
    shareLink.value = data.data.link;
  } catch (error) {
    console.error('Erreur lors du partage du set:', error);
  } finally {
    isLoadingShare.value = false;
  }
};

const handleCopyToClipboard = async () => {
  if (!shareLink.value) return;

  const result = await copyToClipboard(shareLink.value);
  if (result) toast.success(`Lien du set copié dans le presse-papier`);
  else toast.error(`Erreur lors de la copie dans le presse-papier`);
};
const handleCopyResourceName = async (name: string) => {
  const result = await copyToClipboard(name);
  if (result) toast.success(`Nom copié : "${name}`);
  else toast.error(`Erreur lors de la copie dans le presse-papier`);
};

watch(showShareDialog, (newValue) => {
  if (newValue) shareLink.value = '';
});

// ---------- États ----------

const showCompleteResources = ref(false);

// Tri dynamique
const sortKey = ref<'name' | 'quantity'>('name');
const sortDirection = ref<'asc' | 'desc'>('asc');

// ---------- Calculs dynamiques ----------

const totalItemsToCraft = computed(() => props.itemList.length);

const totalSetPrice: Ref<any> = computed(() =>
  props.itemList.reduce(
    (sum: any, item: any) =>
      sum + item.item_average_price * (item.multiplier || 1),
    0
  )
);

const craftableSetPrice: Ref<any> = computed(() =>
  props.itemList.reduce((sum: any, item: any) => {
    return (
      sum +
      item.recipe.reduce((recipeSum: any, ingredient: any) => {
        return (
          recipeSum +
          ingredient.total_quantity_required * ingredient.item_average_price
        );
      }, 0) *
        (item.multiplier || 1)
    );
  }, 0)
);

const totalCraftPriceAdjusted: Ref<any> = computed(() =>
  props.itemList.reduce((sum: any, item: any) => {
    const multiplier = item.multiplier || 1;

    return (
      sum +
      item.recipe.reduce((recipeSum: any, ingredient: any) => {
        const totalQtyRequired = ingredient.total_quantity_required * multiplier;
        const remainingQty = Math.max(
          totalQtyRequired - ingredient.quantity_already_obtained,
          0
        );
        return recipeSum + remainingQty * ingredient.item_average_price;
      }, 0)
    );
  }, 0)
);

// ---------- Agrégation des ressources ----------

const resources = computed(() => {
  const resourceMap = new Map<number, any>();

  props.itemList.forEach((item: any) => {
    const multiplier = item.multiplier || 1;

    item.recipe.forEach((ingredient: any) => {
      const totalRequired = ingredient.total_quantity_required * multiplier;
      const already = ingredient.quantity_already_obtained || 0;
      const unitPrice = ingredient.item_average_price || 0;
      const remaining = Math.max(totalRequired - already, 0);
      const totalPriceRemaining = remaining * unitPrice;

      const existing = resourceMap.get(ingredient.iditem);
      if (existing) {
        existing.total += totalRequired;
        existing.obtained += already;
        existing.remaining = Math.max(existing.total - existing.obtained, 0);
        existing.totalPriceRemaining =
          existing.remaining * existing.unitPrice;
      } else {
        resourceMap.set(ingredient.iditem, {
          id: ingredient.iditem,
          name: ingredient.item_name,
          item_img: ingredient.item_img,
          total: totalRequired,
          obtained: already,
          remaining,
          unitPrice,
          totalPriceRemaining,
        });
      }
    });
  });

  return Array.from(resourceMap.values());
});

// ---------- Tri et filtrage ----------

const sortedResources = computed(() => {
  const arr = [...resources.value];

  arr.sort((a, b) => {
    if (sortKey.value === 'name') {
      const res = a.name.localeCompare(b.name);
      return sortDirection.value === 'asc' ? res : -res;
    } else {
      const res = a.remaining - b.remaining;
      return sortDirection.value === 'asc' ? res : -res;
    }
  });

  return arr;
});

const filteredResources = computed(() => {
  // clone pour éviter toute mutation involontaire
  const baseList = [...sortedResources.value];

  if (showCompleteResources.value) {
    // afficher TOUTES les ressources, triées
    return baseList;
  } else {
    // n’afficher que celles incomplètes
    return baseList.filter((res) => res.obtained < res.total);
  }
});

// ---------- Méthodes d’UI ----------

const toggleSort = (key: 'name' | 'quantity') => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'asc';
  }
};

const formatPrice = (price: number): string => {
  return price.toLocaleString('fr-FR');
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
          <v-card-title class="text-h6 text-white justify-center pb-4">
            Actions de partage
          </v-card-title>

          <v-card-text class="d-flex flex-column gap-4">
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

            <v-btn color="grey darken-1" variant="flat" block rounded disabled>
              Exporter le set
            </v-btn>
          </v-card-text>

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

    <v-divider color="white" class="my-4" :thickness="3" />

    <!-- Infos globales -->
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

    <v-divider color="white" class="my-4" :thickness="3" />

    <!-- Ressources -->
    <v-card-text>
      <v-row>
        <v-col cols="8">
          <div>Nombre de ressources : <strong>{{ resources.length }}</strong></div>
          <div>
            Ressources manquantes :
            <strong>{{ resources.filter((r) => r.obtained < r.total).length }}</strong>
          </div>
          <div>
            Ressources complètes :
            <strong>{{ resources.filter((r) => r.obtained >= r.total).length }}</strong>
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

    <v-divider color="white" class="my-4" :thickness="3" />

    <!-- Boutons de tri -->
    <v-card-text class="d-flex gap-2 justify-end mb-2">
      <v-btn
        variant="outlined"
        color="cyan"
        @click="toggleSort('name')"
        :append-icon="
          sortKey === 'name'
            ? sortDirection === 'asc'
              ? 'mdi-arrow-up'
              : 'mdi-arrow-down'
            : ''
        "
      >
        Nom
      </v-btn>

      <v-btn
        variant="outlined"
        color="cyan"
        @click="toggleSort('quantity')"
        :append-icon="
          sortKey === 'quantity'
            ? sortDirection === 'asc'
              ? 'mdi-arrow-up'
              : 'mdi-arrow-down'
            : ''
        "
      >
        Quantité
      </v-btn>
    </v-card-text>

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
          <div class="d-flex align-center justify-space-between w-100">
            <!-- Image + nom -->
            <div class="d-flex align-center" style="gap: 8px;">
              <v-avatar size="32">
                <v-img
                  :src="resource.item_img || 'https://via.placeholder.com/32'"
                  alt="resource-image"
                />
              </v-avatar>
              <span class="truncate" @click="handleCopyResourceName(resource.name)">{{ resource.name }}</span>
            </div>

            <!-- Quantités -->
            <div class="text-right">
              <div>{{ resource.obtained }} / {{ resource.total }}</div>
              <div class="text-caption">
                {{ formatPrice(resource.unitPrice) }} ₭ /u
              </div>
              <div class="text-caption text-yellow-accent-2">
                Restant : {{ formatPrice(resource.totalPriceRemaining) }} ₭
              </div>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
.v-list-item {
  padding: 6px 10px;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}
</style>
