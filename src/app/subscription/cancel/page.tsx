'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HelpCircle, Gift, RotateCcw } from 'lucide-react';
import { CANCELLED_AT_KEY } from '@/lib/subscription-retention';

/** P3-55：取消頁顯示挽留窗至 current_period_end */
export default function SubscriptionCancelPage() {
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(CANCELLED_AT_KEY, Date.now().toString());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch('/api/subscription', { method: 'GET', credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const end = data?.subscription?.current_period_end
        if (end && /^\d{4}-\d{2}-\d{2}$/.test(end)) setPeriodEnd(end)
      })
      .catch(() => {})
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-12 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <HelpCircle className="w-10 h-10 text-yellow-400" aria-hidden />
        </div>

        <h1 className="home-heading-2 font-display font-bold text-white mb-2">訂閱已取消</h1>
        {/* E49 / P3-55：已取消，可使用至 current_period_end；無則以當期結束日說明 */}
        <p className="text-white/90 text-sm mb-2" role="status">
          {periodEnd
            ? `已取消。您的方案可使用至 ${periodEnd}。`
            : '已取消。您的方案可使用至當期結束日。'}
        </p>
        <p className="home-text-muted mb-2 max-w-[65ch] mx-auto">
          沒關係，你隨時可以回來！免費功能依然可以使用。
        </p>
        <p className="text-white/60 text-sm mb-6 max-w-[65ch] mx-auto">
          到期日請至{' '}
          <Link href="/subscription" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">訂閱管理</Link> 查看。
        </p>

        {/* P3 挽留：保留方案優惠文案 */}
        <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-left">
          <p className="text-sm text-white/90 font-medium flex items-center gap-2 mb-1">
            <RotateCcw className="w-4 h-4 text-primary-400 shrink-0" aria-hidden />
            改變心意？
          </p>
          <p className="text-xs text-white/60">
            保留方案可再送 7 天使用，或隨時重新訂閱享首月優惠。
          </p>
        </div>

        {/* P2 任務 37：取消頁 CTA 層次 — 主 CTA 保留方案、次 CTA 訂閱管理 */}
        <div className="space-y-3" role="group" aria-label="下一步動作">
          <Link href="/pricing" className="btn-primary block w-full text-center min-h-[48px] py-3 games-focus-ring rounded-xl font-semibold">
            保留方案 / 重新訂閱
          </Link>
          <Link href="/subscription" className="btn-secondary block w-full text-center min-h-[48px] games-focus-ring rounded-xl">
            訂閱管理
          </Link>
          <Link href="/" className="block w-full text-center py-3 min-h-[48px] inline-flex items-center justify-center text-sm text-white/60 hover:text-white font-medium transition-colors games-focus-ring rounded">
            回到首頁
          </Link>
        </div>

        {/* Special offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-primary-500/10 rounded-xl border border-primary-500/30"
        >
          <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-primary-400 shrink-0" aria-hidden />
            限時優惠：首月訂閱享 <span className="text-primary-500 font-bold">8 折</span> 優惠
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
