/**
 * P3-64：聊天歷史可選寫入 DB（fire-and-forget，不阻塞回應）
 * chat_history 表：user_id, role, content, tokens_used, created_at
 */
import { createServerClientOptional } from './supabase-server'

/** 非阻塞寫入一輪對話：user 訊息 + assistant 訊息；無 user_id 則不寫入 */
export async function persistChatHistory(
  userId: string | null | undefined,
  userContent: string,
  assistantContent: string,
  tokensUsed?: number | null
): Promise<void> {
  if (!userId || typeof userContent !== 'string' || typeof assistantContent !== 'string') {
    return
  }
  const supabase = createServerClientOptional()
  if (!supabase) return

  try {
    const userRow = {
      user_id: userId,
      role: 'user' as const,
      content: userContent.slice(0, 8000),
    }
    const assistantRow = {
      user_id: userId,
      role: 'assistant' as const,
      content: assistantContent.slice(0, 8000),
      tokens_used: tokensUsed ?? null,
    }
    await supabase.from('chat_history').insert(userRow)
    await supabase.from('chat_history').insert(assistantRow)
  } catch {
    // fire-and-forget：不拋出，不阻塞 API 回應
  }
}
