/**
 * 懲罰機制模組：類型定義
 * 等級：輕度（喝一口）、中度（乾杯）、重度（連喝三杯 + 表演）
 */

export type PunishmentLevel = 'light' | 'medium' | 'heavy' | 'super' | 'group'

export interface PunishmentItem {
  id: string
  level: PunishmentLevel
  text: string
  /** 自訂項目由玩家輸入 */
  custom?: boolean
}

export interface PunishmentHistoryEntry {
  id: string
  timestamp: number
  playerName: string
  playerIndex: number
  punishment: PunishmentItem
  /** 是否為團體懲罰（全場喝） */
  isGroup?: boolean
  /** 是否使用豁免券跳過 */
  skipped?: boolean
}

export interface PlayerPunishmentStats {
  playerIndex: number
  playerName: string
  count: number
}

export const PUNISHMENT_LEVEL_LABEL: Record<PunishmentLevel, string> = {
  light: '輕度',
  medium: '中度',
  heavy: '重度',
  super: '超級',
  group: '團體',
}
