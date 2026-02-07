'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music2, RefreshCw, Users, AlertTriangle } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

export default function MusicChair() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'stopped' | 'result'>('ready')
  const [remainingPlayers, setRemainingPlayers] = useState<string[]>([])
  const [eliminatedPlayer, setEliminatedPlayer] = useState<string | null>(null)
  const [roundCount, setRoundCount] = useState(0)
  const [drinkCount, setDrinkCount] = useState<Record<string, number>>({})
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startGame = useCallback(() => {
    setRemainingPlayers([...players])
    setRoundCount(0)
    setDrinkCount({})
    startRound([...players])
  }, [players])

  const startRound = useCallback((activePlayers: string[]) => {
    if (activePlayers.length <= 1) {
      setGamePhase('result')
      return
    }

    setGamePhase('playing')
    setEliminatedPlayer(null)
    play('click')

    // 隨機時間 5-15 秒後停止
    const duration = 5 + Math.floor(Math.random() * 10)
    setCountdown(duration)

    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setGamePhase('stopped')
          play('wrong')
          return 0
        }
        // 最後 3 秒加速提示音
        if (c <= 4) play('click')
        return c - 1
      })
    }, 1000)
  }, [play])

  const selectEliminated = useCallback((playerName: string) => {
    setEliminatedPlayer(playerName)
    setDrinkCount(prev => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + 1
    }))
    const newRemaining = remainingPlayers.filter(p => p !== playerName)
    setRemainingPlayers(newRemaining)
    setRoundCount(r => r + 1)
    play('wrong')

    if (newRemaining.length <= 1) {
      setGamePhase('result')
    } else {
      // 等待一下再開始下一輪
      setTimeout(() => {
        startRound(newRemaining)
      }, 2000)
    }
  }, [remainingPlayers, play, startRound])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGamePhase('ready')
    setRemainingPlayers([])
    setEliminatedPlayer(null)
    setRoundCount(0)
    setDrinkCount({})
    setCountdown(0)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const winner = remainingPlayers.length === 1 ? remainingPlayers[0] : null
  const drinkBoard = Object.entries(drinkCount)
    .map(([name, count]) => ({ name, count }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="搶位遊戲">
      <GameRules
        rules="音樂停止時搶位子！\n沒搶到位子的人喝酒並淘汰！\n最後存活者獲勝！"
        rulesKey="music-chair.rules"
      />

      <Music2 className="w-12 h-12 text-green-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white/60">{players.length} 位玩家</span>
          </div>
          <p className="text-white/50 text-sm mb-6">音樂停止時搶位子！沒搶到就淘汰！</p>
          <button
            type="button"
            onClick={startGame}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-green-500 to-emerald-500"
          >
            開始遊戲！
          </button>
        </div>
      )}

      {gamePhase === 'playing' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">第 {roundCount + 1} 輪</p>
          <p className="text-white/50 text-sm mb-4">
            剩餘 {remainingPlayers.length} 人 / 位子 {remainingPlayers.length - 1} 個
          </p>

          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-8xl mb-4"
          >
            🎵
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block px-6 py-3 rounded-full bg-green-500/20 border border-green-500/50"
          >
            <span className="text-green-400 font-bold">音樂播放中...</span>
          </motion.div>

          {countdown <= 5 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-amber-400 mt-4 text-sm"
            >
              ⚠️ 隨時會停止！
            </motion.p>
          )}
        </div>
      )}

      {gamePhase === 'stopped' && (
        <div className="text-center w-full max-w-md">
          <motion.div
            initial={reducedMotion ? false : { scale: 0.5 }}
            animate={{ scale: 1 }}
            className="mb-4"
          >
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
          </motion.div>
          <p className="text-red-400 font-bold text-2xl mb-4">音樂停止！</p>
          <p className="text-white/60 mb-4">誰沒搶到位子？</p>

          <div className="flex flex-wrap gap-2 justify-center">
            {remainingPlayers.map((player) => (
              <button
                key={player}
                type="button"
                onClick={() => selectEliminated(player)}
                className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 games-focus-ring hover:bg-red-500/30 min-h-[48px]"
              >
                {player}
              </button>
            ))}
          </div>
        </div>
      )}

      {eliminatedPlayer && gamePhase !== 'result' && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-red-400 font-bold">{eliminatedPlayer} 淘汰！喝一杯！</p>
          <p className="text-white/50 text-sm mt-2">準備下一輪...</p>
        </motion.div>
      )}

      {gamePhase === 'result' && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-6xl mb-4">🏆</p>
          <p className="text-white/60 mb-2">冠軍是：</p>
          <p className="text-3xl font-bold text-green-400 mb-4">{winner}</p>
          <p className="text-white/50 text-sm mb-4">共進行 {roundCount} 輪</p>

          {drinkBoard.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <p className="text-white/50 text-sm mb-2">喝酒榜：</p>
              {drinkBoard.map((p, i) => (
                <div key={i} className="flex justify-between text-white/70">
                  <span>{p.name}</span>
                  <span>{p.count} 杯</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={startGame} className="btn-primary px-6 py-2 games-focus-ring">
              再玩一次
            </button>
            <CopyResultButton
              text={`搶位遊戲結果：\n冠軍：${winner}\n共 ${roundCount} 輪\n${drinkBoard.map(p => `${p.name}: ${p.count}杯`).join('\n')}`}
              label="複製"
            />
          </div>
        </motion.div>
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
