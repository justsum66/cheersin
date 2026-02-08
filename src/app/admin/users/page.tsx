'use client'

/**
 * P0-023：管理後台 — 用戶查找與訂閱狀態管理
 * 依 email 或 user id 查詢，顯示 profile 與訂閱紀錄；可更新訂閱階級。
 */
import { useState, useCallback, useEffect } from 'react'
import { getErrorMessage } from '@/lib/api-response'
import { Users, Search, Loader2, RefreshCw } from 'lucide-react'
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/subscription'
import { AdminSkeleton } from '../AdminSkeleton'
import { AdminForbidden } from '../AdminForbidden'

const API_USERS = '/api/admin/users'

interface Profile {
  id: string
  email: string | null
  display_name: string | null
  subscription_tier: string | null
  created_at: string | null
  updated_at: string | null
}

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
  const [query, setQuery] = useState('')
  const [queryDebounced, setQueryDebounced] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(false)
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
      setError('請輸入 email 或 user id')
      return
    }
    setLoading(true)
    setError(null)
    setProfile(null)
    setSubscriptions([])
    setTierMessage(null)
    try {
      const res = await fetch(`${API_USERS}?q=${encodeURIComponent(q)}`, { headers: headers() })
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
      setError(e instanceof Error ? e.message : '查詢失敗')
    } finally {
      setLoading(false)
    }
  }, [query, queryDebounced, headers])

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
      setTierMessage({ type: 'ok', text: '已更新訂閱階級' })
      if (profile?.id === userId) {
        setProfile((p) => (p ? { ...p, subscription_tier } : null))
      }
    } catch (e) {
      setTierMessage({ type: 'err', text: e instanceof Error ? e.message : '更新失敗' })
    } finally {
      setSavingTier(false)
    }
  }, [headers, profile?.id])

  if (forbidden) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-400" aria-hidden />
          <h1 className="text-xl font-semibold text-white">用戶與訂閱管理</h1>
        </div>
        <AdminForbidden message="請提供正確的 Admin Secret 或於開發環境使用。" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary-400" aria-hidden />
        <h1 className="text-xl font-semibold text-white">用戶與訂閱管理</h1>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-4">
        <label className="block text-sm text-white/80">管理員密鑰（可選，未設時 dev 放行）</label>
        <input
          type="password"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          placeholder="x-admin-secret"
          className="w-full max-w-md px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm min-h-[44px]"
          aria-label="管理員密鑰"
        />
        <label className="block text-sm text-white/80">查詢（email 或 user id）</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search(query.trim())}
            placeholder="user@example.com 或 uuid"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm min-h-[44px]"
            aria-label="查詢 email 或 user id"
          />
          <button
            type="button"
            onClick={() => search(query.trim())}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium min-h-[44px] disabled:opacity-50"
            aria-label="搜尋用戶"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Search className="w-4 h-4" aria-hidden />}
            搜尋
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
          <h2 className="text-lg font-medium text-white">用戶資料</h2>
          <dl className="grid gap-2 text-sm">
            <div><dt className="text-white/60">ID</dt><dd className="text-white font-mono break-all">{profile.id}</dd></div>
            <div><dt className="text-white/60">Email</dt><dd className="text-white">{profile.email ?? '—'}</dd></div>
            <div><dt className="text-white/60">顯示名稱</dt><dd className="text-white">{profile.display_name ?? '—'}</dd></div>
            <div><dt className="text-white/60">訂閱階級</dt>
              <dd className="flex items-center gap-2 flex-wrap">
                <span className="text-white">{SUBSCRIPTION_TIERS[profile.subscription_tier as SubscriptionTier]?.label ?? profile.subscription_tier ?? '—'}</span>
                {!savingTier ? (
                  <select
                    value={profile.subscription_tier ?? 'free'}
                    onChange={(e) => updateTier(profile.id, e.target.value as SubscriptionTier)}
                    className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm min-h-[44px]"
                    aria-label="變更訂閱階級"
                  >
                    {(['free', 'basic', 'premium'] as const).map((t) => (
                      <option key={t} value={t}>{SUBSCRIPTION_TIERS[t].label}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-white/60 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> 儲存中…</span>
                )}
              </dd>
            </div>
            <div><dt className="text-white/60">建立時間</dt><dd className="text-white/80">{profile.created_at ? new Date(profile.created_at).toLocaleString() : '—'}</dd></div>
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
          <h2 className="text-lg font-medium text-white">訂閱紀錄</h2>
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
                      {key === 'plan_type' ? '方案' : key === 'status' ? '狀態' : key === 'paypal_subscription_id' ? 'PayPal ID' : key === 'start_date' ? '開始' : key === 'end_date' ? '結束' : '自動續訂'}
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
          <h2 className="text-lg font-medium text-white mb-2">訂閱紀錄</h2>
          <p className="text-white/60 text-sm">尚無訂閱紀錄</p>
        </div>
      )}

      {!loading && query.trim() && !profile && !error && (
        <p className="text-white/60 text-sm">找不到符合的用戶</p>
      )}
    </div>
  )
}
