'use client'

import { useState, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw, Check, X, Star } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

interface DareCard {
  dare: string
  penalty: number
}

const DARE_CARDS: DareCard[] = [
  { dare: '模仿一種動物叫三聲', penalty: 1 },
  { dare: '用腳趾頭夾起一個物品', penalty: 1 },
  { dare: '對著鏡子說「我愛你」三次', penalty: 1 },
  { dare: '讓右邊的人餵你喝一口酒', penalty: 2 },
  { dare: '用屁股寫出自己的名字', penalty: 1 },
  { dare: '學一個在場的人的招牌動作', penalty: 1 },
  { dare: '打電話給最近聯絡的人說「我想你」', penalty: 3 },
  { dare: '讓別人用手機拍一張醜照', penalty: 2 },
  { dare: '說出三個你的缺點', penalty: 1 },
  { dare: '做十個深蹲', penalty: 1 },
  { dare: '用歌聲自我介紹', penalty: 1 },
  { dare: '讓對面的人彈額頭', penalty: 2 },
  { dare: '說一個你的尷尬經歷', penalty: 1 },
  { dare: '閉眼旋轉五圈', penalty: 1 },
  { dare: '用舌頭舔自己的鼻子（或嘗試）', penalty: 1 },
  { dare: '即興表演30秒的舞蹈', penalty: 2 },
  { dare: '說出你手機相簿裡最近的照片是什麼', penalty: 2 },
  { dare: '用方言說一段繞口令', penalty: 1 },
  { dare: '讓左邊的人在你臉上畫東西', penalty: 3 },
  { dare: '對在場的人每人說一句誇獎', penalty: 1 },
]

/** G2.19-G2.20：大膽挑戰 - 抽挑戰卡，完成或喝酒 */
export default function DareCards() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [currentDare, setCurrentDare] = useState<DareCard | null>(null)
  const [usedDares, setUsedDares] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<'complete' | 'drink' | null>(null)
  const [history, setHistory] = useState<Array<{ player: string; dare: string; completed: boolean }>>([])
  // GAME-069: Card flip animation state
  const [isFlipping, setIsFlipping] = useState(false)
  // GAME-070: Dare rating
  const [dareRatings, setDareRatings] = useState<Record<string, number>>({})

  const currentPlayer = players[currentPlayerIdx]

  const getNextDare = useCallback(() => {
    const available = DARE_CARDS.map((_, i) => i).filter(i => !usedDares.has(i))
    if (available.length === 0) {
      setUsedDares(new Set())
      return DARE_CARDS[Math.floor(Math.random() * DARE_CARDS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedDares(prev => new Set([...prev, idx]))
    return DARE_CARDS[idx]
  }, [usedDares])

  const drawCard = useCallback(() => {
    play('click')
    setIsFlipping(true)
    // GAME-069: Delay reveal for flip animation
    setTimeout(() => {
      setCurrentDare(getNextDare())
      setResult(null)
      setIsFlipping(false)
    }, 400)
  }, [getNextDare, play])

  const complete = useCallback(() => {
    if (!currentDare) return;
    play('correct')
    setResult('complete')
    setHistory(prev => [...prev, { player: currentPlayer, dare: currentDare.dare, completed: true }])
  }, [currentPlayer, currentDare, play])

  const drink = useCallback(() => {
    if (!currentDare) return;
    play('wrong')
    setResult('drink')
    setHistory(prev => [...prev, { player: currentPlayer, dare: currentDare.dare, completed: false }])
  }, [currentPlayer, currentDare, play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    setCurrentDare(null)
    setResult(null)
  }, [currentPlayerIdx, players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setCurrentDare(null)
    setUsedDares(new Set())
    setResult(null)
    setHistory([])
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`抽一張挑戰卡！\n完成挑戰或喝相應杯數！\n越難的挑戰，喝酒懲罰越多！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">大膽挑戰</h2>
      </div>

      <p className="text-white/70 mb-4">輪到 <span className="text-yellow-400 font-bold">{currentPlayer}</span></p>

      {!currentDare && !isFlipping ? (
        <m.button whileTap={{ scale: 0.96 }} onClick={drawCard} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl games-focus-ring">
          抽挑戰卡！
        </m.button>
      ) : isFlipping ? (
        /* GAME-069: Card flip animation */
        <m.div
          initial={reducedMotion ? false : { rotateY: 0 }}
          animate={{ rotateY: reducedMotion ? 0 : 180 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeInOut' }}
          className="w-full max-w-md h-40 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/30 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
        </m.div>
      ) : result === null ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          {/* GAME-069: Animated card reveal */}
          <AnimatePresence mode="wait">
            {currentDare && (
            <m.div
              key={currentDare.dare}
              initial={reducedMotion ? false : { rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
              className="w-full p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <p className="text-white text-xl font-medium">{currentDare.dare}</p>
              <p className="text-white/50 mt-2 text-sm">放棄懲罰：喝 {currentDare.penalty} 杯</p>
              {/* GAME-070: Dare difficulty rating */}
              <div className="flex items-center justify-center gap-1 mt-3" role="group" aria-label="挑戰難度評分">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDareRatings((prev) => ({ ...prev, [currentDare.dare]: star }))}
                    className="p-0.5 games-focus-ring rounded"
                    aria-label={`評 ${star} 星`}
                    aria-pressed={(dareRatings[currentDare.dare] ?? 0) >= star}
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${(dareRatings[currentDare.dare] ?? 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                    />
                  </button>
                ))}
                <span className="text-white/30 text-[10px] ml-1">難度</span>
              </div>
            </m.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <m.button
              whileTap={{ scale: 0.96 }}
              onClick={complete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold games-focus-ring"
            >
              <Check className="w-5 h-5" /> 完成！
            </m.button>
            <m.button
              whileTap={{ scale: 0.96 }}
              onClick={drink}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold games-focus-ring"
            >
              <X className="w-5 h-5" /> 喝酒！
            </m.button>
          </div>
        </div>
      ) : (
        <m.div 
          initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="text-center"
        >
          {result === 'complete' ? (
            <p className="text-emerald-400 font-bold text-2xl">挑戰成功！👏</p>
          ) : currentDare ? (
            <p className="text-red-400 font-bold text-2xl">{currentPlayer} 喝 {currentDare.penalty} 杯！</p>
          ) : null}
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={nextPlayer} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一位</button>
            {currentDare && <CopyResultButton text={`大膽挑戰：${currentDare.dare}\n${currentPlayer} ${result === 'complete' ? '完成挑戰' : `喝了 ${currentDare.penalty} 杯`}`} />}
          </div>
        </m.div>
      )}

      {history.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs max-h-24 overflow-auto">
          {history.slice(-3).map((h, i) => (
            <div key={i}>{h.player}: {h.completed ? '✓' : '🍺'}</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
