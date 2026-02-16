'use client'

import { memo, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Lock, Crown, Zap, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { SubscriptionTier } from '@/lib/subscription'

export interface PaywallProps {
  /** 是否顯示 */
  isOpen: boolean
  /** 關閉回調 */
  onClose: () => void
  /** 被鎖定的功能名稱 */
  feature: string
  /** 需要的訂閱等級 */
  requiredTier: 'basic' | 'premium'
  /** 當前用戶等級 */
  currentTier?: SubscriptionTier
  /** 功能描述 (可選) */
  description?: string
}

/** 付費牆組件 - 當免費用戶嘗試使用付費功能時顯示 */
function PaywallComponent({
  isOpen,
  onClose,
  feature,
  requiredTier,
  currentTier = 'free',
  description,
}: PaywallProps) {
  const tierInfo = {
    basic: {
      name: '個人方案',
      price: 99,
      icon: Zap,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20',
      borderColor: 'border-primary-500/30',
    },
    premium: {
      name: 'VIP 方案',
      price: 199,
      icon: Crown,
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/20',
      borderColor: 'border-accent-500/30',
    },
  }

  const info = tierInfo[requiredTier]
  const TierIcon = info.icon

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="paywall-title"
        >
          <m.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative bg-dark-900 border ${info.borderColor} rounded-2xl p-6 max-w-sm w-full shadow-2xl`}
          >
            {/* 關閉按鈕 */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="關閉"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 鎖定圖示 */}
            <div className={`w-16 h-16 rounded-2xl ${info.bgColor} flex items-center justify-center mx-auto mb-4`}>
              <Lock className={`w-8 h-8 ${info.color}`} />
            </div>

            {/* 標題 */}
            <h2 id="paywall-title" className="text-xl font-bold text-white text-center mb-2">
              升級解鎖「{feature}」
            </h2>

            {/* 描述 */}
            <p className="text-white/70 text-center text-sm mb-6">
              {description || `此功能需要 ${info.name} 才能使用`}
            </p>

            {/* 方案卡片 */}
            <div className={`border ${info.borderColor} rounded-xl p-4 mb-6 ${info.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TierIcon className={`w-5 h-5 ${info.color}`} />
                  <span className="font-semibold text-white">{info.name}</span>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${info.color}`}>NT${info.price}</span>
                  <span className="text-white/60 text-sm">/月</span>
                </div>
              </div>
              <ul className="text-white/80 text-sm space-y-1">
                {requiredTier === 'basic' ? (
                  <>
                    <li>✓ 無限 AI 對話</li>
                    <li>✓ 全部派對遊戲</li>
                    <li>✓ 8 人遊戲房間</li>
                  </>
                ) : (
                  <>
                    <li>✓ 個人方案全部功能</li>
                    <li>✓ 12 人遊戲房間</li>
                    <li>✓ 專屬課程 + 專家諮詢</li>
                  </>
                )}
              </ul>
            </div>

            {/* CTA 按鈕 */}
            <Link
              href="/pricing"
              className={`flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl ${
                requiredTier === 'basic'
                  ? 'bg-primary-500 hover:bg-primary-600'
                  : 'bg-accent-500 hover:bg-accent-600'
              } text-white font-semibold transition-colors`}
              onClick={onClose}
            >
              立即升級
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* 底部提示 */}
            <p className="text-white/50 text-xs text-center mt-4">
              首月半價 · 隨時取消 · 30 秒開通
            </p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export const Paywall = memo(PaywallComponent)
export default Paywall
