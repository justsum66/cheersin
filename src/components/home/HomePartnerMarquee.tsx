'use client'

import { memo, useState, useCallback } from 'react'
import { Wine, Sparkles, Beer, Gamepad2, GraduationCap, MessageCircle, Pause, Play } from 'lucide-react'
import { PARTNER_NAMES } from '@/config/home.config'

const ICON_MAP = {
  Wine,
  Cheers: Sparkles,
  Bar: Beer,
  Party: Gamepad2,
  Learn: GraduationCap,
  Chat: MessageCircle,
} as const

/** HP-015：合作夥伴 Logo 無限滾動 — 品牌展示區；aria-hidden + pause button for a11y */
export const HomePartnerMarquee = memo(function HomePartnerMarquee() {
  const [isPaused, setIsPaused] = useState(false)
  const togglePause = useCallback(() => setIsPaused(p => !p), [])

  const items = PARTNER_NAMES.map((name) => ({
    name,
    Icon: ICON_MAP[name] ?? Wine,
  }))
  const duplicated = [...items, ...items]

  return (
    <section className="py-8 overflow-hidden border-t border-white/10 bg-white/[0.02] relative" aria-label="合作夥伴">
      <p className="sr-only">合作夥伴與品牌</p>
      {/* HP-015: Pause button for a11y compliance */}
      <button
        type="button"
        onClick={togglePause}
        className="absolute top-2 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        aria-label={isPaused ? '播放跑馬燈' : '暫停跑馬燈'}
        aria-pressed={isPaused}
      >
        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </button>
      <div className="overflow-hidden">
        {/* HP-015: aria-hidden on decorative marquee content */}
        <div 
          className="home-partner-marquee-track gap-12 items-center"
          aria-hidden="true"
          style={isPaused ? { animationPlayState: 'paused' } : undefined}
        >
          {duplicated.map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:opacity-100 transition-colors duration-300 opacity-60 hover:opacity-100"
              style={{ minWidth: 100 }}
            >
              <item.Icon className="w-6 h-6" aria-hidden />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
