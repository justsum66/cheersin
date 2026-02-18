import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  min?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  className?: string;
  barClassName?: string;
  labelClassName?: string;
  indeterminate?: boolean;
  animationDuration?: number;
  onAnimationComplete?: () => void;
}

interface CircularProgressProps extends Omit<ProgressProps, 'size' | 'showLabel' | 'label' | 'striped'> {
  size?: number;
  strokeWidth?: number;
  showInnerValue?: boolean;
  innerValueClassName?: string;
}

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  vertical?: boolean;
  showLabels?: boolean;
  completedIcon?: React.ReactNode;
  currentIcon?: React.ReactNode;
  pendingIcon?: React.ReactNode;
  className?: string;
  stepClassName?: string;
  onStepClick?: (stepIndex: number) => void;
}

interface LoadingBarProps {
  isLoading?: boolean;
  color?: string;
  height?: number;
  showSpinner?: boolean;
  spinnerSize?: number;
  message?: string;
  className?: string;
  position?: 'top' | 'bottom';
}

const VARIANT_CLASSES = {
  default: 'bg-white/20',
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500'
};

const SIZE_CLASSES = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

/**
 * Enhanced Linear Progress Bar
 * Features:
 * - Multiple variants and sizes
 * - Animated transitions
 * - Indeterminate mode
 * - Custom labels
 * - Striped animation
 */
export function EnhancedProgress({
  value,
  max = 100,
  min = 0,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  showPercentage = false,
  animated = true,
  striped = false,
  className = '',
  barClassName = '',
  labelClassName = '',
  indeterminate = false,
  animationDuration = 300,
  onAnimationComplete
}: ProgressProps) {
  const [displayValue, setDisplayValue] = useState(indeterminate ? 100 : value);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const percentage = Math.min(100, Math.max(0, ((displayValue - min) / (max - min)) * 100));
  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];
  
  useEffect(() => {
    if (!indeterminate) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
        if (value >= max && onAnimationComplete) {
          onAnimationComplete();
        }
      }, animated ? animationDuration : 0);
      
      return () => clearTimeout(timer);
    }
  }, [value, max, animated, animationDuration, indeterminate, onAnimationComplete]);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {(showLabel || showPercentage || label) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className={`text-white/70 text-sm ${labelClassName}`}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`text-white/60 text-sm font-mono tabular-nums ${labelClassName}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div 
        ref={progressRef}
        className={`
          relative w-full rounded-full overflow-hidden bg-white/10
          ${sizeClass} ${className}
        `}
      >
        <motion.div
          className={`
            relative h-full rounded-full ${variantClass} ${barClassName}
            ${striped ? 'animate-stripes' : ''}
            ${indeterminate ? 'animate-pulse' : ''}
          `}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: indeterminate ? '100%' : `${percentage}%` }}
          transition={{
            width: {
              duration: animated ? animationDuration / 1000 : 0,
              ease: "easeOut"
            }
          }}
        >
          {indeterminate && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
          )}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Enhanced Circular Progress
 * Features:
 * - Customizable size and stroke
 * - Animated drawing
 * - Inner value display
 * - Multiple variants
 */
export function EnhancedCircularProgress({
  value,
  max = 100,
  min = 0,
  variant = 'default',
  size = 120,
  strokeWidth = 8,
  showInnerValue = false,
  innerValueClassName = '',
  showPercentage = true,
  animated = true,
  className = '',
  onAnimationComplete
}: CircularProgressProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const variantClass = VARIANT_CLASSES[variant];
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, ((displayValue - min) / (max - min)) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
      if (value >= max && onAnimationComplete) {
        onAnimationComplete();
      }
    }, animated ? 300 : 0);
    
    return () => clearTimeout(timer);
  }, [value, max, animated, onAnimationComplete]);
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={variantClass}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animated ? 0.3 : 0, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      
      {/* Inner content */}
      {(showInnerValue || showPercentage) && (
        <div 
          className={`
            absolute inset-0 flex flex-col items-center justify-center
            ${innerValueClassName}
          `}
        >
          {showInnerValue && (
            <span className="text-white text-lg font-semibold">
              {Math.round(displayValue)}
            </span>
          )}
          {showPercentage && (
            <span className="text-white/60 text-sm font-mono">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced Step Progress
 * Features:
 * - Horizontal and vertical layouts
 * - Clickable steps
 * - Custom icons
 * - Responsive design
 */
export function EnhancedStepProgress({
  steps,
  currentStep,
  variant = 'default',
  vertical = false,
  showLabels = true,
  completedIcon = <Check className="w-4 h-4" />,
  currentIcon = <div className="w-2 h-2 bg-current rounded-full" />,
  pendingIcon = <div className="w-2 h-2 bg-white/30 rounded-full" />,
  className = '',
  stepClassName = '',
  onStepClick
}: StepProgressProps) {
  const variantClass = VARIANT_CLASSES[variant];
  
  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };
  
  const getStatusIcon = (index: number) => {
    const status = getStepStatus(index);
    if (status === 'completed') return completedIcon;
    if (status === 'current') return currentIcon;
    return pendingIcon;
  };
  
  const getStatusClass = (index: number) => {
    const status = getStepStatus(index);
    if (status === 'completed') return `${variantClass} text-white`;
    if (status === 'current') return 'bg-white text-[#0a0a1a]';
    return 'bg-white/20 text-white/50';
  };
  
  if (vertical) {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`
              flex items-center gap-4 ${stepClassName}
              ${onStepClick ? 'cursor-pointer hover:opacity-80' : ''}
            `}
            onClick={() => onStepClick?.(index)}
          >
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${getStatusClass(index)}
            `}>
              {getStatusIcon(index)}
            </div>
            {showLabels && (
              <span className={`
                text-sm font-medium
                ${getStepStatus(index) === 'current' ? 'text-white' : 'text-white/70'}
              `}>
                {step}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`
              flex flex-col items-center flex-1 relative
              ${index !== steps.length - 1 ? 'pr-2' : ''}
              ${onStepClick ? 'cursor-pointer hover:opacity-80' : ''}
            `}
            onClick={() => onStepClick?.(index)}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center z-10
              ${getStatusClass(index)}
            `}>
              {getStatusIcon(index)}
            </div>
            {showLabels && (
              <span className={`
                text-xs text-center mt-2 font-medium
                ${getStepStatus(index) === 'current' ? 'text-white' : 'text-white/70'}
              `}>
                {step}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress line */}
      <div className="relative h-1 bg-white/10 rounded-full -mt-10 mx-4">
        <motion.div
          className={`h-full rounded-full ${variantClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, (currentStep / (steps.length - 1)) * 100))}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/**
 * Enhanced Loading Bar
 * Features:
 * - Top/bottom positioning
 * - Custom spinner
 * - Progress animation
 * - Smooth transitions
 */
export function EnhancedLoadingBar({
  isLoading = true,
  color = 'rgba(96, 165, 250, 0.8)',
  height = 3,
  showSpinner = true,
  spinnerSize = 16,
  message,
  className = '',
  position = 'top'
}: LoadingBarProps) {
  if (!isLoading) return null;
  
  return (
    <div className={`
      fixed left-0 right-0 z-50 flex items-center gap-3 px-4
      ${position === 'top' ? 'top-0' : 'bottom-0'}
      ${className}
    `}>
      {showSpinner && (
        <motion.div
          className="flex-shrink-0"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <div 
            className="rounded-full border-2 border-transparent border-t-current"
            style={{ 
              width: spinnerSize, 
              height: spinnerSize,
              borderColor: `${color} transparent ${color} transparent`
            }}
          />
        </motion.div>
      )}
      
      <div className="flex-1 h-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ 
            width: ['0%', '100%', '0%'],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {message && (
        <span className="flex-shrink-0 text-white/80 text-sm font-medium">
          {message}
        </span>
      )}
    </div>
  );
}

// Hook for progress management
export function useProgress(initialValue = 0, maxValue = 100) {
  const [value, setValue] = useState(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const increment = useCallback((amount = 1) => {
    setValue(prev => Math.min(maxValue, prev + amount));
  }, [maxValue]);
  
  const decrement = useCallback((amount = 1) => {
    setValue(prev => Math.max(0, prev - amount));
  }, []);
  
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  const setProgress = useCallback((newValue: number) => {
    setIsAnimating(true);
    setValue(Math.min(maxValue, Math.max(0, newValue)));
    setTimeout(() => setIsAnimating(false), 300);
  }, [maxValue]);
  
  const complete = useCallback(() => {
    setIsAnimating(true);
    setValue(maxValue);
    setTimeout(() => setIsAnimating(false), 300);
  }, [maxValue]);
  
  return {
    value,
    setValue: setProgress,
    increment,
    decrement,
    reset,
    complete,
    isAnimating,
    percentage: (value / maxValue) * 100
  };
}