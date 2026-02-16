/**
 * 遊戲設定存儲工具
 * 使用 localStorage 持久化用戶偏好設定
 */

const STORAGE_PREFIX = 'cheersin_games_'

// Storage keys
const KEYS = {
  PASS_PHONE_ENABLED: `${STORAGE_PREFIX}pass_phone_enabled`,
  PASS_PHONE_ANTI_PEEK: `${STORAGE_PREFIX}pass_phone_anti_peek`,
  PASS_PHONE_RANDOM_ORDER: `${STORAGE_PREFIX}pass_phone_random_order`,
  PASS_PHONE_TTS: `${STORAGE_PREFIX}pass_phone_tts`,
  SOUND_ENABLED: `${STORAGE_PREFIX}sound_enabled`,
  VIBRATION_ENABLED: `${STORAGE_PREFIX}vibration_enabled`,
  REDUCE_MOTION: `${STORAGE_PREFIX}reduce_motion`,
  THEME: `${STORAGE_PREFIX}theme`,
  FONT_SIZE: `${STORAGE_PREFIX}font_size`,
  NON_ALCOHOL_MODE: `${STORAGE_PREFIX}non_alcohol_mode`,
} as const

/**
 * 安全讀取 localStorage
 */
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * 安全寫入 localStorage
 */
function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage 可能已滿或被禁用
  }
}

/**
 * 讀取布爾值設定
 */
function getBooleanSetting(key: string, defaultValue: boolean = false): boolean {
  const value = safeGetItem(key)
  if (value === null) return defaultValue
  return value === 'true'
}

/**
 * 設定布爾值設定
 */
function setBooleanSetting(key: string, value: boolean): void {
  safeSetItem(key, String(value))
}

// Pass Phone 設定
export function getPassPhoneEnabled(): boolean {
  return getBooleanSetting(KEYS.PASS_PHONE_ENABLED, true)
}

export function setPassPhoneEnabled(enabled: boolean): void {
  setBooleanSetting(KEYS.PASS_PHONE_ENABLED, enabled)
}

export function getPassPhoneAntiPeek(): boolean {
  return getBooleanSetting(KEYS.PASS_PHONE_ANTI_PEEK, false)
}

export function setPassPhoneAntiPeek(enabled: boolean): void {
  setBooleanSetting(KEYS.PASS_PHONE_ANTI_PEEK, enabled)
}

export function getPassPhoneRandomOrder(): boolean {
  return getBooleanSetting(KEYS.PASS_PHONE_RANDOM_ORDER, false)
}

export function setPassPhoneRandomOrder(enabled: boolean): void {
  setBooleanSetting(KEYS.PASS_PHONE_RANDOM_ORDER, enabled)
}

export function getPassPhoneTts(): boolean {
  return getBooleanSetting(KEYS.PASS_PHONE_TTS, false)
}

export function setPassPhoneTts(enabled: boolean): void {
  setBooleanSetting(KEYS.PASS_PHONE_TTS, enabled)
}

// 音效設定
export function getSoundEnabled(): boolean {
  return getBooleanSetting(KEYS.SOUND_ENABLED, true)
}

export function setSoundEnabled(enabled: boolean): void {
  setBooleanSetting(KEYS.SOUND_ENABLED, enabled)
}

// 震動設定
export function getVibrationEnabled(): boolean {
  return getBooleanSetting(KEYS.VIBRATION_ENABLED, true)
}

export function setVibrationEnabled(enabled: boolean): void {
  setBooleanSetting(KEYS.VIBRATION_ENABLED, enabled)
}

// 減少動畫設定
export function getReduceMotion(): boolean {
  return getBooleanSetting(KEYS.REDUCE_MOTION, false)
}

export function setReduceMotion(enabled: boolean): void {
  setBooleanSetting(KEYS.REDUCE_MOTION, enabled)
}

// 主題設定
export type GameTheme = 'light' | 'dark' | 'system'

export function getTheme(): GameTheme {
  const value = safeGetItem(KEYS.THEME)
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }
  return 'system'
}

export function setTheme(theme: GameTheme): void {
  safeSetItem(KEYS.THEME, theme)
}

// 字體大小設定
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge'

export function getFontSize(): FontSize {
  const value = safeGetItem(KEYS.FONT_SIZE)
  if (value === 'small' || value === 'medium' || value === 'large' || value === 'xlarge') {
    return value
  }
  return 'medium'
}

export function setFontSize(size: FontSize): void {
  safeSetItem(KEYS.FONT_SIZE, size)
}

// 非酒精模式設定
export function getNonAlcoholMode(): boolean {
  return getBooleanSetting(KEYS.NON_ALCOHOL_MODE, false)
}

export function setNonAlcoholMode(enabled: boolean): void {
  setBooleanSetting(KEYS.NON_ALCOHOL_MODE, enabled)
}

/**
 * 重置所有設定為預設值
 */
export function resetAllSettings(): void {
  Object.values(KEYS).forEach((key) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key)
      } catch {
        // ignore
      }
    }
  })
}

/**
 * 導出所有設定
 */
export function exportSettings(): Record<string, string | null> {
  return Object.entries(KEYS).reduce(
    (acc, [name, key]) => {
      acc[name] = safeGetItem(key)
      return acc
    },
    {} as Record<string, string | null>
  )
}

/**
 * 導入設定
 */
export function importSettings(settings: Record<string, string | null>): void {
  Object.entries(KEYS).forEach(([name, key]) => {
    const value = settings[name]
    if (value !== null && value !== undefined) {
      safeSetItem(key, value)
    }
  })
}
