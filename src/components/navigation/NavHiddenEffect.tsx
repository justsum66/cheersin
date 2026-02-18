'use client'

import { useEffect } from 'react'
import { useNavVisibility } from '@/contexts/NavVisibilityContext'
import { usePathname } from 'next/navigation'

/** NAV-018：遊戲進行中隱藏導航；離開 /games 時確保 nav 恢復可見 */
export default function NavHiddenEffect() {
  const pathname = usePathname()
  const navVisibility = useNavVisibility()
  const isGamesPage = pathname === '/games' || pathname.startsWith('/games/')
  const hideForGame = isGamesPage && navVisibility?.hideForGame

  useEffect(() => {
    document.documentElement.dataset.navHidden = hideForGame ? '1' : '0'
  }, [hideForGame])

  // NAV-018: Reset hideForGame when navigating away from games pages
  useEffect(() => {
    if (!isGamesPage && navVisibility?.hideForGame) {
      navVisibility.setHideForGame?.(false)
    }
  }, [isGamesPage, navVisibility])

  return null
}
