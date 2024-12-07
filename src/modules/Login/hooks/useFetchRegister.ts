import client from "@/services/axiosInstance";

export type useFetchRegisterType = {
  email: string;
  password: string;
  confirm_password: string;
  name: string
}
export const useFetchRegister = async (credentials: useFetchRegisterType) => {
  return await client.post('/core/auth/register', credentials)
}