import { AssetResolution } from "./assetResolution.enum"

type ItemType = {
  id: number
  name: string
  assetId: number
  gameVersionId: number
}

export type ItemImage = {
  id: number
  iconId: number
  itemId: number
  resolution: AssetResolution
  url: string
}

export type ItemPrice = {
  userPrice: number
  communityAveragePrice: number
  lastUpdatedPrice: number
}

export type Item = {
  id: number
  name: string
  description: string
  hasRecipe: boolean
  assetId: number
  gameVersionId: number
  level: number
  itemType: ItemType
  images: ItemImage[]
  prices: ItemPrice
}