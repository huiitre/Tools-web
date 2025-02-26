import client from "@/services/axiosInstance";

export const useFetchEventGalet = async () => {
  return await client.get(`/dofus/item/event-galet/calculate`, { headers: { requireToken: true } })
}