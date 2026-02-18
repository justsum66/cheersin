'use client'

import { useState } from 'react'
import { EnhancedCardHover } from './EnhancedCardHover'
import { Button } from './Button'

/**
 * C4. 卡片懸浮立體效果演示元件
 * 展示不同變體和效果的增強卡片
 */
export function EnhancedCardHoverDemo() {
  const [selectedVariant, setSelectedVariant] = useState<'standard' | 'premium' | 'glass'>('standard')
  const [tiltIntensity, setTiltIntensity] = useState(3)
  const [scaleIntensity, setScaleIntensity] = useState(1.05)
  const [enableLighting, setEnableLighting] = useState(true)
  const [enableGlow, setEnableGlow] = useState(true)

  const cardData = [
    {
      title: "標準卡片",
      description: "基礎的卡片懸浮效果，適合一般內容展示",
      variant: "standard" as const,
      color: "from-gray-700 to-gray-900"
    },
    {
      title: "Premium 卡片",
      description: "高級紫色漸變效果，適合重要內容或付費功能",
      variant: "premium" as const,
      color: "from-purple-600 to-blue-600"
    },
    {
      title: "玻璃卡片",
      description: "毛玻璃效果，現代感十足，適合淺色背景",
      variant: "glass" as const,
      color: "from-white/10 to-white/5"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">C4. 卡片懸浮立體效果演示</h1>
        
        {/* 控制面板 */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">效果控制</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">卡片變體</label>
              <select 
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="glass">Glass</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">傾斜強度: {tiltIntensity}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={tiltIntensity}
                onChange={(e) => setTiltIntensity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">縮放強度: {scaleIntensity.toFixed(2)}</label>
              <input
                type="range"
                min="1.0"
                max="1.2"
                step="0.01"
                value={scaleIntensity}
                onChange={(e) => setScaleIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={enableLighting}
                onChange={(e) => setEnableLighting(e.target.checked)}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <label className="text-sm font-medium">啟用光影效果</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={enableGlow}
                onChange={(e) => setEnableGlow(e.target.checked)}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <label className="text-sm font-medium">啟用光暈效果</label>
            </div>
          </div>
        </div>

        {/* 卡片展示區域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {cardData.map((card, index) => (
            <EnhancedCardHover
              key={card.variant}
              variant={card.variant}
              tiltIntensity={tiltIntensity}
              scaleIntensity={scaleIntensity}
              enableLighting={enableLighting}
              enableGlow={enableGlow}
              className="h-80 p-6"
            >
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} mb-4 flex items-center justify-center`}>
                  <span className="text-2xl">
                    {index === 0 ? '📄' : index === 1 ? '👑' : '🔍'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-white/70 mb-6 flex-grow">{card.description}</p>
                
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    操作按鈕
                  </Button>
                  <Button variant="secondary" className="w-full">
                    次要操作
                  </Button>
                </div>
              </div>
            </EnhancedCardHover>
          ))}
        </div>

        {/* 單一卡片詳細演示 */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">詳細效果演示</h2>
          
          <div className="max-w-2xl mx-auto">
            <EnhancedCardHover
              variant={selectedVariant}
              tiltIntensity={tiltIntensity}
              scaleIntensity={scaleIntensity}
              enableLighting={enableLighting}
              enableGlow={enableGlow}
              className="h-96 p-8"
              onClick={() => console.log('卡片被點擊')}
            >
              <div className="flex flex-col h-full items-center justify-center text-center">
                <div className="text-6xl mb-6">✨</div>
                <h3 className="text-2xl font-bold mb-4">互動式卡片</h3>
                <p className="text-white/80 mb-8 max-w-md">
                  將滑鼠移到卡片上體驗3D懸浮效果。移動滑鼠可以看到光影變化，
                  卡片會根據滑鼠位置產生自然的傾斜和旋轉。
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  <Button variant="primary">主要操作</Button>
                  <Button variant="secondary">次要操作</Button>
                </div>
              </div>
            </EnhancedCardHover>
          </div>
        </div>

        {/* 技術說明 */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">技術特性</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">3D Transform 效果</h4>
              <ul className="space-y-1">
                <li>• 基於滑鼠位置的動態傾斜</li>
                <li>• 平滑的縮放過渡</li>
                <li>• Perspective 3D 投影</li>
                <li>• 硬體加速優化</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">視覺增強效果</h4>
              <ul className="space-y-1">
                <li>• 動態光影追蹤</li>
                <li>• 邊框光暈效果</li>
                <li>• 多種主題變體</li>
                <li>• 無障礙支援 (prefers-reduced-motion)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedCardHoverDemo