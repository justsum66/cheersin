'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { Utensils, RotateCcw, Check, X } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const FOOD_TOPICS = [
  { topic: '最愛的深夜美食', category: '美食' },
  { topic: '最常叫的外送餐廳', category: '美食' },
  { topic: '最想去的餐廳', category: '美食' },
  { topic: '吃過最貴的一餐', category: '經歷' },
  { topic: '最討厭的食物', category: '美食' },
  { topic: '最想學會做的料理', category: '夢想' },
  { topic: '最愛的酒吧或夜店', category: '夜生活' },
  { topic: '最難忘的一次喝醉', category: '經歷' },
  { topic: '最喜歡的下酒菜', category: '美食' },
  { topic: '最常去的便利商店消夜', category: '美食' },
  { topic: '最想和誰一起吃消夜', category: '人物' },
  { topic: '減肥時最想吃什麼', category: '美食' },
  { topic: '分手後會吃什麼', category: '美食' },
  { topic: '開心時會吃什麼慶祝', category: '美食' },
  { topic: '最愛的飲料店', category: '美食' },
  { topic: '最常喝的酒類', category: '飲品' },
  { topic: '最不能接受的食物組合', category: '美食' },
  { topic: '童年最愛吃什麼', category: '回憶' },
  { topic: '最想去哪個國家吃美食', category: '夢想' },
  { topic: '最會做的一道菜', category: '技能' },
]

/** G3.21-G3.22：深夜食堂 - 美食話題分享 */
export default function LateNight() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [currentTopic, setCurrentTopic] = useState<typeof FOOD_TOPICS[0] | null>(null)
  const [usedTopics, setUsedTopics] = useState<Set<number>>(new Set())
  const [shared, setShared] = useState(false)
  const [likeCount, setLikeCount] = useState<Record<string, number>>({})

  const currentPlayer = players[currentPlayerIdx]

  const getNextTopic = useCallback(() => {
    const available = FOOD_TOPICS.map((_, i) => i).filter(i => !usedTopics.has(i))
    if (available.length === 0) {
      setUsedTopics(new Set())
      return FOOD_TOPICS[Math.floor(Math.random() * FOOD_TOPICS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedTopics(prev => new Set([...prev, idx]))
    return FOOD_TOPICS[idx]
  }, [usedTopics])

  const startRound = useCallback(() => {
    play('click')
    setCurrentTopic(getNextTopic())
    setShared(false)
  }, [getNextTopic, play])

  const share = useCallback((liked: boolean) => {
    if (liked) {
      play('correct')
      setLikeCount(prev => ({ ...prev, [currentPlayer]: (prev[currentPlayer] || 0) + 1 }))
    } else {
      play('click')
    }
    setShared(true)
  }, [currentPlayer, play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    setCurrentTopic(null)
    setShared(false)
  }, [currentPlayerIdx, players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setCurrentTopic(null)
    setUsedTopics(new Set())
    setShared(false)
    setLikeCount({})
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`深夜食堂時間！\n輪流分享美食話題。\n其他人給讚，最少讚喝酒！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Utensils className="w-6 h-6 text-orange-400" />
        <h2 className="text-xl font-bold text-white">深夜食堂</h2>
      </div>

      <p className="text-white/70 mb-4">輪到 <span className="text-orange-400 font-bold">{currentPlayer}</span></p>

      {!currentTopic ? (
        <m.button whileTap={{ scale: 0.96 }} onClick={startRound} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xl games-focus-ring">
          抽話題
        </m.button>
      ) : !shared ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 text-center"
          >
            <span className="text-xs text-orange-400/50 uppercase tracking-wider">{currentTopic.category}</span>
            <p className="text-white text-xl font-bold mt-2">{currentTopic.topic}</p>
          </m.div>

          <p className="text-white/50 text-sm mt-2">分享完後，其他人給評價</p>

          <div className="flex gap-4">
            <m.button
              whileTap={{ scale: 0.96 }}
              onClick={() => share(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold games-focus-ring"
            >
              <Check className="w-5 h-5" /> 分享很棒！
            </m.button>
            <m.button
              whileTap={{ scale: 0.96 }}
              onClick={() => share(false)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white/70 font-bold games-focus-ring"
            >
              <X className="w-5 h-5" /> 普普通通
            </m.button>
          </div>
        </div>
      ) : (
        <m.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          <p className="text-emerald-400 font-bold text-xl mb-4">分享完成！</p>
          <div className="flex gap-3 justify-center">
            <button onClick={nextPlayer} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一位</button>
            <CopyResultButton text={`深夜食堂：${currentPlayer}\n話題：${currentTopic.topic}`} />
          </div>
        </m.div>
      )}

      {Object.keys(likeCount).length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          <p className="mb-1">讚數排名：</p>
          {Object.entries(likeCount).sort((a, b) => b[1] - a[1]).map(([p, c]) => (
            <div key={p}>{p}: {c}讚</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
