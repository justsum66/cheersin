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

interface CocktailRecommendation {
  id: string;
  name: string;
  category: '經典' | '現代' | '熱帶' | '古典' | '創意' | '地區特色';
  baseSpirit: string; // 基酒
  ingredients: string[]; // 成分
  garnish: string; // 裝飾
  preparation: string; // 調製方法
  glassware: string; // 酒杯
  strength: '輕盈' | '中等' | '濃烈'; // 酒精度
  complexity: '簡單' | '中等' | '複雜'; // 調製難度
  flavorProfile: string[]; // 風味特徵
  occasion: string[]; // 適合場合
  rating: number; // 評分
  price: number; // 價格 (NTD)
  description: string;
  origin: string; // 起源地
  popularity: number; // 人氣指數 (1-100)
  isOnProwine: boolean; // 是否在prowine.com.tw上
  prowineUrl?: string; // prowine.com.tw購買連結
  tags: string[]; // 標籤
  availability: '普遍' | '地區性' | '限量' | '季節性'; // 可得性
  bestMatchPercentage: number; // 匹配度百分比
  servingTemp: string; // 建議飲用溫度
  iceMethod: string; // 冰塊使用方式
}

const COCKTAIL_DATABASE: CocktailRecommendation[] = [
  {
    id: 'manhattan',
    name: '曼哈頓',
    category: '古典',
    baseSpirit: '黑麥威士忌',
    ingredients: ['黑麥威士忌', '甜苦艾酒', '安格斯特拉苦精'],
    garnish: '馬拉斯奇諾櫻桃',
    preparation: '將所有材料與冰塊放入調酒杯中攪拌，過濾倒入馬丁尼杯中，以櫻桃裝飾。',
    glassware: '馬丁尼杯',
    strength: '濃烈',
    complexity: '簡單',
    flavorProfile: ['濃郁', '甜潤', '香料味', '複雜'],
    occasion: ['正式晚宴', '雞尾酒時光', '浪漫約會'],
    rating: 4.8,
    price: 450,
    description: '起源於19世紀末紐約曼哈頓俱樂部的經典調酒，以其濃郁複雜的風味聞名。',
    origin: '美國紐約',
    popularity: 92,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/manhattan-kit',
    tags: ['經典', '威士忌', '甜味', '苦精'],
    availability: '普遍',
    bestMatchPercentage: 95,
    servingTemp: '冰鎮',
    iceMethod: '大冰塊攪拌'
  },
  {
    id: 'margarita',
    name: '瑪格麗特',
    category: '經典',
    baseSpirit: '龍舌蘭',
    ingredients: ['龍舌蘭', '橙味利口酒', '青檸汁'],
    garnish: '鹽邊、青檸角',
    preparation: '將杯緣沾濕後蘸鹽，將所有材料與冰塊放入搖酒器中搖和，過濾倒入杯中。',
    glassware: '瑪格麗特杯',
    strength: '中等',
    complexity: '中等',
    flavorProfile: ['酸甜', '清新', '柑橘', '平衡'],
    occasion: ['派對', '海灘度假', '夏日聚會'],
    rating: 4.7,
    price: 420,
    description: '墨西哥最具代表性的調酒之一，以其完美的酸甜平衡和鹽邊風味聞名。',
    origin: '墨西哥',
    popularity: 95,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/margarita-set',
    tags: ['龍舌蘭', '酸甜', '鹽邊', '清新'],
    availability: '普遍',
    bestMatchPercentage: 92,
    servingTemp: '冰鎮',
    iceMethod: '碎冰搖和'
  },
  {
    id: 'negroni',
    name: '內格羅尼',
    category: '經典',
    baseSpirit: '琴酒',
    ingredients: ['琴酒', '金巴利', '甜苦艾酒'],
    garnish: '橙皮',
    preparation: '將所有材料與冰塊放入岩石杯中攪拌，加入大冰塊，以橙皮裝飾。',
    glassware: '岩石杯',
    strength: '濃烈',
    complexity: '簡單',
    flavorProfile: ['苦甜', '草本', '複雜', '平衡'],
    occasion: ['餐前酒', '下班放鬆', '品味時光'],
    rating: 4.6,
    price: 480,
    description: '義大利經典調酒，以其完美的苦甜平衡和草本風味聞名。',
    origin: '義大利佛羅倫斯',
    popularity: 88,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/negroni-gin',
    tags: ['琴酒', '苦甜', '草本', '餐前酒'],
    availability: '普遍',
    bestMatchPercentage: 90,
    servingTemp: '冰鎮',
    iceMethod: '大冰塊'
  },
  {
    id: 'mojito',
    name: '莫希托',
    category: '熱帶',
    baseSpirit: '白朗姆酒',
    ingredients: ['白朗姆酒', '青檸汁', '糖', '薄荷葉', '蘇打水'],
    garnish: '薄荷枝、青檸角',
    preparation: '在杯中搗碎薄荷葉和糖，加入青檸汁和朗姆酒，加冰攪拌，倒入蘇打水，以薄荷枝裝飾。',
    glassware: '高球杯',
    strength: '輕盈',
    complexity: '中等',
    flavorProfile: ['清新', '薄荷', '柑橘', '氣泡'],
    occasion: ['夏日派對', '海灘', '輕鬆聚會'],
    rating: 4.5,
    price: 380,
    description: '古巴最具代表性的調酒，以其清新薄荷風味和氣泡感聞名。',
    origin: '古巴哈瓦那',
    popularity: 90,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/mojito-kit',
    tags: ['朗姆酒', '薄荷', '清新', '夏日'],
    availability: '普遍',
    bestMatchPercentage: 88,
    servingTemp: '冰鎮',
    iceMethod: '大量冰塊'
  },
  {
    id: 'old-fashioned',
    name: '古典',
    category: '古典',
    baseSpirit: '波本威士忌',
    ingredients: ['波本威士忌', '方糖', '水', '安格斯特拉苦精'],
    garnish: '橙皮',
    preparation: '在岩石杯中溶解方糖於水中，加入苦精，倒入威士忌和冰塊，以橙皮裝飾。',
    glassware: '岩石杯',
    strength: '濃烈',
    complexity: '簡單',
    flavorProfile: ['濃郁', '甜潤', '橡木', '溫暖'],
    occasion: ['正式場合', '下班放鬆', '品味威士忌'],
    rating: 4.7,
    price: 460,
    description: '美國最古老的調酒之一，以其純粹的威士忌風味和經典調製方法聞名。',
    origin: '美國肯塔基州',
    popularity: 87,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/old-fashioned-set',
    tags: ['威士忌', '古典', '濃郁', '純粹'],
    availability: '普遍',
    bestMatchPercentage: 89,
    servingTemp: '冰鎮',
    iceMethod: '大冰塊'
  },
  {
    id: 'cosmopolitan',
    name: '都會',
    category: '現代',
    baseSpirit: '伏特加',
    ingredients: ['伏特加', '蔓越莓汁', '青檸汁', '君度橙酒'],
    garnish: '青檸片',
    preparation: '將所有材料與冰塊放入搖酒器中搖和，過濾倒入馬丁尼杯中，以青檸片裝飾。',
    glassware: '馬丁尼杯',
    strength: '中等',
    complexity: '中等',
    flavorProfile: ['酸甜', '果味', '清新', '女性化'],
    occasion: ['女孩之夜', '時尚派對', '都市生活'],
    rating: 4.4,
    price: 430,
    description: '1970年代調製的現代經典，因影集「慾望城市」而風靡全球。',
    origin: '美國康乃狄克州',
    popularity: 85,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/cosmopolitan-vodka',
    tags: ['伏特加', '果味', '女性', '時尚'],
    availability: '普遍',
    bestMatchPercentage: 85,
    servingTemp: '冰鎮',
    iceMethod: '細冰搖和'
  },
  {
    id: 'maitai',
    name: '邁泰',
    category: '熱帶',
    baseSpirit: '白朗姆酒',
    ingredients: ['白朗姆酒', '黑朗姆酒', '杏仁糖漿', '青檸汁', '橙味利口酒'],
    garnish: '鳳梨片、薄荷枝',
    preparation: '將所有材料與冰塊放入搖酒器中搖和，倒入柯林斯杯中加冰，以鳳梨片和薄荷枝裝飾。',
    glassware: '柯林斯杯',
    strength: '中等',
    complexity: '複雜',
    flavorProfile: ['熱帶', '果味', '平衡', '複雜'],
    occasion: ['海灘派對', '度假', '夏威夷風格'],
    rating: 4.5,
    price: 480,
    description: '提基文化的代表調酒，以其複雜的朗姆酒風味和熱帶風情聞名。',
    origin: '美國加州',
    popularity: 82,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/tiki-cocktail',
    tags: ['朗姆酒', '熱帶', '複雜', '提基'],
    availability: '普遍',
    bestMatchPercentage: 87,
    servingTemp: '冰鎮',
    iceMethod: '大量碎冰'
  },
  {
    id: 'sidecar',
    name: '邊車',
    category: '古典',
    baseSpirit: '白蘭地',
    ingredients: ['白蘭地', '君度橙酒', '檸檬汁'],
    garnish: '糖邊',
    preparation: '將杯緣沾檸檬汁後蘸糖，將所有材料與冰塊放入搖酒器中搖和，過濾倒入杯中。',
    glassware: '邊車杯',
    strength: '濃烈',
    complexity: '中等',
    flavorProfile: ['酸甜', '柑橘', '烈酒', '平衡'],
    occasion: ['正式晚宴', '餐後酒', '品味時光'],
    rating: 4.6,
    price: 470,
    description: '以完美酸甜平衡聞名的經典調酒，是白蘭地調酒的典範。',
    origin: '法國巴黎',
    popularity: 78,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/brandy-cocktails',
    tags: ['白蘭地', '酸甜', '經典', '平衡'],
    availability: '普遍',
    bestMatchPercentage: 84,
    servingTemp: '冰鎮',
    iceMethod: '細冰搖和'
  },
  {
    id: 'bloody-mary',
    name: '血腥瑪麗',
    category: '創意',
    baseSpirit: '伏特加',
    ingredients: ['伏特加', '番茄汁', '檸檬汁', '伍斯特醬', '塔巴斯科醬', '胡椒', '鹽'],
    garnish: '芹菜棒、青檸角',
    preparation: '將所有材料與冰塊放入調酒器中攪拌，倒入高球杯中，以芹菜棒和青檸角裝飾。',
    glassware: '高球杯',
    strength: '中等',
    complexity: '複雜',
    flavorProfile: ['鹹味', '辛辣', '蔬菜', '早餐風'],
    occasion: ['早午餐', '解宿醉', '週末放鬆'],
    rating: 4.3,
    price: 400,
    description: '以其複雜的調料組合和獨特風味聞名的早餐調酒。',
    origin: '法國巴黎',
    popularity: 80,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/breakfast-cocktails',
    tags: ['伏特加', '鹹味', '辛辣', '早餐'],
    availability: '普遍',
    bestMatchPercentage: 82,
    servingTemp: '冰鎮',
    iceMethod: '大量冰塊'
  },
  {
    id: 'whiskey-sour',
    name: '威士忌酸',
    category: '古典',
    baseSpirit: '波本威士忌',
    ingredients: ['波本威士忌', '檸檬汁', '糖漿', '蛋白(可選)'],
    garnish: '檸檬片、紅櫻桃',
    preparation: '將所有材料放入搖酒器中乾搖(不加冰)，再加冰搖和，過濾倒入岩石杯中，以檸檬片和櫻桃裝飾。',
    glassware: '岩石杯',
    strength: '中等',
    complexity: '中等',
    flavorProfile: ['酸甜', '威士忌', '平衡', '綿密'],
    occasion: ['餐後酒', '品味威士忌', '輕鬆聚會'],
    rating: 4.6,
    price: 440,
    description: '酸甜平衡的經典威士忌調酒，以其綿密的蛋白質感聞名。',
    origin: '美國肯塔基州',
    popularity: 84,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/whiskey-sour-kit',
    tags: ['威士忌', '酸甜', '蛋白', '平衡'],
    availability: '普遍',
    bestMatchPercentage: 86,
    servingTemp: '冰鎮',
    iceMethod: '大冰塊'
  }
];

export function CocktailRecommendationDatabase() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<CocktailRecommendation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [filterStrength, setFilterStrength] = useState<string>('全部');
  const [filterPrice, setFilterPrice] = useState<[number, number]>([0, 1000]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price' | 'bestMatch'>('popularity');
  const [showProwineOnly, setShowProwineOnly] = useState<boolean>(true);
  
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(COCKTAIL_DATABASE.map(item => item.category))];
    return ['全部', ...uniqueCategories];
  }, []);
  
  const strengths = ['全部', '輕盈', '中等', '濃烈'];
  
  const filteredRecommendations = useMemo(() => {
    return COCKTAIL_DATABASE.filter(recommendation => {
      const matchesCategory = filterCategory === '全部' || recommendation.category === filterCategory;
      const matchesStrength = filterStrength === '全部' || recommendation.strength === filterStrength;
      const matchesPrice = recommendation.price >= filterPrice[0] && recommendation.price <= filterPrice[1];
      const matchesSearch = 
        recommendation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.baseSpirit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesProwine = !showProwineOnly || recommendation.isOnProwine;
      
      return matchesCategory && matchesStrength && matchesPrice && matchesSearch && matchesProwine;
    });
  }, [filterCategory, filterStrength, filterPrice, searchTerm, showProwineOnly]);
  
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full mb-4">
          <GlassWater className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">調酒推薦資料庫</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Cocktail Recommendation Database
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          精選來自世界各地的優質調酒，特別推薦 prowine.com.tw 上的優質商品。
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
              placeholder="搜尋調酒..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterStrength}
              onChange={(e) => setFilterStrength(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              {strengths.map(strength => (
                <option key={strength} value={strength} className="bg-gray-800">
                  {strength}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
              max="1000"
              value={filterPrice[1]}
              onChange={(e) => setFilterPrice([filterPrice[0], parseInt(e.target.value)])}
              className="w-24 accent-green-500"
            />
            <span className="text-white/70 text-sm">{filterPrice[0]}-{filterPrice[1]} TWD</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prowine-only"
              checked={showProwineOnly}
              onChange={(e) => setShowProwineOnly(e.target.checked)}
              className="w-4 h-4 accent-green-500"
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
        <span>找到 {sortedRecommendations.length} 款調酒</span>
        <span>總計 {COCKTAIL_DATABASE.length} 款調酒</span>
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
                ? 'border-green-500/50 hover:border-green-500/70' 
                : 'border-white/10 hover:border-green-500/30'
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
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                  {recommendation.name}
                </h3>
                <p className="text-green-300 text-sm">{recommendation.baseSpirit}基調酒</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{recommendation.rating}</span>
                </div>
                <div className="text-green-400 text-sm font-bold">{recommendation.price} TWD</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                {recommendation.category}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {recommendation.strength}
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {recommendation.complexity}
              </span>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {recommendation.origin}
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
                <div className="flex items-center gap-1 text-xs text-green-400">
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
                    className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
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
                  <p className="text-green-300 text-lg">{selectedRecommendation.baseSpirit}基調酒</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {selectedRecommendation.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedRecommendation.strength}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedRecommendation.complexity}
                    </span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {selectedRecommendation.origin}
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
                    <Award className="w-5 h-5 text-green-400" />
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
                      <span className="text-white/60">基酒：</span>
                      <span className="text-white">{selectedRecommendation.baseSpirit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">強度：</span>
                      <span className="text-white">{selectedRecommendation.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">價格：</span>
                      <span className="text-green-400 font-bold">{selectedRecommendation.price} TWD</span>
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
                        className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
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
                  <h3 className="font-semibold text-white mb-3">風味特徵</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecommendation.flavorProfile.map((flavor, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-3">調製方法</h3>
                  <p className="text-white/80 text-sm">{selectedRecommendation.preparation}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">成分與裝飾</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">成分</h4>
                    <ul className="space-y-1">
                      {selectedRecommendation.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-white/70 text-sm flex items-center gap-2">
                          <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">裝飾</h4>
                    <p className="text-white/70 text-sm">{selectedRecommendation.garnish}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">酒杯與服務</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">酒杯</h4>
                    <p className="text-white/70 text-sm">{selectedRecommendation.glassware}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">飲用溫度</h4>
                    <p className="text-white/70 text-sm">{selectedRecommendation.servingTemp}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">冰塊方式</h4>
                    <p className="text-white/70 text-sm">{selectedRecommendation.iceMethod}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">難度</h4>
                    <p className="text-white/70 text-sm">{selectedRecommendation.complexity}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                {selectedRecommendation.prowineUrl && (
                  <a
                    href={selectedRecommendation.prowineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors"
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