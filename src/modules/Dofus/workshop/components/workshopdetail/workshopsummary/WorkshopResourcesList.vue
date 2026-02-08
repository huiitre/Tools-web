<script setup lang="ts">
import { Item } from '@/modules/Dofus/item/types/item.types'
import WorkshopResourceItem from './WorkshopResourceItem.vue'

interface Resource {
  id: number
  name: string
  icon: string
  item: Item
  price: number
  qty: number
  max: number
}

interface Zone {
  name: string
  percent: number
  resources: Resource[]
}

interface Props {
  zones: Zone[]
  showCompleted: boolean
  condensed: boolean
}

interface Emits {
  (e: 'update:resourceQty', resourceId: number, value: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function updateResourceQty(itemId: number, value: number) {
  emit('update:resourceQty', itemId, value)
}
</script>

<template>
  <div class="zones-container">
    <template v-for="zone in zones" :key="zone.name">
      <div class="zone-header">
        <span>{{ zone.name }}</span>
        <span :class="{ ok: zone.percent === 100, warn: zone.percent === 0 }">
          {{ zone.percent }}%
        </span>
      </div>

      <WorkshopResourceItem
        v-for="res in zone.resources"
        :key="res.id"
        class="zone-resource"
        :resource="res"
        :condensed="condensed"
        v-show="showCompleted || res.qty < res.max"
        @update:qty="updateResourceQty(res.id, $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.zones-container {
  column-width: 380px;
  column-gap: 1rem;
}

.zone-header {
  break-inside: avoid;
  break-after: avoid-column;
  -webkit-column-break-inside: avoid;
  -webkit-column-break-after: avoid;

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
  font-weight: 600;
  font-size: 0.85rem;
}

.zone-header:not(:first-child) {
  margin-top: 1.5rem;
}

.zone-header .ok {
  color: var(--pico-ins-color);
}

.zone-header .warn {
  color: var(--pico-del-color);
}

.zone-resource {
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
}
</style>
