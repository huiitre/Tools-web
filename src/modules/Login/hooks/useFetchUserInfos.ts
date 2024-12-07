import client from "@/services/axiosInstance";

export const useFetchUserInfos = async () => {
  return await client.get('/core/auth/me', { headers: { requireToken: true } })
}