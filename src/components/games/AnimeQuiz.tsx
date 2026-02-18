'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { MessageCircle, Check, X, HelpCircle } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGameReduceMotion } from './GameWrapper'
import { pickRandomAnimeQuiz, getAnimeSeriesCategories, type AnimeQuizItem } from '@/data/anime-quiz'

const ROUND_SIZE = 6
/** GAME-098: Available series categories */
const SERIES_CATS = getAnimeSeriesCategories()

/** R2-142：動漫猜謎喝酒遊戲 — 台詞/語錄猜出處，猜錯喝一口；與真假新聞/誰說的同模式 */
export default function AnimeQuiz() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [items, setItems] = useState<AnimeQuizItem[]>(() => pickRandomAnimeQuiz(ROUND_SIZE))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  /** GAME-097: Track whether hint is shown */
  const [hintShown, setHintShown] = useState(false)
  /** GAME-098: Selected series filter */
  const [seriesFilter, setSeriesFilter] = useState<string | null>(null)

  const item = items[index]
  const correct = item && picked !== null && item.options[picked] === item.source

  const handlePick = useCallback(
    (optIndex: number) => {
      if (picked !== null || !item) return
      setPicked(optIndex)
      setRevealed(true)
      const right = item.options[optIndex] === item.source
      play(right ? 'correct' : 'wrong')
      if (!right && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    },
    [picked, item, play]
  )

  const next = useCallback(() => {
    play('click')
    setPicked(null)
    setRevealed(false)
    setHintShown(false)
    if (index < items.length - 1) setIndex((i) => i + 1)
  }, [index, items.length, play])

  const restart = useCallback(() => {
    play('click')
    setItems(pickRandomAnimeQuiz(ROUND_SIZE, seriesFilter ?? undefined))
    setIndex(0)
    setPicked(null)
    setRevealed(false)
    setHintShown(false)
  }, [play, seriesFilter])

  /** GAME-098: Change series filter and restart */
  const changeFilter = useCallback((cat: string | null) => {
    setSeriesFilter(cat)
    setItems(pickRandomAnimeQuiz(ROUND_SIZE, cat ?? undefined))
    setIndex(0)
    setPicked(null)
    setRevealed(false)
    setHintShown(false)
  }, [])

  const isLast = index >= items.length - 1

  return (
    <div className="flex flex-col items-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="動漫猜謎">
      <GameRules
        rules="看台詞或語錄從選項中猜出處（作品名），猜錯揭曉後喝一口。"
        rulesKey="anime-quiz.rules"
      />
      <MessageCircle className="w-12 h-12 text-accent-400 mb-2" />
      <p className="text-white/60 text-sm mb-2">動漫猜謎</p>
      <p className="text-white/50 text-xs mb-4">第 {index + 1} / {items.length} 題</p>

      {/** GAME-098: Series filter chips */}
      <div className="flex flex-wrap gap-1 mb-3 justify-center">
        <button
          type="button"
          onClick={() => changeFilter(null)}
          className={`px-2 py-0.5 rounded-full text-xs games-focus-ring ${seriesFilter === null ? 'bg-accent-500/30 text-accent-300 border border-accent-500/50' : 'bg-white/10 text-white/50'}`}
        >
          全部
        </button>
        {SERIES_CATS.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => changeFilter(cat)}
            className={`px-2 py-0.5 rounded-full text-xs games-focus-ring ${seriesFilter === cat ? 'bg-accent-500/30 text-accent-300 border border-accent-500/50' : 'bg-white/10 text-white/50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {item && (
        <m.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <p className="text-white font-medium text-center italic">「{item.quote}」</p>
            {/** GAME-097: Hint button */}
            {item.hint && !hintShown && !revealed && (
              <button
                type="button"
                onClick={() => setHintShown(true)}
                className="mt-2 mx-auto flex items-center gap-1 text-xs text-white/40 hover:text-white/60 games-focus-ring"
              >
                <HelpCircle className="w-3 h-3" /> 提示
              </button>
            )}
            {hintShown && item.hint && (
              <p className="mt-2 text-center text-xs text-amber-400/80">💡 {item.hint}</p>
            )}
          </div>
          {!revealed ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {item.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePick(i)}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white games-focus-ring hover:bg-white/15"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <p className="text-white/80 mb-1">出處：{item.source}</p>
                <p className={`text-lg font-bold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
                  {correct ? (
                    <span className="inline-flex items-center gap-2"><Check className="w-5 h-5" /> 答對</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><X className="w-5 h-5" /> 答錯～喝一口</span>
                  )}
                </p>
                {!correct && !reducedMotion && <DrinkingAnimation duration={1.2} className="mx-auto my-3" />}
                {isLast ? (
                  <button type="button" onClick={restart} className="btn-primary min-h-[48px] px-6 py-3 mt-4 games-focus-ring">再玩一輪</button>
                ) : (
                  <button type="button" onClick={next} className="btn-primary min-h-[48px] px-6 py-3 mt-4 games-focus-ring">下一題</button>
                )}
              </m.div>
            </AnimatePresence>
          )}
        </m.div>
      )}
    </div>
  )
}
