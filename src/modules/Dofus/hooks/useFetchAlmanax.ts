import { clientV3 } from '@/services/axiosInstance'

export const useFetchAlmanax = async () => {
  return await clientV3.get('/dofus/almanax')
}
