/**
 * 錯誤邊界 Fallback UI
 * 當 React 組件發生錯誤時顯示友善的錯誤頁面
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetError?: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  useEffect(() => {
    // 記錄錯誤到 console
    console.error('Error boundary caught:', error)
    
    // 可選：發送錯誤到 analytics
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'error_boundary',
          properties: {
            error_message: error.message,
            error_stack: error.stack?.slice(0, 500),
            timestamp: Date.now()
          }
        })
      }).catch(() => {})
    } catch {}
  }, [error])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" aria-hidden />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-white mb-3">
            哎呀，出錯了
          </h1>
          
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            頁面載入時發生錯誤，請稍後再試。如果問題持續發生，請聯繫我們的客服團隊。
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="text-white/50 text-xs cursor-pointer hover:text-white/70 mb-2">
                錯誤詳情（開發模式）
              </summary>
              <pre className="text-red-400 text-xs bg-black/30 p-3 rounded-lg overflow-auto max-h-32">
                {error.message}
                {error.stack && '\n\n' + error.stack.slice(0, 500)}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            {resetError && (
              <button
                onClick={resetError}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 games-focus-ring"
              >
                <RefreshCw className="w-4 h-4" aria-hidden />
                重新載入
              </button>
            )}
            
            <Link
              href="/"
              className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2 games-focus-ring"
            >
              <Home className="w-4 h-4" aria-hidden />
              回首頁
            </Link>
          </div>

          <p className="text-white/30 text-xs mt-6">
            飲酒過量有害健康，請勿酒駕。
          </p>
        </div>
      </div>
    </div>
  )
}
