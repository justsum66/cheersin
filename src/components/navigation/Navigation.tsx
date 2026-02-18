'use client'

import { OptimizedNavigation } from './OptimizedNavigation'

/** 
 * Navigation.tsx - 向後相容包裝組件
 * 包裝 OptimizedNavigation 以維持現有 API
 */
export default function Navigation() {
  return <OptimizedNavigation />
}
