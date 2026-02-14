import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { CHAT_PRIMARY, CHAT_FALLBACK_ORDER } from '@/config/chat.config'
import {
    hasGroq,
    hasNim,
    hasOpenRouter,
    GROQ_API_KEY,
    OPENROUTER_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    PINECONE_API_URL,
    PINECONE_API_KEY,
} from '@/lib/env-config'
import { maskKey } from '@/lib/mask-key'

/** BE-35：Debug 端點 — 僅開發環境；生產環境 404 不洩漏架構 */
export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return errorResponse(404, 'Not available', { message: '此端點僅在開發環境可用' })
    }

    const pineconeHost = PINECONE_API_URL ? PINECONE_API_URL.replace(/^https?:\/\//, '').split('/')[0] : ''

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        variables: {
            GROQ_API_KEY: maskKey(GROQ_API_KEY),
            GROQ_after_normalize_length: GROQ_API_KEY ? GROQ_API_KEY.length : 0,
            GROQ_prefix_ok: GROQ_API_KEY.startsWith('gsk_'),

            OPENROUTER_API_KEY: maskKey(OPENROUTER_API_KEY),
            OPENROUTER_after_normalize_length: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0,
            OPENROUTER_prefix_ok: OPENROUTER_API_KEY.startsWith('sk-or-'),

            NEXT_PUBLIC_SUPABASE_URL: NEXT_PUBLIC_SUPABASE_URL ? `SET (len ${NEXT_PUBLIC_SUPABASE_URL.length})` : 'NOT SET',
            SUPABASE_URL_no_trailing_slash: !!NEXT_PUBLIC_SUPABASE_URL && !NEXT_PUBLIC_SUPABASE_URL.endsWith('/'),
            NEXT_PUBLIC_SUPABASE_ANON_KEY: maskKey(NEXT_PUBLIC_SUPABASE_ANON_KEY),
            SUPABASE_SERVICE_ROLE_KEY: maskKey(SUPABASE_SERVICE_ROLE_KEY),

            PINECONE_API_URL: PINECONE_API_URL ? `SET (host: ${pineconeHost})` : 'NOT SET',
            PINECONE_API_KEY: maskKey(PINECONE_API_KEY),
        },
        chat: {
            CHAT_PRIMARY,
            CHAT_FALLBACK_ORDER,
            hasGroq,
            hasNim,
            hasOpenRouter,
        },
        hint: 'If *_prefix_ok is false or length 0, key may be wrong. SUPABASE_URL_no_trailing_slash should be true. PINECONE host should be xxx.svc.region.pinecone.io not api.pinecone.io.',
    })
}
