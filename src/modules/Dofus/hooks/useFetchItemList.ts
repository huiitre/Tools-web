import client from "@/services/axiosInstance";

export const useFetchItemListWeb = async (params: any) => {
  const { page, itemsPerPage, sortBy, search, onlyCraftable } = params
  return await client.post('/dofus/item/list-web', {
    sortBy,
    search,
    onlyCraftable
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