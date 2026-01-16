import { clientV3 } from '@/services/axiosInstance'

export type PasswordResetPayload = {
  password: string
  token: string
}

export const useFetchPasswordReset = async (
  payload: PasswordResetPayload
) => {
  return await clientV3.post('/auth/password/reset', payload)
}
