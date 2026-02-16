// @vitest-environment node
/**
 * P0-29: API response helpers unit tests
 */
import { describe, it, expect } from 'vitest'
import { successResponse, errorResponse, serverErrorResponse, getErrorCode, getErrorMessage } from './api-response'

describe('successResponse', () => {
  it('returns 200 with success body', async () => {
    const res = successResponse({ foo: 'bar' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ foo: 'bar' })
  })

  it('supports custom status', async () => {
    const res = successResponse('created', 201)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toBe('created')
  })

  it('includes cache-control headers', () => {
    const res = successResponse({})
    expect(res.headers.get('Cache-Control')).toContain('no-store')
  })
})

describe('errorResponse', () => {
  it('returns error with code and message', async () => {
    const res = errorResponse(400, 'BAD_INPUT', { message: 'Invalid field' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('BAD_INPUT')
    expect(body.error.message).toBe('Invalid field')
  })

  it('uses code as message when not provided', async () => {
    const res = errorResponse(404, 'NOT_FOUND')
    const body = await res.json()
    expect(body.error.message).toBe('NOT_FOUND')
  })
})

describe('serverErrorResponse', () => {
  it('returns generic 500 without exposing internals', async () => {
    const res = serverErrorResponse(new Error('DB connection failed'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('INTERNAL_ERROR')
    expect(body.error.message).not.toContain('DB connection')
  })

  it('handles null/undefined error', async () => {
    const res = serverErrorResponse()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('handles string error', async () => {
    const res = serverErrorResponse('something went wrong')
    expect(res.status).toBe(500)
  })
})

describe('getErrorCode', () => {
  it('extracts error code', () => {
    expect(getErrorCode({ error: { code: 'RATE_LIMITED' } })).toBe('RATE_LIMITED')
  })
  it('returns undefined for missing code', () => {
    expect(getErrorCode({ error: {} })).toBeUndefined()
  })
  it('returns undefined for null', () => {
    expect(getErrorCode(null)).toBeUndefined()
  })
  it('returns undefined for non-object', () => {
    expect(getErrorCode('string')).toBeUndefined()
  })
})

describe('getErrorMessage', () => {
  it('extracts error.message', () => {
    expect(getErrorMessage({ error: { message: 'Too fast' } })).toBe('Too fast')
  })
  it('extracts string error', () => {
    expect(getErrorMessage({ error: 'Direct error string' })).toBe('Direct error string')
  })
  it('falls back to message field', () => {
    expect(getErrorMessage({ message: 'Direct msg' })).toBe('Direct msg')
  })
  it('returns fallback when no message found', () => {
    expect(getErrorMessage({}, 'default')).toBe('default')
    expect(getErrorMessage(null, 'fallback')).toBe('fallback')
  })
})
