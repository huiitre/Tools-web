<script setup lang="ts">
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

const onAddToCalendar = () => {
  console.log('add to calendar:', props.day?.iso)
}
</script>

<template>
  <article
    class="calendar-day"
    :class="{ today: day.isToday, outside: !day.isCurrentMonth }"
  >
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

    <div class="day-content">
      <template v-if="day.almanax">
        <strong class="almanax-name">
          {{ day.almanax.name }}
        </strong>

        <p class="almanax-desc">
          {{ day.almanax.description }}
        </p>
      </template>
    </div>
  </article>
</template>

<style lang="scss" scoped>
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
  opacity: 0.45;
}

.calendar-day.today {
  border: 2px solid color-mix(
    in srgb,
    var(--pico-primary) 60%,
    transparent
  );
}

/* ===== Header jour ===== */

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.day-number {
  font-size: 0.75rem;
  color: var(--pico-muted-color);
}

/* ===== Icône calendrier ===== */

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
  flex: 1;
  overflow: hidden;
  font-size: 0.75rem;
  color: var(--pico-muted-color);
}

.almanax-name {
  display: block;
  font-size: 0.8rem;
  color: var(--pico-color);
  margin-bottom: 0.15rem;
}

.almanax-desc {
  font-size: 0.7rem;
  line-height: 1.2;
}
</style>
