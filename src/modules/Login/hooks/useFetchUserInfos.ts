import client from "@/services/axiosInstance";

export const useFetchUserInfos = async () => {
  return await client.get('/auth/me', { headers: { requireToken: true } })
}