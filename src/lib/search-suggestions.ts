/**
 * P3-07：搜尋建議與自動完成系統
 * 提供智慧搜尋建議、熱門搜尋詞、搜尋歷史等增強功能
 */

import { logger } from './logger'

// 搜尋建議項目
export interface SuggestionItem {
  id: string
  term: string
  category: 'history' | 'popular' | 'trending' | 'related'
  frequency?: number
  score?: number // 相關性分數
  icon?: string // 顯示圖示
  type?: 'course' | 'wine' | 'article' | 'game'
}

// 熱門搜尋詞
export interface TrendingSearch {
  term: string
  searchCount: number
  trend: 'rising' | 'stable' | 'declining'
  category: string
}

// 搜尋上下文
export interface SearchContext {
  previousQuery?: string
  currentQuery: string
  cursorPosition: number
  selectedCategory?: string
}

/**
 * 1. 搜尋建議管理器
 */

export class SearchSuggestionManager {
  private static readonly SUGGESTION_HISTORY_KEY = 'cheersin_search_suggestions'
  private static readonly TRENDING_KEY = 'cheersin_trending_searches'
  private static readonly MAX_HISTORY = 100
  private static readonly MAX_SUGGESTIONS = 10
  
  // 基礎建議詞庫
  private static readonly BASE_SUGGESTIONS: SuggestionItem[] = [
    // 課程相關
    { id: 's1', term: '葡萄酒入門', category: 'popular', type: 'course' },
    { id: 's2', term: 'WSET 認證', category: 'popular', type: 'course' },
    { id: 's3', term: '品酒技巧', category: 'popular', type: 'course' },
    { id: 's4', term: '威士忌知識', category: 'popular', type: 'course' },
    { id: 's5', term: '清酒介紹', category: 'popular', type: 'course' },
    
    // 酒類知識
    { id: 's6', term: '紅酒推薦', category: 'popular', type: 'wine' },
    { id: 's7', term: '白酒產區', category: 'popular', type: 'wine' },
    { id: 's8', term: '氣泡酒', category: 'popular', type: 'wine' },
    { id: 's9', term: '日本清酒', category: 'popular', type: 'wine' },
    { id: 's10', term: ' craft beer', category: 'popular', type: 'wine' },
    
    // 一般搜尋
    { id: 's11', term: '如何品酒', category: 'popular' },
    { id: 's12', term: '酒類搭配', category: 'popular' },
    { id: 's13', term: '酒精知識', category: 'popular' },
    { id: 's14', term: '酒杯選擇', category: 'popular' },
    { id: 's15', term: '儲存方法', category: 'popular' }
  ]
  
  // 新增搜尋記錄
  static addSearchRecord(query: string, category?: string): void {
    if (!query.trim()) return
    
    try {
      const history = this.getSearchHistory()
      const existingIndex = history.findIndex(item => item.term === query)
      
      const newRecord = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        term: query,
        category: 'history' as const,
        frequency: 1,
        timestamp: Date.now()
      }
      
      if (existingIndex >= 0) {
        // 更新現有記錄
        history[existingIndex].frequency = (history[existingIndex].frequency || 1) + 1
        history[existingIndex].timestamp = Date.now()
      } else {
        // 新增記錄
        history.unshift(newRecord)
      }
      
      // 限制歷史記錄數量
      if (history.length > this.MAX_HISTORY) {
        history.splice(this.MAX_HISTORY)
      }
      
      localStorage.setItem(this.SUGGESTION_HISTORY_KEY, JSON.stringify(history))
      
      // 更新熱門搜尋
      this.updateTrendingSearches(query)
      
    } catch (error) {
      logger.error('Failed to add search record', { error, query })
    }
  }
  
  // 取得搜尋歷史
  static getSearchHistory(): (SuggestionItem & { timestamp: number })[] {
    try {
      const raw = localStorage.getItem(this.SUGGESTION_HISTORY_KEY)
      if (!raw) return []
      return JSON.parse(raw)
    } catch (error) {
      logger.error('Failed to load search history', { error })
      return []
    }
  }
  
  // 取得熱門搜尋詞
  static getTrendingSearches(limit = 10): TrendingSearch[] {
    try {
      const raw = localStorage.getItem(this.TRENDING_KEY)
      if (!raw) return []
      
      const trending: TrendingSearch[] = JSON.parse(raw)
      return trending.slice(0, limit)
    } catch (error) {
      logger.error('Failed to load trending searches', { error })
      return []
    }
  }
  
  // 更新熱門搜尋
  private static updateTrendingSearches(query: string): void {
    try {
      const trending = this.getTrendingSearches(50)
      const existingIndex = trending.findIndex(item => item.term === query)
      
      if (existingIndex >= 0) {
        trending[existingIndex].searchCount += 1
      } else {
        trending.push({
          term: query,
          searchCount: 1,
          trend: 'rising',
          category: this.categorizeSearchTerm(query)
        })
      }
      
      // 按搜尋次數排序
      trending.sort((a, b) => b.searchCount - a.searchCount)
      
      // 保留前 50 個
      const topTrending = trending.slice(0, 50)
      
      localStorage.setItem(this.TRENDING_KEY, JSON.stringify(topTrending))
      
    } catch (error) {
      logger.error('Failed to update trending searches', { error })
    }
  }
  
  // 分類搜尋詞
  private static categorizeSearchTerm(term: string): string {
    const lowerTerm = term.toLowerCase()
    
    if (lowerTerm.includes('wine') || lowerTerm.includes('葡萄酒') || lowerTerm.includes('紅酒') || lowerTerm.includes('白酒')) {
      return 'wine'
    }
    if (lowerTerm.includes('whiskey') || lowerTerm.includes('威士忌') || lowerTerm.includes('威士忌')) {
      return 'whiskey'
    }
    if (lowerTerm.includes('sake') || lowerTerm.includes('清酒')) {
      return 'sake'
    }
    if (lowerTerm.includes('beer') || lowerTerm.includes('啤酒')) {
      return 'beer'
    }
    if (lowerTerm.includes('course') || lowerTerm.includes('課程') || lowerTerm.includes('學習')) {
      return 'course'
    }
    if (lowerTerm.includes('wset') || lowerTerm.includes('cms') || lowerTerm.includes('認證')) {
      return 'certification'
    }
    
    return 'general'
  }
  
  // 產生搜尋建議
  static generateSuggestions(context: SearchContext): SuggestionItem[] {
    const { currentQuery, selectedCategory } = context
    const suggestions: SuggestionItem[] = []
    
    if (!currentQuery.trim()) {
      // 無輸入時顯示熱門搜尋
      return this.getPopularSuggestions()
    }
    
    // 1. 歷史搜尋建議
    const historySuggestions = this.getHistorySuggestions(currentQuery)
    suggestions.push(...historySuggestions)
    
    // 2. 熱門搜尋建議
    const popularSuggestions = this.getPopularSuggestions(currentQuery)
    suggestions.push(...popularSuggestions)
    
    // 3. 相關建議
    const relatedSuggestions = this.getRelatedSuggestions(currentQuery, selectedCategory)
    suggestions.push(...relatedSuggestions)
    
    // 4. 基礎建議（如果其他建議不足）
    if (suggestions.length < 3) {
      const baseSuggestions = this.getBaseSuggestions(currentQuery)
      suggestions.push(...baseSuggestions)
    }
    
    // 去重並排序
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions)
    const rankedSuggestions = this.rankSuggestions(uniqueSuggestions, currentQuery)
    
    return rankedSuggestions.slice(0, this.MAX_SUGGESTIONS)
  }
  
  // 歷史搜尋建議
  private static getHistorySuggestions(query: string): SuggestionItem[] {
    const history = this.getSearchHistory()
    const lowerQuery = query.toLowerCase()
    
    return history
      .filter(item => 
        item.term.toLowerCase().includes(lowerQuery) && 
        item.term.toLowerCase() !== lowerQuery
      )
      .map(item => ({
        ...item,
        category: 'history' as const,
        score: this.calculateRelevanceScore(item.term, query)
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3)
  }
  
  // 熱門搜尋建議
  private static getPopularSuggestions(query?: string): SuggestionItem[] {
    const trending = this.getTrendingSearches(20)
    
    if (!query) {
      // 無查詢時返回最熱門的
      return trending.slice(0, 5).map((item, index) => ({
        id: `trend_${index}`,
        term: item.term,
        category: 'trending',
        frequency: item.searchCount,
        icon: this.getTrendIcon(item.trend)
      }))
    }
    
    const lowerQuery = query.toLowerCase()
    return trending
      .filter(item => item.term.toLowerCase().includes(lowerQuery))
      .map(item => ({
        id: `trend_${item.term}`,
        term: item.term,
        category: 'trending' as const,
        frequency: item.searchCount,
        icon: this.getTrendIcon(item.trend)
      }))
      .slice(0, 3)
  }
  
  // 相關建議
  private static getRelatedSuggestions(query: string, category?: string): SuggestionItem[] {
    const lowerQuery = query.toLowerCase()
    let candidates = [...this.BASE_SUGGESTIONS]
    
    // 如果有選擇分類，過濾相關建議
    if (category) {
      candidates = candidates.filter(item => 
        item.type === category || 
        this.getCategoryKeywords(category).some(keyword => 
          item.term.toLowerCase().includes(keyword)
        )
      )
    }
    
    return candidates
      .filter(item => 
        item.term.toLowerCase().includes(lowerQuery) &&
        item.term.toLowerCase() !== lowerQuery
      )
      .map(item => ({
        ...item,
        score: this.calculateRelevanceScore(item.term, query)
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3)
  }
  
  // 基礎建議
  private static getBaseSuggestions(query: string): SuggestionItem[] {
    const lowerQuery = query.toLowerCase()
    return this.BASE_SUGGESTIONS
      .filter(item => item.term.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
  }
  
  // 建議去重
  private static deduplicateSuggestions(suggestions: SuggestionItem[]): SuggestionItem[] {
    const seen = new Set<string>()
    return suggestions.filter(suggestion => {
      if (seen.has(suggestion.term.toLowerCase())) {
        return false
      }
      seen.add(suggestion.term.toLowerCase())
      return true
    })
  }
  
  // 建議排序
  private static rankSuggestions(suggestions: SuggestionItem[], query: string): SuggestionItem[] {
    return suggestions.map(suggestion => {
      let score = suggestion.score || 0
      
      // 根據分類調整分數
      switch (suggestion.category) {
        case 'history':
          score += 0.3
          break
        case 'trending':
          score += 0.2
          break
        case 'popular':
          score += 0.1
          break
      }
      
      // 根據頻率調整（如果有）
      if (suggestion.frequency) {
        score += Math.min(suggestion.frequency / 100, 0.2)
      }
      
      return { ...suggestion, score }
    }).sort((a, b) => (b.score || 0) - (a.score || 0))
  }
  
  // 計算相關性分數
  private static calculateRelevanceScore(term: string, query: string): number {
    const termLower = term.toLowerCase()
    const queryLower = query.toLowerCase()
    
    // 完全匹配
    if (termLower === queryLower) return 1.0
    
    // 開頭匹配
    if (termLower.startsWith(queryLower)) return 0.9
    
    // 包含匹配
    if (termLower.includes(queryLower)) return 0.7
    
    // 單詞匹配
    const queryWords = queryLower.split(/\s+/)
    const matchedWords = queryWords.filter(word => termLower.includes(word))
    return matchedWords.length / queryWords.length * 0.5
  }
  
  // 取得分類關鍵字
  private static getCategoryKeywords(category: string): string[] {
    const keywords: Record<string, string[]> = {
      'wine': ['wine', '葡萄酒', '紅酒', '白酒', '氣泡酒'],
      'whiskey': ['whiskey', '威士忌'],
      'sake': ['sake', '清酒'],
      'beer': ['beer', '啤酒'],
      'course': ['course', '課程', '學習', '教學'],
      'certification': ['wset', 'cms', '認證', '證照']
    }
    
    return keywords[category] || []
  }
  
  // 取得趨勢圖示
  private static getTrendIcon(trend: TrendingSearch['trend']): string {
    switch (trend) {
      case 'rising': return '↗️'
      case 'declining': return '↘️'
      default: return '➡️'
    }
  }
  
  // 清除搜尋歷史
  static clearSearchHistory(): void {
    try {
      localStorage.removeItem(this.SUGGESTION_HISTORY_KEY)
      localStorage.removeItem(this.TRENDING_KEY)
    } catch (error) {
      logger.error('Failed to clear search history', { error })
    }
  }
}

/**
 * 2. 搜尋上下文追蹤
 */

export class SearchContextTracker {
  private static readonly CONTEXT_KEY = 'cheersin_search_context'
  private static readonly MAX_CONTEXT_HISTORY = 5
  
  // 更新搜尋上下文
  static updateContext(context: SearchContext): void {
    try {
      const history = this.getContextHistory()
      
      // 移除相同的查詢
      const filteredHistory = history.filter(item => item.currentQuery !== context.currentQuery)
      
      // 新增到開頭
      filteredHistory.unshift({
        ...context,
        timestamp: Date.now()
      })
      
      // 限制歷史數量
      if (filteredHistory.length > this.MAX_CONTEXT_HISTORY) {
        filteredHistory.splice(this.MAX_CONTEXT_HISTORY)
      }
      
      localStorage.setItem(this.CONTEXT_KEY, JSON.stringify(filteredHistory))
      
    } catch (error) {
      logger.error('Failed to update search context', { error })
    }
  }
  
  // 取得搜尋上下文歷史
  static getContextHistory(): (SearchContext & { timestamp: number })[] {
    try {
      const raw = localStorage.getItem(this.CONTEXT_KEY)
      if (!raw) return []
      return JSON.parse(raw)
    } catch (error) {
      logger.error('Failed to load search context', { error })
      return []
    }
  }
  
  // 取得最近的搜尋上下文
  static getRecentContext(): SearchContext | null {
    const history = this.getContextHistory()
    return history[0] || null
  }
  
  // 清除上下文歷史
  static clearContextHistory(): void {
    try {
      localStorage.removeItem(this.CONTEXT_KEY)
    } catch (error) {
      logger.error('Failed to clear search context', { error })
    }
  }
}

/**
 * 3. 智慧自動完成 Hook
 */

export function useSearchAutocomplete() {
  const getSuggestions = (context: SearchContext) => {
    return SearchSuggestionManager.generateSuggestions(context)
  }
  
  const addSearchRecord = (query: string, category?: string) => {
    SearchSuggestionManager.addSearchRecord(query, category)
  }
  
  const getPopularSearches = (limit = 10) => {
    return SearchSuggestionManager.getTrendingSearches(limit)
  }
  
  const getSearchHistory = () => {
    return SearchSuggestionManager.getSearchHistory()
  }
  
  const clearHistory = () => {
    SearchSuggestionManager.clearSearchHistory()
    SearchContextTracker.clearContextHistory()
  }
  
  return {
    getSuggestions,
    addSearchRecord,
    getPopularSearches,
    getSearchHistory,
    clearHistory
  }
}