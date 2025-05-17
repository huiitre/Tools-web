import { clientV2 } from "@/services/axiosInstance";

export const useMutationAddFeedback = async (message: string) => {
  return await clientV2.post('/core/feedback/add', { message }, { headers: { requireToken: true } })
}