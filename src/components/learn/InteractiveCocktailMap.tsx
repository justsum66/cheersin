'use client';

import React, { useState } from 'react';
import { m , AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Info, 
  Star, 
  Award, 
  ShoppingBag,
  Globe,
  Sparkles,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface CocktailRegion {
  id: string;
  name: string;
  country: string;
  description: string;
  subRegions: string[];
  ingredients: string[];
  primaryStyles: string[];
  famousBrands: string[];
  climate: string;
  soil: string;
  position: { x: number; y: number };
  color: string;
  area: string;
  foundingYear: number;
  cocktailCapital: string;
  signatureCocktails: string[];
  cocktailCulture: string;
  barScene: string;
  notableBartenders: string[];
  awards: string[];
  popularityRank: number;
  priceRange: string;
  bestTimeToVisit: string[];
  tourismInfo: string;
}

const COCKTAIL_REGIONS: CocktailRegion[] = [
  {
    id: 'usa',
    name: '美國',
    country: '美國',
    description: '調酒的發源地之一，擁有豐富的調酒文化和歷史',
    subRegions: ['紐約', '洛杉磯', '舊金山', '芝加哥'],
    ingredients: ['威士忌', '琴酒', '伏特加', '龍舌蘭'],
    primaryStyles: ['古典調酒', '現代調酒', '禁酒令時期調酒', '工藝調酒'],
    famousBrands: ['Jack Daniel\'s', 'Jim Beam', 'Absolut', 'Patrón'],
    climate: '多樣氣候',
    soil: '多樣土壤',
    position: { x: 15, y: 35 },
    color: '#FF6B6B',
    area: 'North America',
    foundingYear: 1776,
    cocktailCapital: '紐約',
    signatureCocktails: ['古典', '曼哈頓', '血腥瑪麗', '柯夢波丹'],
    cocktailCulture: '酒吧文化發源地，禁酒令時期地下酒吧繁榮',
    barScene: '高端調酒酒吧與街頭酒吧並存',
    notableBartenders: ['Jerry Thomas', 'Harry Johnson', 'Patrick Gavin Duffy'],
    awards: ['IBA經典調酒認證', '世界調酒大賽冠軍'],
    popularityRank: 1,
    priceRange: '$$ - $$$$',
    bestTimeToVisit: ['春季', '秋季'],
    tourismInfo: '體驗正宗美國調酒文化'
  },
  {
    id: 'uk',
    name: '英國',
    country: '英國',
    description: '經典調酒的重要發源地，擁有悠久的酒吧文化',
    subRegions: ['倫敦', '愛丁堡', '曼徹斯特', '利物浦'],
    ingredients: ['琴酒', '威士忌', '杜松子', '苦精'],
    primaryStyles: ['琴酒調酒', '威士忌調酒', '苦味調酒', '古典英式調酒'],
    famousBrands: ['Tanqueray', 'Bombay Sapphire', 'Johnnie Walker', 'Chivas Regal'],
    climate: '溫帶海洋性氣候',
    soil: '肥沃壤土',
    position: { x: 45, y: 20 },
    color: '#4ECDC4',
    area: 'Europe',
    foundingYear: 1707,
    cocktailCapital: '倫敦',
    signatureCocktails: ['馬丁尼', '威士忌酸', '邊車', '內格羅尼'],
    cocktailCulture: '紳士文化與酒吧傳統',
    barScene: '傳統英式酒吧與現代調酒屋',
    notableBartenders: ['Harry Craddock', 'Charles H. Baker Jr.', 'David Embury'],
    awards: ['世界威士忌大獎', '國際調酒協會獎'],
    popularityRank: 3,
    priceRange: '$$$ - $$$$',
    bestTimeToVisit: ['春季', '夏季'],
    tourismInfo: '體驗傳統英式酒吧文化'
  },
  {
    id: 'france',
    name: '法國',
    country: '法國',
    description: '精品調酒與香檳文化的中心',
    subRegions: ['巴黎', '里昂', '波爾多', '尼斯'],
    ingredients: ['香檳', '白蘭地', '利口酒', '水果'],
    primaryStyles: ['香檳調酒', '白蘭地調酒', '法式精緻調酒', '甜味調酒'],
    famousBrands: ['Hennessy', 'Rémy Martin', 'Moët & Chandon', 'Veuve Clicquot'],
    climate: '溫帶海洋性氣候',
    soil: '葡萄園土壤',
    position: { x: 48, y: 25 },
    color: '#45B7D1',
    area: 'Europe',
    foundingYear: 843,
    cocktailCapital: '巴黎',
    signatureCocktails: ['香榭麗舍', '法式75', '邊車', '柯夢波丹'],
    cocktailCulture: '精緻餐飲與調酒藝術',
    barScene: '高級酒吧與小酒館',
    notableBartenders: ['François-Pierre La Guillaume', 'Jerry Thomas', 'Alexandre Gabriel'],
    awards: ['法國美食獎', '國際調酒大師獎'],
    popularityRank: 4,
    priceRange: '$$$ - $$$$$',
    bestTimeToVisit: ['春季', '夏季'],
    tourismInfo: '體驗法式精緻調酒文化'
  },
  {
    id: 'italy',
    name: '義大利',
    country: '義大利',
    description: '苦味調酒與阿佩洛文化的發源地',
    subRegions: ['米蘭', '羅馬', '威尼斯', '佛羅倫斯'],
    ingredients: ['金巴利', '阿佩洛', '普羅塞克', '苦精'],
    primaryStyles: ['苦味調酒', '氣泡調酒', '義式調酒', '餐前酒調酒'],
    famousBrands: ['Campari', 'Aperol', 'Martini & Rossi', 'Luxardo'],
    climate: '地中海氣候',
    soil: '火山土壤',
    position: { x: 52, y: 30 },
    color: '#96CEB4',
    area: 'Europe',
    foundingYear: 1861,
    cocktailCapital: '米蘭',
    signatureCocktails: ['內格羅尼', '阿佩洛調酒', '貝里尼', '斯普利茲'],
    cocktailCulture: '餐前酒文化與社交調酒',
    barScene: '酒吧台文化與餐廳',
    notableBartenders: ['Gaspare Campari', 'Luigi Veronelli', 'Giuseppe Cipriani'],
    awards: ['義大利調酒大獎', '歐洲最佳酒吧獎'],
    popularityRank: 5,
    priceRange: '$$ - $$$',
    bestTimeToVisit: ['春季', '秋季'],
    tourismInfo: '體驗義式餐前酒文化'
  },
  {
    id: 'japan',
    name: '日本',
    country: '日本',
    description: '精緻調酒工藝與和式風格的代表',
    subRegions: ['東京', '大阪', '京都', '神戶'],
    ingredients: ['日本威士忌', '清酒', '梅酒', '和果子'],
    primaryStyles: ['日式調酒', '威士忌調酒', '清酒調酒', '精緻工藝調酒'],
    famousBrands: ['Suntory', 'Nikka', 'Hakutsuru', 'Takara'],
    climate: '溫帶季風氣候',
    soil: '火山灰土壤',
    position: { x: 85, y: 35 },
    color: '#FFEAA7',
    area: 'Asia',
    foundingYear: 660,
    cocktailCapital: '東京',
    signatureCocktails: ['日本調酒', '和風調酒', '威士忌高球', '清酒調酒'],
    cocktailCulture: '工匠精神與精緻工藝',
    barScene: '隱密酒吧與高級調酒屋',
    notableBartenders: ['Shingo Gokan', 'Hidetsugu Ueno', 'Keiichiro Doi'],
    awards: ['世界調酒大師盃', '亞洲最佳酒吧獎'],
    popularityRank: 2,
    priceRange: '$$$ - $$$$$',
    bestTimeToVisit: ['春季', '秋季'],
    tourismInfo: '體驗日式調酒工藝'
  },
  {
    id: 'mexico',
    name: '墨西哥',
    country: '墨西哥',
    description: '龍舌蘭與瑪格麗特的故鄉',
    subRegions: ['墨西哥城', '瓜達拉哈拉', '坎昆', '阿卡普爾科'],
    ingredients: ['龍舌蘭', '梅斯卡爾', '萊姆', '辣椒'],
    primaryStyles: ['龍舌蘭調酒', '熱帶調酒', '辣椒調酒', '果味調酒'],
    famousBrands: ['Patrón', 'Don Julio', 'Herradura', 'Casamigos'],
    climate: '熱帶沙漠氣候',
    soil: '火山土壤',
    position: { x: 20, y: 45 },
    color: '#FD79A8',
    area: 'North America',
    foundingYear: 1821,
    cocktailCapital: '瓜達拉哈拉',
    signatureCocktails: ['瑪格麗特', '帕洛瑪', '龍舌蘭日出', '莫希托'],
    cocktailCulture: '節慶文化與熱情調酒',
    barScene: '海灘酒吧與街頭小酒館',
    notableBartenders: ['Danny Trejo', 'Jesus Armando', 'Carlos Guillermo'],
    awards: ['世界龍舌蘭獎', '拉丁美洲調酒大獎'],
    popularityRank: 6,
    priceRange: '$ - $$',
    bestTimeToVisit: ['冬季', '春季'],
    tourismInfo: '體驗墨西哥熱情調酒'
  },
  {
    id: 'scotland',
    name: '蘇格蘭',
    country: '英國',
    description: '威士忌調酒的發源地',
    subRegions: ['愛丁堡', '格拉斯哥', '斯佩塞', '艾雷島'],
    ingredients: ['蘇格蘭威士忌', '苦精', '蜂蜜', '泥煤'],
    primaryStyles: ['威士忌調酒', '古典調酒', '煙燻調酒', '高地風格'],
    famousBrands: ['Glenfiddich', 'Macallan', 'Lagavulin', 'Johnnie Walker'],
    climate: '溫帶海洋性氣候',
    soil: '泥炭土',
    position: { x: 44, y: 15 },
    color: '#6C5CE7',
    area: 'Europe',
    foundingYear: 1707,
    cocktailCapital: '愛丁堡',
    signatureCocktails: ['古典', '威士忌酸', '蘇格蘭調酒', '高地風情'],
    cocktailCulture: '威士忌文化與高地傳統',
    barScene: '威士忌酒吧與傳統小酒館',
    notableBartenders: ['William Terrington', 'George Kappeler', 'Harry Craddock'],
    awards: ['世界威士忌大獎', '蘇格蘭調酒大師獎'],
    popularityRank: 7,
    priceRange: '$$ - $$$',
    bestTimeToVisit: ['春季', '夏季'],
    tourismInfo: '體驗正宗威士忌調酒'
  },
  {
    id: 'russia',
    name: '俄羅斯',
    country: '俄羅斯',
    description: '伏特加調酒文化的中心',
    subRegions: ['莫斯科', '聖彼得堡', '葉卡捷琳堡', '新西伯利亞'],
    ingredients: ['伏特加', '黑麥', '杜松子', '蜂蜜'],
    primaryStyles: ['伏特加調酒', '北國調酒', '溫暖調酒', '烈酒調酒'],
    famousBrands: ['Smirnoff', 'Absolut', 'Grey Goose', 'Beluga'],
    climate: '大陸性氣候',
    soil: '黑鈣土',
    position: { x: 65, y: 15 },
    color: '#A29BFE',
    area: 'Europe/Asia',
    foundingYear: 1991,
    cocktailCapital: '莫斯科',
    signatureCocktails: ['莫斯科驢子', '血腥瑪麗', '伏特加調酒', '俄式雞尾酒'],
    cocktailCulture: '嚴寒文化與烈酒傳統',
    barScene: '高級酒吧與傳統小酒館',
    notableBartenders: ['Alexei Zheleznov', 'Dmitry Semenov', 'Igor Zagorski'],
    awards: ['世界伏特加大獎', '俄羅斯調酒冠軍'],
    popularityRank: 8,
    priceRange: '$ - $$',
    bestTimeToVisit: ['夏季'],
    tourismInfo: '體驗俄式烈酒文化'
  },
  {
    id: 'brazil',
    name: '巴西',
    country: '巴西',
    description: '熱帶果味調酒的天堂',
    subRegions: ['里約熱內盧', '聖保羅', '薩爾瓦多', '福塔雷薩'],
    ingredients: ['卡莎薩', '鳳梨', '芒果', '椰子'],
    primaryStyles: ['熱帶調酒', '果味調酒', '卡莎薩調酒', '海灘調酒'],
    famousBrands: ['Ypióca', 'Velho Barreiro', 'Pirassununga', '51'],
    climate: '熱帶雨林氣候',
    soil: '紅壤',
    position: { x: 35, y: 60 },
    color: '#FDcb6e',
    area: 'South America',
    foundingYear: 1822,
    cocktailCapital: '里約熱內盧',
    signatureCocktails: ['凱匹林納', '巴西風情', '熱帶日落', '桑巴調酒'],
    cocktailCulture: '嘉年華文化與熱情調酒',
    barScene: '海灘酒吧與夜店',
    notableBartenders: ['Alexandre Campos', 'Rafael Simões', 'Marcelo Vettorazzi'],
    awards: ['南美調酒大獎', '熱帶調酒冠軍'],
    popularityRank: 9,
    priceRange: '$ - $$',
    bestTimeToVisit: ['夏季'],
    tourismInfo: '體驗巴西熱情調酒'
  },
  {
    id: 'spain',
    name: '西班牙',
    country: '西班牙',
    description: '桑格利亞與雪莉酒調酒的發源地',
    subRegions: ['馬德里', '巴塞隆納', '塞維亞', '瓦倫西亞'],
    ingredients: ['葡萄酒', '雪莉酒', '水果', '香料'],
    primaryStyles: ['桑格利亞', '雪莉調酒', '地中海調酒', '果味調酒'],
    famousBrands: ['Tio Pepe', 'Osborne', 'Campo Viejo', 'Familia Torres'],
    climate: '地中海氣候',
    soil: '石灰岩土壤',
    position: { x: 42, y: 30 },
    color: '#E17055',
    area: 'Europe',
    foundingYear: 1469,
    cocktailCapital: '巴塞隆納',
    signatureCocktails: ['桑格利亞', '雪莉調酒', '西班牙風情', '地中海調酒'],
    cocktailCulture: '小食文化與社交調酒',
    barScene: '小酒館與海灘酒吧',
    notableBartenders: ['Marcio Dutra', 'Javier de las Muelas', 'Diego Cabrera'],
    awards: ['歐洲調酒大獎', '西班牙最佳酒吧獎'],
    popularityRank: 10,
    priceRange: '$$ - $$$',
    bestTimeToVisit: ['春季', '夏季'],
    tourismInfo: '體驗西班牙調酒文化'
  }
];

interface RegionComparison {
  id: string;
  name: string;
  metric: string;
  usaValue: string;
  ukValue: string;
  franceValue: string;
  italyValue: string;
  japanValue: string;
}

const REGION_COMPARISONS: RegionComparison[] = [
  { id: 'popularity', name: '人氣排名', metric: '排名', usaValue: '1', ukValue: '3', franceValue: '4', italyValue: '5', japanValue: '2' },
  { id: 'signature-cocktails', name: '招牌調酒數', metric: '數量', usaValue: '20+', ukValue: '15+', franceValue: '12+', italyValue: '10+', japanValue: '18+' },
  { id: 'bar-scene', name: '酒吧景點', metric: '評級', usaValue: '★★★★★', ukValue: '★★★★★', franceValue: '★★★★☆', italyValue: '★★★★☆', japanValue: '★★★★★' },
  { id: 'ingredients', name: '特色原料', metric: '多樣性', usaValue: '★★★★★', ukValue: '★★★★☆', franceValue: '★★★★★', italyValue: '★★★★☆', japanValue: '★★★★★' },
  { id: 'culture', name: '調酒文化', metric: '深度', usaValue: '★★★★★', ukValue: '★★★★★', franceValue: '★★★★★', italyValue: '★★★★☆', japanValue: '★★★★★' }
];

export function InteractiveCocktailMap() {
  const [selectedRegion, setSelectedRegion] = useState<CocktailRegion | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'comparison' | 'tourism'>('info');
  const [showAllRegions, setShowAllRegions] = useState(false);

  const topRegions = COCKTAIL_REGIONS.sort((a, b) => a.popularityRank - b.popularityRank).slice(0, 5);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-white/10 p-4 md:p-6 overflow-hidden">
        {/* World Map Outline */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            <path
              d="M150,200 C180,180 220,180 250,200 C280,220 320,220 350,200 C380,180 420,180 450,200 C480,220 520,220 550,200 C580,180 620,180 650,200 C680,220 720,220 750,200 L750,300 C720,320 680,320 650,300 C620,280 580,280 550,300 C520,320 480,320 450,300 C420,280 380,280 350,300 C320,320 280,320 250,300 C220,280 180,280 150,300 Z"
              fill="#4F46E5"
              stroke="#818CF8"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Region Markers */}
        {COCKTAIL_REGIONS.map((region) => (
          <m.button
            key={region.id}
            className={`absolute w-6 h-6 rounded-full border-2 border-white/50 shadow-lg z-10 ${
              hoveredRegion === region.id ? 'scale-125 z-20' : ''
            } ${selectedRegion?.id === region.id ? 'ring-4 ring-primary-400 scale-125 z-20' : ''}`}
            style={{
              left: `${region.position.x}%`,
              top: `${region.position.y}%`,
              backgroundColor: region.color,
            }}
            onClick={() => setSelectedRegion(region)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`${region.name} - ${region.country}`}
          >
            <m.div
              animate={{ scale: hoveredRegion === region.id ? 1.1 : 1 }}
              className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold drop-shadow-lg"
            >
              {region.popularityRank <= 5 ? (
                <Star className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </m.div>
          </m.button>
        ))}

        {/* Top Regions Panel */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:left-4 w-full md:w-80 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-semibold">熱門調酒產區</h3>
          </div>
          <div className="space-y-2">
            {topRegions.map((region, index) => (
              <m.button
                key={region.id}
                className={`w-full text-left p-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  selectedRegion?.id === region.id
                    ? 'bg-primary-500/30 border border-primary-400'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => setSelectedRegion(region)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-yellow-400 font-bold">#{region.popularityRank}</span>
                <span className="text-white">{region.name}</span>
                <span className="text-white/60 ml-auto">{region.country}</span>
              </m.button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setShowAllRegions(!showAllRegions)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg border border-white/20 transition-colors flex items-center gap-1"
          >
            <Globe className="w-3 h-3" />
            {showAllRegions ? '顯示熱門' : '顯示全部'}
          </button>
        </div>
      </div>

      {/* Region Information Modal */}
      <AnimatePresence>
        {selectedRegion && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRegion(null)}
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
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedRegion.name}</h2>
                    <span className="px-2 py-1 bg-white/10 text-white/80 text-sm rounded">
                      {selectedRegion.country}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-white text-sm">#{selectedRegion.popularityRank}</span>
                    </div>
                  </div>
                  <p className="text-green-300">{selectedRegion.description}</p>
                </div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'info'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  產區資訊
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'comparison'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  區域比較
                </button>
                <button
                  onClick={() => setActiveTab('tourism')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'tourism'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  旅遊資訊
                </button>
              </div>

              <div className="space-y-6">
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-400" />
                          基本資訊
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">成立年份：</span>
                            <span className="text-white">{selectedRegion.foundingYear}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">調酒之都：</span>
                            <span className="text-white">{selectedRegion.cocktailCapital}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">氣候：</span>
                            <span className="text-white">{selectedRegion.climate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">土壤：</span>
                            <span className="text-white">{selectedRegion.soil}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">價格範圍：</span>
                            <span className="text-white">{selectedRegion.priceRange}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-2">招牌調酒</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRegion.signatureCocktails.map((cocktail, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm"
                            >
                              {cocktail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-2">主要風格</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRegion.primaryStyles.map((style, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full text-sm"
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-2">特色原料</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRegion.ingredients.map((ingredient, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-sm"
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-2">知名品牌</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRegion.famousBrands.map((brand, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-full text-sm"
                            >
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comparison' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-2 text-white/60">比較項目</th>
                          <th className="text-center py-2 text-white">美國</th>
                          <th className="text-center py-2 text-white">英國</th>
                          <th className="text-center py-2 text-white">法國</th>
                          <th className="text-center py-2 text-white">義大利</th>
                          <th className="text-center py-2 text-white">日本</th>
                        </tr>
                      </thead>
                      <tbody>
                        {REGION_COMPARISONS.map((comparison) => (
                          <tr key={comparison.id} className="border-b border-white/10">
                            <td className="py-3 text-white">{comparison.name}</td>
                            <td className={`py-3 text-center ${
                              selectedRegion.id === 'usa' ? 'font-bold text-yellow-400' : 'text-white/70'
                            }`}>
                              {comparison.usaValue}
                            </td>
                            <td className={`py-3 text-center ${
                              selectedRegion.id === 'uk' ? 'font-bold text-yellow-400' : 'text-white/70'
                            }`}>
                              {comparison.ukValue}
                            </td>
                            <td className={`py-3 text-center ${
                              selectedRegion.id === 'france' ? 'font-bold text-yellow-400' : 'text-white/70'
                            }`}>
                              {comparison.franceValue}
                            </td>
                            <td className={`py-3 text-center ${
                              selectedRegion.id === 'italy' ? 'font-bold text-yellow-400' : 'text-white/70'
                            }`}>
                              {comparison.italyValue}
                            </td>
                            <td className={`py-3 text-center ${
                              selectedRegion.id === 'japan' ? 'font-bold text-yellow-400' : 'text-white/70'
                            }`}>
                              {comparison.japanValue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'tourism' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-400" />
                        最佳旅遊時間
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.bestTimeToVisit.map((time, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-sm"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                      <p className="text-white/70 text-sm mt-3">{selectedRegion.tourismInfo}</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-2">酒吧景點</h3>
                      <p className="text-white/70 text-sm">{selectedRegion.barScene}</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-2">調酒文化</h3>
                      <p className="text-white/70 text-sm">{selectedRegion.cocktailCulture}</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-2">知名調酒師</h3>
                      <div className="space-y-1">
                        {selectedRegion.notableBartenders.map((bartender, idx) => (
                          <div key={idx} className="text-white/70 text-sm">{bartender}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10 mt-6">
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  關閉
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span>熱門產區</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-3 h-3 rounded-full bg-pink-400"></div>
          <span>特色產區</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span>威士忌產區</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>果味產區</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
          <span>烈酒產區</span>
        </div>
      </div>
    </div>
  );
}