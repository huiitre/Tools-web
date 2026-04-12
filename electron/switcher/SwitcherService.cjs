const { execSync } = require('child_process')

class SwitcherService {
  constructor(scanner, focuser, nameResolver) {
    this.scanner = scanner
    this.focuser = focuser
    this.nameResolver = nameResolver
    this.windows = []
    this.currentIndex = 0
  }

  async scan() {
    const scanned = await this.scanner.scan()
    const resolved = await Promise.all(
      scanned.map(async (w) => {
        const characterName = await this.nameResolver.resolve(w.pid)
        if (characterName) {
          try {
            execSync(`xdotool set_window --name "${characterName}" ${w.windowId}`)
          } catch {}
        }
        return { ...w, characterName: characterName ?? this._stripDofusPrefix(w.characterName) }
      })
    )
    this._merge(resolved)
    return this.windows
  }

  _stripDofusPrefix(name) {
    if (!name) return null
    return name.replace(/^Dofus\s*-\s*/i, '').trim() || null
  }

  async focusNext() {
    const enabled = this._enabled()
    if (!enabled.length) return
    this.currentIndex = (this.currentIndex + 1) % enabled.length
    await this.focuser.focus(enabled[this.currentIndex].windowId)
  }

  async focusPrev() {
    const enabled = this._enabled()
    if (!enabled.length) return
    this.currentIndex = (this.currentIndex - 1 + enabled.length) % enabled.length
    await this.focuser.focus(enabled[this.currentIndex].windowId)
  }

  async focusWindow(windowId) {
    const enabled = this._enabled()
    const idx = enabled.findIndex(w => w.windowId === windowId)
    if (idx !== -1) this.currentIndex = idx
    await this.focuser.focus(windowId)
  }

  setEnabled(windowId, enabled) {
    this.windows = this.windows.map((w) =>
      w.windowId === windowId ? { ...w, enabled } : w
    )
    return this.windows
  }

  setOrder(windowIds) {
    const map = new Map(this.windows.map((w) => [w.windowId, w]))
    this.windows = windowIds.map((id) => map.get(id)).filter(Boolean)
    return this.windows
  }

  renameWindow(windowId, characterName) {
    this.windows = this.windows.map((w) =>
      w.windowId === windowId ? { ...w, characterName } : w
    )
    return this.windows
  }

  getWindows() {
    return this.windows
  }

  getCurrentWindowId() {
    const enabled = this._enabled()
    if (!enabled.length) return null
    return enabled[this.currentIndex]?.windowId ?? null
  }

  _enabled() {
    return this.windows.filter((w) => w.enabled)
  }

  _merge(scanned) {
    const existing = new Map(this.windows.map((w) => [w.windowId, w]))
    this.windows = scanned.map((w) => {
      const prev = existing.get(w.windowId)
      if (!prev) return w
      return {
        ...w,
        enabled: prev.enabled,
        characterName: w.characterName ?? prev.characterName,
      }
    })
  }
}

module.exports = { SwitcherService }