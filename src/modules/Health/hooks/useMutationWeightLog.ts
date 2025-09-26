// /src/hooks/useMutationWeightLog.ts
import { clientV2 } from "@/services/axiosInstance";

// Créer une entrée
// payload minimal: { weightKg: number, loggedAt?: string, notes?: string }
export const useCreateWeightLog = async (payload: {
  weightKg: number;
  loggedAt?: string;
  notes?: string;
}) => {
  return await clientV2.post("/health/weight-log", payload, {
    headers: { requireToken: true },
  });
};

// Mettre à jour une entrée
export const useUpdateWeightLog = async (
  id: number | string,
  payload: { weightKg: number; loggedAt?: string; notes?: string }
) => {
  return await clientV2.put(`/health/weight-log/${id}`, payload, {
    headers: { requireToken: true },
  });
};

// Supprimer une entrée
export const useDeleteWeightLog = async (id: number | string) => {
  return await clientV2.delete(`/health/weight-log/${id}`, {
    headers: { requireToken: true },
  });
};