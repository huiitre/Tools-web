import client from "@/services/axiosInstance";

export const useFetchItemList = async () => {
  return await client.get('/dofus/item/list', { headers: { requireToken: false } })
}

export const useFetchItemListWeb = async (params: any) => {
  const { page, itemsPerPage, sortBy, search } = params
  return await client.post('/dofus/item/list-web', {
    sortBy,
    search
  },
  {
    headers: {
      requireToken: true
    },
    params: {
      page, itemsPerPage
    }
  })
}