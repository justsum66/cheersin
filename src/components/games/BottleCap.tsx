'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Circle, RefreshCw, Target, Trophy, Wine, Zap } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import { getTruthPool, getDarePool } from '@/lib/truth-or-dare'

const TARGETS = [
  { id: 1, points: 3, size: 40, color: 'bg-red-500', name: '紅心' },
  { id: 2, points: 2, size: 60, color: 'bg-yellow-500', name: '黃區' },
  { id: 3, points: 1, size: 80, color: 'bg-green-500', name: '綠區' },
  { id: 4, points: 0, size: 100, color: 'bg-blue-500', name: '藍區' },
]

/** R2-159：瓶蓋遊戲模式 — 射擊計分 或 真心話瓶 */
type BottleCapMode = 'shoot' | 'bottle'

/** GAME-086: Challenge mode — timed shots with shrinking timer */
const CHALLENGE_TIME_LIMIT = 5000 // 5 seconds per shot

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
  /** GAME-085: Flip physics state for shot result animation */
  const [flipAngle, setFlipAngle] = useState(0)
  /** GAME-086: Challenge mode state */
  const [challengeMode, setChallengeMode] = useState(false)
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_TIME_LIMIT)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  /** R2-159：數位真心話瓶模式 — 轉瓶指到的人可選真心話或大冒險 */
  const [bottleMode, setBottleMode] = useState<BottleCapMode | null>(null)
  const [bottlePhase, setBottlePhase] = useState<'spin' | 'pointed' | 'question'>('spin')
  const [pointedPlayerIndex, setPointedPlayerIndex] = useState<number | null>(null)
  const [bottleQuestion, setBottleQuestion] = useState<{ text: string; type: 'truth' | 'dare' } | null>(null)
  const [truthPool, setTruthPool] = useState<{ text: string; level: string }[]>([])
  const [darePool, setDarePool] = useState<{ text: string; level: string }[]>([])

  useEffect(() => {
    getTruthPool().then(setTruthPool)
    getDarePool().then(setDarePool)
  }, [])

  const startAiming = useCallback(() => {
    // 隨機目標位置
    setTargetPosition({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    })
    setGamePhase('aiming')
    setShotResult(null)
    setFlipAngle(0)
    play('click')
    /** GAME-086: Start challenge timer if in challenge mode */
    if (challengeMode) {
      setTimeLeft(CHALLENGE_TIME_LIMIT)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            return 0
          }
          return prev - 100
        })
      }, 100)
    }
  }, [play, challengeMode])

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
    /** GAME-085: Flip physics — simulate cap tumbling */
    if (!reducedMotion) {
      setFlipAngle(720 + Math.random() * 360)
    }
    /** GAME-086: Stop challenge timer on shot */
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

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
    setFlipAngle(0)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  /** GAME-086: Auto-miss when time runs out in challenge mode */
  useEffect(() => {
    if (challengeMode && gamePhase === 'aiming' && timeLeft <= 0) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      const missResult = { id: 0, points: -1, size: 0, color: '', name: '超時脫靶' }
      setShotResult(missResult)
      setGamePhase('result')
      setRoundCount(r => r + 1)
      play('wrong')
    }
  }, [challengeMode, gamePhase, timeLeft, play])

  /** Cleanup timer on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  /** R2-159：轉瓶 — 隨機指到一人 */
  const spinBottle = useCallback(() => {
    play('click')
    const idx = Math.floor(Math.random() * players.length)
    setPointedPlayerIndex(idx)
    setBottlePhase('pointed')
  }, [players.length, play])

  /** R2-159：選擇真心話或大冒險後抽題 */
  const pickTruthOrDare = useCallback((type: 'truth' | 'dare') => {
    play('click')
    const pool = type === 'truth' ? truthPool : darePool
    const item = pool[Math.floor(Math.random() * pool.length)]
    if (item) {
      setBottleQuestion({ text: item.text, type })
      setBottlePhase('question')
    }
  }, [truthPool, darePool, play])

  /** R2-159：下一輪（再轉瓶） */
  const bottleNext = useCallback(() => {
    play('click')
    setBottleQuestion(null)
    setPointedPlayerIndex(null)
    setBottlePhase('spin')
  }, [play])

  const currentPlayer = players[currentPlayerIndex]
  const leaderboard = Object.entries(score)
    .map(([i, s]) => ({ name: players[Number(i)], score: s }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  /** R2-159：未選模式時顯示射擊 / 真心話瓶 */
  if (bottleMode === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="瓶蓋遊戲">
        <GameRules rules={t('games.bottleCapRules')} rulesKey="bottle-cap.rules" />
        <p className="text-white/60 mb-6">選擇玩法</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => { play('click'); setBottleMode('shoot') }}
            className="min-h-[56px] px-8 py-3 rounded-2xl bg-white/10 hover:bg-amber-500/30 text-white font-medium flex items-center gap-3 games-focus-ring"
          >
            <Target className="w-6 h-6" />
            射擊計分
          </button>
          <button
            type="button"
            onClick={() => { play('click'); setBottleMode('bottle') }}
            className="min-h-[56px] px-8 py-3 rounded-2xl bg-white/10 hover:bg-primary-500/30 text-white font-medium flex items-center gap-3 games-focus-ring"
          >
            <Wine className="w-6 h-6" />
            真心話瓶（指到的人選真心話或大冒險）
          </button>
        </div>
      </div>
    )
  }

  /** R2-159：真心話瓶流程 */
  if (bottleMode === 'bottle') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="真心話瓶">
        <GameRules rules="轉瓶隨機指到一人，該玩家選擇「真心話」或「大冒險」，依題目回答或執行。" rulesKey="bottle-cap.bottle-rules" />
        <button type="button" onClick={() => setBottleMode(null)} className="absolute top-4 right-4 text-white/50 text-sm games-focus-ring">換模式</button>
        {bottlePhase === 'spin' && (
          <div className="text-center">
            <Wine className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <p className="text-white/70 mb-6">轉瓶指到誰？</p>
            <button type="button" onClick={spinBottle} className="btn-primary px-8 py-3 text-lg games-focus-ring">轉瓶</button>
          </div>
        )}
        {bottlePhase === 'pointed' && pointedPlayerIndex !== null && (
          <div className="text-center max-w-md">
            <p className="text-white/60 mb-2">指向</p>
            <p className="text-2xl font-bold text-primary-400 mb-6">{players[pointedPlayerIndex]}</p>
            <p className="text-white/50 text-sm mb-4">請選擇</p>
            <div className="flex gap-4 justify-center">
              <button type="button" onClick={() => pickTruthOrDare('truth')} className="btn-primary px-6 py-3 games-focus-ring">真心話</button>
              <button type="button" onClick={() => pickTruthOrDare('dare')} className="btn-primary px-6 py-3 games-focus-ring bg-secondary-500 hover:bg-secondary-600">大冒險</button>
            </div>
          </div>
        )}
        {bottlePhase === 'question' && bottleQuestion && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
            <p className="text-white/50 text-sm mb-2">{bottleQuestion.type === 'truth' ? '真心話' : '大冒險'}</p>
            <p className="text-xl font-bold text-white mb-6 px-2">{bottleQuestion.text}</p>
            <button type="button" onClick={bottleNext} className="btn-primary px-6 py-2 games-focus-ring">下一輪</button>
          </m.div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="瓶蓋彈射">
      <GameRules
        rules={t('games.bottleCapRules')}
        rulesKey="bottle-cap.rules"
      />
      <button type="button" onClick={() => setBottleMode(null)} className="absolute top-4 right-4 text-white/50 text-sm games-focus-ring">換模式</button>
      {/** GAME-086: Challenge mode toggle */}
      <button
        type="button"
        onClick={() => setChallengeMode(p => !p)}
        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium games-focus-ring flex items-center gap-1 ${challengeMode ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50' : 'bg-white/10 text-white/50'}`}
      >
        <Zap className="w-3 h-3" />{challengeMode ? '挑戰模式 ON' : '挑戰模式'}
      </button>
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
          {/** GAME-086: Challenge mode countdown bar */}
          {challengeMode && (
            <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
              <m.div
                className={`h-full rounded-full ${timeLeft > 2000 ? 'bg-green-500' : timeLeft > 1000 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${(timeLeft / CHALLENGE_TIME_LIMIT) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}

          {/* 靶子 */}
          <div
            className="relative w-64 h-64 mx-auto mb-6"
            style={{
              left: `${targetPosition.x - 50}%`,
              top: `${targetPosition.y - 50}%`,
            }}
          >
            {TARGETS.slice().reverse().map((target) => (
              <m.div
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

          <m.button
            type="button"
            onClick={shoot}
            whileTap={{ scale: 0.9 }}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xl games-focus-ring shadow-lg"
          >
            {t('games.bottleCapShoot')} 🚀
          </m.button>
        </div>
      )}

      {gamePhase === 'result' && shotResult && (
        <AnimatePresence>
          <m.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.5, rotateY: 0 }}
            animate={{ opacity: 1, scale: 1, rotateY: reducedMotion ? 0 : flipAngle }}
            transition={reducedMotion ? undefined : { type: 'spring', stiffness: 80, damping: 12 }}
            className="text-center w-full max-w-md"
            style={{ perspective: 600 }}
          >
            {shotResult.points >= 0 ? (
              <>
                <m.div
                  initial={reducedMotion ? false : { y: -50 }}
                  animate={{ y: 0 }}
                  className={`w-24 h-24 rounded-full ${shotResult.color || 'bg-gray-500'} mx-auto mb-4 flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-bold text-2xl">{shotResult.points}</span>
                </m.div>
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
                <m.p
                  initial={reducedMotion ? false : { rotate: -10 }}
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3, repeat: 2 }}
                  className="text-6xl mb-4"
                >
                  💨
                </m.p>
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
          </m.div>
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
