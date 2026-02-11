'use client';

import { useState, useMemo } from 'react';
import { Search, Volume2, BookOpen, Wrench, History, TrendingUp, Globe, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

// 威士忌專業術語資料庫
const WHISKY_TERMS = [
  {
    id: 'single-malt',
    term: '單一麥芽威士忌',
    english: 'Single Malt Whisky',
    category: '類型',
    definition: '完全由同一間蒸餾廠所生產，且原料100%為大麥芽的威士忌。',
    pronunciation: 'dan yi mai ya wei shi ji',
    example: '麥卡倫(Macallan)、格蘭菲迪(Glenfiddich)',
    origin: '蘇格蘭',
    complexity: '中等',
    usage: '形容高品質的威士忌類型',
    relatedTerms: ['blended', 'malt', 'distillery']
  },
  {
    id: 'blended',
    term: '調和威士忌',
    english: 'Blended Whisky',
    category: '類型',
    definition: '將不同蒸餾廠或不同批次的威士忌混合而成的威士忌。',
    pronunciation: 'tiao he wei shi ji',
    example: '尊尼獲加(Johnnie Walker)、芝華士(Chivas Regal)',
    origin: '蘇格蘭',
    complexity: '初級',
    usage: '市面上最常見的威士忌類型',
    relatedTerms: ['single-malt', 'blend', 'vatted']
  },
  {
    id: 'cask-strength',
    term: '原桶強度',
    english: 'Cask Strength',
    category: '強度',
    definition: '未經稀釋的威士忌，通常酒精度在55-65%之間。',
    pronunciation: 'yuan tong qiang du',
    example: 'Lagavulin 12 Year Old Cask Strength',
    origin: '通用術語',
    complexity: '進階',
    usage: '提供最純粹的威士忌風味體驗',
    relatedTerms: ['barrel-proof', 'abv', 'dilution']
  },
  {
    id: 'peated',
    term: '泥炭威士忌',
    english: 'Peated Whisky',
    category: '風味',
    definition: '使用泥炭烘乾麥芽所產生的煙燻風味威士忌。',
    pronunciation: 'ni qian wei shi ji',
    example: '拉加維林(Lagavulin)、阿貝(Ardbeg)',
    origin: '艾雷島',
    complexity: '中等',
    usage: '形容具有煙燻、藥草風味的威士忌',
    relatedTerms: ['phenols', 'peat', 'smoke']
  },
  {
    id: 'non-peated',
    term: '非泥炭威士忌',
    english: 'Non-Peated Whisky',
    category: '風味',
    definition: '不使用泥炭烘乾麥芽，風味較為清淡的威士忌。',
    pronunciation: 'fei ni qian wei shi ji',
    example: '格蘭菲迪(Glenfiddich)、百富(Balvenie)',
    origin: '通用術語',
    complexity: '初級',
    usage: '形容風味清淡、果香型的威士忌',
    relatedTerms: ['unpeated', 'clean', 'light']
  },
  {
    id: 'finish',
    term: '過桶熟成',
    english: 'Finish',
    category: '熟成',
    definition: '威士忌在主要熟成容器後，轉移到另一種木桶進行短期熟成。',
    pronunciation: 'guo tong shu cheng',
    example: '雪莉桶過桶、波本桶過桶',
    origin: '熟成工藝',
    complexity: '進階',
    usage: '增添威士忌風味層次',
    relatedTerms: ['wood-finishing', 'cask-maturing', 'secondary']
  },
  {
    id: 'distillery',
    term: '蒸餾廠',
    english: 'Distillery',
    category: '場所',
    definition: '生產威士忌的工廠，進行發酵、蒸餾等工序。',
    pronunciation: 'zheng liu chang',
    example: 'Macallan Distillery、Glenmorangie Distillery',
    origin: '生產術語',
    complexity: '初級',
    usage: '指威士忌的生產地點',
    relatedTerms: ['brand', 'location', 'production']
  },
  {
    id: 'mash',
    term: '糖化',
    english: 'Mash',
    category: '工藝',
    definition: '將碾碎的大麥與熱水混合，使澱粉轉化為糖的過程。',
    pronunciation: 'tang hua',
    example: '威士忌糖化工序',
    origin: '製程術語',
    complexity: '進階',
    usage: '威士忌釀造的第一步驟',
    relatedTerms: ['fermentation', 'wort', 'enzymes']
  },
  {
    id: 'fermentation',
    term: '發酵',
    english: 'Fermentation',
    category: '工藝',
    definition: '利用酵母將糖分轉化為酒精的過程，通常持續48-96小時。',
    pronunciation: 'fa jiao',
    example: '威士忌發酵槽',
    origin: '製程術語',
    complexity: '中等',
    usage: '糖化後的關鍵步驟',
    relatedTerms: ['yeast', 'wash', 'alcohol', 'mash']
  },
  {
    id: 'pot-still',
    term: '壺式蒸餾器',
    english: 'Pot Still',
    category: '設備',
    definition: '傳統的銅製蒸餾設備，形狀像大壺子，用於威士忌蒸餾。',
    pronunciation: 'hu shi zheng liu qi',
    example: '蘇格蘭單一麥芽威士忌使用',
    origin: '設備術語',
    complexity: '中等',
    usage: '傳統威士忌蒸餾方式',
    relatedTerms: ['column-still', 'copper', 'distillation']
  },
  {
    id: 'column-still',
    term: '柱式蒸餾器',
    english: 'Column Still',
    category: '設備',
    definition: '連續蒸餾設備，效率較高，常用於調和威士忌基酒。',
    pronunciation: 'zhu shi zheng liu qi',
    example: '穀物威士忌生產',
    origin: '設備術語',
    complexity: '進階',
    usage: '工業化威士忌生產方式',
    relatedTerms: ['continuous', 'patent-still', 'grain-whisky']
  },
  {
    id: 'angel-share',
    term: '天使份額',
    english: 'Angel\'s Share',
    category: '熟成',
    definition: '威士忌在熟成過程中因蒸發而損失的部分，每年約2%。',
    pronunciation: 'tian shi fen e',
    example: '熟成10年的威士忌會失去約20%的容量',
    origin: '熟成術語',
    complexity: '中等',
    usage: '形容熟成過程中的自然損耗',
    relatedTerms: ['devil-share', 'evaporation', 'maturation']
  },
  {
    id: 'devil-share',
    term: '魔鬼份額',
    english: 'Devil\'s Share',
    category: '熟成',
    definition: '威士忌熟成時因橡木桶滲漏或人為因素造成的損失。',
    pronunciation: 'mo gui fen e',
    example: '橡木桶破損造成的損失',
    origin: '熟成術語',
    complexity: '進階',
    usage: '形容非自然的威士忌損失',
    relatedTerms: ['angel-share', 'loss', 'barrel']
  },
  {
    id: 'proof',
    term: '酒精度',
    english: 'Proof',
    category: '強度',
    definition: '衡量酒精含量的單位，在美國，proof是ABV的兩倍。',
    pronunciation: 'jiu jing du',
    example: '威士忌標示80 proof = 40% ABV',
    origin: '測量術語',
    complexity: '初級',
    usage: '表示威士忌酒精濃度',
    relatedTerms: ['abv', 'alcohol-by-volume', 'strength']
  },
  {
    id: 'abv',
    term: '酒精體積比',
    english: 'Alcohol By Volume (ABV)',
    category: '強度',
    definition: '酒精在飲料中所佔的體積百分比。',
    pronunciation: 'jiu jing ti ji bi',
    example: '威士忌通常為40-60% ABV',
    origin: '測量術語',
    complexity: '初級',
    usage: '標準的酒精含量表示方法',
    relatedTerms: ['proof', 'percentage', 'concentration']
  },
  {
    id: 'peel',
    term: '皮殼',
    english: 'Peel',
    category: '原料',
    definition: '大麥的外皮，在蒸餾過程中會被去除。',
    pronunciation: 'pi ke',
    example: '大麥處理過程',
    origin: '原料術語',
    complexity: '進階',
    usage: '威士忌原料的一部分',
    relatedTerms: ['grist', 'malt', 'husk']
  },
  {
    id: 'grist',
    term: '麥芽粉',
    english: 'Grist',
    category: '原料',
    definition: '碾碎後的大麥芽粉末，用於糖化工序。',
    pronunciation: 'mai ya fen',
    example: '威士忌原料',
    origin: '原料術語',
    complexity: '中等',
    usage: '糖化工序的主要原料',
    relatedTerms: ['malt', 'mill', 'powder']
  },
  {
    id: 'wort',
    term: '麥汁',
    english: 'Wort',
    category: '製程',
    definition: '糖化後得到的含糖液體，將用於發酵。',
    pronunciation: 'mai zhi',
    example: '糖化槽中的液體',
    origin: '製程術語',
    complexity: '進階',
    usage: '發酵前的糖液',
    relatedTerms: ['mash', 'fermentation', 'sugar']
  },
  {
    id: 'wash',
    term: '酒汁',
    english: 'Wash',
    category: '製程',
    definition: '發酵後得到的含酒精液體，酒精度約8-10%。',
    pronunciation: 'jiu zhi',
    example: '發酵槽中的液體',
    origin: '製程術語',
    complexity: '中等',
    usage: '蒸餾前的低度酒精液體',
    relatedTerms: ['fermentation', 'distillation', 'low-wine']
  },
  {
    id: 'low-wine',
    term: '低度酒',
    english: 'Low Wine',
    category: '製程',
    definition: '第一次蒸餾後得到的液體，酒精度約20-25%。',
    pronunciation: 'di du jiu',
    example: '初次蒸餾產物',
    origin: '製程術語',
    complexity: '進階',
    usage: '二次蒸餾的原料',
    relatedTerms: ['wash', 'spirit', 'distillation']
  }
];

// 分類選項
const CATEGORIES = [
  { id: 'all', name: '全部', icon: BookOpen },
  { id: '類型', name: '威士忌類型', icon: Wrench },
  { id: '風味', name: '風味描述', icon: Globe },
  { id: '熟成', name: '熟成工藝', icon: History },
  { id: '工藝', name: '製程工藝', icon: Wrench },
  { id: '設備', name: '設備工具', icon: Wrench },
  { id: '強度', name: '酒精濃度', icon: TrendingUp },
  { id: '原料', name: '原料成分', icon: Award },
  { id: '場所', name: '產地廠區', icon: Globe }
];

export function WhiskyGlossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  // 過濾術語
  const filteredTerms = useMemo(() => {
    return WHISKY_TERMS.filter(term => {
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
    }, {} as Record<string, typeof WHISKY_TERMS>);
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
            placeholder="搜索威士忌術語..."
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
              <motion.button
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
              </motion.button>
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
                <motion.div
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
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 術語詳細資訊彈窗 */}
      {selectedTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTerm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const term = WHISKY_TERMS.find(t => t.id === selectedTerm);
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
                            const relatedTerm = WHISKY_TERMS.find(t => t.id === relatedTermId);
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}