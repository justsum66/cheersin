'use client'

import { useState } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/** T067 P2：遊戲懲罰可自訂、FAQ 說明「可非酒精」，家長與不喝酒玩家接納 */
const FAQ_ITEMS = [
  { q: '測驗要付費嗎？', a: '靈魂酒測與多數功能永久免費，進階課程與 AI 深度分析可選購 Pro。' },
  { q: '多久能拿到結果？', a: '約 30 秒完成測驗，結果與推薦酒款立即顯示。' },
  { q: '派對遊戲需要幾人？', a: '多數遊戲 2 人即可，建議 4–8 人體驗最佳。' },
  { q: '懲罰可以自訂嗎？不喝酒也能玩嗎？', a: '可以。派對遊戲懲罰可自訂，含非酒精選項（如喝飲料、做伏地挺身），不飲酒也能玩。詳見派對遊樂場與懲罰轉盤設定。' },
  { q: 'AI 侍酒師有使用次數嗎？', a: '免費方案每日有額度，Pro 會員享有更高額度與優先回應。' },
]

/** 45 問題？快速 FAQ 折疊區 */
export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h3 className="text-sm font-medium text-white/60 mb-3">常見問題</h3>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, index) => (
          <m.div
            key={index}
            layout
            className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between gap-3 min-h-[48px] px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors games-focus-ring rounded-xl"
              aria-expanded={openIndex === index}
            >
              <span className="text-sm font-medium">{item.q}</span>
              <m.span
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-white/50" />
              </m.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-3 pt-0 text-xs text-white/60 leading-relaxed">{item.a}</p>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        ))}
      </div>
    </div>
  )
}
