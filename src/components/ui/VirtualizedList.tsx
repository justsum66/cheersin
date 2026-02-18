'use client'

import React, { CSSProperties, memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { m } from 'framer-motion';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  keyExtractor: (item: T, index: number) => string | number;
}

// Memoized item component to prevent unnecessary re-renders
const MemoizedListItem = memo(({ 
  item, 
  index, 
  renderItem,
  itemHeight,
  style
}: {
  item: any;
  index: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight: number;
  style?: React.CSSProperties;
}) => {
  return (
    <div style={{ ...style, height: itemHeight }}>
      {renderItem(item, index)}
    </div>
  );
});

MemoizedListItem.displayName = 'MemoizedListItem';

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  keyExtractor
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  // Calculate visible items based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const visibleItems = Math.ceil(containerHeight / itemHeight) + (overscan * 2);
      const endIndex = Math.min(items.length, startIndex + visibleItems);

      setVisibleRange({ start: startIndex, end: endIndex });
    };

    // Initial calculation
    updateVisibleRange();

    // Add scroll event listener
    container.addEventListener('scroll', updateVisibleRange);

    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
    };
  }, [items.length, itemHeight, overscan]);

  // Calculate total height for the scrollable area
  const totalHeight = items.length * itemHeight;

  // Get items to render based on visible range
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      if (i >= 0 && i < items.length) {
        result.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute' as const,
            top: i * itemHeight,
            width: '100%',
          },
          key: keyExtractor(items[i], i)
        });
      }
    }
    return result;
  }, [items, visibleRange, itemHeight, keyExtractor]);

  return (
    <div 
      ref={containerRef}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative', width: '100%' }}
      className="virtualized-list-container"
    >
      {/* Spacer div to maintain scroll height */}
      <div style={{ height: totalHeight }}>
        {/* Render visible items */}
        {visibleItems.map(({ item, index, style, key }) => (
          <MemoizedListItem
            key={key}
            item={item}
            index={index}
            renderItem={renderItem}
            itemHeight={itemHeight}
            style={style}
          />
        ))}
      </div>
    </div>
  );
}

export default VirtualizedList;