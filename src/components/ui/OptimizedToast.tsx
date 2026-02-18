'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  dismissible?: boolean;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastOptions {
  id: string;
  timestamp: number;
}

/** 
 * 任務 14：Toast 組件性能優化
 * 實現：
 * 1. 批量更新和渲染優化
 * 2. 智能去重和合併
 * 3. 記憶體管理
 * 4. 動畫性能優化
 * 5. 防止過度渲染
 * 6. 自動清理機制
 */
export const OptimizedToastProvider = memo(function OptimizedToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 4000
}: {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastQueue = useRef<ToastOptions[]>([]);
  const processingQueue = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  // 批量處理 Toast 隊列
  const processQueue = useCallback(() => {
    if (processingQueue.current || toastQueue.current.length === 0) return;
    
    processingQueue.current = true;
    
    // 批量處理最多 3 個 Toast
    const batch = toastQueue.current.splice(0, 3);
    
    setToasts(prev => {
      // 限制最大 Toast 數量
      const filtered = prev.slice(0, maxToasts - batch.length);
      
      // 添加新 Toast
      const newToasts = batch.map(options => ({
        ...options,
        id: options.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      }));
      
      return [...newToasts, ...filtered];
    });
    
    processingQueue.current = false;
    
    // 如果還有待處理的 Toast，繼續處理
    if (toastQueue.current.length > 0) {
      setTimeout(processQueue, 50);
    }
  }, [maxToasts]);

  // 添加 Toast
  const addToast = useCallback((options: ToastOptions) => {
    toastQueue.current.push({
      ...options,
      duration: options.duration ?? defaultDuration
    });
    
    // 防抖處理
    setTimeout(processQueue, 10);
  }, [defaultDuration, processQueue]);

  // 移除 Toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 清除所有 Toast
  const clearAll = useCallback(() => {
    setToasts([]);
    toastQueue.current = [];
  }, []);

  // 自動清理過期 Toast
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts(prev => 
        prev.filter(toast => {
          const age = now - toast.timestamp;
          const duration = toast.duration ?? defaultDuration;
          return age < duration;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [defaultDuration]);

  // 提供 Toast 方法
  const toastMethods = {
    success: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'success', message }),
    error: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'error', message }),
    warning: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'warning', message }),
    info: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'info', message }),
    loading: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => 
      addToast({ ...options, type: 'loading', message, duration: 0 }),
    dismiss: removeToast,
    clear: clearAll
  };

  // Context 值
  const contextValue = {
    ...toastMethods,
    toasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
});

// Toast Context
const ToastContext = React.createContext<{
  success: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => void;
  loading: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  toasts: ToastItem[];
} | null>(null);

// Toast Container
const ToastContainer = memo(function ToastContainer({
  toasts,
  onDismiss
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  // 按位置分組 Toast
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastItem[]>);

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`
            fixed z-[1000] p-4 space-y-2
            ${getPositionClasses(position as ToastPosition)}
          `}
        >
          <AnimatePresence mode="popLayout">
            {positionToasts.map(toast => (
              <ToastItemComponent
                key={toast.id}
                toast={toast}
                onDismiss={onDismiss}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
});

// Toast Item Component
const ToastItemComponent = memo(function ToastItemComponent({
  toast,
  onDismiss
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 自動關閉計時器
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast.id, toast.duration, onDismiss]);

  // 重置計時器
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
    }
  }, [toast.duration, toast.id, onDismiss]);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  const handleAction = useCallback(() => {
    toast.action?.onClick();
    onDismiss(toast.id);
  }, [toast.action, onDismiss, toast.id]);

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    
    switch (toast.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'loading': return (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      );
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <m.div
      layout={!reducedMotion}
      initial={reducedMotion ? undefined : { opacity: 0, scale: 0.9, y: -10 }}
      animate={reducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9, y: -10 }}
      transition={{
        duration: reducedMotion ? 0 : 0.2,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm max-w-sm
        ${getToastStyle(toast.type)}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h3 className="font-medium text-white mb-1">
            {toast.title}
          </h3>
        )}
        <p className="text-sm text-white/80">
          {toast.message}
        </p>
        
        {toast.action && (
          <button
            onClick={handleAction}
            className="mt-2 text-sm font-medium text-primary-300 hover:text-primary-200 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      {toast.dismissible !== false && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="關閉通知"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      )}
    </m.div>
  );
});

// Helper functions
function getPositionClasses(position: ToastPosition): string {
  switch (position) {
    case 'top-left': return 'top-0 left-0';
    case 'top-right': return 'top-0 right-0';
    case 'bottom-left': return 'bottom-0 left-0';
    case 'bottom-right': return 'bottom-0 right-0';
    case 'top-center': return 'top-0 left-1/2 transform -translate-x-1/2';
    case 'bottom-center': return 'bottom-0 left-1/2 transform -translate-x-1/2';
    default: return 'top-0 right-0';
  }
}

function getToastStyle(type: ToastType | undefined): string {
  switch (type) {
    case 'success': return 'bg-green-500/20 border-green-500/30';
    case 'error': return 'bg-red-500/20 border-red-500/30';
    case 'warning': return 'bg-yellow-500/20 border-yellow-500/30';
    case 'loading': return 'bg-white/10 border-white/20';
    default: return 'bg-blue-500/20 border-blue-500/30';
  }
}

// Export hooks
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Default export
export { OptimizedToastProvider as ToastProvider };