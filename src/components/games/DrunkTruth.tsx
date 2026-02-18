'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { Wine, RotateCcw, AlertTriangle } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const DRUNK_TRUTHS = [
  '說出你現在最想打電話給誰',
  '承認你現在腦中想的那個人',
  '說出你覺得在場誰最好看',
  '說出你覺得在場誰最有魅力',
  '說出你現在最想做的事',
  '說出你對現在這個聚會的真實感受',
  '說出你最想吐槽誰什麼事',
  '說出你最近最後悔的一件事',
  '說出你最想對誰說但沒說的話',
  '說出你覺得誰最可能喜歡你',
  '說出你最想告白的對象類型',
  '說出你最近最開心的事',
  '說出你最討厭的一種人',
  '說出你最想回到過去改變什麼',
  '說出你對自己最不滿意的地方',
  '說出你覺得誰最假',
  '說出你最想和誰交換生活一天',
  '說出你心裡的秘密',
  '說出你喝醉時會做什麼',
  '說出你最瘋狂的經歷',
]

/** G3.19-G3.20：酒後吐真言 - 微醺狀態的真心話 */
export default function DrunkTruth() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [ageVerified, setAgeVerified] = useState(false)
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [currentTruth, setCurrentTruth] = useState<string | null>(null)
  const [usedTruths, setUsedTruths] = useState<Set<number>>(new Set())
  const [answered, setAnswered] = useState(false)
  const [drinkCount, setDrinkCount] = useState<Record<string, number>>({})

  const currentPlayer = players[currentPlayerIdx]

  const getNextTruth = useCallback(() => {
    const available = DRUNK_TRUTHS.map((_, i) => i).filter(i => !usedTruths.has(i))
    if (available.length === 0) {
      setUsedTruths(new Set())
      return DRUNK_TRUTHS[Math.floor(Math.random() * DRUNK_TRUTHS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedTruths(prev => new Set([...prev, idx]))
    return DRUNK_TRUTHS[idx]
  }, [usedTruths])

  const startRound = useCallback(() => {
    play('click')
    setCurrentTruth(getNextTruth())
    setAnswered(false)
  }, [getNextTruth, play])

  const answer = useCallback(() => {
    play('correct')
    setAnswered(true)
  }, [play])

  const refuse = useCallback(() => {
    play('wrong')
    setDrinkCount(prev => ({ ...prev, [currentPlayer]: (prev[currentPlayer] || 0) + 2 }))
    setAnswered(true)
  }, [currentPlayer, play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    setCurrentTruth(null)
    setAnswered(false)
  }, [currentPlayerIdx, players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setCurrentTruth(null)
    setUsedTruths(new Set())
    setAnswered(false)
    setDrinkCount({})
  }, [])

  if (!ageVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
        <AlertTriangle className="w-16 h-16 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">酒後真言提醒</h2>
        <p className="text-white/60 text-center mb-6">此遊戲適合微醺狀態進行<br />請確認您已年滿 18 歲且適量飲酒</p>
        <m.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setAgeVerified(true)}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold games-focus-ring"
        >
          我已了解，開始遊戲
        </m.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`酒後吐真言！\n微醺狀態說出真心話。\n拒絕回答喝兩杯！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Wine className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-bold text-white">酒後吐真言</h2>
      </div>

      <p className="text-white/70 mb-4">輪到 <span className="text-amber-400 font-bold">{currentPlayer}</span></p>

      {!currentTruth ? (
        <m.button whileTap={{ scale: 0.96 }} onClick={startRound} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xl games-focus-ring">
          抽真心話
        </m.button>
      ) : !answered ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <m.div
            initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-center"
          >
            <p className="text-white text-xl font-medium">{currentTruth}</p>
          </m.div>

          <div className="flex gap-4">
            <m.button
              whileTap={{ scale: 0.96 }}
              onClick={answer}
              className="px-8 py-4 rounded-xl bg-emerald-500 text-white font-bold games-focus-ring"
            >
              我說完了
            </m.button>
            <m.button
              whileTap={{ scale: 0.96 }}
              onClick={refuse}
              className="px-8 py-4 rounded-xl bg-red-500 text-white font-bold games-focus-ring"
            >
              拒絕，喝兩杯
            </m.button>
          </div>
        </div>
      ) : (
        <m.div 
          initial={reducedMotion ? false : { y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="text-center"
        >
          <p className="text-emerald-400 font-bold text-xl mb-4">回答完成！</p>
          <div className="flex gap-3 justify-center">
            <button onClick={nextPlayer} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一位</button>
            <CopyResultButton text={`酒後吐真言：${currentPlayer}\n「${currentTruth}」`} />
          </div>
        </m.div>
      )}

      {Object.keys(drinkCount).length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          {Object.entries(drinkCount).map(([p, c]) => (
            <div key={p}>{p}: {c}杯</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
