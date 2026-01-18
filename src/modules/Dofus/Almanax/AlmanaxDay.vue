<script setup lang="ts">
import { ref } from 'vue'

type Almanax = {
  id: number
  name: string
  description: string
  date: string
}

const props = defineProps<{
  day: {
    date: Date
    iso: string
    isToday: boolean
    isCurrentMonth: boolean
    almanax?: Almanax
  }
}>()

const tooltipEnabled = false
const showTooltip = ref(false)

const onAddToCalendar = () => {
  console.log('add to calendar:', props.day.iso)
}
</script>

<template>
  <article
    class="calendar-day"
    :class="{ today: day.isToday, outside: !day.isCurrentMonth }"
  >
    <!-- Header -->
    <div class="day-header">
      <span class="day-number">
        {{ day.date.getDate() }}
      </span>

      <i
        v-if="day.almanax"
        class="mdi mdi-calendar-plus calendar-icon"
        title="Ajouter au calendrier"
        @click.stop="onAddToCalendar"
      />
    </div>

    <!-- Contenu Almanax -->
    <div v-if="day.almanax" class="day-content">
      <div class="almanax-name" v-html="day.almanax.name" />

      <div
        class="almanax-desc-wrapper"
        :class="{ 'hover': tooltipEnabled }"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        <div
          class="almanax-desc"
          :class="{ 'hover': tooltipEnabled, 'truncate': tooltipEnabled }"
          v-html="day.almanax.description"
        />

        <div
          v-if="tooltipEnabled && showTooltip"
          class="almanax-tooltip"
          role="tooltip"
          v-html="day.almanax.description"
        />
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
/* ===== Cell ===== */

.calendar-day {
  position: relative;
  background: var(--pico-card-background-color);
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.calendar-day:not(.today) {
  border: 1px solid var(--pico-card-border-color);
}

.calendar-day.outside {
  filter: grayscale(1) brightness(0.9);
}

.calendar-day.today {
  border: 2px solid color-mix(
    in srgb,
    var(--pico-primary) 60%,
    transparent
  );
}

/* ===== Header ===== */

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.day-number {
  font-size: 0.75rem;
  color: var(--pico-muted-color);
}

.calendar-icon {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
  cursor: pointer;
  border-radius: 4px;
  padding: 0.15rem;

  &:hover {
    color: var(--pico-primary);
    background: var(--pico-card-background-color);
  }
}

/* ===== Contenu ===== */

.day-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.75rem;
}

.almanax-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--pico-primary);
}

/* ===== Description ===== */

.almanax-desc-wrapper {
  position: relative;
  max-width: 100%;
}

.almanax-desc {
  color: var(--pico-muted-color);
  line-height: 1.2;

  border-radius: 4px;
  padding: 0.1rem 0.2rem;
  transition: background-color 0.15s ease;
}
.almanax-desc.truncate {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.almanax-desc-wrapper.hover:hover .almanax-desc.hover {
  background-color: color-mix(
    in srgb,
    var(--pico-primary) 12%,
    transparent
  );
}

/* ===== Tooltip ===== */

.almanax-tooltip {
  position: absolute;
  top: 0;
  left: calc(100% + 0.5rem);
  z-index: 1000;

  width: 420px;
  max-width: 300px;

  padding: 0.5rem 0.65rem;

  background: var(--pico-background-color);
  border: 1px solid var(--pico-muted-border-color);
  border-radius: var(--pico-border-radius);
  box-shadow: var(--pico-card-box-shadow);

  font-size: 0.7rem;
  line-height: 1.3;
  color: var(--pico-color);

  white-space: normal;
  pointer-events: none;

  /* 🔥 CORRECTION CLÉ */
  opacity: 1 !important;
  isolation: isolate;
}

/* ===== Flip gauche/droite selon colonne ===== */

.calendar-grid > :nth-child(7n),
.calendar-grid > :nth-child(7n-1) {
  .almanax-tooltip {
    left: auto;
    right: calc(100% + 0.5rem);
  }
}

.calendar-grid > :nth-child(7n-6),
.calendar-grid > :nth-child(7n-5) {
  .almanax-tooltip {
    right: auto;
    left: calc(100% + 0.5rem);
  }
}
</style>
