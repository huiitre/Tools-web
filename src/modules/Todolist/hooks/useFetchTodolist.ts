import { clientV2 } from "@/services/axiosInstance";

export const useFetchTodolist = async () => {
  return await clientV2.get('/todolist/get', { headers: { requireToken: true } })
}
export const useFetchTodolistById = async (idtodolist: number) => {
  return await clientV2.get(`/todolist/${idtodolist}/get`, {
    headers: { requireToken: true }
  })
}