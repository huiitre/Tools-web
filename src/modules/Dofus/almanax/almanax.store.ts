import { defineStore } from 'pinia'
import type { Almanax } from '@/modules/Dofus/almanax/types/almanax.types'
import { useFetchAlmanax } from '@/modules/Dofus/almanax/fetch/almanax.fetch'
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'

type AlmanaxState = {
  almanaxList: Almanax[]
  loaded: boolean
  loading: boolean
  error: string | null
}

export const useAlmanaxStore = defineStore('dofus.almanax', {
  state: (): AlmanaxState => ({
    almanaxList: [],
    loaded: false,
    loading: false,
    error: null,
  }),

  getters: {
    almanaxByDate(state): Map<string, Almanax> {
      const map = new Map<string, Almanax>()
      for (const a of state.almanaxList) {
        map.set(a.date, a)
      }
      return map
    },

    minDate(state): Date | null {
      if (state.almanaxList.length === 0) return null
      const dates = state.almanaxList.map(a => a.date).sort()
      return new Date(dates[0])
    },

    maxDate(state): Date | null {
      if (state.almanaxList.length === 0) return null
      const dates = state.almanaxList.map(a => a.date).sort()
      return new Date(dates[dates.length - 1])
    },
  },

  actions: {
    async fetch() {
      if (this.loaded || this.loading) return

      this.loading = true
      this.error = null

      try {
        const { data } = await useFetchAlmanax()
        this.almanaxList = data

        // Charger les prix des items
        const { load: loadItemPrices } = useItemPrices()
        const itemIds: number[] = Array.from(
          new Set(
            data
              .map((almanax: Almanax) => almanax.item?.id)
              .filter((id: number | undefined): id is number => typeof id === 'number')
          )
        )

        if (itemIds.length > 0) {
          await loadItemPrices(itemIds)
        }

        this.loaded = true
      } catch (e: any) {
        this.error = e?.message ?? 'Erreur lors du chargement des données Almanax'
        throw e
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.almanaxList = []
      this.loaded = false
      this.loading = false
      this.error = null
    },
  },
})