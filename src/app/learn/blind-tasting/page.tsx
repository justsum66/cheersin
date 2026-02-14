'use client'
/** R2-394：盲品練習 — 多步驟流程（看/聞/嘗→選項）；可接題目 API */
import Link from 'next/link'
import { ChevronLeft, Eye } from 'lucide-react'

export default function BlindTastingPage() {
  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"><ChevronLeft className="w-4 h-4" /> 返回品酒學院</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Eye className="w-6 h-6 text-primary-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">盲品練習</h1>
          <p className="text-white/60 text-sm">看、聞、嘗→選項辨識，鍛鍊感官</p>
        </div>
      </div>
      <p className="text-white/70 text-sm">建議先完成「品飲筆記與盲飲」「CMS 演繹品飲法」等課程後再進行盲品實戰。可至課程頁進行章節測驗與品飲筆記練習。</p>
      <Link href="/learn" className="mt-4 inline-block px-4 py-2 rounded-xl bg-primary-500/20 text-primary-300 text-sm font-medium">前往課程</Link>
    </div>
  )
}
