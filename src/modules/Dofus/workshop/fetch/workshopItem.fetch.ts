import { clientV3Dofus } from '@/services/axiosInstance'

export const useSearchCraftableItems = async (workshopId: number, query?: string) => {
  return await clientV3Dofus.get(`/dofus/workshops/${workshopId}/items/search`, {
    params: { query }
  })
}

export const useAddItemsToWorkshop = async (workshopId: number, itemIds: number[]) => {
  return await clientV3Dofus.post(`/dofus/workshops/${workshopId}/items`, itemIds)
}

export const useDeleteWorkshopItem = async (workshopId: number, workshopItemId: number) => {
  return await clientV3Dofus.delete(`/dofus/workshops/${workshopId}/items/${workshopItemId}`)
}

export const useUpdateWorkshopItemQuantity = async (workshopId: number, workshopItemId: number, quantity: number) => {
  return await clientV3Dofus.patch(`/dofus/workshops/${workshopId}/items/${workshopItemId}/quantity/${quantity}`)
}

export const useCraftIngredient = async (workshopId: number, workshopItemId: number, ingredientId: number) => {
  return await clientV3Dofus.post(`/dofus/workshops/${workshopId}/items/${workshopItemId}/ingredients/${ingredientId}/craft`)
}

export const useUncraftIngredient = async (workshopId: number, ingredientId: number) => {
  return await clientV3Dofus.delete(`/dofus/workshops/${workshopId}/ingredients/${ingredientId}/crafted`)
}

export const useUpdateIngredientQuantityObtained = async (workshopId: number, ingredientId: number, quantityObtained: number) => {
  return await clientV3Dofus.patch(`/dofus/workshops/${workshopId}/ingredients/${ingredientId}/obtained/${quantityObtained}`)
}