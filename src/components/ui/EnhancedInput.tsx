import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface EnhancedInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showValidation?: boolean;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const EnhancedInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  success,
  disabled = false,
  required = false,
  className = '',
  showValidation = true,
  showPasswordToggle = false,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur
}: EnhancedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = !!error && isDirty;
  const hasSuccess = !!success && !hasError && isDirty;
  const isValid = showValidation && hasSuccess;
  const isInvalid = showValidation && hasError;

  const handleFocus = () => {
    setIsFocused(true);
    setIsDirty(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsDirty(true);
  };

  const getStatusIcon = () => {
    if (isInvalid) return <X className="w-5 h-5 text-red-400" />;
    if (isValid) return <Check className="w-5 h-5 text-green-400" />;
    if (isFocused && value) return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    return null;
  };

  const getInputPadding = () => {
    const hasLeftIcon = leftIcon || showValidation;
    const hasRightIcon = rightIcon || (showPasswordToggle && type === 'password') || showValidation;
    
    let paddingLeft = 'pl-4';
    let paddingRight = 'pr-4';
    
    if (hasLeftIcon) paddingLeft = leftIcon ? 'pl-12' : 'pl-10';
    if (hasRightIcon) paddingRight = rightIcon || (showPasswordToggle && type === 'password') ? 'pr-12' : 'pr-10';
    
    return `${paddingLeft} ${paddingRight}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <motion.label
          htmlFor={label}
          className={`block text-sm font-medium mb-2 transition-colors ${
            hasError ? 'text-red-300' : isFocused ? 'text-primary-300' : 'text-white/70'
          }`}
          animate={{ 
            scale: isFocused ? 1.02 : 1,
            color: hasError ? '#f87171' : isFocused ? '#60a5fa' : '#c7d2fe'
          }}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </motion.label>
      )}

      {/* Input container */}
      <motion.div
        className={`
          relative rounded-xl border-2 transition-all duration-300
          ${getInputPadding()}
          ${disabled ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}
          ${hasError ? 'border-red-500/50 bg-red-500/5' : ''}
          ${hasSuccess ? 'border-green-500/50 bg-green-500/5' : ''}
          ${isFocused && !hasError && !hasSuccess ? 'border-primary-500/70 bg-white/15 ring-2 ring-primary-500/20' : ''}
          hover:border-white/40
          focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500/30
          games-focus-ring
        `}
        animate={{
          boxShadow: isFocused && !hasError && !hasSuccess 
            ? '0 0 0 4px rgba(96, 165, 250, 0.1)' 
            : 'none'
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Left icon */}
        <AnimatePresence>
          {leftIcon && (
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {leftIcon}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input field */}
        <input
          ref={inputRef}
          id={label}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full bg-transparent border-none outline-none text-white placeholder-white/40
            py-3 text-base transition-all duration-200
            ${disabled ? 'cursor-not-allowed text-white/50' : 'cursor-text'}
          `}
        />

        {/* Status icons and right elements */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Status icon */}
          <AnimatePresence>
            {showValidation && getStatusIcon() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {getStatusIcon()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password toggle */}
          <AnimatePresence>
            {showPasswordToggle && type === 'password' && (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/50 hover:text-white/80 transition-colors p-1 rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right icon */}
          <AnimatePresence>
            {rightIcon && (
              <motion.div
                className="text-white/50"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {rightIcon}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Helper text */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            className={`mt-2 text-sm flex items-center gap-2 ${
              hasError ? 'text-red-400' : 'text-green-400'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {hasError && <X className="w-4 h-4 flex-shrink-0" />}
            {hasSuccess && <Check className="w-4 h-4 flex-shrink-0" />}
            <span>{error || success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};