import Link from 'next/link'
import { CheckCircle, ArrowLeft, Server, CreditCard, Database } from 'lucide-react'

/** E74 P2：狀態頁 — 維修時 MaintenanceBanner 連此頁；各服務狀態可查。 */
const SERVICE_ITEMS = [
  { id: 'website', label: '網站', icon: Server, status: 'normal' as const },
  { id: 'api', label: 'API', icon: Server, status: 'normal' as const },
  { id: 'paypal', label: '付款（PayPal）', icon: CreditCard, status: 'normal' as const },
  { id: 'database', label: '資料庫', icon: Database, status: 'normal' as const },
]

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
        若首頁顯示維護公告，表示我們正在進行維護，部分功能可能暫時無法使用。重大維修前會盡量提前公告。若付款服務（PayPal）暫不可用，訂閱流程會顯示「付款服務暫不可用，請稍後再試」。
      </p>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 mb-6">
        <h2 className="text-sm font-semibold text-white/90 mb-3">服務狀態</h2>
        <ul className="space-y-2" role="list">
          {SERVICE_ITEMS.map(({ id, label, icon: Icon, status }) => (
            <li key={id} className="flex items-center gap-3 text-sm">
              <Icon className="w-5 h-5 text-white/50 shrink-0" aria-hidden />
              <span className="text-white/80">{label}</span>
              <span className="ml-auto text-emerald-400">{status === 'normal' ? '正常運作' : '異常'}</span>
            </li>
          ))}
        </ul>
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
