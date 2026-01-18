<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFetchAlmanax } from '@/modules/Dofus/hooks/useFetchAlmanax'
import AlmanaxNav from '@/modules/Dofus/Almanax/AlmanaxNav.vue'
import CalendarGrid from '@/modules/Dofus/Almanax/CalendarGrid.vue'
import CalendarWeekdays from '@/modules/Dofus/Almanax/CalendarWeekdays.vue'
import FullPageLoader from '@/components/ui/FullPageLoader.vue'
import toast from '@/services/toast'

type Almanax = {
  id: number
  name: string
  description: string
  date: string
}

const almanaxList = ref<Almanax[]>([])

const isLoading = ref(false)

const today = new Date()
const todayISO =
  today.getFullYear() + '-' +
  String(today.getMonth() + 1).padStart(2, '0') + '-' +
  String(today.getDate()).padStart(2, '0')

const displayedYear = ref(today.getFullYear())
const displayedMonth = ref(today.getMonth())

onMounted(async () => {
  try {
    isLoading.value = true
    const { data } = await useFetchAlmanax()
    almanaxList.value = data
  } catch (error: any) {
    console.error('Failed to fetch Almanax data:', error)
    toast.error(error?.message || 'Erreur lors du chargement des données Almanax')
  } finally {
    isLoading.value = false
  }
})

const minDate = computed(() => {
  if (almanaxList.value.length === 0) return null
  return new Date(almanaxList.value.map(a => a.date).sort()[0])
})

const maxDate = computed(() => {
  if (almanaxList.value.length === 0) return null
  return new Date(almanaxList.value.map(a => a.date).sort().at(-1)!)
})

const canGoPrev = computed(() => {
  if (!minDate.value) return false
  return (
    displayedYear.value > minDate.value.getFullYear() ||
    (
      displayedYear.value === minDate.value.getFullYear() &&
      displayedMonth.value > minDate.value.getMonth()
    )
  )
})

const canGoNext = computed(() => {
  if (!maxDate.value) return false
  return (
    displayedYear.value < maxDate.value.getFullYear() ||
    (
      displayedYear.value === maxDate.value.getFullYear() &&
      displayedMonth.value < maxDate.value.getMonth()
    )
  )
})

const isCurrentMonth = computed(() => {
  return (
    displayedYear.value === today.getFullYear() &&
    displayedMonth.value === today.getMonth()
  )
})

const goPrevMonth = () => {
  if (!canGoPrev.value) return
  displayedMonth.value === 0
    ? (displayedMonth.value = 11, displayedYear.value--)
    : displayedMonth.value--
}

const goNextMonth = () => {
  if (!canGoNext.value) return
  displayedMonth.value === 11
    ? (displayedMonth.value = 0, displayedYear.value++)
    : displayedMonth.value++
}

const goToday = () => {
  displayedYear.value = today.getFullYear()
  displayedMonth.value = today.getMonth()
}

const almanaxByDate = computed(() => {
  const map = new Map<string, Almanax>()
  for (const a of almanaxList.value) map.set(a.date, a)
  return map
})

const days = computed(() => {
  const result = []
  const firstOfMonth = new Date(displayedYear.value, displayedMonth.value, 1)
  const firstDayIndex = (firstOfMonth.getDay() + 6) % 7
  const startDate = new Date(displayedYear.value, displayedMonth.value, 1 - firstDayIndex)

  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    const iso =
      d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0')

    result.push({
      date: d,
      iso,
      isToday: iso === todayISO,
      isCurrentMonth: d.getMonth() === displayedMonth.value,
      almanax: almanaxByDate.value.get(iso),
    })
  }

  return result
})
</script>

<template>
  <div id="dofus-almanax">
    <AlmanaxNav
      :year="displayedYear"
      :month="displayedMonth"
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      :is-current-month="isCurrentMonth"
      @prev="goPrevMonth"
      @next="goNextMonth"
      @today="goToday"
    />

    <CalendarWeekdays />
    <CalendarGrid :days="days" />

    <FullPageLoader :visible="isLoading" />
  </div>
</template>

<style lang="scss" scoped>
#dofus-almanax {
  padding: 0.5rem;
}
</style>
