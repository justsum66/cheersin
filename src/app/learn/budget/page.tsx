'use client'
/** R2-393：預算推薦 — 價位區間→酒款列表（靜態） */
import Link from 'next/link'
import { ChevronLeft, Wallet } from 'lucide-react'

const BUDGETS = [
  { range: '500 元以下', examples: '智利 Casillero、超市精選、國產啤酒' },
  { range: '500–1500 元', examples: '紐西蘭長相思、西班牙 Cava、日本普通酒' },
  { range: '1500–3000 元', examples: '波爾多中級酒莊、勃艮第村級、單一麥芽入門' },
  { range: '3000 元以上', examples: '名莊正牌、頂級清酒、年份香檳' },
]

export default function BudgetPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Wallet className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">預算推薦</h1>
          <p className="text-white/60 text-sm">依價位區間選酒</p>
        </div>
      </div>
      <ul className="space-y-4">
        {BUDGETS.map((b) => (
          <li key={b.range} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium text-white">{b.range}</h3>
            <p className="text-white/70 text-sm mt-1">{b.examples}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
