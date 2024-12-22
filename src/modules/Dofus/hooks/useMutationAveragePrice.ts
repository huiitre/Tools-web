import client from "@/services/axiosInstance";

export const useMutationAveragePrice = async (iditem: any, price: string | number) => {
  return await client.patch(`/dofus/item/${iditem}/update`, {
    columns: {
      average_price: {
        value: price,
        type: "integer"
      }
    }
  },
  {
    headers: {
      requireToken: true
    }
  })
}