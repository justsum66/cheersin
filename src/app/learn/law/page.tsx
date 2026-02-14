'use client'
/** R2-399：酒類法規 — 台灣法規與年齡限制 */
import Link from 'next/link'
import { ChevronLeft, Scale } from 'lucide-react'

export default function LawPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Scale className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">酒類法規</h1>
          <p className="text-white/60 text-sm">台灣法規與年齡限制</p>
        </div>
      </div>
      <ul className="space-y-3 text-white/80 text-sm">
        <li>• 法定飲酒年齡：台灣 18 歲</li>
        <li>• 酒駕標準：吐氣酒精濃度 0.15 mg/L</li>
        <li>• 酒類販售與廣告受菸酒管理法規範</li>
        <li>• 產區與標示規定依各國法規（如 AOC、DOC）</li>
      </ul>
    </div>
  )
}
