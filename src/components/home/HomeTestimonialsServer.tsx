import { HOME_TESTIMONIALS } from '@/data/home-testimonials'

/**
 * RSC：精選用戶評價（靜態內容，無 client 依賴）
 * 使用 CSS 動畫 animate-scroll-left，可被 PPR 靜態預渲染
 */
export default async function HomeTestimonialsServer() {
  return (
    <div className="overflow-hidden py-4">
      <div className="flex gap-4 animate-scroll-left hover:[animation-play-state:paused]">
        {[...HOME_TESTIMONIALS, ...HOME_TESTIMONIALS].map((t, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[280px] rounded-xl border border-white/10 bg-white/[0.04] p-4"
          >
            <p className="text-white/90 text-sm leading-relaxed mb-3">「{t.text}」</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{t.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                {t.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
