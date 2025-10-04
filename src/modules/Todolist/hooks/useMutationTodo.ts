// src/modules/Todolist/hooks/useMutationTodo.ts
import { clientV2 } from "@/services/axiosInstance"
import { AxiosResponse } from "axios"

type UpdateColumn = Record<string, any> // ex: { name: "Nouvelle tâche" }

export const useCreateTodo = async (
  idtodolist: number,
  name: string = '',
  description: string = "",
  priority: number = 0
): Promise<AxiosResponse<any>> => {
  return await clientV2.post(
    "/todolist/todo/add",
    { idtodolist, name, description, priority },
    { headers: { requireToken: true } }
  )
}

export const useUpdateTodo = async (
  idtodo: number,
  columnOrColumns: string | UpdateColumn | UpdateColumn[],
  value?: any
): Promise<AxiosResponse<any>> => {
  let columns: UpdateColumn[]

  if (typeof columnOrColumns === "string") {
    columns = [{ [columnOrColumns]: value }]
  } else if (Array.isArray(columnOrColumns)) {
    columns = columnOrColumns
  } else {
    columns = [columnOrColumns]
  }

  return await clientV2.put(
    `/todolist/todo/${idtodo}/update`,
    { columns },
    { headers: { requireToken: true } }
  )
}

export const useDeleteTodo = async (
  idtodo: number
): Promise<AxiosResponse<any>> => {
  return await clientV2.delete(`/todolist/todo/${idtodo}/delete`, {
    headers: { requireToken: true },
  })
}
