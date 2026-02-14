/**
 * AST-32：Assistant 頁型別集中
 * Message 與 AI 回覆相關型別；WineCardDataFromAI 由 wine-response 定義，此處 re-export
 */

import type { WineCardDataFromAI } from '@/lib/wine-response'

export type { WineCardDataFromAI }

/** 單一則對話訊息（user / assistant） */
export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  liked?: boolean
  sources?: { index: number; source: string }[]
  similarQuestions?: string[]
  tags?: string[]
  /** 141, 143-145 結構化酒款（AI 回傳 [WINES] JSON 時） */
  wines?: WineCardDataFromAI[]
  /** AST-13：API 錯誤/逾時時為 true，顯示重試按鈕 */
  isError?: boolean
}

/** localStorage 儲存的訊息格式（timestamp 為 ISO 字串） */
export interface AssistantMessageStored {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  wines?: WineCardDataFromAI[]
}
