// OpenRouter SDK Client
// https://openrouter.ai/docs
// P3-34：使用 fetchWithRetry 逾時 + 指數退避重試
import { normalizeEnv } from './env'
import { fetchWithRetry } from './fetch-retry'

interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

interface OpenRouterResponse {
    id: string
    choices: {
        message: {
            role: string
            content: string
        }
        finish_reason: string
    }[]
    model: string
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

function getOpenRouterKey(): string {
  return normalizeEnv(process.env.OPENROUTER_API_KEY)
}

export async function chatWithOpenRouter(
    messages: OpenRouterMessage[],
    options: {
        model?: string
        temperature?: number
        maxTokens?: number
    } = {}
): Promise<string> {
    const {
        model = 'anthropic/claude-3.5-sonnet', // Default model
        temperature = 0.7,
        maxTokens = 1024
    } = options

    const apiKey = getOpenRouterKey()
    const response = await fetchWithRetry(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim(),
            'X-Title': (process.env.NEXT_PUBLIC_APP_NAME || 'Cheersin').trim()
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens
        }),
        timeoutMs: 30_000,
        retries: 2,
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const data: OpenRouterResponse = await response.json()
    return data.choices[0]?.message?.content || ''
}

// List available models
export async function listOpenRouterModels(): Promise<{ id: string; name: string; pricing: any }[]> {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        headers: {
            'Authorization': `Bearer ${getOpenRouterKey()}`
        }
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
    }

    const data = await response.json()
    return data.data
}

// Test connection
export async function testOpenRouterConnection(): Promise<{ success: boolean; message: string }> {
    try {
        const result = await chatWithOpenRouter([
            { role: 'user', content: 'Say "OK" if you can hear me.' }
        ], { maxTokens: 10 })

        return {
            success: true,
            message: `Connection successful. Response: "${result.substring(0, 50)}..."`
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
