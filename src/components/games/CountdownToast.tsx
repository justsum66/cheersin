'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { usePassPhone } from './PassPhoneContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const INTERVAL_OPTIONS = [
  { id: 'short' as const, label: '短', min: 3, max: 5 },
  { id: 'long' as const, label: '長', min: 5, max: 10 },
]

/** 倒數乾杯：隨機區間倒數，最接近目標秒數按下的人喝。區間可調、結果可複製。支援傳手機模式接力計時。
 * T069 P2：關鍵提示有視覺 — 倒數與結果皆有文字顯示，無僅音效提示；結果區 aria-live。 */
export default function CountdownToast() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const passPhone = usePassPhone()
  const [intervalOption, setIntervalOption] = useState<'short' | 'long'>('long')
  const [phase, setPhase] = useState<'idle' | 'counting' | 'result'>('idle')
  const [targetTime, setTargetTime] = useState(0)
  const [pressTimes, setPressTimes] = useState<Record<number, number>>({})
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const startRef = useRef<number>(0)

  const opt = INTERVAL_OPTIONS.find((o) => o.id === intervalOption) ?? INTERVAL_OPTIONS[1]
  const passEnabled = passPhone?.enabled ?? false

  /** 傳手機完成後：接力計時，開始下一位的回合 */
  useEffect(() => {
    if (!passPhone?.enabled) return
    passPhone.registerOnPassComplete((nextIndex) => {
      setCurrentPlayerIndex(nextIndex)
      if (nextIndex >= players.length) setPhase('result')
    })
    return () => passPhone.unregisterOnPassComplete()
  }, [passPhone, players.length])

  const start = useCallback(() => {
    play('click')
    const sec = opt.min + Math.random() * (opt.max - opt.min)
    setTargetTime(sec * 1000)
    setPressTimes({})
    setCurrentPlayerIndex(0)
    setPhase('counting')
    startRef.current = Date.now()
  }, [opt.min, opt.max, play])

  const press = useCallback(() => {
    if (phase !== 'counting') return
    play('click')
    const elapsed = Date.now() - startRef.current
    setPressTimes((prev) => ({ ...prev, [currentPlayerIndex]: elapsed }))
    passPhone?.recordResult(currentPlayerIndex, `${(elapsed / 1000).toFixed(2)} 秒`)

    const nextIndex = currentPlayerIndex + 1
    if (passEnabled && nextIndex < players.length) {
      passPhone?.requestPassTo(currentPlayerIndex)
      return
    }
    setCurrentPlayerIndex(nextIndex)
    if (nextIndex >= players.length) setPhase('result')
  }, [phase, currentPlayerIndex, players.length, passEnabled, passPhone, play])

  const reset = useCallback(() => {
    setPhase('idle')
  }, [])

  /** Esc 取消 / 返回 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (phase === 'counting' || phase === 'result')) {
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, reset])

  const loser = (() => {
    if (phase !== 'result' || Object.keys(pressTimes).length === 0) return null
    const entries = Object.entries(pressTimes).map(([i, t]) => ({ i: Number(i), t: t as number }))
    const closest = entries.reduce((a, b) =>
      Math.abs(a.t - targetTime) <= Math.abs(b.t - targetTime) ? a : b
    )
    return players[closest.i]
  })()

  const targetSec = (targetTime / 1000).toFixed(1)

  /** 複製用文案：含遊戲名與每人秒數 */
  const copyResultText =
    phase === 'result' && loser
      ? (() => {
          let text = `倒數乾杯：最接近 ${targetSec} 秒的人喝 → ${loser} 喝！`
          const entries = Object.entries(pressTimes)
            .map(([i, t]) => ({ i: Number(i), t: t as number }))
            .sort((a, b) => a.t - b.t)
          if (entries.length > 0) {
            text += '\n' + entries.map((e) => `${players[e.i]}：${(e.t / 1000).toFixed(2)} 秒`).join('、')
          }
          return text
        })()
      : ''

  /** 遊戲結束時震動 + 音效反饋（拍桌感） */
  useEffect(() => {
    if (phase === 'result') {
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    }
  }, [phase, play])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="倒數乾杯">
      <GameRules rules={`開始後會隨機倒數（可選短 3～5 秒或長 5～10 秒），每人輪流按一次。\n最接近目標秒數按下的人喝。`} />
      <p className="text-white/50 text-sm mb-2 text-center">
        隨機倒數，最接近目標秒數按下的人喝
      </p>
      {phase === 'idle' && (
        <>
          <div className="flex gap-2 mb-4" role="group" aria-label="目標區間">
            {INTERVAL_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setIntervalOption(o.id)}
                className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring ${intervalOption === o.id ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                {o.label}（{o.min}～{o.max} 秒）
              </button>
            ))}
          </div>
          <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={start}
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg games-focus-ring"
        >
          開始倒數
        </motion.button>
        </>
      )}
      {phase === 'counting' && (
        <>
          {passEnabled && passPhone?.getFlipHidden() ? (
            <p className="text-white/50 text-lg">請翻回手機繼續</p>
          ) : (
            <>
              <p className="text-white/70 text-lg mb-4">輪到 {players[currentPlayerIndex]} 按</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={press}
                className="min-h-[56px] min-w-[160px] px-8 py-4 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-bold text-xl games-focus-ring"
              >
                按！
              </motion.button>
            </>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-4 min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm games-focus-ring"
          >
            取消
          </button>
        </>
      )}
      {phase === 'result' && loser && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <p className="text-white/60 text-sm mb-1">最接近 {targetSec} 秒的人喝</p>
          <p className="text-red-400 font-bold text-2xl mb-2" aria-live="polite">{loser} 喝！</p>
          {Object.keys(pressTimes).length > 0 && (
            <ul className="text-white/50 text-sm mb-3 space-y-0.5">
              {Object.entries(pressTimes)
                .map(([i, t]) => ({ i: Number(i), t: t as number }))
                .sort((a, b) => a.t - b.t)
                .map((e) => (
                  <li key={e.i}>
                    {players[e.i]}：{(e.t / 1000).toFixed(2)} 秒
                  </li>
                ))}
            </ul>
          )}
          <div className="flex gap-2 justify-center flex-wrap">
            {copyResultText && <CopyResultButton text={copyResultText} />}
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500/80 hover:bg-primary-500 text-white font-medium games-focus-ring"
            >
              再一輪
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
