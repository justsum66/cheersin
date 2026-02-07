'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GlassWater, 
  Star, 
  MapPin, 
  TrendingUp, 
  Filter, 
  Search, 
  ShoppingCart,
  ExternalLink,
  Award,
  Flame
} from 'lucide-react';

interface BeerCiderRecommendation {
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
  price: number; // 價格 (NTD)
  description: string;
  brewingNotes: string; // 釀造特點
  season: '春季' | '夏季' | '秋季' | '冬季' | '全年';
  occasion: string[]; // 適合場合
  popularity: number; // 人氣指數 (1-100)
  isOnProwine: boolean; // 是否在prowine.com.tw上
  prowineUrl?: string; // prowine.com.tw購買連結
  tags: string[]; // 標籤
  availability: '普遍' | '地區性' | '限量' | '季節性'; // 可得性
  bestMatchPercentage: number; // 匹配度百分比
}

const BEER_CIDER_DATABASE: BeerCiderRecommendation[] = [
  {
    id: 'guinness-fb',
    name: '健力士生啤酒',
    type: '啤酒',
    style: '愛爾蘭司陶特',
    origin: '愛爾蘭都柏林',
    abv: 4.1,
    ibu: 45,
    color: '深黑色，豐厚的棕色泡沫',
    aroma: ['烘烤麥芽', '咖啡', '巧克力', '焦糖'],
    taste: ['濃郁的烘烤味', '柔滑口感', '輕微苦味', '奶油般質地'],
    foodPairing: ['牡蠣', '烤肉', '藍紋起司', '巧克力甜點'],
    rating: 4.7,
    price: 180,
    description: '世界上最著名的司陶特啤酒之一，以其獨特的氮氣注入系統和奶油般的口感聞名。',
    brewingNotes: '使用烘烤大麥芽和氮氣混合二氧化碳灌裝，創造獨特口感。',
    season: '全年',
    occasion: ['酒吧聚會', '晚餐配餐', '獨飲'],
    popularity: 92,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/guinness',
    tags: ['經典', '氮氣', '濃郁', '司陶特'],
    availability: '普遍',
    bestMatchPercentage: 95
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
    price: 150,
    description: '世界上第一款皮爾森啤酒，定義了整個皮爾森風格的標準。',
    brewingNotes: '使用捷克薩茲啤酒花和軟水釀造，傳統窖藏技術。',
    season: '全年',
    occasion: ['聚會', '配餐', '日常飲用'],
    popularity: 88,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/pilsner-urquell',
    tags: ['經典', '清爽', '苦味', '皮爾森'],
    availability: '普遍',
    bestMatchPercentage: 90
  },
  {
    id: 'brooklyn-ipa',
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
    price: 220,
    description: '代表性的美式IPA，展示了西海岸風格的強烈酒花特徵。',
    brewingNotes: '大量使用美國西海岸酒花品種，如卡斯卡特和世紀。',
    season: '夏季',
    occasion: ['精釀愛好者聚會', '燒烤派對'],
    popularity: 85,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/brooklyn-ipa',
    tags: ['酒花', '苦味', '柑橘', '美式'],
    availability: '普遍',
    bestMatchPercentage: 88
  },
  {
    id: 'triple-seven',
    name: '三七蘋果酒',
    type: '蘋果酒',
    style: '台灣傳統發酵',
    origin: '台灣',
    abv: 5.5,
    ibu: 5,
    color: '清澈金黃色',
    aroma: ['新鮮蘋果', '花香', '輕微酵母香'],
    taste: ['清脆蘋果味', '輕微酸度', '清爽口感', '乾淨收尾'],
    foodPairing: ['台灣小吃', '海鮮', '沙拉', '輕食'],
    rating: 4.4,
    price: 160,
    description: '台灣本地生產的優質蘋果酒，融合東方口味偏好。',
    brewingNotes: '使用台灣本地蘋果，傳統發酵工藝，輕微碳酸化。',
    season: '夏季',
    occasion: ['輕鬆聚會', '下午茶', '夏日飲用'],
    popularity: 78,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/triple-seven',
    tags: ['台灣', '清爽', '果味', '本地'],
    availability: '地區性',
    bestMatchPercentage: 92
  },
  {
    id: 'brewdog-punk',
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
    price: 200,
    description: '重新定義了現代IPA的概念，平衡了苦味和果味。',
    brewingNotes: '使用多種美國酒花品種，創造獨特的新世界風味。',
    season: '全年',
    occasion: ['聚會', '酒吧', '休閒飲用'],
    popularity: 87,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/brewdog-punk',
    tags: ['平衡', '果味', '易飲', '現代'],
    availability: '普遍',
    bestMatchPercentage: 85
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
    price: 190,
    description: '色彩繽紛的水果啤酒，適合輕鬆場合享用。',
    brewingNotes: '在小麥啤酒中加入新鮮覆盆子釀造，保留水果風味。',
    season: '夏季',
    occasion: ['女生聚會', '夏日派對', '輕鬆場合'],
    popularity: 82,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/fruli',
    tags: ['水果', '粉色', '清爽', '女性友好'],
    availability: '普遍',
    bestMatchPercentage: 87
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
    price: 180,
    description: '台灣精釀啤酒界的代表作品之一，展現本地釀造實力。',
    brewingNotes: '使用美國酒花和台灣本地原料的完美結合。',
    season: '全年',
    occasion: ['台灣美食搭配', '精釀探索'],
    popularity: 80,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/snake-britches',
    tags: ['台灣', '精釀', '清爽', '本地'],
    availability: '地區性',
    bestMatchPercentage: 90
  },
  {
    id: 'chouffe',
    name: '阿登福啤酒',
    type: '艾爾',
    style: '比利時金色艾爾',
    origin: '比利時',
    abv: 8.0,
    ibu: 20,
    color: '明亮金色，豐厚泡沫',
    aroma: ['辛香料', '柑橘', '蜂蜜', '花香'],
    taste: ['複雜香料味', '果味酯類', '微甜口感', '溫暖酒精感'],
    foodPairing: ['比利時菜餚', '起司', '魚類', '家禽'],
    rating: 4.6,
    price: 280,
    description: '來自阿登森林的傳奇啤酒，以其獨特的風味和神秘感聞名。',
    brewingNotes: '使用特殊的比利時酵母菌株，瓶中二次發酵。',
    season: '冬季',
    occasion: ['特殊場合', '品酒會', '獨飲'],
    popularity: 84,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/chouffe',
    tags: ['比利時', '複雜', '香料', '修道院風格'],
    availability: '地區性',
    bestMatchPercentage: 89
  },
  {
    id: 'brooklyn-summer',
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
    price: 170,
    description: '完美的夏日飲品，清爽易飲，適合各種場合。',
    brewingNotes: '使用美國酒花品種，創造清爽平衡的風味。',
    season: '夏季',
    occasion: ['夏日聚會', '戶外活動', '輕鬆飲用'],
    popularity: 79,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/brooklyn-summer',
    tags: ['清爽', '夏日', '易飲', '平衡'],
    availability: '普遍',
    bestMatchPercentage: 83
  },
  {
    id: 'kirin-ichiban',
    name: '麒麟一番榨',
    type: '啤酒',
    style: '日式拉格',
    origin: '日本',
    abv: 5.0,
    ibu: 25,
    color: '清澈淡金色',
    aroma: ['輕微麥芽香', '淡淡酒花香'],
    taste: ['清爽口感', '輕微甜味', '乾淨收尾', '輕柔苦味'],
    foodPairing: ['日式料理', '燒烤', '海鮮', '壽司'],
    rating: 4.1,
    price: 140,
    description: '日本最受歡迎的啤酒之一，以其清爽的口感聞名。',
    brewingNotes: '使用第一道麥汁釀造工藝，確保純淨口感。',
    season: '全年',
    occasion: ['日式餐廳', '居酒屋', '日常飲用'],
    popularity: 91,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/kirin',
    tags: ['日式', '清爽', '輕柔', '日常'],
    availability: '普遍',
    bestMatchPercentage: 80
  }
];

export function BeerCiderRecommendationDatabase() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<BeerCiderRecommendation | null>(null);
  const [filterType, setFilterType] = useState<string>('全部');
  const [filterSeason, setFilterSeason] = useState<string>('全部');
  const [filterPrice, setFilterPrice] = useState<[number, number]>([0, 500]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price' | 'bestMatch'>('popularity');
  const [showProwineOnly, setShowProwineOnly] = useState<boolean>(true);
  
  const types = useMemo(() => {
    const uniqueTypes = [...new Set(BEER_CIDER_DATABASE.map(item => item.type))];
    return ['全部', ...uniqueTypes];
  }, []);
  
  const seasons = ['全部', '春季', '夏季', '秋季', '冬季', '全年'];
  
  const filteredRecommendations = useMemo(() => {
    return BEER_CIDER_DATABASE.filter(recommendation => {
      const matchesType = filterType === '全部' || recommendation.type === filterType;
      const matchesSeason = filterSeason === '全部' || recommendation.season === filterSeason;
      const matchesPrice = recommendation.price >= filterPrice[0] && recommendation.price <= filterPrice[1];
      const matchesSearch = 
        recommendation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesProwine = !showProwineOnly || recommendation.isOnProwine;
      
      return matchesType && matchesSeason && matchesPrice && matchesSearch && matchesProwine;
    });
  }, [filterType, filterSeason, filterPrice, searchTerm, showProwineOnly]);
  
  const sortedRecommendations = useMemo(() => {
    return [...filteredRecommendations].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'bestMatch':
          return b.bestMatchPercentage - a.bestMatchPercentage;
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [filteredRecommendations, sortBy]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題區域 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
          <GlassWater className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-medium">啤酒與蘋果酒推薦資料庫</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Beer & Cider Recommendation Database
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          精選來自世界各地的優質啤酒與蘋果酒，特別推薦 prowine.com.tw 上的優質商品。
        </p>
      </motion.div>

      {/* 搜尋和篩選 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜尋酒款..."
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
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {types.map(type => (
                <option key={type} value={type} className="bg-gray-800">
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {seasons.map(season => (
                <option key={season} value={season} className="bg-gray-800">
                  {season}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="popularity" className="bg-gray-800">人氣排序</option>
              <option value="rating" className="bg-gray-800">評分排序</option>
              <option value="price" className="bg-gray-800">價格排序</option>
              <option value="bestMatch" className="bg-gray-800">匹配度排序</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-white/70 text-sm">價格範圍:</label>
            <input
              type="range"
              min="0"
              max="500"
              value={filterPrice[1]}
              onChange={(e) => setFilterPrice([filterPrice[0], parseInt(e.target.value)])}
              className="w-24 accent-amber-500"
            />
            <span className="text-white/70 text-sm">{filterPrice[0]}-{filterPrice[1]} TWD</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prowine-only"
              checked={showProwineOnly}
              onChange={(e) => setShowProwineOnly(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <label htmlFor="prowine-only" className="text-white/70 text-sm flex items-center gap-1">
              <Flame className="w-4 h-4 text-red-400" />
              僅顯示 prowine.com.tw 商品
            </label>
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
        <span>找到 {sortedRecommendations.length} 款酒品</span>
        <span>總計 {BEER_CIDER_DATABASE.length} 款酒品</span>
      </motion.div>

      {/* 推薦列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${
              recommendation.isOnProwine 
                ? 'border-amber-500/50 hover:border-amber-500/70' 
                : 'border-white/10 hover:border-amber-500/30'
            } cursor-pointer transition-all duration-300 group relative`}
            onClick={() => setSelectedRecommendation(recommendation)}
          >
            {recommendation.isOnProwine && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" />
                ProWine
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {recommendation.name}
                </h3>
                <p className="text-amber-300 text-sm">{recommendation.style}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{recommendation.rating}</span>
                </div>
                <div className="text-amber-400 text-sm font-bold">{recommendation.price} TWD</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {recommendation.type}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {recommendation.abv}% ABV
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                {recommendation.ibu} IBU
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {recommendation.season}
              </span>
            </div>
            
            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {recommendation.description}
            </p>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <MapPin className="w-3 h-3" />
                <span>{recommendation.origin}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{recommendation.popularity}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>{recommendation.bestMatchPercentage}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {recommendation.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>{recommendation.availability}</span>
              </div>
              <div className="flex gap-2">
                {recommendation.prowineUrl && (
                  <a
                    href={recommendation.prowineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(recommendation.prowineUrl, '_blank');
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-500/30 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    購買
                  </a>
                )}
                <button className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white/70 rounded text-xs hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  詳情
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
              className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedRecommendation.isOnProwine && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        ProWine
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-white">{selectedRecommendation.name}</h2>
                  </div>
                  <p className="text-amber-300 text-lg">{selectedRecommendation.style}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {selectedRecommendation.type}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedRecommendation.abv}% ABV
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {selectedRecommendation.ibu} IBU
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedRecommendation.season}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    產品資訊
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">評分：</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white">{selectedRecommendation.rating}/5.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">人氣指數：</span>
                      <span className="text-white">{selectedRecommendation.popularity}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">匹配度：</span>
                      <span className="text-white">{selectedRecommendation.bestMatchPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">酒精度：</span>
                      <span className="text-white">{selectedRecommendation.abv}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">苦味值：</span>
                      <span className="text-white">{selectedRecommendation.ibu} IBU</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">價格：</span>
                      <span className="text-amber-400 font-bold">{selectedRecommendation.price} TWD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">產地：</span>
                      <span className="text-white">{selectedRecommendation.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">可得性：</span>
                      <span className="text-white">{selectedRecommendation.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">特色標籤</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecommendation.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-white mb-3 mt-4">適合場合</h3>
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
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">描述與特色</h3>
                <p className="text-white/80 leading-relaxed">{selectedRecommendation.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">香氣特徵</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecommendation.aroma.map((aroma, idx) => (
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
                    {selectedRecommendation.taste.map((taste, idx) => (
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
                <p className="text-white/80 leading-relaxed">{selectedRecommendation.brewingNotes}</p>
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

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                {selectedRecommendation.prowineUrl && (
                  <a
                    href={selectedRecommendation.prowineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>在 ProWine 購買 - {selectedRecommendation.price} TWD</span>
                  </a>
                )}
                
                <button 
                  onClick={() => setSelectedRecommendation(null)}
                  className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  關閉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}