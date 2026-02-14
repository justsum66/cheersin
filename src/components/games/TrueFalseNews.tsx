'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Newspaper, Check, X } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGameReduceMotion } from './GameWrapper'
import { pickRandomTrueFalseNews, type TrueFalseNewsItem } from '@/data/true-false-news'

const ROUND_SIZE = 6

/** R2-154：真假新聞 — 展示標題→選真/假→揭曉，答錯喝 */
export default function TrueFalseNews() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [items, setItems] = useState<TrueFalseNewsItem[]>(() => pickRandomTrueFalseNews(ROUND_SIZE))
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<boolean | null>(null)
  const [revealed, setRevealed] = useState(false)

  const item = items[index]
  const correct = choice !== null && choice === item?.isTrue

  const handleChoose = useCallback(
    (value: boolean) => {
      if (choice !== null || !item) return
      setChoice(value)
      setRevealed(true)
      const right = value === item.isTrue
      play(right ? 'correct' : 'wrong')
      if (!right && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    },
    [choice, item, play]
  )

  const next = useCallback(() => {
    play('click')
    setChoice(null)
    setRevealed(false)
    if (index < items.length - 1) {
      setIndex((i) => i + 1)
    }
  }, [index, items.length, play])

  const restart = useCallback(() => {
    play('click')
    setItems(pickRandomTrueFalseNews(ROUND_SIZE))
    setIndex(0)
    setChoice(null)
    setRevealed(false)
  }, [play])

  const isLast = index >= items.length - 1
  const showResult = isLast && revealed

  return (
    <div className="flex flex-col items-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="真假新聞">
      <GameRules
        rules="看新聞標題判斷真或假，選錯揭曉後喝一口。"
        rulesKey="true-false-news.rules"
      />
      <Newspaper className="w-12 h-12 text-primary-400 mb-2" />
      <p className="text-white/60 text-sm mb-2">真假新聞</p>
      <p className="text-white/50 text-xs mb-4">
        第 {index + 1} / {items.length} 題
      </p>

      {item && (
        <m.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <p className="text-white font-medium text-center">{item.title}</p>
          </div>
          {!revealed ? (
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => handleChoose(true)}
                className="min-h-[48px] px-8 py-3 rounded-xl bg-green-500/30 border-2 border-green-500 text-white font-bold games-focus-ring hover:bg-green-500/50"
              >
                真
              </button>
              <button
                type="button"
                onClick={() => handleChoose(false)}
                className="min-h-[48px] px-8 py-3 rounded-xl bg-red-500/30 border-2 border-red-500 text-white font-bold games-focus-ring hover:bg-red-500/50"
              >
                假
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-white/80 mb-1">答案：{item.isTrue ? '真' : '假'}</p>
                <p className={`text-lg font-bold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
                  {correct ? (
                    <span className="inline-flex items-center gap-2"><Check className="w-5 h-5" /> 答對</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><X className="w-5 h-5" /> 答錯～喝一口</span>
                  )}
                </p>
                {!correct && !reducedMotion && <DrinkingAnimation duration={1.2} className="mx-auto my-3" />}
                {isLast ? (
                  <button type="button" onClick={restart} className="btn-primary min-h-[48px] px-6 py-3 mt-4 games-focus-ring">
                    再玩一輪
                  </button>
                ) : (
                  <button type="button" onClick={next} className="btn-primary min-h-[48px] px-6 py-3 mt-4 games-focus-ring">
                    下一題
                  </button>
                )}
              </m.div>
            </AnimatePresence>
          )}
        </m.div>
      )}
    </div>
  )
}
