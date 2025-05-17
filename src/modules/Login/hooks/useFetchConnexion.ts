import { clientV2 } from "@/services/axiosInstance";

export type useFetchConnexionType = {
  email: string;
  password: string
}
export const useFetchConnexion = async (credentials: useFetchConnexionType) => {
  return await clientV2.post('/core/auth/login', { ...credentials })
}