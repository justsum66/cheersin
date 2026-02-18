'use client'

import { useState } from 'react'
import { 
  PRECISE_FONT_SIZES, 
  LINE_HEIGHT_OPTIMIZATION, 
  LETTER_SPACING_PRECISION,
  READING_EXPERIENCE,
  TYPOGRAPHY_CLASSES,
  getOptimalLineHeight,
  getOptimalLetterSpacing
} from '@/lib/typography/typography-optimization'

/**
 * F1. 字型排版最佳化演示元件
 * 展示精準的行高和字距調整效果
 */
export function TypographyOptimizationDemo() {
  const [fontSize, setFontSize] = useState(16)
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [textType, setTextType] = useState<'heading' | 'body' | 'caption'>('body')

  const optimalLineHeight = getOptimalLineHeight(fontSize, contentLength)
  const optimalLetterSpacing = getOptimalLetterSpacing(fontSize, textType)

  const sampleTexts = {
    short: "這是短段落文字，用於標題或重點說明。",
    medium: "這是中等長度的段落文字，用於一般內容展示。良好的行高和字距能顯著提升閱讀體驗，讓文字更易於閱讀和理解。",
    long: "這是較長的段落文字，用於展示長篇文章的排版效果。透過精準的行高調整和字距優化，可以有效減少閱讀疲勞，提升整體的閱讀舒適度。適當的行距讓每行文字都有足夠的呼吸空間，而精細的字距調整則確保文字間的平衡與和諧。"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">F1. 字型排版最佳化演示</h1>
        
        {/* 控制面板 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">排版參數調整</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                字型大小: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">內容長度</label>
              <select 
                value={contentLength}
                onChange={(e) => setContentLength(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
              >
                <option value="short">短段落</option>
                <option value="medium">中段落</option>
                <option value="long">長段落</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">文字類型</label>
              <select 
                value={textType}
                onChange={(e) => setTextType(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
              >
                <option value="heading">標題</option>
                <option value="body">內文</option>
                <option value="caption">說明</option>
              </select>
            </div>
          </div>
          
          {/* 即時計算結果 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">最佳化建議</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <span className="font-medium">建議行高:</span> {optimalLineHeight.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">建議字距:</span> {optimalLetterSpacing}
              </div>
            </div>
          </div>
        </div>

        {/* 標題系統演示 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">標題系統</h2>
          
          <div className="space-y-6">
            <div>
              <h1 className={`${TYPOGRAPHY_CLASSES.headings.h1} text-gray-900 mb-2`}>
                一級標題 H1 - 這是最重要的標題
              </h1>
              <p className="text-gray-600 text-sm">使用緊密行高和負字距，營造強烈的視覺層次</p>
            </div>
            
            <div>
              <h2 className={`${TYPOGRAPHY_CLASSES.headings.h2} text-gray-900 mb-2`}>
                二級標題 H2 - 重要章節標題
              </h2>
              <p className="text-gray-600 text-sm">適度的行高和字距，保持良好的可讀性</p>
            </div>
            
            <div>
              <h3 className={`${TYPOGRAPHY_CLASSES.headings.h3} text-gray-900 mb-2`}>
                三級標題 H3 - 小節標題
              </h3>
              <p className="text-gray-600 text-sm">標準的標題排版，清晰易讀</p>
            </div>
          </div>
        </div>

        {/* 內文系統演示 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">內文系統</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">大型內文</h3>
              <p className={`${TYPOGRAPHY_CLASSES.body.large} text-gray-700`}>
                {sampleTexts[contentLength]}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">標準內文</h3>
              <p className={`${TYPOGRAPHY_CLASSES.body.base} text-gray-700`}>
                {sampleTexts[contentLength]}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">小型內文</h3>
              <p className={`${TYPOGRAPHY_CLASSES.body.small} text-gray-700`}>
                {sampleTexts[contentLength]}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">說明文字</h3>
              <p className={`${TYPOGRAPHY_CLASSES.body.caption} text-gray-600`}>
                {sampleTexts.short}
              </p>
            </div>
          </div>
        </div>

        {/* 動態調整演示 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">動態排版調整</h2>
          
          <div 
            className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-300"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: optimalLineHeight,
              letterSpacing: optimalLetterSpacing
            }}
          >
            <h3 className="font-medium text-gray-800 mb-4">即時排版預覽</h3>
            <p className="text-gray-700">
              {sampleTexts[contentLength]}
            </p>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-medium text-gray-700">字型大小:</span>
              <span className="ml-2 text-gray-600">{fontSize}px</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-medium text-gray-700">行高:</span>
              <span className="ml-2 text-gray-600">{optimalLineHeight.toFixed(2)}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-medium text-gray-700">字距:</span>
              <span className="ml-2 text-gray-600">{optimalLetterSpacing}</span>
            </div>
          </div>
        </div>

        {/* 閱讀體驗對比 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">閱讀體驗對比</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">未優化排版</h3>
              <div 
                className="p-4 bg-red-50 rounded-lg border border-red-200"
                style={{ 
                  fontSize: '16px',
                  lineHeight: 1.2,
                  letterSpacing: '0em'
                }}
              >
                <p className="text-gray-700">
                  這是未經優化的排版效果。行高過緊，字距過密，閱讀起來會感到壓迫和不舒適。長時間閱讀容易造成眼部疲勞。
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">優化後排版</h3>
              <div 
                className="p-4 bg-green-50 rounded-lg border border-green-200"
                style={{ 
                  fontSize: '16px',
                  lineHeight: 1.65,
                  letterSpacing: '0.01em'
                }}
              >
                <p className="text-gray-700">
                  這是優化後的排版效果。適當的行高提供了良好的垂直節奏，精細的字距確保了水平平衡，整體閱讀體驗更加舒適自然。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 技術指標 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 設計原則</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 行高 = 字型大小 × 1.5-1.7</li>
              <li>• 標題使用負字距</li>
              <li>• 內文使用正字距</li>
              <li>• 理想行長 65-75 字符</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 最佳實踐</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 短文使用緊密行高</li>
              <li>• 長文使用寬鬆行高</li>
              <li>• 大字減少字距</li>
              <li>• 小字增加字距</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✨ 用戶體驗</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 減少閱讀疲勞</li>
              <li>• 提升理解效率</li>
              <li>• 增強視覺層次</li>
              <li>• 改善整體美感</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypographyOptimizationDemo