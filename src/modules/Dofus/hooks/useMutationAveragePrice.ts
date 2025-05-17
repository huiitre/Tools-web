import { clientV1 } from "@/services/axiosInstance";

export const useMutationAveragePrice = async (iditem: any, price: string | number) => {
  return await clientV1.patch(`/dofus/item/${iditem}/update`, {
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