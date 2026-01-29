import { Item } from "@/modules/Dofus/item/types/item.types"

type WorkshopTags = {
  id: number
  name: string
  color: string
}

type Workshop = {
  id: number
  name: string
  isActive: boolean
  tags: WorkshopTags[]
}

type WorkshopItem = {
  id: number
  workshopId: number
  item: Item
  quantity: number
  ingredients: WorkshopItemIngredient[]
}

type WorkshopItemIngredient = {
  id: number
  workshopItemId: number
  item: Item
  parentIngredientId?: number
  quantityRequired: number
  quantityObtained: number
  ingredients?: WorkshopItemIngredient[]
}

type AggregatedResource = {
  item: Item
  quantityRequired: number
  quantityObtained: number
  remainingToBuy: number
  totalCost: number

  usedIn: WorkshopItem[]
}

type WorkshopSummary = {
  totalItems: number
  totalResources: number
  totalMissing: number
  totalComplete: number
  totalCost: number
  craftCost: number
  adjustedCost: number

  resources: AggregatedResource[]
}