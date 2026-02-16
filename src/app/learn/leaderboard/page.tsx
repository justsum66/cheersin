/**
 * P3-429 / P1-48: 學習排行榜（coming-soon UX 優化）
 * - 預覽排行榜結構
 * - 開發進度指標
 * - 動態進度引導
 */
import Link from 'next/link'
import { Trophy, Crown, Medal, Award, ChevronLeft } from 'lucide-react'

export const metadata = {
  title: '學習排行榜 | Cheersin 品酒學院',
  description: '看看誰最認真學習品酒，一起加油！',
}

/** Mock leaderboard preview to show the expected UX */
const PREVIEW_RANKS = [
  { rank: 1, name: '???', chapters: '--', icon: Crown, color: 'text-amber-400' },
  { rank: 2, name: '???', chapters: '--', icon: Medal, color: 'text-gray-300' },
  { rank: 3, name: '???', chapters: '--', icon: Award, color: 'text-amber-600' },
]

export default function LearnLeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Back nav */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          返回品酒學院
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary-400" aria-hidden />
          <h1 className="text-2xl font-bold">學習排行榜</h1>
        </div>
        <p className="text-white/60 text-sm mb-8">
          依完成章節數、學習時長排名。完成課程即可累積進度。
        </p>

        {/* Status Banner */}
        <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-50" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">排行榜建置中</p>
              <p className="text-xs text-white/50">預計 2026 Q2 上線</p>
            </div>
          </div>
        </div>

        {/* Preview Leaderboard */}
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">排名預覽</p>
          </div>
          <div className="divide-y divide-white/5">
            {PREVIEW_RANKS.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.rank} className="flex items-center gap-4 px-4 py-3">
                  <span className="text-lg font-bold text-white/30 w-8 text-center">
                    {item.rank}
                  </span>
                  <Icon className={`w-5 h-5 ${item.color} opacity-50`} />
                  <span className="text-white/40 flex-1">{item.name}</span>
                  <span className="text-white/30 text-sm">{item.chapters} 章</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* How it works */}
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
          排名規則
        </h2>
        <div className="space-y-2 mb-8">
          {[
            '依已完成章節數排名',
            '章節數相同時，依累積學習時長排序',
            '每週日 00:00 重新計算',
            '前三名可獲得專屬徽章',
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/40 shrink-0">
                {i + 1}
              </span>
              {rule}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/learn"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-500/30 text-primary-300 text-sm font-medium hover:bg-primary-500/40 transition-colors"
          >
            先去完成幾堂課
          </Link>
        </div>
      </div>
    </main>
  )
}
