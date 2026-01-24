import { clientV3Dofus } from "@/services/axiosInstance"

export const useFetchItemPrices = async (itemIds: number[]) => {
  return clientV3Dofus.post("/dofus/item/prices", { itemIds })
}