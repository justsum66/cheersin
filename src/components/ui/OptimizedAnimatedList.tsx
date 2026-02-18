'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string | number;
  containerClassName?: string;
  itemClassName?: string;
  /** 動畫持續時間 */
  animationDuration?: number;
  /** 項目之間的動畫延遲 */
  staggerDelay?: number;
  /** 最大同時渲染的項目數 */
  maxRenderItems?: number;
  /** 是否啟用虛擬化 */
  virtualized?: boolean;
  /** 虛擬化時的項目高度 */
  itemHeight?: number;
  /** 保留的額外項目數 */
  overscan?: number;
}

/** 
 * 任務 12：AnimatedList 組件性能優化
 * 實現：
 * 1. 智能虛擬化渲染
 * 2. 適當的重新渲染控制
 * 3. 優化的動畫處理
 * 4. 記憶體管理
 * 5. 降頻的動畫效果
 */
export const OptimizedAnimatedList = memo(function OptimizedAnimatedList<T>({
  items,
  renderItem,
  getKey,
  containerClassName = '',
  itemClassName = '',
  animationDuration = 0.3,
  staggerDelay = 0.05,
  maxRenderItems = 50,
  virtualized = false,
  itemHeight = 60,
  overscan = 5
}: AnimatedListProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>(items);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  
  // 針對大列表的虛擬化實現
  const useVirtualization = virtualized && items.length > maxRenderItems;
  
  // 節流滾動事件
  const lastScrollTime = useRef(0);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  // 動畫配置
  const motionConfig = {
    duration: reducedMotion ? 0 : animationDuration,
    ease: [0.22, 1, 0.36, 1] as const
  };

  // 計算可見項目範圍
  const getVisibleRange = useCallback(() => {
    if (!useVirtualization || !containerRef.current) {
      return { start: 0, end: items.length };
    }

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    
    return { start, end };
  }, [useVirtualization, items.length, itemHeight, overscan]);

  // 處理滾動事件
  const handleScroll = useCallback(() => {
    if (!useVirtualization) return;
    
    const now = Date.now();
    if (now - lastScrollTime.current < 16) return; // 約 60fps 限制
    lastScrollTime.current = now;

    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    scrollTimer.current = setTimeout(() => {
      const { start, end } = getVisibleRange();
      const visible = items.slice(start, end);
      setVisibleItems(visible);
    }, 16);
  }, [useVirtualization, items, getVisibleRange]);

  // 首次渲染可見項目
  useEffect(() => {
    if (!useVirtualization) {
      setVisibleItems(items);
      return;
    }

    const { start, end } = getVisibleRange();
    const visible = items.slice(start, end);
    setVisibleItems(visible);
  }, [items, useVirtualization, getVisibleRange]);

  // 號滾監聽
  useEffect(() => {
    if (!useVirtualization || !containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [useVirtualization, handleScroll]);

  // 小於等於限制項數，全體列表加動畫
  const enableEntryAnimations = !useVirtualization && !reducedMotion;
  
  return (
    <div
      ref={containerRef}
      className={`${containerClassName} overflow-y-auto max-w-full w-full touch-manipulation`}
      style={useVirtualization ? { height: '100%', position: 'relative' } : {}}
    >
      {useVirtualization && (
        <div 
          style={{ 
            height: items.length * itemHeight,
            position: 'relative',
            width: '100%'
          }}
        />
      )}
      
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => {
          const key = getKey(item, index);
          const actualIndex = useVirtualization 
            ? index + (getVisibleRange().start || 0)
            : index;
          
          return (
            <m.div
              key={key}
              layout={!reducedMotion}
              initial={enableEntryAnimations ? { 
                opacity: 0, 
                y: 20,
                scale: 0.95
              } : undefined}
              animate={enableEntryAnimations ? { 
                opacity: 1, 
                y: 0,
                scale: 1
              } : undefined}
              exit={enableEntryAnimations ? { 
                opacity: 0, 
                y: -20,
                scale: 0.95
              } : undefined}
              transition={{
                ...motionConfig,
                delay: enableEntryAnimations ? Math.min(actualIndex * staggerDelay, 0.5) : 0,
                scale: { type: 'spring', stiffness: 300, damping: 25 }
              }}
              className={itemClassName}
              style={useVirtualization ? {
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight
              } : {}}
            >
              {renderItem(item, actualIndex)}
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

// Memoized item component for better performance
const MemoizedItem = memo(({ 
  item, 
  index, 
  renderItem,
  className
}: {
  item: any;
  index: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={className}>
      {renderItem(item, index)}
    </div>
  );
});

MemoizedItem.displayName = 'MemoizedItem';

// Export both versions for different use cases
export { MemoizedItem };