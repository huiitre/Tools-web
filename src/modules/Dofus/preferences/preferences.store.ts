import { defineStore } from 'pinia'
import { PriceDisplayMode } from '@/modules/Dofus/preferences/types/priceDisplayMode.enum'

/* ======================
   TYPES
====================== */

type DofusConfigState = {
  priceDisplayMode: PriceDisplayMode
  showOtherPricesOnHover: boolean
}

/* ======================
   CONSTANTS
====================== */

const STORAGE_KEY_PRICE_MODE = 'dofus.priceDisplayMode'
const STORAGE_KEY_SHOW_OTHER_PRICES = 'dofus.showOtherPricesOnHover'

const DEFAULT_PRICE_MODE: PriceDisplayMode = PriceDisplayMode.COMMUNITY
const DEFAULT_SHOW_OTHER_PRICES = true

/* ======================
   STORE
====================== */

export const useDofusConfigStore = defineStore('dofus.preferences', {
  state: (): DofusConfigState => ({
    priceDisplayMode: DEFAULT_PRICE_MODE,
    showOtherPricesOnHover: DEFAULT_SHOW_OTHER_PRICES,
  }),

  getters: {
    isUserPrice: (s) => s.priceDisplayMode === PriceDisplayMode.USER,
    isCommunityPrice: (s) =>
      s.priceDisplayMode === PriceDisplayMode.COMMUNITY,
    isLastPrice: (s) => s.priceDisplayMode === PriceDisplayMode.LAST,
  },

  actions: {
    /* ===== PRICE MODE ===== */

    setPriceDisplayMode(mode: PriceDisplayMode) {
      this.priceDisplayMode = mode
      localStorage.setItem(STORAGE_KEY_PRICE_MODE, mode)
    },

    /* ===== OTHER PRICES ON HOVER ===== */

    setShowOtherPricesOnHover(value: boolean) {
      this.showOtherPricesOnHover = value
      localStorage.setItem(
        STORAGE_KEY_SHOW_OTHER_PRICES,
        String(value),
      )
    },

    /* ===== HYDRATION ===== */

    hydrateFromStorage() {
      // priceDisplayMode
      const storedPriceMode = localStorage.getItem(
        STORAGE_KEY_PRICE_MODE,
      )

      if (
        storedPriceMode === PriceDisplayMode.USER ||
        storedPriceMode === PriceDisplayMode.COMMUNITY ||
        storedPriceMode === PriceDisplayMode.LAST
      ) {
        this.priceDisplayMode = storedPriceMode
      } else {
        this.priceDisplayMode = DEFAULT_PRICE_MODE
        localStorage.removeItem(STORAGE_KEY_PRICE_MODE)
      }

      // showOtherPricesOnHover
      const storedShowOtherPrices = localStorage.getItem(
        STORAGE_KEY_SHOW_OTHER_PRICES,
      )

      if (storedShowOtherPrices === 'true') {
        this.showOtherPricesOnHover = true
      } else if (storedShowOtherPrices === 'false') {
        this.showOtherPricesOnHover = false
      } else {
        this.showOtherPricesOnHover = DEFAULT_SHOW_OTHER_PRICES
        localStorage.removeItem(STORAGE_KEY_SHOW_OTHER_PRICES)
      }
    },

    /* ===== RESET ===== */

    clear() {
      this.priceDisplayMode = DEFAULT_PRICE_MODE
      this.showOtherPricesOnHover = DEFAULT_SHOW_OTHER_PRICES

      localStorage.removeItem(STORAGE_KEY_PRICE_MODE)
      localStorage.removeItem(STORAGE_KEY_SHOW_OTHER_PRICES)
    },
  },
})
