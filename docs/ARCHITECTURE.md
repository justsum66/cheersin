# Cheersin Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.5.7 |
| UI | React + Tailwind CSS | 19 / 4 |
| Language | TypeScript | 5.7 |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth (SSR) | - |
| AI Chat | Groq + OpenRouter + NIM | Fallback chain |
| Vector DB | Pinecone | RAG retrieval |
| State | Zustand + localStorage | Client state |
| Payments | PayPal | Subscriptions |
| Push | OneSignal + Web Push API | Notifications |
| Monitoring | Sentry | Error tracking |
| Animations | Framer Motion | - |
| Testing | Vitest + Testing Library | - |

## Directory Structure

```
src/
  app/                    # Next.js App Router pages & API routes
    api/                  # API route handlers
      admin/              # Admin-only endpoints
      chat/               # AI sommelier chat
      games/              # Party game endpoints
      learn/              # Wine academy endpoints
      health/             # Health check
      v1/                 # Versioned API (v1)
    learn/                # Learning pages
    games/                # Game pages
    admin/                # Admin dashboard
  components/             # React components
  hooks/                  # Custom React hooks
  lib/                    # Shared utilities & business logic
  store/                  # Zustand stores
  contexts/               # React contexts
  config/                 # Configuration constants
  types/                  # TypeScript type definitions
  __tests__/              # Integration tests
docs/                     # Documentation
```

## Key Architecture Decisions

### 1. API Response Format

All API routes return a unified JSON format for consistency:
- Success: `{ success: true, data: T }`
- Error: `{ success: false, error: { code, message } }`

Implemented via `successResponse()` / `errorResponse()` / `serverErrorResponse()` in `src/lib/api-response.ts`.

**Key rule**: `serverErrorResponse()` never exposes internal error details to clients. Error messages are logged server-side only.

### 2. Request Validation Pipeline

Every POST/PATCH route follows this pipeline:
1. **Rate limit check** (`isRateLimitedAsync()`)
2. **Body parsing + Zod validation** (`zodParseBody()`)
3. **Authentication** (`requireLearnAuth()` or `isAdminRequest()`)
4. **Business logic**
5. **Error handling** (try/catch with `serverErrorResponse()`)

### 3. AI Chat Fallback Chain

The chat endpoint uses a provider fallback chain defined in `CHAT_FALLBACK_ORDER`:
1. **Groq** (primary, fastest) - with retry on non-429 errors
2. **NVIDIA NIM** (secondary)
3. **OpenRouter** (tertiary, configurable via feature flag)

Each provider attempt is logged with latency and success/failure for monitoring.

### 4. Rate Limiting

Two-tier rate limiting:
- **In-memory Map** (`src/lib/rate-limit.ts`) - default, zero-config
- **Upstash Redis** (`src/lib/rate-limit-upstash.ts`) - optional, for multi-instance

Per-route configs in `ROUTE_RATE_LIMITS`. Client IP extraction priority:
1. `cf-connecting-ip` (Cloudflare)
2. `x-real-ip` (Nginx)
3. `x-forwarded-for` (first IP)
4. `"unknown"` fallback

### 5. Subscription Tiers

Three tiers: `free` → `basic` → `premium`

| Feature | Free | Basic | Premium |
|---------|------|-------|---------|
| AI calls/day | 3 | 50 | Unlimited |
| Room players | 2 | 8 | 12 |
| Pro courses | No | No | Yes |
| Ads | Yes | No | No |

Client-side: localStorage-based counting (convenience)
Server-side: DB-backed tier verification + in-memory usage tracking

### 6. Gamification

Points, badges, streaks, and leaderboard - currently localStorage-based:
- `src/lib/gamification.ts` - Client-side state
- `src/lib/server-gamification.ts` - Server-side validation
- `src/lib/server-usage-tracking.ts` - Server-side AI usage

### 7. State Management

- **Zustand stores** for global client state (subscription, user profile, UI)
- **localStorage** for persistent client data (gamification, settings)
- **Supabase** for server-side persistent data (profiles, progress, notes)
- **React Context** for scoped state (i18n, API loading, error announcer)

### 8. Authentication Flow

- Supabase Auth with SSR cookie-based sessions
- `src/lib/supabase-server.ts` creates server-side client
- `src/lib/require-learn-auth.ts` middleware for protected learn routes
- Admin auth uses separate `x-admin-secret` header with timing-safe comparison

### 9. Error Handling

Layered error handling:
- `AppError` class for typed application errors
- `handleApiError()` wrapper for consistent try/catch
- `serverErrorResponse()` for generic 500s (logs internally, generic to client)
- Structured logging via `src/lib/logger.ts`
- `src/lib/api-error-log.ts` for detailed error logging

### 10. Testing Strategy

- **Unit tests** (Vitest): `*.test.ts` co-located or in `__tests__/`
  - `vitest-environment: node` for API routes
  - `vitest-environment: jsdom` for components (default)
- **Test patterns**:
  - Mock external services (Supabase, Groq, etc.)
  - Test Zod schema validation exhaustively
  - Test rate limiting behavior
  - Test error response format consistency

## External Service Dependencies

| Service | Purpose | Required | Env Vars |
|---------|---------|----------|----------|
| Supabase | DB + Auth | Yes | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Groq | AI Chat | Yes* | `GROQ_API_KEY` |
| OpenRouter | AI Fallback | Optional | `OPENROUTER_API_KEY` |
| Pinecone | RAG vectors | Optional | `PINECONE_API_KEY`, `PINECONE_API_URL` |
| PayPal | Payments | Optional | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |
| OneSignal | Push | Optional | `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY` |
| Sentry | Monitoring | Optional | `SENTRY_DSN` |

*At least one AI provider (Groq or OpenRouter) is required for chat functionality.

## Security Measures

1. **Input validation**: All API inputs validated via Zod schemas
2. **Rate limiting**: Per-route IP-based rate limits
3. **Error masking**: Internal errors never exposed to clients
4. **Admin auth**: Timing-safe secret comparison prevents timing attacks
5. **XSS prevention**: Display names sanitized, HTML stripped
6. **CSRF**: SameSite cookies via Supabase Auth
7. **Headers**: `Cache-Control: no-store` on all API responses
8. **Server-side validation**: Subscription tier and gamification validated server-side
