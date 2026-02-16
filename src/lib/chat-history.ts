/**
 * P3-01：對話歷史持久化系統
 * 實作對話歷史的本地儲存、同步和管理
 * 支援使用者偏好記憶、對話上下文維持、個人化體驗
 */

import type { ChatMessage } from '@/types/chat-messages'
import { logger } from './logger'

// 儲存鍵名
const CHAT_HISTORY_KEY = 'cheersin_chat_history'
const USER_PREFERENCES_KEY = 'cheersin_user_preferences'
const CONVERSATION_CONTEXT_KEY = 'cheersin_conversation_context'

// 對話歷史項目結構
export interface ChatHistoryItem {
  id: string
  timestamp: string
  messages: ChatMessage[]
  title: string
  summary?: string
  tags?: string[]
  winePreferences?: string[]
  learningInterests?: string[]
}

// 使用者偏好設定
export interface UserPreferences {
  // 品酒偏好
  preferredWineTypes?: string[]
  preferredRegions?: string[]
  preferredPriceRange?: [number, number]
  flavorPreferences?: string[]
  
  // 學習偏好
  learningGoals?: string[]
  preferredLearningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic'
  studyFrequency?: 'daily' | 'weekly' | 'occasional'
  
  // 對話偏好
  conversationStyle?: 'formal' | 'casual' | 'technical'
  responseLength?: 'short' | 'medium' | 'detailed'
  languagePreference?: string
}

// 對話上下文
export interface ConversationContext {
  currentTopic?: string
  previousQuestions?: string[]
  userIntent?: string
  sessionStartTime?: string
  interactionCount?: number
}

/**
 * 1. 對話歷史管理
 */

// 儲存對話歷史
export function saveChatHistory(history: ChatHistoryItem[]): void {
  try {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      history: history.slice(-50) // 保留最近 50 次對話
    }
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(data))
    logger.info('Chat history saved', { count: history.length })
  } catch (error) {
    logger.error('Failed to save chat history', { error })
  }
}

// 讀取對話歷史
export function loadChatHistory(): ChatHistoryItem[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    if (!raw) return []
    
    const data = JSON.parse(raw)
    if (data.version === '1.0' && Array.isArray(data.history)) {
      return data.history
    }
    return []
  } catch (error) {
    logger.error('Failed to load chat history', { error })
    return []
  }
}

// 新增對話記錄
export function addChatHistory(messages: ChatMessage[], title: string): string {
  const history = loadChatHistory()
  const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newItem: ChatHistoryItem = {
    id,
    timestamp: new Date().toISOString(),
    messages,
    title,
    tags: extractTagsFromMessages(messages),
    winePreferences: extractWinePreferences(messages),
    learningInterests: extractLearningInterests(messages)
  }
  
  history.push(newItem)
  saveChatHistory(history)
  return id
}

// 刪除特定對話
export function deleteChatHistory(id: string): boolean {
  try {
    const history = loadChatHistory()
    const filtered = history.filter(item => item.id !== id)
    saveChatHistory(filtered)
    return true
  } catch (error) {
    logger.error('Failed to delete chat history', { error, id })
    return false
  }
}

// 清除所有對話歷史
export function clearChatHistory(): void {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY)
    logger.info('Chat history cleared')
  } catch (error) {
    logger.error('Failed to clear chat history', { error })
  }
}

/**
 * 2. 使用者偏好管理
 */

// 儲存使用者偏好
export function saveUserPreferences(preferences: UserPreferences): void {
  try {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      preferences
    }
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(data))
    logger.info('User preferences saved')
  } catch (error) {
    logger.error('Failed to save user preferences', { error })
  }
}

// 讀取使用者偏好
export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(USER_PREFERENCES_KEY)
    if (!raw) return {}
    
    const data = JSON.parse(raw)
    if (data.version === '1.0' && typeof data.preferences === 'object') {
      return data.preferences
    }
    return {}
  } catch (error) {
    logger.error('Failed to load user preferences', { error })
    return {}
  }
}

// 更新使用者偏好
export function updateUserPreferences(updates: Partial<UserPreferences>): void {
  const current = loadUserPreferences()
  const updated = { ...current, ...updates }
  saveUserPreferences(updated)
}

/**
 * 3. 對話上下文管理
 */

// 儲存對話上下文
export function saveConversationContext(context: ConversationContext): void {
  try {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        sessionStartTime: context.sessionStartTime || new Date().toISOString(),
        interactionCount: (context.interactionCount || 0) + 1
      }
    }
    sessionStorage.setItem(CONVERSATION_CONTEXT_KEY, JSON.stringify(data))
  } catch (error) {
    logger.error('Failed to save conversation context', { error })
  }
}

// 讀取對話上下文
export function loadConversationContext(): ConversationContext {
  try {
    const raw = sessionStorage.getItem(CONVERSATION_CONTEXT_KEY)
    if (!raw) return {}
    
    const data = JSON.parse(raw)
    if (data.version === '1.0' && typeof data.context === 'object') {
      return data.context
    }
    return {}
  } catch (error) {
    logger.error('Failed to load conversation context', { error })
    return {}
  }
}

// 清除對話上下文（新對話開始時）
export function clearConversationContext(): void {
  try {
    sessionStorage.removeItem(CONVERSATION_CONTEXT_KEY)
  } catch (error) {
    logger.error('Failed to clear conversation context', { error })
  }
}

/**
 * 4. 智慧分析工具
 */

// 從訊息中提取標籤
function extractTagsFromMessages(messages: ChatMessage[]): string[] {
  const tags: string[] = []
  const content = messages.map(m => m.content).join(' ').toLowerCase()
  
  // 品酒相關標籤
  if (content.includes('紅酒') || content.includes('红酒') || content.includes('red wine')) tags.push('紅酒')
  if (content.includes('白酒') || content.includes('白酒') || content.includes('white wine')) tags.push('白酒')
  if (content.includes('氣泡') || content.includes('香檳') || content.includes('sparkling')) tags.push('氣泡酒')
  if (content.includes('威士忌') || content.includes('whiskey') || content.includes('whisky')) tags.push('威士忌')
  
  // 學習相關標籤
  if (content.includes('課程') || content.includes('學習') || content.includes('學習')) tags.push('學習')
  if (content.includes('認證') || content.includes('考試') || content.includes('certification')) tags.push('認證')
  if (content.includes('推薦') || content.includes('建議') || content.includes('recommendation')) tags.push('推薦')
  
  return Array.from(new Set(tags))
}

// 提取葡萄酒偏好
function extractWinePreferences(messages: ChatMessage[]): string[] {
  const preferences: string[] = []
  const content = messages.map(m => m.content).join(' ').toLowerCase()
  
  // 葡萄酒類型
  if (content.includes('卡本內') || content.includes('cabernet')) preferences.push('卡本內蘇維濃')
  if (content.includes('黑皮諾') || content.includes('pinot noir')) preferences.push('黑皮諾')
  if (content.includes('夏多內') || content.includes('chardonnay')) preferences.push('夏多內')
  if (content.includes('雷司令') || content.includes('riesling')) preferences.push('雷司令')
  
  // 產區偏好
  if (content.includes('法國') || content.includes('france')) preferences.push('法國')
  if (content.includes('義大利') || content.includes('italy')) preferences.push('義大利')
  if (content.includes('美國') || content.includes('usa') || content.includes('america')) preferences.push('美國')
  if (content.includes('澳洲') || content.includes('australia')) preferences.push('澳洲')
  
  return Array.from(new Set(preferences))
}

// 提取學習興趣
function extractLearningInterests(messages: ChatMessage[]): string[] {
  const interests: string[] = []
  const content = messages.map(m => m.content).join(' ').toLowerCase()
  
  if (content.includes('wset')) interests.push('WSET認證')
  if (content.includes('cms')) interests.push('CMS認證')
  if (content.includes('mw') || content.includes('master of wine')) interests.push('葡萄酒大師')
  if (content.includes('烈酒') || content.includes('烈酒')) interests.push('烈酒')
  if (content.includes('清酒') || content.includes('sake')) interests.push('清酒')
  if (content.includes('啤酒') || content.includes('beer')) interests.push('啤酒')
  
  return Array.from(new Set(interests))
}

/**
 * 5. 個人化建議系統
 */

// 產生個人化對話提示
export function generatePersonalizedPrompt(
  userPreferences: UserPreferences,
  conversationContext: ConversationContext
): string {
  const preferences = loadUserPreferences()
  const context = loadConversationContext()
  
  const promptParts: string[] = []
  
  // 品酒偏好提示
  if (preferences.preferredWineTypes?.length) {
    promptParts.push(`使用者偏好葡萄酒類型: ${preferences.preferredWineTypes.join(', ')}`)
  }
  
  if (preferences.preferredRegions?.length) {
    promptParts.push(`使用者偏好產區: ${preferences.preferredRegions.join(', ')}`)
  }
  
  // 學習偏好提示
  if (preferences.learningGoals?.length) {
    promptParts.push(`使用者學習目標: ${preferences.learningGoals.join(', ')}`)
  }
  
  // 對話上下文提示
  if (context.currentTopic) {
    promptParts.push(`目前討論主題: ${context.currentTopic}`)
  }
  
  if (context.previousQuestions?.length) {
    promptParts.push(`先前問題: ${context.previousQuestions.slice(-3).join(', ')}`)
  }
  
  return promptParts.join('\n')
}

// 根據歷史推薦下一步
export function getRecommendationsFromHistory(): string[] {
  const history = loadChatHistory()
  if (history.length === 0) return []
  
  const recentItems = history.slice(-5)
  const allTags = recentItems.flatMap(item => item.tags || [])
  const tagCounts: Record<string, number> = {}
  
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  })
  
  // 推薦最常討論的主題
  const sortedTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag)
  
  return sortedTags
}