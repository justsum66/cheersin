'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, HelpCircle, Wine, Droplets, BookOpen, Layers, Search } from 'lucide-react'
import KnowledgeCardFlip from '@/components/learn/ui/KnowledgeCardFlip'
import { WineKnowledgeDataLoader, useWineKnowledgePromise } from '@/components/learn/data/WineKnowledgeWithUse'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'

type KnowledgeFilter = 'all' | 'faq' | 'glass' | 'decanting' | 'tips'

interface WineKnowledgeData {
  meta: string
  faq: { q: string; a: string }[]
  glassGuide: { category: string; glass: string }[]
  decanting: { title: string; content: string }[]
  tastingTips: string[]
}

/** 146–149 酒類知識：使用 use() 解包 Promise，簡化 async 邏輯 */
function WineKnowledgeContent() {
  const promise = useWineKnowledgePromise()
  return (
    <ErrorBoundaryBlock blockName="酒類知識">
      <Suspense fallback={<KnowledgeLoadingSkeleton />}>
        <WineKnowledgeDataLoader promise={promise}>
          {(data) => <WineKnowledgeInner data={data} />}
        </WineKnowledgeDataLoader>
      </Suspense>
    </ErrorBoundaryBlock>
  )
}

function KnowledgeLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="載入中">
      <div className="h-8 w-3/4 rounded-lg bg-white/10" />
      <div className="space-y-4">
        <div className="h-6 w-1/3 rounded bg-white/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}

function WineKnowledgeInner({ data }: { data: WineKnowledgeData | null }) {
  const [sectionFilter, setSectionFilter] = useState<KnowledgeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const q = searchQuery.trim().toLowerCase()
  const filteredData = useMemo(() => {
    if (!data) return null
    if (!q) return data
    const match = (s: string) => s.toLowerCase().includes(q)
    return {
      ...data,
      faq: data.faq?.filter((x) => match(x.q) || match(x.a)) ?? [],
      glassGuide: data.glassGuide?.filter((x) => match(x.category) || match(x.glass)) ?? [],
      decanting: data.decanting?.filter((x) => match(x.title) || match(x.content)) ?? [],
      tastingTips: data.tastingTips?.filter((t) => match(t)) ?? [],
    }
  }, [data, q])

  if (!data) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
        <p className="text-white/70 mb-2">無法載入知識內容</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-[48px] px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm"
        >
          重新載入
        </button>
      </div>
    )
  }

  return (
          <div className="space-y-10">
            {/* 70 知識搜尋 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋知識內容..."
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                aria-label="搜尋知識"
              />
            </div>
            {/* 69 知識分類篩選：捲動至區塊 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'all' as const, label: '全部' },
                { id: 'faq' as const, label: 'FAQ' },
                { id: 'glass' as const, label: '酒杯' },
                { id: 'decanting' as const, label: '醒酒' },
                { id: 'tips' as const, label: '技巧' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSectionFilter(id)
                    if (id !== 'all') {
                      const el = document.getElementById(`knowledge-${id}`)
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    sectionFilter === id ? 'bg-primary-500/30 border border-primary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                  }`}
                  aria-pressed={sectionFilter === id}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 156 知識卡片：FAQ 翻面卡；70 搜尋篩選 */}
            {(sectionFilter === 'all' || sectionFilter === 'faq') && filteredData?.faq && filteredData.faq.length > 0 && (
              <section id="knowledge-faq">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                  <Layers className="w-5 h-5 text-primary-400" />
                  知識卡片
                </h2>
                <p className="text-white/50 text-sm mb-4">點擊卡片翻面查看答案</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredData.faq.map((item, i) => (
                    <KnowledgeCardFlip key={i} front={item.q} back={item.a} />
                  ))}
                </div>
              </section>
            )}

            {/* 146 FAQ */}
            {(sectionFilter === 'all' || sectionFilter === 'faq') && filteredData?.faq && filteredData.faq.length > 0 && (
              <section id="knowledge-faq-detail">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                  <HelpCircle className="w-5 h-5 text-primary-400" />
                  常見問題 FAQ
                </h2>
                <div className="space-y-4">
                  {filteredData.faq.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/5 border border-white/10 p-4"
                    >
                      <p className="font-medium text-white mb-2">{item.q}</p>
                      <p className="text-white/70 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 148 酒杯指南 */}
            {(sectionFilter === 'all' || sectionFilter === 'glass') && filteredData?.glassGuide && filteredData.glassGuide.length > 0 && (
              <section id="knowledge-glass">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                  <Wine className="w-5 h-5 text-primary-400" />
                  酒杯選擇指南
                </h2>
                <div className="space-y-3">
                  {filteredData.glassGuide.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/5 border border-white/10 p-4"
                    >
                      <p className="font-medium text-primary-300 text-sm mb-1">{item.category}</p>
                      <p className="text-white/70 text-sm">{item.glass}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 149 醒酒建議 */}
            {(sectionFilter === 'all' || sectionFilter === 'decanting') && filteredData?.decanting && filteredData.decanting.length > 0 && (
              <section id="knowledge-decanting">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                  <Droplets className="w-5 h-5 text-primary-400" />
                  醒酒建議
                </h2>
                <div className="space-y-3">
                  {filteredData.decanting.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/5 border border-white/10 p-4"
                    >
                      <p className="font-medium text-white text-sm mb-1">{item.title}</p>
                      <p className="text-white/70 text-sm">{item.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 147 品酒技巧 */}
            {(sectionFilter === 'all' || sectionFilter === 'tips') && filteredData?.tastingTips && filteredData.tastingTips.length > 0 && (
              <section id="knowledge-tips">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                  品酒技巧（系統化品鑑）
                </h2>
                <ul className="space-y-2">
                  {filteredData.tastingTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-white/70 text-sm"
                    >
                      <span className="text-primary-400 font-medium shrink-0">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {q && filteredData && [filteredData.faq, filteredData.glassGuide, filteredData.decanting, filteredData.tastingTips].every((arr) => !arr?.length) && (
              <p className="text-white/50 text-sm py-8 text-center">找不到符合「{searchQuery}」的內容</p>
            )}
          </div>
  )
}

/** 146–149 酒類知識頁：use() + Error Boundary */
export default function WineKnowledgePage() {
  return (
    <main id="learn-main" className="min-h-screen px-4 pt-0 pb-16 safe-area-px safe-area-pb" tabIndex={-1} role="main" aria-label="酒類知識">
      <div className="max-w-3xl mx-auto px-2 sm:px-0">
        <Link
          href="/learn"
          className="min-h-[48px] min-w-[48px] inline-flex items-center gap-1 text-white/60 hover:text-white mb-6 games-focus-ring rounded"
        >
          <ChevronLeft className="w-5 h-5" />
          返回學堂
        </Link>

        <h1 className="text-3xl font-display font-bold text-white mb-2">酒類知識</h1>
        <p className="text-white/50 text-sm mb-4">
          WSET Level 4 Diploma · CMS Certified Sommelier Advanced · Master of Wine (MW) 綜合等級
        </p>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-8">
          <p className="text-white/60 text-sm leading-relaxed">
            <strong className="text-white/80">WSET</strong>（Wine & Spirit Education Trust）英國葡萄酒與烈酒基金會，為國際認可的酒類教育機構。
            <strong className="text-white/80 ml-1">CMS</strong>（Court of Master Sommeliers）侍酒師大師公會，以侍酒服務與盲品聞名。
            <strong className="text-white/80 ml-1">MW</strong>（Master of Wine）葡萄酒大師為酒界最高認證之一。本頁內容綜合上述體系基礎知識。
          </p>
        </div>

        <WineKnowledgeContent />

        <div className="mt-10 text-center space-y-3">
          <Link
            href="/assistant"
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
          >
            向 AI 侍酒師提問
          </Link>
          <p className="text-white/50 text-sm">
            想找台灣在地酒款？<Link href="/assistant" className="text-primary-400 hover:text-primary-300 ml-1">到 AI 侍酒師</Link> 詢問推薦
          </p>
        </div>
      </div>
    </main>
  )
}
