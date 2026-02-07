'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesShake } from './GamesContext'
import { useGameTrial, useGameReduceMotion } from './GameWrapper'

const HISTORY_SIZE = 10
/** 86 支援 1～6 顆骰子。87 骰子樣式。88 總和／各顆顯示模式 */
const DICE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6] as const
const DICE_STYLE_OPTIONS = ['standard', 'glass', 'emoji'] as const
type DisplayMode = 'sum' | 'each'
type DiceCount = (typeof DICE_COUNT_OPTIONS)[number]
type DiceStyle = (typeof DICE_STYLE_OPTIONS)[number]
const DICE_STYLE_LABEL: Record<DiceStyle, string> = { standard: '標準', glass: '酒杯', emoji: '表情' }

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
  const trial = useGameTrial()

  const roll = useCallback(() => {
    play('click')
    setRolling(true)
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    const count = diceCount
    const durationMs = reducedMotion ? 100 : 1200
    rollIntervalRef.current = setInterval(() => {
      setDices(Array.from({ length: count }, () => Math.ceil(Math.random() * 6)))
    }, 80)
    rollTimeoutRef.current = setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current)
        rollIntervalRef.current = null
      }
      rollTimeoutRef.current = null
      const final = Array.from({ length: count }, () => Math.ceil(Math.random() * 6))
      setDices(final)
      const sum = final.reduce((a, b) => a + b, 0)
      setTotal(sum)
      setHistory((prev) => [sum, ...prev].slice(0, HISTORY_SIZE))
      if (count >= 2 && final.every((v) => v === final[0])) {
        play('win')
        fireFullscreenConfetti()
      }
      setRolling(false)
      trial?.isTrialMode && trial.onRoundEnd()
    }, durationMs)
  }, [diceCount, reducedMotion, play, trial])

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
  }, [rolling])

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
        <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="擲骰子">
            <GameRules rules={`擲 1～6 顆骰子，比點數總和或各顆單獨比大小。\n可約定：總和最小喝、最大喝、對子喝等。`} />
            <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="骰子樣式">
              {DICE_STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDiceStyle(s)}
                  disabled={rolling}
                  aria-pressed={diceStyle === s}
                  className={`min-h-[48px] min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 games-focus-ring ${diceStyle === s ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                >
                  {DICE_STYLE_LABEL[s]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="顯示模式">
              <button
                type="button"
                onClick={() => setDisplayMode('sum')}
                disabled={rolling}
                aria-pressed={displayMode === 'sum'}
                className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 games-focus-ring ${displayMode === 'sum' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
              >
                總和
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('each')}
                disabled={rolling}
                aria-pressed={displayMode === 'each'}
                className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${displayMode === 'each' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
              >
                各顆
              </button>
            </div>
            <div className="flex gap-3 mb-6" role="group" aria-label="選擇骰子數量">
                {DICE_COUNT_OPTIONS.map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => changeDiceCount(n)}
                        disabled={rolling}
                        aria-pressed={diceCount === n}
                        aria-label={`${n} 顆骰子`}
                        className={`min-h-[48px] min-w-[4rem] px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                            diceCount === n ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                    >
                        {n} 顆
                    </button>
                ))}
            </div>
            <div className="flex gap-6 md:gap-12 mb-8 md:mb-12 perspective-1000" aria-label="骰子">
                {dices.map((val, i) => (
                    <motion.div
                        key={i}
                        animate={rolling && !reducedMotion ? {
                            rotateX: [0, 360, 720],
                            rotateY: [0, 360, 720],
                            rotateZ: [0, 180, 360],
                            y: [0, -30, -15, 0],
                            scale: [1, 1.15, 1.05, 1]
                        } : {
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0,
                            y: 0,
                            scale: 1
                        }}
                        transition={{ 
                            duration: reducedMotion ? 0.1 : 1.2, 
                            ease: [0.68, -0.55, 0.265, 1.55],
                            times: [0, 0.4, 0.7, 1]
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border relative flex items-center justify-center ${
                          diceStyle === 'standard' ? 'bg-gradient-to-br from-gray-100 to-gray-300 border-white/50 shadow-[0_0_40px_rgba(255,255,255,0.2)]' :
                          diceStyle === 'glass' ? 'bg-gradient-to-br from-amber-200 to-amber-600 border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.3)]' :
                          'bg-gradient-to-br from-rose-200 to-pink-500 border-rose-400/50 shadow-[0_0_40px_rgba(244,114,182,0.3)]'
                        }`}
                    >
                        {diceStyle === 'emoji' ? (
                          <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                            {['①','②','③','④','⑤','⑥'][val - 1]}
                          </span>
                        ) : (
                          <div className="relative w-full h-full p-4">
                            {getDotPositions(val).map((pos, idx) => {
                              const dotColor = diceStyle === 'glass' ? '#78350f' : '#1a1a1a'
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
                    </motion.div>
                ))}
            </div>

            <div className="text-center" aria-live="polite" aria-atomic="true">
                <div ref={announceRef} className="sr-only" role="status">
                    {!rolling && (diceCount === 1 ? `點數 ${total}` : `點數總和 ${total}`)}
                </div>
                <AnimatePresence mode="wait">
                    {!rolling && (
                        <motion.div
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
                {history.length > 0 && (
                    <>
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
                    </>
                )}
                <button type="button" onClick={roll} disabled={rolling} className="btn-primary w-56 md:w-64 text-lg md:text-xl games-focus-ring disabled:opacity-50 disabled:cursor-not-allowed" aria-label={rolling ? '擲骰中' : '擲骰子'} aria-busy={rolling} data-testid="dice-roll">
                    {rolling ? '擲骰中...' : '擲骰子'}
                </button>
            </div>
        </div>
    )
}
