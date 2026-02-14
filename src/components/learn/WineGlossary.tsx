import React, { useState } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Volume2, ExternalLink, Filter } from 'lucide-react'
import { TERM_MAP, FRENCH_TERMS } from '@/lib/learn-terms'

interface TermItem {
  term: string
  definition: string
  pronunciation?: string
  category: string
  examples?: string[]
}

const WINE_TERMS: TermItem[] = [
  // 基礎概念
  {
    term: '風土',
    definition: '葡萄生長環境的總稱，包含土壤、氣候、地形等因素，決定葡萄酒的獨特風格',
    pronunciation: '/fəŋ tu/',
    category: '基礎概念',
    examples: ['波爾多左岸的 gravel 風土', '勃根地的石灰岩風土']
  },
  {
    term: '單寧',
    definition: '存在於葡萄皮、籽、梗中的多酚化合物，提供紅酒的結構與澀感',
    pronunciation: '/ˈtænɪn/',
    category: '釀造要素',
    examples: ['黑皮諾單寧較細緻', '赤霞珠單寧較強勁']
  },
  {
    term: '發酵',
    definition: '酵母將葡萄糖分轉化為酒精與二氧化碳的生物化學過程',
    pronunciation: '/fəˈrɛntəɪzɪs/',
    category: '釀造要素',
    examples: ['酒精發酵產生酒精', '乳酸發酵柔化酸度']
  },
  {
    term: '酒體',
    definition: '葡萄酒在口中的重量感與濃稠度，分為輕盈、中等、飽滿',
    pronunciation: '/bɒdɪ/',
    category: '品鑑要素',
    examples: ['黑皮諾酒體輕盈', '霞多麗酒體飽滿']
  },
  {
    term: '酸度',
    definition: '葡萄酒中天然存在的酸性物質，提供清新感與結構',
    pronunciation: '/æˈsɪdɪti/',
    category: '品鑑要素',
    examples: ['雷司令酸度明亮', '夏多內酸度平衡']
  },
  
  // 葡萄品種
  {
    term: 'Cabernet Sauvignon',
    definition: '世界最知名的紅葡萄品種，高單寧、高酸度，帶黑醋栗與薄荷香氣',
    pronunciation: 'ka-ber-NAY soh-veen-YOHN',
    category: '紅葡萄品種',
    examples: ['波爾多混釀主力', '納帕谷表現出色']
  },
  {
    term: 'Pinot Noir',
    definition: '黑皮諾，對氣候敏感的精緻紅葡萄，香氣複雜，單寧細緻',
    pronunciation: 'PEE-noh NWAHR',
    category: '紅葡萄品種',
    examples: ['勃根地代表性品種', '俄勒岡州表現優異']
  },
  {
    term: 'Chardonnay',
    definition: '世界最知名的白葡萄品種，可塑性強，風格多變',
    pronunciation: 'shar-doh-NAY',
    category: '白葡萄品種',
    examples: ['香檳基酒', '加州經橡木桶風格']
  },
  {
    term: 'Sauvignon Blanc',
    definition: '長相思，香氣奔放的白葡萄，帶青草、柑橘類香氣',
    pronunciation: 'soh-veen-YOHN BLAHN',
    category: '白葡萄品種',
    examples: ['紐西蘭馬爾堡特色', '法國盧瓦爾河風格']
  },
  
  // 產區相關
  {
    term: 'Bordeaux',
    definition: '法國波爾多，世界知名葡萄酒產區，以混釀紅酒聞名',
    pronunciation: '/bɔːrˈdoʊ/',
    category: '產區',
    examples: ['左岸以赤霞珠為主', '右岸以梅洛為主']
  },
  {
    term: 'Burgundy',
    definition: '法國勃根地，以黑皮諾和夏多內單一品種釀造聞名',
    pronunciation: '/ˈbɜːrɡəndi/',
    category: '產區',
    examples: ['特級園(GC)最高等級', '村莊級入門選擇']
  },
  {
    term: 'Napa Valley',
    definition: '美國加州納帕谷，以優質赤霞珠和霞多麗聞名',
    category: '產區',
    examples: ['膜拜酒(Cult Wine)發源地', '高端酒款集中地']
  },
  
  // 釀造工藝
  {
    term: '橡木桶',
    definition: '用於陳釀葡萄酒的木桶，可賦予香草、煙燻等風味',
    pronunciation: '/ˈbɑːrɪk ˈoʊk/',
    category: '釀造工藝',
    examples: ['法國橡木桶較細緻', '美國橡木桶香氣奔放']
  },
  {
    term: '陳年',
    definition: '葡萄酒在瓶中或桶中繼續發展熟成的過程',
    pronunciation: '/ˈædʒɪŋ/',
    category: '釀造工藝',
    examples: ['紅酒通常可陳年更久', '白酒多數適飲期較短']
  },
  {
    term: '醒酒',
    definition: '將葡萄酒倒入醒酒器中接觸空氣，讓香氣釋放',
    pronunciation: '/ˈdɪkeɪtɪŋ/',
    category: '品飲技巧',
    examples: ['年輕酒款需要醒酒', '老酒醒酒時間需謹慎']
  },
  
  // 品酒術語
  {
    term: '餘韻',
    definition: '吞嚥後香氣與味道在口中持續的時間',
    pronunciation: '/ˈæftərˌteɪst/',
    category: '品鑑要素',
    examples: ['長餘韻表示品質佳', '短餘韻可能結構不夠']
  },
  {
    term: '複雜度',
    definition: '葡萄酒香氣層次的豐富程度，包含果香、花香、香料等',
    category: '品鑑要素',
    examples: ['複雜度高的酒層次豐富', '簡單的酒香氣單一']
  },
  {
    term: '平衡感',
    definition: '酸度、單寧、酒精、甜度等要素的和諧統一',
    category: '品鑑要素',
    examples: ['平衡感佳的酒口感和諧', '不平衡的酒會有突兀感']
  }
]

export function WineGlossary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedTerm, setSelectedTerm] = useState<TermItem | null>(null)
  
  const categories = ['全部', '基礎概念', '釀造要素', '品鑑要素', '葡萄品種', '產區', '釀造工藝', '品飲技巧']
  
  const filteredTerms = WINE_TERMS.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || term.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 標題區域 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full mb-4">
          <BookOpen className="w-5 h-5 text-rose-400" />
          <span className="text-rose-400 font-medium">葡萄酒專業術語詞彙表</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Wine Glossary
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          掌握專業術語，提升品酒理解力。每一個詞彙都包含中英文對照、發音指導與實際應用範例。
        </p>
      </m.div>

      {/* 搜尋與篩選 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜尋術語或定義..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </m.div>

      {/* 統計資訊 */}
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-6 text-sm text-white/60"
      >
        <span>找到 {filteredTerms.length} 個術語</span>
        <span>總計 {WINE_TERMS.length} 個術語</span>
      </m.div>

      {/* 詞彙列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredTerms.map((term, index) => (
            <m.div
              key={term.term}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-rose-500/30 cursor-pointer transition-all duration-300"
              onClick={() => setSelectedTerm(term)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">{term.term}</h3>
                <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-full">
                  {term.category}
                </span>
              </div>
              
              <p className="text-white/70 text-sm mb-3 line-clamp-2">
                {term.definition}
              </p>
              
              {term.pronunciation && (
                <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                  <Volume2 className="w-3 h-3" />
                  <span>發音：{term.pronunciation}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-400 font-medium">點擊查看詳情</span>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 詳細資訊彈窗 */}
      <AnimatePresence>
        {selectedTerm && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTerm.term}</h2>
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-sm">
                    {selectedTerm.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedTerm.pronunciation && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-5 h-5 text-rose-400" />
                    <span className="text-white/80 font-medium">發音指導</span>
                  </div>
                  <p className="text-white text-lg font-mono">{selectedTerm.pronunciation}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rose-400" />
                  定義說明
                </h3>
                <p className="text-white/80 leading-relaxed">{selectedTerm.definition}</p>
              </div>

              {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    實際應用
                  </h3>
                  <ul className="space-y-2">
                    {selectedTerm.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 mt-1">•</span>
                        <span className="text-white/80">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 相關術語 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">相關術語</h3>
                <div className="flex flex-wrap gap-2">
                  {WINE_TERMS
                    .filter(t => t.category === selectedTerm.category && t.term !== selectedTerm.term)
                    .slice(0, 5)
                    .map(term => (
                      <button
                        key={term.term}
                        onClick={() => setSelectedTerm(term)}
                        className="px-3 py-1 bg-white/10 hover:bg-rose-500/20 text-white/80 hover:text-rose-400 rounded-full text-sm transition-colors"
                      >
                        {term.term}
                      </button>
                    ))
                  }
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}