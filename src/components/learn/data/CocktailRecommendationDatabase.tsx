'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
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



export function CocktailRecommendationDatabase() {
  const [database, setDatabase] = useState<CocktailRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<CocktailRecommendation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [filterStrength, setFilterStrength] = useState<string>('全部');
  const [filterPrice, setFilterPrice] = useState<[number, number]>([0, 1000]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price' | 'bestMatch'>('popularity');
  const [showProwineOnly, setShowProwineOnly] = useState<boolean>(true);

  React.useEffect(() => {
    let cancelled = false
    fetch('/data/cocktail-recommendations.json')
      .then(res => res.json())
      .then(data => { if (!cancelled) setDatabase(data) })
      .catch(err => { if (!cancelled) console.error('Failed to load cocktail data:', err) });
    return () => { cancelled = true }
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(database.map(item => item.category))];
    return ['全部', ...uniqueCategories];
  }, [database]);

  const strengths = ['全部', '輕盈', '中等', '濃烈'];

  const filteredRecommendations = useMemo(() => {
    return database.filter(recommendation => {
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
  }, [database, filterCategory, filterStrength, filterPrice, searchTerm, showProwineOnly]);

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
      <m.div
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
      </m.div>

      {/* 搜尋和篩選 */}
      <m.div
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
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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
      </m.div>

      {/* 統計資訊 */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-6 text-sm text-white/60"
      >
        <span>找到 {sortedRecommendations.length} 款調酒</span>
        <span>總計 {database.length} 款調酒</span>
      </m.div>

      {/* 推薦列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRecommendations.map((recommendation, index) => (
          <m.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${recommendation.isOnProwine
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
          </m.div>
        ))}
      </div>

      {/* 詳細資訊彈窗 */}
      <AnimatePresence>
        {selectedRecommendation && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecommendation(null)}
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
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}