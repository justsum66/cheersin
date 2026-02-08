'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Crown, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import type { SubscriptionTier } from '@/lib/subscription'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription'
import { UpgradeModal } from '@/components/UpgradeModal'

interface PaidGameLockProps {
  /** 遊戲名稱 */
  gameName: string
  /** 所需訂閱等級 */
  requiredTier: SubscriptionTier
  /** 關閉回調（返回遊戲列表） */
  onClose?: () => void
  /** 遊戲分類（可選，用於顯示） */
  category?: string
}

/** G0.5：付費遊戲鎖定覆蓋層，顯示升級提示與 CTA */
export function PaidGameLock({ gameName, requiredTier, onClose, category }: PaidGameLockProps) {
  const { tier } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const tierOrder: SubscriptionTier[] = ['free', 'basic', 'premium']
  const requiredIndex = tierOrder.indexOf(requiredTier)
  const currentIndex = tierOrder.indexOf(tier)
  const hasAccess = currentIndex >= requiredIndex

  // 如果已有權限，不顯示鎖定
  if (hasAccess) return null

  const tierLabel = SUBSCRIPTION_TIERS[requiredTier]?.label ?? requiredTier

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paid-game-lock-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
        >
          {/* 漸層背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-purple-900/80 to-[#0a0a1a] opacity-95" />
          
          {/* 裝飾光暈 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl" />

          {/* 內容 */}
          <div className="relative z-10 p-8 text-center">
            {/* 關閉按鈕 */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors games-focus-ring"
                aria-label="關閉"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            )}

            {/* 鎖定圖示 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center mb-6 border border-white/10"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* P1-187：付費牆文案 — 強調解鎖後能獲得的刺激體驗，而非「你需要付費」 */}
            <h2 id="paid-game-lock-title" className="text-2xl font-display font-bold text-white mb-2">
              解鎖「{gameName}」— 更多刺激在等你
            </h2>

            {/* 分類標籤 */}
            {category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                {category}
              </span>
            )}

            {/* P1-261：付費牆社交證明 — 已有 XXX 人解鎖，促進轉化 */}
            <p className="text-white/60 text-sm mb-2">
              已有超過 1,200 位玩家解鎖辣味通行證
            </p>
            {/* 說明：解鎖後能獲得什麼 */}
            <p className="text-white/80 mb-6">
              升級 <span className="text-primary-400 font-semibold">{tierLabel}</span> 立即解鎖這款遊戲，與朋友玩到嗨。
            </p>

            {/* 功能列表 */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-secondary-400" />
                {tierLabel} 方案特權
              </h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  解鎖所有 18+ 辣味遊戲
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  無限 AI 對話次數
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  最多 12 人遊戲房間
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  進階課程完整存取
                </li>
              </ul>
            </div>

            {/* CTA 按鈕 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all games-focus-ring"
              >
                立即升級
              </button>
              <Link
                href="/pricing"
                className="w-full py-3 px-6 rounded-xl bg-white/10 text-white/80 font-medium hover:bg-white/15 transition-colors games-focus-ring text-center"
              >
                查看方案詳情
              </Link>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white/50 text-sm hover:text-white/70 transition-colors"
                >
                  返回遊戲列表
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 升級 Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier={requiredTier}
      />
    </>
  )
}

/** GameCard 用的簡化版鎖定標籤（顯示在卡片上） */
export function PaidGameBadge({ requiredTier }: { requiredTier: SubscriptionTier }) {
  const tierLabel = SUBSCRIPTION_TIERS[requiredTier]?.label ?? requiredTier
  
  return (
    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-primary-500/90 to-accent-500/90 text-white text-[10px] font-bold tracking-wider shadow-md z-10">
      <Lock className="w-3 h-3" />
      {tierLabel}
    </span>
  )
}
