import client from "@/services/axiosInstance"

export const useFetchSetList = async () => {
  return await client.get('/dofus/set/get', { headers: { requireToken: true } })
}

export const useFetchSetById = async(idset: any) => {
  return await client.get(`/dofus/set/${idset}/get`, { headers: { requireToken: true } })
}

export const useFetchSharedSetByToken = async(token: any) => {
  return await client.get(`/dofus/set/shared/${token}`, { headers: { requireToken: true } })
}