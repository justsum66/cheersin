'use client'

/**
 * P2.B1.1 學習計劃生成器
 * 依目標選擇 WSET / CMS / MW，顯示個人化建議課程順序
 */
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Target, BookOpen } from 'lucide-react'
import { getPlanByGoal, PLAN_GOAL_LABELS, type PlanGoal } from '@/lib/learn-plan-generator'

export default function LearnPlanPage() {
  const [goal, setGoal] = useState<PlanGoal | null>(null)
  const plan = goal ? getPlanByGoal(goal) : []

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Target className="w-7 h-7 text-primary-400" />
          學習計劃生成器
        </h1>
        <p className="text-white/60 text-sm mb-8">
          選擇你的認證目標，取得建議課程順序與對應課程連結。
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white/90 mb-3">選擇目標</h2>
          <div className="flex flex-col gap-2">
            {(['WSET', 'CMS', 'MW'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                  goal === g
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                }`}
              >
                {PLAN_GOAL_LABELS[g]}
              </button>
            ))}
          </div>
        </section>

        {goal && plan.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-400" />
              {PLAN_GOAL_LABELS[goal]} 建議順序
            </h2>
            <ol className="space-y-2">
              {plan.map((step, index) => (
                <li key={step.courseId}>
                  <Link
                    href={`/learn/${step.courseId}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white/50 font-mono w-6 text-sm">{index + 1}.</span>
                    <span className="flex-1 font-medium">{step.title}</span>
                    <span className="text-xs text-white/40">{step.certLabel}</span>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </Link>
                </li>
              ))}
            </ol>
            <p className="text-white/40 text-sm mt-4">
              點擊課程進入學習；完成一門後再進行下一門效果更佳。
            </p>
          </section>
        )}

        <p className="mt-8 text-white/40 text-sm">
          <Link href="/learn" className="text-primary-400 hover:underline">
            ← 返回課程總覽
          </Link>
        </p>
      </div>
    </div>
  )
}
