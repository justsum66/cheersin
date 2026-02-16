/**
 * 字型系統示範元件
 * 展示響應式排版系統的實際效果
 */

'use client'

import React from 'react'
import { 
  FONT_FAMILIES, 
  FONT_SIZES, 
  TYPOGRAPHY_CLASSES,
  getResponsiveFontSize,
  getFontFamily
} from '@/lib/typography/responsive-typography'
import { GlassCard } from '@/components/ui/GlassCard'

const TypographyDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] to-[#0a0a0a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-12">
          <h1 className={`${TYPOGRAPHY_CLASSES.headings.h1} mb-4`}>
            字型系統示範
          </h1>
          <p className={`${TYPOGRAPHY_CLASSES.body.base} text-white/70 max-w-2xl mx-auto`}>
            展示響應式排版系統在不同裝置上的效果，確保完美的閱讀體驗
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 標題系統示範 */}
          <GlassCard>
            <div className="space-y-6">
              <h2 className={`${TYPOGRAPHY_CLASSES.headings.h2} mb-6 border-b border-white/10 pb-4`}>
                標題層次系統
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h1 className={TYPOGRAPHY_CLASSES.headings.h1}>H1 標題</h1>
                  <p className="text-white/50 text-sm mt-1">
                    Mobile: {getResponsiveFontSize('h1', 'mobile')} | 
                    Tablet: {getResponsiveFontSize('h1', 'tablet')} | 
                    Desktop: {getResponsiveFontSize('h1', 'desktop')}
                  </p>
                </div>
                
                <div>
                  <h2 className={TYPOGRAPHY_CLASSES.headings.h2}>H2 標題</h2>
                  <p className="text-white/50 text-sm mt-1">
                    Mobile: {getResponsiveFontSize('h2', 'mobile')} | 
                    Tablet: {getResponsiveFontSize('h2', 'tablet')} | 
                    Desktop: {getResponsiveFontSize('h2', 'desktop')}
                  </p>
                </div>
                
                <div>
                  <h3 className={TYPOGRAPHY_CLASSES.headings.h3}>H3 標題</h3>
                  <p className="text-white/50 text-sm mt-1">
                    Mobile: {getResponsiveFontSize('h3', 'mobile')} | 
                    Tablet: {getResponsiveFontSize('h3', 'tablet')} | 
                    Desktop: {getResponsiveFontSize('h3', 'desktop')}
                  </p>
                </div>
                
                <div>
                  <h4 className={TYPOGRAPHY_CLASSES.headings.h4}>H4 標題</h4>
                  <p className="text-white/50 text-sm mt-1">
                    Mobile: {getResponsiveFontSize('h4', 'mobile')} | 
                    Tablet: {getResponsiveFontSize('h4', 'tablet')} | 
                    Desktop: {getResponsiveFontSize('h4', 'desktop')}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 內文系統示範 */}
          <GlassCard>
            <div className="space-y-6">
              <h2 className={`${TYPOGRAPHY_CLASSES.headings.h2} mb-6 border-b border-white/10 pb-4`}>
                內文系統
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className={TYPOGRAPHY_CLASSES.body.large}>
                    大型內文：這是大型內文樣式，適用於重要段落和引言。
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    字級: {getResponsiveFontSize('bodyLarge', 'desktop')}
                  </p>
                </div>
                
                <div>
                  <p className={TYPOGRAPHY_CLASSES.body.base}>
                    標準內文：這是標準的內文樣式，用於主要內容區域。具有良好的行高和字距，
                    確保在各種螢幕尺寸下都有優秀的閱讀體驗。
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    字級: {getResponsiveFontSize('body', 'desktop')}
                  </p>
                </div>
                
                <div>
                  <p className={TYPOGRAPHY_CLASSES.body.small}>
                    小型內文：用於次要內容、註解或說明文字。
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    字級: {getResponsiveFontSize('bodySmall', 'desktop')}
                  </p>
                </div>
                
                <div>
                  <p className={TYPOGRAPHY_CLASSES.body.caption}>
                    說明文字：用於圖表說明、版權資訊等微型文字。
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    字級: {getResponsiveFontSize('caption', 'desktop')}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 功能文字示範 */}
          <GlassCard>
            <div className="space-y-6">
              <h2 className={`${TYPOGRAPHY_CLASSES.headings.h2} mb-6 border-b border-white/10 pb-4`}>
                功能性文字
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button className={`${TYPOGRAPHY_CLASSES.functional.buttonLarge} bg-[#D4AF37] text-black px-6 py-3 rounded-lg hover:bg-[#b8942e] transition-colors`}>
                    大型按鈕
                  </button>
                  <button className={`${TYPOGRAPHY_CLASSES.functional.button} bg-[#E5E4E2] text-black px-4 py-2 rounded-lg hover:bg-[#d0cecc] transition-colors`}>
                    標準按鈕
                  </button>
                  <button className={`${TYPOGRAPHY_CLASSES.functional.buttonSmall} bg-[#FF2E63] text-white px-3 py-1 rounded-md hover:bg-[#db0f46] transition-colors`}>
                    小型按鈕
                  </button>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                    <span className={TYPOGRAPHY_CLASSES.functional.label}>
                      表單標籤
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00FF9D] rounded-full"></span>
                    <span className={TYPOGRAPHY_CLASSES.functional.label}>
                      狀態標籤
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <span className={TYPOGRAPHY_CLASSES.functional.overline}>
                      新功能上線
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 字型家族示範 */}
          <GlassCard>
            <div className="space-y-6">
              <h2 className={`${TYPOGRAPHY_CLASSES.headings.h2} mb-6 border-b border-white/10 pb-4`}>
                字型家族
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className={`${TYPOGRAPHY_CLASSES.headings.h3} mb-2`}>標題字型</h3>
                  <p className="text-white/70" style={{ fontFamily: FONT_FAMILIES.display }}>
                    The quick brown fox jumps over the lazy dog.<br/>
                    敏捷的棕色狐狸跳過懶惰的狗。
                  </p>
                </div>
                
                <div>
                  <h3 className={`${TYPOGRAPHY_CLASSES.headings.h3} mb-2`}>內文字型</h3>
                  <p className="text-white/70" style={{ fontFamily: FONT_FAMILIES.body }}>
                    The quick brown fox jumps over the lazy dog.<br/>
                    敏捷的棕色狐狸跳過懶惰的狗。
                  </p>
                </div>
                
                <div>
                  <h3 className={`${TYPOGRAPHY_CLASSES.headings.h3} mb-2`}>等寬字型</h3>
                  <p className="text-white/70 font-mono" style={{ fontFamily: FONT_FAMILIES.mono }}>
                    console.log('Hello World');<br/>
                    const x = 42;<br/>
                    敏捷的棕色狐狸跳過懶惰的狗。
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 響應式測試 */}
          <GlassCard className="lg:col-span-2">
            <div className="space-y-6">
              <h2 className={`${TYPOGRAPHY_CLASSES.headings.h2} mb-6 border-b border-white/10 pb-4`}>
                響應式測試
              </h2>
              
              <div className="bg-black/30 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className={TYPOGRAPHY_CLASSES.headings.h3}>調整瀏覽器視窗大小測試</h3>
                  <p className={TYPOGRAPHY_CLASSES.body.base}>
                    請調整瀏覽器視窗寬度，觀察字型大小如何在不同斷點自動調整。
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 p-4 rounded">
                    <div className="text-2xl font-bold text-[#D4AF37] mb-2">Mobile</div>
                    <div className="text-sm text-white/70">&lt; 768px</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded">
                    <div className="text-2xl font-bold text-[#E5E4E2] mb-2">Tablet</div>
                    <div className="text-sm text-white/70">768px - 1023px</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded">
                    <div className="text-2xl font-bold text-[#FF2E63] mb-2">Desktop</div>
                    <div className="text-sm text-white/70">≥ 1024px</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default TypographyDemo