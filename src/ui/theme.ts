export type Theme = 'dark' | 'light'

const THEME_KEY = 'tools-theme'
const DEFAULT_THEME: Theme = 'dark'

export function getTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  return saved === 'light' || saved === 'dark'
    ? saved
    : DEFAULT_THEME
}

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
