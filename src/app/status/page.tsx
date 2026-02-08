import Link from 'next/link'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import StatusServices from '@/components/status/StatusServices'

/** E74 P2：狀態頁 — 維修時 MaintenanceBanner 連此頁；即時顯示 Supabase / PayPal 等連線狀態。 */
export default function StatusPage() {
  return (
    <main className="min-h-screen px-4 py-12 md:py-16 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首頁
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-8 h-8 text-emerald-400" aria-hidden />
        <h1 className="text-2xl font-display font-bold text-white">系統狀態</h1>
      </div>
      <p className="text-white/60 text-sm mb-8">
        若首頁顯示維護公告，表示我們正在進行維護，部分功能可能暫時無法使用。下方為即時服務連線狀態：未設定表示 .env.local 未填該服務變數；異常表示連線或金鑰錯誤，可依提示修正。
      </p>
      <div className="mb-6">
        <StatusServices />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <p className="text-white/80 text-sm">
          如有異常請透過{' '}
          <a href="mailto:hello@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">
            聯絡我們
          </a>{' '}
          回報。
        </p>
      </div>
    </main>
  )
}
