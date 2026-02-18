'use client';

import * as React from 'react';
import { m, AnimatePresence, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OptimizedTabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface OptimizedTabsProps {
  /** Tab items */
  tabs: OptimizedTabItem[];
  /** Default active tab ID */
  defaultTab?: string;
  /** Active tab ID (controlled) */
  activeTab?: string;
  /** Tab change handler */
  onChange?: (id: string) => void;
  /** Additional className */
  className?: string;
  /** Tab list additional className */
  tabListClassName?: string;
  /** Tab content additional className */
  contentClassName?: string;
  /** Tab variant */
  variant?: 'default' | 'boxed' | 'underlined' | 'pills';
  /** Tab size */
  size?: 'sm' | 'md' | 'lg';
  /** Animation duration */
  animationDuration?: number;
  /** Whether to enable smooth content transition */
  smoothTransition?: boolean;
  /** Whether to persist tab content in DOM */
  persistContent?: boolean;
  /** Custom easing function */
  easing?: [number, number, number, number];
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Whether to use CSS transitions instead of framer-motion */
  preferCSS?: boolean;
  /** Custom active tab indicator */
  activeIndicator?: React.ReactNode;
  /** Whether to show loading state */
  loading?: boolean;
  /** Loading skeleton for content */
  loadingSkeleton?: React.ReactNode;
}

const variantClasses = {
  default: 'flex gap-1',
  boxed: 'flex gap-1 p-1 bg-white/5 rounded-xl',
  underlined: 'flex gap-4 border-b border-white/10',
  pills: 'flex flex-wrap gap-2'
};

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

const tabSizeClasses = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-6 py-3'
};

/** 
 * Task 22: Optimized Tabs Component
 * Performance improvements:
 * 1. Better state management with controlled/uncontrolled support
 * 2. Optimized re-renders with proper memoization
 * 3. Content persistence options to reduce mounting/unmounting
 * 4. Keyboard navigation support
 * 5. CSS-based animations option for better performance
 * 6. Loading state management
 * 7. Better accessibility support
 * 8. Memory efficient implementation
 */
export const OptimizedTabs = React.memo(
  React.forwardRef<HTMLDivElement, OptimizedTabsProps>(
    ({
      tabs,
      defaultTab,
      activeTab: controlledActiveTab,
      onChange,
      className = '',
      tabListClassName = '',
      contentClassName = '',
      variant = 'default',
      size = 'md',
      animationDuration = 0.3,
      smoothTransition = true,
      persistContent = false,
      easing = [0.34, 1.56, 0.64, 1],
      keyboardNavigation = true,
      preferCSS = false,
      activeIndicator,
      loading = false,
      loadingSkeleton
    }, ref) => {
      const reducedMotion = useReducedMotion();
      const isMounted = React.useRef(true);
      const tabListRef = React.useRef<HTMLDivElement>(null);
      
      // State management
      const [uncontrolledActiveTab, setUncontrolledActiveTab] = React.useState(
        defaultTab ?? tabs[0]?.id ?? ''
      );
      
      const activeTabId = controlledActiveTab ?? uncontrolledActiveTab;
      const setActiveTab = onChange ?? setUncontrolledActiveTab;

      // Get active tab index and content
      const activeIndex = React.useMemo(() => 
        tabs.findIndex(tab => tab.id === activeTabId), 
        [tabs, activeTabId]
      );
      
      const activeTab = React.useMemo(() => 
        tabs.find(tab => tab.id === activeTabId), 
        [tabs, activeTabId]
      );

      // Keyboard navigation
      const handleKeyDown = React.useCallback((e: React.KeyboardEvent, index: number) => {
        if (!keyboardNavigation) return;
        
        const enabledTabs = tabs.filter(tab => !tab.disabled);
        const currentIndex = enabledTabs.findIndex(tab => tab.id === tabs[index].id);
        
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
              const prevTab = enabledTabs[currentIndex - 1];
              setActiveTab(prevTab.id);
            }
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < enabledTabs.length - 1) {
              const nextTab = enabledTabs[currentIndex + 1];
              setActiveTab(nextTab.id);
            }
            break;
          case 'Home':
            e.preventDefault();
            if (enabledTabs.length > 0) {
              setActiveTab(enabledTabs[0].id);
            }
            break;
          case 'End':
            e.preventDefault();
            if (enabledTabs.length > 0) {
              setActiveTab(enabledTabs[enabledTabs.length - 1].id);
            }
            break;
        }
      }, [tabs, keyboardNavigation, setActiveTab]);

      // Tab selection handler
      const handleSelect = React.useCallback((id: string) => {
        if (loading) return;
        const tab = tabs.find(t => t.id === id);
        if (tab?.disabled) return;
        
        setActiveTab(id);
      }, [tabs, loading, setActiveTab]);

      // Get CSS classes
      const containerClass = React.useMemo(() => 
        cn('w-full', className),
        [className]
      );

      const tabListClass = React.useMemo(() => 
        cn(
          variantClasses[variant],
          sizeClasses[size],
          tabListClassName
        ),
        [variant, size, tabListClassName]
      );

      const tabButtonClass = React.useMemo(() => 
        cn(
          'relative font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 rounded-lg flex items-center gap-2',
          tabSizeClasses[size],
          variant === 'boxed' ? 'z-10' : ''
        ),
        [variant, size]
      );

      // Tab content renderer
      const renderTabContent = () => {
        if (loading) {
          return (
            <div className={cn('pt-4', contentClassName)}>
              {loadingSkeleton || (
                <div className="animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              )}
            </div>
          );
        }

        if (persistContent) {
          return (
            <div className={cn('pt-4', contentClassName)}>
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  role="tabpanel"
                  id={`panel-${tab.id}`}
                  aria-labelledby={`tab-${tab.id}`}
                  className={tab.id === activeTabId ? 'block' : 'hidden'}
                >
                  {tab.content}
                </div>
              ))}
            </div>
          );
        }

        return (
          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait">
              <m.div
                key={activeTabId}
                role="tabpanel"
                id={`panel-${activeTabId}`}
                aria-labelledby={`tab-${activeTabId}`}
                className={cn('pt-4', contentClassName)}
                initial={smoothTransition && !reducedMotion ? { opacity: 0, y: 10 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                exit={smoothTransition && !reducedMotion ? { opacity: 0, y: -10 } : undefined}
                transition={{
                  duration: reducedMotion ? 0 : animationDuration,
                  ease: easing
                }}
              >
                {activeTab?.content}
              </m.div>
            </AnimatePresence>
          </LazyMotion>
        );
      };

      // Cleanup on unmount
      React.useEffect(() => {
        return () => {
          isMounted.current = false;
        };
      }, []);

      // Early return if no tabs
      if (tabs.length === 0) return null;

      // CSS animation approach
      if (preferCSS || reducedMotion) {
        return (
          <div ref={ref} className={containerClass}>
            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Tabs"
              className={tabListClass}
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTabId === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  disabled={tab.disabled || loading}
                  onClick={() => handleSelect(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    tabButtonClass,
                    tab.disabled ? 'opacity-50 cursor-not-allowed' : '',
                    activeTabId === tab.id 
                      ? (variant === 'boxed' 
                          ? 'text-white bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm' 
                          : 'text-white')
                      : (variant === 'boxed'
                          ? 'text-white/60 hover:text-white hover:bg-white/5'
                          : 'text-white/60 hover:text-white/90')
                  )}
                  tabIndex={tab.disabled ? -1 : 0}
                >
                  {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500/20 text-primary-300 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  {activeTabId === tab.id && variant === 'underlined' && (
                    <span 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400 rounded-full"
                      style={{ 
                        transition: reducedMotion ? 'none' : `all ${animationDuration}s cubic-bezier(${easing.join(',')})` 
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            {renderTabContent()}
          </div>
        );
      }

      // Framer Motion approach
      return (
        <LazyMotion features={domAnimation}>
          <div ref={ref as any} className={containerClass}>
            <div
              ref={tabListRef as any}
              role="tablist"
              aria-label="Tabs"
              className={tabListClass}
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTabId === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  disabled={tab.disabled || loading}
                  onClick={() => handleSelect(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    tabButtonClass,
                    tab.disabled ? 'opacity-50 cursor-not-allowed' : '',
                    activeTabId === tab.id 
                      ? (variant === 'boxed' 
                          ? 'text-white bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm' 
                          : 'text-white')
                      : (variant === 'boxed'
                          ? 'text-white/60 hover:text-white hover:bg-white/5'
                          : 'text-white/60 hover:text-white/90')
                  )}
                  tabIndex={tab.disabled ? -1 : 0}
                >
                  {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500/20 text-primary-300 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  
                  {activeTabId === tab.id && (
                    <m.span
                      layoutId="active-tab-indicator"
                      className={cn(
                        'absolute -z-10 backdrop-blur-sm',
                        variant === 'boxed' 
                          ? 'inset-0 bg-white/10 rounded-lg border border-white/10 shadow-sm'
                          : variant === 'underlined'
                            ? 'bottom-0 left-0 right-0 h-0.5 bg-primary-400 rounded-full'
                            : 'inset-0 bg-white/10 rounded-lg'
                      )}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        duration: animationDuration
                      }}
                    >
                      {activeIndicator}
                    </m.span>
                  )}
                </button>
              ))}
            </div>
            
            {renderTabContent()}
          </div>
        </LazyMotion>
      );
    }
  )
);

OptimizedTabs.displayName = 'OptimizedTabs';

// Predefined variants
export const TabsVariants = {
  Default: (props: Partial<OptimizedTabsProps> & { tabs: OptimizedTabItem[] }) => (
    <OptimizedTabs variant="default" {...props} />
  ),
  
  Boxed: (props: Partial<OptimizedTabsProps> & { tabs: OptimizedTabItem[] }) => (
    <OptimizedTabs variant="boxed" {...props} />
  ),
  
  Underlined: (props: Partial<OptimizedTabsProps> & { tabs: OptimizedTabItem[] }) => (
    <OptimizedTabs variant="underlined" {...props} />
  ),
  
  Pills: (props: Partial<OptimizedTabsProps> & { tabs: OptimizedTabItem[] }) => (
    <OptimizedTabs variant="pills" {...props} />
  )
};

export default OptimizedTabs;