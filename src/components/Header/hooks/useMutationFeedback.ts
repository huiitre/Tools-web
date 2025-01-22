import client from "@/services/axiosInstance";

export const useMutationAddFeedback = async (message: string) => {
  return await client.post('/core/feedback/add', { message }, { headers: { requireToken: true } })
}