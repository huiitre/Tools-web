import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'riot.auth'

export type RiotRegion = 'eu' | 'na' | 'ap' | 'kr' | 'br' | 'latam'

interface RiotAuth {
  accessToken: string | null
  refreshToken: string | null
  region: RiotRegion
}

export const useRiotStore = defineStore('riot', () => {
  const stored = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as RiotAuth
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  })()

  const accessToken = ref<string | null>(stored?.accessToken ?? null)
  const refreshToken = ref<string | null>(stored?.refreshToken ?? null)
  const region = ref<RiotRegion>(stored?.region ?? 'eu')

  function setAuth(token: string, reg: RiotRegion) {
    accessToken.value = token
    region.value = reg
    persist()
  }

  function setAccessToken(token: string) {
    accessToken.value = token
    persist()
  }

  function setRefreshToken(token: string) {
    refreshToken.value = token
    persist()
  }

  function setRegion(reg: RiotRegion) {
    region.value = reg
    persist()
  }

  function clearAll() {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function persist() {
    const data: RiotAuth = {
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      region: region.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  return { accessToken, refreshToken, region, setAuth, setAccessToken, setRefreshToken, setRegion, clearAll }
})
