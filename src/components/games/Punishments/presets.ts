/**
 * 懲罰預設項目：輕度／中度／重度／超級／團體
 */

import type { PunishmentItem } from './types'

export const LIGHT_PUNISHMENTS: PunishmentItem[] = [
  { id: 'l1', level: 'light', text: '喝一口' },
  { id: 'l2', level: 'light', text: '舔一口' },
  { id: 'l3', level: 'light', text: '抿一口' },
  { id: 'l4', level: 'light', text: '小啜一口' },
  { id: 'l5', level: 'light', text: '喝半口' },
]

export const MEDIUM_PUNISHMENTS: PunishmentItem[] = [
  { id: 'm1', level: 'medium', text: '乾杯' },
  { id: 'm2', level: 'medium', text: '喝一杯' },
  { id: 'm3', level: 'medium', text: '一口乾' },
  { id: 'm4', level: 'medium', text: '半杯乾' },
  { id: 'm5', level: 'medium', text: '敬大家一杯' },
]

export const HEAVY_PUNISHMENTS: PunishmentItem[] = [
  { id: 'h1', level: 'heavy', text: '連喝三杯' },
  { id: 'h2', level: 'heavy', text: '連喝三杯 + 表演才藝' },
  { id: 'h3', level: 'heavy', text: '連喝三杯 + 說一個糗事' },
  { id: 'h4', level: 'heavy', text: '連喝三杯 + 學動物叫' },
  { id: 'h5', level: 'heavy', text: '連喝三杯 + 唱一句歌' },
]

export const SUPER_PUNISHMENTS: PunishmentItem[] = [
  { id: 's1', level: 'super', text: '超級懲罰：連喝五杯 + 真心話一題' },
  { id: 's2', level: 'super', text: '超級懲罰：公杯乾杯 + 表演' },
  { id: 's3', level: 'super', text: '超級懲罰：全場指定你喝多少就喝多少' },
]

export const GROUP_PUNISHMENTS: PunishmentItem[] = [
  { id: 'g1', level: 'group', text: '全場一起乾杯' },
  { id: 'g2', level: 'group', text: '全場喝一口' },
  { id: 'g3', level: 'group', text: '全場敬輸家一杯' },
]

/** T054 P1：預設含非酒精選項，不喝酒桌遊玩家與責任飲酒可選 */
export const NON_ALCOHOL_PUNISHMENTS: PunishmentItem[] = [
  { id: 'na1', level: 'light', text: '喝一口飲料' },
  { id: 'na2', level: 'light', text: '做 5 下伏地挺身' },
  { id: 'na3', level: 'light', text: '唱一句歌' },
  { id: 'na4', level: 'medium', text: '做 10 下伏地挺身' },
  { id: 'na5', level: 'medium', text: '學動物叫' },
  { id: 'na6', level: 'medium', text: '說一個糗事' },
  { id: 'na7', level: 'heavy', text: '做 15 下伏地挺身 + 唱一句歌' },
  { id: 'na8', level: 'heavy', text: '表演才藝 30 秒' },
  { id: 'na9', level: 'group', text: '全場一起做 5 下伏地挺身' },
]

export function getAllPresets(): PunishmentItem[] {
  return [
    ...LIGHT_PUNISHMENTS,
    ...MEDIUM_PUNISHMENTS,
    ...HEAVY_PUNISHMENTS,
    ...SUPER_PUNISHMENTS,
    ...GROUP_PUNISHMENTS,
    ...NON_ALCOHOL_PUNISHMENTS,
  ]
}
