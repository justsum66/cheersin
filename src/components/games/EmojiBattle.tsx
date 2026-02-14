'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { Smile } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import { pickRandomEmojiBattle } from '@/data/emoji-battle'

/** R2-152：表情包大戰 — 情境＋多選表情包，大家投票決勝（本版：選最貼切後下一題） */
export default function EmojiBattle() {
  const { play } = useGameSound()
  const [round, setRound] = useState(() => pickRandomEmojiBattle())
  const [picked, setPicked] = useState<string | null>(null)

  const next = useCallback(() => {
    play('click')
    setRound(pickRandomEmojiBattle())
    setPicked(null)
  }, [play])

  const handlePick = useCallback(
    (emoji: string) => {
      if (picked) return
      play('correct')
      setPicked(emoji)
    },
    [picked, play]
  )

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="表情包大戰">
      <GameRules
        rules="根據情境選一個最貼切的表情，大家投票決勝或一起笑。"
        rulesKey="emoji-battle.rules"
      />
      <Smile className="w-12 h-12 text-secondary-400 mb-4" />
      <p className="text-white/60 text-sm mb-4">表情包大戰</p>

      <m.div
        key={round.scenario}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <p className="text-white font-medium mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          {round.scenario}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {round.options.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handlePick(emoji)}
              className={`min-h-[56px] min-w-[56px] text-3xl rounded-2xl border-2 transition-all games-focus-ring ${
                picked === emoji
                  ? 'border-primary-500 bg-primary-500/20 scale-110'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {picked && (
          <p className="text-white/60 text-sm mb-4">大家投票誰最貼切～</p>
        )}
        <button type="button" onClick={next} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring">
          下一題
        </button>
      </m.div>
    </div>
  )
}
