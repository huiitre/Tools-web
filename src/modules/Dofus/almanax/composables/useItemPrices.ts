import { ref, watch } from 'vue'
import type { ItemPrice } from '@/modules/Dofus/item/types/item.types'
import { useFetchItemPrices } from '@/modules/Dofus/item/fetch/item.fetch'

const prices = ref<Map<number, ItemPrice>>(new Map())

const trackedItemIds = ref<number[]>([])

let refreshTimer: number | null = null

export function useItemPrices() {

  const load = async (itemIds: number[]) => {
    if (itemIds.length === 0) return

    //? Filtre les ids déjà en cache
    const newIds = itemIds.filter(id => !prices.value.has(id))
    
    if (newIds.length === 0) return

    trackedItemIds.value = Array.from(
      new Set([...trackedItemIds.value, ...newIds])
    )

    const { data } = await useFetchItemPrices(newIds)

    for (const entry of data) {
      prices.value.set(entry.itemId, entry)
    }

    prices.value = new Map(prices.value)
  }

  const startAutoRefresh = (intervalMs = 5 * 60 * 1000) => {
    if (refreshTimer !== null) return

    refreshTimer = window.setInterval(async () => {
      if (trackedItemIds.value.length === 0) return
      await load(trackedItemIds.value)
    }, intervalMs)
  }

  const stopAutoRefresh = () => {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  const get = (itemId: number): ItemPrice | undefined => {
    return prices.value.get(itemId)
  }

  const clear = () => {
    prices.value.clear()
    prices.value = new Map()
    trackedItemIds.value = []
    stopAutoRefresh()
  }

  watch(
    prices,
    (newPrices) => {
      /* console.log(
        'prices updated:',
        Array.from(newPrices.entries())
      ) */
    },
    { deep: false }
  )

  return {
    prices,
    load,
    get,
    startAutoRefresh,
    stopAutoRefresh,
    clear,
  }
}
