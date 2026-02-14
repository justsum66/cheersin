'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { HandMetal, RefreshCw, Clock, Users } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const DIRECTIONS = ['👆', '👇', '👈', '👉'] as const
type Direction = typeof DIRECTIONS[number]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const ROUND_TIME = 5

export default function FingerPoint() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [gamePhase, setGamePhase] = useState<'ready' | 'countdown' | 'show' | 'result' | 'chain'>('ready')
  const [targetDirection, setTargetDirection] = useState<Direction | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [loserIndex, setLoserIndex] = useState<number | null>(null)
  /** R2-169：連鎖反應 — 被指的人可反指，實際喝酒者為被反指的人 */
  const [chainTargetIndex, setChainTargetIndex] = useState<number | null>(null)
  const [roundCount, setRoundCount] = useState(0)
  const [losses, setLosses] = useState<Record<number, number>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback(() => {
    setGamePhase('countdown')
    setCountdown(3)
    setTargetDirection(null)
    setLoserIndex(null)
    play('click')

    const countdownInterval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownInterval)
          // 隨機選一個方向
          const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
          setTargetDirection(dir)
          setGamePhase('show')
          setTimeLeft(ROUND_TIME)
          play('correct')

          timerRef.current = setInterval(() => {
            setTimeLeft(t => {
              if (t <= 1) {
                if (timerRef.current) clearInterval(timerRef.current)
                return 0
              }
              return t - 1
            })
          }, 1000)

          return 0
        }
        play('click')
        return c - 1
      })
    }, 1000)
  }, [play])

  /** R2-169：先記錄被指的人，進入 chain 階段可反指；不反指則被指的人喝 */
  const selectLoser = useCallback((playerIndex: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    play('wrong')
    setLoserIndex(playerIndex)
    setChainTargetIndex(null)
    setRoundCount(r => r + 1)
    setGamePhase('chain')
  }, [play])

  const passToPlayer = useCallback((targetIndex: number) => {
    play('click')
    setChainTargetIndex(targetIndex)
    setLosses(prev => ({
      ...prev,
      [targetIndex]: (prev[targetIndex] || 0) + 1
    }))
    setGamePhase('result')
  }, [play])

  const skipChain = useCallback(() => {
    if (loserIndex === null) return
    setLosses(prev => ({
      ...prev,
      [loserIndex]: (prev[loserIndex] || 0) + 1
    }))
    setChainTargetIndex(null)
    setGamePhase('result')
  }, [loserIndex])

  const nextRound = useCallback(() => {
    setTargetDirection(null)
    setLoserIndex(null)
    setTimeLeft(ROUND_TIME)
    startCountdown()
  }, [startCountdown])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGamePhase('ready')
    setTargetDirection(null)
    setCountdown(3)
    setTimeLeft(ROUND_TIME)
    setLoserIndex(null)
    setRoundCount(0)
    setLosses({})
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const loserBoard = Object.entries(losses)
    .map(([i, count]) => ({ name: players[Number(i)], count }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="手指快指">
      <GameRules
        rules="看到方向後，大家同時用手指指向那個方向！\n最慢或指錯的人喝酒！點選輸家按鈕記錄！"
        rulesKey="finger-point.rules"
      />

      <HandMetal className="w-12 h-12 text-cyan-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white/60">{players.length} 位玩家</span>
          </div>
          <p className="text-white/50 text-sm mb-6">看到方向就快速指！最慢的喝酒！</p>
          <button
            type="button"
            onClick={startCountdown}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            開始遊戲！
          </button>
        </div>
      )}

      {gamePhase === 'countdown' && (
        <div className="text-center">
          <m.p
            key={countdown}
            initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-bold text-cyan-400"
          >
            {countdown}
          </m.p>
          <p className="text-white/60 mt-4">準備好...</p>
        </div>
      )}

      {gamePhase === 'show' && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className={`w-5 h-5 ${timeLeft <= 2 ? 'text-red-400' : 'text-amber-400'}`} />
            <span className={`font-bold text-xl tabular-nums ${timeLeft <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
              {timeLeft}
            </span>
          </div>

          <m.div
            initial={reducedMotion ? false : { scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-[120px] mb-6"
          >
            {targetDirection}
          </m.div>

          <p className="text-white/60 mb-4">誰最慢或指錯？點選輸家：</p>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectLoser(i)}
                className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 games-focus-ring hover:bg-red-500/30 min-h-[48px]"
              >
                {player}
              </button>
            ))}
          </div>
        </div>
      )}

      {gamePhase === 'chain' && loserIndex !== null && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/70 mb-2">被指到：<span className="font-bold text-amber-300">{players[loserIndex]}</span></p>
          <p className="text-white/50 text-sm mb-4">R2-169 連鎖：可反指一人，被反指的人喝；不反指則自己喝</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {players.map((name, i) => (
              i !== loserIndex && (
                <button
                  key={i}
                  type="button"
                  onClick={() => passToPlayer(i)}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 games-focus-ring hover:bg-amber-500/30"
                >
                  反指 → {name}
                </button>
              )
            ))}
          </div>
          <button type="button" onClick={skipChain} className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white/80 text-sm games-focus-ring">
            不反指，我喝
          </button>
        </m.div>
      )}

      {gamePhase === 'result' && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/60 mb-2">方向是：</p>
          <p className="text-6xl mb-4">{targetDirection}</p>

          {loserIndex !== null && (
            <p className="text-red-400 font-bold text-xl mb-4">
              {chainTargetIndex !== null ? `${players[chainTargetIndex]} 被反指，喝一杯！` : `${players[loserIndex]} 喝一杯！`}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextRound} className="btn-primary px-6 py-2 games-focus-ring">
              下一輪
            </button>
            <CopyResultButton
              text={`手指快指 第 ${roundCount} 輪：\n方向：${targetDirection}\n輸家：${chainTargetIndex !== null ? players[chainTargetIndex] : loserIndex !== null ? players[loserIndex] : '無'}`}
              label="複製"
            />
          </div>
        </m.div>
      )}

      {loserBoard.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          <p className="text-white/50 mb-1">喝酒榜：</p>
          {loserBoard.slice(0, 3).map((p, i) => (
            <div key={i}>{p.name}: {p.count}杯</div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={resetGame}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  )
}
