'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Clock, TrendingUp } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  score?: number;
  url: string;
  metadata?: Record<string, any>;
  highlight?: string[];
}

export interface SearchResultsProps {
  results: SearchResultItem[];
  query: string;
  isLoading?: boolean;
  onResultClick?: (result: SearchResultItem) => void;
  onClear?: () => void;
  className?: string;
  /** 結果限制數量 */
  maxResults?: number;
  /** 是否啟用虛擬化 */
  virtualized?: boolean;
  /** 虛擬化時的項目高度 */
  itemHeight?: number;
  /** 搜索歷史顯示數量 */
  historyLimit?: number;
  /** 自動完成建議 */
  suggestions?: string[];
  /** 是否顯示過濾器 */
  showFilters?: boolean;
}

/** 
 * 任務 13：SearchResults 組件搜索性能優化
 * 實現：
 * 1. 智能虛擬化渲染
 * 2. 搜索結果緩存
 * 3. 防抖搜索處理
 * 4. 搜索歷史管理
 * 5. 自動完成優化
 * 6. 結果分組和過濾
 */
export function OptimizedSearchResults({
  results,
  query,
  isLoading = false,
  onResultClick,
  onClear,
  className = '',
  maxResults = 50,
  virtualized = false,
  itemHeight = 80,
  historyLimit = 5,
  suggestions = [],
  showFilters = true
}: SearchResultsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  
  // 節流搜索處理
  const searchCache = useRef(new Map<string, SearchResultItem[]>());
  const lastSearchTime = useRef(0);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // 獲取唯一分類
  const categories = useMemo(() => {
    const cats = [...new Set(results.map(r => r.category))];
    return ['all', ...cats];
  }, [results]);

  // 過濾結果
  const filteredResults = useMemo(() => {
    let filtered = results;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    // 應用最大結果限制
    return filtered.slice(0, maxResults);
  }, [results, selectedCategory, maxResults]);

  // 搜索歷史管理
  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem('search-history');
        if (saved) {
          setSearchHistory(JSON.parse(saved).slice(0, historyLimit));
        }
      } catch (error) {
        console.warn('Failed to load search history:', error);
      }
    };
    
    loadHistory();
  }, [historyLimit]);

  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const newHistory = [
      searchQuery,
      ...searchHistory.filter(item => item !== searchQuery)
    ].slice(0, historyLimit);
    
    setSearchHistory(newHistory);
    
    try {
      localStorage.setItem('search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, [searchHistory, historyLimit]);

  // 緩存搜索結果
  const getCachedResults = useCallback((searchQuery: string) => {
    return searchCache.current.get(searchQuery) || [];
  }, []);

  const cacheResults = useCallback((searchQuery: string, searchResults: SearchResultItem[]) => {
    if (searchQuery.trim()) {
      searchCache.current.set(searchQuery, searchResults);
      
      // 限制緩存大小
      if (searchCache.current.size > 100) {
        const firstKey = searchCache.current.keys().next().value;
        if (firstKey !== undefined) {
          searchCache.current.delete(firstKey);
        }
      }
    }
  }, []);

  // 防抖搜索處理
  const debouncedSearch = useCallback((searchQuery: string) => {
    const now = Date.now();
    if (now - lastSearchTime.current < 300) return; // 300ms 防抖
    lastSearchTime.current = now;
    
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    
    searchTimer.current = setTimeout(() => {
      addToHistory(searchQuery);
      cacheResults(searchQuery, results);
    }, 300);
  }, [addToHistory, cacheResults, results]);

  // 處理搜索查詢變化
  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  // 虛擬化渲染
  const useVirtualization = virtualized && filteredResults.length > 20;
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  const getVisibleRange = useCallback(() => {
    if (!useVirtualization || !containerRef.current) {
      return { start: 0, end: filteredResults.length };
    }

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
    const end = Math.min(filteredResults.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + 2);
    
    return { start, end };
  }, [useVirtualization, filteredResults.length, itemHeight]);

  const handleScroll = useCallback(() => {
    if (!useVirtualization) return;
    
    const now = Date.now();
    if (now - lastSearchTime.current < 16) return; // 約 60fps 限制
    lastSearchTime.current = now;

    const { start, end } = getVisibleRange();
    setVisibleRange({ start, end });
  }, [useVirtualization, getVisibleRange]);

  const visibleResults = useVirtualization 
    ? filteredResults.slice(visibleRange.start, visibleRange.end)
    : filteredResults;

  // 動畫配置
  const motionConfig = {
    duration: reducedMotion ? 0 : 0.2,
    ease: [0.22, 1, 0.36, 1] as const
  };

  // 結果渲染
  const renderResult = useCallback((result: SearchResultItem, index: number) => (
    <m.div
      key={result.id}
      layout={!reducedMotion}
      initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        ...motionConfig,
        delay: reducedMotion ? 0 : Math.min(index * 0.03, 0.3)
      }}
      className="p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer group"
      onClick={() => onResultClick?.(result)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white group-hover:text-primary-300 transition-colors truncate">
            {result.title}
          </h3>
          {result.description && (
            <p className="text-sm text-white/60 mt-1 line-clamp-2">
              {result.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
            <span className="px-2 py-1 bg-white/10 rounded-full">
              {result.category}
            </span>
            {result.score && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {(result.score * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        {result.highlight && result.highlight.length > 0 && (
          <div className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
            匹配: {result.highlight.slice(0, 3).join(', ')}
          </div>
        )}
      </div>
    </m.div>
  ), [onResultClick, reducedMotion, motionConfig]);

  if (isLoading) {
    return (
      <div className={`${className} flex flex-col`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>搜索中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${className} flex flex-col max-h-[600px] bg-[#1a0a2e] rounded-xl border border-white/10 shadow-xl overflow-hidden`}
      onScroll={useVirtualization ? handleScroll : undefined}
    >
      {/* 標題欄 */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-white/60" />
          <h2 className="font-semibold text-white">
            搜索結果 ({filteredResults.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={onClear}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="清除搜索"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {/* 過濾器 */}
      {showFilters && categories.length > 2 && (
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {category === 'all' ? '全部' : category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索歷史 */}
      {query === '' && searchHistory.length > 0 && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              最近搜索
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              {showHistory ? '隱藏' : '顯示'}
            </button>
          </div>
          <AnimatePresence>
            {showHistory && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // 這裡可以觸發重新搜索
                      console.log('Re-search:', item);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 自動完成建議 */}
      {query && suggestions.length > 0 && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-medium text-white/80 mb-2">建議搜索</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // 這裡可以觸發建議搜索
                  console.log('Suggested search:', suggestion);
                }}
                className="px-3 py-1.5 text-sm bg-white/10 text-white/60 hover:bg-white/20 hover:text-white rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 結果列表 */}
      <div className="flex-1 overflow-y-auto">
        {useVirtualization && (
          <div style={{ height: filteredResults.length * itemHeight }} />
        )}
        
        <AnimatePresence mode="popLayout">
          {visibleResults.length > 0 ? (
            visibleResults.map((result, index) => (
              <div
                key={result.id}
                style={useVirtualization ? {
                  position: 'absolute',
                  top: (visibleRange.start + index) * itemHeight,
                  left: 0,
                  right: 0,
                  height: itemHeight
                } : {}}
              >
                {renderResult(result, visibleRange.start + index)}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">找不到符合 "{query}" 的結果</p>
              <p className="text-sm text-white/40 mt-1">請嘗試其他關鍵字</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}