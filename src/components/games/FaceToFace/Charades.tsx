'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4', '玩家 5']

const WORDS: string[] = [
  '喝酒', '乾杯', '跳舞', '唱歌', '跑步', '游泳', '吃飯', '睡覺', '打哈欠', '打噴嚏',
  '大象', '兔子', '猴子', '小鳥', '魚', '貓', '狗', '恐龍', '蝴蝶',
  '飛機', '火車', '腳踏車', '開車', '划船',
  '打電話', '拍照', '自拍', '滑手機',
  '電影', '麥克風', '吉他', '鋼琴',
]

/** R2-143：難度對應秒數；R2-167：禁語模式（比劃者不能說關鍵詞） */
const DIFFICULTY_SECONDS = { easy: 30, medium: 20, hard: 10 } as const
type Difficulty = keyof typeof DIFFICULTY_SECONDS

/** 比手畫腳酒桌版：一人比劃、多人猜，猜錯的人喝。R2-143 計時與難度；R2-167 禁語模式。 */
export default function Charades() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'acting' | 'result'>('idle')
  const [actorIndex, setActorIndex] = useState(0)
  const [word, setWord] = useState('')
  const [guess, setGuess] = useState('')
  const [wrongCount, setWrongCount] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [forbiddenWord, setForbiddenWord] = useState('')
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRound = useCallback(() => {
    play('click')
    const w = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWord(w)
    setGuess('')
    setWrongCount(0)
    setActorIndex((i) => (i + 1) % players.length)
    setSecondsLeft(DIFFICULTY_SECONDS[difficulty])
    setPhase('acting')
  }, [players.length, play, difficulty])

  /** R2-143：計時器；最後 5 秒 R2-135 時間壓力音效 */
  useEffect(() => {
    if (phase !== 'acting' || secondsLeft === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          play('wrong')
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200)
          setPhase('result')
          return null
        }
        if (s >= 1 && s <= 5) play('countdown')
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, secondsLeft, play])

  const submitGuess = useCallback(() => {
    const g = guess.trim().toLowerCase()
    const w = word.toLowerCase()
    if (g === w) {
      play('correct')
      setPhase('result')
      return
    }
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    setWrongCount((c) => c + 1)
    setGuess('')
  }, [guess, word, play])

  const nextRound = useCallback(() => setPhase('idle'), [])

  useEffect(() => {
    if (phase !== 'result') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') nextRound() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, nextRound])

  const actorName = players[actorIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="比手畫腳">
      <GameRules
        rules={`系統隨機選一人當「比劃者」，抽一個詞只能用動作表現，不能出聲。\n其他人猜，猜對換下一位比劃；猜錯的人喝一杯，繼續猜。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">比手畫腳</p>

      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
          <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="難度">
            {(Object.keys(DIFFICULTY_SECONDS) as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
                className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl text-sm font-medium games-focus-ring ${difficulty === d ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
              >
                {d === 'easy' ? '簡單 30s' : d === 'medium' ? '中等 20s' : '困難 10s'}
              </button>
            ))}
          </div>
          <div className="w-full">
            <label className="text-white/60 text-sm block mb-1">R2-167 禁語（選填，比劃者不能說）</label>
            <input
              type="text"
              value={forbiddenWord}
              onChange={(e) => setForbiddenWord(e.target.value)}
              placeholder="例：酒、喝"
              className="w-full min-h-[48px] px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm games-focus-ring"
              aria-label="禁語"
            />
          </div>
          <m.button
            type="button"
            className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
            onClick={startRound}
            whileTap={{ scale: 0.98 }}
          >
            開始
          </m.button>
        </div>
      )}

      {phase === 'acting' && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md w-full">
          <p className="text-white/70 mb-2">比劃者：<span className="font-bold text-primary-300">{actorName}</span></p>
          {secondsLeft !== null && (
            <p className="text-white/80 font-mono text-lg mb-1" role="timer" aria-live="polite">
              剩餘 {secondsLeft} 秒 {secondsLeft <= 5 ? '— 快！' : ''}
            </p>
          )}
          {forbiddenWord.trim() && (
            <p className="text-amber-400/90 text-sm mb-2">禁語：<strong>{forbiddenWord.trim()}</strong>（比劃時不能說）</p>
          )}
          <p className="text-white/40 text-sm mb-4">其他人輸入答案猜（比劃者不能看）</p>
          <p className="text-red-400/80 text-sm mb-2">猜錯次數：{wrongCount}（猜錯的人喝）</p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
              placeholder="輸入答案"
              className="flex-1 min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={submitGuess}
            >
              送出
            </button>
          </div>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white text-sm games-focus-ring"
            onClick={() => setPhase('result')}
          >
            跳過／揭曉
          </button>
        </m.div>
      )}

      {phase === 'result' && (
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-2">答案：<span className="font-bold text-primary-300">{word}</span></p>
            <p className="text-white/50 text-sm mb-4">本輪猜錯 {wrongCount} 次，猜錯的人各喝一杯</p>
            <CopyResultButton
              text={`比手畫腳：答案「${word}」，本輪猜錯 ${wrongCount} 次`}
              className="mb-4 games-focus-ring"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={nextRound}
            >
              下一輪
            </button>
          </m.div>
        </AnimatePresence>
      )}
    </div>
  )
}
