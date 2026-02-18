import { motion } from 'framer-motion';

interface EnhancedSkeletonProps {
  className?: string;
  variant?: 'default' | 'glass' | 'card' | 'avatar';
  animation?: boolean;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  shimmerDirection?: 'right' | 'left' | 'up' | 'down';
}

export const EnhancedSkeleton = ({ 
  className = '', 
  variant = 'default', 
  animation = true,
  width,
  height,
  borderRadius = 'rounded',
  shimmerDirection = 'right'
}: EnhancedSkeletonProps) => {
  const variantClasses = {
    default: 'bg-gray-200',
    glass: 'bg-white/10',
    card: 'bg-white/5',
    avatar: 'bg-white/10'
  };

  const shimmerDirections = {
    right: 'to-r',
    left: 'to-l',
    up: 'to-t',
    down: 'to-b'
  };

  const style = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: borderRadius
  };

  if (!animation) {
    return (
      <div
        className={`${variantClasses[variant]} ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${variantClasses[variant]} ${className}`}
      style={style}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${shimmerDirections[shimmerDirection]}`}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: Math.random() * 0.5 // Random delay for more natural effect
        }}
      />
    </div>
  );
};

// Enhanced skeleton for text lines
interface EnhancedSkeletonTextProps {
  lines?: number;
  className?: string;
  variant?: 'default' | 'glass' | 'card' | 'avatar';
  animation?: boolean;
}

export const EnhancedSkeletonText = ({ 
  lines = 3, 
  className = '', 
  variant = 'default',
  animation = true
}: EnhancedSkeletonTextProps) => {
  return (
    <div className={`space-y-2 min-w-0 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <EnhancedSkeleton 
          key={i} 
          className={`h-4 min-h-4 ${(i === lines - 1 && lines > 1) ? 'w-3/4' : 'w-full'}`} 
          variant={variant}
          animation={animation}
        />
      ))}
    </div>
  );
};

// Enhanced skeleton for cards
interface EnhancedSkeletonCardProps {
  className?: string;
  variant?: 'default' | 'glass' | 'card' | 'avatar';
  animation?: boolean;
}

export const EnhancedSkeletonCard = ({ 
  className = '', 
  variant = 'glass',
  animation = true
}: EnhancedSkeletonCardProps) => {
  return (
    <div className={`rounded-2xl border border-white/10 overflow-hidden min-w-0 max-w-full ${className}`}>
      <EnhancedSkeleton className="h-40 min-h-40 w-full" variant={variant} animation={animation} />
      <div className="p-4 space-y-2">
        <EnhancedSkeleton className="h-5 min-h-5 w-3/4" variant={variant} animation={animation} />
        <EnhancedSkeletonText lines={2} variant={variant} animation={animation} />
      </div>
    </div>
  );
};