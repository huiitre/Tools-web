<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import "dayjs/locale/fr"
import {
  useFetchDofusAlmanax,
  useFetchItemAveragePrice,
  useFetchDofusBonuses
} from "../hooks/useFetchDofusAlmanax"
import toast from "@/services/toast"
import { copyToClipboard } from "@/utils/Core/string"
import LS from "@/services/localStorage"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

// 🔧 Activation du plugin isBetween
dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)
dayjs.locale("fr")

// ======= State =======
const today = dayjs()
const current = ref(dayjs()) // Mois affiché
const almanaxList = ref<any[]>([]) // Liste brute des almanax
const almanaxMap = ref<Record<string, any>>({})
const isLoading = ref(false)
const isLoadingPrices = ref(false)
const fetchedPriceMonths = ref<string[]>([])
const favorites = ref<{ date: string; entry: any }[]>([])
const LS_KEY_FAVORITES = "dofus_almanax_favorites"

// ======= Helpers calendrier =======
const year = computed(() => current.value.year())
const month = computed(() => current.value.month())
const daysInMonth = computed(() => current.value.daysInMonth())
const monthLabel = computed(() => current.value.format("MMMM YYYY"))

const handleCopyToClipboard = async(name: string) => {
  const result = await copyToClipboard(name)
  if (result)
    toast.success(`Nom copié avec succès !`)
  else
    toast.error(`Erreur lors de la copie dans le presse-papier`)
}

// ======= Jours du mois =======
const calendarDays = computed(() => {
  const arr: { day: number; dateKey: string; isToday: boolean }[] = []
  for (let d = 1; d <= daysInMonth.value; d++) {
    const date = dayjs(new Date(year.value, month.value, d))
    arr.push({
      day: d,
      dateKey: date.format("YYYY-MM-DD"),
      isToday: date.isSame(today, "day"),
    })
  }
  return arr
})

// ======= Favoris =======
const isFavorite = (dateKey: string) => favorites.value.some(f => f.date === dateKey)
const toggleFavorite = (dateKey: string) => {
  const entry = almanaxMap.value[dateKey]
  if (!entry) return

  const idx = favorites.value.findIndex(f => f.date === dateKey)
  if (idx >= 0) {
    favorites.value.splice(idx, 1)
  } else {
    favorites.value.push({ date: dateKey, entry })
  }

  // 🔄 sync LS manuellement pour être sûr même avant le watch
  LS.set(LS_KEY_FAVORITES, favorites.value)
}
// Supprime les favoris dont la date est passée
function cleanupFavorites() {
  const now = today.startOf("day")
  favorites.value = favorites.value.filter(f => dayjs(f.date).isSameOrAfter(now, "day"))
  LS.set(LS_KEY_FAVORITES, favorites.value) // 🆕 keep LS clean
}
function clearFavorites() {
  favorites.value = []
  LS.delete(LS_KEY_FAVORITES)
}
const sortedFavorites = computed(() => {
  const now = today.startOf("day")
  return [...favorites.value].sort(
    (a, b) => dayjs(a.date).diff(now) - dayjs(b.date).diff(now)
  )
})
watch(favorites, (newVal) => {
  LS.set(LS_KEY_FAVORITES, newVal)
}, { deep: true })

// ======= Fetch global Almanax =======
async function fetchAllAlmanax() {
  try {
    isLoading.value = true
    console.log("📅 Fetch de tous les Almanax (365 jours)")
    const data = await useFetchDofusAlmanax(365)
    almanaxList.value = data
    for (const a of data) {
      almanaxMap.value[a.date] = a
    }
    const counts: Record<string, number> = {}
    for (const a of data) {
      const id = a?.bonus?.type?.id
      if (!id) continue
      counts[id] = (counts[id] || 0) + 1
    }
    bonusCounts.value = counts
  } catch (e) {
    console.error(e)
    toast.error("Erreur lors du chargement des données Almanax.")
  } finally {
    isLoading.value = false
  }
}
async function fetchBonuses() {
  try {
    isLoadingBonuses.value = true
    const raw = await useFetchDofusBonuses()
    bonuses.value = raw.sort((a: any, b: any) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error("Erreur fetchBonuses:", e)
    toast.error("Erreur lors du chargement des bonus.")
  } finally {
    isLoadingBonuses.value = false
  }
}

// ======= Fetch prix Tools pour le mois affiché =======
async function fetchPricesForCurrentMonth() {
  const key = current.value.format("YYYY-MM")
  if (fetchedPriceMonths.value.includes(key)) return

  const start = current.value.startOf("month")
  const end = current.value.endOf("month")

  // 🔧 Correction : plugin isBetween utilisé correctement
  const entries = Object.values(almanaxMap.value).filter(a =>
    dayjs(a.date).isBetween(start, end, null, "[]")
  )

  console.log(`💰 Fetch prix moyens pour ${key} (${entries.length} items)`)

  isLoadingPrices.value = true
  try {
    await Promise.all(entries.map(async (a: any) => {
      const ankamaId = a?.tribute?.item?.ankama_id
      if (!ankamaId) return
      if (!a._tools) a._tools = {}

      try {
        const tools = await useFetchItemAveragePrice(ankamaId)
        a._tools.item_average_price = tools?.item_average_price ?? null
        a._tools.recipe = tools?.recipe ?? null
      } catch (err) {
        console.error(`Erreur Tools pour ${ankamaId}`, err)
        a._tools.item_average_price = null
      }
    }))
    fetchedPriceMonths.value.push(key)
  } catch (e) {
    console.error("Erreur fetchPricesForCurrentMonth", e)
  } finally {
    isLoadingPrices.value = false
  }
}

// ======= Filtres (bonus) =======
const bonuses = ref<{ name: string; url_code: string }[]>([])
const selectedBonus = ref("")   // vide = aucun filtre
const isLoadingBonuses = ref(false)
const bonusCounts = ref<Record<string, number>>({})

const getOpacity = (dateKey: string) => {
  if (!selectedBonus.value) return 1
  const entry = almanaxMap.value[dateKey]
  if (!entry || !entry.bonus?.type?.id) return 0.25
  return entry.bonus.type.id === selectedBonus.value ? 1 : 0.25
}

// ======= Navigation =======
const nextMonth = async () => {
  if (isLoading.value || isLoadingPrices.value) return
  current.value = current.value.add(1, "month")
  await fetchPricesForCurrentMonth()
}
const prevMonth = async () => {
  if (isLoading.value || isLoadingPrices.value) return
  current.value = current.value.subtract(1, "month")
  await fetchPricesForCurrentMonth()
}

// ======= Utils =======
const fmt = (n?: number | null) =>
  (typeof n === "number" ? n.toLocaleString() : "—")

const getProfitState = (entry: any) => {
  const price = entry._tools?.item_average_price
  const qty = entry.tribute?.quantity ?? 1
  const reward = entry.reward_kamas ?? 0
  if (!price || price <= 0) return null
  const total = price * qty
  if (total > reward) return "loss"
  if (total < reward) return "profit"
  return null
}

const getTotalPrice = (entry: any) => {
  const price = entry._tools?.item_average_price
  const qty = entry.tribute?.quantity ?? 1
  if (!price || price <= 0) return null
  return price * qty
}

// ======= Init =======
onMounted(async () => {
  const savedFavorites = LS.get(LS_KEY_FAVORITES)
  if (Array.isArray(savedFavorites)) {
    favorites.value = savedFavorites
  }
  cleanupFavorites()
  await Promise.all([fetchAllAlmanax(), fetchBonuses()])
  await fetchPricesForCurrentMonth()
})
</script>

<template>
  <div class="almanax">
    <div class="almanax__header">
      <button class="nav-btn" @click="prevMonth" :disabled="isLoading || isLoadingPrices">◀</button>
      <h2 class="month">{{ monthLabel }}</h2>
      <button class="nav-btn" @click="nextMonth" :disabled="isLoading || isLoadingPrices">▶</button>
    </div>

    <!-- Filtres -->
    <div class="filters">
      <label>
        <select v-model="selectedBonus" :disabled="isLoadingBonuses">
          <option value="">Tous les bonus</option>
          <option v-for="b in bonuses" :key="b.url_code" :value="b.url_code">
            {{ b.name }} ({{ bonusCounts[b.url_code] ?? 0 }})
          </option>
        </select>
      </label>
    </div>

    <div class="calendar">
      <div class="weekday" v-for="w in ['L','Ma','Me','J','V','S','D']" :key="w">{{ w }}</div>

      <div
        v-for="cell in calendarDays"
        :key="cell.dateKey"
        class="day"
        :class="{ today: cell.isToday, hasData: !!almanaxMap[cell.dateKey] }"
        :style="{ opacity: getOpacity(cell.dateKey) }"
      >
        <div class="day__header">
          <span class="day__num">{{ cell.day }}</span>
          <button class="fav-btn" :class="{ active: isFavorite(cell.dateKey) }" @click.stop="toggleFavorite(cell.dateKey)">
            <span v-if="isFavorite(cell.dateKey)">★</span><span v-else>☆</span>
          </button>
        </div>

        <template v-if="almanaxMap[cell.dateKey]">
          <div class="item">
            <img
              v-if="almanaxMap[cell.dateKey].tribute?.item?.image_urls?.icon"
              :src="almanaxMap[cell.dateKey].tribute.item.image_urls.icon"
              alt="item"
              class="item__img"
              loading="lazy"
            />
            <div class="item__meta">
              <div class="item__name" @click="handleCopyToClipboard(almanaxMap[cell.dateKey].tribute?.item?.name)">{{ almanaxMap[cell.dateKey].tribute?.item?.name }}</div>

              <div class="row tiny">
                <span v-if="almanaxMap[cell.dateKey].tribute?.quantity">x{{ almanaxMap[cell.dateKey].tribute.quantity }}</span>
                <span class="sep">•</span>
                <span>💰 {{ fmt(almanaxMap[cell.dateKey].reward_kamas) }} ₭</span>
              </div>

              <div
                v-if="almanaxMap[cell.dateKey]._tools?.item_average_price && almanaxMap[cell.dateKey]._tools?.item_average_price > 0"
                class="row tiny muted"
              >
                <i
                  v-if="getProfitState(almanaxMap[cell.dateKey]) === 'profit'"
                  class="fa-solid fa-arrow-down arrow profit"
                ></i>
                <i
                  v-else-if="getProfitState(almanaxMap[cell.dateKey]) === 'loss'"
                  class="fa-solid fa-arrow-up arrow loss"
                ></i>

                <span class="avg">
                  {{ fmt(getTotalPrice(almanaxMap[cell.dateKey])) }} ₭
                  <span class="total" v-if="getTotalPrice(almanaxMap[cell.dateKey])">
                    ({{ fmt(almanaxMap[cell.dateKey]._tools?.item_average_price) }} ₭ /u)
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="bonus">
            <strong>{{ almanaxMap[cell.dateKey].bonus?.type?.name }}:</strong>
            <br />
            {{ almanaxMap[cell.dateKey].bonus?.description }}
          </div>
        </template>

        <template v-else>
          <div class="no-data">—</div>
        </template>
      </div>
    </div>

    <!-- Liste des favoris -->
    <div v-if="sortedFavorites.length" class="favorites">
      <h3 class="favorites__title">Favoris à venir</h3>

      <div
        v-for="fav in sortedFavorites"
        :key="fav.date"
        class="day fav-day"
      >
        <div class="day__header">
          <span class="day__num">{{ dayjs(fav.date).format('DD MMM') }}</span>
          <button class="fav-btn active" @click="toggleFavorite(fav.date)">★</button>
        </div>

        <div class="item">
          <img
            v-if="fav.entry?.tribute?.item?.image_urls?.icon"
            :src="fav.entry.tribute.item.image_urls.icon"
            alt="item"
            class="item__img"
          />
          <div class="item__meta">
            <div
              class="item__name"
              @click="handleCopyToClipboard(fav.entry?.tribute?.item?.name)"
            >
              {{ fav.entry?.tribute?.item?.name }}
            </div>

            <div class="row tiny">
              <span v-if="fav.entry?.tribute?.quantity">
                x{{ fav.entry.tribute.quantity }}
              </span>
              <span class="sep">•</span>
              <span>💰 {{ fmt(fav.entry.reward_kamas) }} ₭</span>
            </div>

            <div
              v-if="fav.entry._tools?.item_average_price && fav.entry._tools?.item_average_price > 0"
              class="row tiny muted"
            >
              <i
                v-if="getProfitState(fav.entry) === 'profit'"
                class="fa-solid fa-arrow-down arrow profit"
              ></i>
              <i
                v-else-if="getProfitState(fav.entry) === 'loss'"
                class="fa-solid fa-arrow-up arrow loss"
              ></i>

              <span class="avg">
                {{ fmt(getTotalPrice(fav.entry)) }} ₭
                <span class="total" v-if="getTotalPrice(fav.entry)">
                  ({{ fmt(fav.entry._tools?.item_average_price) }} ₭ /u)
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="bonus">
          <strong>{{ fav.entry.bonus?.type?.name }}:</strong>
          <br />
          {{ fav.entry.bonus?.description }}
        </div>
      </div>
    </div>

    <div class="status">
      <span v-if="isLoading">Chargement des Almanax…</span>
      <span v-else-if="isLoadingPrices">Chargement des prix Tools…</span>
    </div>
  </div>
</template>

<style scoped>
.almanax {
  --fs-xs: 9px;
  --fs-s: 10px;
  --fs-base: 11px;
  --pad: 0.3rem;
  --gap: 0.35rem;
  --radius: 8px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  font-size: var(--fs-base);
}

.almanax__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
}
.month {
  margin: 0;
  text-transform: capitalize;
  font-size: 14px;
}

.nav-btn {
  padding: .15rem .4rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--fs-base);
  transition: all .15s;
}
.nav-btn:hover {
  background: #f2f2f2;
}
.nav-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.calendar {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: .35rem;
  align-items: start;
}

.weekday {
  text-align: center;
  font-weight: 600;
  opacity: .75;
  font-size: var(--fs-s);
}

.day {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  border: 1px solid #eee;
  border-radius: var(--radius);
  padding: var(--pad);
  min-height: 130px;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
}
.day.today { box-shadow: 0 0 0 2px #2196f3 inset; }
.day.hasData { background: #fcfcfc; }

.day__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.day__num { font-weight: 700; font-size: var(--fs-base); }

.fav-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  color: #bbb;
}
.fav-btn.active { color: #f5c518; }

.item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: .35rem;
  align-items: center;
}
.item__img {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  object-fit: contain;
  background: #f3f3f3;
  border: 1px solid #eee;
}
.item__meta {
  display: flex;
  flex-direction: column;
  gap: .15rem;
}
.item__name {
  font-weight: 600;
  font-size: var(--fs-s);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.row {
  display: flex;
  align-items: center;
  gap: .25rem;
  flex-wrap: nowrap;
}
.row.tiny { font-size: var(--fs-xs); }
.sep { opacity: .5; }
.muted { opacity: .7; }

.arrow {
  font-size: 9px;
  margin-right: 0.15rem;
}
.arrow.profit { color: #2ecc71; }
.arrow.loss { color: #e74c3c; }

.avg {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}
.total {
  opacity: 0.75;
  margin-left: 0.1rem;
}

.bonus {
  font-size: var(--fs-xs);
  line-height: 1.15;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  opacity: .95;
}

.no-data {
  text-align: center;
  opacity: .35;
  font-size: var(--fs-s);
  margin-top: .2rem;
}

.status {
  font-size: var(--fs-s);
  opacity: .8;
}

/* Filtres */
.filters {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  margin: .25rem 0 .5rem;
  font-size: var(--fs-s);
}
.filters select {
  font-size: var(--fs-s);
  padding: .2rem .3rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.filters select:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* Favoris */
.favorites {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.favorites__title {
  font-weight: 600;
  font-size: 12px;
  opacity: 0.9;
  text-align: center;
  margin-bottom: 0.25rem;
}
.fav-day {
  background: #fffef8;
  border-color: #f5d76e;
}

@media (max-width: 700px) {
  .item {
    grid-template-columns: 24px 1fr;
  }
  .item__img { width: 24px; height: 24px; }
  .day { min-height: 120px; }
}
</style>
