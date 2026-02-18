'use client';

import * as React from 'react';
import { m, AnimatePresence, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OptimizedAccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface OptimizedAccordionProps {
  /** Accordion items */
  items: OptimizedAccordionItem[];
  /** Whether only one item can be open at a time */
  single?: boolean;
  /** Default open item ID */
  defaultOpenId?: string;
  /** Controlled open item IDs */
  openIds?: string[];
  /** Open state change handler */
  onOpenChange?: (openIds: string[]) => void;
  /** Additional className */
  className?: string;
  /** Item additional className */
  itemClassName?: string;
  /** Animation duration */
  animationDuration?: number;
  /** Custom easing function */
  easing?: [number, number, number, number];
  /** Whether to enable smooth animations */
  smoothAnimation?: boolean;
  /** Whether to persist content in DOM */
  persistContent?: boolean;
  /** Accordion variant */
  variant?: 'default' | 'boxed' | 'minimal' | 'card';
  /** Whether to show dividers between items */
  showDividers?: boolean;
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Whether to use CSS transitions instead of framer-motion */
  preferCSS?: boolean;
  /** Custom icon component */
  iconComponent?: React.ComponentType<{ isOpen: boolean; disabled?: boolean }>;
  /** Loading state */
  loading?: boolean;
  /** Loading skeleton */
  loadingSkeleton?: React.ReactNode;
}

const variantClasses = {
  default: 'border border-white/10 rounded-xl overflow-hidden',
  boxed: 'bg-white/5 rounded-xl overflow-hidden',
  minimal: '',
  card: 'bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-sm'
};

/** 
 * Task 23: Optimized Accordion Component
 * Performance improvements:
 * 1. Better state management with controlled/uncontrolled support
 * 2. Optimized animations with proper cleanup
 * 3. Content persistence options to reduce mounting/unmounting
 * 4. Keyboard navigation support
 * 5. CSS-based animations option for better performance
 * 6. Loading state management
 * 7. Better accessibility support
 * 8. Memory efficient implementation
 */
export const OptimizedAccordion = React.memo(
  React.forwardRef<HTMLDivElement, OptimizedAccordionProps>(
    ({
      items,
      single = false,
      defaultOpenId,
      openIds: controlledOpenIds,
      onOpenChange,
      className = '',
      itemClassName = '',
      animationDuration = 0.3,
      easing = [0.34, 1.56, 0.64, 1],
      smoothAnimation = true,
      persistContent = false,
      variant = 'default',
      showDividers = true,
      keyboardNavigation = true,
      preferCSS = false,
      iconComponent: IconComponent,
      loading = false,
      loadingSkeleton
    }, ref) => {
      const reducedMotion = useReducedMotion();
      const isMounted = React.useRef(true);
      
      // State management
      const [uncontrolledOpenIds, setUncontrolledOpenIds] = React.useState<Set<string>>(() => {
        const initial = new Set<string>();
        if (defaultOpenId) {
          initial.add(defaultOpenId);
        } else {
          items.filter(item => item.defaultOpen).forEach(item => initial.add(item.id));
        }
        return initial;
      });
      
      const openIdsSet = React.useMemo(() => 
        controlledOpenIds ? new Set(controlledOpenIds) : uncontrolledOpenIds,
        [controlledOpenIds, uncontrolledOpenIds]
      );
      
      const setOpenIds = onOpenChange 
        ? (newSet: Set<string>) => onOpenChange(Array.from(newSet) as string[])
        : (newSet: Set<string>) => setUncontrolledOpenIds(newSet);

      // Toggle item handler
      const toggleItem = React.useCallback((id: string, disabled: boolean = false) => {
        if (loading || disabled) return;
        
        const updateSet = (prevSet: Set<string>) => {
          const newSet = new Set(prevSet);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            if (single) newSet.clear();
            newSet.add(id);
          }
          return newSet;
        };
        
        if (onOpenChange) {
          setUncontrolledOpenIds(prevSet => {
            const newSet = updateSet(prevSet);
            onOpenChange(Array.from(newSet) as string[]);
            return newSet;
          });
        } else {
          setUncontrolledOpenIds(prevSet => updateSet(prevSet));
        }
      }, [loading, single, onOpenChange]);

      // Keyboard navigation
      const handleKeyDown = React.useCallback((e: React.KeyboardEvent, id: string, disabled: boolean = false) => {
        if (!keyboardNavigation || disabled) return;
        
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            toggleItem(id);
            break;
          case 'ArrowUp':
            e.preventDefault();
            // Focus previous item
            const currentIndex = items.findIndex(item => item.id === id);
            if (currentIndex > 0) {
              const prevItem = items[currentIndex - 1];
              const prevButton = document.getElementById(`accordion-${prevItem.id}-trigger`);
              prevButton?.focus();
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            // Focus next item
            const nextIndex = items.findIndex(item => item.id === id);
            if (nextIndex < items.length - 1) {
              const nextItem = items[nextIndex + 1];
              const nextButton = document.getElementById(`accordion-${nextItem.id}-trigger`);
              nextButton?.focus();
            }
            break;
        }
      }, [items, keyboardNavigation, toggleItem]);

      // Get CSS classes
      const containerClass = React.useMemo(() => 
        cn(
          variantClasses[variant],
          className
        ),
        [variant, className]
      );

      const itemClass = React.useMemo(() => 
        cn(
          'transition-colors duration-200',
          variant === 'minimal' ? '' : 'border-b border-white/10 last:border-b-0',
          itemClassName
        ),
        [variant, itemClassName]
      );

      const triggerClass = React.useMemo(() => 
        cn(
          'w-full flex items-center justify-between gap-3 py-4 text-left transition-colors min-h-[48px] games-focus-ring rounded-lg',
          'text-white/90 hover:text-white hover:bg-white/5',
          variant === 'minimal' ? 'px-0' : 'px-4'
        ),
        [variant]
      );

      // Default icon component
      const DefaultIcon = React.useMemo(() => 
        IconComponent || (({ isOpen, disabled }: { isOpen: boolean; disabled?: boolean }) => (
          <span 
            className={cn(
              'shrink-0 transition-transform duration-200 flex items-center justify-center',
              isOpen ? 'rotate-180' : '',
              disabled ? 'opacity-50' : ''
            )} 
            aria-hidden
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        )),
        [IconComponent]
      );

      // Content renderer with persistence option
      const renderContent = React.useCallback((item: OptimizedAccordionItem) => {
        const isOpen = openIdsSet.has(item.id);
        const contentId = `accordion-${item.id}-panel`;
        const triggerId = `accordion-${item.id}-trigger`;
        
        if (loading) {
          return (
            <div 
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              className={cn(
                'overflow-hidden',
                variant === 'minimal' ? 'py-2' : 'pb-4'
              )}
            >
              {loadingSkeleton || (
                <div className="animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-full mb-2" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              )}
            </div>
          );
        }

        if (persistContent) {
          return (
            <div 
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              className={cn(
                'overflow-hidden transition-all duration-300',
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
                variant === 'minimal' ? 'py-2' : 'pb-4'
              )}
              style={{
                transitionProperty: 'max-height, opacity',
                transitionDuration: `${reducedMotion ? 0 : animationDuration}s`,
                transitionTimingFunction: `cubic-bezier(${easing.join(',')})`
              }}
            >
              <div className={cn(
                'text-white/70 text-sm',
                variant === 'minimal' ? '' : 'px-4'
              )}>
                {item.content}
              </div>
            </div>
          );
        }

        return (
          <LazyMotion features={domAnimation}>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={contentId}
                  role="region"
                  layout
                  aria-labelledby={triggerId}
                  initial={smoothAnimation && !reducedMotion ? { height: 0, opacity: 0 } : undefined}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={smoothAnimation && !reducedMotion ? { height: 0, opacity: 0 } : undefined}
                  transition={{
                    duration: reducedMotion ? 0 : animationDuration,
                    ease: easing
                  }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    'text-white/70 text-sm',
                    variant === 'minimal' ? 'py-2' : 'pb-4',
                    variant === 'minimal' ? '' : 'px-4'
                  )}>
                    {item.content}
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        );
      }, [openIdsSet, loading, loadingSkeleton, persistContent, variant, reducedMotion, animationDuration, easing, smoothAnimation]);

      // Cleanup on unmount
      React.useEffect(() => {
        return () => {
          isMounted.current = false;
        };
      }, []);

      // Early return if loading
      if (loading) {
        return (
          <div ref={ref} className={containerClass}>
            {items.map((item, index) => (
              <div key={item.id} className={itemClass}>
                <button
                  type="button"
                  id={`accordion-${item.id}-trigger`}
                  aria-expanded="false"
                  aria-controls={`accordion-${item.id}-panel`}
                  disabled
                  className={triggerClass}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span className="font-medium truncate">{item.title}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500/20 text-primary-300 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <DefaultIcon isOpen={false} disabled />
                </button>
                {renderContent(item)}
              </div>
            ))}
          </div>
        );
      }

      // CSS animation approach
      if (preferCSS || reducedMotion) {
        return (
          <div ref={ref} className={containerClass}>
            {items.map((item, index) => {
              const isOpen = openIdsSet.has(item.id);
              const triggerId = `accordion-${item.id}-trigger`;
              const contentId = `accordion-${item.id}-panel`;
              
              return (
                <div 
                  key={item.id} 
                  className={itemClass}
                  data-accordion-item={item.id}
                >
                  <button
                    type="button"
                    id={triggerId}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleItem(item.id, item.disabled)}
                    onKeyDown={(e) => handleKeyDown(e, item.id, item.disabled)}
                    disabled={item.disabled}
                    className={cn(
                      triggerClass,
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    )}
                    tabIndex={item.disabled ? -1 : 0}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                      <span className="font-medium truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500/20 text-primary-300 rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <DefaultIcon isOpen={isOpen} disabled={item.disabled} />
                  </button>
                  {renderContent(item)}
                </div>
              );
            })}
          </div>
        );
      }

      // Framer Motion approach
      return (
        <LazyMotion features={domAnimation}>
          <div ref={ref as any} className={containerClass}>
            {items.map((item, index) => {
              const isOpen = openIdsSet.has(item.id);
              const triggerId = `accordion-${item.id}-trigger`;
              const contentId = `accordion-${item.id}-panel`;
              
              return (
                <div 
                  key={item.id} 
                  className={itemClass}
                  data-accordion-item={item.id}
                >
                  <button
                    type="button"
                    id={triggerId}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleItem(item.id, item.disabled)}
                    onKeyDown={(e) => handleKeyDown(e, item.id, item.disabled)}
                    disabled={item.disabled}
                    className={cn(
                      triggerClass,
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    )}
                    tabIndex={item.disabled ? -1 : 0}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                      <span className="font-medium truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500/20 text-primary-300 rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <DefaultIcon isOpen={isOpen} disabled={item.disabled} />
                  </button>
                  {renderContent(item)}
                </div>
              );
            })}
          </div>
        </LazyMotion>
      );
    }
  )
);

OptimizedAccordion.displayName = 'OptimizedAccordion';

// Predefined variants
export const AccordionVariants = {
  Default: (props: Partial<OptimizedAccordionProps> & { items: OptimizedAccordionItem[] }) => (
    <OptimizedAccordion variant="default" {...props} />
  ),
  
  Boxed: (props: Partial<OptimizedAccordionProps> & { items: OptimizedAccordionItem[] }) => (
    <OptimizedAccordion variant="boxed" {...props} />
  ),
  
  Minimal: (props: Partial<OptimizedAccordionProps> & { items: OptimizedAccordionItem[] }) => (
    <OptimizedAccordion variant="minimal" {...props} />
  ),
  
  Card: (props: Partial<OptimizedAccordionProps> & { items: OptimizedAccordionItem[] }) => (
    <OptimizedAccordion variant="card" {...props} />
  )
};

export default OptimizedAccordion;