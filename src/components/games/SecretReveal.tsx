'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, RotateCcw, Timer, ThumbsUp, ThumbsDown } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import {
  getPromptsByCategory,
  CATEGORY_LABEL,
  type SecretRevealCategory,
  type SecretRevealPrompt,
} from '@/lib/secret-reveal'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const TELL_SECONDS = 60

const CATEGORY_OPTIONS: { value: SecretRevealCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  ...(Object.entries(CATEGORY_LABEL) as [SecretRevealCategory, string][]).map(([value, label]) => ({ value, label })),
]

/** 236–245：秘密爆料遊戲：輪流分享秘密、其他人猜真假、猜錯喝、說謊被抓喝兩倍、60 秒講述、投票、統計 */
export default function SecretReveal() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [categoryFilter, setCategoryFilter] = useState<SecretRevealCategory | 'all'>('all')
  const [pool, setPool] = useState<SecretRevealPrompt[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [storytellerIndex, setStorytellerIndex] = useState(0)
  const [phase, setPhase] = useState<'choose' | 'tell' | 'vote' | 'result' | 'gameEnd'>('choose')
  const [secondsLeft, setSecondsLeft] = useState(TELL_SECONDS)
  const [votes, setVotes] = useState<Record<number, boolean>>({})
  const [actualTruth, setActualTruth] = useState<boolean | null>(null)
  const [stats, setStats] = useState<{ told: number; correct: number; wrong: number }>({ told: 0, correct: 0, wrong: 0 })
  const tellIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prompts = useMemo(() => getPromptsByCategory(categoryFilter), [categoryFilter])
  const currentPrompt = pool[currentIndex] ?? null

  const startRound = useCallback(() => {
    play('click')
    const shuffled = [...prompts].sort(() => Math.random() - 0.5)
    setPool(shuffled.length > 0 ? shuffled : prompts)
    setCurrentIndex(0)
    setPhase('tell')
    setSecondsLeft(TELL_SECONDS)
    setVotes({})
    setActualTruth(null)
  }, [prompts, play])

  const handleCategoryChange = useCallback((value: SecretRevealCategory | 'all') => {
    setCategoryFilter(value)
    setPool([])
    setCurrentIndex(0)
    setPhase('choose')
  }, [])

  /** 講述階段：單一 1s interval，倒數到 0 時自清；unmount 或 phase 變更時 cleanup */
  useEffect(() => {
    if (phase !== 'tell') return
    tellIntervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 0) {
          if (tellIntervalRef.current) {
            clearInterval(tellIntervalRef.current)
            tellIntervalRef.current = null
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (tellIntervalRef.current) {
        clearInterval(tellIntervalRef.current)
        tellIntervalRef.current = null
      }
    }
  }, [phase])

  const goToVote = useCallback(() => {
    setPhase('vote')
  }, [])

  const setVote = useCallback((playerIndex: number, value: boolean) => {
    play('click')
    setVotes((prev) => ({ ...prev, [playerIndex]: value }))
  }, [play])

  const revealAndNext = useCallback(
    (truth: boolean) => {
      play('win')
      setActualTruth(truth)
      const voterIndices = Object.keys(votes).map(Number).filter((i) => i !== storytellerIndex)
      let wrongCount = 0
      voterIndices.forEach((i) => {
        if (votes[i] !== truth) wrongCount++
      })
      if (wrongCount > 0 && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      setStats((s) => ({ ...s, told: s.told + 1, correct: s.correct + (voterIndices.length - wrongCount), wrong: s.wrong + wrongCount }))
      setPhase('result')
    },
    [votes, storytellerIndex, play]
  )

  const nextPrompt = useCallback(() => {
    setActualTruth(null)
    setVotes({})
    if (currentIndex + 1 < pool.length) {
      setCurrentIndex((i) => i + 1)
      setStorytellerIndex((i) => (i + 1) % players.length)
      setSecondsLeft(TELL_SECONDS)
      setPhase('tell')
    } else {
      setPhase('gameEnd')
    }
  }, [currentIndex, pool.length, players.length])

  const backToChoose = useCallback(() => {
    setPhase('choose')
    setPool([])
    setCurrentIndex(0)
  }, [])

  const hasPrompts = prompts.length > 0
  if (!hasPrompts) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4">
        <GameRules rules="秘密爆料：一人抽題後用約 60 秒講一個秘密（真或假），其他人投票猜真假；猜錯的人喝一口，說謊被抓包的人喝兩口。" />
        <p className="text-white/50 text-sm mt-4">題庫載入中…</p>
      </div>
    )
  }

  if (phase === 'choose' && pool.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4">
        <GameRules rules="秘密爆料：一人抽題後用約 60 秒講一個秘密（真或假），其他人投票猜真假；猜錯的人喝一口，說謊被抓包的人喝兩口。" />
        <div className="mt-4 w-full max-w-md space-y-4">
          <p className="text-white/60 text-sm">選擇分類</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleCategoryChange(value)}
                className={`min-h-[48px] px-4 py-2 rounded-xl text-sm font-medium ${
                  categoryFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={startRound} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5" />
            開始遊戲
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'tell' && currentPrompt) {
    return (
      <div className="h-full flex flex-col items-center py-4 px-4">
        <GameRules rules="秘密爆料：講述者用約 60 秒講一個秘密（真或假），講完後其他人投票。" />
        <p className="text-white/50 text-sm mt-2">講述者：{players[storytellerIndex]}</p>
        <motion.div
          key={currentPrompt.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg text-center mt-4"
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 px-4">{currentPrompt.text}</h2>
          {(currentPrompt as { level?: string }).level && (
            <p className="text-white/40 text-xs mb-2">秘密分級：{(currentPrompt as { level?: string }).level === 'bold' ? '大膽' : (currentPrompt as { level?: string }).level === 'mild' ? '溫和' : '普通'}</p>
          )}
          <div className={`flex items-center justify-center gap-2 ${secondsLeft <= 5 ? 'text-red-400' : 'text-primary-400'}`}>
            <Timer className="w-5 h-5" />
            <span className="font-mono text-lg tabular-nums" role="timer" aria-live="polite">{secondsLeft} 秒</span>
          </div>
          <button
            type="button"
            onClick={goToVote}
            className="mt-6 min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold"
          >
            講完了，開始投票
          </button>
        </motion.div>
      </div>
    )
  }

  if (phase === 'vote' && currentPrompt) {
    const voterIndices = players.map((_, i) => i).filter((i) => i !== storytellerIndex)
    return (
      <div className="h-full flex flex-col items-center py-4 px-4">
        <p className="text-white/50 text-sm">猜猜 {players[storytellerIndex]} 講的是真是假？</p>
        <p className="text-white/80 text-lg mt-2 px-4">{currentPrompt.text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {voterIndices.map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-white/60 text-sm">{players[i]}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVote(i, true)}
                  className={`min-h-[48px] min-w-[48px] p-2 rounded-xl ${votes[i] === true ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}
                  title="真"
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setVote(i, false)}
                  className={`min-h-[48px] min-w-[48px] p-2 rounded-xl ${votes[i] === false ? 'bg-secondary-500 text-white' : 'bg-white/10 text-white/60'}`}
                  title="假"
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs mt-4">講述者點擊下方揭露真相</p>
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => revealAndNext(true)}
            className="min-h-[48px] px-6 py-2 rounded-xl bg-green-500/30 text-green-300 border border-green-500/50"
          >
            是真的
          </button>
          <button
            type="button"
            onClick={() => revealAndNext(false)}
            className="min-h-[48px] px-6 py-2 rounded-xl bg-red-500/30 text-red-300 border border-red-500/50"
          >
            是假的
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && currentPrompt && actualTruth !== null) {
    const voterIndices = players.map((_, i) => i).filter((i) => i !== storytellerIndex)
    const wrongVoters = voterIndices.filter((i) => votes[i] !== actualTruth)
    const isShocking = actualTruth === true && wrongVoters.length > voterIndices.length / 2
    return (
      <div className="h-full flex flex-col items-center py-4 px-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-full max-w-lg text-center p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          {isShocking && (
            <p className="text-accent-400 font-bold text-sm mb-2 px-3 py-1 rounded-full bg-accent-500/20 inline-block">太勁爆！</p>
          )}
          <p className="text-primary-400 font-bold text-lg mb-2">真相：{actualTruth ? '真的' : '假的'}</p>
          {wrongVoters.length > 0 ? (
            <p className="text-white/80 mb-2">猜錯的人喝一口：{wrongVoters.map((i) => players[i]).join('、')}</p>
          ) : (
            <p className="text-white/60 mb-2">大家都猜對了！</p>
          )}
          <p className="text-white/40 text-sm">本輪統計：已講 {stats.told} 則，猜對 {stats.correct} 次，猜錯 {stats.wrong} 次</p>
          <CopyResultButton
            text={`秘密爆料：真相${actualTruth ? '真的' : '假的'}，猜錯：${wrongVoters.map((i) => players[i]).join('、')}`}
            className="mt-3"
          />
        </motion.div>
        <button
          type="button"
          onClick={nextPrompt}
          className="mt-6 min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold"
        >
          {currentIndex + 1 < pool.length ? '下一題' : '結束本輪'}
        </button>
      </div>
    )
  }

  if (phase === 'gameEnd') {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4 px-4">
        <GameRules rules="秘密爆料：遊戲結束" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
        >
          <p className="text-primary-400 font-bold text-xl mb-4">遊戲結束統計</p>
          <p className="text-white/80 mb-2">共講述 {stats.told} 則</p>
          <p className="text-white/80 mb-2">猜對 {stats.correct} 次</p>
          <p className="text-white/80 mb-4">猜錯 {stats.wrong} 次</p>
          <CopyResultButton
            text={`秘密爆料 遊戲結束：共講述 ${stats.told} 則，猜對 ${stats.correct} 次，猜錯 ${stats.wrong} 次`}
            label="複製統計"
            className="mb-4"
          />
          <button
            type="button"
            onClick={backToChoose}
            className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold"
          >
            再玩一輪
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-4">
      <button type="button" onClick={() => setPhase('choose')} className="min-h-[48px] px-6 py-2 rounded-xl bg-white/10 text-white/80 flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        重選分類
      </button>
    </div>
  )
}
