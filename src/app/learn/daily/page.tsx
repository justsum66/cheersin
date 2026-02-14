'use client'

/**
 * R2-379：每日一酒 — 依本地日期顯示當日推薦酒款（id/名稱/簡介/品鑑筆記）
 */
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Wine, Calendar } from 'lucide-react'
import dailyWineData from '@/data/daily-wine.json'

type DailyEntry = {
  id: string
  name: string
  type?: string
  region?: string
  country?: string
  intro: string
  tastingNotes: string
}

const dataByDate = dailyWineData as Record<string, DailyEntry>

function getTodayKey(): string {
  if (typeof window === 'undefined') return ''
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export default function DailyWinePage() {
  const [todayKey, setTodayKey] = useState('')
  useEffect(() => {
    setTodayKey(getTodayKey())
  }, [])

  const entry = useMemo(() => (todayKey ? dataByDate[todayKey] : null), [todayKey])
  const fallback = useMemo(() => Object.values(dataByDate)[0] as DailyEntry | undefined, [])

  const display = entry ?? fallback

  if (!display) {
    return (
      <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
        <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring">
          <ChevronLeft className="w-4 h-4" /> 返回品酒學院
        </Link>
        <p className="text-white/60">暫無當日推薦，請改日再來。</p>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring">
        <ChevronLeft className="w-4 h-4" aria-hidden /> 返回品酒學院
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Wine className="w-6 h-6 text-primary-400" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">每日一酒</h1>
          <p className="text-white/60 text-sm flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {todayKey || '—'}
          </p>
        </div>
      </div>

      <article className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h2 className="text-xl font-semibold text-white">{display.name}</h2>
        {(display.type || display.region || display.country) && (
          <p className="text-white/60 text-sm">
            {[display.type, display.region, display.country].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-white/80">{display.intro}</p>
        <div>
          <h3 className="text-sm font-medium text-primary-300 mb-1">品鑑筆記</h3>
          <p className="text-white/70 text-sm">{display.tastingNotes}</p>
        </div>
      </article>
    </div>
  )
}
