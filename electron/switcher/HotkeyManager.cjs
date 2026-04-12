const { uIOhook } = require('uiohook-napi')

class HotkeyManager {
  constructor(onPrev, onNext) {
    this.onPrev = onPrev
    this.onNext = onNext
    this.prevKeycode = null
    this.nextKeycode = null
    this.debounce = 1
    this.lastTrigger = 0
    this.started = false
    this.captureCallback = null
  }

  configure({ prevKeycode, nextKeycode, debounce }) {
    this.prevKeycode = prevKeycode ?? null
    this.nextKeycode = nextKeycode ?? null
    this.debounce = debounce ?? 1
  }

  captureNextKey(callback) {
    this.captureCallback = callback
  }

  start() {
    if (this.started) return

    uIOhook.on('keyup', (e) => {
      if (this.captureCallback) {
        this.captureCallback(e.keycode)
        this.captureCallback = null
        return
      }

      const now = Date.now()
      const delta = now - this.lastTrigger
      if (delta < this.debounce) return
      this.lastTrigger = now

      if (this.prevKeycode && e.keycode === this.prevKeycode) {
        this.onPrev()
      } else if (this.nextKeycode && e.keycode === this.nextKeycode) {
        this.onNext()
      }
    })

    uIOhook.start()
    this.started = true
  }

  stop() {
    if (!this.started) return
    uIOhook.stop()
    this.started = false
  }
}

module.exports = { HotkeyManager }