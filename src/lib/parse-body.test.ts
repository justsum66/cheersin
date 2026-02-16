// @vitest-environment node
/**
 * P1-39: parse-body unit tests
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { parseJsonBody, zodParseBody } from './parse-body'

describe('parseJsonBody', () => {
  it('parses valid JSON body', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    })
    const result = await parseJsonBody(req)
    expect(result).toEqual({ foo: 'bar' })
  })

  it('returns null for invalid JSON', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'not-json',
    })
    const result = await parseJsonBody(req)
    expect(result).toBeNull()
  })

  it('returns null for empty body', async () => {
    const req = new Request('http://localhost', { method: 'POST' })
    const result = await parseJsonBody(req)
    expect(result).toBeNull()
  })
})

describe('zodParseBody', () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  })

  it('returns success with valid data', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 30 }),
    })
    const result = await zodParseBody(req, TestSchema)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Alice')
      expect(result.data.age).toBe(30)
    }
  })

  it('returns failure for invalid data', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', age: -1 }),
    })
    const result = await zodParseBody(req, TestSchema)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
    }
  })

  it('returns INVALID_JSON for non-JSON body', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'not json',
    })
    const result = await zodParseBody(req, TestSchema)
    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response.json()
      expect(body.error.code).toBe('INVALID_JSON')
    }
  })

  it('uses defaultRaw when body is unparseable', async () => {
    const OptionalSchema = z.object({
      theme: z.string().optional(),
    })
    const req = new Request('http://localhost', { method: 'POST' })
    const result = await zodParseBody(req, OptionalSchema, { defaultRaw: {} })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.theme).toBeUndefined()
    }
  })

  it('uses custom error codes', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: 'bad' })
    const result = await zodParseBody(req, TestSchema, {
      invalidJsonCode: 'CUSTOM_JSON_ERR',
      invalidJsonMessage: 'Custom message',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response.json()
      expect(body.error.code).toBe('CUSTOM_JSON_ERR')
      expect(body.error.message).toBe('Custom message')
    }
  })

  it('uses custom body validation code', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', age: 0 }),
    })
    const result = await zodParseBody(req, TestSchema, {
      invalidBodyCode: 'BAD_BODY',
      invalidBodyMessage: 'Fix your data',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response.json()
      expect(body.error.code).toBe('BAD_BODY')
      expect(body.error.message).toBe('Fix your data')
    }
  })
})
