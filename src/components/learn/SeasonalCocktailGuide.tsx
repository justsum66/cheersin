'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sun, Cloud, Snowflake, Wind, GlassWater, Utensils, Coffee } from 'lucide-react';

interface SeasonalRecommendation {
  id: string;
  season: '春季' | '夏季' | '秋季' | '冬季';
  cocktailType: string;
  recommendedCocktail: string;
  temperatureRange: string;
  weatherCondition: string;
  foodPairing: string[];
  occasion: string[];
  description: string;
  servingTips: string[];
  popularity: number;
  strength: '輕盈' | '中等' | '濃烈';
  bestTimeOfDay: string[];
  mood: string;
}

const SEASONAL_RECOMMENDATIONS: SeasonalRecommendation[] = [
  {
    id: 'summer-mojito',
    season: '夏季',
    cocktailType: '清爽調酒',
    recommendedCocktail: '莫希托',
    temperatureRange: '22-28°C',
    weatherCondition: '炎熱晴朗',
    foodPairing: ['海鮮', '沙拉', '輕食', '燒烤'],
    occasion: ['海灘派對', '戶外聚會', '午後休閒'],
    description: '清新的薄荷與青檸風味能有效降溫解渴，是夏日的最佳選擇。',
    servingTips: ['大量冰塊', '新鮮薄荷葉', '氣泡水補充'],
    popularity: 92,
    strength: '輕盈',
    bestTimeOfDay: ['中午', '下午', '傍晚'],
    mood: '清新振奮'
  },
  {
    id: 'summer-margarita',
    season: '夏季',
    cocktailType: '酸甜調酒',
    recommendedCocktail: '瑪格麗特',
    temperatureRange: '25-30°C',
    weatherCondition: '炎熱潮濕',
    foodPairing: ['墨西哥菜', '海鮮', '水果', '輕食'],
    occasion: ['夏日派對', '海灘度假', '戶外活動'],
    description: '酸甜平衡的龍舌蘭調酒，鹽邊設計增加口感層次。',
    servingTips: ['鹽邊杯', '冰鎮', '青檸裝飾'],
    popularity: 88,
    strength: '中等',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '輕鬆愉快'
  },
  {
    id: 'summer-pina-colada',
    season: '夏季',
    cocktailType: '熱帶調酒',
    recommendedCocktail: '鳳梨可樂達',
    temperatureRange: '20-26°C',
    weatherCondition: '溫暖舒適',
    foodPairing: ['熱帶水果', '海鮮', '輕食', '沙拉'],
    occasion: ['海灘度假', '泳池派對', '輕鬆聚會'],
    description: '濃郁的椰子與鳳梨風味，帶來熱帶島嶼的度假氛圍。',
    servingTips: ['碎冰', '新鮮鳳梨', '椰子碎片裝飾'],
    popularity: 85,
    strength: '中等',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '悠閒舒適'
  },
  {
    id: 'winter-old-fashioned',
    season: '冬季',
    cocktailType: '濃烈調酒',
    recommendedCocktail: '古典',
    temperatureRange: '5-15°C',
    weatherCondition: '寒冷多雲',
    foodPairing: ['燉煮料理', '起司', '巧克力甜點', '烤肉'],
    occasion: ['冬夜獨飲', '溫馨聚會', '聖誕節慶'],
    description: '濃郁的威士忌風味與甜潤口感，能夠帶來溫暖的感覺。',
    servingTips: ['大冰塊', '古典杯', '橙皮油香'],
    popularity: 90,
    strength: '濃烈',
    bestTimeOfDay: ['晚上'],
    mood: '溫暖舒適'
  },
  {
    id: 'winter-hot-toddy',
    season: '冬季',
    cocktailType: '熱飲調酒',
    recommendedCocktail: '熱托迪',
    temperatureRange: '2-10°C',
    weatherCondition: '寒冷乾燥',
    foodPairing: ['聖誕大餐', '起司拼盤', '烘焙糕點', '溫熱料理'],
    occasion: ['聖誕聚會', '新年慶祝', '特殊場合'],
    description: '溫熱的蜂蜜威士忌飲品，具有舒緩身心的效果。',
    servingTips: ['溫熱不滾燙', '蜂蜜調味', '肉桂棒裝飾'],
    popularity: 87,
    strength: '中等',
    bestTimeOfDay: ['晚上'],
    mood: '溫暖療癒'
  },
  {
    id: 'autumn-manhattan',
    season: '秋季',
    cocktailType: '古典調酒',
    recommendedCocktail: '曼哈頓',
    temperatureRange: '10-18°C',
    weatherCondition: '涼爽多風',
    foodPairing: ['南瓜料理', '燉煮', '野味', '堅果'],
    occasion: ['秋日聚會', '感恩節', '室內活動'],
    description: '濃郁複雜的威士忌風味與甜苦艾酒的平衡，適合秋季的溫和氛圍。',
    servingTips: ['冰鎮', '馬丁尼杯', '櫻桃裝飾'],
    popularity: 83,
    strength: '濃烈',
    bestTimeOfDay: ['下午', '晚上'],
    mood: '溫暖懷舊'
  },
  {
    id: 'spring-martini',
    season: '春季',
    cocktailType: '清新調酒',
    recommendedCocktail: '馬丁尼',
    temperatureRange: '15-22°C',
    weatherCondition: '溫和舒適',
    foodPairing: ['春捲', '輕食', '沙拉', '海鮮'],
    occasion: ['春遊', '戶外聚會', '復活節慶'],
    description: '清澈的琴酒風味與乾淨口感，適合春季的清新氛圍。',
    servingTips: ['極冰鎮', '馬丁尼杯', '橄欖或檸檬皮'],
    popularity: 80,
    strength: '濃烈',
    bestTimeOfDay: ['中午', '下午'],
    mood: '清新活力'
  },
  {
    id: 'spring-cosmo',
    season: '春季',
    cocktailType: '果味調酒',
    recommendedCocktail: '都會',
    temperatureRange: '18-25°C',
    weatherCondition: '溫暖晴朗',
    foodPairing: ['亞洲料理', '辛辣食物', '烤肉', '輕食'],
    occasion: ['春日聚會', '朋友聚會', '時尚派對'],
    description: '酸甜的蔓越莓風味與清新的口感，適合春季的輕鬆氛圍。',
    servingTips: ['冰鎮', '馬丁尼杯', '青檸片裝飾'],
    popularity: 82,
    strength: '中等',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '輕鬆愉悅'
  },
  {
    id: 'winter-negroni',
    season: '冬季',
    cocktailType: '苦甜調酒',
    recommendedCocktail: '內格羅尼',
    temperatureRange: '0-8°C',
    weatherCondition: '寒冷下雪',
    foodPairing: ['開胃菜', '起司', '堅果', '溫熱小食'],
    occasion: ['餐前酒', '冬日節慶', '溫暖聚會'],
    description: '苦甜平衡的經典義大利調酒，濃郁風味適合冬日。',
    servingTips: ['大冰塊', '岩石杯', '橙皮油香'],
    popularity: 78,
    strength: '濃烈',
    bestTimeOfDay: ['晚上'],
    mood: '濃郁深沉'
  },
  {
    id: 'summer-caipirinha',
    season: '夏季',
    cocktailType: '熱帶調酒',
    recommendedCocktail: '凱匹林納',
    temperatureRange: '22-30°C',
    weatherCondition: '炎熱濕潤',
    foodPairing: ['巴西料理', '海鮮', '輕食', '沙拉'],
    occasion: ['夏日派對', '泳池派對', '戶外聚會'],
    description: '巴西國酒，青檸與甘蔗酒的清新組合，非常適合炎熱的夏天。',
    servingTips: ['碎冰', '新鮮青檸', '搗碎技巧'],
    popularity: 84,
    strength: '中等',
    bestTimeOfDay: ['下午', '傍晚'],
    mood: '清新果香'
  }
];

const WEATHER_GUIDE = [
  {
    condition: '晴天炎熱 (28°C+)',
    icon: Sun,
    recommended: ['莫希托', '瑪格麗特', '鳳梨可樂達', '凱匹林納'],
    tips: '選擇清爽、輕盈的調酒，冰鎮至最低溫度飲用'
  },
  {
    condition: '多雲溫和 (20-27°C)',
    icon: Cloud,
    recommended: ['都會', '金菲茲', '邊車', '柯夢波丹'],
    tips: '適合中等酒體的調酒，平衡果香與烈酒風味'
  },
  {
    condition: '涼爽 (10-19°C)',
    icon: Wind,
    recommended: ['古典', '曼哈頓', '威士忌酸', '內格羅尼'],
    tips: '可以選擇酒體較重、風味較複雜的調酒'
  },
  {
    condition: '寒冷 (10°C以下)',
    icon: Snowflake,
    recommended: ['熱托迪', '熱紅酒', '布蘭地熱托迪', '威士忌咖啡'],
    tips: '溫熱調酒能帶來溫暖感，適合寒冷天氣'
  }
];

export function SeasonalCocktailGuide() {
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full mb-4">
          <Calendar className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">季節性調酒指南</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Seasonal Cocktail Guide
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          根據季節、天氣和心情選擇最適合的調酒，享受全年無休的飲用樂趣。
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
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
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
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconComponent className="w-8 h-8 text-green-400" />
                <h3 className="font-bold text-white text-lg">{guide.condition}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-400 mb-2">推薦調酒：</h4>
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
          <GlassWater className="w-6 h-6 text-green-400" />
          {selectedSeason === '全年' ? '全年推薦' : `${selectedSeason}推薦`}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-green-500/30 cursor-pointer transition-all duration-300"
              onClick={() => setSelectedRecommendation(recommendation)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{recommendation.recommendedCocktail}</h3>
                  <p className="text-green-300">{recommendation.cocktailType}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-orange-400" />
                    <span className="text-white/60 text-sm">{recommendation.temperatureRange}</span>
                  </div>
                  <div className="text-green-400 text-sm">{recommendation.strength}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {recommendation.season}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {recommendation.weatherCondition}
                </span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
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
                  <Coffee className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">{recommendation.mood}</span>
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
        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-8 border border-green-500/20 mb-12"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Coffee className="w-6 h-6 text-green-400" />
          一天中的飲用指南
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { time: '早晨', period: '上午 6-10 點', cocktail: '血腥瑪麗或貝里尼', note: '輕微酒精，搭配早餐享用' },
            { time: '中午', period: '上午 10 點-下午 2 點', cocktail: '柯夢波丹或貝理斯達', note: '適中酒精度，適合午餐搭配' },
            { time: '下午', period: '下午 2-6 點', cocktail: '都會或馬丁尼', note: '清新風味，提升下午活力' },
            { time: '晚上', period: '下午 6 點以後', cocktail: '古典或內格羅尼', note: '濃郁風味，適合放鬆時刻' }
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
              <p className="text-green-400 font-medium mb-2">{guide.cocktail}</p>
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
          <Utensils className="w-6 h-6 text-green-400" />
          季節性配餐指南
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              season: '夏季', 
              foods: ['海鮮', '沙拉', '水果', '輕食'], 
              cocktails: ['莫希托', '瑪格麗特', '鳳梨可樂達'],
              pairing: '清爽的調酒與清淡的食物形成完美平衡'
            },
            { 
              season: '秋季', 
              foods: ['南瓜料理', '燉煮', '堅果', '香料糕點'], 
              cocktails: ['曼哈頓', '古典', '威士忌酸'],
              pairing: '濃郁風味的調酒與秋季食材相得益彰'
            },
            { 
              season: '冬季', 
              foods: ['燉煮料理', '起司', '巧克力', '烘焙糕點'], 
              cocktails: ['熱托迪', '古典', '內格羅尼'],
              pairing: '濃郁的調酒與豐盛的食物創造溫暖感受'
            },
            { 
              season: '春季', 
              foods: ['新鮮蔬菜', '輕食', '亞洲料理', '水果'], 
              cocktails: ['都會', '馬丁尼', '邊車'],
              pairing: '清新的調酒與春天的新鮮食材完美搭配'
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
                  <h4 className="font-medium text-green-400 mb-2">推薦食物：</h4>
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
                  <h4 className="font-medium text-green-400 mb-2">推薦調酒：</h4>
                  <div className="flex flex-wrap gap-1">
                    {guide.cocktails.map((cocktail, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                      >
                        {cocktail}
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
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedRecommendation.recommendedCocktail}</h2>
                  <p className="text-green-300">{selectedRecommendation.cocktailType}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {selectedRecommendation.season}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedRecommendation.weatherCondition}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedRecommendation.strength}
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
                  <p className="text-green-400 text-lg font-bold">{selectedRecommendation.temperatureRange}</p>
                  <p className="text-white/60 text-sm mt-2">溫度對調酒風味表現至關重要</p>
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
                      <span className="text-green-400 mt-1">•</span>
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
                    <span className="text-green-400 font-bold">{selectedRecommendation.popularity}/100</span>
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