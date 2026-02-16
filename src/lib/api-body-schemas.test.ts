/**
 * P0-28: Zod schema unit tests
 */
import { describe, it, expect } from 'vitest'
import {
  ChatFeedbackPostBodySchema,
  LearnDiscussionsPostBodySchema,
  PushSubscribePostBodySchema,
  AdminKnowledgePostBodySchema,
  AdminUsersPatchBodySchema,
  AutoTagPostBodySchema,
  TastingNotesPostBodySchema,
  OneSignalUserPostBodySchema,
  GenerateInvitationPostBodySchema,
  LeaveRoomBodySchema,
  JoinRoomBodySchema,
  ChatPostBodySchema,
  SubscriptionPostBodySchema,
  RecommendPostBodySchema,
  ReportPostBodySchema,
  LearnNotesPostBodySchema,
  LearnCertificatePostBodySchema,
  LearnProgressPostBodySchema,
} from './api-body-schemas'

describe('ChatFeedbackPostBodySchema', () => {
  it('accepts valid feedback', () => {
    expect(ChatFeedbackPostBodySchema.safeParse({ messageId: 'msg-1', helpful: true }).success).toBe(true)
  })
  it('accepts feedback with comment', () => {
    expect(ChatFeedbackPostBodySchema.safeParse({ messageId: 'msg-1', helpful: false, comment: 'Bad' }).success).toBe(true)
  })
  it('rejects missing messageId', () => {
    expect(ChatFeedbackPostBodySchema.safeParse({ helpful: true }).success).toBe(false)
  })
  it('rejects non-boolean helpful', () => {
    expect(ChatFeedbackPostBodySchema.safeParse({ messageId: 'x', helpful: 'yes' }).success).toBe(false)
  })
  it('rejects comment > 2000 chars', () => {
    expect(ChatFeedbackPostBodySchema.safeParse({ messageId: 'x', helpful: true, comment: 'x'.repeat(2001) }).success).toBe(false)
  })
})

describe('LearnDiscussionsPostBodySchema', () => {
  it('accepts valid discussion', () => {
    expect(LearnDiscussionsPostBodySchema.safeParse({ courseId: 'wine-101', content: 'Great!' }).success).toBe(true)
  })
  it('rejects empty content', () => {
    expect(LearnDiscussionsPostBodySchema.safeParse({ courseId: 'wine-101', content: '' }).success).toBe(false)
  })
  it('rejects content > 5000 chars', () => {
    expect(LearnDiscussionsPostBodySchema.safeParse({ courseId: 'c', content: 'x'.repeat(5001) }).success).toBe(false)
  })
})

describe('PushSubscribePostBodySchema', () => {
  it('accepts valid subscription', () => {
    const result = PushSubscribePostBodySchema.safeParse({
      subscription: { endpoint: 'https://push.example.com/sub', keys: { p256dh: 'k1', auth: 'k2' } },
    })
    expect(result.success).toBe(true)
  })
  it('rejects missing keys', () => {
    expect(PushSubscribePostBodySchema.safeParse({ subscription: { endpoint: 'https://x' } }).success).toBe(false)
  })
  it('rejects missing endpoint', () => {
    expect(PushSubscribePostBodySchema.safeParse({ subscription: { keys: { p256dh: 'k', auth: 'k' } } }).success).toBe(false)
  })
})

describe('AdminKnowledgePostBodySchema', () => {
  it('accepts valid doc', () => {
    expect(AdminKnowledgePostBodySchema.safeParse({ title: 'T', course_id: 'c', chapter: 'ch', content: 'cnt' }).success).toBe(true)
  })
  it('rejects content > 100k', () => {
    expect(AdminKnowledgePostBodySchema.safeParse({ title: 'T', course_id: 'c', chapter: 'ch', content: 'x'.repeat(100_001) }).success).toBe(false)
  })
})

describe('AdminUsersPatchBodySchema', () => {
  it('accepts valid tier', () => {
    expect(AdminUsersPatchBodySchema.safeParse({ userId: 'u1', subscription_tier: 'premium' }).success).toBe(true)
  })
  it('rejects invalid tier', () => {
    expect(AdminUsersPatchBodySchema.safeParse({ userId: 'u1', subscription_tier: 'gold' }).success).toBe(false)
  })
})

describe('AutoTagPostBodySchema', () => {
  it('accepts wine type', () => {
    expect(AutoTagPostBodySchema.safeParse({ type: 'wine', name: 'Merlot' }).success).toBe(true)
  })
  it('rejects invalid type', () => {
    expect(AutoTagPostBodySchema.safeParse({ type: 'beer', name: 'IPA' }).success).toBe(false)
  })
})

describe('TastingNotesPostBodySchema', () => {
  it('accepts valid note', () => {
    expect(TastingNotesPostBodySchema.safeParse({ wine_name: 'Merlot', rating: 4 }).success).toBe(true)
  })
  it('rejects rating out of range', () => {
    expect(TastingNotesPostBodySchema.safeParse({ wine_name: 'X', rating: 0 }).success).toBe(false)
    expect(TastingNotesPostBodySchema.safeParse({ wine_name: 'X', rating: 6 }).success).toBe(false)
  })
})

describe('OneSignalUserPostBodySchema', () => {
  it('accepts valid external_id', () => {
    expect(OneSignalUserPostBodySchema.safeParse({ external_id: 'user-1' }).success).toBe(true)
  })
  it('rejects empty external_id', () => {
    expect(OneSignalUserPostBodySchema.safeParse({ external_id: '' }).success).toBe(false)
  })
})

describe('GenerateInvitationPostBodySchema', () => {
  it('accepts optional fields', () => {
    expect(GenerateInvitationPostBodySchema.safeParse({}).success).toBe(true)
    expect(GenerateInvitationPostBodySchema.safeParse({ theme: '紅酒', date: '2026-01-01' }).success).toBe(true)
  })
})

describe('LeaveRoomBodySchema', () => {
  it('accepts valid', () => { expect(LeaveRoomBodySchema.safeParse({ playerId: 'p1' }).success).toBe(true) })
  it('rejects empty', () => { expect(LeaveRoomBodySchema.safeParse({ playerId: '' }).success).toBe(false) })
})

describe('JoinRoomBodySchema', () => {
  it('accepts valid', () => { expect(JoinRoomBodySchema.safeParse({ displayName: 'Alice' }).success).toBe(true) })
  it('rejects too long', () => { expect(JoinRoomBodySchema.safeParse({ displayName: 'A'.repeat(21) }).success).toBe(false) })
})

describe('ChatPostBodySchema', () => {
  it('accepts valid chat', () => {
    expect(ChatPostBodySchema.safeParse({ messages: [{ role: 'user', content: 'hi' }] }).success).toBe(true)
  })
  it('rejects invalid role', () => {
    expect(ChatPostBodySchema.safeParse({ messages: [{ role: 'admin', content: 'hi' }] }).success).toBe(false)
  })
})

describe('SubscriptionPostBodySchema', () => {
  it('accepts create-subscription', () => {
    expect(SubscriptionPostBodySchema.safeParse({ action: 'create-subscription' }).success).toBe(true)
  })
  it('rejects unknown action', () => {
    expect(SubscriptionPostBodySchema.safeParse({ action: 'upgrade' }).success).toBe(false)
  })
})

describe('RecommendPostBodySchema', () => {
  it('accepts valid namespace', () => {
    expect(RecommendPostBodySchema.safeParse({ namespace: 'wines', limit: 10 }).success).toBe(true)
  })
})

describe('ReportPostBodySchema', () => {
  it('accepts valid report', () => {
    expect(ReportPostBodySchema.safeParse({ type: '騷擾', description: 'test' }).success).toBe(true)
  })
})

describe('LearnNotesPostBodySchema', () => {
  it('accepts valid notes', () => {
    expect(LearnNotesPostBodySchema.safeParse({ courseId: 'c1', content: 'my note' }).success).toBe(true)
  })
})

describe('LearnCertificatePostBodySchema', () => {
  it('accepts valid', () => {
    expect(LearnCertificatePostBodySchema.safeParse({ courseId: 'wine-101' }).success).toBe(true)
  })
})

describe('LearnProgressPostBodySchema', () => {
  it('accepts valid', () => {
    expect(LearnProgressPostBodySchema.safeParse({ courseId: 'c1', chapterId: 0 }).success).toBe(true)
  })
  it('rejects negative chapterId', () => {
    expect(LearnProgressPostBodySchema.safeParse({ courseId: 'c1', chapterId: -1 }).success).toBe(false)
  })
})
