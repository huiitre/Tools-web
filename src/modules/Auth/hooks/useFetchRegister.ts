import { clientV2 } from "@/services/axiosInstance";

export type useFetchRegisterType = {
  email: string;
  password: string;
  confirm_password: string;
  name: string
}
export const useFetchRegister = async (credentials: useFetchRegisterType) => {
  return await clientV2.post('/core/auth/register', credentials)
}