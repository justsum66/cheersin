import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generatePartyPlan } from '@/lib/party-dj-plan'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { plan, peopleCount, durationMin } = await generatePartyPlan(body)
    return NextResponse.json({
      ...plan,
      peopleCount,
      totalMin: durationMin,
    })
  } catch (error) {
    logger.error('Party DJ Error', { err: error instanceof Error ? error.message : String(error) })
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: false, error: 'Failed to generate plan' }, { status: 500 })
  }
}
