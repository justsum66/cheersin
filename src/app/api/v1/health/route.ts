/**
 * P2-288：API 版本控制 — v1 健康檢查，轉發至現有 /api/health 並加上 X-API-Version
 */
import { GET as healthGet } from '@/app/api/health/route'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const res = await healthGet()
  const clone = res.clone()
  const headers = new Headers(clone.headers)
  headers.set('X-API-Version', '1')
  return new NextResponse(clone.body, { status: clone.status, headers })
}
