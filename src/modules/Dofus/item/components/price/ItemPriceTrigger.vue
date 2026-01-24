<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { ItemPrice } from '@/modules/Dofus/item/types/item.types'
import ItemPriceFloating from './ItemPriceFloating.vue'
import { useDofusConfigStore } from '@/modules/Dofus/preferences/preferences.store'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  price?: ItemPrice
}>()

const dofusConfig = useDofusConfigStore()
const { priceDisplayMode, showOtherPricesOnHover } =
  storeToRefs(dofusConfig)

const visible = ref(false)
const x = ref(0)
const y = ref(0)

const tooltipHeight = ref(0)
const tooltipWidth = ref(0)

const updatePosition = (e: MouseEvent) => {
  const offset = 12
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  const cursorX = e.clientX
  const cursorY = e.clientY

  // haut / bas
  if (cursorY > viewportHeight * 0.7) {
    y.value = cursorY - tooltipHeight.value - offset
  } else {
    y.value = cursorY + offset
  }

  // gauche / droite
  if (cursorX > viewportWidth * 0.7) {
    x.value = cursorX - tooltipWidth.value - offset
  } else {
    x.value = cursorX + offset
  }
}

const onEnter = async (e: MouseEvent) => {
  if (!props.price) return
  if (!showOtherPricesOnHover.value) return

  visible.value = true
  await nextTick()

  const el = document.querySelector(
    '.item-price-floating',
  ) as HTMLElement | null

  tooltipHeight.value = el?.offsetHeight ?? 0
  tooltipWidth.value = el?.offsetWidth ?? 0

  updatePosition(e)
}

const onMove = (e: MouseEvent) => {
  if (!visible.value) return
  updatePosition(e)
}

const onLeave = () => {
  visible.value = false
}
</script>

<template>
  <span
    :class="{ 'hover-enabled': showOtherPricesOnHover }"
    @mouseenter="onEnter"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <slot />
  </span>

  <ItemPriceFloating
    v-if="price && showOtherPricesOnHover"
    :price="price"
    :visible="visible"
    :x="x"
    :y="y"
    :priceDisplayMode="priceDisplayMode"
  />
</template>
