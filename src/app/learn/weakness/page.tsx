'use client'

/**
 * P2.B1.3 弱項診斷：根據錯題分析，顯示需加強的課程/章節
 */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, AlertCircle, BookOpen } from 'lucide-react'
import { loadWrongAnswers, type WrongAnswer } from '@/lib/wrong-answers'

export default function LearnWeaknessPage() {
  const [wrongs, setWrongs] = useState<WrongAnswer[]>([])

  useEffect(() => {
    setWrongs(loadWrongAnswers())
  }, [])

  const byCourse = wrongs.reduce((acc, w) => {
    const key = w.courseId
    if (!acc[key]) acc[key] = { courseTitle: w.courseTitle, items: [] }
    acc[key].items.push(w)
    return acc
  }, {} as Record<string, { courseTitle: string; items: WrongAnswer[] }>)

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <AlertCircle className="w-7 h-7 text-amber-400" />
          弱項診斷
        </h1>
        <p className="text-white/60 text-sm mb-8">
          根據錯題本分析，建議加強以下課程與章節。
        </p>

        {wrongs.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-white/5 border border-white/10">
            <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">尚無錯題記錄</p>
            <p className="text-white/40 text-sm mt-1">完成課程測驗後，答錯的題目會出現在這裡</p>
            <Link href="/learn" className="inline-block mt-4 text-primary-400 hover:underline text-sm">返回課程總覽</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byCourse).map(([courseId, { courseTitle, items }]) => (
              <div key={courseId} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Link href={`/learn/${courseId}`} className="font-semibold text-white hover:text-primary-300 flex items-center gap-1">
                  {courseTitle}
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </Link>
                <p className="text-white/50 text-xs mt-1">錯題數：{items.length}</p>
                <ul className="mt-2 space-y-1 text-sm text-white/70">
                  {items.slice(0, 5).map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-400 shrink-0">•</span>
                      <span className="line-clamp-2">{w.chapterTitle}：{w.question}</span>
                    </li>
                  ))}
                </ul>
                {items.length > 5 && <p className="text-white/40 text-xs mt-1">其餘 {items.length - 5} 題…</p>}
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-white/40 text-sm">
          <Link href="/learn" className="text-primary-400 hover:underline flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            返回課程總覽
          </Link>
        </p>
      </div>
    </div>
  )
}
