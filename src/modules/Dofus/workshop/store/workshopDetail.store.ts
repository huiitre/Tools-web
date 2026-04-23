import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'
import { useDofusStore } from '@/modules/Dofus/dofus.store'
import { useFetchWorkshopDetail } from '@/modules/Dofus/workshop/fetch/workshop.fetch'
import { useAddItemsToWorkshop, useCraftIngredient, useDeleteWorkshopItem, useUncraftIngredient, useUpdateIngredientQuantityObtained, useUpdateWorkshopItemQuantity } from '@/modules/Dofus/workshop/fetch/workshopItem.fetch'
import { WorkshopItem, WorkshopSummary } from '@/modules/Dofus/workshop/types/workshop.types'
import { defineStore } from 'pinia'

const { refreshRecursive } = useItemPrices()

type WorkshopDetailState = {
  workshopId: number | null
  items: WorkshopItem[]
  summary: WorkshopSummary | null
  loading: boolean
  owner: boolean
  condensed: boolean
}

const STORAGE_KEY_CONDENSED = 'dofus.workshop.condensed'

export const useWorkshopDetailStore = defineStore('dofus.workshop.detail', {
  state: (): WorkshopDetailState => ({
    workshopId: null,
    items: [],
    summary: null,
    loading: false,
    owner: false,
    condensed: localStorage.getItem(STORAGE_KEY_CONDENSED) !== 'false'
  }),

  getters: {
    isOwner: (state) => state.owner,

    isCondensed: (state) => state.condensed,

    isIngredientCrafted: (state) => (ingredientId: number) => {
      for (const item of state.items) {
        const hasCraftedChildren = item.ingredients.some(
          ing => ing.parentIngredientId === ingredientId
        )
        if (hasCraftedChildren) return true
      }
      return false
    }
  },

  actions: {

    async open(workshopId: number) {
      await this.getItems(workshopId)

      this.workshopId = workshopId
      this.summary = null

      this.refreshPrices()
    },

    async getItems(workshopId: number) {
      const response = await useFetchWorkshopDetail(workshopId)

      response.data.items.sort((a: any, b: any) =>
        a.item.name.localeCompare(b.item.name)
      )

      for (const item of response.data.items) {
        item.ingredients.sort((a: any, b: any) => {
          if (a.quantityRequired !== b.quantityRequired) {
            return a.quantityRequired - b.quantityRequired
          }
          return a.item.name.localeCompare(b.item.name)
        })
      }

      this.items = response.data.items
      this.owner = response.data.owner
    },

    async addItems(itemIds: number[]) {
      if (!this.workshopId) return

      const newItems = await useAddItemsToWorkshop(this.workshopId, itemIds)
      this.items.push(...newItems)
      
      this.refreshPrices()
    },

    async updateItemQuantity(workshopItemId: number, quantity: number) {
      if (!this.workshopId) return

      await useUpdateWorkshopItemQuantity(this.workshopId, workshopItemId, quantity)
    
      await this.getItems(this.workshopId)
      this.refreshPrices()
    },

    async deleteWorkshopItem(workshopItemId: number) {
      if (!this.workshopId) return

      await useDeleteWorkshopItem(this.workshopId, workshopItemId)
      this.items = this.items.filter(item => item.id !== workshopItemId)
      
      this.refreshPrices()
    },

    async craftIngredient(workshopItemId: number, ingredientId: number) {
      if (!this.workshopId) return

      await useCraftIngredient(this.workshopId, workshopItemId, ingredientId)

      await this.getItems(this.workshopId)
      
      this.refreshPrices()
    },

    async uncraftIngredient(ingredientId: number) {
      if (!this.workshopId) return

      await useUncraftIngredient(this.workshopId, ingredientId)
      
      await this.getItems(this.workshopId)
      
      this.refreshPrices()
    },

    async setIngredientsQuantityObtained(items: { id: number; quantity: number }[]) {
      if (!this.workshopId) return

      await Promise.all(
        items.map(item =>
          useUpdateIngredientQuantityObtained(this.workshopId!, item.id, item.quantity)
        )
      )

      await this.getItems(this.workshopId)
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
    },

    setCondensed(value: boolean) {
      this.condensed = value
      localStorage.setItem(STORAGE_KEY_CONDENSED, String(value))
    }
  }
})
