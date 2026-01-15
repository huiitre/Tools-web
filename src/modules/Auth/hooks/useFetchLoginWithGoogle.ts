import { clientV3 } from "@/services/axiosInstance";

export type useFetchLoginWithGoogleType = {
  idToken: string
}
export const useFetchLoginWithGoogle = async (credentials: useFetchLoginWithGoogleType) => {
  return await clientV3.post('/auth/google', { ...credentials })
}