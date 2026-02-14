'use client';

import { useState, useMemo } from 'react';
import { Search, Volume2, BookOpen, Wrench, History, TrendingUp, Globe, Award } from 'lucide-react';
import { m } from 'framer-motion';
import { logger } from '@/lib/logger';

// 清酒專業術語資料庫
const SAKE_TERMS = [
  {
    id: 'junmai',
    term: '純米酒',
    english: 'Junmai',
    category: '類型',
    definition: '米、米麴和水釀造而成，不含釀造酒精的清酒。',
    pronunciation: 'chun mi jiu',
    example: '純米大吟釀、純米吟釀',
    origin: '日本',
    complexity: '初級',
    usage: '形容未添加釀造酒精的清酒類型',
    relatedTerms: ['ginjo', 'daiginjo', 'honjozo']
  },
  {
    id: 'ginjo',
    term: '吟釀',
    english: 'Ginjo',
    category: '類型',
    definition: '精米步合在60%以下，使用特殊酵母低溫釀造的清酒。',
    pronunciation: 'yin niang',
    example: '大吟釀、特別吟釀',
    origin: '日本',
    complexity: '中等',
    usage: '形容香味華麗的高級清酒',
    relatedTerms: ['daiginjo', 'seimaibuai', 'yeast']
  },
  {
    id: 'daiginjo',
    term: '大吟釀',
    english: 'Daiginjo',
    category: '類型',
    definition: '精米步合在50%以下的最高級清酒，香味極其華麗。',
    pronunciation: 'da yin niang',
    example: '十四代、龍泉',
    origin: '日本',
    complexity: '進階',
    usage: '形容最高等級的清酒類型',
    relatedTerms: ['ginjo', 'tokubetsu', 'premium']
  },
  {
    id: 'seimaibuai',
    term: '精米步合',
    english: 'Seimaibuai',
    category: '工藝',
    definition: '磨去米粒外層後剩餘的比例，數字越小代表越精緻。',
    pronunciation: 'jing mi bu he',
    example: '50%精米步合表示磨去了50%的米粒外層',
    origin: '日本',
    complexity: '中等',
    usage: '衡量清酒精緻程度的重要指標',
    relatedTerms: ['rice-polishing', 'grade', 'quality']
  },
  {
    id: 'nihonshu',
    term: '日本酒',
    english: 'Nihonshu',
    category: '通稱',
    definition: '清酒的正式日文名稱，意為日本的酒類。',
    pronunciation: 'ri ben jiu',
    example: '日本酒度、日本酒造好適米',
    origin: '日本',
    complexity: '初級',
    usage: '清酒的日文正式稱呼',
    relatedTerms: ['sake', 'nihonshu-do', 'brewing']
  },
  {
    id: 'kura',
    term: '酒造',
    english: 'Kura',
    category: '場所',
    definition: '釀造清酒的工廠或酒廠。',
    pronunciation: 'jiu zao',
    example: '熊野酒造、而今酒造',
    origin: '日本',
    complexity: '初級',
    usage: '清酒生產的地點',
    relatedTerms: ['brewery', 'producer', 'location']
  },
  {
    id: 'sake-meter-value',
    term: '日本酒度',
    english: 'Sake Meter Value (SMV)',
    category: '測量',
    definition: '衡量清酒甜度與乾燥度的指標，正值偏乾，負值偏甜。',
    pronunciation: 'ri ben jiu du',
    example: 'SMV +3偏乾，SMV -3偏甜',
    origin: '日本',
    complexity: '進階',
    usage: '判斷清酒甜乾程度的指標',
    relatedTerms: ['sweetness', 'dryness', 'acidity']
  },
  {
    id: 'acid',
    term: '酸度',
    english: 'Acidity',
    category: '測量',
    definition: '清酒中酸的含量，影響口感的豐富度和平衡。',
    pronunciation: 'suan du',
    example: '酸度2.0左右為標準',
    origin: '通用術語',
    complexity: '中等',
    usage: '衡量清酒口感平衡的指標',
    relatedTerms: ['nihonshu-do', 'balance', 'richness']
  },
  {
    id: 'amino',
    term: '氨基酸度',
    english: 'Amino Acidity',
    category: '測量',
    definition: '清酒中氨基酸的含量，影響口感的濃醇度。',
    pronunciation: 'an ji suan du',
    example: '氨基酸度1.2-1.6為標準',
    origin: '通用術語',
    complexity: '進階',
    usage: '衡量清酒濃醇度的指標',
    relatedTerms: ['umami', 'richness', 'flavor']
  },
  {
    id: 'yeast',
    term: '酵母',
    english: 'Yeast',
    category: '原料',
    definition: '發酵過程中產生酒精和香味的微生物。',
    pronunciation: 'jiao mu',
    example: '協會酵母、山形酵母',
    origin: '通用術語',
    complexity: '中等',
    usage: '清酒香味的主要來源',
    relatedTerms: ['koji', 'fermentation', 'aroma']
  },
  {
    id: 'koji',
    term: '麴菌',
    english: 'Koji',
    category: '原料',
    definition: '將米轉化為糖分的霉菌，是釀造清酒的關鍵。',
    pronunciation: 'qu jun',
    example: '黃麴、清酒麴',
    origin: '日本',
    complexity: '進階',
    usage: '清酒甜味和香味的來源',
    relatedTerms: ['rice', 'fermentation', 'enzyme']
  },
  {
    id: 'rice',
    term: '酒造好適米',
    english: 'Sake Rice',
    category: '原料',
    definition: '專門用於釀造清酒的特殊品種米，顆粒大、蛋白質含量低。',
    pronunciation: 'jiu zao hao shi mi',
    example: '山田錦、雄町、美山錦',
    origin: '日本',
    complexity: '中等',
    usage: '高品質清酒的原料',
    relatedTerms: ['yamada-nishiki', 'omei', 'special-rice']
  },
  {
    id: 'kimoto',
    term: '生酛',
    english: 'Kimoto',
    category: '工藝',
    definition: '傳統的製醪方法，以人工踩踏的方式製作。',
    pronunciation: 'sheng nu',
    example: '水芭蕉、石鎚',
    origin: '日本',
    complexity: '進階',
    usage: '傳統手工製醪方式',
    relatedTerms: ['yamahai', 'brewing-method', 'traditional']
  },
  {
    id: 'yamahai',
    term: '山廢',
    english: 'Yamahai',
    category: '工藝',
    definition: '簡化版的生酛製法，省略踩踏工序的傳統釀造法。',
    pronunciation: 'shan fei',
    example: '伯樂星、新政',
    origin: '日本',
    complexity: '進階',
    usage: '簡化傳統製醪方式',
    relatedTerms: ['kimoto', 'brewing-method', 'simplified']
  },
  {
    id: 'namazake',
    term: '生酒',
    english: 'Namazake',
    category: '處理',
    definition: '未經火入（殺菌）處理的清酒，保持新鮮活躍的口感。',
    pronunciation: 'sheng jiu',
    example: '大多數夏季限定清酒',
    origin: '日本',
    complexity: '中等',
    usage: '未殺菌的新鮮清酒',
    relatedTerms: ['pasteurization', 'fresh', 'living-sake']
  },
  {
    id: 'genshu',
    term: '原酒',
    english: 'Genshu',
    category: '處理',
    definition: '未經加水稀釋的高酒精度清酒，風味濃厚。',
    pronunciation: 'yuan jiu',
    example: '大多數大吟釀級別的原酒',
    origin: '日本',
    complexity: '中等',
    usage: '未稀釋的高濃度清酒',
    relatedTerms: ['undiluted', 'strong', 'concentrated']
  },
  {
    id: 'taru',
    term: '樽酒',
    english: 'Taru Sake',
    category: '處理',
    definition: '使用日本杉木桶儲存的清酒，帶有特殊木質香氣。',
    pronunciation: 'zun jiu',
    example: '獺祭 樽酒',
    origin: '日本',
    complexity: '進階',
    usage: '木桶熟成的特殊清酒',
    relatedTerms: ['cedar', 'barrel-aged', 'special-aging']
  },
  {
    id: 'nigori',
    term: 'にごり酒',
    english: 'Nigori Sake',
    category: '類型',
    definition: '未完全過濾的混濁清酒，口感綿密甜潤。',
    pronunciation: 'ni go li jiu',
    example: '白雪にごり',
    origin: '日本',
    complexity: '初級',
    usage: '混濁口感的清酒',
    relatedTerms: ['cloudy', 'unfiltered', 'creamy']
  },
  {
    id: 'honjozo',
    term: '本釀造',
    english: 'Honjozo',
    category: '類型',
    definition: '添加少量釀造酒精的清酒，口感較為輕快。',
    pronunciation: 'ben niang zao',
    example: '菊正宗 本釀造',
    origin: '日本',
    complexity: '中等',
    usage: '添加少量酒精的清酒',
    relatedTerms: ['added-alcohol', 'light', 'crisp']
  },
  {
    id: 'tokubetsu',
    term: '特別',
    english: 'Tokubetsu',
    category: '等級',
    definition: '特別的、特別製法的意思，表示使用特別工藝或原料。',
    pronunciation: 'te bie',
    example: '特別純米、特別本釀造',
    origin: '日本',
    complexity: '初級',
    usage: '表示特別工藝的標記',
    relatedTerms: ['special', 'particular', 'designated']
  }
];

// 分類選項
const CATEGORIES = [
  { id: 'all', name: '全部', icon: BookOpen },
  { id: '類型', name: '清酒類型', icon: Wrench },
  { id: '工藝', name: '釀造工藝', icon: Wrench },
  { id: '原料', name: '原料成分', icon: Award },
  { id: '測量', name: '測量指標', icon: TrendingUp },
  { id: '處理', name: '後處理', icon: History },
  { id: '場所', name: '生產場所', icon: Globe },
  { id: '通稱', name: '通用稱呼', icon: Globe }
];

export function SakeGlossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  // 過濾術語
  const filteredTerms = useMemo(() => {
    return SAKE_TERMS.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           term.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // 按複雜度分組
  const groupedTerms = useMemo(() => {
    return filteredTerms.reduce((acc, term) => {
      if (!acc[term.complexity]) acc[term.complexity] = [];
      acc[term.complexity].push(term);
      return acc;
    }, {} as Record<string, typeof SAKE_TERMS>);
  }, [filteredTerms]);

  // 播放發音（模擬功能）
  const playPronunciation = (term: string) => {
    logger.debug(`播放 ${term} 的發音`)
    // 在實際應用中，這裡會調用語音合成API
  };

  return (
    <div className="space-y-6">
      {/* 搜索和篩選區域 */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索清酒術語..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 分類篩選 */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <m.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-4 h-4 inline mr-2" />
                {category.name}
              </m.button>
            );
          })}
        </div>
      </div>

      {/* 複雜度標籤 */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(groupedTerms).map(([complexity, terms]) => (
          <div key={complexity} className="w-full">
            <h3 className="text-lg font-semibold text-white mb-3 capitalize">
              {complexity === '初級' && '🌱 '}
              {complexity === '中等' && '⭐ '}
              {complexity === '進階' && '🔥 '}
              {complexity}
            </h3>
            <div className="grid gap-3">
              {terms.map((term) => (
                <m.div
                  key={term.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-white/10 hover:border-amber-400/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedTerm(term.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-lg">{term.term}</h4>
                      <p className="text-white/70 text-sm">{term.english}</p>
                      <p className="text-white/50 text-xs mt-1">{term.category}</p>
                    </div>
                    <Volume2 
                      className="w-5 h-5 text-amber-400 cursor-pointer hover:text-amber-300" 
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(term.term);
                      }}
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-2 line-clamp-2">{term.definition}</p>
                </m.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 術語詳細資訊彈窗 */}
      {selectedTerm && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTerm(null)}
        >
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const term = SAKE_TERMS.find(t => t.id === selectedTerm);
              if (!term) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        {term.term}
                        <span className="text-sm bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                          {term.category}
                        </span>
                      </h3>
                      <p className="text-white/70">{term.english}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTerm(null)}
                      className="text-white/50 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-amber-400 text-sm uppercase tracking-wide mb-1">定義</h4>
                      <p className="text-white/90">{term.definition}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-amber-400 text-sm uppercase tracking-wide mb-1">發音</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">{term.pronunciation}</span>
                        <Volume2 
                          className="w-4 h-4 text-amber-400 cursor-pointer hover:text-amber-300" 
                          onClick={() => playPronunciation(term.term)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-amber-400 text-sm uppercase tracking-wide mb-1">範例</h4>
                      <p className="text-white/90">{term.example}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-amber-400 text-sm uppercase tracking-wide mb-1">起源</h4>
                      <p className="text-white/70">{term.origin}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-amber-400 text-sm uppercase tracking-wide mb-1">使用情境</h4>
                      <p className="text-white/90">{term.usage}</p>
                    </div>
                    
                    {term.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-amber-400 text-sm uppercase tracking-wide mb-2">相關術語</h4>
                        <div className="flex flex-wrap gap-2">
                          {term.relatedTerms.map((relatedTermId) => {
                            const relatedTerm = SAKE_TERMS.find(t => t.id === relatedTermId);
                            return relatedTerm ? (
                              <span 
                                key={relatedTermId}
                                className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs cursor-pointer hover:bg-amber-500/30"
                                onClick={() => setSelectedTerm(relatedTermId)}
                              >
                                {relatedTerm.term}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </m.div>
        </m.div>
      )}
    </div>
  );
}