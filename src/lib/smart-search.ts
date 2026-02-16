/**
 * P3-06：智慧全文搜尋引擎
 * 整合 Pinecone 向量搜尋與傳統關鍵字搜尋，提供語意化搜尋體驗
 */

import { getEmbedding } from './embedding'
import { queryVectors } from './pinecone'
import { logger } from './logger'

// 搜尋結果項目
export interface SearchResult {
  id: string
  title: string
  content: string
  type: 'course' | 'wine' | 'article' | 'faq' | 'game'
  score: number // 相關性分數 0-1
  metadata?: Record<string, unknown>
  excerpt: string // 內容摘要
  url?: string // 對應頁面 URL
  highlight?: string[] // 高亮關鍵字
}

// 搜尋選項
export interface SearchOptions {
  query: string
  types?: SearchResult['type'][] // 限制搜尋類型
  limit?: number // 結果數量限制
  namespace?: string // Pinecone namespace
  minScore?: number // 最小相關分數
  includeMetadata?: boolean
  highlightTerms?: boolean // 是否產生高亮
}

// 搜尋建議
export interface SearchSuggestion {
  term: string
  frequency: number
  category: 'popular' | 'recent' | 'trending'
}

// 搜尋統計
export interface SearchStats {
  totalResults: number
  searchTime: number // 毫秒
  query: string
  suggestions: SearchSuggestion[]
}

/**
 * 1. 核心搜尋引擎
 */

// 執行智慧搜尋
export async function smartSearch(options: SearchOptions): Promise<{
  results: SearchResult[];
  stats: SearchStats;
}> {
  const startTime = Date.now()
  const { query, types, limit = 10, namespace = 'knowledge', minScore = 0.7 } = options
  
  if (!query.trim()) {
    return {
      results: [],
      stats: {
        totalResults: 0,
        searchTime: 0,
        query,
        suggestions: []
      }
    }
  }
  
  try {
    // 1. 向量搜尋
    const vectorResults = await vectorSearch(query, {
      limit: limit * 2, // 多取一些結果用於排序
      namespace,
      minScore
    })
    
    // 2. 關鍵字過濾（如果指定了類型）
    let filteredResults = vectorResults
    if (types && types.length > 0) {
      filteredResults = vectorResults.filter(result => 
        types.includes(result.type)
      )
    }
    
    // 3. 混合排序（語意分數 + 關鍵字匹配度）
    const rankedResults = await rankResults(filteredResults, query)
    
    // 4. 限制結果數量
    const finalResults = rankedResults.slice(0, limit)
    
    // 5. 產生高亮（如果需要）
    if (options.highlightTerms) {
      finalResults.forEach(result => {
        result.highlight = generateHighlights(result.content, query)
      })
    }
    
    // 6. 產生搜尋建議
    const suggestions = await generateSuggestions(query)
    
    return {
      results: finalResults,
      stats: {
        totalResults: finalResults.length,
        searchTime: Date.now() - startTime,
        query,
        suggestions
      }
    }
    
  } catch (error) {
    logger.error('Smart search failed', { error, query })
    return {
      results: [],
      stats: {
        totalResults: 0,
        searchTime: Date.now() - startTime,
        query,
        suggestions: []
      }
    }
  }
}

// 向量搜尋
async function vectorSearch(
  query: string,
  options: {
    limit: number;
    namespace: string;
    minScore: number;
  }
): Promise<SearchResult[]> {
  try {
    // 取得查詢向量
    const queryVector = await getEmbedding(query)
    if (!queryVector?.length) {
      return []
    }
    
    // 執行向量搜尋
    const pineconeResults = await queryVectors(queryVector, {
      topK: options.limit,
      namespace: options.namespace,
      includeMetadata: true
    })
    
    // 轉換為統一格式
    const results: SearchResult[] = (pineconeResults.matches || [])
      .filter(match => match.score >= options.minScore)
      .map(match => {
        const metadata = match.metadata || {}
        return {
          id: match.id,
          title: (metadata.title as string) || (metadata.name as string) || '未命名',
          content: (metadata.content as string) || (metadata.text as string) || '',
          type: determineResultType(metadata),
          score: match.score,
          metadata,
          excerpt: generateExcerpt((metadata.content || metadata.text || '') as string, 150),
          url: generateResultUrl(metadata)
        }
      })
    
    return results
    
  } catch (error) {
    logger.error('Vector search failed', { error, query })
    return []
  }
}

// 結果排序（混合語意和關鍵字匹配）
async function rankResults(results: SearchResult[], query: string): Promise<SearchResult[]> {
  // 計算關鍵字匹配分數
  const keywordScores = results.map(result => {
    const keywordScore = calculateKeywordScore(result.content, query)
    // 混合分數：70% 語意分數 + 30% 關鍵字分數
    const hybridScore = (result.score * 0.7) + (keywordScore * 0.3)
    return { ...result, hybridScore }
  })
  
  // 按混合分數排序
  return keywordScores
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .map(result => {
      // 移除臨時的 hybridScore 屬性
      const { hybridScore, ...cleanResult } = result
      return cleanResult
    })
}

/**
 * 2. 搜尋建議系統
 */

// 產生搜尋建議
async function generateSuggestions(query: string): Promise<SearchSuggestion[]> {
  // 實際實作中可以：
  // 1. 從搜尋歷史產生建議
  // 2. 從熱門搜尋詞產生
  // 3. 從內容中提取關鍵詞
  
  const suggestions: SearchSuggestion[] = []
  
  // 簡單的關鍵詞建議（實際實作中應該從資料庫取得）
  const commonTerms = [
    '葡萄酒', '威士忌', '清酒', '啤酒', '品酒', '酒類', '知識', '課程'
  ]
  
  commonTerms.forEach(term => {
    if (term.includes(query.toLowerCase())) {
      suggestions.push({
        term,
        frequency: Math.floor(Math.random() * 100) + 1,
        category: 'popular'
      })
    }
  })
  
  return suggestions.slice(0, 5)
}

/**
 * 3. 搜尋歷史與統計
 */

// 搜尋歷史管理
export class SearchHistory {
  private static readonly HISTORY_KEY = 'cheersin_search_history'
  private static readonly MAX_HISTORY = 50
  
  static addSearch(query: string, resultCount: number): void {
    if (!query.trim()) return
    
    try {
      const history = this.getHistory()
      const existingIndex = history.findIndex(item => item.query === query)
      
      const newEntry = {
        query,
        resultCount,
        timestamp: Date.now()
      }
      
      if (existingIndex >= 0) {
        // 更新現有項目
        history[existingIndex] = newEntry
      } else {
        // 新增項目
        history.unshift(newEntry)
      }
      
      // 限制歷史記錄數量
      if (history.length > this.MAX_HISTORY) {
        history.splice(this.MAX_HISTORY)
      }
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
      
    } catch (error) {
      logger.error('Failed to save search history', { error })
    }
  }
  
  static getHistory(): {
    query: string;
    resultCount: number;
    timestamp: number;
  }[] {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY)
      if (!raw) return []
      return JSON.parse(raw)
    } catch (error) {
      logger.error('Failed to load search history', { error })
      return []
    }
  }
  
  static getRecentQueries(limit = 10): string[] {
    return this.getHistory()
      .slice(0, limit)
      .map(item => item.query)
  }
  
  static clearHistory(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY)
    } catch (error) {
      logger.error('Failed to clear search history', { error })
    }
  }
}

/**
 * 4. 搜尋元件增強
 */

// 搜尋自動完成
export async function getAutocompleteSuggestions(
  query: string,
  limit = 5
): Promise<string[]> {
  if (!query.trim()) return []
  
  // 從搜尋歷史和熱門詞彙產生建議
  const history = SearchHistory.getRecentQueries(20)
  const popularTerms = [
    '葡萄酒入門', '威士忌知識', '清酒介紹', '啤酒品鑑', 
    'WSET 認證', 'CMS 認證', '品酒技巧', '酒類推薦'
  ]
  
  const allTerms = [...new Set([...history, ...popularTerms])]
  
  // 簡單的模糊匹配
  const suggestions = allTerms
    .filter(term => term.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      // 優先顯示完全匹配或開頭匹配
      const aStart = a.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1
      const bStart = b.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1
      if (aStart !== bStart) return aStart - bStart
      
      // 然後按長度排序
      return a.length - b.length
    })
    .slice(0, limit)
  
  return suggestions
}

// 搜尋過濾器
export interface SearchFilter {
  type: 'category' | 'date' | 'difficulty' | 'duration'
  value: string | [number, number]
  label: string
}

export function getAvailableFilters(): SearchFilter[] {
  return [
    { type: 'category', value: 'course', label: '課程' },
    { type: 'category', value: 'wine', label: '酒類知識' },
    { type: 'category', value: 'article', label: '文章' },
    { type: 'category', value: 'faq', label: '常見問題' },
    { type: 'difficulty', value: 'beginner', label: '入門' },
    { type: 'difficulty', value: 'intermediate', label: '進階' },
    { type: 'difficulty', value: 'expert', label: '專家' }
  ]
}

/**
 * 5. 輔助函數
 */

// 判斷結果類型
function determineResultType(metadata: Record<string, unknown>): SearchResult['type'] {
  if (metadata.course_id) return 'course'
  if (metadata.wine_id || metadata.type === 'wine') return 'wine'
  if (metadata.category === 'faq') return 'faq'
  if (metadata.type === 'game') return 'game'
  return 'article'
}

// 產生內容摘要
function generateExcerpt(content: string, maxLength: number): string {
  if (!content) return ''
  
  // 移除 HTML 標籤
  const cleanContent = content.replace(/<[^>]*>/g, '')
  
  if (cleanContent.length <= maxLength) {
    return cleanContent
  }
  
  // 簡單的斷句摘要
  const sentences = cleanContent.split(/(?<=[。！？.!?])\s*/)
  let excerpt = ''
  
  for (const sentence of sentences) {
    if (excerpt.length + sentence.length <= maxLength - 3) {
      excerpt += sentence
    } else {
      break
    }
  }
  
  return excerpt + (excerpt.length < cleanContent.length ? '...' : '')
}

// 產生結果 URL
function generateResultUrl(metadata: Record<string, unknown>): string | undefined {
  if (metadata.course_id) {
    return `/learn/${metadata.course_id}`
  }
  if (metadata.wine_id) {
    return `/wines/${metadata.wine_id}`
  }
  if (metadata.article_id) {
    return `/articles/${metadata.article_id}`
  }
  return undefined
}

// 計算關鍵字匹配分數
function calculateKeywordScore(content: string, query: string): number {
  const contentLower = content.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // 完全匹配
  if (contentLower.includes(queryLower)) {
    return 1.0
  }
  
  // 單詞匹配
  const queryWords = queryLower.split(/\s+/)
  const matchedWords = queryWords.filter(word => contentLower.includes(word))
  
  return matchedWords.length / queryWords.length
}

// 產生高亮關鍵字
function generateHighlights(content: string, query: string): string[] {
  const queryWords = query.toLowerCase().split(/\s+/)
  const highlights: string[] = []
  
  queryWords.forEach(word => {
    if (word.length > 1) {
      const regex = new RegExp(word, 'gi')
      const matches = content.match(regex)
      if (matches) {
        highlights.push(...matches)
      }
    }
  })
  
  return [...new Set(highlights)].slice(0, 5) // 去重並限制數量
}

/**
 * 6. 主要使用介面
 */

export function useSmartSearch(): {
  search: (options: SearchOptions) => Promise<{
    results: SearchResult[];
    stats: SearchStats;
  }>;
  getHistory: () => ReturnType<typeof SearchHistory.getHistory>;
  getAutocomplete: (query: string) => Promise<string[]>;
  clearHistory: () => void;
} {
  const search = async (options: SearchOptions) => {
    const result = await smartSearch(options)
    // 儲存搜尋歷史
    SearchHistory.addSearch(options.query, result.results.length)
    return result
  }
  
  const getHistory = () => SearchHistory.getHistory()
  const getAutocomplete = (query: string) => getAutocompleteSuggestions(query)
  const clearHistory = () => SearchHistory.clearHistory()
  
  return {
    search,
    getHistory,
    getAutocomplete,
    clearHistory
  }
}