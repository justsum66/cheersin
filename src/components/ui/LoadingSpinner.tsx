import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'primary';
  label?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default', 
  label,
  className = '' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinnerClasses = {
    default: 'border-gray-300 border-t-gray-600',
    glass: 'border-white/20 border-t-white/60',
    primary: 'border-primary-300/30 border-t-primary-500'
  };

  const spinnerClass = `animate-spin rounded-full border-2 border-solid ${sizeClasses[size]} ${spinnerClasses[variant]} ${className}`;

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={spinnerClass}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      {label && (
        <span className={`mt-2 text-sm ${variant === 'glass' ? 'text-white/60' : 'text-gray-600'}`}>
          {label}
        </span>
      )}
    </div>
  );
};