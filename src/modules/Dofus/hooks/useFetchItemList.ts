import client from "@/services/axiosInstance";

export const useFetchItemList = async () => {
  return await client.get('/dofus/item/all', { headers: { requireToken: false } })
}