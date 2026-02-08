'use client'

/** P3-417：詞彙表 (Glossary) — 品酒術語，點擊可看解釋 */
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Search } from 'lucide-react'

interface Term {
  term: string
  en?: string
  definition: string
  category: 'wine' | 'spirit' | 'beer' | 'sake' | 'general'
}

const CATEGORY_LABEL: Record<Term['category'], string> = {
  wine: '葡萄酒',
  spirit: '烈酒',
  beer: '啤酒',
  sake: '清酒',
  general: '通用',
}

const GLOSSARY_TERMS: Term[] = [
  { term: '單寧', en: 'Tannin', definition: '來自葡萄皮、籽與梗的多酚，帶來澀感與結構感；紅酒中較明顯。', category: 'wine' },
  { term: '酒體', en: 'Body', definition: '酒在口中的重量感與飽滿度，常分輕、中、重。', category: 'wine' },
  { term: '餘韻', en: 'Finish', definition: '吞下或吐掉酒液後，香氣與滋味在口中停留的時間與變化。', category: 'general' },
  { term: '風土', en: 'Terroir', definition: '產區的土壤、氣候、地形等對酒款風味的綜合影響。', category: 'wine' },
  { term: '年份', en: 'Vintage', definition: '葡萄採收的年份；影響該年酒的風格與陳年潛力。', category: 'wine' },
  { term: '精米步合', en: 'Rice polishing ratio', definition: '清酒米磨掉外層後剩餘的比例；數值愈低通常愈精緻。', category: 'sake' },
  { term: '大吟釀', en: 'Daiginjo', definition: '精米步合 50% 以下的清酒，香氣細緻、口感清爽。', category: 'sake' },
  { term: '純米酒', en: 'Junmai', definition: '不添加釀造酒精，僅以米、麴、水釀造的清酒。', category: 'sake' },
  { term: '單一麥芽', en: 'Single Malt', definition: '單一麥芽威士忌，來自單一蒸餾廠、僅用大麥麥芽。', category: 'spirit' },
  { term: '泥煤', en: 'Peat', definition: '烘麥時使用泥煤煙燻，賦予威士忌煙燻、碘味等風味。', category: 'spirit' },
  { term: '桶陳', en: 'Cask aging', definition: '酒在橡木桶中陳年，吸收木桶風味並發展香氣與口感。', category: 'general' },
  { term: '干型', en: 'Dry', definition: '殘糖低、不甜；與「甜型」相對。', category: 'wine' },
  { term: 'IPA', en: 'India Pale Ale', definition: '啤酒風格之一，苦度與啤酒花香氣較明顯。', category: 'beer' },
  { term: '拉格', en: 'Lager', definition: '底層發酵、低溫儲存，口感清爽的啤酒類型。', category: 'beer' },
  { term: '艾爾', en: 'Ale', definition: '頂層發酵、常帶果香與麥香的啤酒類型。', category: 'beer' },
]

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Term['category'] | 'all'>('all')

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return GLOSSARY_TERMS.filter((t) => {
      const matchSearch = !q || t.term.toLowerCase().includes(q) ||
        (t.en?.toLowerCase().includes(q)) || t.definition.toLowerCase().includes(q)
      const matchCat = categoryFilter === 'all' || t.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [searchQuery, categoryFilter])

  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-4xl mx-auto">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        返回品酒學院
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-10 h-10 text-primary-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-white">品酒詞彙表</h1>
          <p className="text-white/60 text-sm">常見術語與簡要解釋</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋術語…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 games-focus-ring"
            aria-label="搜尋詞彙"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Term['category'] | 'all')}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white games-focus-ring min-w-[140px]"
          aria-label="依類別篩選"
        >
          <option value="all">全部類別</option>
          {(Object.keys(CATEGORY_LABEL) as Term['category'][]).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
      </div>

      <ul className="space-y-4" role="list" aria-label="詞彙列表">
        {filtered.length === 0 ? (
          <li className="text-white/50 py-8 text-center">找不到符合的術語，試試其他關鍵字或類別</li>
        ) : (
          filtered.map((t) => (
            <li
              key={t.term}
              className="rounded-xl bg-white/5 border border-white/10 p-4 text-left"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold text-white">{t.term}</span>
                {t.en && <span className="text-white/50 text-sm">{t.en}</span>}
                <span className="text-primary-400/80 text-xs">{CATEGORY_LABEL[t.category]}</span>
              </div>
              <p className="mt-2 text-white/80 text-sm leading-relaxed">{t.definition}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
