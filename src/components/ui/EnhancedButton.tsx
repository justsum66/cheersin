import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  rippleEffect?: boolean;
  hoverEffect?: boolean;
  pressEffect?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const EnhancedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  rippleEffect = true,
  hoverEffect = true,
  pressEffect = true,
  icon,
  iconPosition = 'left'
}: EnhancedButtonProps) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]'
  };

  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white border border-primary-500 hover:border-primary-600',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white border border-secondary-500 hover:border-secondary-600',
    ghost: 'bg-transparent hover:bg-white/10 text-white border border-transparent hover:border-white/20',
    outline: 'bg-transparent hover:bg-white/5 text-white border border-white/30 hover:border-white/50'
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!rippleEffect || !buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    handleRipple(e);
    onClick?.();
  };

  const handleMouseDown = () => {
    if (pressEffect && !disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (pressEffect) {
      setIsPressed(false);
    }
  };

  // Clean up ripples when component unmounts
  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-xl font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        focus-visible:ring-offset-[#0a0a1a] games-focus-ring games-touch-target
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${hoverEffect ? 'hover:scale-[1.02] hover:shadow-lg' : ''}
        ${pressEffect && isPressed ? 'scale-[0.98] shadow-inner' : ''}
        ${className}
      `}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      whileTap={pressEffect ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0
            }}
            initial={{ 
              width: 0, 
              height: 0, 
              opacity: 0.7,
              x: '-50%',
              y: '-50%'
            }}
            animate={{ 
              width: 200, 
              height: 200, 
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Loading spinner */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button content */}
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {icon && iconPosition === 'left' && (
          <motion.div
            animate={{ scale: isPressed ? 0.9 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {icon}
          </motion.div>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <motion.div
            animate={{ scale: isPressed ? 0.9 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {icon}
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
};