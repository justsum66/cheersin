import { describe, it, expect } from 'vitest'
import { normalizeEnv, normalizeUrl } from './env'

describe('normalizeEnv', () => {
  it('returns empty string for undefined', () => {
    expect(normalizeEnv(undefined)).toBe('')
  })
  it('trims whitespace', () => {
    expect(normalizeEnv('  foo  ')).toBe('foo')
  })
  it('strips BOM', () => {
    expect(normalizeEnv('\uFEFFbar')).toBe('bar')
  })
  it('strips double quotes', () => {
    expect(normalizeEnv('"baz"')).toBe('baz')
  })
  it('strips single quotes', () => {
    expect(normalizeEnv("'qux'")).toBe('qux')
  })
  it('leaves unquoted value unchanged', () => {
    expect(normalizeEnv('https://example.com')).toBe('https://example.com')
  })
})

describe('normalizeUrl', () => {
  it('removes trailing slash', () => {
    expect(normalizeUrl('https://api.example.com/')).toBe('https://api.example.com')
  })
  it('removes multiple trailing slashes', () => {
    expect(normalizeUrl('https://api.example.com///')).toBe('https://api.example.com')
  })
  it('returns empty for undefined', () => {
    expect(normalizeUrl(undefined)).toBe('')
  })
})
