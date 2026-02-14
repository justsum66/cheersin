'use client'
/** R2-398：儲酒指南 — 靜態教學 */
import Link from 'next/link'
import { ChevronLeft, Package } from 'lucide-react'

export default function StoragePage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Package className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">儲酒指南</h1>
          <p className="text-white/60 text-sm">溫度、光線、濕度與擺放</p>
        </div>
      </div>
      <ul className="space-y-3 text-white/80 text-sm">
        <li>• 恆溫：約 12–18°C，避免劇烈變化</li>
        <li>• 避光：紫外線會加速老化</li>
        <li>• 橫放：軟木塞保持濕潤</li>
        <li>• 靜置：避免震動</li>
      </ul>
    </div>
  )
}
