import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { testSupabaseConnection } from '@/lib/supabase-server'
import { testOpenRouterConnection } from '@/lib/openrouter'
import { testPineconeConnection } from '@/lib/pinecone'
import { getUsageStats } from '@/lib/api-usage'
import { normalizeEnv } from '@/lib/env'
import Groq from 'groq-sdk'
import { groq, GROQ_CHAT_MODEL } from '@/lib/groq'
import { GROQ_API_KEY, GROQ_HEALTH_API_KEY, CHAT_TIMEOUT_MS, OPENROUTER_API_KEY, OPENROUTER_HEALTH_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PINECONE_API_KEY, PINECONE_API_URL } from '@/lib/env-config'
import { HEALTH_SERVICE, hintFor } from '@/lib/health-hints'

interface ServiceStatus {
    name: string
    status: 'connected' | 'error' | 'checking' | 'not_configured'
    latency?: number
    message?: string
    hint?: string
    /** P2-25：不暴露內部 URL/key，僅狀態與延遲；details 可含 model/defaultModel/stats 等非敏感資訊 */
    details?: Record<string, unknown>
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
            if (!NEXT_PUBLIC_SUPABASE_URL?.trim() || !SUPABASE_SERVICE_ROLE_KEY?.trim()) {
                results.push({
                    name: HEALTH_SERVICE.SUPABASE,
                    status: 'not_configured',
                    message: 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set'
                })
            } else {
                const supabaseStart = Date.now()
                const supabaseResult = await withTimeout(
                    testSupabaseConnection(),
                    PER_SERVICE_TIMEOUT_MS,
                    HEALTH_SERVICE.SUPABASE
                )
            results.push({
                name: HEALTH_SERVICE.SUPABASE,
                status: supabaseResult.success ? 'connected' : 'error',
                latency: Date.now() - supabaseStart,
                message: supabaseResult.message,
                ...(supabaseResult.success ? {} : { hint: hintFor(HEALTH_SERVICE.SUPABASE, supabaseResult.message) }),
                details: { url_set: true }
            })
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        const msg = err.message
        const cause = err.cause != null ? String(err.cause) : undefined
        results.push({
            name: HEALTH_SERVICE.SUPABASE,
            status: 'error',
            message: msg,
            hint: hintFor(HEALTH_SERVICE.SUPABASE, msg),
            details: cause ? { cause } : { url_set: !!NEXT_PUBLIC_SUPABASE_URL }
        })
    }

    // 2. Test Groq Connection（可選 GROQ_HEALTH_API_KEY，未設則用主線 groq）
    try {
        const groqStart = Date.now()
        const groqKey = GROQ_HEALTH_API_KEY || GROQ_API_KEY
        if (!groqKey) {
            results.push({
                name: HEALTH_SERVICE.GROQ,
                status: 'not_configured',
                message: 'GROQ_API_KEY not set in environment'
            })
        } else {
            const groqClient = GROQ_HEALTH_API_KEY
                ? new Groq({ apiKey: GROQ_HEALTH_API_KEY, timeout: CHAT_TIMEOUT_MS })
                : groq
            const completion = await withTimeout(
                groqClient.chat.completions.create({
                    messages: [{ role: 'user', content: 'Say OK' }],
                    model: GROQ_CHAT_MODEL,
                    max_tokens: 10
                }),
                PER_SERVICE_TIMEOUT_MS,
                HEALTH_SERVICE.GROQ
            )

            const response = completion.choices[0]?.message?.content || ''

            results.push({
                name: HEALTH_SERVICE.GROQ,
                status: 'connected',
                latency: Date.now() - groqStart,
                message: `Model responding: "${response}"`,
                details: {
                    model: GROQ_CHAT_MODEL
                }
            })
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
            name: HEALTH_SERVICE.GROQ,
            status: 'error',
            message: msg,
            hint: hintFor(HEALTH_SERVICE.GROQ, msg)
        })
    }

    // 3. Test OpenRouter Connection（可選 OPENROUTER_HEALTH_API_KEY，未設則用主 key）
    try {
        const openrouterStart = Date.now()
        const openrouterKey = OPENROUTER_HEALTH_API_KEY || OPENROUTER_API_KEY
        if (!openrouterKey) {
            results.push({
                name: HEALTH_SERVICE.OPENROUTER,
                status: 'not_configured',
                message: 'OPENROUTER_API_KEY not set in environment'
            })
        } else {
            const openrouterResult = await withTimeout(
                testOpenRouterConnection(),
                PER_SERVICE_TIMEOUT_MS,
                HEALTH_SERVICE.OPENROUTER
            )

            results.push({
                name: HEALTH_SERVICE.OPENROUTER,
                status: openrouterResult.success ? 'connected' : 'error',
                latency: Date.now() - openrouterStart,
                message: openrouterResult.message,
                ...(openrouterResult.success ? {} : { hint: hintFor(HEALTH_SERVICE.OPENROUTER, openrouterResult.message) }),
                details: {
                    defaultModel: 'anthropic/claude-3.5-sonnet'
                }
            })
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
            name: HEALTH_SERVICE.OPENROUTER,
            status: 'error',
            message: msg,
            hint: hintFor(HEALTH_SERVICE.OPENROUTER, msg)
        })
    }

    // 4. Test Pinecone Connection
    try {
        const pineconeStart = Date.now()

        if (!PINECONE_API_KEY || !PINECONE_API_URL) {
            results.push({
                name: HEALTH_SERVICE.PINECONE,
                status: 'not_configured',
                message: 'PINECONE_API_KEY or PINECONE_API_URL not set in environment'
            })
        } else {
            const pineconeResult = await withTimeout(
                testPineconeConnection(),
                PER_SERVICE_TIMEOUT_MS,
                HEALTH_SERVICE.PINECONE
            )

            results.push({
                name: HEALTH_SERVICE.PINECONE,
                status: pineconeResult.success ? 'connected' : 'error',
                latency: Date.now() - pineconeStart,
                message: pineconeResult.message,
                ...(pineconeResult.success ? {} : { hint: hintFor(HEALTH_SERVICE.PINECONE, pineconeResult.message) }),
                details: pineconeResult.stats
            })
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
            name: HEALTH_SERVICE.PINECONE,
            status: 'error',
            message: msg,
            hint: hintFor(HEALTH_SERVICE.PINECONE, msg)
        })
    }

    // 5. Test PayPal Connection（訂閱用；未配置時標為 not_configured）
    const PAYPAL_CHECK_TIMEOUT_MS = 4_000
    try {
        const clientId = normalizeEnv(process.env.PAYPAL_CLIENT_ID)
        const clientSecret = normalizeEnv(process.env.PAYPAL_CLIENT_SECRET)
        if (!clientId || !clientSecret) {
            results.push({
                name: HEALTH_SERVICE.PAYPAL,
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
                HEALTH_SERVICE.PAYPAL
            )
            const latency = Date.now() - paypalStart
            if (!tokenRes.ok) {
                const errText = await tokenRes.text()
                results.push({
                    name: HEALTH_SERVICE.PAYPAL,
                    status: 'error',
                    latency,
                    message: `HTTP ${tokenRes.status}: ${errText.slice(0, 100)}`,
                    hint: hintFor(HEALTH_SERVICE.PAYPAL, errText),
                })
            } else {
                results.push({
                    name: HEALTH_SERVICE.PAYPAL,
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
            name: HEALTH_SERVICE.PAYPAL,
            status: 'error',
            message: msg,
            hint: hintFor(HEALTH_SERVICE.PAYPAL, msg),
        })
    }

    // Summary
    const connectedCount = results.filter(r => r.status === 'connected').length
    const configuredCount = results.filter(r => r.status !== 'not_configured').length
    const totalTime = Date.now() - startTime

    const usage = getUsageStats()
    const chatByModel = usage.byModel
    const chatRecentFailures = Object.fromEntries(
      Object.entries(chatByModel).filter(([, v]) => v.calls > 0 && v.success < v.calls)
    )

    return NextResponse.json({
            timestamp: new Date().toISOString(),
            totalLatency: totalTime,
            summary: `${connectedCount}/${results.length} services connected`,
            healthy: connectedCount >= 3, // At least 3 of Supabase/Groq/OpenRouter/Pinecone/PayPal
            services: results,
            chatStats: { byModel: chatByModel, recentFailuresByModel: chatRecentFailures },
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
