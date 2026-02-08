'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, BarChart3, Activity, Download } from 'lucide-react'
import { AdminSkeleton } from '../AdminSkeleton'
import { AdminForbidden } from '../AdminForbidden'

interface DayStat {
  calls: number
  success: number
  totalLatencyMs: number
  totalTokens: number
}
interface ModelStat {
  calls: number
  success: number
}
interface ApiCallRecord {
  id: string
  timestamp: number
  endpoint: string
  model: string
  success: boolean
  latencyMs: number
  totalTokens?: number
}

export default function AdminUsagePage() {
  const [byDay, setByDay] = useState<Record<string, DayStat>>({})
  const [byModel, setByModel] = useState<Record<string, ModelStat>>({})
  const [recent, setRecent] = useState<ApiCallRecord[]>([])
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (adminSecret) (headers as Record<string, string>)['x-admin-secret'] = adminSecret
    fetch('/api/admin/usage', { headers })
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          setForbidden(true)
          setByDay({})
          setByModel({})
          setRecent([])
          setError(null)
          return null
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: { byDay: Record<string, DayStat>; byModel: Record<string, ModelStat>; recent: ApiCallRecord[] } | null) => {
        if (data == null) return
        setForbidden(false)
        setByDay(data.byDay ?? {})
        setByModel(data.byModel ?? {})
        setRecent(data.recent ?? [])
        setError(null)
      })
      .catch((e) => {
        setError(e.message)
        setByDay({})
        setByModel({})
        setRecent([])
      })
      .finally(() => setLoading(false))
  }, [adminSecret])

  const exportCsv = useCallback(() => {
    const rows: string[] = []
    rows.push('類型,日期/時間,呼叫數,成功數,成功率%,平均延遲ms,Token總計')
    const dayEntries = Object.entries(byDay).sort(([a], [b]) => b.localeCompare(a))
    for (const [day, s] of dayEntries) {
      const pct = s.calls ? ((s.success / s.calls) * 100).toFixed(1) : '0'
      const avg = s.calls ? (s.totalLatencyMs / s.calls).toFixed(0) : '0'
      rows.push(`每日,${day},${s.calls},${s.success},${pct},${avg},${s.totalTokens ?? 0}`)
    }
    rows.push('')
    rows.push('類型,時間,端點,模型,成功,延遲ms,Token')
    for (const r of recent) {
      const ts = new Date(r.timestamp).toISOString()
      rows.push(`單筆,${ts},${r.endpoint},${r.model},${r.success},${r.latencyMs},${r.totalTokens ?? ''}`)
    }
    const csv = '\uFEFF' + rows.join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-usage-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [byDay, recent])

  const days = Object.entries(byDay).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14)
  const models = Object.entries(byModel)

  return (
    <main className="min-h-screen bg-dark-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            返回
          </Link>
          <h1 className="flex items-center gap-2 font-display font-bold text-xl">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            API 使用分析
          </h1>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/50 mb-1">Admin Secret（可選）</label>
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="與 .env ADMIN_SECRET 一致"
            className="w-full max-w-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30"
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <AdminSkeleton />
        ) : forbidden ? (
          <AdminForbidden />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white"
              >
                <Download className="w-4 h-4" />
                匯出 CSV
              </button>
            </div>
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                每日統計
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/50 border-b border-white/10">
                      <th className="text-left py-2">日期</th>
                      <th className="text-right py-2">呼叫數</th>
                      <th className="text-right py-2">成功率</th>
                      <th className="text-right py-2">平均延遲</th>
                      <th className="text-right py-2">Token 總計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(([day, s]) => (
                      <tr key={day} className="border-b border-white/5">
                        <td className="py-2">{day}</td>
                        <td className="text-right py-2">{s.calls}</td>
                        <td className="text-right py-2">{s.calls ? ((s.success / s.calls) * 100).toFixed(1) : 0}%</td>
                        <td className="text-right py-2">{s.calls ? (s.totalLatencyMs / s.calls).toFixed(0) : 0} ms</td>
                        <td className="text-right py-2">{s.totalTokens ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">依模型</h2>
              <div className="flex flex-wrap gap-4">
                {models.map(([model, s]) => (
                  <div key={model} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 min-w-[180px]">
                    <p className="text-xs text-white/50 truncate mb-1">{model}</p>
                    <p className="text-2xl font-bold">{s.calls}</p>
                    <p className="text-xs text-white/40">成功率 {(s.calls ? (s.success / s.calls) * 100 : 0).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">最近 50 筆</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/50">{new Date(r.timestamp).toISOString().slice(0, 19)}</span>
                    <span className={r.success ? 'text-green-400' : 'text-red-400'}>{r.model}</span>
                    <span>{r.latencyMs} ms</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
