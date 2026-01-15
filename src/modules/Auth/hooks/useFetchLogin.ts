import { clientV3 } from "@/services/axiosInstance";

export type useFetchLoginType = {
  email: string;
  password: string;
}
export const useFetchLogin = async (credentials: useFetchLoginType) => {
  return await clientV3.post('/auth/login', { ...credentials })
}