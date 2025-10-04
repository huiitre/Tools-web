// src/composables/useSwipe.ts
import { ref } from "vue"

export function useSwipe(
  onSwipeLeft: (id: number) => void,
  onSwipeRight?: (id: number) => void,
  threshold = 50
) {
  const touchStartX = ref(0)

  function onTouchStart(e: TouchEvent) {
    touchStartX.value = e.changedTouches[0].clientX
  }

  function onTouchEnd(e: TouchEvent, id: number) {
    const endX = e.changedTouches[0].clientX
    const deltaX = touchStartX.value - endX

    if (deltaX > threshold) {
      onSwipeLeft(id)
    } else if (deltaX < -threshold && onSwipeRight) {
      onSwipeRight(id)
    }
  }

  return {
    onTouchStart,
    onTouchEnd,
  }
}
