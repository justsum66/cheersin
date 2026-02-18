'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { m } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameRoom } from '@/hooks/useGameRoom'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const FLOOR_LABELS = ['一樓', '二樓', '三樓', '四樓', '五樓', '六樓', '七樓', '八樓', '九樓', '十樓'] as const
const FLOOR_OPTIONS = [5, 7, 10] as const
const GAME_ID = 'up-down-stairs'
const POLL_MS = 1500

export interface UpDownStairsState {
  floorIndex: number
  currentPlayerIndex: number
  goingUp: boolean
  floorCount?: number
}

/** 依樓層順序喊，錯或慢罰。輪流喊下一樓或上一樓。房間模式時同房狀態同步。 */
export default function UpDownStairs() {
  const searchParams = useSearchParams()
  const roomSlug = searchParams.get('room')
  const { roomId, players: roomPlayers, fetchRoom } = useGameRoom(roomSlug)
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = roomId && roomPlayers.length >= 2
    ? roomPlayers.map((p) => p.displayName)
    : contextPlayers.length >= 2
      ? contextPlayers
      : DEFAULT_PLAYERS

  const [floorCount, setFloorCount] = useState<5 | 7 | 10>(5)
  const [floorIndex, setFloorIndex] = useState(0)
  const [goingUp, setGoingUp] = useState(true)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [syncing, setSyncing] = useState(false)
  /** P2 #30：本局樓層歷史（誰在幾樓喊了上一樓／下一樓），可選顯示 */
  const [floorHistory, setFloorHistory] = useState<{ floor: string; player: string; up: boolean }[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const floors = useMemo(() => FLOOR_LABELS.slice(0, floorCount), [floorCount])
  const currentFloor = floors[floorIndex]
  const currentPlayer = players[currentPlayerIndex]
  const canUp = floorIndex < floors.length - 1
  const canDown = floorIndex > 0
  const isRoomMode = !!roomId && !!roomSlug

  /** 從 API 拉取房間遊戲狀態並套用到本機 */
  const fetchGameState = useCallback(async () => {
    if (!roomSlug || !roomId) return
    try {
      const res = await fetch(
        `/api/games/rooms/${encodeURIComponent(roomSlug)}/game-state?game_id=${encodeURIComponent(GAME_ID)}`
      )
      if (!res.ok) return
      const data = await res.json()
      const state = data.state as UpDownStairsState | null
      if (!state || typeof state.floorIndex !== 'number') return
      const remoteFloorCount = [5, 7, 10].includes(Number(state.floorCount)) ? (state.floorCount as 5 | 7 | 10) : 5
      const maxFloor = remoteFloorCount - 1
      const floorIndex = Math.max(0, Math.min(state.floorIndex, maxFloor))
      const currentPlayerIndex = Math.max(0, Math.min(state.currentPlayerIndex, players.length - 1))
      setFloorCount(remoteFloorCount)
      setFloorIndex(floorIndex)
      setCurrentPlayerIndex(currentPlayerIndex)
      setGoingUp(Boolean(state.goingUp))
    } catch {
      // ignore
    }
  }, [roomSlug, roomId, players.length])

  /** 房間模式：輪詢 game-state */
  useEffect(() => {
    if (!isRoomMode) return
    fetchGameState()
    const t = setInterval(fetchGameState, POLL_MS)
    return () => clearInterval(t)
  }, [isRoomMode, fetchGameState])

  /** 房間模式且首次進入：若遠端無狀態則 POST 初始狀態 */
  useEffect(() => {
    if (!isRoomMode) return
    let cancelled = false
    const init = async () => {
      try {
        const res = await fetch(
          `/api/games/rooms/${encodeURIComponent(roomSlug!)}/game-state?game_id=${encodeURIComponent(GAME_ID)}`
        )
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (data.state != null) return
        await fetch(`/api/games/rooms/${encodeURIComponent(roomSlug!)}/game-state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: GAME_ID,
            payload: { floorIndex: 0, currentPlayerIndex: 0, goingUp: true, floorCount: 5 },
          }),
        })
      } catch {
        // ignore
      }
    }
    init()
    return () => { cancelled = true }
  }, [isRoomMode, roomSlug])

  const say = useCallback(
    async (up: boolean) => {
      if (up && !canUp) return
      if (!up && !canDown) return
      play('click')
      const nextFloor = up ? floorIndex + 1 : floorIndex - 1
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
      const payload: UpDownStairsState = {
        floorIndex: nextFloor,
        currentPlayerIndex: nextPlayerIndex,
        goingUp: up,
        floorCount,
      }
      if (isRoomMode && roomSlug) {
        setSyncing(true)
        try {
          const res = await fetch(`/api/games/rooms/${encodeURIComponent(roomSlug)}/game-state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id: GAME_ID, payload }),
          })
          if (res.ok) {
            setFloorIndex(payload.floorIndex)
            setCurrentPlayerIndex(payload.currentPlayerIndex)
            setGoingUp(payload.goingUp)
            setFloorHistory((prev) => [
              ...prev,
              { floor: floors[floorIndex], player: currentPlayer, up },
            ].slice(-20))
          }
        } finally {
          setSyncing(false)
        }
      } else {
        setFloorIndex(payload.floorIndex)
        setCurrentPlayerIndex(payload.currentPlayerIndex)
        setGoingUp(payload.goingUp)
        setFloorHistory((prev) => [
          ...prev,
          { floor: floors[floorIndex], player: currentPlayer, up },
        ].slice(-20))
      }
    },
    [floorIndex, currentPlayerIndex, canUp, canDown, players.length, isRoomMode, roomSlug, floorCount, floors, currentPlayer, play]
  )

  const onFloorCountChange = (n: 5 | 7 | 10) => {
    setFloorCount(n)
    setFloorIndex(0)
    setGoingUp(true)
    setFloorHistory([])
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="上下樓梯">
      <GameRules rules={`輪流喊「上一樓」或「下一樓」，依序一樓→…→頂樓再往下。\n喊錯順序或慢的人喝。`} />
      <p className="text-white/50 text-sm mb-2">輪流喊上一樓或下一樓，喊錯順序的人喝</p>
      <div className="flex gap-2 mb-2" role="group" aria-label="樓層數">
        {FLOOR_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onFloorCountChange(n)}
            className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring ${floorCount === n ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            {n} 樓
          </button>
        ))}
      </div>
      {isRoomMode && (
        <p className="text-white/40 text-xs mb-1" aria-live="polite">
          房間同步中 · 共 {players.length} 人
        </p>
      )}
      <div className="text-2xl md:text-3xl font-bold text-primary-300 mb-2" aria-live="polite">
        {currentFloor}
      </div>
      <p className="text-white/70 text-lg mb-6">輪到 {currentPlayer}</p>
      <div className="flex gap-4">
        <m.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => say(true)}
          disabled={!canUp || syncing}
          className="min-h-[48px] min-w-[100px] px-6 py-3 rounded-xl bg-primary-500/80 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold games-focus-ring"
        >
          上一樓
        </m.button>
        <m.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => say(false)}
          disabled={!canDown || syncing}
          className="min-h-[48px] min-w-[100px] px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold games-focus-ring"
        >
          下一樓
        </m.button>
      </div>
      {floorHistory.length > 0 && (
        <div className="mt-4 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-[48px] min-w-[48px] px-3 py-2 text-white/50 text-xs hover:text-white/70 rounded-lg games-focus-ring"
          >
            {showHistory ? '隱藏' : '顯示'}本局樓層歷史
          </button>
          {showHistory && (
            <ul className="mt-1 max-h-24 overflow-y-auto text-white/60 text-xs space-y-0.5">
              {floorHistory.slice().reverse().map((h, i) => (
                <li key={i}>{h.floor} → {h.player} {h.up ? '上一樓' : '下一樓'}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
