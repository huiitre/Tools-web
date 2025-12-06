import { clientV2 } from "@/services/axiosInstance";

export const useFetchGetQueriesList = async () => {
  return await clientV2.get(`/dofus/query-lab/query`, {
    headers: { requireToken: true }
  })
}