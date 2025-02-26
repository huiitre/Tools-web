<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="pa-4" max-width="400">
      <v-card-title class="text-h5 text-center">Répartition d'épargne</v-card-title>
      <v-card-text>
        <!-- Input du montant total -->
        <v-text-field
          v-model="totalAmount"
          label="Montant total (en €)"
          type="number"
          :rules="[maxAmountRule]"
          outlined
          maxlength="5"
          counter="5"
        ></v-text-field>

        <!-- Liste des lignes d'allocation -->
        <div v-for="(allocation, index) in allocations" :key="index" class="d-flex align-center mb-2">
          <v-text-field
            v-model="allocation.name"
            label="Nom de l'épargne"
            outlined
            class="flex-grow-1"
          ></v-text-field>
          <v-text-field
            v-model="allocation.percentage"
            label="Pourcentage (%)"
            type="number"
            outlined
            style="width: 120px;"
          ></v-text-field>
          <v-btn icon color="red" @click="removeAllocation(index)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Bouton pour ajouter une nouvelle ligne -->
        <v-btn variant="text" color="primary" @click="addAllocation">
          <v-icon left>mdi-plus</v-icon> Ajouter une épargne
        </v-btn>

        <!-- Affichage des totaux -->
        <div class="mt-4">
          <div>Total % : {{ sumPercentage }}%</div>
          <div v-if="sumPercentage < 100">
            Reste à répartir : {{ 100 - sumPercentage }}% soit {{ remainingAmount.toFixed(2) }}€
          </div>
          <div v-else-if="sumPercentage > 100" class="error--text">
            La somme des pourcentages dépasse 100% !
          </div>
        </div>

        <!-- Bouton de validation -->
        <v-btn color="success" class="mt-4" @click="calculateAllocations" :disabled="!canValidate">
          Valider
        </v-btn>

        <!-- Affichage des résultats -->
        <div v-if="results.length" class="mt-4">
          <div class="text-h6">Répartition</div>
          <v-list dense>
            <v-list-item v-for="(result, index) in results" :key="index">
              <v-list-item-content>
                <v-list-item-title>
                  {{ result.name }} : {{ result.amount.toFixed(2) }}€
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Allocation {
  name: string;
  percentage: number | null;
}

const totalAmount = ref<number | null>(null);
const allocations = ref<Allocation[]>([]);
const results = ref<{ name: string; amount: number }[]>([]);

// Règle de validation pour limiter le montant à 5 chiffres (max 99999)
const maxAmountRule = (value: number | null) => {
  if (value === null || value === 0) return true;
  return value <= 99999 || 'Le montant ne doit pas dépasser 99999';
};

// Somme des pourcentages saisis
const sumPercentage = computed(() => {
  return allocations.value.reduce((sum, alloc) => sum + (alloc.percentage ? Number(alloc.percentage) : 0), 0);
});

// Montant restant si la somme des pourcentages est inférieure à 100
const remainingAmount = computed(() => {
  if (totalAmount.value === null || totalAmount.value === 0) return 0;
  return ((100 - sumPercentage.value) * totalAmount.value) / 100;
});

// Ajoute une nouvelle ligne d'allocation
const addAllocation = () => {
  allocations.value.push({ name: '', percentage: null });
};

// Retire une ligne d'allocation
const removeAllocation = (index: number) => {
  allocations.value.splice(index, 1);
};

// On peut valider si :
// - Un montant total a été saisi et > 0
// - La somme des pourcentages n'excède pas 100
// - Au moins une ligne d'allocation existe et chaque ligne possède un nom et un pourcentage
const canValidate = computed(() => {
  return (
    totalAmount.value !== null &&
    totalAmount.value > 0 &&
    sumPercentage.value <= 100 &&
    allocations.value.length > 0 &&
    allocations.value.every(alloc => alloc.name.trim() !== '' && alloc.percentage !== null)
  );
});

// Calcule pour chaque allocation le montant en euros
const calculateAllocations = () => {
  if (!canValidate.value || totalAmount.value === null) return;
  results.value = allocations.value.map(alloc => {
    const pct = alloc.percentage ? Number(alloc.percentage) : 0;
    const amount = (totalAmount.value! * pct) / 100;
    return { name: alloc.name, amount };
  });
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
