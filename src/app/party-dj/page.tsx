'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Music2, Sparkles, Play, ChevronRight } from 'lucide-react'
import { fireFullscreenConfetti } from '@/lib/celebration'

type Phase = { phase: string; durationMin: number; gameIds: string[]; transitionText: string }

/**
 * killer 23/27：AI 派對 DJ — 表單輸入 → 呼叫 plan API → 顯示編排與 transitionText
 */
export default function PartyDJPage() {
  const [peopleCount, setPeopleCount] = useState(6)
  const [durationMin, setDurationMin] = useState(120)
  const [allow18, setAllow18] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<{ phases: Phase[]; totalMin: number } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPlan(null)
    setLoading(true)
    try {
      const res = await fetch('/api/party-dj/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peopleCount, durationMin, allow18 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get plan')
      setPlan({ phases: data.phases, totalMin: data.totalMin })
      fireFullscreenConfetti()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center gap-6 px-4 py-8">
      <div className="flex items-center gap-3 text-primary-400">
        <Music2 className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">AI 派對 DJ</h1>
      <p className="text-white/70 text-center max-w-md">
        輸入人數與時長，AI 幫你編排：暖場 → 升溫 → 高潮 → 收尾。
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <label className="text-white/80 text-sm">
          人數
          <input
            type="number"
            min={2}
            max={12}
            value={peopleCount}
            onChange={(e) => setPeopleCount(Number(e.target.value) || 6)}
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white border border-white/20"
          />
        </label>
        <label className="text-white/80 text-sm">
          時長（分鐘）
          <input
            type="number"
            min={15}
            max={240}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value) || 60)}
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white border border-white/20"
          />
        </label>
        <label className="flex items-center gap-2 text-white/80">
          <input
            type="checkbox"
            checked={allow18}
            onChange={(e) => setAllow18(e.target.checked)}
            className="rounded"
          />
          含 18+ 遊戲
        </label>
        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium games-focus-ring"
        >
          {loading ? '編排中…' : '生成派對流程'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {plan && (
        <div className="w-full max-w-lg space-y-4">
          <h2 className="text-lg font-semibold text-white">派對流程（{plan.totalMin} 分鐘）</h2>
          {plan.phases.map((p, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/10 border border-white/20 p-4 text-left"
            >
              <div className="flex items-center gap-2 text-primary-300 font-medium">
                <span>{p.phase}</span>
                <span className="text-white/60 text-sm">{p.durationMin} 分鐘</span>
              </div>
              <p className="mt-2 text-white/80 text-sm italic">&quot;{p.transitionText}&quot;</p>
              {p.gameIds.length > 0 && (
                <p className="mt-1 text-white/60 text-xs">遊戲：{p.gameIds.join('、')}</p>
              )}
            </div>
          ))}
          <Link
            href="/games"
            className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium games-focus-ring"
          >
            <Play className="w-5 h-5" aria-hidden />
            開始派對
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      )}

      <Link href="/assistant" className="text-white/50 hover:text-white/80 text-sm">
        先問 AI 侍酒師
      </Link>
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
        返回首頁
      </Link>
    </div>
  )
}
