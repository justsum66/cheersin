/**
 * PWA-029: Network quality detection and adaptive loading.
 * Detects connection type and downlink speed via Network Information API.
 */

export type NetworkQuality = 'high' | 'medium' | 'low' | 'offline'

export interface NetworkInfo {
  quality: NetworkQuality
  effectiveType: string | null
  downlinkMbps: number | null
  isOnline: boolean
  saveData: boolean
}

interface NavigatorConnection {
  effectiveType?: string
  downlink?: number
  saveData?: boolean
}

export function detectNetworkQuality(): NetworkInfo {
  if (typeof navigator === 'undefined') {
    return { quality: 'high', effectiveType: null, downlinkMbps: null, isOnline: true, saveData: false }
  }

  const isOnline = navigator.onLine
  if (!isOnline) {
    return { quality: 'offline', effectiveType: null, downlinkMbps: null, isOnline: false, saveData: false }
  }

  const conn = (navigator as Navigator & { connection?: NavigatorConnection }).connection
  if (!conn) {
    return { quality: 'high', effectiveType: null, downlinkMbps: null, isOnline: true, saveData: false }
  }

  const effectiveType = conn.effectiveType ?? null
  const downlinkMbps = conn.downlink ?? null
  const saveData = conn.saveData ?? false

  let quality: NetworkQuality = 'high'
  if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
    quality = 'low'
  } else if (effectiveType === '3g' || (downlinkMbps !== null && downlinkMbps < 1.5)) {
    quality = 'medium'
  }

  return { quality, effectiveType, downlinkMbps, isOnline, saveData }
}

/**
 * Returns recommended image quality suffix based on network conditions.
 * Usage: `src={`/images/hero${getImageQualitySuffix()}.webp`}`
 */
export function getImageQualitySuffix(): string {
  const { quality } = detectNetworkQuality()
  switch (quality) {
    case 'low': return '-low'
    case 'medium': return '-med'
    default: return ''
  }
}

/**
 * Whether to enable heavy animations (particles, parallax, etc.)
 */
export function shouldEnableAnimations(): boolean {
  const { quality, saveData } = detectNetworkQuality()
  if (saveData) return false
  return quality !== 'low'
}
