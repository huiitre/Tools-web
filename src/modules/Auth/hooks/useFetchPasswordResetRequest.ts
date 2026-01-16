import { clientV3 } from '@/services/axiosInstance'

export type PasswordResetRequestPayload = {
  email: string
}

export const useFetchPasswordResetRequest = async (
  payload: PasswordResetRequestPayload
) => {
  return await clientV3.post('/auth/password/reset-request', payload)
}
