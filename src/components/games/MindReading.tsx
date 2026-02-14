'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { Sparkles, RotateCcw, Check, X } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

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
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [targetIdx, setTargetIdx] = useState(0)
  const [currentTopic, setCurrentTopic] = useState<typeof MIND_READ_TOPICS[0] | null>(null)
  const [usedTopics, setUsedTopics] = useState<Set<number>>(new Set())
  const [targetAnswer, setTargetAnswer] = useState<string | null>(null)
  const [guesses, setGuesses] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})

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
    // Count correct guesses
    Object.entries(guesses).forEach(([player, guess]) => {
      if (guess === targetAnswer) {
        setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }))
      }
    })
  }, [guesses, targetAnswer, play])

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
        <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full max-w-md">
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
            <div key={p}>{p}: {s}分</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
