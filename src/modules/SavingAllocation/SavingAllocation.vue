<template>
  <div id="saving-allocation">
    <div class="s__recap">

      <div class="s__r__allocationList">
        <div
          class="s__r__a__elem"
          v-for="asso in displayAllocations"
          :key="asso.id"
        >
          <div class="s__r__a__e__libelle">
            {{ asso.name }} ({{ asso.percent }}%) :
          </div>
          <div class="s__r__a__e__value">
            {{ asso.calculatedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} €
          </div>
        </div>
      </div>

      <div class="s__r__infos">
        <div class="s__r__total s__r__elem">
          <div class="s__r__e__libelle">Total (%) : &nbsp;</div>
          <div class="s__r__e__value">{{ totalPercent }} %</div>
        </div>
        <div class="s__r__restant s__r__elem">
          <div class="s__r__e__libelle">Restant : &nbsp;</div>
          <div class="s__r__e__value">{{ remainingAmount }} € ({{ remainingPercent }} %)</div>
        </div>
      </div>

    </div>

    <div class="s__amount">
      <div class="s__a__amount-field">
        <v-text-field
          v-model="amount"
          type="number"
          step="any"
          variant="solo"
          label="Montant à allouer"
          clearable
          hide-spin-buttons
          :rules="amountRules"
          class="s__a__a__field"
        >
          <template v-slot:append-inner>
            <v-icon size="32px">mdi-currency-eur</v-icon>
          </template>
        </v-text-field>
      </div>

      <div class="s__a__add-allocation">
        <v-btn icon color="primary" @click="addAllocation">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="s__allocationList">
      <v-row
        class="mb-2"
        v-for="asso in assoList"
        :key="asso.id"
        align="center"
        no-gutters
        :class="{ 'error-row': isRowInError(asso) }"
      >
        <v-col cols="6">
          <v-text-field
            v-model="asso.name"
            outlined
            counter="50"
            density="compact"
            variant="solo"
            :rules="nomRules"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="3" class="ml-2">
          <v-text-field
            v-model="asso.percent"
            outlined
            type="number"
            hide-spin-buttons
            counter="50"
            density="compact"
            variant="solo"
            :rules="pourcentageRules"
            hide-details
          >
            <template v-slot:append-inner>
              <v-icon size="24px">mdi-percent</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="2" class="d-flex justify-end">
          <v-btn icon color="red" tile rounded small @click="removeAllocation(asso.id)">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { ref, computed, Ref } from 'vue';

//* règles de l'input principal
const amountRules = ref([
  (v: number) => !!v || 'Valeur incorrect',
  (v: number) => (v && v <= 10000) || 'Maximum 10 000 € autorisé',
])

const nomRules  = ref([
  (v: string) => !!v || 'Valeur manquante',
  (v: string) => (v && v.length <= 50) || 'Maximum 50 caractères'
])

const pourcentageRules = ref([
  (v: number) => (!!v && !isNaN(Number(v))) || 'Valeur incorrect',
  (v: number) => (v && Number(v) <= 100) || 'Maximum 100% autorisé'
])

const amount: Ref<number|undefined> = ref()

const remainingPercent = computed(() => Number((100 - totalPercent.value).toFixed(2)));
const remainingAmount = computed(() => Number(((amount.value || 0) - ((amount.value || 0) * totalPercent.value / 100)).toFixed(2)));

const isRowInError = (asso: any) => {
  const nomErrors = nomRules.value
    .map(rule => rule(asso.name))
    .filter(result => result !== true)
  const percentErrors = pourcentageRules.value
    .map(rule => rule(asso.percent))
    .filter(result => result !== true)
  return nomErrors.length > 0 || percentErrors.length > 0
}

const totalPercent = computed(() => {
  let sum = 0;
  // On ne considère que les lignes sans erreur
  assoList.value.forEach((asso: any) => {
    if (!isRowInError(asso)) {
      sum += Number(asso.percent);
      if (sum > 100) sum = 100; // On plafonne à 100%
    }
  });
  return Number(sum.toFixed(2));
});

const extraErrorIds = computed(() => {
  let sum = 0;
  const extraIds: any = [];
  // Parcourir uniquement les lignes valides
  assoList.value.filter((asso: any) => !isRowInError(asso)).forEach((asso: any) => {
    if (sum < 100) {
      if (sum + Number(asso.percent) <= 100) {
        sum += Number(asso.percent);
      } else {
        extraIds.push(asso.id);
        sum = 100;
      }
    } else {
      extraIds.push(asso.id);
    }
  });
  return extraIds;
});

const errorIds = computed(() => {
  // IDs des lignes qui échouent les règles existantes
  const ruleErrorIds = assoList.value
    .filter((asso: any) => isRowInError(asso))
    .map((asso: any) => asso.id);
  // Union des IDs provenant des règles et des lignes en excès
  return [...new Set([...ruleErrorIds, ...extraErrorIds.value])];
});

const STORAGE_KEY = 'TOOLS_SAVING_ALLOCATION_DATA';
const storedAssoList = localStorage.getItem(STORAGE_KEY);
const assoList = ref(storedAssoList ? JSON.parse(storedAssoList) : []);

watch(assoList, (newList) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
}, { deep: true });

const displayAllocations = computed(() => {
  return assoList.value.map((asso: any) => {
    const calculatedAmount = amount.value
      ? Number(((amount.value * (asso.percent || 0)) / 100).toFixed(2))
      : 0;
    return {
      ...asso,
      calculatedAmount
    };
  });
});

let uniqueId = 1000;

const getUniqueName = (baseName = 'Nouveau') => {
  const existingNames = assoList.value.map((a: any) => a.name);
  if (!existingNames.includes(baseName)) return baseName;

  let i = 1;
  while (existingNames.includes(`${baseName} (${i})`)) {
    i++;
  }
  return `${baseName} (${i})`;
};

const addAllocation = () => {
  const newAsso = {
    id: ++uniqueId,
    name: getUniqueName(),
    percent: 0,
    amount: 0
  };
  assoList.value.push(newAsso);
};

const removeAllocation = (id: number) => {
  assoList.value = assoList.value.filter((asso: any) => asso.id !== id);
};

</script>

<style scoped lang="scss">
.error-row {
  background-color: #ff00001a;
}

#saving-allocation {
  width: 400px;
  max-width: 100%; /* Si la fenêtre est plus petite, il prend toute la largeur */
  margin: 2rem auto;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  box-shadow: 0 4px 8px #00000033;

  /* récapitulatif */
  .s__recap {
    padding: 1rem;
    background-color: #8b2dff59;
    border: 2px solid #8b2dffb1;
    margin-bottom: 1rem;

    /* liste des épargnes et résultat */
    .s__r__allocationList {
      margin-bottom: 1.2rem;

      .s__r__a__elem {
        display: flex;
        font-size: 0.9rem;
        justify-content: space-between;

        &:not(:last-child) {
          margin-bottom: 0.2rem;
        }

        .s__r__a__e__libelle {
          
        }
        .s__r__a__e__value {
          font-weight: bold;
        }
      }
    }

    /* infos génériques (total, restant) */
    .s__r__infos {

      .s__r__elem {
        display: flex;
        font-style: italic;
        font-size: 0.8rem;

        &:not(:last-child) {
          margin-bottom: 0.2rem;
        }

        & .s__r__e__libelle {
          
        }
        & .s__r__e__value {
          font-weight: bold;
        }
      }
      .s__r__total {

      }
      .s__r__restant {

      }
    }
  }

  /* input principal montant à épargner */
  .s__amount {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;

    .s__a__amount-field {
      width: 100%;

      .s__a__a__field {
        font-weight: bold;

        .v-input__control {
          color: red;
        }
      }
    }
  }
}
</style>
