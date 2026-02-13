'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, slideUp, staggerContainer, buttonHover, buttonTap } from '@/lib/animations'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesShake } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import { useGameStore } from '@/store/useGameStore'

const HISTORY_SIZE = 10
/** 86 支援 1～6 顆骰子。87 骰子樣式。88 總和／各顆顯示模式 */
const DICE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6] as const
const DICE_STYLE_OPTIONS = ['standard', 'glass', 'emoji', 'neon'] as const
type DisplayMode = 'sum' | 'each'
type DiceCount = (typeof DICE_COUNT_OPTIONS)[number]
type DiceStyle = (typeof DICE_STYLE_OPTIONS)[number]
const DICE_STYLE_LABEL: Record<DiceStyle, string> = { standard: '標準', glass: '酒杯', emoji: '表情', neon: '霓虹' }

/** 依骰數產生初始值陣列 */
function initialDiceValues(count: DiceCount): number[] {
  return Array.from({ length: count }, () => Math.ceil(Math.random() * 6))
}

export default function Dice() {
  const [diceCount, setDiceCount] = useState<DiceCount>(2)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('sum')
  const [diceStyle, setDiceStyle] = useState<DiceStyle>('standard')
  const [dices, setDices] = useState<number[]>(() => initialDiceValues(2))
  const [rolling, setRolling] = useState(false)
  const [total, setTotal] = useState(7)
  const [history, setHistory] = useState<number[]>([])
  /** AUDIT #26：遊戲內「簡化動畫」即時反映 */
  const reducedMotion = useGameReduceMotion()
  const announceRef = useRef<HTMLDivElement>(null)
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { registerShakeHandler, unregisterShakeHandler } = useGamesShake()
  const { play } = useGameSound()
  /* R2-001: Deep Refactor - Use Store */
  const { trial, decrementTrialRound } = useGameStore()
  // G3-033: Hold mechanics
  const [heldDice, setHeldDice] = useState<boolean[]>(() => Array(2).fill(false))
  // G3-034: High/Low predict
  const [prediction, setPrediction] = useState<'high' | 'low' | null>(null)
  const [lastPredictionResult, setLastPredictionResult] = useState<'correct' | 'wrong' | null>(null)
  const predictionResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // const trial = useGameTrial() // Replaced

  const roll = useCallback(() => {
    play('click')
    setRolling(true)
    setLastPredictionResult(null)
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    const count = diceCount
    // G3-031: Physics-like bounce duration
    const durationMs = reducedMotion ? 100 : 1400
    // G3-032: Rolling sound loop (countdown sound as substitute)
    const rollSoundInterval = setInterval(() => play('countdown'), 200)
    rollIntervalRef.current = setInterval(() => {
      setDices((prev) => prev.map((v, i) => heldDice[i] ? v : Math.ceil(Math.random() * 6)))
    }, 80)
    rollTimeoutRef.current = setTimeout(() => {
      clearInterval(rollSoundInterval)
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current)
        rollIntervalRef.current = null
      }
      rollTimeoutRef.current = null
      const final = dices.map((v, i) => heldDice[i] ? v : Math.ceil(Math.random() * 6))
      setDices(final)
      const sum = final.reduce((a, b) => a + b, 0)
      setTotal(sum)
      setHistory((prev) => [sum, ...prev].slice(0, HISTORY_SIZE))
      // G3-032: Thud sound on stop
      play('click')
      if (count >= 2 && final.every((v) => v === final[0])) {
        play('win')
        if (!reducedMotion) fireFullscreenConfetti()
      }
      // G3-034: Check prediction
      if (prediction) {
        const midpoint = (count * 7) / 2 // midpoint of range [count, count*6]
        const isHigh = sum > midpoint
        const isCorrect = (prediction === 'high' && isHigh) || (prediction === 'low' && !isHigh)
        setLastPredictionResult(isCorrect ? 'correct' : 'wrong')
        play(isCorrect ? 'correct' : 'wrong')
        if (predictionResultTimeoutRef.current) clearTimeout(predictionResultTimeoutRef.current)
        predictionResultTimeoutRef.current = setTimeout(() => {
          predictionResultTimeoutRef.current = null
          setLastPredictionResult(null)
        }, 2000)
      }
      setRolling(false)
      setPrediction(null)
      if (trial.isTrial) decrementTrialRound()
    }, durationMs)
  }, [diceCount, reducedMotion, play, trial, decrementTrialRound, heldDice, prediction, dices])

  /** unmount 時清除擲骰動畫計時器，避免 setState on unmounted */
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current)
        rollIntervalRef.current = null
      }
      if (rollTimeoutRef.current) {
        clearTimeout(rollTimeoutRef.current)
        rollTimeoutRef.current = null
      }
    }
  }, [])

  /** 甩動手機觸發擲骰（GamesContext 統一監聽 DeviceMotion） */
  useEffect(() => {
    registerShakeHandler(() => { if (!rolling) roll() })
    return unregisterShakeHandler
  }, [rolling, roll, registerShakeHandler, unregisterShakeHandler])

  const changeDiceCount = useCallback((count: DiceCount) => {
    if (rolling) return
    setDiceCount(count)
    setDices(initialDiceValues(count))
    setTotal(count === 1 ? 1 : count * 3)
    setHeldDice(Array(count).fill(false)) // G3-033: Reset held state
  }, [rolling])

  // G3-033: Toggle hold for a specific dice
  const toggleHold = useCallback((index: number) => {
    if (rolling) return
    setHeldDice((prev) => prev.map((h, i) => i === index ? !h : h))
    play('click')
  }, [rolling, play])

  const getDotPositions = (value: number) => {
    switch (value) {
      case 1: return ['center']
      case 2: return ['top-right', 'bottom-left']
      case 3: return ['top-right', 'center', 'bottom-left']
      case 4: return ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      case 5: return ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right']
      case 6: return ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right']
      default: return []
    }
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px"
      role="main"
      aria-label="擲骰子"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div variants={slideUp} className="w-full max-w-2xl text-center">
        <GameRules rules={`擲 1～6 顆骰子，比點數總和或各顆單獨比大小。\n可約定：總和最小喝、最大喝、對子喝等。`} />
      </motion.div>
      <motion.div variants={slideUp} className="flex flex-wrap gap-2 mb-2" role="group" aria-label="骰子樣式">
        {DICE_STYLE_OPTIONS.map((s) => (
          <motion.button
            key={s}
            type="button"
            onClick={() => setDiceStyle(s)}
            disabled={rolling}
            aria-pressed={diceStyle === s}
            whileHover={buttonHover}
            whileTap={buttonTap}
            className={`min-h-[48px] min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 games-focus-ring ${diceStyle === s ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
          >
            {DICE_STYLE_LABEL[s]}
          </motion.button>
        ))}
      </motion.div>
      <motion.div variants={slideUp} className="flex flex-wrap gap-2 mb-4" role="group" aria-label="顯示模式">
        <motion.button
          type="button"
          onClick={() => setDisplayMode('sum')}
          disabled={rolling}
          aria-pressed={displayMode === 'sum'}
          whileHover={buttonHover}
          whileTap={buttonTap}
          className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 games-focus-ring ${displayMode === 'sum' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
        >
          總和
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setDisplayMode('each')}
          disabled={rolling}
          aria-pressed={displayMode === 'each'}
          whileHover={buttonHover}
          whileTap={buttonTap}
          className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${displayMode === 'each' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
        >
          各顆
        </motion.button>
      </motion.div>
      <motion.div variants={slideUp} className="flex gap-3 mb-6" role="group" aria-label="選擇骰子數量">
        {DICE_COUNT_OPTIONS.map((n) => (
          <motion.button
            key={n}
            type="button"
            onClick={() => changeDiceCount(n)}
            disabled={rolling}
            aria-pressed={diceCount === n}
            aria-label={`${n} 顆骰子`}
            whileHover={buttonHover}
            whileTap={buttonTap}
            className={`min-h-[48px] min-w-[4rem] px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${diceCount === n ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
          >
            {n} 顆
          </motion.button>
        ))}
      </motion.div>
      <motion.div variants={scaleIn} className="flex gap-6 md:gap-12 mb-8 md:mb-12 perspective-1000" aria-label="骰子">
        {dices.map((val, i) => (
          <motion.div
            key={i}
            // G3-031: Enhanced 3D physics with spring bounce
            animate={rolling && !reducedMotion && !heldDice[i] ? {
              rotateX: [0, 360, 720, 1080],
              rotateY: [0, 360, 720, 1080],
              rotateZ: [0, 180, 360, 540],
              y: [0, -40, -20, -8, 0],
              scale: [1, 1.15, 1.08, 1.02, 1]
            } : {
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              y: 0,
              scale: heldDice[i] ? 0.92 : 1
            }}
            transition={{
              duration: reducedMotion ? 0.1 : 1.4,
              ease: [0.34, 1.56, 0.64, 1],
              times: [0, 0.3, 0.55, 0.8, 1]
            }}
            style={{ transformStyle: 'preserve-3d' }}
            // G3-033: Click to hold
            onClick={() => toggleHold(i)}
            role="button"
            aria-label={`骰子 ${i + 1}：${val} 點${heldDice[i] ? '（已鎖定）' : ''}`}
            aria-pressed={heldDice[i]}
            className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border relative flex items-center justify-center cursor-pointer select-none transition-all ${heldDice[i] ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50' : ''} ${diceStyle === 'standard' ? 'bg-gradient-to-br from-gray-100 to-gray-300 border-white/50 shadow-[0_0_40px_rgba(255,255,255,0.2)]' :
                diceStyle === 'glass' ? 'bg-gradient-to-br from-amber-200 to-amber-600 border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.3)]' :
                  diceStyle === 'neon' ? 'bg-gradient-to-br from-cyan-900 to-purple-900 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.4),0_0_80px_rgba(168,85,247,0.2)]' :
                    'bg-gradient-to-br from-rose-200 to-pink-500 border-rose-400/50 shadow-[0_0_40px_rgba(244,114,182,0.3)]'
              }`}
          >
            {diceStyle === 'emoji' ? (
              <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {['①', '②', '③', '④', '⑤', '⑥'][val - 1]}
              </span>
            ) : (
              <div className="relative w-full h-full p-4">
                {getDotPositions(val).map((pos, idx) => {
                  const dotColor = diceStyle === 'glass' ? '#78350f' : diceStyle === 'neon' ? '#22d3ee' : '#1a1a1a'
                  const styles: Record<string, string | number> = { position: 'absolute', width: '20%', height: '20%', background: dotColor, borderRadius: '50%', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }
                  if (pos === 'center') { styles.top = '40%'; styles.left = '40%'; }
                  if (pos === 'top-left') { styles.top = '10%'; styles.left = '10%'; }
                  if (pos === 'top-right') { styles.top = '10%'; styles.right = '10%'; }
                  if (pos === 'bottom-left') { styles.bottom = '10%'; styles.left = '10%'; }
                  if (pos === 'bottom-right') { styles.bottom = '10%'; styles.right = '10%'; }
                  if (pos === 'mid-left') { styles.top = '40%'; styles.left = '10%'; }
                  if (pos === 'mid-right') { styles.top = '40%'; styles.right = '10%'; }
                  return <div key={idx} style={styles} />
                })}
              </div>
            )}
            {/* G3-033: Hold indicator */}
            {heldDice[i] && (
              <div className="absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10">
                🔒
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center" aria-live="polite" aria-atomic="true">
        <div ref={announceRef} className="sr-only" role="status">
          {!rolling && (diceCount === 1 ? `點數 ${total}` : `點數總和 ${total}`)}
        </div>
        <AnimatePresence mode="wait">
          {!rolling && (
            <motion.div
              key="result"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : undefined}
              className="text-5xl md:text-6xl font-display font-bold text-white mb-4"
              data-testid="dice-result"
            >
              {displayMode === 'sum' ? total : (diceCount === 1 ? dices[0] : dices.join(' · '))}
            </motion.div>
          )}
        </AnimatePresence>
        {/* G3-034: Prediction result */}
        <AnimatePresence>
          {lastPredictionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-lg font-bold mb-2 ${lastPredictionResult === 'correct' ? 'text-green-400' : 'text-red-400'}`}
            >
              {lastPredictionResult === 'correct' ? '🎯 預測正確！' : '❌ 預測錯誤'}
            </motion.div>
          )}
        </AnimatePresence>
        {/* G3-034: High/Low predict buttons */}
        {diceCount >= 2 && !rolling && (
          <div className="flex gap-3 mb-4 justify-center">
            <button
              type="button"
              onClick={() => setPrediction('high')}
              className={`min-h-[40px] px-4 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring flex items-center gap-1 ${prediction === 'high' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              aria-pressed={prediction === 'high'}
            >
              ⬆ 猜大
            </button>
            <button
              type="button"
              onClick={() => setPrediction('low')}
              className={`min-h-[40px] px-4 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring flex items-center gap-1 ${prediction === 'low' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              aria-pressed={prediction === 'low'}
            >
              ⬇ 猜小
            </button>
            {prediction && <span className="text-white/40 text-xs self-center">已選：{prediction === 'high' ? '大' : '小'}</span>}
          </div>
        )}
        {/* G3-033: Hold instructions */}
        {diceCount >= 2 && !rolling && (
          <p className="text-white/30 text-xs mb-2">💡 點擊骰子可鎖定，下次擲骰不會改變</p>
        )}
        {history.length > 0 && (
          <motion.div variants={slideUp}>
            <p className="text-white/40 text-sm mb-2">最近：{history.join('、')}</p>
            {/* 90 骰子結果歷史統計 */}
            <p className="text-white/40 text-xs mb-2">
              統計：最小 {Math.min(...history)}、最大 {Math.max(...history)}、共 {history.length} 次
            </p>
            <CopyResultButton
              text={`深空骰子 本局結果：${history.join('、')}`}
              label="複製本局結果"
              className="mb-4"
            />
          </motion.div>
        )}
        <motion.button
          whileHover={!rolling ? buttonHover : undefined}
          whileTap={!rolling ? buttonTap : undefined}
          type="button"
          onClick={roll}
          disabled={rolling}
          className="btn-primary w-56 md:w-64 text-lg md:text-xl games-focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={rolling ? '擲骰中' : '擲骰子'}
          aria-busy={rolling}
          data-testid="dice-roll"
        >
          {rolling ? '擲骰中...' : '擲骰子'}
        </motion.button>
      </div>
    </motion.div>
  )
}
