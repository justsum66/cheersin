'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { getPassPhoneEnabled, getPassPhoneAntiPeek, getPassPhoneRandomOrder, getPassPhoneTts } from '@/lib/games-settings'

/** GAMES_500 #208：傳遞動畫與減少動畫 — 子元件 PassPhoneMode 可讀 useGameReduceMotion()，當 true 時縮短或關閉傳遞過場動畫。 */

/** 單一玩家的回合統計 */
export interface PlayerRoundStat {
  playerName: string
  playerIndex: number
  turns: number
  results: string[]
}

export interface PassPhoneState {
  /** 是否啟用傳手機模式 */
  enabled: boolean
  /** 當前要傳給的對象（顯示全螢幕時） */
  showPassTo: { nextName: string; nextIndex: number } | null
  /** 防偷看：黑屏 + 點擊開始 */
  antiPeek: boolean
  /** 亂序傳遞（隨機下一位） */
  randomOrder: boolean
  /** TTS 語音播報 */
  ttsEnabled: boolean
  /** 當前玩家索引（遊戲可讀） */
  currentPlayerIndex: number
  /** 翻轉偵測：手機翻面時隱藏答案 */
  flipHidden: boolean
  /** 每位玩家的輪次與結果 */
  roundStats: PlayerRoundStat[]
}

export interface PassPhoneActions {
  setEnabled: (v: boolean) => void
  setAntiPeek: (v: boolean) => void
  setRandomOrder: (v: boolean) => void
  setTtsEnabled: (v: boolean) => void
  /** 遊戲呼叫：請求顯示「請傳給下一位」，並計算下一位（順序或亂序） */
  requestPassTo: (currentIndex: number) => void
  /** 跳過此人：直接指定下一位，不顯示當前答案 */
  skipCurrent: () => void
  /** 使用者點擊「開始」後呼叫，關閉 overlay 並觸發 onPassComplete */
  completePass: () => void
  /** 遊戲註冊：傳手機完成後要執行的回調（例如開始下一位倒數） */
  registerOnPassComplete: (fn: (nextIndex: number) => void) => void
  unregisterOnPassComplete: () => void
  /** 記錄本回合結果（給統計用） */
  recordResult: (playerIndex: number, result?: string) => void
  /** 取得是否應隱藏當前玩家答案（翻轉偵測） */
  getFlipHidden: () => boolean
}

const PassPhoneContext = createContext<(PassPhoneState & PassPhoneActions) | null>(null)

const FLIP_BETA_THRESHOLD = 60

export function PassPhoneProvider({
  players,
  children,
}: {
  players: string[]
  children: ReactNode
}) {
  /** GAMES_500 #191：傳手機設定與 localStorage 同步無閃爍 — 初始值從 localStorage 讀取 */
  const [enabled, setEnabled] = useState(() => (typeof window !== 'undefined' ? getPassPhoneEnabled() : false))
  const [showPassTo, setShowPassTo] = useState<{ nextName: string; nextIndex: number } | null>(null)
  const [antiPeek, setAntiPeek] = useState(() => (typeof window !== 'undefined' ? getPassPhoneAntiPeek() : true))
  const [randomOrder, setRandomOrder] = useState(() => (typeof window !== 'undefined' ? getPassPhoneRandomOrder() : false))
  const [ttsEnabled, setTtsEnabled] = useState(() => (typeof window !== 'undefined' ? getPassPhoneTts() : true))
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [flipHidden, setFlipHidden] = useState(false)
  const [roundStats, setRoundStats] = useState<PlayerRoundStat[]>(() =>
    players.map((name, i) => ({ playerName: name, playerIndex: i, turns: 0, results: [] }))
  )

  const onPassCompleteRef = useRef<(nextIndex: number) => void>(() => {})

  const registerOnPassComplete = useCallback((fn: (nextIndex: number) => void) => {
    onPassCompleteRef.current = fn
  }, [])
  const unregisterOnPassComplete = useCallback(() => {
    onPassCompleteRef.current = () => {}
  }, [])

  /** 依順序或亂序計算下一位索引 */
  const getNextIndex = useCallback(
    (current: number): number => {
      if (players.length <= 1) return 0
      if (randomOrder) {
        let next = Math.floor(Math.random() * players.length)
        while (next === current && players.length > 1) {
          next = Math.floor(Math.random() * players.length)
        }
        return next
      }
      return (current + 1) % players.length
    },
    [players.length, randomOrder]
  )

  const requestPassTo = useCallback(
    (currentIndex: number) => {
      const nextIndex = getNextIndex(currentIndex)
      const nextName = players[nextIndex] ?? '下一位'
      setShowPassTo({ nextName, nextIndex })
      setCurrentPlayerIndex(nextIndex)
    },
    [players, getNextIndex]
  )

  const skipCurrent = useCallback(() => {
    if (showPassTo === null) return
    const nextIndex = getNextIndex(showPassTo.nextIndex)
    const nextName = players[nextIndex] ?? '下一位'
    setShowPassTo({ nextName, nextIndex })
    setCurrentPlayerIndex(nextIndex)
  }, [showPassTo, players, getNextIndex])

  const completePass = useCallback(() => {
    const next = showPassTo?.nextIndex ?? currentPlayerIndex
    setShowPassTo(null)
    onPassCompleteRef.current(next)
  }, [showPassTo, currentPlayerIndex])

  const recordResult = useCallback((playerIndex: number, result?: string) => {
    setRoundStats((prev) => {
      const next = [...prev]
      const idx = next.findIndex((s) => s.playerIndex === playerIndex)
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          turns: next[idx].turns + 1,
          results: result != null ? [...next[idx].results, result] : next[idx].results,
        }
      }
      return next
    })
  }, [])

  const getFlipHidden = useCallback(() => flipHidden, [flipHidden])

  /** 同步 roundStats 與 players 長度 */
  useEffect(() => {
    setRoundStats((prev) => {
      const byIndex = new Map(prev.map((s) => [s.playerIndex, s]))
      return players.map((name, i) => byIndex.get(i) ?? { playerName: name, playerIndex: i, turns: 0, results: [] })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: sync by length + join to avoid ref churn
  }, [players.length, players.join(',')])

  /** 翻轉偵測：DeviceOrientation beta 表示前後傾斜，翻面時 beta 接近 ±90（隱私保護：隱藏當前玩家答案） */
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return
    const handler = (e: DeviceOrientationEvent) => {
      const beta = e.beta
      if (beta == null) return
      setFlipHidden(Math.abs(beta) > FLIP_BETA_THRESHOLD)
    }
    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [enabled])

  const value: PassPhoneState & PassPhoneActions = {
    enabled,
    showPassTo,
    antiPeek,
    randomOrder,
    ttsEnabled,
    currentPlayerIndex,
    flipHidden,
    roundStats,
    setEnabled,
    setAntiPeek,
    setRandomOrder,
    setTtsEnabled,
    requestPassTo,
    skipCurrent,
    completePass,
    registerOnPassComplete,
    unregisterOnPassComplete,
    recordResult,
    getFlipHidden,
  }

  return (
    <PassPhoneContext.Provider value={value}>
      {children}
    </PassPhoneContext.Provider>
  )
}

export function usePassPhone(): (PassPhoneState & PassPhoneActions) | null {
  return useContext(PassPhoneContext)
}
