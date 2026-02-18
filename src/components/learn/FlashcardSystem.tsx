'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle, CheckCircle, XCircle } from 'lucide-react'

export interface Flashcard {
  id: string
  front: string
  back: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface FlashcardSystemProps {
  cards: Flashcard[]
  /** Callback when user rates a card */
  onRate?: (cardId: string, rating: 'easy' | 'hard' | 'again') => void
  /** Show difficulty rating buttons */
  showRating?: boolean
  /** Enable shuffle */
  shuffleable?: boolean
  className?: string
}

/** LEARN-016: Flashcard system for spaced repetition learning */
export const FlashcardSystem = memo(function FlashcardSystem({
  cards,
  onRate,
  showRating = true,
  shuffleable = true,
  className = '',
}: FlashcardSystemProps) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [deck, setDeck] = useState(cards)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const reducedMotion = useReducedMotion()

  const currentCard = deck[index]
  const progress = deck.length > 0 ? ((index + 1) / deck.length) * 100 : 0

  const flip = useCallback(() => setIsFlipped(p => !p), [])

  const next = useCallback(() => {
    setIsFlipped(false)
    setIndex(i => Math.min(i + 1, deck.length - 1))
  }, [deck.length])

  const prev = useCallback(() => {
    setIsFlipped(false)
    setIndex(i => Math.max(i - 1, 0))
  }, [])

  const shuffle = useCallback(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5)
    setDeck(shuffled)
    setIndex(0)
    setIsFlipped(false)
  }, [deck])

  const rate = useCallback((rating: 'easy' | 'hard' | 'again') => {
    if (!currentCard) return
    onRate?.(currentCard.id, rating)
    if (rating !== 'again') {
      setCompleted(p => new Set(p).add(currentCard.id))
    }
    next()
  }, [currentCard, onRate, next])

  if (deck.length === 0) {
    return (
      <div className={`text-center text-white/40 py-8 ${className}`}>
        沒有卡片可以學習
      </div>
    )
  }

  const isComplete = index >= deck.length - 1 && completed.size === deck.length

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-1 text-xs text-white/50">
          <span>{index + 1} / {deck.length}</span>
          <span>{completed.size} 已掌握</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <m.div
            className="h-full rounded-full bg-primary-500"
            animate={{ width: `${progress}%` }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md h-64 cursor-pointer perspective-1000"
        onClick={flip}
        role="button"
        aria-label={isFlipped ? '顯示正面' : '翻轉查看答案'}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip() } }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={`${currentCard?.id}-${isFlipped ? 'back' : 'front'}`}
            initial={reducedMotion ? { opacity: 1 } : { rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className={`absolute inset-0 rounded-2xl border p-6 flex flex-col items-center justify-center text-center backface-hidden ${
              isFlipped
                ? 'bg-gradient-to-br from-primary-900/40 to-primary-800/20 border-primary-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
              {isFlipped ? '答案' : '問題'}
            </span>
            <p className={`text-lg font-medium leading-relaxed ${isFlipped ? 'text-primary-200' : 'text-white'}`}>
              {isFlipped ? currentCard?.back : currentCard?.front}
            </p>
            {currentCard?.category && (
              <span className="mt-4 px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/40">
                {currentCard.category}
              </span>
            )}
            <span className="absolute bottom-3 text-[10px] text-white/20">
              {isFlipped ? '點擊回到正面' : '點擊翻轉'}
            </span>
          </m.div>
        </AnimatePresence>
      </div>

      {/* Rating buttons (only when flipped) */}
      {showRating && isFlipped && (
        <m.div
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            type="button"
            onClick={() => rate('again')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors games-touch-target games-focus-ring"
          >
            <XCircle className="w-4 h-4" /> 再看一次
          </button>
          <button
            type="button"
            onClick={() => rate('hard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm font-medium hover:bg-yellow-500/30 transition-colors games-touch-target games-focus-ring"
          >
            有點難
          </button>
          <button
            type="button"
            onClick={() => rate('easy')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors games-touch-target games-focus-ring"
          >
            <CheckCircle className="w-4 h-4" /> 已掌握
          </button>
        </m.div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors games-touch-target games-focus-ring disabled:opacity-30"
          aria-label="上一張"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {shuffleable && (
          <button
            type="button"
            onClick={shuffle}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors games-touch-target games-focus-ring"
            aria-label="隨機排列"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => { setIsFlipped(false); setIndex(0); setCompleted(new Set()) }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors games-touch-target games-focus-ring"
          aria-label="重新開始"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={index >= deck.length - 1}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors games-touch-target games-focus-ring disabled:opacity-30"
          aria-label="下一張"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Completion message */}
      {isComplete && (
        <m.div
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
        >
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-300 font-medium">全部完成！</p>
          <p className="text-white/50 text-sm mt-1">已掌握 {completed.size} 張卡片</p>
        </m.div>
      )}
    </div>
  )
})
