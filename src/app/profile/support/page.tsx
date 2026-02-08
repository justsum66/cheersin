'use client'

import Link from 'next/link'
import { MessageCircle, ArrowLeft, Mail } from 'lucide-react'

/** P1-257：付費用戶專屬客服通道 — Pro 用戶優先支援入口 */
export default function ProfileSupportPage() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回個人頁
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-8 h-8 text-primary-400" aria-hidden />
        <h1 className="text-2xl font-display font-bold text-white">客服與支援</h1>
      </div>
      <p className="text-white/70 text-sm mb-6">
        Pro 用戶享有優先回覆。請描述您的問題，我們會盡快處理。
      </p>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white/90 mb-2">專屬信箱（Pro 優先）</h2>
          <a
            href="mailto:support@cheersin.app?subject=Pro%20用戶支援"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium"
          >
            <Mail className="w-4 h-4" />
            support@cheersin.app
          </a>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white/90 mb-2">一般諮詢</h2>
          <a
            href="mailto:hello@cheersin.app"
            className="text-white/70 hover:text-white text-sm"
          >
            hello@cheersin.app
          </a>
        </div>
        <p className="text-white/50 text-xs pt-2">
          訂閱與退款請見<Link href="/refund-policy" className="text-primary-400 hover:underline ml-1">退款政策</Link>與<Link href="/subscription" className="text-primary-400 hover:underline ml-1">訂閱管理</Link>。
        </p>
      </div>
    </main>
  )
}
