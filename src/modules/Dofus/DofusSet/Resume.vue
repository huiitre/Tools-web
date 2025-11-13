<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, Ref, watch } from 'vue';
import { useMutationCreateShareLink } from '../hooks/useMutationSet';
import { copyToClipboard } from '@/utils/Core/string';
import toast from '@/services/toast';

const emit = defineEmits(['toggle-resource']);

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

const showResources = ref(false);

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
const sortKey = ref<'name' | 'quantity' | 'price'>('name');
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
    } else if (sortKey.value === 'quantity') {
      const res = a.total - b.total;
      return sortDirection.value === 'asc' ? res : -res;
    } else if (sortKey.value === 'price') {
      const res = a.totalPriceRemaining - b.totalPriceRemaining;
      return sortDirection.value === 'asc' ? res : -res;
    }
    return 0;
  });

  return arr;
});

const filteredResources = computed(() => {
  const baseList = [...sortedResources.value];
  if (showCompleteResources.value) {
    return baseList;
  } else {
    return baseList.filter((res) => res.obtained < res.total);
  }
});

// ---------- Méthodes d’UI ----------

const toggleSort = (key: 'name' | 'quantity' | 'price') => {
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

// ---------- Événements ----------

const handleToggleCheckbox = (resource: any, checked: boolean) => {
  emit('toggle-resource', { iditem: resource.id, checked: checked });
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

    <!-- LIGNE COMPACTE : infos globales + ressources -->
    <v-card-text class="mb-2">
      <v-row class="align-center">
        <v-col cols="12" class="d-flex flex-wrap" style="gap: 18px;">

          <!-- Infos globales -->
          <div>Objets : <span class="font-weight-bold">{{ totalItemsToCraft }}</span></div>
          <div>Prix total : <span class="font-weight-bold">{{ formatPrice(totalSetPrice) }} ₭</span></div>
          <div>À craft : <span class="font-weight-bold">{{ formatPrice(craftableSetPrice) }} ₭</span></div>
          <div>Ajusté : <span class="font-weight-bold">{{ formatPrice(totalCraftPriceAdjusted) }} ₭</span></div>

          <!-- Infos ressources -->
          <div>Ressources : <span class="font-weight-bold">{{ resources.length }}</span></div>
          <div>Manquantes : <span class="font-weight-bold">{{ resources.filter((r) => r.obtained < r.total).length }}</span></div>
          <div>Complètes : <span class="font-weight-bold">{{ resources.filter((r) => r.obtained >= r.total).length }}</span></div>

        </v-col>
      </v-row>

      <!-- Checkbox juste en dessous -->
      <div class="mt-2">
        <v-checkbox
          v-model="showCompleteResources"
          label="Afficher ressources complètes"
          density="compact"
          color="green"
          hide-details
        />
      </div>
    </v-card-text>

    <v-divider color="white" class="my-4" :thickness="3" />

    <!-- ⬇️ Toggle section -->
    <v-card-text class="d-flex align-center justify-space-between mb-2"
                style="cursor: pointer;"
                @click="showResources = !showResources">

      <span class="text-h6 font-weight-bold">Ressources</span>

      <v-icon size="32" color="white">
        {{ showResources ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>

    </v-card-text>

    <!-- 🔽 Contenu repliable -->
    <v-expand-transition>
      <div v-if="showResources">

        <!-- Boutons de tri -->
        <v-card-text class="d-flex gap-2 justify-start mb-2">
          <v-btn
            variant="outlined"
            color="white"
            @click="toggleSort('name')"
            :append-icon="sortKey === 'name'
              ? (sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down')
              : ''"
          >
            Nom
          </v-btn>

          <v-btn
            variant="outlined"
            color="white"
            @click="toggleSort('quantity')"
            :append-icon="sortKey === 'quantity'
              ? (sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down')
              : ''"
          >
            Quantité
          </v-btn>

          <v-btn
            variant="outlined"
            color="white"
            @click="toggleSort('price')"
            :append-icon="sortKey === 'price'
              ? (sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down')
              : ''"
          >
            Prix restant
          </v-btn>
        </v-card-text>

        <!-- Liste des ressources -->
        <v-card-text>
          <v-row dense>
            <v-col
              v-for="resource in filteredResources"
              :key="resource.id"
              cols="12"
              md="3"
            >
              <v-list-item
                class="resource-list-item bg-blue-grey-lighten-1"
                :class="{
                  'bg-success': resource.obtained >= resource.total && showCompleteResources,
                }"
              >
                <div class="d-flex align-center justify-space-between w-100">
                  
                  <div class="d-flex align-center" style="gap: 8px;">
                    <v-checkbox
                      density="compact"
                      hide-details
                      :model-value="resource.obtained >= resource.total"
                      @update:model-value="(checked: any) => handleToggleCheckbox(resource, checked)"
                    />
                    <v-avatar size="32">
                      <v-img :src="resource.item_img || 'https://via.placeholder.com/32'" />
                    </v-avatar>
                    <span @click="handleCopyResourceName(resource.name)">
                      {{ resource.name }}
                    </span>
                  </div>

                  <div class="text-right">
                    <div>{{ resource.obtained }} / {{ resource.total }}</div>
                    <div class="text-caption">{{ formatPrice(resource.unitPrice) }} ₭ /u</div>
                    <div class="text-caption text-yellow-accent-2">
                      Restant : {{ formatPrice(resource.totalPriceRemaining) }} ₭
                    </div>
                  </div>

                </div>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>

      </div>
    </v-expand-transition>

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
