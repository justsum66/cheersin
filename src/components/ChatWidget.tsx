'use client'

/**
 * P2-408：AI 聊天機器人 Widget — 右下角浮動按鈕，點擊進入 /assistant
 */
import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export function ChatWidget() {
  const [visible] = useState(true)
  if (!visible) return null
  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6" aria-label="開啟 AI 侍酒師">
      <Link
        href="/assistant"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-[#0a0a1a]"
        title="AI 侍酒師"
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </Link>
    </div>
  )
}
