'use client'

/**
 * LEARN-048 / P2.E3.2: 學習小組 + Live Cohort 排程功能
 * - 功能預覽清單
 * - LEARN-048: 模擬 live cohort 排程報名
 * - 返回導航
 */
import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, UserPlus, LinkIcon, BarChart3, Trophy, Calendar, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const PREVIEW_FEATURES = [
  { icon: UserPlus, title: '建立小組', desc: '最多 6 人組隊，設定小組名稱與學習目標' },
  { icon: LinkIcon, title: '邀請連結', desc: '一鍵產生邀請連結，分享給朋友加入' },
  { icon: BarChart3, title: '進度看板', desc: '即時查看組員學習進度，追蹤完成章節數' },
  { icon: Trophy, title: '組隊成就', desc: '全員完成同一門課可解鎖專屬小組徽章' },
]

/** LEARN-048: Live Cohort 排程 */
const UPCOMING_COHORTS = [
  { id: 'wine-basics-cohort-1', course: '葡萄酒入門', date: '2026-03-01', time: '20:00', spots: 12, enrolled: 7 },
  { id: 'cocktail-cohort-1', course: '調酒基礎', date: '2026-03-08', time: '19:30', spots: 10, enrolled: 4 },
  { id: 'whisky-cohort-1', course: '威士忌入門', date: '2026-03-15', time: '20:00', spots: 8, enrolled: 6 },
]

export default function LearnStudyGroupPage() {
  const [enrolledCohorts, setEnrolledCohorts] = useState<Set<string>>(new Set())

  const handleEnroll = (cohortId: string) => {
    setEnrolledCohorts(prev => {
      const next = new Set(prev)
      if (next.has(cohortId)) {
        next.delete(cohortId)
        toast('已取消報名', { duration: 1500 })
      } else {
        next.add(cohortId)
        toast.success('已報名成功！開課前會提醒你', { duration: 2000 })
      }
      return next
    })
  }

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
          學習小組 & Live Cohort
        </h1>
        <p className="text-white/60 text-sm mb-8">
          邀請好友組隊，或報名 Live Cohort 跟著大家一起學。
        </p>

        {/* LEARN-048: Live Cohort 排程 */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            即將開課的 Cohort
          </h2>
          <div className="space-y-3">
            {UPCOMING_COHORTS.map(cohort => {
              const isEnrolled = enrolledCohorts.has(cohort.id)
              const spotsLeft = cohort.spots - cohort.enrolled
              return (
                <div key={cohort.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{cohort.course}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {cohort.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cohort.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cohort.enrolled}/{cohort.spots} 人
                        </span>
                      </div>
                      {spotsLeft <= 3 && spotsLeft > 0 && (
                        <p className="text-amber-400 text-xs mt-1">僅剩 {spotsLeft} 個名額</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEnroll(cohort.id)}
                      className={`shrink-0 min-h-[40px] px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isEnrolled
                          ? 'bg-primary-500/20 border border-primary-500/40 text-primary-300'
                          : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/15'
                      }`}
                    >
                      {isEnrolled ? '已報名' : '報名'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status Banner */}
        <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-50" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">小組功能開發中</p>
              <p className="text-xs text-white/50">預計 2026 Q2 上線</p>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
          小組功能預覽
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
