import client from "@/services/axiosInstance";

export const useFetchDisconnectUser = async () => {
  return await client.get('/auth/logout', { headers: { requireToken: true } })
}