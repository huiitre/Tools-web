import { clientV2 } from "@/services/axiosInstance";

export const useMutationDeleteQuery = async (queryId: string) => {
  return await clientV2.delete(`/dofus/query-lab/query/${queryId}`, {
    headers: { requireToken: true }
  })
}

export const useMutationUpdateQuery = async (queryId: string, payload: { sqlRaw: string, title: string, description?: string, isPublic?: boolean }) => {
  return await clientV2.put(`/dofus/query-lab/query/${queryId}`, payload, {
    headers: { requireToken: true }
  })
}

export const useMutationCreateQuery = async (payload: {
  title: string,
  description?: string,
  sqlRaw: string
}) => {
  return await clientV2.post(`/dofus/query-lab/query`, payload, {
    headers: { requireToken: true }
  })
}

export const useMutationRunQuery = async (queryId: number) => {
  return await clientV2.post(
    `/dofus/query-lab/query/${queryId}/run`,
    {}, // pas de body pour l’instant
    {
      headers: { requireToken: true }
    }
  )
}

export const useMutationRunRawQuery = async (sqlRaw: string) => {
  return await clientV2.post(
    `/dofus/query-lab/query/run-raw`,
    { sqlRaw },
    {
      headers: { requireToken: true }
    }
  )
}