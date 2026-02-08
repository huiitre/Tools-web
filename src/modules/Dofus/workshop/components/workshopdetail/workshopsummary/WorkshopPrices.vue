<script setup lang="ts">
interface Props {
  buy: number
  craft: number
  best: number
  buyAdjusted: number
  craftAdjusted: number
  bestAdjusted: number
}

defineProps<Props>()
</script>

<template>
  <div class="prices">
    <div class="prices-col">
      <div class="price-line">
        <span>Prix achat</span>
        <span>{{ buy.toLocaleString() }} ₭</span>
      </div>
      <div class="price-line">
        <span>Prix craft</span>
        <span>{{ craft.toLocaleString() }} ₭</span>
      </div>
      <div class="price-line">
        <span>Meilleur prix</span>
        <span class="highlight">{{ best.toLocaleString() }} ₭</span>
      </div>
    </div>

    <div class="prices-col">
      <div class="price-line muted">
        <span>Achat ajusté</span>
        <span>{{ buyAdjusted.toLocaleString() }} ₭</span>
      </div>
      <div class="price-line muted">
        <span>Craft ajusté</span>
        <span>{{ craftAdjusted.toLocaleString() }} ₭</span>
      </div>
      <div class="price-line ok">
        <span>Meilleur ajusté</span>
        <span>{{ bestAdjusted.toLocaleString() }} ₭</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prices {
  display: flex;
  gap: 2rem;
  padding: 0.5rem;
  background: var(--pico-card-sectioning-background-color);
  border-radius: var(--pico-border-radius);
  border: 1px solid var(--pico-muted-border-color);
}

.prices-col {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.price-line {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  justify-content: space-between;
}

.price-line span:first-child {
  flex-shrink: 0;
}

.price-line span:last-child {
  font-weight: 600;
}

.price-line.muted {
  color: var(--pico-muted-color);
}

.price-line.ok span:last-child {
  color: var(--pico-ins-color);
}

.price-line .highlight {
  color: var(--pico-primary);
}
</style>