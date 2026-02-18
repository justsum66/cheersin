'use client'

import { useState, useCallback, useEffect } from 'react'
import { m } from 'framer-motion'
import { Sparkles, RotateCcw, Check, X, Flame, History } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGameReduceMotion } from './GameWrapper'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const MIND_READ_TOPICS = [
  { topic: '我今天心情如何？', options: ['很好', '普通', '不太好', '超興奮'] },
  { topic: '我最想去哪個地方旅行？', options: ['日本', '歐洲', '美國', '海島'] },
  { topic: '我最喜歡什麼類型的電影？', options: ['喜劇', '愛情', '動作', '恐怖'] },
  { topic: '我壓力大時會做什麼？', options: ['吃東西', '睡覺', '運動', '追劇'] },
  { topic: '我最討厭的天氣是？', options: ['下雨', '太熱', '太冷', '颱風'] },
  { topic: '我最喜歡的季節？', options: ['春天', '夏天', '秋天', '冬天'] },
  { topic: '我理想的週末是？', options: ['宅在家', '出門玩', '和朋友聚會', '一個人靜一靜'] },
  { topic: '我最害怕什麼動物？', options: ['蜘蛛', '蛇', '蟑螂', '老鼠'] },
  { topic: '我最喜歡什麼顏色？', options: ['藍色', '粉色', '黑色', '綠色'] },
  { topic: '我最常用的社群平台？', options: ['IG', 'FB', 'Twitter', '抖音'] },
]

/** G3.15-G3.16：讀心術 - 猜測他人的選擇 */
export default function MindReading() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [targetIdx, setTargetIdx] = useState(0)
  const [currentTopic, setCurrentTopic] = useState<typeof MIND_READ_TOPICS[0] | null>(null)
  const [usedTopics, setUsedTopics] = useState<Set<number>>(new Set())
  const [targetAnswer, setTargetAnswer] = useState<string | null>(null)
  const [guesses, setGuesses] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  /** GAME-105: Score history — track round-by-round results */
  const [scoreHistory, setScoreHistory] = useState<{ round: number; player: string; correct: boolean }[]>([])
  const [showHistory, setShowHistory] = useState(false)
  /** GAME-106: Streak bonus tracking — 2+ correct in a row = +1 bonus */
  const [streaks, setStreaks] = useState<Record<string, number>>({})

  const target = players[targetIdx]
  const otherPlayers = players.filter((_, i) => i !== targetIdx)

  const getNextTopic = useCallback(() => {
    const available = MIND_READ_TOPICS.map((_, i) => i).filter(i => !usedTopics.has(i))
    if (available.length === 0) {
      setUsedTopics(new Set())
      return MIND_READ_TOPICS[Math.floor(Math.random() * MIND_READ_TOPICS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedTopics(prev => new Set([...prev, idx]))
    return MIND_READ_TOPICS[idx]
  }, [usedTopics])

  const startRound = useCallback(() => {
    play('click')
    setCurrentTopic(getNextTopic())
    setTargetAnswer(null)
    setGuesses({})
    setRevealed(false)
  }, [getNextTopic, play])

  const selectAnswer = useCallback((answer: string) => {
    play('click')
    setTargetAnswer(answer)
  }, [play])

  const makeGuess = useCallback((player: string, guess: string) => {
    play('click')
    setGuesses(prev => ({ ...prev, [player]: guess }))
  }, [play])

  const reveal = useCallback(() => {
    play('correct')
    setRevealed(true)
    const roundNum = scoreHistory.length + 1
    // Count correct guesses with streak bonus
    Object.entries(guesses).forEach(([player, guess]) => {
      const isCorrect = guess === targetAnswer
      setScoreHistory(prev => [...prev, { round: roundNum, player, correct: isCorrect }])
      if (isCorrect) {
        const currentStreak = (streaks[player] || 0) + 1
        setStreaks(prev => ({ ...prev, [player]: currentStreak }))
        /** GAME-106: Streak bonus — 2+ consecutive correct = +1 bonus point */
        const bonus = currentStreak >= 2 ? 1 : 0
        setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 + bonus }))
      } else {
        setStreaks(prev => ({ ...prev, [player]: 0 }))
      }
    })
  }, [guesses, targetAnswer, play, scoreHistory.length, streaks])

  const nextRound = useCallback(() => {
    setTargetIdx((targetIdx + 1) % players.length)
    setCurrentTopic(null)
    setTargetAnswer(null)
    setGuesses({})
    setRevealed(false)
  }, [targetIdx, players.length])

  const resetGame = useCallback(() => {
    setTargetIdx(0)
    setCurrentTopic(null)
    setUsedTopics(new Set())
    setTargetAnswer(null)
    setGuesses({})
    setRevealed(false)
    setScores({})
    setScoreHistory([])
    setStreaks({})
    setShowHistory(false)
  }, [])

  const allGuessed = Object.keys(guesses).length === otherPlayers.length

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`目標玩家選擇答案（不說出來）\n其他人猜測他的選擇\n猜對得分，猜錯喝酒！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-violet-400" />
        <h2 className="text-xl font-bold text-white">讀心術</h2>
      </div>

      {!currentTopic ? (
        <div className="text-center">
          <p className="text-white/70 mb-4">猜猜 <span className="text-violet-400 font-bold">{target}</span> 的想法</p>
          <m.button whileTap={{ scale: 0.96 }} onClick={startRound} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-xl games-focus-ring">
            開始讀心！
          </m.button>
        </div>
      ) : !targetAnswer ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-white/50">只給 <span className="text-violet-400">{target}</span> 看</p>
          <p className="text-white text-lg text-center">{currentTopic.topic}</p>
          <div className="grid grid-cols-2 gap-2 w-full">
            {currentTopic.options.map(opt => (
              <button
                key={opt}
                onClick={() => selectAnswer(opt)}
                className="px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 games-focus-ring hover:bg-white/20"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : !revealed ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-white text-lg text-center">{currentTopic.topic}</p>
          <p className="text-violet-400 font-bold">{target} 已選好答案</p>
          
          <div className="w-full space-y-3 mt-4">
            {otherPlayers.map(p => (
              <div key={p} className="flex items-center gap-2">
                <span className="text-white/70 w-20">{p}:</span>
                {guesses[p] ? (
                  <span className="text-violet-400">{guesses[p]}</span>
                ) : (
                  <div className="flex gap-1 flex-1 flex-wrap">
                    {currentTopic.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => makeGuess(p, opt)}
                        className="px-2 py-1 text-sm rounded-lg bg-white/10 text-white/70 games-focus-ring hover:bg-white/20"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {allGuessed && (
            <button onClick={reveal} className="mt-4 px-6 py-3 rounded-xl bg-violet-500 text-white font-bold games-focus-ring">
              揭曉答案！
            </button>
          )}
        </div>
      ) : (
        <m.div initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={reducedMotion ? { duration: 0 } : undefined} className="text-center w-full max-w-md">
          <p className="text-white/50 mb-2">{currentTopic.topic}</p>
          <p className="text-violet-400 font-bold text-2xl mb-4">{target} 選了：{targetAnswer}</p>
          <div className="space-y-2">
            {Object.entries(guesses).map(([p, g]) => (
              <div key={p} className="flex items-center justify-center gap-2">
                <span className="text-white/70">{p}:</span>
                <span className={g === targetAnswer ? 'text-emerald-400' : 'text-red-400'}>
                  {g} {g === targetAnswer ? <Check className="inline w-4 h-4" /> : <X className="inline w-4 h-4" />}
                </span>
              </div>
            ))}
          </div>
          <p className="text-red-400 mt-4">猜錯的人喝酒！</p>
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={nextRound} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一輪</button>
            <CopyResultButton text={`讀心術：${currentTopic.topic}\n${target} 選了 ${targetAnswer}\n${Object.entries(guesses).map(([p, g]) => `${p}: ${g} ${g === targetAnswer ? '✓' : '✗'}`).join('\n')}`} />
          </div>
        </m.div>
      )}

      {Object.keys(scores).length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          {Object.entries(scores).map(([p, s]) => (
            <div key={p} className="flex items-center gap-1">
              {p}: {s}分
              {/** GAME-106: Show streak indicator */}
              {(streaks[p] || 0) >= 2 && <Flame className="w-3 h-3 text-orange-400 inline" />}
            </div>
          ))}
          {/** GAME-105: Score history toggle */}
          <button
            type="button"
            onClick={() => setShowHistory(h => !h)}
            className="mt-1 flex items-center gap-1 text-white/40 hover:text-white/60 games-focus-ring"
          >
            <History className="w-3 h-3" /> 歷史
          </button>
        </div>
      )}

      {/** GAME-105: Score history panel */}
      {showHistory && scoreHistory.length > 0 && (
        <div className="absolute bottom-16 left-4 bg-black/80 border border-white/10 rounded-xl p-3 max-h-40 overflow-y-auto text-xs text-white/60 w-56 z-10">
          <p className="text-white/40 mb-1 font-medium">歷史紀錄</p>
          {scoreHistory.slice().reverse().map((h, i) => (
            <div key={i} className="flex items-center gap-1 py-0.5">
              <span className={h.correct ? 'text-green-400' : 'text-red-400'}>
                {h.correct ? <Check className="w-3 h-3 inline" /> : <X className="w-3 h-3 inline" />}
              </span>
              <span>R{h.round} {h.player}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
