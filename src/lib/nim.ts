/**
 * NVIDIA NIM API：OpenAI 相容 /v1/chat/completions
 * https://docs.api.nvidia.com/nim/reference/create_chat_completion_v1_chat_completions_post
 * Key 於 build.nvidia.com 取得（nvapi- 開頭）
 * 僅用於 chat（含串流 fallback），不用於 embedding、auto-tag、party-dj 等。
 */
import type { ChatMessage } from '@/types/chat-messages'
import { NVIDIA_NIM_API_KEY, CHAT_TIMEOUT_MS, hasNim } from './env-config'
import { fetchWithRetry } from './fetch-retry'

const NIM_BASE = 'https://integrate.api.nvidia.com/v1'
const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct'

/** 與 ChatMessage 結構一致，NIM API 相容 */
export type NIMChatMessage = ChatMessage

/** 結構化錯誤，供 chat route 辨識 429/timeout */
export class NIMApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string
  ) {
    super(message)
    this.name = 'NIMApiError'
  }
}

/** 單次非串流呼叫 */
export async function chatWithNIM(
  messages: NIMChatMessage[],
  options: { systemPrompt?: string; temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<string> {
  if (!NVIDIA_NIM_API_KEY) throw new NIMApiError('NVIDIA_NIM_API_KEY is not set', 0)

  const { systemPrompt, temperature = 0.8, maxTokens = 1024, model = DEFAULT_MODEL } = options
  const msgs = [...messages]
  if (systemPrompt) {
    msgs.unshift({ role: 'system', content: systemPrompt })
  }

  const res = await fetchWithRetry(`${NIM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NVIDIA_NIM_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: msgs,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
    timeoutMs: CHAT_TIMEOUT_MS,
    retries: 2,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new NIMApiError(`NIM API ${res.status}: ${err}`, res.status, err)
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

/** NIM 串流：逐 chunk 回傳（OpenAI 相容 stream）；建立連線階段使用 fetchWithRetry + 逾時 */
export async function* chatWithNIMStream(
  messages: NIMChatMessage[],
  options: { systemPrompt?: string; temperature?: number; maxTokens?: number; model?: string } = {}
): AsyncGenerator<string> {
  if (!NVIDIA_NIM_API_KEY) throw new NIMApiError('NVIDIA_NIM_API_KEY is not set', 0)

  const { systemPrompt, temperature = 0.8, maxTokens = 1024, model = DEFAULT_MODEL } = options
  const msgs = [...messages]
  if (systemPrompt) {
    msgs.unshift({ role: 'system', content: systemPrompt })
  }

  const res = await fetchWithRetry(`${NIM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NVIDIA_NIM_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: msgs,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
    timeoutMs: CHAT_TIMEOUT_MS,
    retries: 2,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new NIMApiError(`NIM API ${res.status}: ${err}`, res.status, err)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new NIMApiError('NIM stream body is null', 0)

  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = line.slice(6).trim()
        if (json === '[DONE]') continue
        try {
          const obj = JSON.parse(json) as { choices?: { delta?: { content?: string } }[] }
          const content = obj.choices?.[0]?.delta?.content
          if (typeof content === 'string') yield content
        } catch {
          /* ignore parse error */
        }
      }
    }
  }
}

/** 單一來源：re-export env-config 的 hasNim */
export function hasNIM(): boolean {
  return hasNim
}
