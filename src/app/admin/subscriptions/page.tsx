'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'

interface SubscriptionStats {
  total_active: number
  total_cancelled: number
  total_suspended: number
  mrr: number
  churn_count_30d: number
  new_subs_30d: number
  refund_requests_pending: number
  revenue_30d: number
}

/** PAY-014: Subscription analytics dashboard for admin */
export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/subscription-stats')
      if (!res.ok) {
        setError(`Failed to load (${res.status})`)
        return
      }
      const data = await res.json()
      setStats(data)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const churnRate = useMemo(() => {
    if (!stats || stats.total_active === 0) return 0
    return ((stats.churn_count_30d / (stats.total_active + stats.churn_count_30d)) * 100).toFixed(1)
  }, [stats])

  const ltv = useMemo(() => {
    if (!stats || !stats.mrr || stats.total_active === 0) return 0
    const avgRevPerUser = stats.mrr / stats.total_active
    const churn = stats.churn_count_30d / Math.max(1, stats.total_active + stats.churn_count_30d)
    return churn > 0 ? Math.round(avgRevPerUser / churn) : Math.round(avgRevPerUser * 12)
  }, [stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
        <p className="text-white/60 mb-4">{error}</p>
        <button onClick={fetchStats} className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const cards: { label: string; value: string | number; icon: typeof Users; color: string; sub?: string }[] = [
    {
      label: 'Active Subscriptions',
      value: stats?.total_active ?? 0,
      icon: Users,
      color: 'text-green-400',
      sub: `+${stats?.new_subs_30d ?? 0} new (30d)`,
    },
    {
      label: 'MRR (Monthly Recurring)',
      value: `NT$${(stats?.mrr ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-primary-400',
    },
    {
      label: '30d Revenue',
      value: `NT$${(stats?.revenue_30d ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-400',
    },
    {
      label: 'Churn Rate (30d)',
      value: `${churnRate}%`,
      icon: TrendingDown,
      color: 'text-red-400',
      sub: `${stats?.churn_count_30d ?? 0} cancelled`,
    },
    {
      label: 'Est. LTV',
      value: `NT$${Number(ltv).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-400',
    },
    {
      label: 'Suspended',
      value: stats?.total_suspended ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      sub: `${stats?.refund_requests_pending ?? 0} refund requests`,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Subscription Analytics</h1>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} aria-hidden />
                <span className="text-white/50 text-sm">{card.label}</span>
              </div>
              <p className="text-white text-2xl font-bold">{card.value}</p>
              {card.sub && <p className="text-white/40 text-xs mt-1">{card.sub}</p>}
            </div>
          )
        })}
      </div>

      {/* Quick status breakdown */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-white font-semibold mb-4">Status Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Active', count: stats?.total_active ?? 0, color: 'bg-green-500' },
            { label: 'Cancelled', count: stats?.total_cancelled ?? 0, color: 'bg-red-500' },
            { label: 'Suspended', count: stats?.total_suspended ?? 0, color: 'bg-yellow-500' },
          ].map(row => {
            const total = (stats?.total_active ?? 0) + (stats?.total_cancelled ?? 0) + (stats?.total_suspended ?? 0)
            const pct = total > 0 ? (row.count / total) * 100 : 0
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/70">{row.label}</span>
                  <span className="text-white/50">{row.count} ({pct.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.color} transition-all`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
