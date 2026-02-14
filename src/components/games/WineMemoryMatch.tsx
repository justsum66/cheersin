'use client'

import { useState, useCallback } from 'react'
import { Wine, RotateCcw } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import { usePunishmentCopy } from '@/hooks/usePunishmentCopy'
import GameRules from './GameRules'
import { WINE_PAIRS } from '@/data/wine-pairs'

/** R2-178：酒類配對記憶 — 翻牌配對酒款名與產區/風味，配錯喝一口 */

type CardSide = 'wine' | 'region'
interface Card {
  pairId: number
  side: CardSide
  label: string
}

function buildDeck(): Card[] {
  const cards: Card[] = []
  WINE_PAIRS.forEach((p, pairId) => {
    cards.push({ pairId, side: 'wine', label: p.wine })
    cards.push({ pairId, side: 'region', label: p.regionOrFlavor })
  })
  return cards.sort(() => Math.random() - 0.5)
}

export default function WineMemoryMatch() {
  const { play } = useGameSound()
  const punishment = usePunishmentCopy()
  const [cards, setCards] = useState<Card[]>(() => buildDeck())
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [wrongMessage, setWrongMessage] = useState(false)

  const allMatched = matched.length === cards.length && cards.length > 0

  const flip = useCallback(
    (index: number) => {
      if (flipped.length >= 2 || flipped.includes(index) || matched.includes(index) || wrongMessage) return
      const next = [...flipped, index]
      setFlipped(next)
      play('click')
      if (next.length === 2) {
        const [a, b] = next
        const cardA = cards[a]
        const cardB = cards[b]
        if (cardA.pairId === cardB.pairId) {
          setTimeout(() => {
            setMatched((m) => [...m, a, b])
            setFlipped([])
            play('correct')
          }, 400)
        } else {
          setWrongMessage(true)
          play('wrong')
          setTimeout(() => {
            setFlipped([])
            setWrongMessage(false)
          }, 1500)
        }
      }
    },
    [cards, flipped, matched, wrongMessage, play]
  )

  const restart = useCallback(() => {
    play('click')
    setCards(buildDeck())
    setFlipped([])
    setMatched([])
    setWrongMessage(false)
  }, [play])

  return (
    <div className="flex flex-col items-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="酒類配對記憶">
      <GameRules
        rules="翻開兩張牌：酒款名要配對正確的產區/風味，配對成功保留，配錯喝一口再蓋回。"
        rulesKey="wine-memory-match.rules"
      />
      <Wine className="w-12 h-12 text-primary-400 mb-2" />
      <p className="text-white/60 text-sm mb-2">酒類配對記憶</p>
      {wrongMessage && (
        <p className="text-red-300 text-sm font-medium mb-2 animate-pulse">配錯了～{punishment.drinkOne}！</p>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg w-full flex-1 content-start">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index)
          return (
            <button
              key={`${index}-${card.pairId}-${card.side}`}
              type="button"
              onClick={() => flip(index)}
              disabled={wrongMessage}
              className="aspect-[4/3] rounded-xl border-2 flex items-center justify-center text-center p-2 transition-all games-focus-ring min-h-0"
              style={{
                backgroundColor: isFlipped ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                borderColor: matched.includes(index) ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.2)',
              }}
            >
              <span className="text-white text-xs sm:text-sm font-medium line-clamp-3">
                {isFlipped ? card.label : '?'}
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="text-white/50 text-sm">已配對 {matched.length / 2} / {cards.length / 2}</span>
        <button type="button" onClick={restart} className="btn-secondary px-4 py-2 games-focus-ring inline-flex items-center gap-2 text-sm">
          <RotateCcw className="w-4 h-4" />
          重洗牌
        </button>
      </div>
      {allMatched && (
        <p className="text-primary-300 font-medium mt-2">全部配對完成！</p>
      )}
    </div>
  )
}
