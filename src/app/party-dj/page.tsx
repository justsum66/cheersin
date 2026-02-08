'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Music2, Sparkles, Play, ChevronRight, Share2 } from 'lucide-react'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useSubscription } from '@/hooks/useSubscription'
import { useTranslation } from '@/contexts/I18nContext'

type Phase = { phase: string; durationMin: number; gameIds: string[]; transitionText: string }

/**
 * killer 23/27：AI 派對 DJ — 表單輸入 → 呼叫 plan API → 顯示編排與 transitionText
 * killer 25/26：前端傳 subscriptionTier，免費用戶 30 分鐘、付費不限
 * killer 30：編排結果分享（複製文字到剪貼簿）
 */
export default function PartyDJPage() {
  const { t } = useTranslation()
  const { tier } = useSubscription()
  const isFree = tier !== 'basic' && tier !== 'premium'
  const maxDuration = isFree ? 30 : 240
  const [peopleCount, setPeopleCount] = useState(6)
  const [durationMin, setDurationMin] = useState(isFree ? 30 : 120)
  const [allow18, setAllow18] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<{ phases: Phase[]; totalMin: number } | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPlan(null)
    setLoading(true)
    try {
      const res = await fetch('/api/party-dj/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peopleCount,
          durationMin,
          allow18,
          subscriptionTier: tier === 'basic' || tier === 'premium' ? tier : 'free',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(t('partyDj.errorFetch'))
        return
      }
      setPlan({ phases: data.phases, totalMin: data.totalMin })
      fireFullscreenConfetti()
    } catch (err) {
      setError(t('partyDj.errorGeneric'))
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
      <h1 className="text-2xl font-bold text-white text-center">{t('partyDj.title')}</h1>
      <p className="text-white/70 text-center max-w-md">
        {t('partyDj.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <label className="text-white/80 text-sm">
          {t('partyDj.people')}
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
          {t('partyDj.durationMin')}
          <input
            type="number"
            min={15}
            max={maxDuration}
            value={durationMin}
            onChange={(e) => setDurationMin(Math.min(maxDuration, Number(e.target.value) || 15))}
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white border border-white/20"
          />
          {isFree && (
            <p className="mt-1 text-amber-400/90 text-xs">{t('partyDj.freeLimitHint')}</p>
          )}
        </label>
        <label className="flex items-center gap-2 text-white/80">
          <input
            type="checkbox"
            checked={allow18}
            onChange={(e) => setAllow18(e.target.checked)}
            className="rounded"
          />
          {t('partyDj.allow18')}
        </label>
        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium games-focus-ring"
        >
          {loading ? t('partyDj.submitLoading') : t('partyDj.submit')}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {plan && (
        <div className="w-full max-w-lg space-y-4">
          <h2 className="text-lg font-semibold text-white">{t('partyDj.planTitle')}（{plan.totalMin} {t('partyDj.minutes')}）</h2>
          {plan.phases.map((p, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/10 border border-white/20 p-4 text-left"
            >
              <div className="flex items-center gap-2 text-primary-300 font-medium">
                <span>{p.phase}</span>
                <span className="text-white/60 text-sm">{p.durationMin} {t('partyDj.minutes')}</span>
              </div>
              <p className="mt-2 text-white/80 text-sm italic">&quot;{p.transitionText}&quot;</p>
              {p.gameIds.length > 0 && (
                <p className="mt-1 text-white/60 text-xs">{t('partyDj.gamesLabel')}：{p.gameIds.join('、')}</p>
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!plan) return
                const text = [
                  `🎉 Cheersin ${t('partyDj.planTitle')}（${plan.totalMin} ${t('partyDj.minutes')}）`,
                  plan.phases
                    .map((p) => `${p.phase} ${p.durationMin}${t('partyDj.minutes')}：${p.gameIds.join('、')}`)
                    .join('\n'),
                  'https://cheersin.app',
                ].join('\n')
                void navigator.clipboard?.writeText(text).then(() => {
                  setShareCopied(true)
                  setTimeout(() => setShareCopied(false), 2000)
                })
              }}
              className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium games-focus-ring border border-white/20"
              aria-label={t('partyDj.sharePlanAria')}
            >
              <Share2 className="w-5 h-5" aria-hidden />
              {shareCopied ? t('common.copied') : t('partyDj.sharePlan')}
            </button>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium games-focus-ring"
            >
              <Play className="w-5 h-5" aria-hidden />
              {t('partyDj.startParty')}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}

      <Link href="/assistant" className="text-white/50 hover:text-white/80 text-sm">
        {t('partyDj.askAssistant')}
      </Link>
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
        {t('partyDj.backHome')}
      </Link>
    </div>
  )
}
