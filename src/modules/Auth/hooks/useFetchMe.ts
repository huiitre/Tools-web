import { clientV3 } from "@/services/axiosInstance";

export const useFetchMe = async () => {
  return await clientV3.get('/user/me')
}