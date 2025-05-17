import { clientV1 } from "@/services/axiosInstance";

export const useFetchEventGalet = async () => {
  return await clientV1.get(`/dofus/item/event-galet/calculate`, { headers: { requireToken: true } })
}