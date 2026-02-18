/**
 * P1-084: 離線體驗指示器元件
 * 顯示離線狀態和同步進度
 */

'use client'

import { useOfflineManager } from '@/lib/offline-optimization'

interface OfflineIndicatorProps {
  /** 類名 */
  className?: string
  /** 顯示位置 */
  position?: 'top' | 'bottom'
}

export function OfflineIndicator({ 
  className = '',
  position = 'top'
}: OfflineIndicatorProps) {
  const { state } = useOfflineManager()

  if (!state.isOffline) return null

  return (
    <div
      className={`
        fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0
        z-50 bg-amber-500 text-white text-center py-2 px-4
        flex items-center justify-center gap-2
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className="font-medium">目前為離線狀態</span>
      {state.retryCount > 0 && (
        <span className="text-sm opacity-80">
          (重試中... {state.retryCount})
        </span>
      )}
      {state.pendingSync.length > 0 && (
        <span className="text-sm opacity-80">
          ({state.pendingSync.length} 項待同步)
        </span>
      )}
    </div>
  )
}

// 離線同步進度指示器
interface SyncProgressIndicatorProps {
  className?: string
}

export function SyncProgressIndicator({ className = '' }: SyncProgressIndicatorProps) {
  const { state } = useOfflineManager()

  if (!state.isOffline && state.pendingSync.length === 0) return null

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {state.isOffline ? (
        <>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-amber-700">離線模式</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-blue-700">同步中...</span>
          <span className="text-gray-500">
            ({state.pendingSync.length} 項)
          </span>
        </>
      )}
    </div>
  )
}

// 離線功能狀態面板
interface OfflineStatusPanelProps {
  className?: string
}

export function OfflineStatusPanel({ className = '' }: OfflineStatusPanelProps) {
  const { state, triggerSync, clearPendingItems } = useOfflineManager()

  return (
    <div className={`bg-white rounded-lg border p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">離線狀態</h3>
        <div className={`w-3 h-3 rounded-full ${
          state.isOffline ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
        }`} />
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>網路狀態:</span>
          <span className={state.isOffline ? 'text-amber-600' : 'text-green-600'}>
            {state.isOffline ? '離線' : '線上'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>待同步項目:</span>
          <span className="font-medium">{state.pendingSync.length}</span>
        </div>
        
        {state.isOffline && state.offlineSince && (
          <div className="flex justify-between">
            <span>離線時間:</span>
            <span>
              {Math.floor((Date.now() - state.offlineSince.getTime()) / 60000)}分鐘
            </span>
          </div>
        )}
        
        {state.retryCount > 0 && (
          <div className="flex justify-between">
            <span>重試次數:</span>
            <span>{state.retryCount}</span>
          </div>
        )}
      </div>
      
      {state.pendingSync.length > 0 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => triggerSync()}
            disabled={state.isOffline}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            立即同步
          </button>
          <button
            onClick={() => clearPendingItems()}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
          >
            清除
          </button>
        </div>
      )}
    </div>
  )
}