import { clientV3 } from "@/services/axiosInstance";

export const useFetchLogout = async () => {
  return await clientV3.post('/auth/logout')
}