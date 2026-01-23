import type { ItemPrice } from '@/modules/Dofus/item/types/item.types'
import { PriceDisplayMode } from '@/modules/Dofus/preferences/types/priceDisplayMode.enum'

export function getItemPriceByMode(
  prices: ItemPrice,
  mode: PriceDisplayMode,
): number {
  if (!prices) {
    return 0
  }

  switch (mode) {
    case PriceDisplayMode.USER:
      return prices.userPrice ?? 0
    case PriceDisplayMode.COMMUNITY:
      return prices.communityAveragePrice ?? 0
    case PriceDisplayMode.LAST:
      return prices.lastUpdatedPrice ?? 0
    default:
      return 0
  }
}
