'use client'

/**
 * P2.B3.4 / P1-46: 學習夥伴配對（coming-soon UX 優化）
 * - 功能預覽清單
 * - 視覺進度指標
 * - 返回導航
 */
import Link from 'next/link'
import { ChevronLeft, Users, Target, MessageCircle, Bell } from 'lucide-react'

const PREVIEW_FEATURES = [
  { icon: Target, title: '智能配對', desc: '依學習進度、興趣自動配對同路人' },
  { icon: MessageCircle, title: '互相督促', desc: '私訊鼓勵、分享筆記、共同設定目標' },
  { icon: Bell, title: '進度提醒', desc: '夥伴完成章節時收到通知，互相激勵' },
]

export default function LearnStudyBuddyPage() {
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
          <Users className="w-7 h-7 text-primary-400" />
          學習夥伴配對
        </h1>
        <p className="text-white/60 text-sm mb-8">
          依學習進度配對同路人，互相激勵、一起達標。
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
          <Users className="w-10 h-10 text-primary-400/40 mx-auto mb-3" />
          <p className="text-white/70 mb-1">先完成幾堂課程，配對時更精準</p>
          <p className="text-white/40 text-sm mb-4">
            完成 3 堂課程後，將優先開放配對資格
          </p>
          <Link
            href="/learn"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary-500/30 text-primary-300 text-sm font-medium hover:bg-primary-500/40 transition-colors"
          >
            開始學習
          </Link>
        </div>
      </div>
    </div>
  )
}
