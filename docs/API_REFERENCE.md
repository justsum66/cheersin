# Cheersin API Reference

## Overview

All API routes follow REST conventions under `/api/`. Responses use a unified format:

**Success**: `{ success: true, data: T }`
**Error**: `{ success: false, error: { code: string, message: string } }`

All responses include `Cache-Control: no-store` headers.

## Authentication

- **Learn APIs**: Use `requireLearnAuth()` — validates Supabase session via cookies
- **Admin APIs**: Use `isAdminRequest()` with `x-admin-secret` header + timing-safe comparison
- **Public APIs**: No auth required (rate-limited by IP)

## Rate Limiting

All routes are rate-limited by client IP. Limits are configured per-route in `src/lib/rate-limit.ts`:

| Route | Limit | Window |
|-------|-------|--------|
| `/api/chat` | 10/min (free), 60/min (pro) | 60s |
| `/api/chat/feedback` | 30/min | 60s |
| `/api/analytics` | 60/min | 60s |
| `/api/learn/notes` | 30/min | 60s |
| `/api/learn/progress` | 30/min | 60s |
| `/api/learn/certificate` | 10/min | 60s |
| `/api/learn/discussions` | 20/min | 60s |
| `/api/learn/tasting-notes` | 20/min | 60s |
| `/api/push-subscribe` | 10/min | 60s |
| `/api/auto-tag` | 10/min | 60s |
| `/api/generate-invitation` | 20/min | 60s |
| `/api/admin/*` | 30/min | 60s |
| `/api/notifications/onesignal-user` | 10/min | 60s |

Rate-limited responses return `429` with `RATE_LIMITED` code.

## Endpoints

### Health Check

#### `GET /api/health`
Returns service connectivity status for Supabase, Groq, OpenRouter, Pinecone, PayPal.

**Response**: `{ timestamp, totalLatency, summary, healthy, services[], chatStats }`

#### `GET /api/v1/health`
Same as `/api/health` with `X-API-Version: 1` header.

### Chat (AI Sommelier)

#### `POST /api/chat`
Send message to AI sommelier. Supports text, vision (base64 images), and streaming.

**Body** (validated by `ChatPostBodySchema`):
```
{
  messages: [{ role: "user"|"assistant"|"system", content: string }],
  stream?: boolean,
  quizResult?: string
}
```

#### `POST /api/chat/feedback`
Submit feedback on AI responses.

**Body** (validated by `ChatFeedbackPostBodySchema`):
```
{
  messageId: string,
  helpful: boolean,
  comment?: string (max 2000 chars)
}
```

### Learn (Wine Academy)

#### `GET /api/learn/course-ratings`
Returns static course rating map. No auth required.

**Response**: `{ "wine-basics": 4.8, "whisky-101": 4.6, ... }`

#### `POST /api/learn/progress`
Record chapter completion. Requires auth.

**Body** (validated by `LearnProgressPostBodySchema`):
```
{ courseId: string, chapterId: number (>= 0) }
```

#### `POST /api/learn/notes`
Save learning notes. Requires auth.

**Body** (validated by `LearnNotesPostBodySchema`):
```
{ courseId: string, content: string }
```

#### `POST /api/learn/certificate`
Generate course completion certificate. Requires auth.

**Body** (validated by `LearnCertificatePostBodySchema`):
```
{ courseId: string }
```

#### `GET/POST /api/learn/discussions`
Get or create course discussions. Requires auth.

**POST Body** (validated by `LearnDiscussionsPostBodySchema`):
```
{ courseId: string, content: string (1-5000 chars) }
```

#### `POST /api/learn/tasting-notes`
Save wine tasting notes. Requires auth.

**Body** (validated by `TastingNotesPostBodySchema`):
```
{ wine_name: string, rating: number (1-5) }
```

### Games

#### `POST /api/games/rooms`
Create or manage game rooms. Requires auth.

#### `POST /api/games/join`
Join a game room.

**Body** (validated by `JoinRoomBodySchema`):
```
{ displayName: string (max 20 chars) }
```

#### `POST /api/games/leave`
Leave a game room.

**Body** (validated by `LeaveRoomBodySchema`):
```
{ playerId: string }
```

### Utilities

#### `POST /api/analytics`
Record web vitals and analytics events.

**Body**:
```
{ name: string, value: number (0-1000000), id?: string }
```

#### `POST /api/generate-invitation`
Generate party invitation text.

**Body** (validated by `GenerateInvitationPostBodySchema`):
```
{ theme?: string, date?: string }
```

#### `POST /api/auto-tag`
Auto-tag wines or regions.

**Body** (validated by `AutoTagPostBodySchema`):
```
{ type: "wine"|"region"|"grape", name: string }
```

#### `POST /api/push-subscribe`
Register push notification subscription.

**Body** (validated by `PushSubscribePostBodySchema`):
```
{
  subscription: {
    endpoint: string,
    keys: { p256dh: string, auth: string }
  }
}
```

### Admin

#### `GET /api/admin/users`
List or search users. Requires admin auth.

#### `PATCH /api/admin/users`
Update user subscription tier. Requires admin auth.

**Body** (validated by `AdminUsersPatchBodySchema`):
```
{ userId: string, subscription_tier: "free"|"basic"|"premium" }
```

#### `POST /api/admin/knowledge`
Add knowledge base document. Requires admin auth.

**Body** (validated by `AdminKnowledgePostBodySchema`):
```
{ title: string, course_id: string, chapter: string, content: string (max 100k) }
```

### Notifications

#### `POST /api/notifications/onesignal-user`
Register user with OneSignal.

**Body** (validated by `OneSignalUserPostBodySchema`):
```
{ external_id: string }
```

## Error Codes

| Code | Description |
|------|-------------|
| `RATE_LIMITED` | Too many requests |
| `INVALID_JSON` | Request body is not valid JSON |
| `INVALID_BODY` | Request body failed schema validation |
| `INTERNAL_ERROR` | Server error (details logged, not exposed) |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `SERVICE_NOT_CONFIGURED` | External service not configured |
| `UPSTREAM_ERROR` | External service returned error |
| `HEALTH_CHECK_TIMEOUT` | Health check timed out (504) |

## Validation

All POST/PATCH routes use Zod schemas for request body validation. Schemas are centralized in `src/lib/api-body-schemas.ts`. The `zodParseBody()` utility from `src/lib/parse-body.ts` handles:

1. JSON parsing with graceful error handling
2. Zod schema validation
3. Returning standardized error responses
