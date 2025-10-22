import axios from "axios"
import { clientV2 } from "@/services/axiosInstance"

export type DofusAlmanaxApi = {
  language: string
  version: number
  data: DofusAlmanaxEntry[]
}

export type DofusAlmanaxEntry = {
  date: string // "YYYY-MM-DD"
  bonus: { bonus: string; description: string }
  item?: {
    ankama_id: number
    image_url?: string
  }
  item_name?: string
  item_quantity?: number
  reward_kamas?: number
  // Enrichissements côté front :
  _tools?: {
    item_average_price?: number | null
    recipe?: Array<any> | null
  }
}

export const useFetchDofusAlmanax = async (days: number = 365) => {
  const url = "https://api.dofusdu.de/dofus3/v1/fr/almanax"
  const params = {
    "range[size]": days,
    timezone: "Europe/Paris"
  }
  const data = await axios.get<DofusAlmanaxApi>(url, { params })
  return data?.data ?? []
}

/** Bonus list (pour filtrage plus tard) */
export const useFetchDofusBonuses = async () => {
  const url = `https://dofusdu.de/dofus/bonuses/fr`
  const { data } = await axios.get(url)
  return data?.data ?? []
}

/** Prix moyen depuis Tools v2, + recettes si dispo */
export const useFetchItemAveragePrice = async (ankamaId: number) => {
  try {
    const { data } = await clientV2.get(`/dofus/item/${ankamaId}`, {
      headers: { requireToken: true }
    })
    return data?.data ?? null
  } catch (e) {
    console.error(`Erreur prix moyen pour ${ankamaId}`, e)
    return null
  }
}
