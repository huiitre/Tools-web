// /src/hooks/useFetchWeightLog.ts
import { clientV2 } from "@/services/axiosInstance";

// Liste des entrées (utilisateur courant via token)
export const useFetchWeightLogs = async () => {
  return await clientV2.get("/health/weight-log", {
    headers: { requireToken: true },
  });
};

// Récupérer une entrée par ID (sécurisé côté API par iduser du token)
export const useFetchWeightLogById = async (id: number | string) => {
  return await clientV2.get(`/health/weight-log/${id}`, {
    headers: { requireToken: true },
  });
};