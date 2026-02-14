'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { Heart, Sparkles, Gamepad2, Bot } from 'lucide-react'

/** P1-266：感謝頁 — 支付完成後可導向此頁，展示解鎖內容並引導立即體驗 */
export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative"
      >
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-white" aria-hidden />
        </m.div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">感謝您的支持</h1>
        <p className="text-white/70 text-sm mb-6">
          您已解鎖辣味通行證與完整功能，現在就開始體驗吧。
        </p>
        <ul className="text-left text-white/80 text-sm space-y-2 mb-8">
          <li className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary-400 shrink-0" />
            所有 18+ 辣味遊戲
          </li>
          <li className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary-400 shrink-0" />
            無限 AI 對話
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400 shrink-0" />
            進階課程與專屬權益
          </li>
        </ul>
        <div className="space-y-3">
          <Link
            href="/quiz"
            className="btn-primary flex items-center justify-center gap-2 w-full min-h-[48px] py-4 rounded-2xl font-semibold"
          >
            <Sparkles className="w-5 h-5" aria-hidden />
            開始靈魂酒測
          </Link>
          <Link
            href="/games"
            className="btn-secondary flex items-center justify-center gap-2 w-full min-h-[48px] py-4 rounded-2xl font-medium"
          >
            <Gamepad2 className="w-5 h-5" aria-hidden />
            去玩遊戲
          </Link>
          <Link href="/" className="block text-white/50 hover:text-white text-sm py-2">
            返回首頁
          </Link>
        </div>
      </m.div>
    </main>
  )
}
