'use client'

/**
 * P2.B1.2 知識圖譜：課程間關聯性視覺化，完成某課後可接續的課程
 */
import Link from 'next/link'
import { ChevronLeft, Network, ArrowRight } from 'lucide-react'

const KNOWLEDGE_MAP: Record<string, { title: string; next: { id: string; title: string }[] }> = {
  'wine-basics': {
    title: '葡萄酒入門',
    next: [
      { id: 'white-wine', title: '白酒探索' },
      { id: 'wine-advanced', title: '葡萄酒進階' },
      { id: 'tasting-notes', title: '品飲筆記與盲飲' },
    ],
  },
  'white-wine': {
    title: '白酒探索',
    next: [
      { id: 'champagne-sparkling', title: '氣泡酒與香檳' },
      { id: 'wine-pairing', title: '餐酒搭配進階' },
    ],
  },
  'whisky-101': {
    title: '威士忌基礎',
    next: [
      { id: 'whisky-single-malt', title: '單一麥芽威士忌' },
      { id: 'brandy-cognac', title: '白蘭地與干邑' },
    ],
  },
  'wine-advanced': {
    title: '葡萄酒進階',
    next: [
      { id: 'wset-l2-wines', title: 'WSET L2 葡萄酒產區' },
      { id: 'bordeaux-deep', title: '產區深度：波爾多' },
    ],
  },
  'sake-intro': {
    title: '清酒之道',
    next: [{ id: 'sake-advanced', title: '清酒進階' }],
  },
  'cocktail-basics': {
    title: '調酒基礎',
    next: [
      { id: 'cocktail-classics', title: '經典調酒實作' },
      { id: 'home-bar', title: '居家酒吧入門' },
    ],
  },
}

export default function LearnKnowledgeMapPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Network className="w-7 h-7 text-primary-400" />
          知識圖譜
        </h1>
        <p className="text-white/60 text-sm mb-8">
          課程間關聯：完成一門課後可接續的推薦課程。
        </p>

        <div className="space-y-6">
          {Object.entries(KNOWLEDGE_MAP).map(([courseId, { title, next }]) => (
            <div
              key={courseId}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <Link
                href={`/learn/${courseId}`}
                className="font-semibold text-primary-300 hover:text-primary-200"
              >
                {title}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {next.map((n, i) => (
                  <span key={n.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-white/40">·</span>}
                    <Link
                      href={`/learn/${n.id}`}
                      className="text-white/70 hover:text-white flex items-center gap-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-white/50" />
                      {n.title}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

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
