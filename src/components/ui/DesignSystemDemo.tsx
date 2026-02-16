/**
 * 設計系統示範元件
 * 展示所有標準化元件的使用方式
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { 
  buttonVariants, 
  textVariants,
  Spacing,
  getColor,
  getAnimation
} from '@/components/ui/ComponentFactory'
import { cn } from '@/lib/utils'

const DesignSystemDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] to-[#0a0a0a] p-8">
      {/* 標題區 */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className={cn(textVariants({ variant: 'h1', weight: 'bold' }))}>
          設計系統標準化示範
        </h1>
        <p className={cn(textVariants({ variant: 'body' }), 'mt-4 max-w-2xl')}>
          這裡展示了統一的設計語言，所有元件都遵循相同的設計 tokens 和規範。
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 按鈕示範 */}
        <GlassCard>
          <div className="space-y-4">
            <h3 className={textVariants({ variant: 'h3' })}>
              按鈕變體
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">主要按鈕</Button>
              <Button variant="secondary">次要按鈕</Button>
              <Button variant="danger">危險按鈕</Button>
              <Button variant="ghost">幽靈按鈕</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">小型按鈕</Button>
              <Button variant="primary" size="lg">大型按鈕</Button>
            </div>
            
            <Button variant="primary" className="w-full">
              全寬按鈕
            </Button>
          </div>
        </GlassCard>

        {/* 卡片示範 */}
        <GlassCard>
          <div className="space-y-4">
            <h3 className={textVariants({ variant: 'h3' })}>
              卡片變體
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <h4 className={textVariants({ variant: 'h4' })}>標準卡片</h4>
                <p className={textVariants({ variant: 'body' })}>
                  這是標準的卡片樣式
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-[#FF2E63]/30 rounded-xl p-4 shadow-[0_0_20px_rgba(255,46,99,0.3)]">
                <h4 className={textVariants({ variant: 'h4', weight: 'bold' })}>
                  霓虹卡片
                </h4>
                <p className={textVariants({ variant: 'body' })}>
                  帶有霓虹邊框效果
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 文字系統示範 */}
        <GlassCard>
          <div className="space-y-4">
            <h3 className={textVariants({ variant: 'h3' })}>
              文字系統
            </h3>
            <div className="space-y-2">
              <h1 className={textVariants({ variant: 'h1' })}>H1 標題</h1>
              <h2 className={textVariants({ variant: 'h2' })}>H2 標題</h2>
              <h3 className={textVariants({ variant: 'h3' })}>H3 標題</h3>
              <h4 className={textVariants({ variant: 'h4' })}>H4 標題</h4>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-white/10">
              <p className={textVariants({ variant: 'body' })}>
                這是標準的內文文字，使用 16px 字級和適當的行高。
              </p>
              <p className={textVariants({ variant: 'caption' })}>
                這是說明文字，使用較小的字級。
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
              <span className={textVariants({ variant: 'success' })}>成功訊息</span>
              <span className={textVariants({ variant: 'error' })}>錯誤訊息</span>
              <span className={textVariants({ variant: 'warning' })}>警告訊息</span>
              <span className={textVariants({ variant: 'info' })}>資訊訊息</span>
            </div>
          </div>
        </GlassCard>

        {/* 間距系統示範 */}
        <GlassCard>
          <div className="space-y-4">
            <h3 className={textVariants({ variant: 'h3' })}>
              間距系統
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#D4AF37] rounded"></div>
                <Spacing size={2} direction="horizontal" />
                <span className={textVariants({ variant: 'body' })}>2 單位間距 (8px)</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#D4AF37] rounded"></div>
                <Spacing size={4} direction="horizontal" />
                <span className={textVariants({ variant: 'body' })}>4 單位間距 (16px)</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#D4AF37] rounded"></div>
                <Spacing size={6} direction="horizontal" />
                <span className={textVariants({ variant: 'body' })}>6 單位間距 (24px)</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h4 className={textVariants({ variant: 'h4' })}>垂直間距</h4>
              <div className="space-y-4 mt-4">
                <div className="h-16 bg-[#D4AF37]/20 rounded flex items-center justify-center">
                  <span className={textVariants({ variant: 'body' })}>內容區塊</span>
                </div>
                <Spacing size={4} direction="vertical" />
                <div className="h-16 bg-[#D4AF37]/20 rounded flex items-center justify-center">
                  <span className={textVariants({ variant: 'body' })}>內容區塊</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 色彩系統示範 */}
        <GlassCard className="lg:col-span-2">
          <div>
            <h3 className={textVariants({ variant: 'h3' })}>
              色彩系統
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-4">
                <h4 className={textVariants({ variant: 'h4' })}>品牌色彩</h4>
                <div className="space-y-2">
                  <div className="h-12 bg-[#D4AF37] rounded flex items-center justify-center text-black font-bold">
                    #D4AF37 (金)
                  </div>
                  <div className="h-12 bg-[#E5E4E2] rounded flex items-center justify-center text-black font-bold">
                    #E5E4E2 (白金)
                  </div>
                  <div className="h-12 bg-[#FF2E63] rounded flex items-center justify-center text-white font-bold">
                    #FF2E63 (霓虹紅)
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className={textVariants({ variant: 'h4' })}>語意色彩</h4>
                <div className="space-y-2">
                  <div className="h-12 bg-[#00FF9D] rounded flex items-center justify-center text-black font-bold">
                    #00FF9D (成功)
                  </div>
                  <div className="h-12 bg-[#FF4D4D] rounded flex items-center justify-center text-white font-bold">
                    #FF4D4D (錯誤)
                  </div>
                  <div className="h-12 bg-[#FFB700] rounded flex items-center justify-center text-black font-bold">
                    #FFB700 (警告)
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className={textVariants({ variant: 'h4' })}>文字層次</h4>
                <div className="space-y-2 p-4 bg-black/30 rounded">
                  <p className="text-white">主要文字 (100%)</p>
                  <p className="text-white/70">次要文字 (70%)</p>
                  <p className="text-white/50">提示文字 (50%)</p>
                  <p className="text-white/30">裝飾文字 (30%)</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default DesignSystemDemo