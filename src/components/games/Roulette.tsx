'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useGamesPlayers, useGamesShake } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameProgress, useGameStats, useGameReplay, useGameTrial, useGameSpectator, useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4', '玩家 5', '玩家 6']
const MAX_PLAYERS = 12
const MAX_NAME_LENGTH = 20
const SPIN_DURATION_OPTIONS = [3, 5, 7] as const
const SPIN_DURATION_LABELS: Record<3 | 5 | 7, string> = { 3: '快', 5: '中', 7: '慢' }
const HISTORY_MAX = 10
const INERTIA_DECAY = 0.96
const VELOCITY_MIN = 0.3

/** 61 轉盤主題色：每格顏色陣列（循環使用） */
const WHEEL_THEMES: { name: string; colors: [string, string] }[] = [
  { name: '酒紅金', colors: ['#8B0000', '#D4AF37'] },
  { name: '紫藍', colors: ['#8A2BE2', '#1E90FF'] },
  { name: '橙綠', colors: ['#FF6B35', '#2ECC71'] },
  { name: '紅金', colors: ['#E74C3C', '#F1C40F'] },
]

/** 依最終角度計算指針指向的玩家索引（指針在頂部 12 點方向） */
function getWinnerIndex(deg: number, count: number): number {
  const normalized = ((deg % 360) + 360) % 360
  const segmentAngle = 360 / count
  return Math.floor(normalized / segmentAngle) % count
}

/** 將角度差正規化到 [-180, 180] */
function normalizeDelta(deg: number): number {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

export default function Roulette() {
  const contextPlayers = useGamesPlayers()
  const { play: playSound } = useGameSound()
  const { registerShakeHandler, unregisterShakeHandler } = useGamesShake()
  const progress = useGameProgress()
  const gameStats = useGameStats()
  const replay = useGameReplay()
  const trial = useGameTrial()
  const isSpectator = useGameSpectator()
  const reducedMotion = useGameReduceMotion()
  const [players, setPlayers] = useState<string[]>(() =>
    contextPlayers.length >= 2 ? [...contextPlayers] : DEFAULT_PLAYERS
  )
  const [isSpinning, setIsSpinning] = useState(false)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const wheelRef = useRef<HTMLDivElement>(null)
  const [spinDuration, setSpinDuration] = useState<3 | 5 | 7>(5)
  const [newPlayer, setNewPlayer] = useState('')
  const [addError, setAddError] = useState('')
  const [wheelThemeIndex, setWheelThemeIndex] = useState(0)
  const themeColors = WHEEL_THEMES[wheelThemeIndex]?.colors ?? WHEEL_THEMES[0].colors

  const currentRotationRef = useRef(0)
  const dragStartRef = useRef<{ x: number; y: number; rotation: number } | null>(null)
  const lastAngleRef = useRef(0)
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(0)
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyWheelTransform = useCallback((deg: number, transition = '') => {
    if (!wheelRef.current) return
    currentRotationRef.current = deg
    wheelRef.current.style.transition = transition
    wheelRef.current.style.transform = `rotate(${deg}deg)`
  }, [])

  const spin = useCallback(() => {
    if (isSpinning || !wheelRef.current || players.length < 2) return
    progress?.setHasStarted(true)
    playSound('click')
    setWinnerIndex(null)
    setIsSpinning(true)
    const sec = reducedMotion ? 1 : spinDuration
    const deg = Math.floor(5000 + Math.random() * 5000)
    wheelRef.current.style.transition = `all ${sec}s cubic-bezier(0.25, 1, 0.5, 1)`
    wheelRef.current.style.transform = `rotate(${deg}deg)`
    currentRotationRef.current = deg
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
    spinTimeoutRef.current = setTimeout(() => {
      spinTimeoutRef.current = null
      const idx = getWinnerIndex(deg, players.length)
      setWinnerIndex(idx)
      const name = players[idx]
      setHistory((prev) => [name, ...prev].slice(0, HISTORY_MAX))
      setIsSpinning(false)
      gameStats?.setStats({ durationSec: reducedMotion ? 1 : sec })
      replay?.addEvent({ type: 'roulette_spin', label: `轉盤：${name} 中獎` })
      playSound('win')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100])
      fireFullscreenConfetti()
      trial?.isTrialMode && trial.onRoundEnd()
    }, sec * 1000)
  }, [isSpinning, players, spinDuration, reducedMotion, playSound, progress, gameStats, replay, trial])

  /** unmount 或離開遊戲時清除 spin 延遲，避免 setState on unmounted */
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
        spinTimeoutRef.current = null
      }
    }
  }, [])

  /** 搖一搖觸發轉盤（DeviceMotion 由 GamesContext 統一監聽） */
  useEffect(() => {
    registerShakeHandler(spin)
    return unregisterShakeHandler
  }, [registerShakeHandler, unregisterShakeHandler, spin])

  /** 63 再轉一次：鍵盤 R 觸發；GAMES_500 #255 觀戰者不觸發 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (!isSpectator && !isSpinning && players.length >= 2) spin()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isSpectator, isSpinning, players.length, spin])

  const getWheelCenter = useCallback((): { x: number; y: number } => {
    if (!wheelRef.current) return { x: 0, y: 0 }
    const rect = wheelRef.current.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isSpinning || players.length < 2) return
      const { x, y } = getWheelCenter()
      const angle = Math.atan2(e.clientY - y, e.clientX - x)
      dragStartRef.current = { x: e.clientX, y: e.clientY, rotation: currentRotationRef.current }
      lastAngleRef.current = angle
      lastTimeRef.current = Date.now()
      velocityRef.current = 0
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [isSpinning, players.length, getWheelCenter]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current || !wheelRef.current) return
      const { x, y } = getWheelCenter()
      const angle = Math.atan2(e.clientY - y, e.clientX - x)
      const deltaAngle = normalizeDelta((angle - lastAngleRef.current) * (180 / Math.PI))
      const now = Date.now()
      const dt = (now - lastTimeRef.current) / 1000 || 0.016
      velocityRef.current = dt > 0 ? deltaAngle / dt : 0
      lastTimeRef.current = now
      lastAngleRef.current = angle
      const next = currentRotationRef.current + deltaAngle
      applyWheelTransform(next)
    },
    [getWheelCenter, applyWheelTransform]
  )

  /** 61 拖曳慣性 reducedMotion：鬆手後慣性動畫時長可縮或跳過 */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      if (!dragStartRef.current || isSpinning || players.length < 2) return
      dragStartRef.current = null
      playSound('click')
      let rotation = currentRotationRef.current
      let velocity = reducedMotion ? 0 : Math.max(-80, Math.min(80, velocityRef.current))
      const finish = (rot: number) => {
        const pointerAngle = (360 - ((rot % 360) + 360) % 360 + 360) % 360
        const idx = getWinnerIndex(pointerAngle, players.length)
        setWinnerIndex(idx)
        const name = players[idx]
        setHistory((prev) => [name, ...prev].slice(0, HISTORY_MAX))
        replay?.addEvent({ type: 'roulette_spin', label: `轉盤：${name} 中獎` })
        playSound('win')
        fireFullscreenConfetti()
      }
      const runInertia = () => {
        rotation += velocity
        velocity *= INERTIA_DECAY
        applyWheelTransform(rotation)
        if (Math.abs(velocity) > VELOCITY_MIN) {
          requestAnimationFrame(runInertia)
        } else {
          finish(rotation)
        }
      }
      if (reducedMotion) {
        finish(rotation)
      } else {
        requestAnimationFrame(runInertia)
      }
    },
    [isSpinning, players, reducedMotion, applyWheelTransform, playSound, replay]
  )

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    const name = newPlayer.trim()
    if (!name) {
      setAddError('請輸入暱稱')
      return
    }
    if (name.length > MAX_NAME_LENGTH) {
      setAddError(`暱稱最多 ${MAX_NAME_LENGTH} 字`)
      return
    }
    if (players.length >= MAX_PLAYERS) {
      setAddError(`最多 ${MAX_PLAYERS} 人`)
      return
    }
    setPlayers([...players, name])
    setNewPlayer('')
  }

  const winnerName = winnerIndex !== null ? players[winnerIndex] : null
  const historySlice = history.slice(0, HISTORY_MAX)
  const lastWinner = historySlice[1]
  const isRepeatWinner = winnerName && lastWinner && winnerName === lastWinner

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="命運轉盤">
      <GameRules
        rules={`轉動轉盤後，指針指向的人就是「這輪喝」的人。\n至少 2 位玩家，可於下方新增／清空玩家。可選轉動秒數（僅影響動畫）。`}
        rulesKey="roulette.rules"
      />
      {isSpectator && (
        <p className="text-white/50 text-sm mb-2" role="status" aria-live="polite">觀戰中，僅可查看結果</p>
      )}
      {!isSpectator && !isSpinning && players.length >= 2 && (
        <div className="flex flex-wrap gap-3 md:gap-4 mb-2 justify-center" role="group" aria-label="轉動速度與主題">
          <span className="text-white/50 text-xs self-center mr-1">速度：</span>
          {SPIN_DURATION_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpinDuration(s)}
              className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring ${spinDuration === s ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              title={`${s} 秒`}
              aria-label={`速度 ${SPIN_DURATION_LABELS[s]} ${s} 秒`}
              aria-pressed={spinDuration === s}
            >
              {SPIN_DURATION_LABELS[s]}
            </button>
          ))}
          <span className="text-white/50 text-xs self-center mx-2">主題：</span>
          {WHEEL_THEMES.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setWheelThemeIndex(i)}
              className={`min-h-[48px] min-w-[48px] rounded-lg border-2 transition-colors games-focus-ring ${wheelThemeIndex === i ? 'border-white scale-110' : 'border-white/20 hover:border-white/40'}`}
              style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
              aria-label={`主題 ${t.name}`}
              aria-pressed={wheelThemeIndex === i}
              title={t.name}
            />
          ))}
        </div>
      )}
      {/* G3D-Roulette-01/02：轉盤 3D 厚度/光影、指針 3D 立體；RWD-51 轉盤尺寸 vmin */}
      <div className="relative w-[min(280px,85vmin)] h-[min(280px,85vmin)] sm:w-[min(320px,85vmin)] sm:h-[min(320px,85vmin)] md:w-[min(400px,85vmin)] md:h-[min(400px,85vmin)] max-w-[400px] max-h-[400px] mb-6 md:mb-10 mx-auto" aria-label="命運轉盤">
                {/* G3D-Roulette-02：指針 3D 立體、陰影與高光 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
                    <div className="w-10 h-10 rotate-45 bg-gradient-to-b from-white via-gray-100 to-gray-300 border-4 border-gray-900 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.8)] relative">
                        {!reducedMotion && <div className="absolute inset-0 bg-white/50 animate-pulse rounded-sm" aria-hidden="true" />}
                    </div>
                </div>

                {/* G3D-Roulette-01：轉盤 3D 厚度/光影；G3D-Roulette-08 主題色切換時過渡 */}
                <div
                    ref={wheelRef}
                    className={`w-full h-full rounded-full border-[8px] md:border-[12px] border-[#1a1a1a] bg-[#1a1a1a] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5),0_8px_32px_rgba(0,0,0,0.3)] select-none transition-[box-shadow] duration-300 ${isSpectator ? 'pointer-events-none' : 'touch-none'}`}
                    onPointerDown={isSpectator ? undefined : handlePointerDown}
                    onPointerMove={isSpectator ? undefined : handlePointerMove}
                    onPointerUp={isSpectator ? undefined : handlePointerUp}
                    onPointerLeave={isSpectator ? undefined : handlePointerUp}
                    role="img"
                    aria-label={isSpectator ? '轉盤（觀戰中）' : '轉盤可拖曳旋轉'}
                >
                    {players.map((p, i) => (
                        <div
                            key={i}
                            className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-center"
                            style={{
                                transform: `rotate(${i * (360 / players.length)}deg) skewY(-${90 - (360 / players.length)}deg)`,
                                background: themeColors[i % 2],
                                borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            {/* G3D-Roulette-03：轉盤區塊顏色對比、文字可讀性 */}
                            <span
                                className="absolute text-white font-bold whitespace-nowrap text-xs sm:text-sm md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.9),0_0_1px_rgba(0,0,0,1)]"
                                style={{
                                    transform: `skewY(${90 - (360 / players.length)}deg) rotate(${360 / players.length / 2}deg) translate(45px, 0px)`,
                                }}
                            >
                                {p}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-white/20 shadow-xl z-10 flex items-center justify-center">
                    {!reducedMotion && <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 animate-spin-slow opacity-80 blur-sm absolute" aria-hidden="true" />}
                    <div className="w-4 h-4 rounded-full bg-white relative z-10" />
                </div>
            </div>

            <AnimatePresence>
            {/* T069 P2：結果有視覺文字與 aria-live；#39 減少動畫時跳過過場；#49 e2e 結果區 */}
            {winnerIndex !== null && winnerName && (
              <>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-2 mb-2">
                  <motion.p
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={reducedMotion ? { duration: 0 } : undefined}
                    className="text-primary-400 font-bold text-xl md:text-2xl px-4 py-3 rounded-xl bg-primary-500/20 border border-primary-500/40 text-center"
                    role="status"
                    aria-live="polite"
                    data-testid="roulette-result"
                  >
                    中獎：<span className="text-xl sm:text-2xl md:text-3xl tabular-nums truncate max-w-[12rem] sm:max-w-none" title={winnerName}>{winnerName}</span>
                  </motion.p>
                  <CopyResultButton text={`命運轉盤 中獎：${winnerName}`} label="複製結果" />
                </div>
                {isRepeatWinner && (
                  <p className="text-amber-400 text-sm font-medium mb-2" role="alert">連續選到同一人！</p>
                )}
              </>
            )}
          </AnimatePresence>
          {/* G3D-Roulette-04/10：玩家名單/歷史列表排版、間距與視覺層次 */}
          {historySlice.length > 0 && (
            <div className="mb-2 w-full max-w-xs max-h-36 sm:max-h-40 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-3 space-y-2" role="region" aria-label="本局轉盤歷史">
              <p className="text-white/50 text-xs mb-1 sticky top-0 bg-black/20 -m-1 p-1 rounded">最近 {HISTORY_MAX} 次（點擊複製）：</p>
              <div className="flex flex-wrap gap-2 items-center mb-1">
                <CopyResultButton
                  text={`命運轉盤 本局歷史：\n${historySlice.map((name, i) => `${i + 1}. ${name}`).join('\n')}`}
                  label="複製本局歷史"
                  className="text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {historySlice.map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`命運轉盤 中獎：${name}`)
                        playSound('click')
                      } catch (err) {
                        console.error('[Roulette] clipboard write failed', err)
                      }
                    }}
                    className="min-h-[48px] min-w-[48px] px-2 py-1 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 hover:scale-[1.02] transition-transform transition-colors"
                    aria-label={`複製 ${name}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {!isSpectator && (
                <button type="button" onClick={() => setHistory([])} className="mt-1 min-h-[48px] min-w-[48px] px-3 py-1.5 text-white/40 hover:text-white/60 text-xs rounded-lg" aria-label="清除轉盤歷史">清除歷史</button>
              )}
            </div>
          )}
          {/* G3D-Roulette-09：空名單狀態文案精緻化 */}
          {!isSpectator && players.length < 2 && (
            <p className="text-amber-400/90 text-sm mb-2 text-center max-w-xs px-2" role="status">
              {players.length === 0 ? '在下方輸入暱稱並按 + 新增至少 2 位玩家，即可轉動轉盤' : '至少需 2 位玩家才能轉動'}
            </p>
          )}
          {!isSpectator && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={spin}
                disabled={isSpinning || players.length < 2}
                className="btn-primary w-56 md:w-64 min-h-[48px] text-lg md:text-xl shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed games-focus-ring hover:scale-[1.02] active:scale-[0.98] transition-transform"
                aria-label={isSpinning ? '轉盤轉動中' : '轉動命運之輪'}
                data-testid="roulette-spin"
              >
                {isSpinning ? '命運轉動中...' : '轉動命運之輪'}
              </button>
              <button
                type="button"
                onClick={spin}
                disabled={isSpinning || players.length < 2}
                className="min-h-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed games-focus-ring transition-transform"
                aria-label="再轉一次"
                title="或按 R 鍵、搖一搖手機"
              >
                再轉一次 (R)
              </button>
              {/* G3D-Roulette-11：搖一搖/鍵盤 R 觸發提示 */}
              <p className="text-white/30 text-xs w-full text-center mt-1">搖一搖或按 R 鍵可再轉</p>
            </div>
          )}

          {/* Player list (scrollable when many)；觀戰者僅可看名單；RWD 75 */}
          {/* G3D-Roulette-04：玩家名單排版、間距 */}
          {players.length > 0 && (
            <div className="mt-4 w-full max-w-xs max-h-28 sm:max-h-32 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5">
              <p className="text-white/50 text-xs mb-2 sticky top-0 bg-black/20 -m-1 p-1 rounded z-[1]">玩家名單</p>
              <ul className="flex flex-wrap gap-2">
                {players.map((p, i) => (
                  <li key={i} className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white/80 text-sm border border-white/5">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Player Controls；GAMES_500 #255 觀戰者不顯示 */}
          {!isSpectator && !isSpinning && (
            <form onSubmit={addPlayer} className="mt-6 flex flex-wrap gap-2 w-full max-w-xs" aria-label="新增玩家">
              <div className="flex gap-2 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  value={newPlayer}
                  onChange={(e) => { setNewPlayer(e.target.value); setAddError('') }}
                  placeholder="輸入暱稱後按 + 新增"
                  maxLength={MAX_NAME_LENGTH}
                  className="flex-1 min-w-0 min-h-[48px] bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 text-white placeholder-white/40 outline-none focus:border-primary-500 text-base games-focus-ring games-input"
                  aria-invalid={!!addError}
                  aria-describedby={addError ? 'roulette-add-error' : undefined}
                />
                <button type="submit" disabled={players.length >= MAX_PLAYERS} className="shrink-0 min-h-[48px] min-w-[48px] px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-colors games-focus-ring" aria-label="新增玩家">
                  +
                </button>
              </div>
              {addError && <p id="roulette-add-error" className="text-red-400 text-sm w-full">{addError}</p>}
              <button type="button" onClick={() => setPlayers([])} className="min-h-[48px] min-w-[48px] px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg transition-colors text-sm games-focus-ring" aria-label="清空玩家名單">
                清空名單
              </button>
            </form>
          )}
        </div>
    )
}
