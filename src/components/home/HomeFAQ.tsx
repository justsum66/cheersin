'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'

/** T067 P2：遊戲懲罰可自訂、FAQ 說明「可非酒精」，家長與不喝酒玩家接納 */
const FAQ_ITEMS = [
  { q: '測驗要付費嗎？', a: '靈魂酒測與多數功能永久免費，進階課程與 AI 深度分析可選購 Pro。' },
  { q: '多久能拿到結果？', a: '約 30 秒完成測驗，結果與推薦酒款立即顯示。' },
  { q: '派對遊戲需要幾人？', a: '多數遊戲 2 人即可，建議 4–8 人體驗最佳。' },
  { q: '懲罰可以自訂嗎？不喝酒也能玩嗎？', a: '可以。派對遊戲懲罰可自訂，含非酒精選項（如喝飲料、做伏地挺身），不飲酒也能玩。詳見派對遊樂場與懲罰轉盤設定。' },
  { q: 'AI 侍酒師有使用次數嗎？', a: '免費方案每日有額度，Pro 會員享有更高額度與優先回應。' },
]

/** HP-009：semantic <details>/<summary> — works without JS, native a11y
 *  HP-044: Search/filter for FAQ items */
export default function HomeFAQ() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return FAQ_ITEMS
    return FAQ_ITEMS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h3 className="text-sm font-medium text-white/60 mb-3">常見問題</h3>

      {/* HP-044: FAQ search input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋常見問題..."
          className="w-full pl-9 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/30 transition-all"
          aria-label="搜尋常見問題"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-white/40 text-sm py-4">找不到相關問題</p>
        ) : (
          filtered.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              <summary
                className="flex items-center justify-between gap-3 min-h-[48px] px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors games-focus-ring rounded-xl cursor-pointer list-none [&::-webkit-details-marker]:hidden"
              >
                <span className="text-sm font-medium">{item.q}</span>
                <ChevronDown className="w-4 h-4 text-white/50 shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="overflow-hidden animate-[faqOpen_0.2s_ease-out]">
                <p className="px-4 pb-3 pt-0 text-xs text-white/60 leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  )
}
