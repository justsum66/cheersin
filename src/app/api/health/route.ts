import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { testSupabaseConnection } from '@/lib/supabase-server'
import { testOpenRouterConnection } from '@/lib/openrouter'
import { testPineconeConnection } from '@/lib/pinecone'
import { normalizeEnv } from '@/lib/env'
import Groq from 'groq-sdk'

interface ServiceStatus {
    name: string
    status: 'connected' | 'error' | 'checking' | 'not_configured'
    latency?: number
    message?: string
    hint?: string
    /** P2-25：不暴露內部 URL/key，僅狀態與延遲；details 可含 model/defaultModel/stats 等非敏感資訊 */
    details?: Record<string, unknown>
}

/** 依錯誤訊息回傳除錯提示（不暴露 key） */
function hintFor(name: string, message: string): string {
    const m = message.toLowerCase()
    if (name === 'Supabase') {
        if (m.includes('dns') || m.includes('enotfound') || m.includes('fetch failed')) return 'NEXT_PUBLIC_SUPABASE_URL unreachable. Use wdegandlipgdvqhgmoai.supabase.co; project may be paused (Dashboard → Restore).'
        if (m.includes('missing') || m.includes('env')) return 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    }
    if (name === 'Groq AI') {
        if (m.includes('429') || m.includes('rate limit')) return 'Groq rate limit; chat will fallback to next provider. Retry later or upgrade Groq tier.'
        if (m.includes('401') || m.includes('invalid') || m.includes('api key')) return 'Fix GROQ_API_KEY in .env.local (get key at console.groq.com)'
    }
    if (name === 'OpenRouter') {
        if (m.includes('401') || m.includes('user not found')) return 'Fix OPENROUTER_API_KEY in .env.local (get key at openrouter.ai/keys)'
        if (m.includes('402') || m.includes('credits')) return 'Add credits at openrouter.ai/settings/credits or reduce max_tokens'
    }
    if (name === 'Pinecone') {
        if (m.includes('401') || m.includes('unauthorized')) {
            return 'Use index HOST as PINECONE_API_URL. Ensure PINECONE_API_KEY is from same project (console → API Keys).'
        }
        if (m.includes('403') || m.includes('forbidden')) {
            return 'Key valid but 403 Forbidden: API key may lack ReadWrite for this index, or key/index from different project. Create key in same project as index.'
        }
    }
    if (name === 'PayPal') {
        if (m.includes('401') || m.includes('invalid') || m.includes('unauthorized')) return 'Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET (developer.paypal.com).'
        if (m.includes('env') || m.includes('not set')) return 'Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local for subscription.'
    }
    return ''
}

/** P3-61：單一服務檢查逾時 5s，總逾時 15s */
const PER_SERVICE_TIMEOUT_MS = 5_000
const TOTAL_HEALTH_TIMEOUT_MS = 15_000

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        p,
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${label} timeout after ${ms}ms`)), ms)),
    ])
}

export async function GET() {
    const runChecks = async (): Promise<NextResponse> => {
        const results: ServiceStatus[] = []
        const startTime = Date.now()

        // 1. Test Supabase Connection（P3-42：未配置時標為 not_configured）
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
                results.push({
                    name: 'Supabase',
                    status: 'not_configured',
                    message: 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set'
                })
            } else {
                const supabaseStart = Date.now()
                const supabaseResult = await withTimeout(
                    testSupabaseConnection(),
                    PER_SERVICE_TIMEOUT_MS,
                    'Supabase'
                )
            results.push({
                name: 'Supabase',
                status: supabaseResult.success ? 'connected' : 'error',
                latency: Date.now() - supabaseStart,
                message: supabaseResult.message,
                ...(supabaseResult.success ? {} : { hint: hintFor('Supabase', supabaseResult.message) }),
                details: { url_set: true }
            })
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        const msg = err.message
        const cause = err.cause != null ? String(err.cause) : undefined
        results.push({
            name: 'Supabase',
            status: 'error',
            message: msg,
            hint: hintFor('Supabase', msg),
            details: cause ? { cause } : { url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL }
        })
    }

    // 2. Test Groq Connection
    try {
        const groqStart = Date.now()

        const groqKey = normalizeEnv(process.env.GROQ_API_KEY)
        if (!groqKey) {
            results.push({
                name: 'Groq AI',
                status: 'not_configured',
                message: 'GROQ_API_KEY not set in environment'
            })
        } else {
            const groq = new Groq({ apiKey: groqKey })

            const completion = await withTimeout(
                groq.chat.completions.create({
                    messages: [{ role: 'user', content: 'Say OK' }],
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 10
                }),
                PER_SERVICE_TIMEOUT_MS,
                'Groq'
            )

            const response = completion.choices[0]?.message?.content || ''

            results.push({
                name: 'Groq AI',
                status: 'connected',
                latency: Date.now() - groqStart,
                message: `Model responding: "${response}"`,
                details: {
                    model: 'llama-3.3-70b-versatile'
                }
            })
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
            name: 'Groq AI',
            status: 'error',
            message: msg,
            hint: hintFor('Groq AI', msg)
        })
    }

    // 3. Test OpenRouter Connection
    try {
        const openrouterStart = Date.now()

        if (!process.env.OPENROUTER_API_KEY) {
            results.push({
                name: 'OpenRouter',
                status: 'not_configured',
                message: 'OPENROUTER_API_KEY not set in environment'
            })
        } else {
            const openrouterResult = await withTimeout(
                testOpenRouterConnection(),
                PER_SERVICE_TIMEOUT_MS,
                'OpenRouter'
            )

            results.push({
                name: 'OpenRouter',
                status: openrouterResult.success ? 'connected' : 'error',
                latency: Date.now() - openrouterStart,
                message: openrouterResult.message,
                ...(openrouterResult.success ? {} : { hint: hintFor('OpenRouter', openrouterResult.message) }),
                details: {
                    defaultModel: 'anthropic/claude-3.5-sonnet'
                }
            })
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
            name: 'OpenRouter',
            status: 'error',
            message: msg,
            hint: hintFor('OpenRouter', msg)
        })
    }

    // 4. Test Pinecone Connection
    try {
        const pineconeStart = Date.now()

        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_API_URL) {
            results.push({
                name: 'Pinecone',
                status: 'not_configured',
                message: 'PINECONE_API_KEY or PINECONE_API_URL not set in environment'
            })
        } else {
            const pineconeResult = await withTimeout(
                testPineconeConnection(),
                PER_SERVICE_TIMEOUT_MS,
                'Pinecone'
            )

            results.push({
                name: 'Pinecone',
                status: pineconeResult.success ? 'connected' : 'error',
                latency: Date.now() - pineconeStart,
                message: pineconeResult.message,
                ...(pineconeResult.success ? {} : { hint: hintFor('Pinecone', pineconeResult.message) }),
                details: pineconeResult.stats
            })
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
            name: 'Pinecone',
            status: 'error',
            message: msg,
            hint: hintFor('Pinecone', msg)
        })
    }

    // 5. Test PayPal Connection（訂閱用；未配置時標為 not_configured）
    const PAYPAL_CHECK_TIMEOUT_MS = 4_000
    try {
        const clientId = normalizeEnv(process.env.PAYPAL_CLIENT_ID)
        const clientSecret = normalizeEnv(process.env.PAYPAL_CLIENT_SECRET)
        if (!clientId || !clientSecret) {
            results.push({
                name: 'PayPal',
                status: 'not_configured',
                message: 'PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set'
            })
        } else {
            const paypalBase = process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
            const paypalStart = Date.now()
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
            const tokenRes = await withTimeout(
                fetch(`${paypalBase}/v1/oauth2/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${auth}` },
                    body: 'grant_type=client_credentials',
                }),
                PAYPAL_CHECK_TIMEOUT_MS,
                'PayPal'
            )
            const latency = Date.now() - paypalStart
            if (!tokenRes.ok) {
                const errText = await tokenRes.text()
                results.push({
                    name: 'PayPal',
                    status: 'error',
                    latency,
                    message: `HTTP ${tokenRes.status}: ${errText.slice(0, 100)}`,
                    hint: hintFor('PayPal', errText),
                })
            } else {
                results.push({
                    name: 'PayPal',
                    status: 'connected',
                    latency,
                    message: 'OAuth2 token OK',
                    details: { subscription_ready: true },
                })
            }
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
            name: 'PayPal',
            status: 'error',
            message: msg,
            hint: hintFor('PayPal', msg),
        })
    }

    // Summary
    const connectedCount = results.filter(r => r.status === 'connected').length
    const configuredCount = results.filter(r => r.status !== 'not_configured').length
    const totalTime = Date.now() - startTime

    return NextResponse.json({
            timestamp: new Date().toISOString(),
            totalLatency: totalTime,
            summary: `${connectedCount}/${results.length} services connected`,
            healthy: connectedCount >= 3, // At least 3 of Supabase/Groq/OpenRouter/Pinecone/PayPal
            services: results
        })
    }

    /** BE-41：健康檢查逾時回傳統一 errorResponse */
    return Promise.race([
        runChecks(),
        new Promise<NextResponse>((resolve) =>
            setTimeout(
                () => resolve(errorResponse(504, 'HEALTH_CHECK_TIMEOUT', {
                    message: '健康檢查逾時，請稍後再試',
                })),
                TOTAL_HEALTH_TIMEOUT_MS
            )
        ),
    ])
}
