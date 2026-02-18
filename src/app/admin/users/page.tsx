'use client'

/**
 * P0-023：管理後台 — 用戶查找與訂閱狀態管理
 * 依 email 或 user id 查詢，顯示 profile 與訂閱紀錄；可更新訂閱階級。
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from '@/contexts/I18nContext'
import { getErrorMessage } from '@/lib/api-response'
import { Users, Search, Loader2, RefreshCw } from 'lucide-react'
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/subscription'
import { AdminSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminForbidden } from '@/components/admin/AdminForbidden'
import type { UserProfileDetail as Profile } from '@/store/useUserStore'

const API_USERS = '/api/admin/users'

interface SubRow {
  id: string
  plan_type: string
  status: string
  paypal_subscription_id: string | null
  start_date: string | null
  end_date: string | null
  auto_renew: boolean | null
  created_at: string | null
}

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [queryDebounced, setQueryDebounced] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(false)
  /** RACE-FIX: AbortController ref to cancel previous search requests */
  const abortControllerRef = useRef<AbortController | null>(null)
  
  useEffect(() => {
    const t = setTimeout(() => setQueryDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])
  
  useEffect(() => {
    if (queryDebounced.length < 3) return
    search(queryDebounced)
    // 僅在防抖後 query 變更時觸發搜尋，不依賴 search 避免重複請求
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryDebounced])
  
  /** RACE-FIX: Cleanup on unmount */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savingTier, setSavingTier] = useState(false)
  const [tierMessage, setTierMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  /** P1-151：表格排序 — 點擊表頭升序/降序 */
  const [sortKey, setSortKey] = useState<keyof SubRow | ''>('')
  const [sortAsc, setSortAsc] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}),
  }), [adminSecret])

  const search = useCallback(async (qOverride?: string) => {
    const q = (qOverride ?? queryDebounced ?? query).toString().trim()
    if (!q) {
      setError(t('admin.enterEmailOrUserId'))
      return
    }
    
    // RACE-FIX: Cancel any previous request
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    setLoading(true)
    setError(null)
    setProfile(null)
    setSubscriptions([])
    setTierMessage(null)
    try {
      const res = await fetch(`${API_USERS}?q=${encodeURIComponent(q)}`, { 
        headers: headers(),
        signal: controller.signal,
      })
      // RACE-FIX: Check if request was aborted
      if (controller.signal.aborted) return
      
      const data = await res.json()
      if (res.status === 401 || res.status === 403) {
        setForbidden(true)
        setProfile(null)
        setSubscriptions([])
        setLoading(false)
        return
      }
      if (!res.ok) {
        throw new Error(getErrorMessage(data, `HTTP ${res.status}`))
      }
      setForbidden(false)
      setProfile(data.profile ?? null)
      setSubscriptions(data.subscriptions ?? [])
    } catch (e) {
      // RACE-FIX: Ignore abort errors
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : t('admin.searchFailed'))
    } finally {
      // RACE-FIX: Only update loading if this is still the current request
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [query, queryDebounced, headers, t])

  const updateTier = useCallback(async (userId: string, subscription_tier: SubscriptionTier) => {
    setSavingTier(true)
    setTierMessage(null)
    try {
      const res = await fetch(API_USERS, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ userId, subscription_tier }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(getErrorMessage(data, `HTTP ${res.status}`))
      }
      setTierMessage({ type: 'ok', text: t('admin.tierUpdated') })
      if (profile?.id === userId) {
        setProfile((p) => (p ? { ...p, subscription_tier } : null))
      }
    } catch (e) {
      setTierMessage({ type: 'err', text: e instanceof Error ? e.message : t('admin.updateFailed') })
    } finally {
      setSavingTier(false)
    }
  }, [headers, profile?.id, t])

  if (forbidden) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-400" aria-hidden />
          <h1 className="text-xl font-semibold text-white">{t('admin.titleUsers')}</h1>
        </div>
        <AdminForbidden message={t('admin.forbiddenMessage')} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary-400" aria-hidden />
        <h1 className="text-xl font-semibold text-white">{t('admin.titleUsers')}</h1>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-4">
        <label className="block text-sm text-white/80">{t('admin.adminSecretLabel')}</label>
        <input
          type="password"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          placeholder="x-admin-secret"
          className="w-full max-w-md px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm min-h-[44px]"
          aria-label={t('admin.adminSecretLabel')}
        />
        <label className="block text-sm text-white/80">{t('admin.queryLabel')}</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search(query.trim())}
            placeholder={t('admin.queryPlaceholder')}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm min-h-[44px]"
            aria-label={t('admin.queryPlaceholder')}
          />
          <button
            type="button"
            onClick={() => search(query.trim())}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium min-h-[44px] disabled:opacity-50"
            aria-label={t('admin.searchAria')}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Search className="w-4 h-4" aria-hidden />}
            {t('admin.searchButton')}
          </button>
        </div>
        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        {tierMessage && (
          <p className={`text-sm ${tierMessage.type === 'ok' ? 'text-green-400' : 'text-red-400'}`} role="status">
            {tierMessage.text}
          </p>
        )}
      </div>

      {loading && !profile && !error ? (
        <AdminSkeleton />
      ) : profile ? (
        <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-4">
          <h2 className="text-lg font-medium text-white">{t('admin.userProfile')}</h2>
          <dl className="grid gap-2 text-sm">
            <div><dt className="text-white/60">ID</dt><dd className="text-white font-mono break-all">{profile.id}</dd></div>
            <div><dt className="text-white/60">Email</dt><dd className="text-white">{profile.email ?? '—'}</dd></div>
            <div><dt className="text-white/60">{t('admin.displayName')}</dt><dd className="text-white">{profile.display_name ?? '—'}</dd></div>
            <div><dt className="text-white/60">{t('admin.subscriptionTier')}</dt>
              <dd className="flex items-center gap-2 flex-wrap">
                <span className="text-white">{SUBSCRIPTION_TIERS[profile.subscription_tier as SubscriptionTier]?.label ?? profile.subscription_tier ?? '—'}</span>
                {!savingTier ? (
                  <select
                    value={profile.subscription_tier ?? 'free'}
                    onChange={(e) => updateTier(profile.id, e.target.value as SubscriptionTier)}
                    className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm min-h-[44px]"
                    aria-label={t('admin.subscriptionTier')}
                  >
                    {(['free', 'basic', 'premium'] as const).map((tier) => (
                      <option key={tier} value={tier}>{SUBSCRIPTION_TIERS[tier].label}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-white/60 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> {t('admin.savingTier')}</span>
                )}
              </dd>
            </div>
            <div><dt className="text-white/60">{t('admin.createdAt')}</dt><dd className="text-white/80">{profile.created_at ? new Date(profile.created_at).toLocaleString() : '—'}</dd></div>
          </dl>
        </div>
      ) : null}

      {profile && subscriptions.length > 0 && (() => {
        const sorted = [...subscriptions].sort((a, b) => {
          if (!sortKey) return 0
          const va = a[sortKey] ?? ''
          const vb = b[sortKey] ?? ''
          const cmp = typeof va === 'string' && typeof vb === 'string' ? va.localeCompare(vb) : String(va).localeCompare(String(vb))
          return sortAsc ? cmp : -cmp
        })
        return (
          <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-3">
            <h2 className="text-lg font-medium text-white">{t('admin.subscriptions')}</h2>
            {/* P1-175：長表格固定表頭，滾動時仍可見列名 */}
            <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-[#0a0a1a] border-b border-white/10">
                  <tr className="text-white/60">
                    {(['plan_type', 'status', 'paypal_subscription_id', 'start_date', 'end_date', 'auto_renew'] as const).map((key) => (
                      <th
                        key={key}
                        className="py-2 pr-4 cursor-pointer hover:text-white select-none"
                        onClick={() => { setSortKey(key); setSortAsc((prev) => sortKey === key ? !prev : true) }}
                        role="columnheader"
                        aria-sort={sortKey === key ? (sortAsc ? 'ascending' : 'descending') : undefined}
                      >
                        {key === 'plan_type' ? t('admin.planType') : key === 'status' ? t('admin.status') : key === 'paypal_subscription_id' ? t('admin.paypalId') : key === 'start_date' ? t('admin.startDate') : key === 'end_date' ? t('admin.endDate') : t('admin.autoRenew')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 text-white/90">
                      <td className="py-2 pr-4">{s.plan_type}</td>
                      <td className="py-2 pr-4">{s.status}</td>
                      <td className="py-2 pr-4 font-mono text-xs break-all">{s.paypal_subscription_id ?? '—'}</td>
                      <td className="py-2 pr-4">{s.start_date ? new Date(s.start_date).toLocaleDateString() : '—'}</td>
                      <td className="py-2 pr-4">{s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}</td>
                      <td className="py-2">{s.auto_renew ? '是' : '否'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {profile && subscriptions.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <h2 className="text-lg font-medium text-white mb-2">{t('admin.subscriptions')}</h2>
          <p className="text-white/60 text-sm">{t('admin.noSubscriptions')}</p>
        </div>
      )}

      {!loading && query.trim() && !profile && !error && (
        <p className="text-white/60 text-sm">{t('admin.noUserFound')}</p>
      )}
    </div>
  )
}
