import { clientV2 } from "@/services/axiosInstance";

export const useFetchDisconnectUser = async () => {
  return await clientV2.get('/core/auth/logout', { headers: { requireToken: true } })
}