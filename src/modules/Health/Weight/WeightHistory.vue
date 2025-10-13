<!-- src/views/health/weight/WeightHistory.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useFetchWeightLogs } from '../hooks/useFetchWeightLog';
import { useDeleteWeightLog } from '../hooks/useMutationWeightLog';
import toast from '@/services/toast';

type WeightLog = {
  id: number;
  iduser: number;
  weightKg: number;
  loggedAt: string;     // ISO string
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = { data: T; msg?: string };

const loading = ref(false);
const error = ref<string | null>(null);
const items = ref<WeightLog[]>([]);

function formatDateTime(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${MM}/${yyyy} ${hh}:${mm}`;
  } catch {
    return iso || '';
  }
}

const enriched = computed(() => {
  // On suppose l’API renvoie déjà trié desc par loggedAt.
  // delta = current - previous (donc négatif = perte de poids)
  return items.value.map((it, idx) => {
    const prev = items.value[idx + 1]; // élément suivant dans la liste (plus ancien)
    let delta: number | null = null;
    if (prev) {
      delta = Number((it.weightKg - prev.weightKg).toFixed(3));
    }
    return { ...it, delta };
  });
});

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const res = await useFetchWeightLogs() as any as { status: number; data?: ApiResponse<WeightLog[]> };
    if (res.status >= 200 && res.status < 300 && res.data?.data) {
      items.value = [...res.data.data];
    } else {
      error.value = res.data?.msg || 'Erreur lors du chargement de l’historique.';
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || e?.message || 'Erreur lors du chargement.';
  } finally {
    loading.value = false;
  }
}

async function handleDelete(item: WeightLog) {
  const ok = window.confirm(
    `Supprimer la mesure du ${formatDateTime(item.loggedAt)} (${item.weightKg} kg) ?`
  );
  if (!ok) return;

  try {
    await useDeleteWeightLog(item.id);
    items.value = items.value.filter(i => i.id !== item.id);
    toast.success('Mesure supprimée avec succès.');
  } catch (err) {
    console.error(err);
    toast.error('Erreur lors de la suppression.');
  }
}

onMounted(load);
</script>

<template>
  <v-card class="pa-0 hist-card mt-10 mb-10 ml-10 mr-10" elevation="3">
    <div class="header">
      <div class="title">Historique</div>
      <v-btn size="small" variant="tonal" @click="load" :disabled="loading">
        <v-icon size="18" class="mr-1">mdi-refresh</v-icon>
        Rafraîchir
      </v-btn>
    </div>

    <v-card-text class="pa-0">
      <div class="d-flex justify-center my-4" v-if="loading">
        <v-progress-circular indeterminate />
      </div>

      <v-alert
        v-if="error && !loading"
        type="error"
        density="comfortable"
        :text="error"
        class="ma-3"
      />

      <v-alert
        v-else-if="!loading && enriched.length === 0"
        type="info"
        density="comfortable"
        text="Aucune mesure enregistrée."
        class="ma-3"
      />

      <v-list v-else nav class="py-0">
        <v-divider />
        <v-list-item
          v-for="it in enriched"
          :key="it.id"
          class="py-3"
        >
          <div class="row">
            <div class="left">
              <div class="kg">
                {{ Number(it.weightKg).toFixed(3) }} kg
              </div>
              <div class="date">
                {{ formatDateTime(it.loggedAt) }}
              </div>
            </div>

            <div class="right" v-if="it.delta !== null">
              <v-chip
                size="small"
                :color="it.delta < 0 ? 'green' : (it.delta > 0 ? 'red' : 'grey')"
                variant="flat"
                class="delta-chip"
              >
                <v-icon start>
                  {{ it.delta < 0 ? 'mdi-arrow-down-bold' : (it.delta > 0 ? 'mdi-arrow-up-bold' : 'mdi-minus') }}
                </v-icon>
                {{ it.delta > 0 ? '+' : '' }}{{ it.delta }} kg
              </v-chip>
              <v-btn
                icon="mdi-delete"
                size="small"
                color="red"
                variant="text"
                @click="handleDelete(it)"
              ></v-btn>
            </div>
          </div>

          <div v-if="it.notes" class="notes">
            {{ it.notes }}
          </div>

          <v-divider class="mt-3" />
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Mobile-first */
.hist-card {
  border-radius: 14px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #009688, #26a69a);
  color: #fff;
}

.title {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.3px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left .kg {
  font-weight: 700;
  font-size: 16px;
}

.left .date {
  font-size: 12px;
  opacity: 0.8;
}

.right .delta-chip {
  font-weight: 700;
}

.notes {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.9;
}
</style>
