/**
 * NVIDIA NIM API：OpenAI 相容 /v1/chat/completions
 * https://docs.api.nvidia.com/nim/reference/create_chat_completion_v1_chat_completions_post
 * Key 於 build.nvidia.com 取得（nvapi- 開頭）
 */
import { normalizeEnv } from './env'

const NIM_BASE = 'https://integrate.api.nvidia.com/v1'
const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct'

function getNimKey(): string {
  return normalizeEnv(process.env.NVIDIA_NIM_API_KEY)
}

export interface NIMChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/** 單次非串流呼叫 */
export async function chatWithNIM(
  messages: NIMChatMessage[],
  options: { systemPrompt?: string; temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<string> {
  const apiKey = getNimKey()
  if (!apiKey) throw new Error('NVIDIA_NIM_API_KEY is not set')

  const { systemPrompt, temperature = 0.8, maxTokens = 1024, model = DEFAULT_MODEL } = options
  const msgs = [...messages]
  if (systemPrompt) {
    msgs.unshift({ role: 'system', content: systemPrompt })
  }

  const res = await fetch(`${NIM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: msgs,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`NIM API ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

/** NIM 串流：逐 chunk 回傳（OpenAI 相容 stream） */
export async function* chatWithNIMStream(
  messages: NIMChatMessage[],
  options: { systemPrompt?: string; temperature?: number; maxTokens?: number; model?: string } = {}
): AsyncGenerator<string> {
  const apiKey = getNimKey()
  if (!apiKey) throw new Error('NVIDIA_NIM_API_KEY is not set')

  const { systemPrompt, temperature = 0.8, maxTokens = 1024, model = DEFAULT_MODEL } = options
  const msgs = [...messages]
  if (systemPrompt) {
    msgs.unshift({ role: 'system', content: systemPrompt })
  }

  const res = await fetch(`${NIM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: msgs,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`NIM API ${res.status}: ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('NIM stream body is null')

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

export function hasNIM(): boolean {
  return Boolean(getNimKey())
}
