'use client'

import { ShoppingCart, Crown, Zap } from 'lucide-react'
import { CtaButton } from '@/components/ui/CtaButton'

/**
 * B10. CTA按鈕使用範例
 * 展示不同變體和效果的呼吸光暈按鈕
 */
export function CtaButtonDemo() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-center mb-12">CTA按鈕呼吸光暈效果</h1>
        
        {/* 主要購買按鈕 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white/80">主要購買按鈕 (Primary)</h2>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" intensity={2} speed={2}>
              <ShoppingCart className="w-5 h-5" />
              立即購買
            </CtaButton>
            
            <CtaButton variant="primary" intensity={3} speed={1.5}>
              <Crown className="w-5 h-5" />
              升級 Premium
            </CtaButton>
          </div>
        </div>

        {/* Premium按鈕 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white/80">Premium按鈕</h2>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="premium" intensity={2} speed={2}>
              <Crown className="w-5 h-5" />
              解鎖完整功能
            </CtaButton>
            
            <CtaButton variant="premium" intensity={3} speed={1.8}>
              <Zap className="w-5 h-5" />
              立即體驗
            </CtaButton>
          </div>
        </div>

        {/* Secondary按鈕 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white/80">次要按鈕 (Secondary)</h2>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="secondary" intensity={1} speed={2.5}>
              加入候補名單
            </CtaButton>
            
            <CtaButton variant="secondary" intensity={2} speed={2}>
              了解更多
            </CtaButton>
          </div>
        </div>

        {/* 不同強度對比 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white/80">動畫強度對比</h2>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" intensity={1} speed={2}>
              強度 1 (輕微)
            </CtaButton>
            
            <CtaButton variant="primary" intensity={2} speed={2}>
              強度 2 (標準)
            </CtaButton>
            
            <CtaButton variant="primary" intensity={3} speed={2}>
              強度 3 (強烈)
            </CtaButton>
          </div>
        </div>

        {/* 不同速度對比 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white/80">動畫速度對比</h2>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" intensity={2} speed={1}>
              速度快 (1秒)
            </CtaButton>
            
            <CtaButton variant="primary" intensity={2} speed={2}>
              速度中 (2秒)
            </CtaButton>
            
            <CtaButton variant="primary" intensity={2} speed={3}>
              速度慢 (3秒)
            </CtaButton>
          </div>
        </div>

        {/* 靜態按鈕對比 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white/80">靜態 vs 動畫</h2>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" breathing={false}>
              靜態按鈕
            </CtaButton>
            
            <CtaButton variant="primary" breathing={true}>
              動畫按鈕
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CtaButtonDemo