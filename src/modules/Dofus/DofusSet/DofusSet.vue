<script setup lang="ts">
import { ref, onMounted, computed, reactive, Ref, watch } from 'vue';
import { useFetchItemListWeb } from '../hooks/useFetchItemList'
import { useFetchSetById, useFetchSetList } from '../hooks/useFetchSet';
import { useRoute, useRouter } from 'vue-router';
import AddItemSet from './AddItemSet.vue';
import { useMutationAddItemsToSet, useMutationCreateSet, useMutationDeleteItemsToSet, useMutationDeleteSet, useMutationEditSet, useMutationMultiplier, useMutationQuantityAlreadyObtained } from '../hooks/useMutationSet';
import toast from '@/services/toast';
import ItemListSet from './ItemListSet.vue';
import Resume from './Resume.vue';

const route = useRoute();
const router = useRouter();
const selectedSet: Ref<any> = ref(null);
const setFilter = ref('active')
const setList: Ref<any[]> = ref([])
const filteredSetList = computed(() =>
  setList.value.filter((set) => setFilter.value === 'active' ? set.is_active : !set.is_active)
);
const activeSetCount = computed(() => setList.value.filter(set => set.is_active).length);
const archivedSetCount = computed(() => setList.value.filter(set => !set.is_active).length);
const loadingGlobal = ref(false);

const handleCreateSet = async() => {
  try {
    const { data }: any = await useMutationCreateSet()
    if (!data?.status)
      throw data
    setList.value.push(data.data)
  } catch(err) {
    console.log("%c DofusSet.vue #11 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
}

const handleSelectSet = async(set: any) => {
  try {
    loadingGlobal.value = true;
    await fetchSet(set.idset)
      router.push({
      name: 'dofus-set',
      params: { setCode: set.code },
    });
  } catch(err) {
    console.log("%c DofusSet.vue #11 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  } finally {
    loadingGlobal.value = false;
  }
};

const handleEditSet = async() => {
  try {
    const { data } = await useMutationEditSet(setToEdit.value.idset, {
      name: {
        value: setToEdit.value.name,
        type: "string",
      },
    })
    if (!data?.status)
      throw data

    const { data: data2 } = await useFetchSetById(setToEdit.value.idset)
    if (!data2?.status)
      throw data2

    const index = setList.value.findIndex((item) => item.idset === setToEdit.value.idset);
    if (index !== -1) {
      setList.value[index].name = data2.data.name;
      setList.value[index].code = data2.data.code;
    }

    if (selectedSet.value?.idset === setToEdit.value.idset) {
      router.push({ name: 'dofus-set', params: { setCode: data2.data.code } });
    }

    setToEdit.value = null;
    editSetDialog.value = false;
  } catch(err: any) {
    console.log("%c DofusSet.vue #49 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
    toast.error(err?.msg ? err.msg : "Une erreur est survenue lors de l'archivage du set.");
  }
}
const editSetDialog = ref(false);
const setToEdit = ref<any>(null);
const nameRequiredRule = (v: string) => !!v || "Le nom est obligatoire.";
const maxLengthRule = (v: string) => (v?.length <= 30) || "Le nom doit contenir au maximum 30 caractères.";
const openEditSetDialog = (set: any) => {
  setToEdit.value = { ...set };
  editSetDialog.value = true;
};
const closeEditSetDialog = () => {
  editSetDialog.value = false;
  setToEdit.value = null;
};

const handleArchiveSet = async(set: any) => {
  try {
    const { data } = await useMutationEditSet(set.idset, {
      is_active: {
        value: false,
        type: "boolean",
      },
    })
    if (!data?.status)
      throw data

    const index = setList.value.findIndex((item) => item.idset === set.idset);
    if (index !== -1) {
      setList.value[index].is_active = false;
    }

    if (selectedSet.value?.idset === set.idset) {
      selectedSet.value = null;
      router.push({ name: 'dofus-set', params: {} });
    }
  } catch(err: any) {
    console.log("%c DofusSet.vue #49 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
    toast.error(err?.msg ? err.msg : "Une erreur est survenue lors de l'archivage du set.");
  }
}
const handleUnarchiveSet = async(set: any) => {
  try {
    const { data } = await useMutationEditSet(set.idset, {
      is_active: {
        value: true,
        type: "boolean",
      },
    })
    if (!data?.status)
      throw data

    const index = setList.value.findIndex((item) => item.idset === set.idset);
    if (index !== -1) {
      setList.value[index].is_active = true;
    }

    if (selectedSet.value?.idset === set.idset) {
      setFilter.value = 'active';

      router.push({ name: 'dofus-set', params: { setCode: set.code } });
    }
  } catch(err: any) {
    console.log("%c DofusSet.vue #49 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
    toast.error(err?.msg ? err.msg : "Une erreur est survenue lors de l'archivage du set.");
  }
}
const handleDeleteSet = async() => {
  try {
    if (!setToDelete.value) return;

    const { data } = await useMutationDeleteSet(setToDelete.value.idset);

    if (!data?.status) throw data;

    const index = setList.value.findIndex((item) => item.idset === setToDelete.value.idset);
    if (index !== -1) {
      setList.value.splice(index, 1);
    }

    setToDelete.value = null;
    deleteSetDialog.value = false;

    toast.success("Set supprimé avec succès.");
  } catch (err) {
    console.log("%c DofusSet.vue #56 || err : ", "background:red;color:#fff;font-weight:bold;", err);
    toast.error("Erreur lors de la suppression du set.");
  }
}
const deleteSetDialog = ref(false);
const setToDelete = ref<any>(null);
const openDeleteSetDialog = (set: any) => {
  setToDelete.value = { ...set };
  deleteSetDialog.value = true;
};
const closeDeleteSetDialog = () => {
  setToDelete.value = null;
  deleteSetDialog.value = false;
};

const handleAddItemsToSet = async(data: any) => {
  try {
    loadingGlobal.value = true
    const idItems = data.map((item: any) => item.iditem);
    const result = await useMutationAddItemsToSet(selectedSet.value.idset, idItems)
    if (!result.data?.status)
      throw result.data

    await fetchSet(selectedSet.value.idset)
  } catch(err) {
    console.log("%c DofusSet.vue #12 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  } finally {
    loadingGlobal.value = false
  }
}

const handleDeleteItemToSet = async(item: any) => {
  try {
    loadingGlobal.value = true
    const iditem = item.iditem;
    const result = await useMutationDeleteItemsToSet(selectedSet.value.idset, [iditem])
    if (!result.data?.status)
      throw result.data

    await fetchSet(selectedSet.value.idset)
  } catch(err) {
    console.log("%c DofusSet.vue #12 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  } finally {
    loadingGlobal.value = false
  }
}

const handleMultiplierUpdate = async(item: any) => {
  try {
    const iditem = item.iditem;
    const multiplier = item.multiplier;
    const result = await useMutationMultiplier(selectedSet.value.idset, iditem, multiplier)
    if (!result.data?.status)
      throw result.data

    await fetchSet(selectedSet.value.idset)
  } catch(err) {
    console.log("%c DofusSet.vue #12 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
}

const handleUpdateQtyAlreadyObtained = async(item: any) => {
  try {
    const result = await useMutationQuantityAlreadyObtained(selectedSet.value.idset, item.idrecipe_item_has_set, item.quantity_already_obtained)
    if (!result.data?.status)
      throw result.data

    // await fetchSet(selectedSet.value.idset)
  } catch(err) {
    console.log("%c DofusSet.vue #12 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
}

const fetchSet = async(idset: any) => {
  try {
    const idSet = idset || selectedSet.value?.idset;
    const { data } = await useFetchSetById(idSet)
    if (!data?.status)
      throw data
    selectedSet.value = data.data
  } catch(err) {
    console.log("%c DofusSet.vue #12 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  }
}

const fetchSetInfo = async (setCode: string | undefined) => {
  console.log("fetchSetInfo", setCode);
  if (!setCode) {
    selectedSet.value = null;
    return;
  }

  const set = setList.value.find((set) => set.code === setCode);

  console.log("%c DofusSet.vue #224 || set : ", 'background:red;color:#fff;font-weight:bold;',  set);

  if (!set) {
    selectedSet.value = null;
    router.push({ name: 'dofus-set', params: {} });
    return
  }
  selectedSet.value = set;
};

onMounted(async() => {
  try {
    loadingGlobal.value = true
    const { data } = await useFetchSetList()
    if (!data?.status)
      throw data
    setList.value = data.data
    fetchSetInfo(route.params.setCode as string | undefined);
  } catch(err) {
    console.log("%c DofusSet.vue #12 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
  } finally {
    loadingGlobal.value = false
  }
})

</script>

<template>
  <div class="dofus-set">

    <v-overlay
      :model-value="loadingGlobal"
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

    <div class="d__container d__left">

      <!-- Édition d'un set -->
      <v-dialog v-model="editSetDialog" persistent max-width="400">
        <v-card v-if="setToEdit">
          <v-card-title class="text-h6">
            Édition du set
          </v-card-title>
          <v-card-text>
            <v-text-field
              label="Nom du set"
              v-model="setToEdit.name"
              :rules="[nameRequiredRule, maxLengthRule]"
              maxlength="30"
              counter
              outlined
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="green" variant="text" @click="handleEditSet">Valider</v-btn>
            <v-btn variant="text" @click="closeEditSetDialog">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- suppression d'un set -->
      <v-dialog v-model="deleteSetDialog" persistent max-width="400">
        <v-card>
          <v-card-title class="text-h6">
            Confirmer la suppression
          </v-card-title>
          <v-card-text>
            Êtes-vous sûr de vouloir supprimer le set <strong>{{ setToDelete?.name }}</strong> ?
            Cette action est irréversible.
          </v-card-text>
          <v-card-actions>
            <v-btn color="red" variant="text" @click="handleDeleteSet">Supprimer</v-btn>
            <v-btn variant="text" @click="closeDeleteSetDialog">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Segmented Button -->
      <v-btn-toggle v-model="setFilter" class="mb-4">
        <v-btn value="active" color="success" depressed>
          <v-icon left>mdi-check</v-icon>
          Actifs ({{ activeSetCount }})
        </v-btn>
        <v-btn value="archived" color="grey darken-1" depressed>
          <v-icon left>mdi-archive</v-icon>
          Archivés ({{ archivedSetCount }})
        </v-btn>
      </v-btn-toggle>
      
      <v-list nav>

        <v-list-item 
          v-if="setFilter !== 'archived'" 
          disabled
          append-icon="mdi-import" 
          title="Importer un set" 
          value="import_set"
          class="d__l__set d__l__set-import bg-grey"
          @click=""
        ></v-list-item>

        <v-list-item 
          v-if="setFilter !== 'archived'" 
          append-icon="mdi-plus-circle" 
          title="Ajouter un set" 
          value="add_set"
          class="d__l__set d__l__set-import bg-green"
          @click="handleCreateSet"
        ></v-list-item>

        <v-list-item 
          v-for="set in filteredSetList"
          :key="set.idset"
          @click="handleSelectSet(set)"
          class="d__l__set opacity-80"
          :class="[
            selectedSet?.idset === set.idset 
              ? 'bg-amber-lighten-1' 
              : setFilter === 'active' 
                ? 'bg-cyan-darken-3' 
                : 'bg-blue-grey'
          ]"
        >
          <!-- Titre principal -->
          <v-list-item-title class="multi-line">{{ set.name }}</v-list-item-title>

          <!-- Icône personnalisée en append -->
          <v-speed-dial
            location="right center"
            transition="slide-y-reverse-transition"
            class="speed-dial"
          >
            <template v-slot:activator="{ props: activatorProps }" #append>
              <v-icon 
                small 
                v-bind="activatorProps"
                class="custom-append-icon" 
              >
                mdi-menu
              </v-icon>
            </template>

            <v-btn
              v-if="setFilter !== 'archived'"
              key="edit"
              class="bg-blue darken-2"
              icon="mdi-pencil"
              @click="openEditSetDialog(set)"
            ></v-btn>

            <!-- Bouton archiver/désarchiver -->
            <v-btn
              key="archive"
              :class="setFilter === 'archived' ? 'bg-green darken-2' : 'bg-blue-grey darken-2'"
              :icon="setFilter === 'archived' ? 'mdi-archive-arrow-up' : 'mdi-archive'"
              @click="setFilter === 'archived' ? handleUnarchiveSet(set) : handleArchiveSet(set)"
            ></v-btn>
            <v-btn
              key="delete"
              class="bg-red darken-2"
              icon="mdi-delete"
              @click="openDeleteSetDialog(set)"
            ></v-btn>

          </v-speed-dial>

        </v-list-item>

      </v-list>
    </div>

    <div class="d__container d__center">
      <ItemListSet
        :itemList="selectedSet ? selectedSet.items : []"
        @fetch-set="fetchSet"
        @update-multiplier="handleMultiplierUpdate"
        @delete-item="handleDeleteItemToSet"
        @update-qty-already-obtained="handleUpdateQtyAlreadyObtained"
        @add-custom-item="handleAddItemsToSet"
      />
    </div>

    <div class="d__container d__right">
      <AddItemSet
        :isVisible="selectedSet ? true : false"
        :itemListSet="selectedSet ? selectedSet.items : []"
        @add-items="handleAddItemsToSet"
      />
      <Resume
        :itemList="selectedSet ? selectedSet.items : []"
        :isVisible="selectedSet ? true : false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dofus-set {
  padding: 3rem 0;
  display: flex;
  justify-content: space-between;


  & .custom-append-icon {
    position: absolute;
    right: 2%;
    top: 20%;
    font-size: 30px; /* Taille de l'icône */
    color: inherit; /* Inhérence de la couleur */
    cursor: pointer; /* Pointeur de clic */
    display: flex;
    align-items: center; /* Alignement vertical centré */
    justify-content: center;
    /* Transition pour les animations */
    transition: transform 0.2s ease, font-size 0.2s ease;
  }
  /* Effet au survol */
  & .custom-append-icon:hover {
    font-size: 32px; /* Augmentation légère de la taille */
    transform: scale(1.1); /* Légère mise en avant */
  }


  & .multi-line {
    white-space: normal; /* Autorise les retours à la ligne */
    word-wrap: break-word; /* Coupe les mots longs si nécessaire */
    overflow: visible; /* Empêche le texte d'être tronqué */
  }

  & .d__container {
    &.d__left {
      width: 20%;
      padding: 0 1rem;

      & .d__l__set {
        padding: 0 0.5rem;

        & .v-list-item-title {
          font-weight: bold;
        }
      }
    }

    &.d__right {
      width: 40%;
      padding: 0 1rem;
    }

    &.d__center {
      width: 100%;
    }
  }
}
</style>