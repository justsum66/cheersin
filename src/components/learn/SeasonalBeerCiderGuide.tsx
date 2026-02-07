'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sun, Cloud, Snowflake, Wind, GlassWater, Utensils, Coffee } from 'lucide-react';

interface SeasonalRecommendation {
  id: string;
  season: '春季' | '夏季' | '秋季' | '冬季';
  beerType: string;
  recommendedStyle: string;
  temperatureRange: string;
  weatherCondition: string;
  foodPairing: string[];
  occasion: string[];
  description: string;
  servingTips: string[];
  popularity: number;
  abvRange: string;
  bestTimeOfDay: string[];
  mood: string;
}

const SEASONAL_RECOMMENDATIONS: SeasonalRecommendation[] = [
  {
    id: 'summer-lager',
    season: '夏季',
    beerType: '啤酒',
    recommendedStyle: '德式拉格',
    temperatureRange: '22-28°C',
    weatherCondition: '炎熱晴朗',
    foodPairing: ['海鮮', '沙拉', '輕食', '燒烤'],
    occasion: ['海灘派對', '戶外聚會', '午後休閒'],
    description: '清爽的拉格啤酒是夏日的最佳選擇，低苦味和清爽口感能夠有效降溫解渴。',
    servingTips: ['冰鎮至4-6°C', '使用品脫杯', '搭配檸檬片'],
    popularity: 92,
    abvRange: '4.0-5.0%',
    bestTimeOfDay: ['中午', '下午', '傍晚'],
    mood: '清爽振奮'
  },
  {
    id: 'summer-wheat',
    season: '夏季',
    beerType: '啤酒',
    recommendedStyle: '德式小麥啤酒',
    temperatureRange: '25-30°C',
    weatherCondition: '炎熱潮濕',
    foodPairing: ['泰式料理', '墨西哥菜', '水果', '輕食'],
    occasion: ['夏日派對', '啤酒花園', '戶外活動'],
    description: '小麥啤酒的果香和香料味非常適合炎熱天氣，通常帶有香蕉和丁香的香味。',
    servingTips: ['冰鎮至4-7°C', '使用小麥啤酒杯', '保持泡沫豐富'],
    popularity: 88,
    abvRange: '4.5-5.5%',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '輕鬆愉快'
  },
  {
    id: 'summer-cider',
    season: '夏季',
    beerType: '蘋果酒',
    recommendedStyle: '傳統發酵蘋果酒',
    temperatureRange: '20-26°C',
    weatherCondition: '溫暖舒適',
    foodPairing: ['沙拉', '海鮮', '輕食', '水果拼盤'],
    occasion: ['花園派對', '下午茶', '輕鬆聚會'],
    description: '清爽的蘋果酒帶有天然果香，酸甜平衡，非常適合夏日午後飲用。',
    servingTips: ['冰鎮至4-6°C', '使用白葡萄酒杯', '搭配新鮮水果'],
    popularity: 85,
    abvRange: '4.5-6.5%',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '悠閒舒適'
  },
  {
    id: 'winter-stout',
    season: '冬季',
    beerType: '啤酒',
    recommendedStyle: '愛爾蘭司陶特',
    temperatureRange: '5-15°C',
    weatherCondition: '寒冷多雲',
    foodPairing: ['燉煮料理', '起司', '巧克力甜點', '烤肉'],
    occasion: ['冬夜獨飲', '溫馨聚會', '聖誕節慶'],
    description: '濃郁的司陶特啤酒含有豐富的烘焙風味，能夠帶來溫暖的感覺。',
    servingTips: ['室溫或微溫12-14°C', '使用司陶特專用杯', '慢慢品嘗'],
    popularity: 90,
    abvRange: '4.0-8.0%',
    bestTimeOfDay: ['晚上'],
    mood: '溫暖舒適'
  },
  {
    id: 'winter-tripel',
    season: '冬季',
    beerType: '啤酒',
    recommendedStyle: '比利時三料啤酒',
    temperatureRange: '2-10°C',
    weatherCondition: '寒冷乾燥',
    foodPairing: ['聖誕大餐', '起司拼盤', '烘焙糕點', '溫熱料理'],
    occasion: ['聖誕聚會', '新年慶祝', '特殊場合'],
    description: '高酒精度的三料啤酒帶有複雜的香料和果味，適合寒冷的冬夜。',
    servingTips: ['室溫10-12°C', '使用特製三角杯', '搭配甜點'],
    popularity: 87,
    abvRange: '7.5-10.0%',
    bestTimeOfDay: ['晚上'],
    mood: '溫暖豐厚'
  },
  {
    id: 'autumn-porter',
    season: '秋季',
    beerType: '啤酒',
    recommendedStyle: '波特啤酒',
    temperatureRange: '10-18°C',
    weatherCondition: '涼爽多風',
    foodPairing: ['南瓜料理', '燉煮', '野味', '堅果'],
    occasion: ['秋日聚會', '感恩節', '戶外活動'],
    description: '波特啤酒的烘焙麥芽風味與秋季的溫暖氛圍完美契合，口感圓潤。',
    servingTips: ['稍涼8-12°C', '使用品脫杯', '搭配烘焙食品'],
    popularity: 83,
    abvRange: '4.0-7.0%',
    bestTimeOfDay: ['下午', '晚上'],
    mood: '溫暖懷舊'
  },
  {
    id: 'spring-pale-ale',
    season: '春季',
    beerType: '啤酒',
    recommendedStyle: '美式淡色艾爾',
    temperatureRange: '15-22°C',
    weatherCondition: '溫和舒適',
    foodPairing: ['春捲', '輕食', '沙拉', '海鮮'],
    occasion: ['春遊', '戶外聚會', '復活節慶'],
    description: '平衡的苦味和果香風味適合春季的溫和天氣，清新而不過於厚重。',
    servingTips: ['冰鎮至6-8°C', '使用品脫杯', '搭配新鮮食材'],
    popularity: 80,
    abvRange: '4.5-6.2%',
    bestTimeOfDay: ['中午', '下午'],
    mood: '清新活力'
  },
  {
    id: 'spring-session-ipa',
    season: '春季',
    beerType: '啤酒',
    recommendedStyle: '會議IPA',
    temperatureRange: '18-25°C',
    weatherCondition: '溫暖晴朗',
    foodPairing: ['亞洲料理', '辛辣食物', '烤肉', '輕食'],
    occasion: ['春日聚會', '戶外活動', '朋友聚會'],
    description: '較低酒精度的IPA保留了酒花風味，適合春季的輕鬆氛圍。',
    servingTips: ['冰鎮至5-7°C', '使用IPA專用杯', '搭配辛辣食物'],
    popularity: 82,
    abvRange: '4.0-5.0%',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '輕鬆愉悅'
  },
  {
    id: 'winter-spiced',
    season: '冬季',
    beerType: '啤酒',
    recommendedStyle: '香料啤酒',
    temperatureRange: '0-8°C',
    weatherCondition: '寒冷下雪',
    foodPairing: ['聖誕餅乾', '熱布丁', '香料蛋糕', '溫熱甜點'],
    occasion: ['聖誕市場', '冬日節慶', '溫暖聚會'],
    description: '添加肉桂、丁香等香料的啤酒帶來溫暖的香氣，非常適合冬日節慶。',
    servingTips: ['室溫12-14°C', '使用專用杯', '搭配香料甜點'],
    popularity: 78,
    abvRange: '5.0-9.0%',
    bestTimeOfDay: ['晚上'],
    mood: '節慶溫暖'
  },
  {
    id: 'summer-fruity-cider',
    season: '夏季',
    beerType: '蘋果酒',
    recommendedStyle: '水果蘋果酒',
    temperatureRange: '22-30°C',
    weatherCondition: '炎熱濕潤',
    foodPairing: ['水果拼盤', '輕食', '海鮮', '沙拉'],
    occasion: ['夏日派對', '泳池派對', '戶外聚會'],
    description: '添加熱帶水果風味的蘋果酒帶來清新的果香，非常適合炎熱的夏天。',
    servingTips: ['冰鎮至3-5°C', '使用白葡萄酒杯', '搭配新鮮水果'],
    popularity: 84,
    abvRange: '4.0-6.0%',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '清新果香'
  }
];

const WEATHER_GUIDE = [
  {
    condition: '晴天炎熱 (28°C+)',
    icon: Sun,
    recommended: ['德式拉格', '皮爾森', '小麥啤酒', '水果蘋果酒'],
    tips: '選擇清爽、低苦味的啤酒，冰鎮至最低溫度飲用'
  },
  {
    condition: '多雲溫和 (20-27°C)',
    icon: Cloud,
    recommended: ['淡色艾爾', '會議IPA', '傳統蘋果酒', '科隆啤酒'],
    tips: '適合中等酒體的啤酒，平衡苦味和果香'
  },
  {
    condition: '涼爽 (10-19°C)',
    icon: Wind,
    recommended: ['波特啤酒', '深色艾爾', '琥珀艾爾', '比利時艾爾'],
    tips: '可以選擇酒體較重、風味較複雜的啤酒'
  },
  {
    condition: '寒冷 (10°C以下)',
    icon: Snowflake,
    recommended: ['司陶特', '波特', '三料啤酒', '四料啤酒', '香料啤酒'],
    tips: '濃郁、高酒精度的啤酒能帶來溫暖感'
  }
];

export function SeasonalBeerCiderGuide() {
  const [selectedSeason, setSelectedSeason] = useState<string>('全年');
  const [selectedRecommendation, setSelectedRecommendation] = useState<SeasonalRecommendation | null>(null);
  
  const seasons = ['全年', '春季', '夏季', '秋季', '冬季'];
  
  const filteredRecommendations = SEASONAL_RECOMMENDATIONS.filter(rec => 
    selectedSeason === '全年' || rec.season === selectedSeason
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題區域 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
          <Calendar className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-medium">季節性啤酒與蘋果酒指南</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Seasonal Beer & Cider Guide
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          根據季節、天氣和心情選擇最適合的啤酒與蘋果酒，享受全年無休的飲用樂趣。
        </p>
      </motion.div>

      {/* 季節選擇 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              selectedSeason === season
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {season}
          </button>
        ))}
      </motion.div>

      {/* 天氣指南 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {WEATHER_GUIDE.map((guide, index) => {
          const IconComponent = guide.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconComponent className="w-8 h-8 text-amber-400" />
                <h3 className="font-bold text-white text-lg">{guide.condition}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-amber-400 mb-2">推薦風格：</h4>
                  <div className="flex flex-wrap gap-1">
                    {guide.recommended.map((style, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-white/70 text-sm">{guide.tips}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 季節推薦列表 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <GlassWater className="w-6 h-6 text-amber-400" />
          {selectedSeason === '全年' ? '全年推薦' : `${selectedSeason}推薦`}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-amber-500/30 cursor-pointer transition-all duration-300"
              onClick={() => setSelectedRecommendation(recommendation)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{recommendation.recommendedStyle}</h3>
                  <p className="text-amber-300">{recommendation.beerType}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-orange-400" />
                    <span className="text-white/60 text-sm">{recommendation.temperatureRange}</span>
                  </div>
                  <div className="text-amber-400 text-sm">{recommendation.abvRange}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  {recommendation.season}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {recommendation.weatherCondition}
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  人氣 {recommendation.popularity}/100
                </span>
              </div>
              
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                {recommendation.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Utensils className="w-3 h-3" />
                  <span>{recommendation.foodPairing.slice(0, 2).join(', ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400">{recommendation.mood}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 時間飲用指南 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-8 border border-amber-500/20 mb-12"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Coffee className="w-6 h-6 text-amber-400" />
          一天中的飲用指南
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { time: '早晨', period: '上午 6-10 點', beer: '輕淡拉格或小麥啤酒', note: '清爽口感，不會過於厚重' },
            { time: '中午', period: '上午 10 點-下午 2 點', beer: '淡色艾爾或皮爾森', note: '適中酒體，適合午餐搭配' },
            { time: '下午', period: '下午 2-6 點', beer: 'IPA 或水果酒', note: '果香或酒花香氣提升活力' },
            { time: '晚上', period: '下午 6 點以後', beer: '司陶特或三料啤酒', note: '濃郁風味，適合放鬆時刻' }
          ].map((guide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center p-4 bg-white/5 rounded-xl"
            >
              <h3 className="font-bold text-white mb-2">{guide.time}</h3>
              <p className="text-white/60 text-sm mb-2">{guide.period}</p>
              <p className="text-amber-400 font-medium mb-2">{guide.beer}</p>
              <p className="text-white/70 text-xs">{guide.note}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 配餐指南 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-amber-400" />
          季節性配餐指南
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              season: '夏季', 
              foods: ['海鮮', '沙拉', '水果', '輕食'], 
              beers: ['拉格', '小麥啤酒', '水果酒'],
              pairing: '清爽的啤酒與清淡的食物形成完美平衡'
            },
            { 
              season: '秋季', 
              foods: ['南瓜料理', '燉煮', '堅果', '香料糕點'], 
              beers: ['波特', '琥珀艾爾', '深色艾爾'],
              pairing: '溫暖香料風味的啤酒與秋季食材相得益彰'
            },
            { 
              season: '冬季', 
              foods: ['燉煮料理', '起司', '巧克力', '烘焙糕點'], 
              beers: ['司陶特', '三料啤酒', '香料啤酒'],
              pairing: '濃郁的啤酒與豐盛的食物創造溫暖感受'
            },
            { 
              season: '春季', 
              foods: ['新鮮蔬菜', '輕食', '亞洲料理', '水果'], 
              beers: ['淡色艾爾', '會議IPA', '傳統蘋果酒'],
              pairing: '清新的啤酒與春天的新鮮食材完美搭配'
            }
          ].map((guide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <h3 className="font-bold text-white mb-4 text-center">{guide.season}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-amber-400 mb-2">推薦食物：</h4>
                  <div className="flex flex-wrap gap-1">
                    {guide.foods.map((food, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-amber-400 mb-2">推薦啤酒：</h4>
                  <div className="flex flex-wrap gap-1">
                    {guide.beers.map((beer, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                      >
                        {beer}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-white/70 text-sm">{guide.pairing}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 詳細資訊彈窗 */}
      <AnimatePresence>
        {selectedRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecommendation(null)}
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
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedRecommendation.recommendedStyle}</h2>
                  <p className="text-amber-300">{selectedRecommendation.beerType}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {selectedRecommendation.season}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedRecommendation.weatherCondition}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {selectedRecommendation.abvRange}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">推薦理由</h3>
                <p className="text-white/80 leading-relaxed">{selectedRecommendation.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">適飲溫度</h3>
                  <p className="text-amber-400 text-lg font-bold">{selectedRecommendation.temperatureRange}</p>
                  <p className="text-white/60 text-sm mt-2">溫度對啤酒風味表現至關重要</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">最佳時段</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecommendation.bestTimeOfDay.map((time, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">配餐建議</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecommendation.foodPairing.map((food, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">場合推薦</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecommendation.occasion.map((occasion, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">飲用貼士</h3>
                <ul className="space-y-2">
                  {selectedRecommendation.servingTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-white/80">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Sun className="w-4 h-4 text-orange-400" />
                  <span>適飲溫度：{selectedRecommendation.temperatureRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">人氣：</span>
                    <span className="text-amber-400 font-bold">{selectedRecommendation.popularity}/100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}