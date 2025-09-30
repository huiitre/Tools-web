import { clientV2 } from "@/services/axiosInstance";

export const useMutationAveragePrice = async (iditem: any, price: string | number) => {
  return await clientV2.patch(`/dofus/item/${iditem}/update`, {
    columns: [
      {
        name: "average_price",
        value: price,
        type: "integer"
      }
    ]
  },
  {
    headers: {
      requireToken: true
    }
  })
}