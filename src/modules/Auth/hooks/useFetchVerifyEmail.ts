import { clientV3 } from '@/services/axiosInstance'

export const useFetchVerifyEmail = async (token: string) => {
  return await clientV3.post(`/auth/verify-email?token=${token}`)
}
