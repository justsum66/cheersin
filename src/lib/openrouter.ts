// OpenRouter SDK Client
// https://openrouter.ai/docs
// P3-34：使用 fetchWithRetry 逾時 + 指數退避重試
import type { ChatMessage, ChatUsage } from '@/types/chat-messages'
import { OPENROUTER_API_KEY, OPENROUTER_CHAT_MODEL, OPENROUTER_HEALTH_API_KEY } from './env-config'
import { fetchWithRetry } from './fetch-retry'

/** 與 ChatMessage 結構一致，可共用 */
export type OpenRouterMessage = ChatMessage

interface OpenRouterResponse {
  id: string
  choices: {
    message: { role: string; content: string }
    finish_reason: string
  }[]
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/** 結構化錯誤，供 health hint 與 chat route 判斷 retryable */
export class OpenRouterApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string
  ) {
    super(message)
    this.name = 'OpenRouterApiError'
  }
}

export async function chatWithOpenRouter(
  messages: OpenRouterMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    timeoutMs?: number
    apiKey?: string
  } = {}
): Promise<{ text: string; usage?: ChatUsage }> {
  const {
    model = OPENROUTER_CHAT_MODEL,
    temperature = 0.7,
    maxTokens = 1024,
    timeoutMs = 30_000,
    apiKey: keyOverride,
  } = options

  const apiKey = keyOverride || OPENROUTER_API_KEY
  if (!apiKey) throw new OpenRouterApiError('OPENROUTER_API_KEY is not set', 0)

  const response = await fetchWithRetry(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim(),
      'X-Title': (process.env.NEXT_PUBLIC_APP_NAME || 'Cheersin').trim(),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
    timeoutMs,
    retries: 2,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new OpenRouterApiError(`OpenRouter API error: ${response.status} - ${error}`, response.status, error)
  }

  const data: OpenRouterResponse = await response.json()
  const text = data.choices[0]?.message?.content || ''
  const usage: ChatUsage | undefined = data.usage
    ? {
        prompt_tokens: data.usage.prompt_tokens ?? 0,
        completion_tokens: data.usage.completion_tokens ?? 0,
        total_tokens: data.usage.total_tokens ?? 0,
      }
    : undefined
  return { text, usage }
}

/** List available models；使用 fetchWithRetry + 逾時 */
export async function listOpenRouterModels(): Promise<{ id: string; name: string; pricing: unknown }[]> {
  if (!OPENROUTER_API_KEY) throw new OpenRouterApiError('OPENROUTER_API_KEY is not set', 0)

  const response = await fetchWithRetry(`${OPENROUTER_BASE_URL}/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    timeoutMs: 15_000,
    retries: 2,
  })

  if (!response.ok) {
    throw new OpenRouterApiError(`Failed to fetch models: ${response.status}`, response.status)
  }

  const data = (await response.json()) as { data?: { id: string; name: string; pricing: unknown }[] }
  return data.data ?? []
}

/** Test connection；短 maxTokens 與逾時，避免 health 檢查過久；優先使用 OPENROUTER_HEALTH_API_KEY */
export async function testOpenRouterConnection(): Promise<{ success: boolean; message: string }> {
  const key = OPENROUTER_HEALTH_API_KEY || OPENROUTER_API_KEY
  try {
    const { text } = await chatWithOpenRouter(
      [{ role: 'user', content: 'Say "OK" if you can hear me.' }],
      { maxTokens: 10, timeoutMs: 10_000, apiKey: key }
    )
    return {
      success: true,
      message: `Connection successful. Response: "${text.substring(0, 50)}..."`,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const status = error instanceof OpenRouterApiError ? error.status : undefined
    return {
      success: false,
      message: status ? `(${status}) ${msg}` : msg,
    }
  }
}
