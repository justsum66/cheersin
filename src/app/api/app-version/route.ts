import { NextResponse } from 'next/server'
import { APP_UPDATE_CONFIG } from '@/config/twa.config'

/** GP-015: App version check API for TWA update strategy */
export async function GET() {
  return NextResponse.json({
    version: APP_UPDATE_CONFIG.currentVersion,
    forceUpdate: false,
    minVersion: '1.0.0',
    updateUrl: 'https://play.google.com/store/apps/details?id=app.cheersin.twa',
    releaseNotes: null,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
