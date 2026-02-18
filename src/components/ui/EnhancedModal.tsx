import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

interface EnhancedModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  variant?: 'default' | 'danger' | 'success' | 'warning';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  returnFocus?: boolean;
  backdropBlur?: boolean;
  className?: string;
  contentClassName?: string;
  animationType?: 'slide' | 'fade' | 'scale' | 'flip';
  autoFocus?: boolean;
  role?: 'dialog' | 'alertdialog';
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

interface ModalRef {
  focus: () => void;
  close: () => void;
}

const FOCUSABLE_ELEMENTS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  fullscreen: 'max-w-full h-full'
};

const VARIANT_STYLES = {
  default: 'bg-[#1a1a2e] border border-white/10',
  danger: 'bg-red-900/90 border border-red-500/30',
  success: 'bg-green-900/90 border border-green-500/30',
  warning: 'bg-amber-900/90 border border-amber-500/30'
};

const ANIMATION_VARIANTS = {
  slide: {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.98 }
  },
  fade: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  flip: {
    hidden: { opacity: 0, rotateX: -90 },
    visible: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 }
  }
};

/**
 * Enhanced Modal Component
 * Features:
 * - Multiple sizes and variants
 * - Advanced focus management
 * - Custom animations
 * - Accessibility compliance
 * - Keyboard navigation
 * - Responsive design
 */
export const EnhancedModal = forwardRef<ModalRef, EnhancedModalProps>(({
  open,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  trapFocus = true,
  returnFocus = true,
  backdropBlur = true,
  className = '',
  contentClassName = '',
  animationType = 'scale',
  autoFocus = true,
  role = 'dialog',
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy
}, ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const reducedMotion = useReducedMotion();
  
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus management
  const focusFirstElement = useCallback(() => {
    if (!contentRef.current || !autoFocus) return;
    
    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
    const firstFocusable = Array.from(focusableElements).find(el => 
      el.offsetParent !== null && !el.hasAttribute('disabled')
    );
    
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, [autoFocus]);

  const trapTabKey = useCallback((e: KeyboardEvent) => {
    if (!trapFocus || !contentRef.current) return;
    
    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
    const focusableArray = Array.from(focusableElements).filter(el => 
      el.offsetParent !== null && !el.hasAttribute('disabled')
    );
    
    if (focusableArray.length === 0) return;
    
    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];
    
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [trapFocus]);

  const handleClose = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (returnFocus && previousActiveElement.current) {
      setTimeout(() => {
        previousActiveElement.current?.focus();
      }, reducedMotion ? 0 : 300);
    }
    
    onClose();
  }, [isAnimating, returnFocus, onClose, reducedMotion]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      handleClose();
    }
  }, [closeOnEscape, handleClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  }, [closeOnBackdropClick, handleClose]);

  // Imperative handle for parent components
  useImperativeHandle(ref, () => ({
    focus: focusFirstElement,
    close: handleClose
  }));

  // Setup and cleanup effects
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      
      // Focus first element after animation
      const timer = setTimeout(() => {
        focusFirstElement();
        setIsAnimating(false);
      }, reducedMotion ? 0 : 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [open, focusFirstElement, reducedMotion]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', trapTabKey);
      document.addEventListener('keydown', handleEscape);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', trapTabKey);
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, trapTabKey, handleEscape]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!open && !isAnimating) return null;

  const animationVariants = ANIMATION_VARIANTS[animationType];
  const sizeClass = size === 'fullscreen' || isFullscreen ? SIZE_CLASSES.fullscreen : SIZE_CLASSES[size];
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className={`absolute inset-0 ${backdropBlur ? 'bg-black/70 backdrop-blur-md' : 'bg-black/60'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <motion.div
            ref={contentRef}
            role={role}
            aria-modal="true"
            aria-labelledby={ariaLabelledBy || (title ? 'modal-title' : undefined)}
            aria-describedby={ariaDescribedBy}
            className={`
              relative rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden
              ${sizeClass} ${variantStyle} ${contentClassName}
              ${size === 'fullscreen' || isFullscreen ? 'm-0 w-full h-full rounded-none' : ''}
            `}
            variants={reducedMotion ? undefined : animationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: reducedMotion ? 0 : undefined
            }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`
                flex items-center justify-between p-4 border-b border-white/10
                ${variant !== 'default' ? 'border-opacity-30' : ''}
              `}>
                {title && (
                  <h2 
                    id={ariaLabelledBy || 'modal-title'}
                    className="text-lg font-semibold text-white truncate"
                  >
                    {title}
                  </h2>
                )}
                
                <div className="flex items-center gap-2">
                  {/* Fullscreen toggle */}
                  {size !== 'fullscreen' && (
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center games-focus-ring"
                      aria-label={isFullscreen ? "退出全螢幕" : "全螢幕"}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  
                  {/* Close button */}
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center games-focus-ring"
                      aria-label="關閉"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className={`
              ${title || showCloseButton ? 'p-4' : 'p-4'}
              ${size === 'fullscreen' || isFullscreen ? 'h-full overflow-auto' : 'max-h-[calc(90vh-4rem)] overflow-y-auto'}
            `}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

EnhancedModal.displayName = 'EnhancedModal';

// Hook for easy modal management
export function useEnhancedModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    open,
    close,
    toggle
  };
}

// Pre-built modal variants
interface ConfirmModalProps extends Omit<EnhancedModalProps, 'children' | 'variant'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmVariant?: 'primary' | 'danger' | 'success';
}

export function ConfirmModal({
  message,
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  ...props
}: ConfirmModalProps) {
  const { close } = useEnhancedModal();
  
  const handleConfirm = () => {
    onConfirm();
    close();
  };
  
  const handleCancel = () => {
    onCancel?.();
    close();
  };
  
  const confirmButtonClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  };
  
  return (
    <EnhancedModal {...props} onClose={handleCancel} variant="warning">
      <div className="space-y-4">
        <p className="text-white/80">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors min-h-[44px] games-focus-ring"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`${confirmButtonClasses[confirmVariant]} px-4 py-2 rounded-lg transition-colors min-h-[44px] games-focus-ring`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </EnhancedModal>
  );
}