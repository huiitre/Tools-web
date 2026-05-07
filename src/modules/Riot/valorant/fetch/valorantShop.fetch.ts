import type { RiotRegion } from '@/modules/Riot/riot.store'

const VP_CURRENCY_ID = '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741'
const CLIENT_PLATFORM =
  'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9'

export interface ShopSkin {
  id: string
  name: string
  icon: string
  cost: number
}

export function extractPuuid(accessToken: string): string {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    if (!payload.sub) throw new Error()
    return payload.sub
  } catch {
    throw new Error('Token invalide — impossible de lire le PUUID')
  }
}

export async function fetchEntitlementToken(accessToken: string): Promise<string> {
  const res = await fetch('https://entitlements.auth.riotgames.com/api/token/v1', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
  if (!res.ok) throw new Error(`Token Riot invalide ou expiré (${res.status})`)
  const data = await res.json()
  return data.entitlements_token
}

export async function fetchClientVersion(): Promise<string> {
  const res = await fetch('https://valorant-api.com/v1/version')
  if (!res.ok) throw new Error(`Impossible de récupérer la version Valorant (${res.status})`)
  const data = await res.json()
  return data.data.riotClientVersion
}

export interface StorefrontResult {
  offers: Array<{ id: string; cost: number }>
  remainingSeconds: number
}

export async function fetchStorefront(
  puuid: string,
  region: RiotRegion,
  accessToken: string,
  entitlementsToken: string,
  clientVersion: string,
): Promise<StorefrontResult> {
  const res = await fetch(`https://pd.${region}.a.pvp.net/store/v3/storefront/${puuid}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlementsToken,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': clientVersion,
    },
    body: '{}',
  })
  if (!res.ok) throw new Error(`Erreur boutique Valorant (${res.status})`)
  const data = await res.json()
  return {
    offers: data.SkinsPanelLayout.SingleItemStoreOffers.map((offer: any) => ({
      id: offer.Rewards[0].ItemID,
      cost: offer.Cost[VP_CURRENCY_ID] ?? 0,
    })),
    remainingSeconds: data.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds ?? 0,
  }
}

export async function fetchSkinsMap(): Promise<Record<string, any>> {
  const res = await fetch('https://valorant-api.com/v1/weapons/skins?language=fr-FR')
  if (!res.ok) throw new Error(`Impossible de récupérer les skins (${res.status})`)
  const data = await res.json()

  const map: Record<string, any> = {}
  for (const skin of data.data) {
    map[skin.uuid] = skin
    for (const level of skin.levels ?? []) map[level.uuid] = skin
    for (const chroma of skin.chromas ?? []) map[chroma.uuid] = skin
  }
  return map
}
