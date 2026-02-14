'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { Wine, Heart, ArrowLeft } from 'lucide-react'

/** P1-270：贊助一杯酒 — 小額打賞，輕量級支持方式 */
export default function SponsorPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative"
      >
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center"
        >
          <Wine className="w-10 h-10 text-white" aria-hidden />
        </m.div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">贊助一杯酒</h1>
        <p className="text-white/70 text-sm mb-6">
          喜歡 Cheersin 嗎？請我們喝一杯，支持我們持續開發更多派對遊戲與品酒內容。
        </p>
        <div className="space-y-3 mb-8">
          <a
            href="mailto:hello@cheersin.app?subject=贊助一杯酒"
            className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3 rounded-xl bg-primary-500/20 border border-primary-400/40 text-primary-300 hover:bg-primary-500/30 transition-colors font-medium"
          >
            <Heart className="w-5 h-5" />
            聯絡我們贊助
          </a>
          <Link
            href="/pricing"
            className="block w-full min-h-[48px] py-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/15 transition-colors text-sm font-medium"
          >
            改為訂閱支持
          </Link>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首頁
        </Link>
      </m.div>
    </main>
  )
}
