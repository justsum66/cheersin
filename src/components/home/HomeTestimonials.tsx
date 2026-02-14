'use client'

import { m } from 'framer-motion'

const TESTIMONIALS = [
  { name: 'Amy', text: '測驗結果超準，推薦的酒款真的對味！', tag: '靈魂酒測' },
  { name: 'Ken', text: '派對玩國王杯跟真心話大冒險，大家玩到不想散。', tag: '派對遊樂場' },
  { name: 'Vicky', text: 'AI 侍酒師回答很專業，學到很多品酒知識。', tag: 'AI 侍酒師' },
  { name: 'David', text: '30 秒就知道自己適合什麼酒，省下亂買的錢。', tag: '靈魂酒測' },
  { name: 'Jess', text: '品酒學院課程簡潔好懂，上班族也能輕鬆學。', tag: '品酒學院' },
]

/** 39 精選用戶評價：滾動展示 */
export default function HomeTestimonials() {
  return (
    <div className="overflow-hidden py-4">
      <div className="flex gap-4 animate-scroll-left hover:[animation-play-state:paused]">
        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[280px] rounded-xl border border-white/10 bg-white/[0.04] p-4"
          >
            <p className="home-body text-white/90 text-sm leading-relaxed mb-3">「{t.text}」</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 home-body">{t.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                {t.tag}
              </span>
            </div>
          </m.div>
        ))}
      </div>
    </div>
  )
}
