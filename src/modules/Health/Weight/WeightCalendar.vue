<!-- src/modules/Health/Weight/WeightCalendar.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useFetchWeightLogs } from '../hooks/useFetchWeightLog';

type WeightLog = {
  id: number;
  iduser: number;
  weightKg: number;
  loggedAt: string; // ISO
  notes?: string | null;
};
type ApiResponse<T> = { data: T; msg?: string };

const loading = ref(false);
const error = ref<string | null>(null);
const items = ref<WeightLog[]>([]);

const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth()); // 0..11
const selectedDate = ref<string | null>(null); // 'YYYY-MM-DD'

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const res = await useFetchWeightLogs() as any as { status: number; data?: ApiResponse<WeightLog[]> };
    if (res.status >= 200 && res.status < 300 && res.data?.data) {
      items.value = [...res.data.data].sort((a, b) => +new Date(b.loggedAt) - +new Date(a.loggedAt));
    } else {
      error.value = res.data?.msg || 'Erreur lors du chargement.';
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || e?.message || 'Erreur lors du chargement.';
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const todayKey = computed(() => ymd(new Date()));

// helpers date
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseISO(iso: string): Date { return new Date(iso); }

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1)
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
);

// map des mesures (toutes les entrées par jour)
const byDay = computed<Record<string, WeightLog[]>>(() => {
  const map: Record<string, WeightLog[]> = {};
  for (const it of items.value) {
    const key = ymd(parseISO(it.loggedAt));
    if (!map[key]) map[key] = [];
    map[key].push(it);
  }

  // trier chaque journée du plus ancien au plus récent
  for (const key in map) {
    map[key].sort((a, b) => +new Date(a.loggedAt) - +new Date(b.loggedAt));
  }
  return map;
});

// Typage des cellules pour éviter "undefined"
interface GridCell {
  date: Date;
  inMonth: boolean;
  key: string;
  has: boolean;
  entries?: WeightLog[];
  delta: number | null; // <-- explicit
}

// grille 6x7
const grid = computed<GridCell[]>(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1);
  const startDay = (first.getDay() + 6) % 7; // Lundi=0
  const start = new Date(currentYear.value, currentMonth.value, 1 - startDay);
  const cells: GridCell[] = [];

  // deltas dans le mois (jour-à-jour)
  const monthStart = new Date(currentYear.value, currentMonth.value, 1);
  const monthEnd = new Date(currentYear.value, currentMonth.value + 1, 0);
  const monthDays: { key: string; weight: number }[] = [];
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const k = ymd(d);
    const entries = byDay.value[k];
    if (entries && entries.length > 0) {
      const last = entries[entries.length - 1]; // on prend la dernière mesure du jour
      monthDays.push({ key: k, weight: last.weightKg });
    }
  }
  monthDays.sort((a, b) => a.key.localeCompare(b.key));
  const deltas: Record<string, number | null> = {};
  for (let i = 0; i < monthDays.length; i++) {
    const cur = monthDays[i];
    const prev = monthDays[i - 1];
    deltas[cur.key] = prev ? Number((cur.weight - prev.weight).toFixed(3)) : null;
  }

  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = ymd(d);
    const inMonth = d.getMonth() === currentMonth.value;
    const entries = byDay.value[key] || [];
    cells.push({
      date: d,
      inMonth,
      key,
      has: entries.length > 0,
      entries, // on garde le tableau complet
      delta: deltas[key] ?? null
    });
  }
  return cells;
});

function prevMonth() {
  const m = currentMonth.value - 1;
  if (m < 0) { currentMonth.value = 11; currentYear.value -= 1; }
  else { currentMonth.value = m; }
}
function nextMonth() {
  const m = currentMonth.value + 1;
  if (m > 11) { currentMonth.value = 0; currentYear.value += 1; }
  else { currentMonth.value = m; }
}

// toutes les entrées du jour sélectionné
const selectedEntries = computed<WeightLog[]>(() => {
  return selectedDate.value ? byDay.value[selectedDate.value] || [] : [];
});

// libellé de la date (sans heure)
const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return '';
  const d = new Date(selectedDate.value + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
});

function selectDay(key: string, has: boolean) {
  selectedDate.value = has ? key : null;
}

// Helpers d’affichage pour le delta (évitent les checks répétitifs dans le template)
function deltaClass(delta: number | null): string {
  if (delta === null) return '';
  return delta < 0 ? 'down' : (delta > 0 ? 'up' : 'flat');
}
function deltaIcon(delta: number | null): string {
  if (delta === null) return 'mdi-minus';
  return delta < 0 ? 'mdi-arrow-down-bold' : (delta > 0 ? 'mdi-arrow-up-bold' : 'mdi-minus');
}
function deltaText(delta: number | null): string {
  if (delta === null) return '';
  return `${delta > 0 ? '+' : ''}${delta}`;
}
</script>

<template>
  <v-card class="calendar-card mt-4 mb-4" elevation="3">
    <div class="cal-header">
      <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="prevMonth" />
      <div class="cal-title">{{ monthLabel }}</div>
      <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextMonth" />
    </div>

    <v-card-text class="pa-3">
      <div class="weekdays">
        <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
      </div>

      <div class="grid">
        <button
          v-for="cell in grid"
          :key="cell.key"
          class="cell"
          :class="[
            cell.inMonth ? 'in-month' : 'out-month',
            selectedDate === cell.key ? 'active' : '',
            cell.has ? 'has' : 'no-has',
            cell.key === todayKey ? 'today' : ''
          ]"
          @click="selectDay(cell.key, cell.has)"
        >
          <!-- Poids + delta -->
          <div v-if="cell.has" class="weights">
            <div
              v-for="(w, i) in cell.entries"
              :key="w.id"
              class="weight"
            >
              {{ Number(w.weightKg).toFixed(1) }}<span class="unit">kg</span>
            </div>
          </div>
          <div v-if="cell.has && cell.delta !== null" class="delta" :class="deltaClass(cell.delta)">
            <v-icon size="14" class="mr-1">{{ deltaIcon(cell.delta) }}</v-icon>
            {{ deltaText(cell.delta) }}
          </div>

          <!-- Numéro du jour en bas -->
          <div class="daynum">{{ new Date(cell.date).getDate() }}</div>
        </button>
      </div>

      <div class="mt-3" v-if="loading" style="display:flex; justify-content:center;">
        <v-progress-circular indeterminate />
      </div>
      <v-alert v-if="error && !loading" type="error" density="comfortable" class="mt-2" :text="error" />

      <!-- Pied : date sélectionnée bien visible -->
      <div class="cal-footer" v-if="selectedDate">
        <div class="footer-date">{{ selectedDateLabel }}</div>

        <div
          v-for="entry in selectedEntries"
          :key="entry.id"
          class="footer-values"
        >
          <div class="value">
            {{ new Date(entry.loggedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) }}
            -
            <v-icon class="mr-1" size="16">mdi-scale-bathroom</v-icon>
            {{ Number(entry.weightKg).toFixed(3) }} kg
          </div>
          <div v-if="entry.notes" class="note mt-1">
            <v-icon class="mr-1" size="16">mdi-note-text</v-icon>{{ entry.notes }}
          </div>
        </div>
      </div>

      <div class="cal-footer hint" v-else>
        Touchez une case pour afficher la date sélectionnée.
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Mobile-first */
.calendar-card {
  border-radius: 14px;
  overflow: hidden;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(135deg, #00796b, #26a69a);
  color: #fff;
}

.cal-title {
  font-weight: 700;
  font-size: 16px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr)); /* fixe le bug samedi/dimanche */
  gap: 6px;
  margin-bottom: 6px;
  text-align: center;
  font-size: 12px;
  color: rgba(0,0,0,0.6);
}
.weekdays > div { 
  min-width: 0; /* empêche les colonnes de forcer la largeur */
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr)); /* toujours 7 colonnes compactes */
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
}

/* cells */
.cell {
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 10px;
  padding: 8px 6px 20px;
  min-height: 72px;
  background: #fff;
  text-align: left;
  box-sizing: border-box;
}

.cell.out-month { opacity: 0.35; }
.cell.active { box-shadow: 0 0 0 2px rgba(0, 121, 107, 0.45) inset; }
.cell.has { background: #f7fffb; border-color: rgba(0, 150, 136, 0.2); }
/* Aujourd’hui (repère visuel) */
.cell.today {
  border-color: #fbc02d;                 /* jaune */
  box-shadow: 0 0 0 2px rgba(251,192,45,.35) inset;
  background-image: linear-gradient(0deg, rgba(251,192,45,0.10), rgba(251,192,45,0.10));
}

/* numéro du jour en BAS DROITE */
.daynum {
  position: absolute;
  right: 6px;
  bottom: 6px;
  font-size: 12px;
  color: rgba(0,0,0,0.65);
}

/* contenu */
.weight {
  font-weight: 700;
  font-size: 14px;
}
.weight .unit {
  font-size: 11px;
  margin-left: 2px;
  color: rgba(0,0,0,0.5);
}

.delta {
  display: inline-flex;
  align-items: center;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
}
.delta.up { color: #d32f2f; }    /* rouge: gain */
.delta.down { color: #2e7d32; }  /* vert: perte */
.delta.flat { color: #616161; }

/* footer (date sélectionnée en bas) */
.cal-footer {
  margin-top: 12px;
  border: 1px dashed rgba(0,0,0,0.15);
  border-radius: 10px;
  padding: 10px;
  background: #fafafa;
}
.cal-footer.hint { color: rgba(0,0,0,0.6); }
.footer-date {
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 14px;
}
.footer-values {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
}
.value, .note { display: inline-flex; align-items: center; }

/* Ajustement sur très petits écrans */
@media (max-width: 360px) {
  .grid, .weekdays { gap: 4px; }
  .cell { min-height: 64px; padding: 6px 4px 18px; }
}
</style>
