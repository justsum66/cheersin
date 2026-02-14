import React, { useState, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Search, Filter, Star, MapPin, DollarSign, Calendar, Wine, ShoppingCart, Heart, ChevronDown, TrendingUp, Award } from 'lucide-react'
import { getTaiwanWinesHotBottles, type BottleWithBrand } from '@/lib/taiwan-wines'

interface WineRecommendation {
  id: string
  name: string
  type: string
  region: string
  country: string
  priceRange: string
  rating: number
  description: string
  grapeVarieties: string[]
  foodPairing: string[]
  awards: string[]
  bestFor: string[]
  pros: string[]
  cons: string[]
  purchaseLinks: {
    platform: string
    url: string
    price: string
    availability: 'in_stock' | 'limited' | 'out_of_stock'
  }[]
  seasonalRecommendation: {
    season: string
    reason: string
    occasions: string[]
  }
  similarWines: string[]
  expertReview: {
    sommelier: string
    rating: number
    comments: string
  }
}

const WINE_RECOMMENDATIONS: WineRecommendation[] = [
  {
    id: 'wine-001',
    name: 'Château Margaux 2015',
    type: '紅葡萄酒',
    region: '波爾多',
    country: '法國',
    priceRange: 'NT$ 8,000-12,000',
    rating: 4.8,
    description: '波爾多左岸的傳奇酒莊，2015年份被譽為世紀年份，展現出完美的平衡與複雜度。',
    grapeVarieties: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Petit Verdot'],
    foodPairing: ['牛排', '羊排', '陳年起司', '黑巧克力'],
    awards: ['羅伯特·帕克 98分', 'Wine Spectator 年度百大', 'Decanter 金牌'],
    bestFor: ['收藏投資', '重要慶典', '專業品鑑', '送禮'],
    pros: ['層次豐富', '陳年潛力佳', '品牌價值高'],
    cons: ['價格昂貴', '需要醒酒時間', '年輕時較緊澀'],
    purchaseLinks: [
      {
        platform: 'ProWine 專業酒類網站',
        url: 'http://prowine.com.tw/product/chateau-margaux-2015',
        price: 'NT$ 9,800',
        availability: 'limited'
      },
      {
        platform: '高級百貨專櫃',
        url: '#',
        price: 'NT$ 10,500',
        availability: 'in_stock'
      }
    ],
    seasonalRecommendation: {
      season: '冬季',
      reason: '濃郁的酒體和複雜的香氣非常適合寒冷季節',
      occasions: ['聖誕節', '跨年', '正式晚宴']
    },
    similarWines: ['Château Latour 2015', 'Château Mouton Rothschild 2015'],
    expertReview: {
      sommelier: '侍酒師 Alex',
      rating: 4.9,
      comments: '香氣層次豐富，單寧細緻，餘韻悠長，絕對值得收藏'
    }
  },
  {
    id: 'wine-002',
    name: 'Domaine Leflaive Puligny-Montrachet 2020',
    type: '白酒',
    region: '勃根地',
    country: '法國',
    priceRange: 'NT$ 6,000-8,000',
    rating: 4.7,
    description: '勃根地白酒的典範，來自蒙哈榭特級園，展現出礦物質和柑橘類香氣的完美平衡。',
    grapeVarieties: ['Chardonnay'],
    foodPairing: ['龍蝦', '生蠔', '奶油白醬料理', '山羊起司'],
    awards: ['勃根地指南 17/20', 'Wine Enthusiast 96分'],
    bestFor: ['精緻聚會', '海鮮料理', '專業收藏', '投資'],
    pros: ['礦物質香氣突出', '酸度平衡完美', '產區聲譽卓著'],
    cons: ['價格偏高', '產量稀少', '需要適飲溫度控制'],
    purchaseLinks: [
      {
        platform: 'ProWine 專業酒類網站',
        url: 'http://prowine.com.tw/product/domaine-leflaive-puligny-montrachet-2020',
        price: 'NT$ 7,200',
        availability: 'in_stock'
      },
      {
        platform: '專業酒商',
        url: '#',
        price: 'NT$ 7,500',
        availability: 'limited'
      }
    ],
    seasonalRecommendation: {
      season: '春季',
      reason: '清新的酸度和花香非常適合春日聚會',
      occasions: ['春酒會', '母親節', '野餐']
    },
    similarWines: ['Domaine de la Romanée-Conti Montrachet', 'Coche-Dury Meursault'],
    expertReview: {
      sommelier: '侍酒師 Bella',
      rating: 4.8,
      comments: '礦物質香氣令人驚艷，酸度平衡完美，是勃根地白酒的教科書'
    }
  },
  {
    id: 'wine-003',
    name: 'Krug Grande Cuvée',
    type: '香檳',
    region: '香檳區',
    country: '法國',
    priceRange: 'NT$ 4,500-6,000',
    rating: 4.9,
    description: '香檳界的傳奇，_blend_了超過120個不同年份的基酒，複雜度無與倫比。',
    grapeVarieties: ['Pinot Noir', 'Chardonnay', 'Pinot Meunier'],
    foodPairing: ['魚子醬', '生蠔', '精緻開胃菜', '慶祝場合'],
    awards: ['香檳指南 18/20', 'James Suckling 97分'],
    bestFor: ['慶祝場合', '商務宴請', '收藏投資', '節日禮物'],
    pros: ['香氣複雜層次豐富', '氣泡細緻綿長', '品牌歷史悠久'],
    cons: ['價格昂貴', '日常飲用成本高'],
    purchaseLinks: [
      {
        platform: 'ProWine 專業酒類網站',
        url: 'http://prowine.com.tw/product/krug-grande-cuvee',
        price: 'NT$ 5,200',
        availability: 'in_stock'
      },
      {
        platform: '高級百貨',
        url: '#',
        price: 'NT$ 5,500',
        availability: 'limited'
      }
    ],
    seasonalRecommendation: {
      season: '節慶季',
      reason: '完美的慶祝用酒，適合各種節日場合',
      occasions: ['新年', '結婚紀念日', '升職慶祝', '生日']
    },
    similarWines: ['Dom Pérignon Vintage', 'Bollinger RD'],
    expertReview: {
      sommelier: '侍酒師 Chris',
      rating: 5.0,
      comments: '香氣複雜層次豐富，氣泡細緻綿長，慶祝時刻的最佳選擇'
    }
  },
  {
    id: 'wine-004',
    name: 'Kavalan Solist Vinho Barrique',
    type: '威士忌',
    region: '宜蘭',
    country: '台灣',
    priceRange: 'NT$ 2,500-3,500',
    rating: 4.6,
    description: '台灣噶瑪蘭酒廠的旗艦產品，使用葡萄牙紅酒桶陳釀，展現出獨特的熱帶水果香氣。',
    grapeVarieties: ['大麥芽'],
    foodPairing: ['巧克力', '堅果', '雪茄', '單獨品飲'],
    awards: ['World Whiskies Awards 金牌', 'International Wine & Spirit Competition 金牌'],
    bestFor: ['入門威士忌', '台灣特色', '送禮推薦', '收藏'],
    pros: ['台灣威士忌的驕傲', '香草和熱帶水果香氣完美融合', '性價比高'],
    cons: ['酒精濃度較高', '產量有限'],
    purchaseLinks: [
      {
        platform: 'ProWine 專業酒類網站',
        url: 'http://prowine.com.tw/product/kavalan-solist-vinho-barrique',
        price: 'NT$ 2,980',
        availability: 'in_stock'
      },
      {
        platform: '官方網站',
        url: '#',
        price: 'NT$ 3,100',
        availability: 'limited'
      }
    ],
    seasonalRecommendation: {
      season: '秋季',
      reason: '溫暖的香氣和圓潤口感非常適合秋日夜晚',
      occasions: ['賞楓', '中秋節', '家庭聚會']
    },
    similarWines: ['Kavalan Concertmaster', 'Kavalan Podium'],
    expertReview: {
      sommelier: '威士忌愛好者 Eric',
      rating: 4.7,
      comments: '台灣威士忌的驕傲！香草和熱帶水果香氣完美融合'
    }
  }
]

export function WineRecommendationDatabase() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('全部')
  const [selectedRegion, setSelectedRegion] = useState('全部')
  const [priceRange, setPriceRange] = useState('全部')
  const [sortBy, setSortBy] = useState('rating')
  const [selectedWine, setSelectedWine] = useState<WineRecommendation | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const wineTypes = ['全部', '紅葡萄酒', '白酒', '香檳', '威士忌', '清酒', '啤酒']
  const regions = ['全部', '法國', '義大利', '西班牙', '美國', '澳洲', '台灣', '日本']
  const priceRanges = ['全部', 'NT$ 1,000以下', 'NT$ 1,000-3,000', 'NT$ 3,000-6,000', 'NT$ 6,000以上']
  const sortOptions = [
    { value: 'rating', label: '評分最高' },
    { value: 'price-low', label: '價格從低到高' },
    { value: 'price-high', label: '價格從高到低' },
    { value: 'name', label: '名稱排序' }
  ]
  
  const filteredWines = WINE_RECOMMENDATIONS.filter(wine => {
    const matchesSearch = wine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         wine.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === '全部' || wine.type === selectedType
    const matchesRegion = selectedRegion === '全部' || wine.country === selectedRegion
    
    let matchesPrice = true
    if (priceRange !== '全部') {
      const priceNum = parseInt(wine.priceRange.replace(/[^0-9]/g, ''))
      if (priceRange === 'NT$ 1,000以下' && priceNum >= 1000) matchesPrice = false
      if (priceRange === 'NT$ 1,000-3,000' && (priceNum < 1000 || priceNum > 3000)) matchesPrice = false
      if (priceRange === 'NT$ 3,000-6,000' && (priceNum < 3000 || priceNum > 6000)) matchesPrice = false
      if (priceRange === 'NT$ 6,000以上' && priceNum < 6000) matchesPrice = false
    }
    
    return matchesSearch && matchesType && matchesRegion && matchesPrice
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'price-low':
        return parseInt(a.priceRange.replace(/[^0-9]/g, '')) - parseInt(b.priceRange.replace(/[^0-9]/g, ''))
      case 'price-high':
        return parseInt(b.priceRange.replace(/[^0-9]/g, '')) - parseInt(a.priceRange.replace(/[^0-9]/g, ''))
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題區域 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full mb-4">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">精選酒款推薦庫</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Wine Recommendation Database
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          建立結構化酒款數據庫，包含酒莊、年份、價格、評分等完整資訊，整合個人化推薦算法和用戶評價系統。
        </p>
      </m.div>

      {/* 搜尋與篩選 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10"
      >
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜尋酒款名稱或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-white/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-5 h-5" />
            篩選條件
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10"
            >
              <div>
                <label className="block text-white/80 text-sm mb-2">酒款類型</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {wineTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">產區</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {regions.map(region => (
                    <option key={region} value={region} className="bg-gray-800">{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">價格區間</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {priceRanges.map(range => (
                    <option key={range} value={range} className="bg-gray-800">{range}</option>
                  ))}
                </select>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>

      {/* 統計資訊 */}
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-6 text-sm text-white/60"
      >
        <span>找到 {filteredWines.length} 支推薦酒款</span>
        <span>總計 {WINE_RECOMMENDATIONS.length} 支精選酒款</span>
      </m.div>

      {/* 酒款列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredWines.map((wine, index) => (
            <m.div
              key={wine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-emerald-500/30 cursor-pointer transition-all duration-300"
              onClick={() => setSelectedWine(wine)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{wine.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span>{wine.region}, {wine.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-emerald-400 fill-current" />
                  <span className="text-white font-medium">{wine.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {wine.type}
                </span>
                <span className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full">
                  {wine.priceRange}
                </span>
              </div>

              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                {wine.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {wine.grapeVarieties.slice(0, 3).map((grape, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded">
                    {grape}
                  </span>
                ))}
                {wine.grapeVarieties.length > 3 && (
                  <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded">
                    +{wine.grapeVarieties.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">點擊查看詳情</span>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-white/40 hover:text-rose-400 cursor-pointer transition-colors" />
                  <ShoppingCart className="w-4 h-4 text-white/40 hover:text-emerald-400 cursor-pointer transition-colors" />
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 詳細資訊彈窗 */}
      <AnimatePresence>
        {selectedWine && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedWine(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedWine.name}</h2>
                  <div className="flex items-center gap-4 text-white/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedWine.region}, {selectedWine.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {selectedWine.priceRange}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedWine.seasonalRecommendation.season}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWine(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 評分與統計 */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-emerald-400 fill-current" />
                    <span className="text-2xl font-bold text-white">{selectedWine.rating}</span>
                    <span className="text-white/60">/ 5.0</span>
                  </div>
                  <div className="h-6 w-px bg-white/20"></div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span>{selectedWine.awards.length} 項榮譽</span>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">酒款介紹</h3>
                <p className="text-white/80 leading-relaxed">{selectedWine.description}</p>
              </div>

              {/* 葡萄品種 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">葡萄品種</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWine.grapeVarieties.map((grape, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                      {grape}
                    </span>
                  ))}
                </div>
              </div>

              {/* 餐酒搭配 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">推薦搭配</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedWine.foodPairing.map((food, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 text-center">
                      <span className="text-white/80 text-sm">{food}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 優缺點分析 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-500/10 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    優點
                  </h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    {selectedWine.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    注意事項
                  </h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    {selectedWine.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 購買連結 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">購買資訊</h3>
                <div className="space-y-2">
                  {selectedWine.purchaseLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        link.availability === 'in_stock' 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : link.availability === 'limited' 
                          ? 'bg-amber-500/10 hover:bg-amber-500/20' 
                          : 'bg-red-500/10 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <span className="text-white/80">{link.platform}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm ${
                            link.availability === 'in_stock' ? 'text-emerald-400' :
                            link.availability === 'limited' ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {link.availability === 'in_stock' ? '有現貨' :
                             link.availability === 'limited' ? '限量供應' : '缺貨'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">{link.price}</span>
                        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* 專家評論 */}
              <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  專家評論
                </h3>
                <div className="text-white/80">
                  <p className="mb-2">評論者：{selectedWine.expertReview.sommelier}</p>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < selectedWine.expertReview.rating ? 'text-purple-400 fill-current' : 'text-white/20'}`} 
                      />
                    ))}
                  </div>
                  <p className="italic">&quot;{selectedWine.expertReview.comments}&quot;</p>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}