import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'
import { useFetchWorkshopDetail } from '@/modules/Dofus/workshop/fetch/workshop.fetch'
import { WorkshopItem, WorkshopSummary } from '@/modules/Dofus/workshop/types/workshop.types'
import { defineStore } from 'pinia'

const { refreshRecursive } = useItemPrices()

type WorkshopDetailState = {
  workshopId: number | null
  items: WorkshopItem[]
  summary: WorkshopSummary | null
  loading: boolean
  owner: boolean
}

export const useWorkshopDetailStore = defineStore('dofus.workshop.detail', {
  state: (): WorkshopDetailState => ({
    workshopId: null,
    items: [],
    summary: null,
    loading: false,
    owner: false,
  }),

  getters: {
    isOwner: (state) => state.owner
  },

  actions: {

    async open(workshopId: number) {
      const response = await useFetchWorkshopDetail(workshopId)
      this.workshopId = workshopId
      this.items = response.data.items
      this.summary = null
      this.owner = response.data.owner

      this.refreshPrices()
    },

    async refreshPrices() {
      const itemIds = new Set<number>();

      for (const item of this.items) {
        itemIds.add(item.item.id)

        for (const ingredient of item.ingredients) {
          itemIds.add(ingredient.item.id)
        }
      }

      await refreshRecursive(Array.from(itemIds))
    },

    close() {
      this.workshopId = null
      this.items = []
      this.summary = null
      this.loading = false
    },

    setItems(items: WorkshopItem[]) {
      this.items = items
    },

    setSummary(summary: WorkshopSummary) {
      this.summary = summary
    },

    setLoading(value: boolean) {
      this.loading = value
    }
  }
})
