'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
  onClose: (id: string) => void
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * F8. 互動式Toast通知 - 帶手勢滑動關閉
 * 提供現代化的通知體驗，支援滑動關閉和互動操作
 */
export function InteractiveToast({ 
  id, 
  message, 
  type, 
  duration = 4000, 
  onClose, 
  action 
}: ToastProps) {
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const reducedMotion = useReducedMotion()
  const touchStartX = useRef(0)
  const toastRef = useRef<HTMLDivElement>(null)

  // 自動關閉計時器
  useEffect(() => {
    if (type === 'loading' || isHovered || isSwiping) return

    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose, type, isHovered, isSwiping])

  // 滑動手勢處理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsSwiping(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return
    
    const currentX = e.touches[0].clientX
    const deltaX = currentX - touchStartX.current
    setSwipeOffset(Math.max(0, deltaX)) // 只允許向右滑動
  }, [isSwiping])

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset > 80) {
      // 滑動距離足夠，關閉toast
      onClose(id)
    } else {
      // 滑動距離不足，回到原位
      setSwipeOffset(0)
    }
    setIsSwiping(false)
  }, [swipeOffset, onClose, id])

  // 滑鼠手勢處理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartX.current = e.clientX
    setIsSwiping(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSwiping) return
    
    const deltaX = e.clientX - touchStartX.current
    setSwipeOffset(Math.max(0, deltaX))
  }, [isSwiping])

  const handleMouseUp = useCallback(() => {
    if (swipeOffset > 80) {
      onClose(id)
    } else {
      setSwipeOffset(0)
    }
    setIsSwiping(false)
  }, [swipeOffset, onClose, id])

  // 監聽滑鼠移動事件
  useEffect(() => {
    if (isSwiping) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isSwiping, handleMouseMove, handleMouseUp])

  // Toast類型對應的圖標和樣式
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500/90',
          borderColor: 'border-green-400/50',
          iconColor: 'text-green-100'
        }
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-500/90',
          borderColor: 'border-red-400/50',
          iconColor: 'text-red-100'
        }
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-amber-500/90',
          borderColor: 'border-amber-400/50',
          iconColor: 'text-amber-100'
        }
      case 'loading':
        return {
          icon: Info,
          bgColor: 'bg-blue-500/90',
          borderColor: 'border-blue-400/50',
          iconColor: 'text-blue-100'
        }
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-500/90',
          borderColor: 'border-gray-400/50',
          iconColor: 'text-gray-100'
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  return (
    <motion.div
      ref={toastRef}
      className={`
        relative flex items-center gap-3 p-4 rounded-xl
        backdrop-blur-xl border shadow-2xl
        max-w-sm w-full min-h-[60px]
        select-none cursor-pointer
        ${config.bgColor} ${config.borderColor} border
      `}
      style={{
        x: swipeOffset,
        zIndex: isSwiping ? 100 : 1,
        transform: reducedMotion ? undefined : undefined
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        x: swipeOffset
      }}
      exit={{ 
        opacity: 0, 
        scale: reducedMotion ? 1 : 0.9,
        x: reducedMotion ? 0 : 200,
        transition: { duration: 0.2 }
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        ...(reducedMotion ? { duration: 0 } : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {/* 滑動指示器 */}
      {isSwiping && swipeOffset > 20 && (
        <motion.div 
          className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.min(1, swipeOffset / 80) }}
        />
      )}

      {/* 圖標 */}
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        <Icon size={20} className={type === 'loading' ? 'animate-spin' : ''} />
      </div>

      {/* 訊息內容 */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-tight">
          {message}
        </p>
        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              action.onClick()
            }}
            className="mt-1 text-xs text-white/80 hover:text-white underline underline-offset-2"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* 關閉按鈕 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose(id)
        }}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="關閉通知"
      >
        <X size={16} className="text-white/80 hover:text-white" />
      </button>

      {/* 進度條 (非loading狀態) */}
      {type !== 'loading' && !isSwiping && !isHovered && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 overflow-hidden rounded-b-xl"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}

      {/* 滑動文字提示 */}
      {isSwiping && swipeOffset > 30 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-white/70 text-xs font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          放開以關閉
        </motion.div>
      )}
    </motion.div>
  )
}

// Toast管理器
export function ToastManager() {
  const [toasts, setToasts] = useState<ToastState[]>([])
  const reducedMotion = useReducedMotion()

  // 添加toast
  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastState = {
      id,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration,
      action: options.action
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  // 移除toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 成功toast
  const success = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
    return addToast({ ...options, message, type: 'success' })
  }, [addToast])

  // 錯誤toast
  const error = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
    return addToast({ ...options, message, type: 'error', duration: 5000 })
  }, [addToast])

  // 警告toast
  const warning = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
    return addToast({ ...options, message, type: 'warning' })
  }, [addToast])

  // 資訊toast
  const info = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
    return addToast({ ...options, message, type: 'info' })
  }, [addToast])

  // 載入中toast
  const loading = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
    return addToast({ ...options, message, type: 'loading' })
  }, [addToast])

  // 清除所有toasts
  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  // 提供全局使用
  if (typeof window !== 'undefined') {
    window.toastManager = {
      success,
      error,
      warning,
      info,
      loading,
      clearAll
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[1000] pointer-events-none space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            className="pointer-events-auto"
            layout={reducedMotion ? false : true}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              layout: { duration: 0.3 }
            }}
          >
            <InteractiveToast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
              action={toast.action}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// 類型定義
declare global {
  interface Window {
    toastManager: {
      success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string
      error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string
      warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string
      info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string
      loading: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string
      clearAll: () => void
    }
  }
}

// Hook使用方式
export const useInteractiveToast = () => {
  return {
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      window.toastManager?.success(message, options),
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      window.toastManager?.error(message, options),
    warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      window.toastManager?.warning(message, options),
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      window.toastManager?.info(message, options),
    loading: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      window.toastManager?.loading(message, options)
  }
}

export default ToastManager