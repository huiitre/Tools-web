<!-- src/views/health/weight/WeightChart.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useFetchWeightLogs } from '../hooks/useFetchWeightLog';
import * as echarts from 'echarts';

type WeightLog = {
  id: number;
  weightKg: number;
  loggedAt: string; // ISO
  notes?: string | null;
};

type ApiResponse<T> = { data: T; msg?: string };

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const loading = ref(false);
const error = ref<string | null>(null);

// Helpers
function fmtDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${MM}/${yyyy} ${hh}:${mm}`;
}

function buildOption(rows: WeightLog[]): echarts.EChartsOption {
  // Points triés par temps croissant (plus lisible pour zoom)
  const points = [...rows]
    .sort((a, b) => +new Date(a.loggedAt) - +new Date(b.loggedAt))
    .map(r => [new Date(r.loggedAt).getTime(), Number(r.weightKg), r.notes ?? null]);

  const option: echarts.EChartsOption = {
    animation: true,
    grid: { top: 24, left: 10, right: 10, bottom: 60, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const date = new Date(p.value[0]);
        const kg = p.value[1];
        const note = p.value[2];
        return `
          <div style="font-size:12px;">
            <div><b>${kg.toFixed(3)} kg</b></div>
            <div>${fmtDate(date)}</div>
            ${note ? `<div style="opacity:.8;">${note}</div>` : ''}
          </div>
        `;
      }
    },
    xAxis: {
      type: 'time',
      axisLabel: { hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      scale: true,
      name: 'kg',
    },
    // Zoom à la molette + pinch; slider pour naviguer
    dataZoom: [
      { type: 'inside', throttle: 30, zoomOnMouseWheel: true, moveOnMouseMove: true, moveOnMouseWheel: true },
      { type: 'slider', height: 24, bottom: 24 }
    ],
    series: [
      // Ligne pour la tendance
      {
        name: 'Poids',
        type: 'line',
        showSymbol: true,
        symbolSize: 6,
        sampling: 'lttb',
        smooth: false,
        encode: { x: 0, y: 1 },
        data: points
      },
      // Nuage de points (utile si 2 entrées/jour)
      {
        name: 'Mesure',
        type: 'scatter',
        symbolSize: 8,
        encode: { x: 0, y: 1 },
        data: points,
        emphasis: { focus: 'series' }
      }
    ]
  };

  return option;
}

async function loadAndRender() {
  loading.value = true;
  error.value = null;
  try {
    const res = await useFetchWeightLogs() as any as { status: number; data?: ApiResponse<WeightLog[]> };
    if (!(res.status >= 200 && res.status < 300) || !res.data?.data) {
      throw new Error(res?.data?.msg || 'Erreur de chargement');
    }
    const rows = res.data.data;

    // Init chart si besoin
    if (chartEl.value && !chart) {
      chart = echarts.init(chartEl.value);
      // Double-clic pour reset zoom
      chartEl.value.addEventListener('dblclick', () => {
        chart?.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
      });
      // Resize responsive
      window.addEventListener('resize', handleResize, { passive: true });
    }
    chart?.setOption(buildOption(rows), true);
  } catch (e: any) {
    error.value = e?.message || 'Erreur';
  } finally {
    loading.value = false;
  }
}

function handleResize() {
  chart?.resize();
}

onMounted(loadAndRender);
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<template>
  <v-card class="chart-card mt-4" elevation="3">
    <div class="header">
      <div class="title">Graphique</div>
      <div class="hint">Molette pour zoomer • Double-clic pour réinitialiser</div>
    </div>

    <v-card-text class="pa-3">
      <div class="chart" ref="chartEl"></div>

      <div class="d-flex justify-center my-3" v-if="loading">
        <v-progress-circular indeterminate />
      </div>
      <v-alert v-if="error && !loading" type="error" density="comfortable" :text="error" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Mobile-first */
.chart-card {
  border-radius: 14px;
  overflow: hidden;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: #fff;
}
.title {
  font-weight: 700;
  font-size: 16px;
}
.hint {
  font-size: 12px;
  opacity: 0.9;
}

.chart {
  width: 100%;
  height: 360px; /* mobile-friendly height */
  border-radius: 10px;
}
</style>
