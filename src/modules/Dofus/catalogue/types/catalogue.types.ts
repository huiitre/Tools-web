import type { ItemImage } from '@/modules/Dofus/item/types/item.types'

/* =========================
   ITEM (CATALOGUE VIEW)
   — projection légère de Item
========================= */

export type CatalogueItem = {
  id: number
  assetId: number
  type: string
  name: string
  description: string
  level: number
  hasRecipe: boolean
  images: ItemImage[]
}

/* =========================
   INGREDIENT
========================= */

export type Ingredient = CatalogueItem & {
  item_id: number
  quantity: number
}

/* =========================
   COLONNES
========================= */

export type CatalogueColumn = {
  key: string
  label: string
  description: string
  visible: boolean
  sortable: boolean
  userToggle: boolean

  /** poids de largeur (0 = fixe / petit) */
  grow: number

  size: number
  minSize: number
  maxSize: number
}

export type BuildGridOptions = {
  columns: CatalogueColumn[]
  containerWidth: number
  leadingFixed?: number[]
  trailingFixed?: number[]
}

/* =========================
   PAGINATION / TRI
========================= */

export type CatalogueSortDir = 'ASC' | 'DESC'

export enum CataloguePageSize {
  XS = 10,
  S = 20,
  M = 50,
  L = 100,
}

/* =========================
   STATE DU STORE
========================= */

export type CatalogueState = {
  items: CatalogueItem[]
  ingredients: Ingredient[]
  total: number

  q: string | null

  page: number
  pageSize: CataloguePageSize
  previousPage: number | null
  nextPage: number | null
  lastPage: number | null

  sort: string | null
  dir: CatalogueSortDir

  columns: CatalogueColumn[]
  visibleColumns: Set<string>

  error: string | null
}

/* =========================
   SEARCH DTO
========================= */

export type CatalogueSearch = {
  q: string | null
  page: number
  pageSize: CataloguePageSize
  sort: string | null
  dir: CatalogueSortDir
}
