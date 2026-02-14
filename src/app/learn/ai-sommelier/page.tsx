'use client'
/** R2-400：AI 品酒助手 — 口感描述→推薦酒款；接現有 /assistant 與 /api/recommend */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, MessageCircle, Send } from 'lucide-react'

export default function AISommelierPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim() || '根據我的口感偏好推薦酒款'
    router.push(`/assistant?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI 品酒助手</h1>
          <p className="text-white/60 text-sm">描述口感偏好，獲得酒款推薦</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例：喜歡果香、不喜歡太澀、預算約 1000 元…"
          rows={3}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm resize-y"
        />
        <button
          type="submit"
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-300 font-medium hover:bg-primary-500/30 transition-colors"
        >
          <Send className="w-5 h-5" /> 前往 AI 侍酒師
        </button>
      </form>
      <p className="mt-4 text-white/50 text-xs">將帶您至 AI 侍酒師頁面，依您的描述進行對話推薦。</p>
    </div>
  )
}
