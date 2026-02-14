'use client';

import React, { useState, useMemo } from 'react';
import { m , AnimatePresence } from 'framer-motion';
import { GlassWater, Star, Award, MapPin, TrendingUp, Filter, Search } from 'lucide-react';

interface BeerCiderExample {
  id: string;
  name: string;
  type: '啤酒' | '蘋果酒' | '小麥啤酒' | '艾爾' | '拉格' | '酸啤酒' | '精釀' | '修道院' | '水果酒';
  style: string;
  origin: string;
  abv: number; // 酒精度
  ibu: number; // 苦味值
  color: string; // 顏色描述
  aroma: string[]; // 香氣特徵
  taste: string[]; // 口感特徵
  foodPairing: string[]; // 配餐建議
  rating: number; // 評分
  awards?: string[]; // 獲獎記錄
  description: string;
  brewingNotes: string; // 釀造特點
  servingTemp: string; // 建議飲用溫度
  glassware: string; // 適合酒杯
  priceRange: '經濟' | '中等' | '高檔' | '奢華'; // 價位
  availability: '普遍' | '地區性' | '限量' | '季節性'; // 可得性
  prowineUrl?: string; // prowine.com.tw 連結
}

const BEER_CIDER_EXAMPLES: BeerCiderExample[] = [
  {
    id: 'guinness',
    name: '健力士黑啤酒',
    type: '啤酒',
    style: '愛爾蘭司陶特',
    origin: '愛爾蘭都柏林',
    abv: 4.2,
    ibu: 45,
    color: '深黑色，豐厚的棕色泡沫',
    aroma: ['烘烤麥芽', '咖啡', '巧克力', '焦糖'],
    taste: ['濃郁的烘烤味', '柔滑口感', '輕微苦味', '奶油般質地'],
    foodPairing: ['牡蠣', '烤肉', '藍紋起司', '巧克力甜點'],
    rating: 4.7,
    awards: ['世界啤酒盃金牌', '國際啤酒挑戰賽獎項'],
    description: '世界上最著名的司陶特啤酒之一，以其獨特的氮氣注入系統和奶油般的口感聞名。',
    brewingNotes: '使用烘烤大麥芽和氮氣混合二氧化碳灌裝，創造獨特口感。',
    servingTemp: '6-8°C',
    glassware: '健力士專用杯',
    priceRange: '中等',
    availability: '普遍',
    prowineUrl: 'https://www.prowine.com.tw/guinness'
  },
  {
    id: 'westvleteren12',
    name: '西弗勒特倫12',
    type: '修道院',
    style: '四料修道院啤酒',
    origin: '比利時西弗勒特倫',
    abv: 10.2,
    ibu: 27,
    color: '深琥珀色至棕黑色',
    aroma: ['水果酯類', '香料', '焦糖', '深色水果'],
    taste: ['複雜果味', '微妙香料', '甜潤口感', '溫暖酒精感'],
    foodPairing: ['鵝肝', '黑巧克力', '藍紋起司', '紅肉'],
    rating: 4.9,
    awards: ['RateBeer評為世界最佳啤酒', '布魯塞爾啤酒挑戰賽金獎'],
    description: '世界上最珍貴的啤酒之一，由修道士手工釀造，產量極其有限。',
    brewingNotes: '傳統修道院釀造工藝，二次發酵，使用特殊酵母菌株。',
    servingTemp: '12-14°C',
    glassware: '修道院專用杯',
    priceRange: '奢華',
    availability: '限量',
    prowineUrl: 'https://www.prowine.com.tw/westvleteren'
  },
  {
    id: 'pilsner-urquell',
    name: '皮爾森優泉',
    type: '啤酒',
    style: '捷克皮爾森',
    origin: '捷克皮爾森',
    abv: 4.4,
    ibu: 39,
    color: '清澈金色，白色持久泡沫',
    aroma: ['薩茲啤酒花', '麥芽甜香', '草本香氣'],
    taste: ['明顯苦味', '乾爽口感', '優雅平衡', '清新收尾'],
    foodPairing: ['捷克菜餚', '豬肉', '香腸', '鹹味小食'],
    rating: 4.6,
    awards: ['世界啤酒盃金牌', '歐洲啤酒之星'],
    description: '世界上第一款皮爾森啤酒，定義了整個皮爾森風格的標準。',
    brewingNotes: '使用捷克薩茲啤酒花和軟水釀造，傳統窖藏技術。',
    servingTemp: '4-6°C',
    glassware: '皮爾森杯',
    priceRange: '經濟',
    availability: '普遍',
    prowineUrl: 'https://www.prowine.com.tw/pilsner-urquell'
  },
  {
    id: 'brooklyn-east-ipa',
    name: '布魯克林東岸IPA',
    type: '精釀',
    style: '美式印度淡色艾爾',
    origin: '美國紐約',
    abv: 6.7,
    ibu: 72,
    color: '亮金色，堅固泡沫',
    aroma: ['柑橘', '松樹', '熱帶水果', '花香'],
    taste: ['強烈苦味', '柑橘風味', '持久苦香', '乾爽收尾'],
    foodPairing: ['辣味食物', '燒烤', '起司', '海鮮'],
    rating: 4.5,
    awards: ['世界啤酒盃金牌', 'Great American Beer Festival獎項'],
    description: '代表性的美式IPA，展示了西海岸風格的強烈酒花特徵。',
    brewingNotes: '大量使用美國西海岸酒花品種，如卡斯卡特和世紀。',
    servingTemp: '6-8°C',
    glassware: '品脫杯',
    priceRange: '中等',
    availability: '普遍',
    prowineUrl: 'https://www.prowine.com.tw/brooklyn-ipa'
  },
  {
    id: 'triple-seven-cider',
    name: '三七蘋果酒',
    type: '蘋果酒',
    style: '傳統發酵蘋果酒',
    origin: '台灣',
    abv: 5.5,
    ibu: 5,
    color: '清澈金黃色',
    aroma: ['新鮮蘋果', '花香', '輕微酵母香'],
    taste: ['清脆蘋果味', '輕微酸度', '清爽口感', '乾淨收尾'],
    foodPairing: ['台灣小吃', '海鮮', '沙拉', '輕食'],
    rating: 4.4,
    description: '台灣本地生產的優質蘋果酒，融合東方口味偏好。',
    brewingNotes: '使用台灣本地蘋果，傳統發酵工藝，輕微碳酸化。',
    servingTemp: '4-6°C',
    glassware: '白葡萄酒杯',
    priceRange: '中等',
    availability: '地區性',
    prowineUrl: 'https://www.prowine.com.tw/triple-seven'
  },
  {
    id: 'brewdog-punk-ipa',
    name: 'BrewDog朋克IPA',
    type: '精釀',
    style: '新派IPA',
    origin: '蘇格蘭',
    abv: 5.6,
    ibu: 35,
    color: '淡金色，持久泡沫',
    aroma: ['柑橘', '熱帶水果', '松樹', '蜂蜜'],
    taste: ['平衡苦味', '果味濃郁', '易飲口感', '甜美收尾'],
    foodPairing: ['漢堡', '披薩', '辛辣食物', '烤肉'],
    rating: 4.3,
    awards: ['世界啤酒盃銅牌', '國際葡萄酒暨烈酒大賽獎項'],
    description: '重新定義了現代IPA的概念，平衡了苦味和果味。',
    brewingNotes: '使用多種美國酒花品種，創造獨特的新世界風味。',
    servingTemp: '5-7°C',
    glassware: 'IPA專用杯',
    priceRange: '中等',
    availability: '普遍',
    prowineUrl: 'https://www.prowine.com.tw/brewdog-punk'
  },
  {
    id: 'fruli',
    name: '芙靈紅酒',
    type: '水果酒',
    style: '覆盆子小麥啤酒',
    origin: '比利時',
    abv: 3.8,
    ibu: 8,
    color: '明亮粉紅色',
    aroma: ['覆盆子', '小麥香', '花香'],
    taste: ['酸甜平衡', '果味濃郁', '清爽口感', '輕柔碳酸'],
    foodPairing: ['甜點', '沙拉', '海鮮', '輕食'],
    rating: 4.2,
    description: '色彩繽紛的水果啤酒，適合輕鬆場合享用。',
    brewingNotes: '在小麥啤酒中加入新鮮覆盆子釀造，保留水果風味。',
    servingTemp: '4-6°C',
    glassware: '小麥啤酒杯',
    priceRange: '中等',
    availability: '普遍',
    prowineUrl: 'https://www.prowine.com.tw/fruli'
  },
  {
    id: 'chouffe',
    name: '阿登福啤酒',
    type: '艾爾',
    style: '比利時金色艾爾',
    origin: '比利時阿登森林',
    abv: 8.0,
    ibu: 20,
    color: '明亮金色，豐厚泡沫',
    aroma: ['辛香料', '柑橘', '蜂蜜', '花香'],
    taste: ['複雜香料味', '果味酯類', '微甜口感', '溫暖酒精感'],
    foodPairing: ['比利時菜餚', '起司', '魚類', '家禽'],
    rating: 4.6,
    awards: ['布魯塞爾啤酒挑戰賽銀獎', '世界啤酒盃獎項'],
    description: '來自阿登森林的傳奇啤酒，以其獨特的風味和神秘感聞名。',
    brewingNotes: '使用特殊的比利時酵母菌株，瓶中二次發酵。',
    servingTemp: '8-10°C',
    glassware: '特製酒杯',
    priceRange: '高檔',
    availability: '地區性',
    prowineUrl: 'https://www.prowine.com.tw/chouffe'
  },
  {
    id: 'snake-britches',
    name: '蛇褲子',
    type: '精釀',
    style: '美式小麥艾爾',
    origin: '台灣',
    abv: 4.8,
    ibu: 15,
    color: '清澈淡金色',
    aroma: ['柑橘', '香草', '輕微麥芽香'],
    taste: ['清爽口感', '輕微苦味', '柑橘風味', '乾淨收尾'],
    foodPairing: ['台灣夜市小吃', '海鮮', '沙拉', '清淡料理'],
    rating: 4.3,
    description: '台灣精釀啤酒界的代表作品之一，展現本地釀造實力。',
    brewingNotes: '使用美國酒花和台灣本地原料的完美結合。',
    servingTemp: '4-6°C',
    glassware: '品脫杯',
    priceRange: '中等',
    availability: '地區性',
    prowineUrl: 'https://www.prowine.com.tw/snake-britches'
  },
  {
    id: 'brooklyn-summer-ale',
    name: '布魯克林夏日艾爾',
    type: '艾爾',
    style: '美式淡色艾爾',
    origin: '美國紐約',
    abv: 4.5,
    ibu: 30,
    color: '清澈金黃色',
    aroma: ['柑橘', '花香', '輕微麥芽甜香'],
    taste: ['清爽口感', '平衡苦味', '易飲風味', '乾淨收尾'],
    foodPairing: ['沙拉', '海鮮', '雞肉', '清淡料理'],
    rating: 4.2,
    description: '完美的夏日飲品，清爽易飲，適合各種場合。',
    brewingNotes: '使用美國酒花品種，創造清爽平衡的風味。',
    servingTemp: '4-6°C',
    glassware: '品脫杯',
    priceRange: '中等',
    availability: '普遍',
    prowineUrl: 'https://www.prowine.com.tw/brooklyn-summer'
  }
];

export function BeerCiderExamples() {
  const [selectedExample, setSelectedExample] = useState<BeerCiderExample | null>(null);
  const [filterType, setFilterType] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const types = useMemo(() => {
    const uniqueTypes = [...new Set(BEER_CIDER_EXAMPLES.map(item => item.type))];
    return ['全部', ...uniqueTypes];
  }, []);
  
  const filteredExamples = useMemo(() => {
    return BEER_CIDER_EXAMPLES.filter(example => {
      const matchesType = filterType === '全部' || example.type === filterType;
      const matchesSearch = 
        example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [filterType, searchTerm]);
  
  // 根據評分排序
  const sortedExamples = useMemo(() => {
    return [...filteredExamples].sort((a, b) => b.rating - a.rating);
  }, [filteredExamples]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題區域 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
          <GlassWater className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-medium">啤酒與蘋果酒實例案例</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Representative Beer & Cider Examples
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          探索世界各地的代表性啤酒與蘋果酒，了解不同風格的特色、風味特徵及品飲建議。
        </p>
      </m.div>

      {/* 搜尋和篩選 */}
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
              placeholder="搜尋酒款名稱、風格或產地..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {types.map(type => (
                <option key={type} value={type} className="bg-gray-800">
                  {type}
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
        <span>找到 {sortedExamples.length} 款酒品</span>
        <span>總計 {BEER_CIDER_EXAMPLES.length} 款酒品</span>
      </m.div>

      {/* 酒款列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedExamples.map((example, index) => (
          <m.div
            key={example.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-amber-500/30 cursor-pointer transition-all duration-300 group"
            onClick={() => setSelectedExample(example)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {example.name}
                </h3>
                <p className="text-amber-300 text-sm">{example.style}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{example.rating}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {example.type}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {example.abv}% ABV
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                {example.ibu} IBU
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {example.origin}
              </span>
            </div>
            
            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {example.description}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <TrendingUp className="w-3 h-3" />
                <span>{example.priceRange}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-400">{example.availability}</span>
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* 詳細資訊彈窗 */}
      <AnimatePresence>
        {selectedExample && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExample(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedExample.name}</h2>
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-amber-300 text-lg">{selectedExample.style}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{selectedExample.rating}/5.0</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {selectedExample.type}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedExample.abv}% ABV
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {selectedExample.ibu} IBU
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedExample.origin}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExample(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    基本資訊
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">酒精度：</span>
                      <span className="text-white">{selectedExample.abv}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">苦味值：</span>
                      <span className="text-white">{selectedExample.ibu} IBU</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">顏色：</span>
                      <span className="text-white">{selectedExample.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">飲用溫度：</span>
                      <span className="text-white">{selectedExample.servingTemp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">適合酒杯：</span>
                      <span className="text-white">{selectedExample.glassware}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">價位：</span>
                      <span className="text-white">{selectedExample.priceRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">可得性：</span>
                      <span className="text-white">{selectedExample.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">獲獎記錄</h3>
                  {selectedExample.awards && selectedExample.awards.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedExample.awards.map((award, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Award className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{award}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/60 text-sm">此酒款暫無獲獎記錄</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">描述與特色</h3>
                <p className="text-white/80 leading-relaxed">{selectedExample.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">香氣特徵</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.aroma.map((aroma, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm"
                      >
                        {aroma}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-3">口感特徵</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.taste.map((taste, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                      >
                        {taste}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">釀造特點</h3>
                <p className="text-white/80 leading-relaxed">{selectedExample.brewingNotes}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">配餐建議</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExample.foodPairing.map((food, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              {selectedExample.prowineUrl && (
                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">購買資訊</h3>
                  <a 
                    href={selectedExample.prowineUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>前往 prowine.com.tw 查看</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <MapPin className="w-4 h-4" />
                  <span>產地：{selectedExample.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{selectedExample.rating}/5.0</span>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}