import { clientV2 } from "@/services/axiosInstance";

export type useFetchConnexionWithGoogleType = {
  googleJwt: string;
}
export const useFetchConnexionWithGoogle = async (credentials: useFetchConnexionWithGoogleType) => {
  return await clientV2.post('/core/auth/login-with-google', { ...credentials })
}