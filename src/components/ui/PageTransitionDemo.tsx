'use client'

import { useState } from 'react'
import { PageTransition } from './PageTransition'
import { Button } from './Button'

/**
 * C1. 路由過渡動畫演示元件
 * 展示不同類型的頁面過渡效果
 */
export function PageTransitionDemo() {
  const [currentPage, setCurrentPage] = useState(1)
  const [transitionType, setTransitionType] = useState<'slide' | 'fade' | 'scale' | 'flip'>('slide')
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('right')
  const [enable3d, setEnable3d] = useState(true)

  const pages = [
    {
      id: 1,
      title: "首頁",
      content: "歡迎來到 Cheersin！這裡是首頁內容。",
      color: "bg-gradient-to-br from-purple-600 to-blue-600"
    },
    {
      id: 2,
      title: "遊戲區",
      content: "探索各種有趣的派對遊戲，與朋友一起享受歡樂時光。",
      color: "bg-gradient-to-br from-green-600 to-teal-600"
    },
    {
      id: 3,
      title: "學習區",
      content: "深入學習酒類知識，提升你的品酒技巧。",
      color: "bg-gradient-to-br from-amber-600 to-orange-600"
    },
    {
      id: 4,
      title: "個人中心",
      content: "管理你的個人資料、收藏和學習進度。",
      color: "bg-gradient-to-br from-pink-600 to-rose-600"
    }
  ]

  const currentPageData = pages.find(p => p.id === currentPage) || pages[0]

  const nextPage = () => {
    setCurrentPage(prev => prev < pages.length ? prev + 1 : 1)
  }

  const prevPage = () => {
    setCurrentPage(prev => prev > 1 ? prev - 1 : pages.length)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">C1. 路由過渡動畫演示</h1>
        
        {/* 控制面板 */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">過渡效果控制</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">過渡類型</label>
              <select 
                value={transitionType}
                onChange={(e) => setTransitionType(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="slide">Slide (滑動)</option>
                <option value="fade">Fade (淡入淡出)</option>
                <option value="scale">Scale (縮放)</option>
                <option value="flip">Flip (翻轉)</option>
              </select>
            </div>
            
            {transitionType === 'slide' && (
              <div>
                <label className="block text-sm font-medium mb-2">方向</label>
                <select 
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="left">左</option>
                  <option value="right">右</option>
                  <option value="up">上</option>
                  <option value="down">下</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">3D效果</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={enable3d}
                  onChange={(e) => setEnable3d(e.target.checked)}
                  className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                />
                <span className="text-sm">啟用</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={prevPage} variant="secondary">
              上一頁
            </Button>
            <Button onClick={nextPage} variant="primary">
              下一頁
            </Button>
          </div>
        </div>

        {/* 頁面預覽區域 */}
        <div className="relative h-96 rounded-2xl overflow-hidden border-2 border-gray-800">
          <PageTransition 
            type={transitionType}
            direction={direction}
            duration={0.5}
            enable3d={enable3d}
          >
            <div className={`absolute inset-0 ${currentPageData.color} flex flex-col items-center justify-center p-8`}>
              <h2 className="text-4xl font-bold mb-4 text-white">{currentPageData.title}</h2>
              <p className="text-xl text-white/90 text-center max-w-2xl">{currentPageData.content}</p>
              <div className="mt-8 text-white/70">
                頁面 {currentPage} / {pages.length}
              </div>
            </div>
          </PageTransition>
        </div>

        {/* 效果說明 */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">效果說明</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><span className="font-medium text-white">Slide (滑動):</span> 頁面從指定方向滑入，帶有微妙的3D深度效果</p>
            <p><span className="font-medium text-white">Fade (淡入淡出):</span> 簡潔的透明度過渡，適合內容較少的頁面</p>
            <p><span className="font-medium text-white">Scale (縮放):</span> 頁面縮放進出，營造聚焦效果</p>
            <p><span className="font-medium text-white">Flip (翻轉):</span> 3D翻轉效果，創意十足但使用需謹慎</p>
            <p><span className="font-medium text-white">3D效果:</span> 啟用後增加z軸深度和perspective，讓過渡更加立體</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageTransitionDemo