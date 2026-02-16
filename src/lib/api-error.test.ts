// @vitest-environment node
/**
 * P1-40: api-error unit tests — AppError, handleApiError, validationError
 */
import { describe, it, expect, vi } from 'vitest'
import { NextResponse } from 'next/server'
import { AppError, handleApiError, validationError } from './api-error'

vi.mock('./logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

describe('AppError', () => {
  it('creates error with status and code', () => {
    const err = new AppError(404, 'NOT_FOUND')
    expect(err.status).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.name).toBe('AppError')
    expect(err.message).toBe('NOT_FOUND')
  })

  it('uses custom message when provided', () => {
    const err = new AppError(400, 'BAD_INPUT', 'Invalid email')
    expect(err.message).toBe('Invalid email')
    expect(err.code).toBe('BAD_INPUT')
  })

  it('is instanceof Error', () => {
    const err = new AppError(500, 'FAIL')
    expect(err).toBeInstanceOf(Error)
  })
})

describe('validationError', () => {
  it('creates 400 AppError with default code', () => {
    const err = validationError('Field is required')
    expect(err).toBeInstanceOf(AppError)
    expect(err.status).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.message).toBe('Field is required')
  })

  it('accepts custom code', () => {
    const err = validationError('Too short', 'MIN_LENGTH')
    expect(err.code).toBe('MIN_LENGTH')
  })
})

describe('handleApiError', () => {
  it('returns handler result on success', async () => {
    const res = await handleApiError(async () => {
      return NextResponse.json({ ok: true })
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('catches AppError and returns errorResponse', async () => {
    const res = await handleApiError(async () => {
      throw new AppError(403, 'FORBIDDEN', 'Access denied')
    })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('FORBIDDEN')
    expect(body.error.message).toBe('Access denied')
  })

  it('catches generic Error and returns 500', async () => {
    const res = await handleApiError(async () => {
      throw new Error('DB crashed')
    })
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('INTERNAL_ERROR')
    // Should NOT expose internal error message
    expect(body.error.message).not.toContain('DB crashed')
  })

  it('catches string throw and returns 500', async () => {
    const res = await handleApiError(async () => {
      throw 'something broke'
    })
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})
