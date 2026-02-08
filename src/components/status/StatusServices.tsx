'use client'

import { useEffect, useState } from 'react'
import { Server, CreditCard, Database, Cpu, Cloud, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type ServiceStatus = 'connected' | 'error' | 'checking' | 'not_configured'

interface ServiceItem {
  name: string
  status: ServiceStatus
  latency?: number
  message?: string
  hint?: string
}

interface HealthResponse {
  timestamp: string
  summary: string
  healthy: boolean
  services: ServiceItem[]
}

const ICON_MAP = {
  Supabase: Database,
  'Groq AI': Cpu,
  OpenRouter: Cloud,
  Pinecone: Cloud,
  PayPal: CreditCard,
}

/** 狀態頁即時服務狀態：呼叫 /api/health，顯示 Supabase / PayPal 等連線結果，解決「未連接」除錯 */
export default function StatusServices() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch('/api/health')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '無法取得狀態')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-center gap-2 text-white/60">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
        <span>正在檢查服務連線…</span>
      </div>
    )
  }

  if (error || !data?.services?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-amber-400 text-sm">
        {error ?? '無法取得服務狀態。請確認 .env.local 已設定並重啟 dev server。'}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-white/90 mb-3">
        服務連線狀態（即時）
        <span className="ml-2 text-white/50 font-normal">{data.summary}</span>
      </h2>
      <ul className="space-y-2" role="list">
        {data.services.map((svc) => {
          const Icon = ICON_MAP[svc.name as keyof typeof ICON_MAP] ?? Server
          const isOk = svc.status === 'connected'
          const isNotConfigured = svc.status === 'not_configured'
          const statusText = isOk ? '已連接' : isNotConfigured ? '未設定' : '異常'
          const StatusIcon = isOk ? CheckCircle : isNotConfigured ? AlertCircle : XCircle
          const statusColor = isOk ? 'text-emerald-400' : isNotConfigured ? 'text-amber-400' : 'text-red-400'
          return (
            <li key={svc.name} className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-white/50 shrink-0" aria-hidden />
                <span className="text-white/80 flex-1">{svc.name}</span>
                {svc.latency != null && (
                  <span className="text-white/50 text-xs">{svc.latency}ms</span>
                )}
                <span className={`flex items-center gap-1 ${statusColor}`}>
                  <StatusIcon className="w-4 h-4" aria-hidden />
                  {statusText}
                </span>
              </div>
              {(svc.message || svc.hint) && (
                <p className="text-white/50 text-xs pl-8">
                  {svc.hint || svc.message}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
