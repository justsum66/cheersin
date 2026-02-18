'use client'

import { useState } from 'react'
import { InteractiveParticleBackground } from './InteractiveParticleBackground'
import { Button } from './Button'

/**
 * E1. 動態背景粒子系統演示元件
 * 展示不同類型的互動式粒子背景效果
 */
export function ParticleBackgroundDemo() {
  const [backgroundType, setBackgroundType] = useState<'stars' | 'aurora' | 'galaxy' | 'nebula'>('stars')
  const [particleCount, setParticleCount] = useState(150)
  const [sensitivity, setSensitivity] = useState(0.7)
  const [mouseInteractive, setMouseInteractive] = useState(true)
  const [parallax, setParallax] = useState(true)
  const [connectionDistance, setConnectionDistance] = useState(100)

  const backgroundTypes = [
    { value: 'stars', label: '⭐ 星空', description: '經典閃爍星點' },
    { value: 'aurora', label: '🌌 極光', description: '流動極光效果' },
    { value: 'galaxy', label: '🌀 星系', description: '旋渦星系粒子' },
    { value: 'nebula', label: '🌫️ 星雲', description: '繽紛星雲效果' }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* 粒子背景 */}
      <InteractiveParticleBackground
        type={backgroundType}
        particleCount={particleCount}
        sensitivity={sensitivity}
        mouseInteractive={mouseInteractive}
        parallax={parallax}
        connectionDistance={connectionDistance}
      />
      
      {/* 控制面板 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full border border-white/10">
          <h1 className="text-3xl font-bold mb-8 text-center">E1. 動態背景粒子系統演示</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">背景類型</label>
              <select 
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                {backgroundTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/60 mt-1">
                {backgroundTypes.find(t => t.value === backgroundType)?.description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">粒子數量: {particleCount}</label>
              <input
                type="range"
                min="50"
                max="500"
                value={particleCount}
                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">互動敏感度: {sensitivity.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={mouseInteractive}
                onChange={(e) => setMouseInteractive(e.target.checked)}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <label className="text-sm font-medium">滑鼠互動</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={parallax}
                onChange={(e) => setParallax(e.target.checked)}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <label className="text-sm font-medium">視差效果</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">連線距離: {connectionDistance}px</label>
              <input
                type="range"
                min="0"
                max="200"
                value={connectionDistance}
                onChange={(e) => setConnectionDistance(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          {/* 即時預覽 */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
            <h3 className="text-lg font-semibold mb-3">即時效果預覽</h3>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">
                {backgroundType === 'stars' && '⭐'}
                {backgroundType === 'aurora' && '🌌'}
                {backgroundType === 'galaxy' && '🌀'}
                {backgroundType === 'nebula' && '🌫️'}
              </div>
              <p className="text-white/80 mb-2">
                將滑鼠移到背景上體驗互動效果
              </p>
              <p className="text-sm text-white/60">
                粒子會跟隨滑鼠移動並產生閃爍效果
              </p>
            </div>
          </div>
          
          {/* 功能特色 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-3">🎨 視覺效果</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• 多種背景主題可選</li>
                <li>• 粒子大小和透明度隨機化</li>
                <li>• 粒子間智能連線</li>
                <li>• 光暈和閃爍效果</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-3">⚡ 互動功能</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• 滑鼠懸停互動</li>
                <li>• 可調節敏感度</li>
                <li>• 視差滾動效果</li>
                <li>• 無障礙支援 (prefers-reduced-motion)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* 裝飾性元素 */}
      <div className="fixed top-10 left-10 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse" />
      <div className="fixed bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse delay-1000" />
    </div>
  )
}

export default ParticleBackgroundDemo