'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { PunishmentItem, PunishmentHistoryEntry, PlayerPunishmentStats } from './types'
import { getAllPresets } from './presets'
import { showPunishmentOverlay } from '@/lib/celebration'
import { PunishmentWheelModal } from './PunishmentWheelModal'

const SUPER_PUNISHMENT_FAIL_THRESHOLD = 3

/** Q3：只看非酒精選項篩選 */
export type PunishmentFilterMode = 'all' | 'nonAlcohol'

export interface PunishmentState {
  /** 預設 + 自訂懲罰項目（轉盤用） */
  items: PunishmentItem[]
  /** 當晚懲罰歷史 */
  history: PunishmentHistoryEntry[]
  /** 每位玩家被懲罰次數（排行榜用） */
  leaderboard: PlayerPunishmentStats[]
  /** 每位玩家豁免券數量 */
  exemptionTickets: Record<number, number>
  /** 每位玩家累積失敗次數（觸發超級懲罰） */
  failCounts: Record<number, number>
  /** Q3：全部｜只看非酒精 */
  filterMode: PunishmentFilterMode
  /** P1-140：懲罰疊加模式 */
  stackMode: boolean
}

export interface PunishmentActions {
  /** 記錄一次懲罰；若 useExemption 為 true 且該玩家有豁免券則跳過並扣券，回傳 false 表示未實際懲罰 */
  recordPunishment: (playerIndex: number, playerName: string, punishment: PunishmentItem, isGroup?: boolean, useExemption?: boolean) => boolean
  /** 增加失敗次數，達門檻可觸發超級懲罰 */
  addFailCount: (playerIndex: number) => void
  /** 使用豁免券跳過本次懲罰 */
  useExemption: (playerIndex: number) => boolean
  /** 增加豁免券（成就或付費） */
  addExemptionTicket: (playerIndex: number, count?: number) => void
  /** 新增自訂懲罰 */
  addCustomPunishment: (text: string, level: PunishmentItem['level']) => void
  /** 取得當晚排行榜（被懲罰最多次） */
  getLeaderboard: () => PlayerPunishmentStats[]
  /** 取得歷史（精彩回顧用） */
  getHistory: () => PunishmentHistoryEntry[]
  /** 是否應觸發超級懲罰（累積失敗 >= 門檻） */
  shouldTriggerSuper: (playerIndex: number) => boolean
  /** 重置失敗次數（超級懲罰執行後） */
  resetFailCount: (playerIndex: number) => void
  /** 清空當晚紀錄（新一局） */
  resetSession: () => void
  /** Q3：切換全部／只看非酒精 */
  setFilterMode: (mode: PunishmentFilterMode) => void
  /** P1-140：懲罰疊加模式 — 為 true 時 resetSession 不清空歷史，懲罰累積 */
  setStackMode: (v: boolean) => void
  /** P0-005：從遊戲失敗流程開啟懲罰輪盤 Modal */
  requestWheel: (playerIndex: number, playerName: string) => void
  clearWheel: () => void
}

const PunishmentContext = createContext<(PunishmentState & PunishmentActions) | null>(null)

export function PunishmentProvider({ players, children }: { players: string[]; children: ReactNode }) {
  const [items, setItems] = useState<PunishmentItem[]>(() => getAllPresets())
  const [filterMode, setFilterMode] = useState<PunishmentFilterMode>('all')
  const [stackMode, setStackMode] = useState(false)
  const [history, setHistory] = useState<PunishmentHistoryEntry[]>([])
  const [exemptionTickets, setExemptionTickets] = useState<Record<number, number>>({})
  const [failCounts, setFailCounts] = useState<Record<number, number>>({})
  /** P0-005：遊戲失敗時可請求顯示懲罰輪盤 Modal */
  const [wheelRequest, setWheelRequest] = useState<{ playerIndex: number; playerName: string } | null>(null)

  const leaderboard = useMemo(() => {
    const countByPlayer: Record<number, number> = {}
    history.forEach((h) => {
      if (h.skipped || h.isGroup) return
      countByPlayer[h.playerIndex] = (countByPlayer[h.playerIndex] ?? 0) + 1
    })
    return players.map((name, i) => ({
      playerIndex: i,
      playerName: name,
      count: countByPlayer[i] ?? 0,
    })).sort((a, b) => b.count - a.count)
  }, [history, players])

  const recordPunishment = useCallback(
    (playerIndex: number, playerName: string, punishment: PunishmentItem, isGroup?: boolean, useExemption?: boolean): boolean => {
      const tickets = exemptionTickets[playerIndex] ?? 0
      if (!isGroup && useExemption && tickets > 0) {
        setExemptionTickets((prev) => ({ ...prev, [playerIndex]: prev[playerIndex] - 1 }))
        setHistory((prev) => [
          ...prev,
          {
            id: `skipped-${Date.now()}-${playerIndex}`,
            timestamp: Date.now(),
            playerName,
            playerIndex,
            punishment,
            skipped: true,
          },
        ])
        return false
      }
      setHistory((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}-${playerIndex}`,
          timestamp: Date.now(),
          playerName,
          playerIndex,
          punishment,
          isGroup,
        },
      ])
      /** P1-131：觸發懲罰時顯示惋惜疊加（螢幕變灰） */
      showPunishmentOverlay(800)
      return true
    },
    [exemptionTickets]
  )

  const addFailCount = useCallback((playerIndex: number) => {
    setFailCounts((prev) => ({ ...prev, [playerIndex]: (prev[playerIndex] ?? 0) + 1 }))
  }, [])

  const useExemption = useCallback((playerIndex: number): boolean => {
    const tickets = exemptionTickets[playerIndex] ?? 0
    if (tickets <= 0) return false
    setExemptionTickets((prev) => ({ ...prev, [playerIndex]: prev[playerIndex] - 1 }))
    return true
  }, [exemptionTickets])

  const addExemptionTicket = useCallback((playerIndex: number, count = 1) => {
    setExemptionTickets((prev) => ({ ...prev, [playerIndex]: (prev[playerIndex] ?? 0) + count }))
  }, [])

  const addCustomPunishment = useCallback((text: string, level: PunishmentItem['level']) => {
    const item: PunishmentItem = {
      id: `custom-${Date.now()}`,
      level,
      text: text.trim(),
      custom: true,
    }
    setItems((prev) => [...prev, item])
  }, [])

  const getLeaderboard = useCallback(() => leaderboard, [leaderboard])
  const getHistory = useCallback(() => [...history].reverse(), [history])

  const shouldTriggerSuper = useCallback((playerIndex: number) => {
    return (failCounts[playerIndex] ?? 0) >= SUPER_PUNISHMENT_FAIL_THRESHOLD
  }, [failCounts])

  const resetFailCount = useCallback((playerIndex: number) => {
    setFailCounts((prev) => ({ ...prev, [playerIndex]: 0 }))
  }, [])

  /** P1-140：疊加模式下不清空歷史，懲罰累積到下一輪 */
  const resetSession = useCallback(() => {
    if (!stackMode) setHistory([])
    setFailCounts({})
  }, [stackMode])

  const setFilterModeCb = useCallback((mode: PunishmentFilterMode) => {
    setFilterMode(mode)
  }, [])

  const setStackModeCb = useCallback((v: boolean) => {
    setStackMode(v)
  }, [])

  const requestWheel = useCallback((playerIndex: number, playerName: string) => {
    setWheelRequest({ playerIndex, playerName })
  }, [])
  const clearWheel = useCallback(() => setWheelRequest(null), [])

  const value = useMemo(
    () => ({
      items,
      history,
      leaderboard,
      exemptionTickets,
      failCounts,
      filterMode,
      stackMode,
      setStackMode: setStackModeCb,
      recordPunishment,
      addFailCount,
      useExemption,
      addExemptionTicket,
      addCustomPunishment,
      getLeaderboard,
      getHistory,
      shouldTriggerSuper,
      resetFailCount,
      resetSession,
      setFilterMode: setFilterModeCb,
      requestWheel,
      clearWheel,
    }),
    [
      items,
      history,
      leaderboard,
      exemptionTickets,
      failCounts,
      filterMode,
      stackMode,
      setStackModeCb,
      recordPunishment,
      addFailCount,
      useExemption,
      addExemptionTicket,
      addCustomPunishment,
      getLeaderboard,
      getHistory,
      shouldTriggerSuper,
      resetFailCount,
      resetSession,
      setFilterModeCb,
      requestWheel,
      clearWheel,
    ]
  )

  return (
    <PunishmentContext.Provider value={value}>
      {children}
      {wheelRequest && (
        <PunishmentWheelModal
          playerIndex={wheelRequest.playerIndex}
          playerName={wheelRequest.playerName}
          onClose={clearWheel}
        />
      )}
    </PunishmentContext.Provider>
  )
}

export function usePunishment() {
  return useContext(PunishmentContext)
}
