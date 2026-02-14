'use client'

import { m } from 'framer-motion'

/** R2-124：語音播報視覺指示 — 數個垂直 bar 表示 TTS 播報中 */
const BARS = 5

export function SpeechVisualizer({ isSpeaking, reducedMotion = false, className = '' }: {
  isSpeaking: boolean
  reducedMotion?: boolean
  className?: string
}) {
  if (!isSpeaking) return null
  if (reducedMotion) {
    return (
      <div className={`flex items-center gap-0.5 h-4 ${className}`} aria-label="語音播報中">
        <div className="w-1 h-3 rounded-full bg-primary-400/60" />
      </div>
    )
  }
  return (
    <div
      className={`flex items-end gap-0.5 h-4 ${className}`}
      role="img"
      aria-label="語音播報中"
    >
      {Array.from({ length: BARS }).map((_, i) => (
        <m.div
          key={i}
          className="w-1 rounded-full bg-primary-400/80"
          animate={
            isSpeaking
              ? { height: [4, 12, 6, 14, 8, 12, 4] }
              : { height: 4 }
          }
          transition={{
            duration: 0.6,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: 'reverse',
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  )
}
