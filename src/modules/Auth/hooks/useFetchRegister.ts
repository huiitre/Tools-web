import { clientV3 } from "@/services/axiosInstance";

export type useFetchRegisterType = {
  name: string
  email: string;
  password: string;
}
export const useFetchRegister = async (credentials: useFetchRegisterType) => {
  return await clientV3.post('/auth/register', credentials)
}