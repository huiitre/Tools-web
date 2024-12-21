import client from "@/services/axiosInstance";

export type useFetchConnexionWithGoogleType = {
  googleJwt: string;
}
export const useFetchConnexionWithGoogle = async (credentials: useFetchConnexionWithGoogleType) => {
  return await client.post('/core/auth/login-with-google', { ...credentials })
}