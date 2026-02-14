'use client'

import { useState } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface KeywordSummaryProps {
  keywords: string[]
  chapterTitle: string
  className?: string
}

/**
 * Phase 2 A1.2: 關鍵詞摘要卡
 * 每章節末顯示本章關鍵詞，方便複習
 */
export function KeywordSummary({ keywords, chapterTitle, className = '' }: KeywordSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!keywords || keywords.length === 0) return null

  return (
    <m.div 
      className={`rounded-xl border border-white/10 bg-gradient-to-br from-primary-500/5 to-accent-500/5 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <BookOpen className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-left">
            <p className="text-white/90 text-sm font-medium">本章關鍵詞</p>
            <p className="text-white/50 text-xs">{keywords.length} 個重點概念</p>
          </div>
        </div>
        <m.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white/40" />
        </m.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, idx) => (
                  <m.span
                    key={keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 hover:border-primary-500/30 transition-colors cursor-default"
                  >
                    {keyword}
                  </m.span>
                ))}
              </div>
              <p className="mt-3 text-white/40 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                掌握這些關鍵詞，複習更有效率
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

/**
 * 從課程內容中提取關鍵詞
 * 尋找括號內的英文術語、專有名詞等
 */
export function extractKeywords(content: string): string[] {
  const keywords = new Set<string>()
  
  // Match patterns like: 詞彙（English）, 術語/Term
  const patterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g, // Capitalized words
    /（([A-Za-z\s]+)）/g, // Chinese parentheses
    /\(([A-Za-z\s]+)\)/g, // English parentheses
  ]
  
  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const term = (match[1] || match[0]).trim()
      if (term.length >= 3 && term.length <= 30) {
        keywords.add(term)
      }
    }
  })
  
  // Also extract common wine terms
  const wineTerms = [
    'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Chardonnay', 'Sauvignon Blanc',
    'Riesling', 'Syrah', 'Shiraz', 'Tempranillo', 'Sangiovese', 'Nebbiolo',
    'Terroir', 'Appellation', 'Vintage', 'Cru', 'Grand Cru', 'Premier Cru',
    'Tannin', 'Acidity', 'Body', 'Finish', 'Bouquet', 'Nose',
    'Decant', 'Aeration', 'Sediment', 'Cork', 'Sommelier',
  ]
  
  wineTerms.forEach(term => {
    if (content.toLowerCase().includes(term.toLowerCase())) {
      keywords.add(term)
    }
  })
  
  return Array.from(keywords).slice(0, 10) // Limit to 10 keywords
}
