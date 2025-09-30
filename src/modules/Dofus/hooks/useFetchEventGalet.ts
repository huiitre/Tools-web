import { clientV2 } from "@/services/axiosInstance";

export const useFetchEventGalet = async () => {
  return await clientV2.get(`/dofus/item/event-galet/calculate`, { headers: { requireToken: true } })
}