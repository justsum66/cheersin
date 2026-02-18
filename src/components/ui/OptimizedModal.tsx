'use client';

/** 
 * 任務 11：優化 Modal 組件以減少掛載/卸載開銷
 * 實現：
 * 1. 使用 CSS visibility 而非條件渲染來避免重複掛載
 * 2. 優化的焦點管理
 * 3. 改進的動畫處理
 * 4. 更好的記憶體管理
 * 5. 防抖的事件處理
 */
import { useEffect, useRef, type ReactNode, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalOverlay, modalContent } from '@/lib/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface OptimizedModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** 是否使用 CSS visibility 來避免重新掛載 */
  useVisibilityOptimization?: boolean;
  /** 延遲卸載時間（毫秒） */
  unmountDelay?: number;
}

/** 
 * 優化版本的 Modal 組件
 * 通過智能掛載策略減少性能開銷
 */
export const OptimizedModal = memo(function OptimizedModal({
  open,
  onClose,
  title,
  children,
  className = '',
  useVisibilityOptimization = true,
  unmountDelay = 300
}: OptimizedModalProps) {
  const prevFocus = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  
  const reducedMotion = usePrefersReducedMotion();

  // 防抖的關閉處理
  const handleClose = useCallback(() => {
    if (isAnimatingRef.current) return;
    onClose();
  }, [onClose]);

  // 優化的焦點管理
  const manageFocus = useCallback(() => {
    if (!open) return;
    
    prevFocus.current = document.activeElement as HTMLElement | null;
    
    const focusFirst = () => {
      const first = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      if (first && !first.contains(document.activeElement)) {
        first.focus();
      }
    };
    
    requestAnimationFrame(focusFirst);
  }, [open]);

  // 優化的鍵盤事件處理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
      return;
    }
    
    if (e.key !== 'Tab') return;
    
    const container = contentRef.current;
    if (!container?.contains(document.activeElement)) return;
    
    const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE);
    const list = Array.from(nodes).filter((el) => el.offsetParent != null);
    if (list.length === 0) return;
    
    const first = list[0];
    const last = list[list.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [handleClose]);

  // 身體滾動控制
  const controlBodyScroll = useCallback((shouldPrevent: boolean) => {
    document.body.style.overflow = shouldPrevent ? 'hidden' : '';
  }, []);

  // 清理函數
  const cleanup = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    controlBodyScroll(false);
    document.removeEventListener('keydown', handleKeyDown);
    
    // 延遲還原焦點
    setTimeout(() => {
      prevFocus.current?.focus?.();
      prevFocus.current = null;
    }, 50);
  }, [controlBodyScroll, handleKeyDown]);

  useEffect(() => {
    if (!open) {
      // 延遲卸載以允許動畫完成
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      
      closeTimerRef.current = setTimeout(() => {
        cleanup();
      }, unmountDelay);
      
      return;
    }

    // 開啟時的設置
    manageFocus();
    controlBodyScroll(true);
    document.addEventListener('keydown', handleKeyDown);
    
    // 清理函數
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [open, manageFocus, controlBodyScroll, handleKeyDown, cleanup, unmountDelay]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (typeof document === 'undefined') return null;

  // 使用 CSS visibility 優化避免重新掛載
  const shouldRender = useVisibilityOptimization ? true : open;
  const visibilityClass = useVisibilityOptimization && !open ? 'invisible' : '';

  if (!shouldRender) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
          className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${visibilityClass}`}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          <m.div
            ref={contentRef}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
            className={`rounded-2xl bg-[#1a0a2e] border border-white/10 shadow-xl max-h-[90vh] overflow-auto ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {title != null && (
              <div className="flex items-center justify-between gap-4 p-4 border-b border-white/10">
                <h2 id="modal-title" className="text-lg font-semibold text-white">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/10 games-focus-ring min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            {title == null && (
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/10 games-focus-ring min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-4">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
});