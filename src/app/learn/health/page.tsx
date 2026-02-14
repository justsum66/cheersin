'use client'
/** R2-396：健康飲酒 — 負責任飲酒、建議 */
import Link from 'next/link'
import { ChevronLeft, Heart } from 'lucide-react'

export default function HealthPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Heart className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">健康飲酒</h1>
          <p className="text-white/60 text-sm">負責任飲酒與建議</p>
        </div>
      </div>
      <ul className="space-y-3 text-white/80 text-sm">
        <li>• 適量飲酒：建議男性每日不超過 2 單位、女性 1 單位（1 單位約 10g 酒精）</li>
        <li>• 不酒駕、懷孕不飲酒</li>
        <li>• 搭配餐點、補充水分</li>
        <li>• 未成年禁止飲酒；台灣法定飲酒年齡 18 歲</li>
      </ul>
    </div>
  )
}
