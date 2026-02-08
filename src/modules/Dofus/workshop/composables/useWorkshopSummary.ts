import { computed } from 'vue'
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import { useItemPrices } from '@/modules/Dofus/almanax/composables/useItemPrices'
import { useDofusConfigStore } from '@/modules/Dofus/preferences/preferences.store'
import { getItemPriceByMode } from '@/modules/Dofus/item/utils/itemPriceSelector'
import type { WorkshopItem, WorkshopItemIngredient, AggregatedResource, WorkshopSummary } from '@/modules/Dofus/workshop/types/workshop.types'

export function useWorkshopSummary() {
  const workshopDetailStore = useWorkshopDetailStore()
  const { get: getPrice } = useItemPrices()
  const dofusConfigStore = useDofusConfigStore()

  const summary = computed<WorkshopSummary>(() => {
    const items = workshopDetailStore.items

    if (items.length === 0) {
      return createEmptySummary()
    }

    // Agréger toutes les ressources
    const resourceMap = new Map<number, AggregatedResource>()

    for (const workshopItem of items) {
      processIngredients(
        workshopItem.ingredients.filter(ing => !ing.parentIngredientId),
        workshopItem.quantity,
        workshopItem.ingredients,
        resourceMap,
        workshopItem
      )
    }

    const allResources = Array.from(resourceMap.values())

    // Grouper par zone géographique
    const zoneMap = new Map<string, AggregatedResource[]>()

    for (const resource of allResources) {
      const zones = resource.item.farmZones || []
      
      if (zones.length === 0) {
        const existing = zoneMap.get('Zone inconnue') || []
        existing.push(resource)
        zoneMap.set('Zone inconnue', existing)
      } else {
        // Prendre la zone primaire ou la première
        const primaryZone = zones.find(z => z.isPrimary) || zones[0]
        const zoneName = primaryZone.area.name

        const existing = zoneMap.get(zoneName) || []
        existing.push(resource)
        zoneMap.set(zoneName, existing)
      }
    }

    // Trier les zones par nom
    const sortedZones = Array.from(zoneMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([zoneName, resources]) => {
        const totalRequired = resources.reduce((sum, r) => sum + r.quantityRequired, 0)
        const totalObtained = resources.reduce((sum, r) => sum + r.quantityObtained, 0)
        const percent = totalRequired > 0 ? Math.round((totalObtained / totalRequired) * 100) : 0

        return {
          name: zoneName,
          percent,
          resources: resources.sort((a, b) => a.item.name.localeCompare(b.item.name))
        }
      })

    // Calculer les stats globales
    const totalResources = allResources.length
    const totalComplete = allResources.filter(r => r.quantityObtained >= r.quantityRequired).length
    const totalMissing = totalResources - totalComplete

    // Calculer les prix
    const totalBuyCost = allResources.reduce((sum, r) => {
      const remaining = Math.max(0, r.quantityRequired - r.quantityObtained)
      const itemPrice = getPrice(r.item.id)
      const unitPrice = itemPrice ? getItemPriceByMode(itemPrice, dofusConfigStore.priceDisplayMode) : 0
      return sum + (remaining * unitPrice)
    }, 0)

    // Prix craft = somme des prix craft des items craftables
    const totalCraftCost = items.reduce((sum, item) => {
      if (!item.item.hasRecipe) return sum
      const itemPrice = getPrice(item.item.id)
      if (!itemPrice) return sum

      const craftPrice = 
        dofusConfigStore.priceDisplayMode === 'USER' ? itemPrice.craftUserPrice :
        dofusConfigStore.priceDisplayMode === 'COMMUNITY' ? itemPrice.craftCommunityPrice :
        itemPrice.craftLastPrice

      return sum + (craftPrice * item.quantity)
    }, 0)

    // Meilleur prix = min(achat direct, craft)
    const bestPrice = Math.min(totalBuyCost, totalCraftCost)

    // Prix ajusté = prend en compte quantityObtained
    const totalAdjustedCost = allResources.reduce((sum, r) => {
      const remaining = Math.max(0, r.quantityRequired - r.quantityObtained)
      const itemPrice = getPrice(r.item.id)
      const unitPrice = itemPrice ? getItemPriceByMode(itemPrice, dofusConfigStore.priceDisplayMode) : 0
      return sum + (remaining * unitPrice)
    }, 0)

    return {
      totalItems: items.length,
      totalResources,
      totalMissing,
      totalComplete,
      totalCost: totalBuyCost,
      craftCost: totalCraftCost,
      bestPrice,
      adjustedCost: totalAdjustedCost,
      resources: allResources,
      zones: sortedZones
    }
  })

  function processIngredients(
    ingredients: WorkshopItemIngredient[],
    multiplier: number,
    allIngredients: WorkshopItemIngredient[],
    resourceMap: Map<number, AggregatedResource>,
    workshopItem: WorkshopItem
  ) {
    for (const ingredient of ingredients) {
      const totalRequired = ingredient.quantityRequired * multiplier
      const totalObtained = ingredient.quantityObtained * multiplier

      const itemPrice = getPrice(ingredient.item.id)
      const unitPrice = itemPrice
        ? getItemPriceByMode(itemPrice, dofusConfigStore.priceDisplayMode)
        : 0

      const existing = resourceMap.get(ingredient.item.id)

      if (existing) {
        existing.quantityRequired += totalRequired
        existing.quantityObtained += totalObtained
        existing.remainingToBuy = Math.max(
          0,
          existing.quantityRequired - existing.quantityObtained
        )
        existing.totalCost = existing.remainingToBuy * unitPrice

        if (!existing.usedIn.find(wi => wi.id === workshopItem.id)) {
          existing.usedIn.push(workshopItem)
        }
      } else {
        resourceMap.set(ingredient.item.id, {
          item: ingredient.item,
          quantityRequired: totalRequired,
          quantityObtained: totalObtained,
          remainingToBuy: Math.max(0, totalRequired - totalObtained),
          totalCost: Math.max(0, totalRequired - totalObtained) * unitPrice,
          usedIn: [workshopItem]
        })
      }

      // 🔽 ENSUITE seulement, on descend si craftable
      if (ingredient.item.hasRecipe) {
        const subIngredients = allIngredients.filter(
          ing => ing.parentIngredientId === ingredient.id
        )

        if (subIngredients.length > 0) {
          processIngredients(
            subIngredients,
            totalRequired,
            allIngredients,
            resourceMap,
            workshopItem
          )
        }
      }
    }
  }

  function createEmptySummary(): WorkshopSummary {
    return {
      totalItems: 0,
      totalResources: 0,
      totalMissing: 0,
      totalComplete: 0,
      totalCost: 0,
      craftCost: 0,
      bestPrice: 0,
      adjustedCost: 0,
      resources: [],
      zones: []
    }
  }

  return {
    summary
  }
}