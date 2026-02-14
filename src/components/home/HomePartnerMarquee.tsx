'use client'

import { memo } from 'react'
import { Wine, Sparkles, Beer, Gamepad2, GraduationCap, MessageCircle } from 'lucide-react'
import { PARTNER_NAMES } from '@/config/home.config'

const ICON_MAP = {
  Wine,
  Cheers: Sparkles,
  Bar: Beer,
  Party: Gamepad2,
  Learn: GraduationCap,
  Chat: MessageCircle,
} as const

/** R2-095：合作夥伴 Logo 無限滾動 — 品牌展示區；prefers-reduced-motion 時改為靜態橫列 */
export const HomePartnerMarquee = memo(function HomePartnerMarquee() {
  const items = PARTNER_NAMES.map((name) => ({
    name,
    Icon: ICON_MAP[name] ?? Wine,
  }))
  const duplicated = [...items, ...items]

  return (
    <section className="py-8 overflow-hidden border-t border-white/10 bg-white/[0.02]" aria-label="合作夥伴">
      <p className="sr-only">合作夥伴與品牌</p>
      <div className="overflow-hidden">
        <div className="home-partner-marquee-track gap-12 items-center">
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
