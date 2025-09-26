<!-- src/views/health/weight/WeightAdd.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useCreateWeightLog } from '../hooks/useMutationWeightLog';

type CreatePayload = { weightKg: number; loggedAt?: string; notes?: string };

type ApiResponse<T> = { data: T; msg?: string };

const loading = ref(false);
const success = ref(false);
const error = ref<string | null>(null);

// Champs (mobile-first)
const weightKg = ref<string>('');           // string pour gérer précisément les décimales
const useCustomDate = ref(false);
const loggedAt = ref<string | null>(null);  // "YYYY-MM-DDTHH:mm"
const notes = ref<string>('');

// Helpers
function resetForm() {
  weightKg.value = '';
  useCustomDate.value = false;
  loggedAt.value = null;
  notes.value = '';
  error.value = null;
  success.value = false;
}

function toIsoWithOffset(dtLocal: string): string {
  // Convertit "YYYY-MM-DDTHH:mm" (local) en ISO avec offset
  const local = new Date(dtLocal);
  if (isNaN(local.getTime())) return '';
  const tzOffsetMin = -local.getTimezoneOffset();
  const sign = tzOffsetMin >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const hh = pad(Math.trunc(tzOffsetMin / 60));
  const mm = pad(tzOffsetMin % 60);
  const yyyy = local.getFullYear();
  const MM = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const HH = String(local.getHours()).padStart(2, '0');
  const mi = String(local.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${HH}:${mi}:00${sign}${hh}:${mm}`;
}

async function submit() {
  error.value = null;
  success.value = false;

  const kg = Number(weightKg.value);
  if (!weightKg.value || isNaN(kg) || kg < 0) {
    error.value = 'Veuillez saisir un poids valide (kg ≥ 0).';
    return;
  }

  const payload: CreatePayload = { weightKg: Number(kg.toFixed(3)) };
  if (useCustomDate.value && loggedAt.value) {
    const iso = toIsoWithOffset(loggedAt.value);
    if (iso) payload.loggedAt = iso;
  }
  if (notes.value.trim()) payload.notes = notes.value.trim();

  loading.value = true;
  try {
    const res = await useCreateWeightLog(payload) as any as { status: number; data?: ApiResponse<any> };
    if (res.status >= 200 && res.status < 300) {
      success.value = true;
      // reset léger (mobile: enchaîner la saisie rapide)
      weightKg.value = '';
      notes.value = '';
    } else {
      error.value = res?.data?.msg || 'Erreur inconnue lors de l’enregistrement.';
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || e?.message || 'Erreur lors de l’enregistrement.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-card class="pa-3" variant="outlined">
    <v-card-title class="text-subtitle-1">Ajouter</v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="weightKg"
          label="Poids (kg)"
          type="number"
          step="0.001"
          min="0"
          density="comfortable"
          hide-details="auto"
          :disabled="loading"
          required
        />

        <v-switch
          class="mt-2"
          v-model="useCustomDate"
          label="Saisir l'heure manuellement"
          density="comfortable"
          :disabled="loading"
          hide-details
        />

        <v-text-field
          v-if="useCustomDate"
          class="mt-1"
          v-model="loggedAt"
          label="Date & heure"
          type="datetime-local"
          density="comfortable"
          hide-details="auto"
          :disabled="loading"
        />

        <v-textarea
          class="mt-3"
          v-model="notes"
          label="Notes (optionnel)"
          auto-grow
          rows="2"
          :disabled="loading"
        />

        <div class="mt-4 d-flex" style="gap:12px;">
          <v-btn :loading="loading" :disabled="loading" color="primary" @click="submit">
            Enregistrer
          </v-btn>
          <v-btn variant="tonal" :disabled="loading" @click="resetForm">
            Réinitialiser
          </v-btn>
        </div>

        <div class="mt-3">
          <v-alert
            v-if="success"
            type="success"
            density="comfortable"
            title="Succès"
            text="Poids enregistré."
          />
          <v-alert
            v-if="error"
            type="error"
            density="comfortable"
            title="Erreur"
            :text="error"
          />
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Mobile-first: pas de media queries desktop */
</style>
