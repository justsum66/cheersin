'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Music2, Sparkles, Play, ChevronRight, Share2, Link2, X, Copy, ImageDown, GripVertical } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getGameMeta } from '@/config/games.config'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useSubscription } from '@/hooks/useSubscription'
import { useUserStore } from '@/store/useUserStore'
import { usePartyStore } from '@/store/usePartyStore'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/contexts/I18nContext'

type Phase = { phase: string; durationMin: number; gameIds: string[]; transitionText: string }
type PlanResult = { phases: Phase[]; totalMin: number }

const CACHE_TTL_MS = 5 * 60 * 1000
const LONG_WAIT_MS = 15000

/** 建 cache key（#11 API 快取）；#14 含氣氛偏好 */
function planCacheKey(people: number, duration: number, allow18: boolean, useAi: boolean, subTier: string, mood: string): string {
  return `${people}_${duration}_${allow18}_${useAi}_${subTier}_${mood}`
}

/**
 * killer 23/27：AI 派對 DJ — 表單輸入 → 呼叫 plan API → 顯示編排與 transitionText
 * killer 25/26：前端傳 subscriptionTier，免費用戶 30 分鐘、付費不限
 * killer 30：編排結果分享（複製文字到剪貼簿）
 * #5 分享連結 #8 RWD #11 快取 #16 階段顯示遊戲中文名 #18 逾時 #25 複製單階段 #26 語系不閃爍 #27 焦點 #28 ErrorBoundary(layout) #29 memo #30 E2E
 */

/** #29：結果區 memo；#6 分享圖片：擷取內容區下載為 PNG */
const PartyDJPlanResult = memo(function PartyDJPlanResult({
  plan,
  linkCopied,
  shareCopied,
  t,
  onCopyPhase,
  onCopyLink,
  onShare,
  startPartyRef,
  onSavePlan,
  showSave,
  saveLoading,
  onReorderPhases,
  onStartParty,
}: {
  plan: PlanResult
  linkCopied: boolean
  shareCopied: boolean
  t: (key: string) => string
  onCopyPhase: (phaseText: string) => void
  onCopyLink: () => void
  onShare: () => void
  startPartyRef: React.RefObject<HTMLAnchorElement | null>
  /** #12 儲存為我的方案（登入時顯示） */
  onSavePlan?: () => void
  showSave?: boolean
  saveLoading?: boolean
  /** #15 階段拖曳排序 */
  onReorderPhases?: (newPhases: Phase[]) => void
  onStartParty?: (roomId: string, roomCode: string) => void
}) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [imageDownloading, setImageDownloading] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const planTitle = t('partyDj.planTitle')
  const minutes = t('partyDj.minutes')
  const copyPhase = t('partyDj.copyPhase')
  const copyPhaseAria = t('partyDj.copyPhaseAria')
  const gamesLabel = t('partyDj.gamesLabel')
  const copyPlanLink = t('partyDj.copyPlanLink')
  const copyPlanLinkAria = t('partyDj.copyPlanLinkAria')
  const sharePlan = t('partyDj.sharePlan')
  const sharePlanAria = t('partyDj.sharePlanAria')
  const startParty = t('partyDj.startParty')
  const copied = t('common.copied')
  const downloadImage = t('partyDj.downloadImage')
  const downloadImageAria = t('partyDj.downloadImageAria')
  const savePlan = t('partyDj.savePlan')
  const savePlanAria = t('partyDj.savePlanAria')
  const reorderAria = t('partyDj.reorderPhaseAria')
  const expandAria = t('partyDj.expandPhaseAria')
  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index)
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), [])
  const handleDrop = useCallback((toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const fromIndex = draggedIndex
    setDraggedIndex(null)
    if (fromIndex == null || fromIndex === toIndex || !onReorderPhases || !plan) return
    const next = [...plan.phases]
    const [removed] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, removed)
    onReorderPhases(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onReorderPhases from parent is required in closure
  }, [draggedIndex, onReorderPhases, plan])
  const handleDownloadImage = useCallback(async () => {
    const el = captureRef.current
    if (!el || imageDownloading) return
    setImageDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(el, { backgroundColor: '#0f172a', scale: 2, logging: false })
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'party-dj-plan.png'
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    } catch {
      /* ignore */
    } finally {
      setImageDownloading(false)
    }
  }, [imageDownloading])
  return (
    <div className="w-full max-w-lg space-y-4 min-w-0 overflow-x-auto" role="region" aria-label={planTitle} data-testid="party-dj-plan-result">
      <div ref={captureRef} className="space-y-4 rounded-xl bg-dark-900/80 p-4">
        <h2 className="text-lg font-semibold text-white">{planTitle}（{plan.totalMin} {minutes}）</h2>
        {plan.phases.map((p, i) => {
          const gameNames = p.gameIds.map((id) => getGameMeta(id)?.name ?? id)
          const phaseText = `${p.phase} ${p.durationMin}${minutes}：${gameNames.join('、')}\n"${p.transitionText}"`
          const metaList = p.gameIds.map((id) => getGameMeta(id)).filter(Boolean)
          const isExpanded = expandedPhase === i
          return (
            <div
              key={i}
              className={`rounded-xl bg-white/10 border border-white/20 p-4 text-left min-w-0 ${draggedIndex === i ? 'opacity-60' : ''}`}
              draggable={!!onReorderPhases}
              onDragStart={onReorderPhases ? handleDragStart(i) : undefined}
              onDragOver={onReorderPhases ? handleDragOver : undefined}
              onDrop={onReorderPhases ? handleDrop(i) : undefined}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-primary-300 font-medium">
                  {onReorderPhases && (
                    <span className="cursor-grab active:cursor-grabbing text-white/50" aria-label={reorderAria}>
                      <GripVertical className="w-4 h-4" aria-hidden />
                    </span>
                  )}
                  <span>{p.phase}</span>
                  <span className="text-white/60 text-sm">{p.durationMin} {minutes}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onCopyPhase(phaseText)}
                  className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs games-focus-ring print:hidden"
                  aria-label={copyPhaseAria}
                >
                  <Copy className="w-4 h-4" aria-hidden />
                  {copyPhase}
                </button>
              </div>
              <p className="mt-2 text-white/80 text-sm italic">&quot;{p.transitionText}&quot;</p>
              {gameNames.length > 0 && (
                <p className="mt-1 text-white/60 text-xs">{gamesLabel}：{gameNames.join('、')}</p>
              )}
              {metaList.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setExpandedPhase(isExpanded ? null : i)}
                    className="mt-2 text-white/50 hover:text-white/80 text-xs games-focus-ring"
                    aria-label={expandAria}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? t('partyDj.collapsePhase') : t('partyDj.expandPhase')}
                  </button>
                  {isExpanded && (
                    <ul className="mt-2 space-y-1 text-white/60 text-xs">
                      {metaList.map((m, j) => (
                        <li key={j}>
                          <span className="font-medium text-white/80">{m?.name}</span>
                          {m?.short_description && ` — ${m.short_description}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 print:hidden">
        <button type="button" onClick={handleDownloadImage} disabled={imageDownloading} className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium games-focus-ring border border-white/20 disabled:opacity-50" aria-label={downloadImageAria}>
          <ImageDown className="w-5 h-5" aria-hidden />
          {imageDownloading ? t('partyDj.submitLoading') : downloadImage}
        </button>
        <button type="button" onClick={onCopyLink} className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium games-focus-ring border border-white/20" aria-label={copyPlanLinkAria}>
          <Link2 className="w-5 h-5" aria-hidden />
          {linkCopied ? copied : copyPlanLink}
        </button>
        <button type="button" onClick={onShare} className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium games-focus-ring border border-white/20" aria-label={sharePlanAria}>
          <Share2 className="w-5 h-5" aria-hidden />
          {shareCopied ? copied : sharePlan}
        </button>
        {showSave && onSavePlan && (
          <button type="button" onClick={onSavePlan} disabled={saveLoading} className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium games-focus-ring border border-white/20 disabled:opacity-50" aria-label={savePlanAria}>
            {saveLoading ? t('partyDj.submitLoading') : savePlan}
          </button>
        )}
        <button
          ref={startPartyRef as any}
          type="button"
          onClick={() => {
            // Generate ID/Code and set store
            const { v4 } = require('uuid')
            const roomId = v4()
            const roomCode = roomId.slice(0, 6).toUpperCase()
            // We need to import usePartyStore to use it, but we are in a memo component.
            // Best to pass a handler from parent or access store here if safe.
            // Actually, parent 'PartyDJPage' has the store access logic usually? 
            // Let's rely on 'onStartParty' prop which we will add to this component
            onStartParty?.(roomId, roomCode)
          }}
          className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium games-focus-ring"
        >
          <Play className="w-5 h-5" aria-hidden />
          {startParty}
          <ChevronRight className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  )
})

export default function PartyDJPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { tier } = useSubscription()
  const isFree = tier !== 'basic' && tier !== 'premium'
  const maxDuration = isFree ? 30 : 240
  const subTier = tier === 'basic' || tier === 'premium' ? tier : 'free'

  const [peopleCount, setPeopleCount] = useState(6)
  const [durationMin, setDurationMin] = useState(isFree ? 30 : 120)
  const [mood, setMood] = useState<'relaxed' | 'intense' | 'mixed'>('mixed')
  const [allow18, setAllow18] = useState(false)
  const [useAiTransition, setUseAiTransition] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<PlanResult | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [savePlanLoading, setSavePlanLoading] = useState(false)
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [longWait, setLongWait] = useState(false)
  const user = useUserStore((s) => s.user)
  const queryClient = useQueryClient()
  const { data: savedPlansData } = useQuery({
    queryKey: ['party-dj', 'plans'],
    queryFn: async () => {
      const res = await fetch('/api/v1/party-dj/plans')
      if (!res.ok) throw new Error('Failed to fetch plans')
      const json = await res.json()
      return (json.data ?? json) as { plans: Array<{ id: string; payload: PlanResult; created_at: string }> }
    },
    enabled: !!user?.id,
  })
  const savedPlans = savedPlansData?.plans ?? []
  const startPartyRef = useRef<HTMLAnchorElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const cacheRef = useRef<{ key: string; data: PlanResult; ts: number } | null>(null)

  useEffect(() => {
    const p = searchParams.get('peopleCount')
    const d = searchParams.get('durationMin')
    const a = searchParams.get('allow18')
    const u = searchParams.get('useAiTransition')
    const m = searchParams.get('mood')
    if (p) setPeopleCount(Math.min(12, Math.max(2, Number(p) || 6)))
    if (d) setDurationMin(Math.min(maxDuration, Math.max(15, Number(d) || 15)))
    if (a !== null) setAllow18(a === '1' || a === 'true')
    if (u !== null) setUseAiTransition(u === '1' || u === 'true')
    if (m === 'relaxed' || m === 'intense' || m === 'mixed') setMood(m)
  }, [searchParams, maxDuration])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    if (plan) startPartyRef.current?.focus()
  }, [plan])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPlan(null)
    setLongWait(false)
    const key = planCacheKey(peopleCount, durationMin, allow18, useAiTransition, subTier, mood)
    if (cacheRef.current?.key === key && Date.now() - cacheRef.current.ts < CACHE_TTL_MS) {
      setPlan(cacheRef.current.data)
      fireFullscreenConfetti()
      return
    }
    setLoading(true)
    const controller = new AbortController()
    abortRef.current = controller
    const tid = setTimeout(() => setLongWait(true), LONG_WAIT_MS)
    try {
      const res = await fetch('/api/v1/party-dj/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peopleCount,
          durationMin,
          allow18,
          useAiTransition,
          subscriptionTier: subTier,
          mood,
        }),
        signal: controller.signal,
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error?.message || t('partyDj.errorFetch'))
        return
      }
      const data = json.data
      const result = { phases: data.phases, totalMin: data.totalMin }
      cacheRef.current = { key, data: result, ts: Date.now() }
      setPlan(result)
      fireFullscreenConfetti()
      try {
        fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'party_dj_plan_success', value: 1 }) }).catch(() => { })
      } catch { /* noop */ }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') setError(t('partyDj.errorGeneric'))
    } finally {
      clearTimeout(tid)
      setLongWait(false)
      setLoading(false)
      abortRef.current = null
    }
  }, [peopleCount, durationMin, allow18, useAiTransition, subTier, mood, t])

  const handleRetry = () => {
    setError(null)
    void handleSubmit({ preventDefault: () => { } } as React.FormEvent)
  }

  const handleCopyPlanLink = () => {
    const url = new URL('/party-dj', typeof window !== 'undefined' ? window.location.origin : '')
    url.searchParams.set('peopleCount', String(peopleCount))
    url.searchParams.set('durationMin', String(durationMin))
    url.searchParams.set('allow18', allow18 ? '1' : '0')
    url.searchParams.set('useAiTransition', useAiTransition ? '1' : '0')
    url.searchParams.set('mood', mood)
    void navigator.clipboard?.writeText(url.toString()).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const cancelRequest = () => {
    abortRef.current?.abort()
  }

  const handleSavePlan = useCallback(async () => {
    if (!plan || !user?.id) return
    setSavePlanLoading(true)
    try {
      const res = await fetch('/api/v1/party-dj/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: plan }),
      })
      if (res.ok) void queryClient.invalidateQueries({ queryKey: ['party-dj', 'plans'] })
    } finally {
      setSavePlanLoading(false)
    }
  }, [plan, user?.id, queryClient])

  return (
    <div className="min-h-[60vh] flex flex-col items-center gap-6 px-4 py-8 min-w-0 w-full max-w-[100vw] bg-dark-950 text-white print:bg-white print:text-black print:py-4" role="main">
      <div className="flex items-center gap-3 text-primary-400">
        <Music2 className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">{t('partyDj.title')}</h1>
      <p className="text-white/70 text-center max-w-md">
        {t('partyDj.subtitle')}
      </p>

      {!online && (
        <p className="text-amber-400 text-sm text-center px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 print:hidden" role="status">
          {t('partyDj.offlineHint')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 min-w-0 print:hidden" aria-label={t('partyDj.title')}>
        <label className="text-white/80 text-sm">
          {t('partyDj.people')}
          <input
            type="number"
            min={2}
            max={12}
            value={peopleCount}
            onChange={(e) => setPeopleCount(Number(e.target.value) || 6)}
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white border border-white/20 min-h-[44px]"
            aria-label={t('partyDj.people')}
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
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white border border-white/20 min-h-[44px]"
            aria-label={t('partyDj.durationMin')}
          />
          {isFree && (
            <>
              <p className="mt-1 text-amber-400/90 text-xs">{t('partyDj.freeLimitHint')}</p>
              <p className="mt-1 text-white/60 text-xs">
                <Link href="/pricing" className="underline hover:text-primary-400">{t('partyDj.upgradeToUnlock')}</Link>
              </p>
            </>
          )}
        </label>
        <label className="text-white/80 text-sm">
          {t('partyDj.moodLabel')}
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as 'relaxed' | 'intense' | 'mixed')}
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white border border-white/20 min-h-[44px]"
            aria-label={t('partyDj.moodLabel')}
          >
            <option value="relaxed">{t('partyDj.moodRelaxed')}</option>
            <option value="intense">{t('partyDj.moodIntense')}</option>
            <option value="mixed">{t('partyDj.moodMixed')}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-white/80 min-h-[44px] items-center">
          <input type="checkbox" checked={allow18} onChange={(e) => setAllow18(e.target.checked)} className="rounded" aria-label={t('partyDj.allow18')} />
          {t('partyDj.allow18')}
        </label>
        <label className="flex items-center gap-2 text-white/80 min-h-[44px] items-center">
          <input type="checkbox" checked={useAiTransition} onChange={(e) => setUseAiTransition(e.target.checked)} className="rounded" aria-label={t('partyDj.useAiTransition')} />
          {t('partyDj.useAiTransition')}
        </label>
        <button type="submit" disabled={loading || !online} className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium games-focus-ring" aria-busy={loading}>
          {loading ? t('partyDj.submitLoading') : t('partyDj.submit')}
        </button>
      </form>

      {!plan && !loading && !error && savedPlans.length > 0 && (
        <div className="w-full max-w-sm space-y-2 print:hidden">
          <p className="text-white/70 text-sm font-medium">{t('partyDj.recentPlans')}</p>
          <ul className="space-y-2">
            {savedPlans.map((item) => {
              const p = item.payload as PlanResult
              if (!p?.phases?.length) return null
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setPlan(p)}
                    className="w-full text-left rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white/90 hover:bg-white/20 text-sm games-focus-ring"
                  >
                    {t('partyDj.planTitle')} {p.totalMin} {t('partyDj.minutes')} · {t('partyDj.useThisPlan')}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {!plan && !loading && !error && savedPlans.length === 0 && (
        <p className="text-white/50 text-sm text-center max-w-sm print:hidden" role="status">
          {t('partyDj.emptyState')}
        </p>
      )}

      {loading && (
        <div className="w-full max-w-lg space-y-4 print:hidden" role="status" aria-live="polite">
          <p className="text-white/70 text-sm text-center">{t('partyDj.progressSteps')}</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['暖場', '升溫', '高潮', '收尾'].map((label, i) => (
              <span key={label} className="rounded-full px-3 py-1 text-xs bg-white/10 text-white/80 animate-pulse" aria-hidden>
                {label}
              </span>
            ))}
          </div>
          <div className="w-full max-w-lg space-y-4 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/2 mx-auto" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-white/10 border border-white/20 p-4 h-24" />
            ))}
          </div>
          {longWait && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-amber-400/90 text-sm">{t('partyDj.generatingLong')}</p>
              <button type="button" onClick={cancelRequest} className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm games-focus-ring" aria-label={t('partyDj.cancel')}>
                <X className="w-4 h-4" aria-hidden />
                {t('partyDj.cancel')}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-red-400 text-sm" role="alert">{error}</p>
          <button type="button" onClick={handleRetry} className="min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm games-focus-ring">
            {t('partyDj.retry')}
          </button>
        </div>
      )}

      {plan && (
        <PartyDJPlanResult
          plan={plan}
          linkCopied={linkCopied}
          shareCopied={shareCopied}
          t={t}
          onSavePlan={user?.id ? handleSavePlan : undefined}
          showSave={!!user?.id}
          saveLoading={savePlanLoading}
          onCopyPhase={(phaseText) => {
            void navigator.clipboard?.writeText(phaseText).then(() => {
              setShareCopied(true)
              setTimeout(() => setShareCopied(false), 2000)
            })
          }}
          onCopyLink={handleCopyPlanLink}
          onShare={() => {
            if (!plan) return
            try {
              fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'party_dj_share', value: 1 }) }).catch(() => { })
            } catch { /* noop */ }
            const text = [
              `🎉 Cheersin ${t('partyDj.planTitle')}（${plan.totalMin} ${t('partyDj.minutes')}）`,
              plan.phases
                .map((p) => `${p.phase} ${p.durationMin}${t('partyDj.minutes')}：${p.gameIds.map((id) => getGameMeta(id)?.name ?? id).join('、')}`)
                .join('\n'),
              'https://cheersin.app',
            ].join('\n')
            void navigator.clipboard?.writeText(text).then(() => {
              setShareCopied(true)
              setTimeout(() => setShareCopied(false), 2000)
            })
          }}
          startPartyRef={startPartyRef}
          onReorderPhases={(newPhases) => plan && setPlan({ ...plan, phases: newPhases })}
          onStartParty={(roomId, roomCode) => {
            if (plan) {
              // Dynamic import to avoid SSR issues if any, or just use the hook context
              // But we can't use hook inside callback easily if not defined.
              // We need to access store in the component.
              // Let's add usePartyStore to top component.
              // See below for the added hook call.
              usePartyStore.getState().setRoomInfo(roomId, roomCode, true)
              usePartyStore.getState().setPartyPlan(plan)

              // Navigate
              router.push(`/room/${roomId}`)
            }
          }}
        />
      )}

      <Link href="/assistant" className="text-white/50 hover:text-white/80 text-sm print:hidden">
        {t('partyDj.askAssistant')}
      </Link>
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm print:hidden">
        {t('partyDj.backHome')}
      </Link>
    </div>
  )
}
