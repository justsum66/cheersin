'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Volume2, ExternalLink, Filter } from 'lucide-react';

interface BeerCiderTerm {
  id: string;
  term: string;
  english: string;
  category: string;
  definition: string;
  pronunciation: string;
  example: string;
  origin: string;
  complexity: '初級' | '中級' | '高級';
  usage: string;
  relatedTerms: string[];
}

const BEER_CIDER_TERMS: BeerCiderTerm[] = [
  {
    id: 'ale',
    term: '艾爾啤酒',
    english: 'Ale',
    category: '類型',
    definition: '使用頂端發酵酵母，在較溫暖溫度下发酵的啤酒類型，通常口感較為濃郁。',
    pronunciation: '/eɪl/',
    example: '印度淡色艾爾(IPA)、波特啤酒、司陶特',
    origin: '英國',
    complexity: '初級',
    usage: '形容使用頂端發酵酵母釀造的啤酒',
    relatedTerms: ['lager', 'fermentation', 'yeast']
  },
  {
    id: 'lager',
    term: '拉格啤酒',
    english: 'Lager',
    category: '類型',
    definition: '使用底部發酵酵母，在較低溫度下发酵的啤酒類型，通常口感較清爽乾淨。',
    pronunciation: '/ˈlɑːɡər/',
    example: '德國啤酒、美國淡色拉格、捷克皮爾森',
    origin: '德國',
    complexity: '初級',
    usage: '形容使用底部發酵酵母釀造的啤酒',
    relatedTerms: ['ale', 'pilsner', 'bock']
  },
  {
    id: 'ipa',
    term: '印度淡色艾爾',
    english: 'India Pale Ale',
    category: '類型',
    definition: '一種高度酒花的艾爾啤酒，最初為了長途運輸而添加更多酒花以防腐。',
    pronunciation: '/ˌaɪ piː ˈeɪ/',
    example: '美式IPA、英式IPA、雙倍IPA',
    origin: '英國',
    complexity: '中級',
    usage: '形容高度苦味和酒花香氣的艾爾啤酒',
    relatedTerms: ['ale', 'hops', 'citrus']
  },
  {
    id: 'hops',
    term: '啤酒花',
    english: 'Hops',
    category: '原料',
    definition: '啤酒的主要成分之一，提供苦味、香氣和防腐作用。',
    pronunciation: '/hɒps/',
    example: '卡斯卡特、世紀、西楚啤酒花',
    origin: '歐洲',
    complexity: '初級',
    usage: '形容用於啤酒釀造的植物香料',
    relatedTerms: ['bitterness', 'aroma', 'alpha-acids']
  },
  {
    id: 'malt',
    term: '麥芽',
    english: 'Malt',
    category: '原料',
    definition: '發芽並烘乾的大麥或其他穀物，提供啤酒的糖分和風味。',
    pronunciation: '/mɔːlt/',
    example: '淡色麥芽、焦糖麥芽、黑麥芽',
    origin: '全球',
    complexity: '初級',
    usage: '形容用於啤酒釀造的糖化原料',
    relatedTerms: ['barley', 'grain', 'sweetness']
  },
  {
    id: 'yeast',
    term: '酵母',
    english: 'Yeast',
    category: '原料',
    definition: '微生物，負責將麥汁中的糖分轉化為酒精和二氧化碳。',
    pronunciation: '/jiːst/',
    example: '艾爾酵母、拉格酵母、野酵母',
    origin: '自然',
    complexity: '初級',
    usage: '形容用於發酵的微生物',
    relatedTerms: ['fermentation', 'alcohol', 'co2']
  },
  {
    id: 'cider',
    term: '蘋果酒',
    english: 'Cider',
    category: '類型',
    definition: '由蘋果汁發酵而成的酒精飲料，口感介於葡萄酒和啤酒之間。',
    pronunciation: '/ˈsaɪdər/',
    example: '英國傳統蘋果酒、法式卡爾瓦多斯、西班牙莎樂普',
    origin: '歐洲',
    complexity: '初級',
    usage: '形容以蘋果為主要原料的發酵酒',
    relatedTerms: ['apple', 'wine', 'fermentation']
  },
  {
    id: 'bitterness',
    term: '苦味值',
    english: 'Bitterness',
    category: '品鑑',
    definition: '衡量啤酒苦味強度的指標，通常以IBU(國際苦味單位)表示。',
    pronunciation: '/ˈbɪtərnəs/',
    example: '淡色艾爾 30-50 IBU，雙倍IPA 100+ IBU',
    origin: '現代釀造',
    complexity: '中級',
    usage: '形容啤酒苦味的量化指標',
    relatedTerms: ['hops', 'ibu', 'balance']
  },
  {
    id: 'attenuation',
    term: '發酵度',
    english: 'Attenuation',
    category: '釀造',
    definition: '衡量酵母發酵能力的指標，表示可發酵糖分的比例。',
    pronunciation: '/əˌtɛnjuˈeɪʃən/',
    example: '高發酵度 80-85%，低發酵度 65-70%',
    origin: '現代釀造',
    complexity: '高級',
    usage: '形容酵母處理糖分的能力',
    relatedTerms: ['fermentation', 'yeast', 'gravity']
  },
  {
    id: 'carbonation',
    term: '碳酸化',
    english: 'Carbonation',
    category: '加工',
    definition: '在啤酒中溶解二氧化碳的過程，影響口感和泡沫穩定性。',
    pronunciation: '/ˌkɑːrbəˈneɪʃən/',
    example: '天然碳酸化、強制碳酸化',
    origin: '現代釀造',
    complexity: '中級',
    usage: '形容啤酒中的二氧化碳含量',
    relatedTerms: ['co2', 'fizziness', 'mouthfeel']
  },
  {
    id: 'mouthfeel',
    term: '口感',
    english: 'Mouthfeel',
    category: '品鑑',
    definition: '啤酒在口中的質感，包括酒體、碳酸化和滑順度等感受。',
    pronunciation: '/ˈmaʊθˌfiːl/',
    example: '厚重、輕盈、奶油般、碳酸感',
    origin: '品酒術語',
    complexity: '中級',
    usage: '形容啤酒的整體口感體驗',
    relatedTerms: ['body', 'texture', 'smoothness']
  },
  {
    id: 'head-retention',
    term: '泡沫保持性',
    english: 'Head Retention',
    category: '品鑑',
    definition: '啤酒泡沫持續的時間，受蛋白質含量和表面張力影響。',
    pronunciation: '/hɛd rɪˈtɛnʃən/',
    example: '小麥啤酒泡沫保持性佳',
    origin: '品酒術語',
    complexity: '中級',
    usage: '形容啤酒泡沫的持久度',
    relatedTerms: ['foam', 'protein', 'lacing']
  },
  {
    id: 'pilsner',
    term: '皮爾森',
    english: 'Pilsner',
    category: '類型',
    definition: '起源於捷克皮爾森市的淡色拉格啤酒，特徵是明顯的酒花苦味和清澈外觀。',
    pronunciation: '/ˈpɪlsnər/',
    example: '捷克皮爾森Urquell、德式皮爾森',
    origin: '捷克',
    complexity: '中級',
    usage: '形容特定風格的淡色拉格啤酒',
    relatedTerms: ['lager', 'pale', 'hoppy']
  },
  {
    id: 'stout',
    term: '司陶特',
    english: 'Stout',
    category: '類型',
    definition: '一種深色艾爾啤酒，通常使用烘烤大麥，具有咖啡和巧克力風味。',
    pronunciation: '/staʊt/',
    example: '愛爾蘭司陶特、牛奶司陶特、燕麥司陶特',
    origin: '愛爾蘭',
    complexity: '中級',
    usage: '形容深色濃郁的艾爾啤酒',
    relatedTerms: ['porter', 'roasted-barley', 'coffee']
  },
  {
    id: 'porter',
    term: '波特啤酒',
    english: 'Porter',
    category: '類型',
    definition: '一種深色艾爾啤酒，比司陶特較輕，具有烘焙麥芽風味。',
    pronunciation: '/ˈpoʊrtər/',
    example: '布朗波特、魯特波特、燕麥波特',
    origin: '英國',
    complexity: '中級',
    usage: '形容深色艾爾啤酒的一種',
    relatedTerms: ['stout', 'brown-ale', 'roasted']
  },
  {
    id: 'sour-beer',
    term: '酸啤酒',
    english: 'Sour Beer',
    category: '類型',
    definition: '使用野生酵母或細菌發酵的啤酒，具有酸味特徵。',
    pronunciation: '/saʊr bɪr/',
    example: '蘭比克、貴族霉菌啤酒、柏林白啤酒',
    origin: '比利時',
    complexity: '高級',
    usage: '形容酸味特徵的啤酒',
    relatedTerms: ['wild-yeast', 'bacteria', 'lambic']
  },
  {
    id: 'dry-hopping',
    term: '乾投酒花',
    english: 'Dry Hopping',
    category: '釀造',
    definition: '在發酵或儲存階段添加酒花，以增強香氣而不增加苦味。',
    pronunciation: '/draɪ ˈhɒpɪŋ/',
    example: 'IPA常用技術',
    origin: '現代釀造',
    complexity: '中級',
    usage: '形容增強香氣的釀造技術',
    relatedTerms: ['hops', 'aroma', 'flavor']
  },
  {
    id: 'original-gravity',
    term: '原始比重',
    english: 'Original Gravity',
    category: '釀造',
    definition: '發酵前麥汁的比重，用於計算最終酒精含量。',
    pronunciation: '/əˈrɪdʒənl ˈɡrævɪti/',
    example: '淡色艾爾 1.040-1.050',
    origin: '釀造科學',
    complexity: '高級',
    usage: '形容發酵前的糖分濃度',
    relatedTerms: ['final-gravity', 'abv', 'extract']
  },
  {
    id: 'abv',
    term: '酒精度',
    english: 'ABV',
    category: '品鑑',
    definition: 'Alcohol By Volume，表示酒精在飲料中的體積百分比。',
    pronunciation: '/ˈeɪ biː ˈviː/',
    example: '普通啤酒 4-6% ABV，烈性艾爾 8%+ ABV',
    origin: '現代標準',
    complexity: '初級',
    usage: '形容酒精含量的標準單位',
    relatedTerms: ['strength', 'proof', 'alc']
  },
  {
    id: 'craft-beer',
    term: '精釀啤酒',
    english: 'Craft Beer',
    category: '類型',
    definition: '由小型獨立釀酒廠生產，注重品質和風味的啤酒。',
    pronunciation: '/kræft bɪr/',
    example: '精釀啤酒廠生產的各種風格',
    origin: '美國',
    complexity: '初級',
    usage: '形容小批量精製的啤酒',
    relatedTerms: ['microbrewery', 'independent', 'quality']
  }
];

export function BeerCiderGlossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTerm, setSelectedTerm] = useState<BeerCiderTerm | null>(null);
  
  // 獲取所有唯一類別
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(BEER_CIDER_TERMS.map(term => term.category))];
    return ['全部', ...uniqueCategories];
  }, []);

  const filteredTerms = useMemo(() => {
    return BEER_CIDER_TERMS.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           term.english.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '全部' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // 根據複雜度分組術語
  const groupedTerms = useMemo(() => {
    return filteredTerms.reduce((acc, term) => {
      if (!acc[term.complexity]) {
        acc[term.complexity] = [];
      }
      acc[term.complexity].push(term);
      return acc;
    }, {} as Record<string, BeerCiderTerm[]>);
  }, [filteredTerms]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 標題區域 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-medium">啤酒與蘋果酒專業術語詞彙表</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Beer & Cider Glossary
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          掌握專業術語，提升品飲理解力。每一個詞彙都包含中英文對照、發音指導與實際應用範例。
        </p>
      </motion.div>

      {/* 搜尋與篩選 */}
      <motion.div 
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
              placeholder="搜尋術語、英文或定義..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* 統計資訊 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-6 text-sm text-white/60"
      >
        <span>找到 {filteredTerms.length} 個術語</span>
        <span>總計 {BEER_CIDER_TERMS.length} 個術語</span>
      </motion.div>

      {/* 複雜度標籤 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(groupedTerms).map(complexity => (
          <span 
            key={complexity} 
            className={`px-3 py-1 rounded-full text-sm ${
              complexity === '初級' ? 'bg-green-500/20 text-green-400' :
              complexity === '中級' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}
          >
            {complexity} ({groupedTerms[complexity].length})
          </span>
        ))}
      </div>

      {/* 詞彙列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredTerms.map((term, index) => (
            <motion.div
              key={term.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-amber-500/30 cursor-pointer transition-all duration-300"
              onClick={() => setSelectedTerm(term)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{term.term}</h3>
                  <p className="text-amber-300 text-sm">{term.english}</p>
                </div>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
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
                <span className="text-xs text-amber-400 font-medium">點擊查看詳情</span>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 詳細資訊彈窗 */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTerm.term}</h2>
                  <p className="text-amber-300 text-lg mb-3">{selectedTerm.english}</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {selectedTerm.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedTerm.complexity === '初級' ? 'bg-green-500/20 text-green-400' :
                      selectedTerm.complexity === '中級' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedTerm.complexity}
                    </span>
                  </div>
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
                    <Volume2 className="w-5 h-5 text-amber-400" />
                    <span className="text-white/80 font-medium">發音指導</span>
                  </div>
                  <p className="text-white text-lg font-mono">{selectedTerm.pronunciation}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  定義說明
                </h3>
                <p className="text-white/80 leading-relaxed">{selectedTerm.definition}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">起源</h3>
                <p className="text-white/80">{selectedTerm.origin}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">使用範例</h3>
                <p className="text-white/80">{selectedTerm.example}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">應用場景</h3>
                <p className="text-white/80">{selectedTerm.usage}</p>
              </div>

              {/* 相關術語 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">相關術語</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.relatedTerms.map((relatedTermId, idx) => {
                    const relatedTerm = BEER_CIDER_TERMS.find(t => t.id === relatedTermId);
                    if (!relatedTerm) return null;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedTerm(relatedTerm)}
                        className="px-3 py-1 bg-white/10 hover:bg-amber-500/20 text-white/80 hover:text-amber-400 rounded-full text-sm transition-colors"
                      >
                        {relatedTerm.term}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}