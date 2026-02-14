'use client'

/**
 * R2-065：翻牌動畫 — 3D 翻轉 (rotateY 0→180deg)，適用於國王遊戲等需翻牌的遊戲
 */
import { useState } from 'react'
import { m , AnimatePresence } from 'framer-motion'

export interface FlipCardProps {
  /** 正面內容 */
  front: React.ReactNode
  /** 背面內容 */
  back: React.ReactNode
  /** 是否顯示背面（翻轉後） */
  flipped?: boolean
  /** 點擊切換翻面 */
  onFlip?: () => void
  className?: string
  /** 無障礙：背面說明 */
  backAriaLabel?: string
  frontAriaLabel?: string
}

export function FlipCard({
  front,
  back,
  flipped = false,
  onFlip,
  className = '',
  backAriaLabel,
  frontAriaLabel,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(flipped)

  const showBack = flipped ?? isFlipped

  return (
    <m.div
      className={`relative w-full min-h-[120px] ${className}`}
      style={{ perspective: 1000 }}
      onClick={() => {
        if (onFlip) onFlip()
        else setIsFlipped((v) => !v)
      }}
      role="button"
      tabIndex={0}
      aria-label={showBack ? backAriaLabel : frontAriaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (onFlip) onFlip()
          else setIsFlipped((v) => !v)
        }
      }}
    >
      <m.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
          aria-hidden={showBack}
        >
          {front}
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          aria-hidden={!showBack}
        >
          {back}
        </div>
      </m.div>
    </m.div>
  )
}
