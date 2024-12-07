import client from "@/services/axiosInstance";

export const useFetchDisconnectUser = async () => {
  return await client.get('/core/auth/logout', { headers: { requireToken: true } })
}