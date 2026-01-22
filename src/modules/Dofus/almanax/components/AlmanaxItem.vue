<script setup lang="ts">
import type { Item } from '@/modules/Dofus/item/types/item.types'
import { computed } from 'vue'
import { getItemImageByResolution } from '@/modules/Dofus/item/utils/itemImageSelector'
import { AssetResolution } from '@/modules/Dofus/item/types/assetResolution.enum'

const props = defineProps<{
  item: Item
}>()

const itemImageX1 = computed(() =>
  getItemImageByResolution(props.item.images, AssetResolution.X1)
)
</script>

<template>
  <div class="almanax-item-wrapper">
    <div class="almanax-picture">
      <img
        v-if="itemImageX1"
        :src="itemImageX1.url"
        :alt="item.name"
      />
    </div>

    <div class="almanax-item">
      {{ item.name }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.almanax-item-wrapper {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.almanax-picture img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.almanax-item {
  font-size: 0.7rem;
  color: var(--pico-color);
}
</style>
