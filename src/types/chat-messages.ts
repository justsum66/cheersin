/**
 * 共用 Chat 訊息型別，供 groq、nim、openrouter、chat route、api-bodies 使用
 */

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/** 與 ChatMessage 結構一致，供 recordApiCall / 跨 provider 使用 */
export interface ChatUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}
