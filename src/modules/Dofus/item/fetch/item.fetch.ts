import { clientV3Dofus } from "@/services/axiosInstance"

export const useFetchItemPrices = async (itemIds: number[]) => {
  return clientV3Dofus.post("/dofus/item/prices", { itemIds })
}

export const useMutationItemPrices = async(items: { itemId: number; price: number }[]) => {
  return clientV3Dofus.put("/dofus/item/prices/batch", items)
}