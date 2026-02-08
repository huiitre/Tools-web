import { Item } from "@/modules/Dofus/item/types/item.types"

export type Workshop = {
  id: number
  name: string
  active: boolean
  tags: WorkshopTag[]
  pinned: boolean
}

export type WorkshopTag = {
  id: number
  name: string
  color: string
}

export type WorkshopItem = {
  id: number
  workshopId: number
  item: Item
  quantity: number
  ingredients: WorkshopItemIngredient[]
}

export type WorkshopItemIngredient = {
  id: number
  workshopItemId: number
  item: Item
  parentIngredientId?: number
  quantityRequired: number
  quantityObtained: number
}

type ResourcesByZone = {
  name: string
  percent: number
  resources: AggregatedResource[]
}

export type AggregatedResource = {
  item: Item
  quantityRequired: number
  quantityObtained: number
  remainingToBuy: number
  totalCost: number
  usedIn: WorkshopItem[]
}

export type WorkshopSummary = {
  totalItems: number
  totalResources: number
  totalMissing: number
  totalComplete: number
  totalCost: number
  craftCost: number
  bestPrice: number
  adjustedCost: number
  resources: AggregatedResource[]
  zones: ResourcesByZone[]
}

export type CraftCard = {
  type: 'main' | 'craft'
  workshopItem: WorkshopItem
  craftedIngredient?: WorkshopItemIngredient
  subIngredients?: WorkshopItemIngredient[]
  level?: number
  parentName?: string
}