'use client'
/** R2-395：酒標解讀 — 教學內容+各國酒標範例 */
import Link from 'next/link'
import { ChevronLeft, Tag } from 'lucide-react'

export default function LabelReadPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Tag className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">酒標解讀</h1>
          <p className="text-white/60 text-sm">各國酒標欄位說明與範例</p>
        </div>
      </div>
      <div className="space-y-4 text-white/80 text-sm">
        <p>酒標常見欄位：產區、品種、年份、酒精濃度、容量、酒莊名。法國 AOC、義大利 DOC/DOCG、新世界標示方式各有差異。建議搭配「酒標一眼看懂」課程學習。</p>
      </div>
      <Link href="/learn" className="mt-4 inline-block px-4 py-2 rounded-xl bg-primary-500/20 text-primary-300 text-sm font-medium">前往課程</Link>
    </div>
  )
}
