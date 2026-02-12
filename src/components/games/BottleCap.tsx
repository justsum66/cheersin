'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, RefreshCw, Target, Trophy } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const TARGETS = [
  { id: 1, points: 3, size: 40, color: 'bg-red-500', name: '紅心' },
  { id: 2, points: 2, size: 60, color: 'bg-yellow-500', name: '黃區' },
  { id: 3, points: 1, size: 80, color: 'bg-green-500', name: '綠區' },
  { id: 4, points: 0, size: 100, color: 'bg-blue-500', name: '藍區' },
]

export default function BottleCap() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const defaultPlayers = [1, 2, 3].map((n) => t('games.playerN', { n }))
  const players = contextPlayers.length >= 2 ? contextPlayers : defaultPlayers

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<'ready' | 'aiming' | 'result'>('ready')
  const [shotResult, setShotResult] = useState<typeof TARGETS[0] | null>(null)
  const [score, setScore] = useState<Record<number, number>>({})
  const [roundCount, setRoundCount] = useState(0)
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 })

  const startAiming = useCallback(() => {
    // 隨機目標位置
    setTargetPosition({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    })
    setGamePhase('aiming')
    setShotResult(null)
    play('click')
  }, [play])

  const shoot = useCallback(() => {
    // 隨機射擊結果（模擬彈射）
    const random = Math.random()
    let result: typeof TARGETS[0]
    
    if (random < 0.1) {
      result = TARGETS[0] // 10% 紅心
    } else if (random < 0.3) {
      result = TARGETS[1] // 20% 黃區
    } else if (random < 0.6) {
      result = TARGETS[2] // 30% 綠區
    } else if (random < 0.9) {
      result = TARGETS[3] // 30% 藍區
    } else {
      // 10% 脫靶
      result = { id: 0, points: -1, size: 0, color: '', name: '脫靶' }
    }

    setShotResult(result)
    setGamePhase('result')
    setRoundCount(r => r + 1)

    if (result.points > 0) {
      play('correct')
      setScore(prev => ({
        ...prev,
        [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + result.points
      }))
    } else if (result.points < 0) {
      play('wrong')
    } else {
      play('click')
    }
  }, [currentPlayerIndex, play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setGamePhase('ready')
    setShotResult(null)
  }, [players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0)
    setGamePhase('ready')
    setShotResult(null)
    setScore({})
    setRoundCount(0)
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const leaderboard = Object.entries(score)
    .map(([i, s]) => ({ name: players[Number(i)], score: s }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="瓶蓋彈射">
      <GameRules
        rules={t('games.bottleCapRules')}
        rulesKey="bottle-cap.rules"
      />

      <Target className="w-12 h-12 text-amber-400 mb-4" />
      <p className="text-white/50 text-sm mb-2">{t('common.roundLabel', { n: roundCount + 1 })}</p>

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">{t('games.bottleCapTurn')}</p>
          <p className="text-2xl font-bold text-amber-400 mb-6">{currentPlayer}</p>
          <button
            type="button"
            onClick={startAiming}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-amber-500 to-orange-500"
          >
            {t('games.bottleCapReady')}
          </button>
        </div>
      )}

      {gamePhase === 'aiming' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-4">{currentPlayer} {t('games.bottleCapAiming')}</p>

          {/* 靶子 */}
          <div 
            className="relative w-64 h-64 mx-auto mb-6"
            style={{ 
              left: `${targetPosition.x - 50}%`,
              top: `${targetPosition.y - 50}%`,
            }}
          >
            {TARGETS.slice().reverse().map((target) => (
              <motion.div
                key={target.id}
                className={`absolute rounded-full ${target.color} opacity-80`}
                style={{
                  width: `${target.size}%`,
                  height: `${target.size}%`,
                  left: `${(100 - target.size) / 2}%`,
                  top: `${(100 - target.size) / 2}%`,
                }}
                animate={!reducedMotion ? { scale: [1, 1.02, 1] } : undefined}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <Circle className="w-4 h-4 text-white" fill="white" />
            </div>
          </div>

          <motion.button
            type="button"
            onClick={shoot}
            whileTap={{ scale: 0.9 }}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xl games-focus-ring shadow-lg"
          >
            {t('games.bottleCapShoot')} 🚀
          </motion.button>
        </div>
      )}

      {gamePhase === 'result' && shotResult && (
        <AnimatePresence>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-md"
          >
            {shotResult.points >= 0 ? (
              <>
                <motion.div
                  initial={reducedMotion ? false : { y: -50 }}
                  animate={{ y: 0 }}
                  className={`w-24 h-24 rounded-full ${shotResult.color || 'bg-gray-500'} mx-auto mb-4 flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-bold text-2xl">{shotResult.points}</span>
                </motion.div>
                <p className="text-2xl font-bold text-white mb-2">{shotResult.name}！</p>
                {shotResult.points > 0 && (
                  <p className="text-green-400 font-bold mb-4">得 {shotResult.points} 分！</p>
                )}
                {shotResult.points === 0 && (
                  <p className="text-amber-400 font-bold mb-4">{t('games.bottleCapSafe')}</p>
                )}
              </>
            ) : (
              <>
                <motion.p
                  initial={reducedMotion ? false : { rotate: -10 }}
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3, repeat: 2 }}
                  className="text-6xl mb-4"
                >
                  💨
                </motion.p>
                <p className="text-2xl font-bold text-red-400 mb-2">{t('games.bottleCapMiss')}</p>
                <p className="text-red-400 font-bold mb-4">{currentPlayer} {t('games.bottleCapDrink')}</p>
              </>
            )}

            <div className="flex gap-3 justify-center">
              <button type="button" onClick={nextPlayer} className="btn-primary px-6 py-2 games-focus-ring">
                {t('games.bottleCapNext')}
              </button>
              <CopyResultButton
                text={`${t('games.bottleCapTitle')}：\n${currentPlayer} ${shotResult.name}！${shotResult.points > 0 ? ` ${shotResult.points}` : shotResult.points < 0 ? t('games.bottleCapDrink') : ''}`}
                label={t('common.copy')}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {leaderboard.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="w-3 h-3" />
            <span className="text-white/50">排行榜</span>
          </div>
          {leaderboard.slice(0, 3).map((p, i) => (
            <div key={i}>{p.name}: {p.score}分</div>
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
