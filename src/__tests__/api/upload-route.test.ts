// @vitest-environment node
/**
 * P2-315：上傳 API 單元測試 — 驗證白名單類型、大小、必填欄位
 */
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/upload/route'

function makeRequest(formData: FormData): Request {
  return new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  })
}

describe('POST /api/upload', () => {
  it('回傳 400 當缺少 file 欄位', async () => {
    const formData = new FormData()
    const req = makeRequest(formData)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error')
  })

  it('回傳 400 當 file 為字串（無效）', async () => {
    const formData = new FormData()
    formData.append('file', 'not-a-file')
    const req = makeRequest(formData)
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('回傳 400 當 MIME 不在白名單', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['x'], { type: 'application/pdf' }), 'x.pdf')
    const req = makeRequest(formData)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    const msg = typeof json.error?.message === 'string' ? json.error.message : ''
    expect(msg).toMatch(/allowed|image/)
  })

  it('回傳 400 當檔案超過 5MB', async () => {
    const formData = new FormData()
    const big = new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/jpeg' })
    formData.append('file', big, 'big.jpg')
    const req = makeRequest(formData)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    const msg = typeof json.error?.message === 'string' ? json.error.message : ''
    expect(msg).toMatch(/large|5MB/)
  })
})
