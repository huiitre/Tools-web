export function formatNumber(
  value: number,
  locale = 'fr-FR'
): string {
  return value.toLocaleString(locale)
}
