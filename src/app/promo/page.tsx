'use client'

/** R2-230：雙11/促銷專屬頁 stub — 可配置倒數與活動文案 */
import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'
import { getPromoEndMs } from '@/config/pricing.config'
import { useState, useEffect } from 'react'

export default function PromoPage() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const endMs = getPromoEndMs()
  useEffect(() => {
    if (endMs <= 0) return
    const tick = () => setRemaining(Math.max(0, endMs - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endMs])

  const format = (ms: number) => {
    const d = Math.floor(ms / 86400000)
    const h = Math.floor((ms % 86400000) / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${d} 天 ${h} 時 ${m} 分 ${s} 秒`
  }

  return (
    <main className="min-h-screen pt-8 pb-16 px-4 safe-area-px max-w-2xl mx-auto" role="main" aria-label="限時優惠">
      <Link href="/pricing" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 games-focus-ring">
        <ArrowLeft className="w-4 h-4" />
        返回定價
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
        <Zap className="w-6 h-6 text-primary-400" />
        限時優惠
      </h1>
      <p className="text-white/60 text-sm mb-6">
        訂閱享首月半價等優惠，實際內容以定價頁與本站公告為準。
      </p>
      {remaining != null && remaining > 0 && (
        <div className="p-4 rounded-xl bg-primary-500/20 border border-primary-500/30 mb-6">
          <p className="text-primary-300 text-sm font-medium mb-1">優惠倒數</p>
          <p className="text-2xl font-mono font-bold text-white tabular-nums">{format(remaining)}</p>
        </div>
      )}
      <Link href="/pricing" className="inline-flex items-center gap-2 min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring">
        前往定價頁
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </Link>
    </main>
  )
}
