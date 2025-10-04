// src/modules/Todolist/hooks/useFetchTodo.ts
import { clientV2 } from "@/services/axiosInstance"
import { AxiosResponse } from "axios"

// Récupérer tous les todos d'une liste
export const useFetchTodosByList = async (
  idtodolist: number
): Promise<AxiosResponse<any>> => {
  return await clientV2.get(`/todolist/todo/${idtodolist}/get`, {
    headers: { requireToken: true },
  })
}