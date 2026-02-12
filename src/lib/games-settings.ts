/**
 * 遊戲頁設定：字級、減少動畫、觸覺反饋。存 localStorage，供 Lobby/GameWrapper 讀取。
 * 音效開關由 useGameSound 管理。GAME-010：觸覺可開關。
 */
const KEY_FONT_SIZE = 'cheersin-games-font-size'
const KEY_REDUCE_MOTION = 'cheersin-games-reduce-motion'
const KEY_HAPTIC_ENABLED = 'cheersin-games-haptic-enabled'

export type FontSize = 'sm' | 'md' | 'lg'

export function getFontSize(): FontSize {
  if (typeof window === 'undefined') return 'md'
  const v = localStorage.getItem(KEY_FONT_SIZE)
  if (v === 'sm' || v === 'md' || v === 'lg') return v
  return 'md'
}

export function setFontSize(value: FontSize): void {
  try {
    localStorage.setItem(KEY_FONT_SIZE, value)
    document.documentElement.dataset.gamesFontSize = value
  } catch {
    /* ignore */
  }
}

export function getReduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_REDUCE_MOTION) === '1'
}

export function setReduceMotion(value: boolean): void {
  try {
    localStorage.setItem(KEY_REDUCE_MOTION, value ? '1' : '0')
    document.documentElement.dataset.gamesReduceMotion = value ? '1' : '0'
    /** AUDIT #26：切換時派發事件，遊戲內即時反映簡化動畫 */
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cheersin-games-reduce-motion-change'))
    }
  } catch {
    /* ignore */
  }
}

/** GAME-010：觸覺反饋可開關，存 localStorage */
export function getHapticEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(KEY_HAPTIC_ENABLED) !== '0'
}

export function setHapticEnabled(value: boolean): void {
  try {
    localStorage.setItem(KEY_HAPTIC_ENABLED, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

/** 傳手機模式：開關與選項，存 localStorage */
const KEY_PASS_PHONE = 'cheersin-pass-phone'
const KEY_PASS_PHONE_ANTI_PEEK = 'cheersin-pass-phone-anti-peek'
const KEY_PASS_PHONE_RANDOM = 'cheersin-pass-phone-random'
const KEY_PASS_PHONE_TTS = 'cheersin-pass-phone-tts'

export function getPassPhoneEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_PASS_PHONE) === '1'
}

export function setPassPhoneEnabled(value: boolean): void {
  try {
    localStorage.setItem(KEY_PASS_PHONE, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function getPassPhoneAntiPeek(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(KEY_PASS_PHONE_ANTI_PEEK) !== '0'
}

export function setPassPhoneAntiPeek(value: boolean): void {
  try {
    localStorage.setItem(KEY_PASS_PHONE_ANTI_PEEK, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function getPassPhoneRandomOrder(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_PASS_PHONE_RANDOM) === '1'
}

export function setPassPhoneRandomOrder(value: boolean): void {
  try {
    localStorage.setItem(KEY_PASS_PHONE_RANDOM, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function getPassPhoneTts(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(KEY_PASS_PHONE_TTS) !== '0'
}

export function setPassPhoneTts(value: boolean): void {
  try {
    localStorage.setItem(KEY_PASS_PHONE_TTS, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}
