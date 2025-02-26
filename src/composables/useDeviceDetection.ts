export function isMobileDevice() {
  // Vérifie le user agent pour détecter un mobile
  return /Mobi|Android/i.test(navigator.userAgent);
}

export function isPWA() {
  // Pour la plupart des navigateurs
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  // Pour iOS
  const isIOSStandalone = (window.navigator as any).standalone === true;
  return isStandalone || isIOSStandalone;
}