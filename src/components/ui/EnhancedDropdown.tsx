import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface EnhancedDropdownProps {
  options: DropdownOption[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  variant?: 'default' | 'ghost' | 'outline' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dropdownClassName?: string;
  maxHeight?: number;
  autoFocus?: boolean;
  closeOnSelect?: boolean;
  showCheckboxes?: boolean;
  groupBy?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  onSearch?: (query: string) => void;
  onCreateOption?: (inputValue: string) => void;
  createOptionMessage?: string;
}

interface DropdownRef {
  focus: () => void;
  blur: () => void;
  open: () => void;
  close: () => void;
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-5 py-3 text-lg min-h-[52px]'
};

const VARIANT_CLASSES = {
  default: 'bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30',
  ghost: 'bg-transparent hover:bg-white/10 border border-transparent hover:border-white/20',
  outline: 'bg-transparent border border-white/30 hover:bg-white/5 hover:border-white/50',
  filled: 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
};

/**
 * Enhanced Dropdown Component
 * Features:
 * - Single and multiple selection
 * - Search functionality
 * - Keyboard navigation
 * - Custom filtering
 * - Accessibility compliance
 * - Smooth animations
 * - Grouping support
 * - Custom option creation
 */
export const EnhancedDropdown = forwardRef<DropdownRef, EnhancedDropdownProps>(({
  options,
  value,
  onChange,
  placeholder = '請選擇...',
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  variant = 'default',
  size = 'md',
  className = '',
  dropdownClassName = '',
  maxHeight = 300,
  autoFocus = false,
  closeOnSelect = true,
  showCheckboxes = false,
  groupBy,
  emptyMessage = '沒有選項',
  loading = false,
  loadingMessage = '載入中...',
  onSearch,
  onCreateOption,
  createOptionMessage = '建立'
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [hasCreatedOption, setHasCreatedOption] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Imperative handle for parent components
  useImperativeHandle(ref, () => ({
    focus: () => triggerRef.current?.focus(),
    blur: () => triggerRef.current?.blur(),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }));

  // Get selected labels for display
  const getSelectedLabels = useCallback(() => {
    if (multiple && Array.isArray(value)) {
      return options
        .filter(option => value.includes(option.value))
        .map(option => option.label);
    } else if (!multiple && value !== undefined) {
      const selectedOption = options.find(option => option.value === value);
      return selectedOption ? [selectedOption.label] : [];
    }
    return [];
  }, [value, options, multiple]);

  // Filter options based on search
  const filteredOptions = useCallback(() => {
    let filtered = options;
    
    if (searchQuery) {
      filtered = options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [options, searchQuery]);

  // Group options if groupBy is specified
  const groupedOptions = useCallback(() => {
    const filtered = filteredOptions();
    
    if (groupBy) {
      const groups: Record<string, DropdownOption[]> = {};
      filtered.forEach(option => {
        const groupKey = (option as any)[groupBy] || '未分組';
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(option);
      });
      return groups;
    }
    
    return { '': filtered };
  }, [filteredOptions, groupBy]);

  // Handle selection
  const handleSelect = useCallback((optionValue: string | number) => {
    if (disabled) return;
    
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(optionValue)
        ? currentValue.filter(v => v !== optionValue)
        : [...currentValue, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      if (closeOnSelect) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    
    if (!multiple && searchable) {
      setSearchQuery('');
    }
  }, [value, onChange, multiple, disabled, closeOnSelect, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    const filtered = filteredOptions();
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && filtered[focusedIndex]) {
          handleSelect(filtered[focusedIndex].value);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filtered.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filtered.length - 1
          );
        }
        break;
        
      case 'Home':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;
        
      case 'End':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(filtered.length - 1);
        }
        break;
        
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  }, [isOpen, focusedIndex, filteredOptions, handleSelect, disabled]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFocusedIndex(-1);
    onSearch?.(query);
  }, [onSearch]);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
    }
    setSearchQuery('');
    setHasCreatedOption(false);
  }, [onChange, multiple]);

  // Handle create option
  const handleCreateOption = useCallback(() => {
    if (searchQuery && onCreateOption) {
      onCreateOption(searchQuery);
      setHasCreatedOption(true);
    }
  }, [searchQuery, onCreateOption]);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const optionElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [autoFocus]);

  const selectedLabels = getSelectedLabels();
  const showPlaceholder = selectedLabels.length === 0;
  const hasValue = !showPlaceholder;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full text-left rounded-xl font-medium transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 
            focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]
            games-focus-ring games-touch-target flex items-center justify-between
            ${SIZE_CLASSES[size]}
            ${VARIANT_CLASSES[variant]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="dropdown-label"
        >
          <div className="flex-1 min-w-0">
            {searchable && isOpen ? (
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent border-none outline-none text-white placeholder-white/40"
                placeholder={placeholder}
                autoFocus
              />
            ) : (
              <span className={`
                truncate
                ${showPlaceholder ? 'text-white/40' : 'text-white'}
              `}>
                {showPlaceholder ? placeholder : selectedLabels.join(', ')}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                aria-label="清除選擇"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </div>
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.2
            }}
            className={`
              absolute z-50 w-full mt-1 rounded-xl bg-[#1a1a2e] border border-white/10 
              shadow-2xl shadow-black/50 overflow-hidden
              ${dropdownClassName}
            `}
            style={{ maxHeight: `${maxHeight}px` }}
            role="listbox"
            aria-multiselectable={multiple}
          >
            {loading ? (
              <div className="p-4 text-center text-white/50">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
                {loadingMessage}
              </div>
            ) : (
              <>
                {/* Create option */}
                {searchQuery && onCreateOption && !hasCreatedOption && (
                  <button
                    type="button"
                    onClick={handleCreateOption}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors flex items-center gap-2 text-white/80 hover:text-white"
                  >
                    <span className="text-sm">+</span>
                    <span>{createOptionMessage} "{searchQuery}"</span>
                  </button>
                )}
                
                {/* Options */}
                {Object.entries(groupedOptions()).map(([group, groupOptions]) => (
                  <div key={group}>
                    {group && (
                      <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        {group}
                      </div>
                    )}
                    
                    {groupOptions.map((option, index) => {
                      const isFocused = focusedIndex === (group ? 
                        filteredOptions().findIndex(o => o.value === option.value) : 
                        index
                      );
                      const isSelected = multiple 
                        ? Array.isArray(value) && value.includes(option.value)
                        : value === option.value;
                      
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          disabled={option.disabled}
                          className={`
                            w-full text-left px-4 py-2 transition-colors flex items-center gap-3
                            ${option.disabled 
                              ? 'text-white/30 cursor-not-allowed' 
                              : 'text-white/80 hover:text-white hover:bg-white/5 cursor-pointer'
                            }
                            ${isFocused ? 'bg-white/10' : ''}
                            ${isSelected ? 'bg-primary-500/20 text-primary-200' : ''}
                          `}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setFocusedIndex(
                            group ? filteredOptions().findIndex(o => o.value === option.value) : index
                          )}
                        >
                          {showCheckboxes && (
                            <div className={`
                              w-4 h-4 rounded border flex items-center justify-center
                              ${isSelected 
                                ? 'bg-primary-500 border-primary-500' 
                                : 'border-white/30'
                              }
                            `}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          )}
                          
                          {option.icon && (
                            <div className="flex-shrink-0">
                              {option.icon}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-white/50 truncate">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
                
                {/* Empty state */}
                {filteredOptions().length === 0 && !searchQuery && (
                  <div className="p-4 text-center text-white/50 text-sm">
                    {emptyMessage}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

EnhancedDropdown.displayName = 'EnhancedDropdown';

// Hook for dropdown state management
export function useDropdownState<T = string | number | (string | number)[]>(initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  
  const handleChange = useCallback((newValue: string | number | (string | number)[]) => {
    setValue(newValue as T);
  }, []);
  
  const clear = useCallback(() => {
    setValue(undefined);
  }, []);
  
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  return {
    value,
    setValue: handleChange,
    clear,
    reset
  };
}