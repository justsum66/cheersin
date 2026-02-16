'use client'

import React, { CSSProperties } from 'react'
import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

import { GameCard } from './GameCard'
import { GUEST_TRIAL_GAME_IDS } from '@/config/games.config'

interface VirtualizedGameGridProps {
  games: any[] // Using any for simplicity, but in practice you'd use the GameOption type
  favoriteIds: string[]
  ratings: Record<string, number>
  weeklyFreeGameIds: string[]
  handleSelect: (id: string) => void
  handleToggleFavorite: (id: string) => void
  handleRate: (id: string, stars: number) => void
  setRulesModal: (modal: { name: string; rules: string } | null) => void
  deferredQuery: string
  columnCount: number
  height: number
  width: number
  itemHeight: number
}

// Calculate rows needed for the grid
const calculateRows = (games: any[], columnCount: number) => {
  return Math.ceil(games.length / columnCount)
}

// Get games for a specific row
const getGamesForRow = (games: any[], rowIndex: number, columnCount: number) => {
  const startIndex = rowIndex * columnCount
  const endIndex = Math.min(startIndex + columnCount, games.length)
  return games.slice(startIndex, endIndex)
}

// Memoized row component to prevent unnecessary re-renders
const MemoizedRow = memo(({ 
  rowIndex, 
  games, 
  favoriteIds, 
  ratings, 
  weeklyFreeGameIds, 
  handleSelect, 
  handleToggleFavorite, 
  handleRate, 
  setRulesModal, 
  deferredQuery,
  columnCount,
  itemHeight,
  style
}: {
  rowIndex: number,
  games: any[],
  favoriteIds: string[],
  ratings: Record<string, number>,
  weeklyFreeGameIds: string[],
  handleSelect: (id: string) => void,
  handleToggleFavorite: (id: string) => void,
  handleRate: (id: string, stars: number) => void,
  setRulesModal: (modal: { name: string; rules: string } | null) => void,
  deferredQuery: string,
  columnCount: number,
  itemHeight: number,
  style?: React.CSSProperties
}) => {
  const rowGames = getGamesForRow(games, rowIndex, columnCount)
  const reducedMotion = useReducedMotion()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 card-grid-gap" style={{ ...style, height: itemHeight }}>
      {rowGames.map((game, colIndex) => {
        const gameIndex = rowIndex * columnCount + colIndex
        
        return (
          <m.div
            key={`${game.id}-${gameIndex}`}
            style={{ height: '100%' }}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <GameCard
              game={{
                ...game,
                isFavorite: favoriteIds.includes(game.id),
                onToggleFavorite: handleToggleFavorite,
                rating: ratings[game.id],
                onRate: handleRate,
                isGuestTrial: GUEST_TRIAL_GAME_IDS.includes(game.id),
                twoPlayerFriendly: game.twoPlayerFriendly,
                onShowRules: (g) => setRulesModal({ name: g.name, rules: g.rulesSummary ?? 'Rules not available' }),
                isPremium: game.isPremium ?? false,
                isWeeklyFree: weeklyFreeGameIds.includes(game.id),
                hasAdultContent: game.category === 'adult' || game.modes?.some((m: any) => m.id.includes('spicy') || m.id === 'adult'),
                searchQuery: deferredQuery,
              }}
              index={gameIndex}
              onSelect={handleSelect}
              onKeyDown={() => {}} // Disable keyboard navigation in virtualized list for now
              buttonRef={() => {}} // Skip ref assignment for performance
              displayLabel={undefined}
            />
          </m.div>
        )
      })}
      {/* Fill remaining slots in the row if needed */}
      {rowGames.length < columnCount && Array.from({ length: columnCount - rowGames.length }).map((_, i) => (
        <div key={`empty-${rowIndex}-${i}`} className="invisible" style={{ visibility: 'hidden' }} />
      ))}
    </div>
  )
})

MemoizedRow.displayName = 'MemoizedRow'

// Simple virtualization implementation using CSS transforms and intersection observers
export const VirtualizedGameGrid = ({
  games,
  favoriteIds,
  ratings,
  weeklyFreeGameIds,
  handleSelect,
  handleToggleFavorite,
  handleRate,
  setRulesModal,
  deferredQuery,
  columnCount,
  height,
  width,
  itemHeight
}: VirtualizedGameGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  
  const rowCount = useMemo(() => calculateRows(games, columnCount), [games, columnCount]);
  
  // Calculate visible rows based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - 2); // Buffer of 2 rows
      const visibleRows = Math.ceil(containerHeight / itemHeight) + 4; // Buffer of 4 rows
      const endRow = Math.min(rowCount, startRow + visibleRows);
      
      setVisibleRange({ start: startRow, end: endRow });
    };
    
    // Initial calculation
    updateVisibleRange();
    
    // Add scroll event listener
    container.addEventListener('scroll', updateVisibleRange);
    
    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
    };
  }, [rowCount, itemHeight]);
  
  // Calculate total height for the scrollable area
  const totalHeight = rowCount * itemHeight;
  
  // Get rows to render based on visible range
  return (
    <div 
      ref={containerRef}
      style={{ height, width, overflowY: 'auto', position: 'relative' }}
      className="virtualized-container"
    >
      {/* Spacer div to maintain scroll height */}
      <div style={{ height: totalHeight }}>
        {/* Render visible rows */}
        {Array.from({ length: visibleRange.end - visibleRange.start }).map((_, index) => {
          const rowIndex = visibleRange.start + index;
          return (
            <MemoizedRow
              key={`row-${rowIndex}`}
              rowIndex={rowIndex}
              games={games}
              favoriteIds={favoriteIds}
              ratings={ratings}
              weeklyFreeGameIds={weeklyFreeGameIds}
              handleSelect={handleSelect}
              handleToggleFavorite={handleToggleFavorite}
              handleRate={handleRate}
              setRulesModal={setRulesModal}
              deferredQuery={deferredQuery}
              columnCount={columnCount}
              itemHeight={itemHeight}
              style={{ position: 'absolute', top: rowIndex * itemHeight, width: '100%' }}
            />
          );
        })}
      </div>
    </div>
  );
};