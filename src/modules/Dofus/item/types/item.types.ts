import { AssetResolution } from './assetResolution.enum'

/* =========================
   ITEM TYPE
========================= */

export type ItemType = {
  id: number
  name: string
  assetId: number
  gameVersionId: number
}

/* =========================
   ITEM IMAGE
========================= */

export type ItemImage = {
  id: number
  iconId: number
  itemId: number
  resolution: AssetResolution
  url: string
}

/* =========================
   ITEM PRICE
========================= */

export type ItemPrice = {
  userPrice: number
  communityAveragePrice: number
  lastUpdatedPrice: number
  craftUserPrice: number
  craftCommunityPrice: number
  craftLastPrice: number
  craftCalculatedPrice: number
}

/* =========================
   ITEM (DOMAINE)
========================= */

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
}
