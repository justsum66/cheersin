/**
 * GET /api/learn/course-ratings
 * 回傳課程 ID → 評分（1–5）。目前由 lib 靜態資料提供，日後可改為 DB 彙總
 */
import { NextResponse } from 'next/server'
import { getCourseRatings } from '@/lib/learn-course-ratings'

export async function GET() {
  const ratings = getCourseRatings()
  return NextResponse.json(ratings)
}
