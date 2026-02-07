'use client'

import { useEffect } from 'react'
import { useNavVisibility } from '@/contexts/NavVisibilityContext'
import { usePathname } from 'next/navigation'

/** 93 遊戲進行中：隱藏導航時移除 main 頂部 padding，最大化解戲區域 */
export default function NavHiddenEffect() {
  const pathname = usePathname()
  const navVisibility = useNavVisibility()
  const hideForGame = pathname === '/games' && navVisibility?.hideForGame

  useEffect(() => {
    document.documentElement.dataset.navHidden = hideForGame ? '1' : '0'
  }, [hideForGame])

  return null
}
