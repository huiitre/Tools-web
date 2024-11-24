import client from "@/services/axiosInstance";

export type useFetchConnexionType = {
  email: string;
  password: string
}
export const useFetchConnexion = async (credentials: useFetchConnexionType) => {
  return await client.post('/core/auth/login', credentials)
}