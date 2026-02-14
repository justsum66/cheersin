/**
 * R2-151：全遊戲非酒精模式 — 依 mode 回傳懲罰文案（喝一口 / 做一下 等）
 * 遊戲內懲罰文字使用此 hook 即可依設定切換。
 */
import { useState, useEffect } from 'react'
import { getNonAlcoholMode } from '@/lib/games-settings'

export interface PunishmentCopy {
  /** 喝一口 / 做一下 */
  drinkOne: string
  /** 喝兩杯 / 做兩次 */
  drinkTwo: string
  /** 答錯～喝一口 / 答錯～做一下 */
  wrongDrinkOne: string
  /** 配錯～喝一口 / 配錯～做一下 */
  wrongMatch: string
  /** 不一致兩人各喝一口 / 不一致兩人各做一下 */
  mismatchPair: string
  /** 是否為非酒精模式 */
  isNonAlcohol: boolean
}

const ALCOHOL: PunishmentCopy = {
  drinkOne: '喝一口',
  drinkTwo: '喝兩杯',
  wrongDrinkOne: '答錯～喝一口',
  wrongMatch: '配錯了～喝一口',
  mismatchPair: '不一致，兩人各喝一口',
  isNonAlcohol: false,
}

const NON_ALCOHOL: PunishmentCopy = {
  drinkOne: '做一下',
  drinkTwo: '做兩次',
  wrongDrinkOne: '答錯～做一下',
  wrongMatch: '配錯了～做一下',
  mismatchPair: '不一致，兩人各做一下',
  isNonAlcohol: true,
}

function getCopy(): PunishmentCopy {
  return getNonAlcoholMode() ? NON_ALCOHOL : ALCOHOL
}

/** 回傳當前懲罰文案，非酒精模式時會隨設定更新 */
export function usePunishmentCopy(): PunishmentCopy {
  const [copy, setCopy] = useState<PunishmentCopy>(getCopy)

  useEffect(() => {
    const onChange = () => setCopy(getCopy())
    window.addEventListener('cheersin-games-non-alcohol-change', onChange)
    return () => window.removeEventListener('cheersin-games-non-alcohol-change', onChange)
  }, [])

  return copy
}
