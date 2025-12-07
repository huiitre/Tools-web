import { clientV2 } from "@/services/axiosInstance"

export const useFetchSetList = async () => {
  return await clientV2.get('/dofus/set/get', { headers: { requireToken: true } })
}

export const useFetchSetById = async(idset: any) => {
  return await clientV2.get(`/dofus/set/${idset}/get`, { headers: { requireToken: true } })
}

export const getImportData = async (source: string, value: string) => {
  return await clientV2.post('/dofus/set/import', {
    source: source,
    value: value
  }, {
    headers: {
      requireToken: true
    }
  });
};