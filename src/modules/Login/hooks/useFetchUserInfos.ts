import { clientV2 } from "@/services/axiosInstance";

export const useFetchUserInfos = async () => {
  return await clientV2.get('/core/auth/me', { headers: { requireToken: true } })
}