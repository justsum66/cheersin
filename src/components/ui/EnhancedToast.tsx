import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X, Info, AlertTriangle, Hourglass } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number; // 0-100 for custom progress
  dismissible?: boolean;
  pauseOnHover?: boolean;
}

interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number;
  dismissible?: boolean;
  pauseOnHover?: boolean;
}

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number;
  dismissible?: boolean;
  pauseOnHover?: boolean;
}

/**
 * Enhanced Toast Notification Component
 * Features:
 * - Multiple positioning options
 * - Custom progress indicators
 * - Hover pause functionality
 * - Smooth animations
 * - Accessibility support
 * - Action buttons
 */
export function EnhancedToast({ 
  id, 
  message, 
  type, 
  duration = 4000, 
  position = 'bottom-right',
  onClose, 
  action,
  progress,
  dismissible = true,
  pauseOnHover = true
}: ToastProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const reducedMotion = useReducedMotion();

  // Get type-specific configuration
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500/95',
          borderColor: 'border-green-400/60',
          iconColor: 'text-green-100',
          progressColor: 'bg-green-300'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-500/95',
          borderColor: 'border-red-400/60',
          iconColor: 'text-red-100',
          progressColor: 'bg-red-300'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-500/95',
          borderColor: 'border-amber-400/60',
          iconColor: 'text-amber-100',
          progressColor: 'bg-amber-300'
        };
      case 'loading':
        return {
          icon: Hourglass,
          bgColor: 'bg-blue-500/95',
          borderColor: 'border-blue-400/60',
          iconColor: 'text-blue-100',
          progressColor: 'bg-blue-300'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-500/95',
          borderColor: 'border-gray-400/60',
          iconColor: 'text-gray-100',
          progressColor: 'bg-gray-300'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  // Handle auto-dismiss timing
  useEffect(() => {
    if (type === 'loading' || progress !== undefined) return; // Don't auto-dismiss loading or progress toasts
    
    const interval = setInterval(() => {
      if (!isPaused && !isHovered) {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedTime(elapsed);
        
        if (elapsed >= duration) {
          onClose(id);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, isPaused, isHovered, onClose, id, type, progress]);

  // Handle hover pause
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsHovered(true);
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsHovered(false);
      setIsPaused(false);
      startTimeRef.current = Date.now() - elapsedTime;
    }
  };

  // Calculate progress percentage
  const progressPercentage = progress !== undefined 
    ? progress 
    : type === 'loading' 
      ? undefined 
      : Math.min(100, (elapsedTime / duration) * 100);

  // Get position classes
  const getPositionClasses = (pos: string) => {
    const positions: Record<string, string> = {
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4'
    };
    return positions[pos] || positions['bottom-right'];
  };

  return (
    <motion.div
      layout
      initial={{ 
        opacity: 0, 
        scale: reducedMotion ? 1 : 0.8,
        y: reducedMotion ? 0 : position.startsWith('top') ? -20 : 20
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: 0
      }}
      exit={{ 
        opacity: 0, 
        scale: reducedMotion ? 1 : 0.8,
        y: reducedMotion ? 0 : position.startsWith('top') ? -20 : 20
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: reducedMotion ? 0 : 0.3
      }}
      className={`
        relative flex items-start gap-3 p-4 rounded-xl
        backdrop-blur-xl border shadow-2xl
        max-w-sm w-full min-h-[60px]
        select-none cursor-pointer
        ${config.bgColor} ${config.borderColor} border
        ${getPositionClasses(position)}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => dismissible && type !== 'loading' && onClose(id)}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-relaxed">
          {message}
        </p>
        
        {/* Action button */}
        {action && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="mt-2 text-xs font-medium text-white/90 hover:text-white underline hover:no-underline transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && type !== 'loading' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose(id);
          }}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="關閉通知"
        >
          <X className="w-4 h-4 text-white/70 hover:text-white" />
        </button>
      )}

      {/* Progress bar */}
      {progressPercentage !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-xl overflow-hidden">
          <motion.div
            className={`h-full ${config.progressColor}`}
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Loading spinner for loading type */}
      {type === 'loading' && (
        <motion.div
          className="flex-shrink-0 mt-0.5"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <Hourglass className="w-5 h-5 text-white/70" />
        </motion.div>
      )}
    </motion.div>
  );
}

// Toast Manager Context
interface ToastContextValue {
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toasts: ToastState[];
}

import { createContext, useContext } from 'react';

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastState = {
      id,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration,
      position: options.position,
      action: options.action,
      progress: options.progress,
      dismissible: options.dismissible,
      pauseOnHover: options.pauseOnHover
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    addToast,
    removeToast,
    clearToasts,
    toasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[1000]">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <EnhancedToast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              position={toast.position}
              onClose={removeToast}
              action={toast.action}
              progress={toast.progress}
              dismissible={toast.dismissible}
              pauseOnHover={toast.pauseOnHover}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Hook for easy toast usage
export function useEnhancedToast() {
  const { addToast, removeToast, clearToasts } = useToast();
  
  return {
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      addToast({ message, type: 'success', ...options }),
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      addToast({ message, type: 'error', ...options }),
    warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      addToast({ message, type: 'warning', ...options }),
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      addToast({ message, type: 'info', ...options }),
    loading: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => 
      addToast({ message, type: 'loading', ...options }),
    custom: addToast,
    dismiss: removeToast,
    clear: clearToasts
  };
}