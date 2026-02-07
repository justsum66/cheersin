import { NextResponse } from 'next/server'
import { normalizeEnv, normalizeUrl } from '@/lib/env'
import { errorResponse } from '@/lib/api-response'

/** BE-35：Debug 端點 — 僅開發環境；生產環境 404 不洩漏架構 */
export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return errorResponse(404, 'Not available', { message: '此端點僅在開發環境可用' })
    }
    const maskKey = (key: string | undefined) => {
        if (!key) return 'NOT SET'
        if (key.length < 10) return '***'
        return key.substring(0, 8) + '...' + key.substring(key.length - 4)
    }

    const groqRaw = process.env.GROQ_API_KEY
    const groqNorm = normalizeEnv(groqRaw || '')
    const openRouterRaw = process.env.OPENROUTER_API_KEY
    const openRouterNorm = normalizeEnv(openRouterRaw || '')
    const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseUrlNorm = normalizeUrl(supabaseUrlRaw)
    const pineconeUrlRaw = process.env.PINECONE_API_URL
    const pineconeUrlNorm = normalizeUrl(pineconeUrlRaw || '')

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        variables: {
            GROQ_API_KEY: maskKey(groqRaw),
            GROQ_after_normalize_length: groqNorm ? groqNorm.length : 0,
            GROQ_prefix_ok: groqNorm.startsWith('gsk_'),

            OPENROUTER_API_KEY: maskKey(openRouterRaw),
            OPENROUTER_after_normalize_length: openRouterNorm ? openRouterNorm.length : 0,
            OPENROUTER_prefix_ok: openRouterNorm.startsWith('sk-or-'),

            NEXT_PUBLIC_SUPABASE_URL: supabaseUrlRaw ? `${supabaseUrlNorm ? 'SET' : 'EMPTY_AFTER_NORMALIZE'} (len ${supabaseUrlRaw.length})` : 'NOT SET',
            SUPABASE_URL_no_trailing_slash: supabaseUrlNorm && !supabaseUrlNorm.endsWith('/'),
            NEXT_PUBLIC_SUPABASE_ANON_KEY: maskKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
            SUPABASE_SERVICE_ROLE_KEY: maskKey(process.env.SUPABASE_SERVICE_ROLE_KEY),

            PINECONE_API_URL: pineconeUrlRaw ? (pineconeUrlNorm ? `SET (host: ${pineconeUrlNorm.replace(/^https?:\/\//, '').split('/')[0]})` : 'EMPTY_AFTER_NORMALIZE') : 'NOT SET',
            PINECONE_API_KEY: maskKey(process.env.PINECONE_API_KEY),
        },
        hint: 'If *_prefix_ok is false or length 0, key may be wrong. SUPABASE_URL_no_trailing_slash should be true. PINECONE host should be xxx.svc.region.pinecone.io not api.pinecone.io.',
    })
}
