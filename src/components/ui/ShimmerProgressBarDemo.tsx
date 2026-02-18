'use client'

import { useState, useEffect } from 'react'
import { ShimmerProgressBar, ShimmerLoader } from './ShimmerProgressBar'
import { Button } from './Button'

/**
 * E5. 進度條流光效果演示元件
 * 展示各種進度條樣式和流光動畫效果
 */
export function ShimmerProgressBarDemo() {
  const [progress, setProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'success' | 'warning' | 'danger'>('primary')
  const [height, setHeight] = useState<'sm' | 'md' | 'lg'>('md')
  const [shimmer, setShimmer] = useState(true)
  const [shimmerSpeed, setShimmerSpeed] = useState(2)

  // 模擬進度動畫
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsAnimating(false)
            return 100
          }
          return prev + Math.random() * 5
        })
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [isAnimating])

  const resetProgress = () => {
    setProgress(0)
    setIsAnimating(false)
  }

  const startAnimation = () => {
    resetProgress()
    setTimeout(() => setIsAnimating(true), 100)
  }

  const variants = [
    { value: 'primary', label: '主要', color: 'from-primary-500 to-primary-400' },
    { value: 'secondary', label: '次要', color: 'from-secondary-500 to-secondary-400' },
    { value: 'success', label: '成功', color: 'from-green-500 to-emerald-500' },
    { value: 'warning', label: '警告', color: 'from-amber-500 to-orange-500' },
    { value: 'danger', label: '危險', color: 'from-red-500 to-rose-500' }
  ]

  const heights = [
    { value: 'sm', label: '小型' },
    { value: 'md', label: '中型' },
    { value: 'lg', label: '大型' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">E5. 進度條流光效果演示</h1>
        
        {/* 控制面板 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">控制面板</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">顏色變體</label>
              <select 
                value={variant}
                onChange={(e) => setVariant(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {variants.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">高度</label>
              <select 
                value={height}
                onChange={(e) => setHeight(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {heights.map(h => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={shimmer}
                onChange={(e) => setShimmer(e.target.checked)}
                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <label className="text-sm font-medium text-white/80">流光效果</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">流光速度: {shimmerSpeed}s</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={shimmerSpeed}
                onChange={(e) => setShimmerSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
            >
              {isAnimating ? '執行中...' : '開始動畫'}
            </Button>
            
            <Button 
              onClick={resetProgress}
              variant="outline"
            >
              重置
            </Button>
          </div>
        </div>

        {/* 進度條演示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 基礎進度條 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">基礎進度條</h3>
            <div className="space-y-6">
              <ShimmerProgressBar
                value={progress}
                variant={variant}
                height={height}
                shimmer={shimmer}
                shimmerSpeed={shimmerSpeed}
                showLabel={true}
                label="載入進度"
              />
              
              <ShimmerProgressBar
                value={Math.min(100, progress * 1.2)}
                variant="success"
                height={height}
                shimmer={shimmer}
                shimmerSpeed={shimmerSpeed}
                showLabel={true}
                label="完成度"
              />
              
              <ShimmerProgressBar
                value={Math.min(100, progress * 0.8)}
                variant="warning"
                height={height}
                shimmer={shimmer}
                shimmerSpeed={shimmerSpeed}
                showLabel={true}
                label="處理中"
              />
            </div>
          </div>

          {/* 不同狀態演示 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">狀態演示</h3>
            <div className="space-y-6">
              <div>
                <p className="text-white/70 text-sm mb-2">0% - 未開始</p>
                <ShimmerProgressBar value={0} variant="primary" height={height} shimmer={shimmer} />
              </div>
              
              <div>
                <p className="text-white/70 text-sm mb-2">50% - 進行中</p>
                <ShimmerProgressBar value={50} variant="secondary" height={height} shimmer={shimmer} />
              </div>
              
              <div>
                <p className="text-white/70 text-sm mb-2">100% - 已完成</p>
                <ShimmerProgressBar value={100} variant="success" height={height} shimmer={shimmer} />
              </div>
            </div>
          </div>
        </div>

        {/* Shimmer Loader 演示 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Shimmer Loader 載入效果</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ShimmerLoader width="200px" height="20px" />
              <span className="text-white/70">文字載入</span>
            </div>
            
            <div className="flex items-center gap-4">
              <ShimmerLoader width="150px" height="30px" rounded="lg" />
              <span className="text-white/70">按鈕載入</span>
            </div>
            
            <div className="space-y-2">
              <ShimmerLoader width="100%" height="16px" />
              <ShimmerLoader width="85%" height="16px" />
              <ShimmerLoader width="92%" height="16px" />
              <ShimmerLoader width="78%" height="16px" />
            </div>
          </div>
        </div>

        {/* 功能特色 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">✨ 視覺效果</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• 雙層流光動畫</li>
              <li>• 漸層色彩配置</li>
              <li>• 動態高光效果</li>
              <li>• 完成狀態動畫</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">⚡ 互動功能</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• 5種顏色變體</li>
              <li>• 3種尺寸選擇</li>
              <li>• 可調節流光速度</li>
              <li>• 無障礙支援</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">🎯 應用場景</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• 檔案上傳進度</li>
              <li>• 資料載入指示</li>
              <li>• 表單提交狀態</li>
              <li>• 頁面載入動畫</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShimmerProgressBarDemo