'use client'

import { useState } from 'react'
import { ToastManager, useInteractiveToast } from './InteractiveToast'
import { Button } from './Button'

/**
 * F8. 互動式Toast通知演示元件
 * 展示滑動關閉和互動功能
 */
export function InteractiveToastDemo() {
  const toast = useInteractiveToast()
  const [isDemoMode, setIsDemoMode] = useState(false)

  const showToastExamples = () => {
    setIsDemoMode(true)
    
    // 依序顯示不同類型的toast
    setTimeout(() => {
      toast.success('操作成功！檔案已儲存', {
        duration: 3000,
        action: {
          label: '檢視',
          onClick: () => alert('檢視檔案')
        }
      })
    }, 500)

    setTimeout(() => {
      toast.error('操作失敗！網路連線異常', {
        duration: 5000,
        action: {
          label: '重試',
          onClick: () => toast.info('正在重新連線...')
        }
      })
    }, 1500)

    setTimeout(() => {
      toast.warning('注意！儲存空間即將用完', {
        duration: 4000
      })
    }, 2500)

    setTimeout(() => {
      toast.info('新功能上線！立即體驗', {
        duration: 3500,
        action: {
          label: '了解更多',
          onClick: () => alert('新功能介紹')
        }
      })
    }, 3500)

    setTimeout(() => {
      const loadingId = toast.loading('處理中...請稍候')
      
      // 模擬長時間操作
      setTimeout(() => {
        toast.success('處理完成！', {
          duration: 3000
        })
      }, 3000)
    }, 4500)

    // 結束演示模式
    setTimeout(() => {
      setIsDemoMode(false)
    }, 6000)
  }

  const testIndividualTypes = () => {
    toast.success('成功訊息範例', { duration: 3000 })
  }

  const testErrorToast = () => {
    toast.error('錯誤訊息範例 - 這是一個較長的錯誤訊息，用來測試換行效果', { 
      duration: 5000 
    })
  }

  const testWarningToast = () => {
    toast.warning('警告訊息範例', { duration: 4000 })
  }

  const testInfoToast = () => {
    toast.info('資訊訊息範例', { 
      duration: 3500,
      action: {
        label: '執行操作',
        onClick: () => alert('操作已執行')
      }
    })
  }

  const testLoadingToast = () => {
    const loadingId = toast.loading('載入中...請稍候')
    
    setTimeout(() => {
      toast.success('載入完成！')
    }, 2000)
  }

  const testInteractiveToast = () => {
    toast.info('互動式通知', {
      duration: 4000,
      action: {
        label: '立即處理',
        onClick: () => {
          toast.success('已處理完成！')
        }
      }
    })
  }

  const clearAllToasts = () => {
    if (typeof window !== 'undefined' && window.toastManager) {
      window.toastManager.clearAll()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <ToastManager />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">F8. 互動式Toast通知演示</h1>
        
        {/* 功能說明 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">✨ 功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
            <div>
              <h3 className="font-medium text-white mb-2">📱 手勢操作</h3>
              <ul className="space-y-1 text-sm">
                <li>• 向右滑動關閉通知</li>
                <li>• 滑鼠拖拽支援</li>
                <li>• 觸控手勢最佳化</li>
                <li>• 滑動進度視覺反饋</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">🎨 視覺效果</h3>
              <ul className="space-y-1 text-sm">
                <li>• 毛玻璃背景效果</li>
                <li>• 平滑動畫過渡</li>
                <li>• 類型顏色編碼</li>
                <li>• 進度條指示器</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">⚡ 互動功能</h3>
              <ul className="space-y-1 text-sm">
                <li>• 懸停暫停計時</li>
                <li>• 自定義操作按鈕</li>
                <li>• 多種通知類型</li>
                <li>• 可調整持續時間</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">🎯 使用場景</h3>
              <ul className="space-y-1 text-sm">
                <li>• 操作成功/失敗反饋</li>
                <li>• 系統狀態通知</li>
                <li>• 用戶互動提示</li>
                <li>• 載入狀態指示</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按鈕區 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6">🧪 測試功能</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={showToastExamples}
              disabled={isDemoMode}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isDemoMode ? '演示中...' : '完整演示'}
            </Button>
            
            <Button
              onClick={testIndividualTypes}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              成功通知
            </Button>
            
            <Button
              onClick={testErrorToast}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              錯誤通知
            </Button>
            
            <Button
              onClick={testWarningToast}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              警告通知
            </Button>
            
            <Button
              onClick={testInfoToast}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              資訊通知
            </Button>
            
            <Button
              onClick={testLoadingToast}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              載入通知
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={testInteractiveToast}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              互動式通知
            </Button>
            
            <Button
              onClick={clearAllToasts}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              清除所有通知
            </Button>
          </div>
        </div>

        {/* 互動教學 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">📚 互動教學</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-medium text-white mb-2">👉 滑動關閉</h3>
              <p className="text-white/70 text-sm mb-3">
                在任何通知上向右滑動或拖拽，當滑動距離超過80px時放開，通知就會關閉。
              </p>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <div className="w-8 h-1 bg-white/30 rounded"></div>
                <span>滑動指示器</span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-medium text-white mb-2">🖱️ 懸停效果</h3>
              <p className="text-white/70 text-sm mb-3">
                將滑鼠懸停在通知上會暫停自動關閉計時，並顯示關閉按鈕。
              </p>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
              <p className="text-xs text-white/60 mt-1">進度條會暫停</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-medium text-white mb-2">⚡ 互動按鈕</h3>
              <p className="text-white/70 text-sm mb-3">
                某些通知包含互動按鈕，點擊可以執行相應操作。
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                <span className="text-white/80 text-xs">了解更多</span>
                <span className="text-white/50 text-xs underline">操作</span>
              </div>
            </div>
          </div>
        </div>

        {/* 技術說明 */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">🔧 技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/70">
            <div>
              <h3 className="font-medium text-white mb-2">核心技術</h3>
              <ul className="space-y-1">
                <li>• Framer Motion 動畫引擎</li>
                <li>• 觸控手勢識別</li>
                <li>• 滑鼠拖拽支援</li>
                <li>• 響應式設計</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">無障礙設計</h3>
              <ul className="space-y-1">
                <li>• ARIA 標籤支援</li>
                <li>• 鍵盤導航相容</li>
                <li>• 減少動畫模式</li>
                <li>• 語意化HTML結構</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveToastDemo