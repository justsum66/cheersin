'use client'

import { useState } from 'react'

/** 156–160 知識卡片：正面問題、背面答案，點擊翻面 */
interface KnowledgeCardFlipProps {
  front: string
  back: string
  className?: string
}

export default function KnowledgeCardFlip({ front, back, className = '' }: KnowledgeCardFlipProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className={`block w-full text-left rounded-xl border border-white/10 overflow-hidden transition-all hover:border-primary-500/30 min-h-[100px] games-focus-ring ${className}`}
      aria-expanded={flipped}
      aria-label={flipped ? '點擊看問題' : '點擊看答案'}
    >
      <div className="p-4 bg-white/5">
        <p className="text-white/90 text-sm font-medium leading-relaxed games-body">{flipped ? back : front}</p>
        <p className="text-white/40 text-xs mt-2">{flipped ? '點擊看問題' : '點擊看答案'}</p>
      </div>
    </button>
  )
}
