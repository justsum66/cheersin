'use client'

/**
 * P2.E3.2 / P1-47: 學習小組（coming-soon UX 優化）
 * - 功能預覽清單
 * - 視覺進度指標
 * - 返回導航
 */
import Link from 'next/link'
import { ChevronLeft, UserPlus, LinkIcon, BarChart3, Trophy } from 'lucide-react'

const PREVIEW_FEATURES = [
  { icon: UserPlus, title: '建立小組', desc: '最多 6 人組隊，設定小組名稱與學習目標' },
  { icon: LinkIcon, title: '邀請連結', desc: '一鍵產生邀請連結，分享給朋友加入' },
  { icon: BarChart3, title: '進度看板', desc: '即時查看組員學習進度，追蹤完成章節數' },
  { icon: Trophy, title: '組隊成就', desc: '全員完成同一門課可解鎖專屬小組徽章' },
]

export default function LearnStudyGroupPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          返回課程總覽
        </Link>

        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <UserPlus className="w-7 h-7 text-primary-400" />
          學習小組
        </h1>
        <p className="text-white/60 text-sm mb-8">
          邀請好友組隊，一起選課、一起完成，互相監督。
        </p>

        {/* Status Banner */}
        <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-50" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">功能開發中</p>
              <p className="text-xs text-white/50">預計 2026 Q2 上線</p>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
          功能預覽
        </h2>
        <div className="space-y-3 mb-8">
          {PREVIEW_FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="p-2 rounded-lg bg-primary-500/20 shrink-0">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white/90">{feat.title}</p>
                  <p className="text-white/50 text-sm mt-0.5">{feat.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
          <UserPlus className="w-10 h-10 text-primary-400/40 mx-auto mb-3" />
          <p className="text-white/70 mb-1">上線後第一時間通知你</p>
          <p className="text-white/40 text-sm mb-4">
            先完成學習計劃，小組功能開放時即可立即組隊
          </p>
          <Link
            href="/learn"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-500/30 text-primary-300 text-sm font-medium hover:bg-primary-500/40 transition-colors"
          >
            瀏覽課程
          </Link>
        </div>
      </div>
    </div>
  )
}
