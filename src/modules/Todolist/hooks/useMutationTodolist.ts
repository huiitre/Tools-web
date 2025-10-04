// useMutationTodolist.ts
import { clientV2 } from "@/services/axiosInstance"
import { AxiosResponse } from "axios"

// -------------------------------------------------
// Modification d’une todolist
// -------------------------------------------------
type UpdateColumn = Record<string, any> // objet clé: valeur (ex: { is_favorite: true })
export const useUpdateTodolist = async (
  idtodolist: number,
  columnOrColumns: string | UpdateColumn | UpdateColumn[],
  value?: any
): Promise<AxiosResponse<any>> => {
  let columns: UpdateColumn[]

  if (typeof columnOrColumns === "string") {
    // transforme en { colonne: valeur }
    columns = [{ [columnOrColumns]: value }]
  } else if (Array.isArray(columnOrColumns)) {
    columns = columnOrColumns
  } else {
    columns = [columnOrColumns]
  }

  return await clientV2.put(
    `/todolist/${idtodolist}/update`,
    { columns },
    { headers: { requireToken: true } }
  )
}

// -------------------------------------------------
// Création d’une nouvelle todolist
// -------------------------------------------------
export const useCreateTodolist = async (
  color: string = "#FFFFFF",
  isFavorite: boolean = false
): Promise<AxiosResponse<any>> => {
  return await clientV2.post(
    "/todolist/add",
    { color, isFavorite }, // pas de "name", c'est l’API qui mettra "Nouvelle liste"
    { headers: { requireToken: true } }
  )
}

// -------------------------------------------------
// Suppression d’une todolist
// -------------------------------------------------
export const useDeleteTodolist = async (
  idtodolist: number
): Promise<AxiosResponse<any>> => {
  return await clientV2.delete(
    `/todolist/${idtodolist}/delete`,
    { headers: { requireToken: true } }
  )
}