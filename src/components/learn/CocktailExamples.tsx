'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Award, ShoppingCart, Flame } from 'lucide-react';

interface CocktailExample {
  id: string;
  name: string;
  originalName: string;
  category: '經典' | '現代' | '熱帶' | '古典' | '創意' | '地區特色';
  baseSpirit: string;
  ingredients: string[];
  garnish: string;
  preparation: string;
  glassware: string;
  strength: '輕盈' | '中等' | '濃烈';
  complexity: '簡單' | '中等' | '複雜';
  flavorProfile: string[];
  occasion: string[];
  rating: number;
  price: number;
  description: string;
  origin: string;
  popularity: number;
  isOnProwine: boolean;
  prowineUrl?: string;
  tags: string[];
  availability: '普遍' | '地區性' | '限量' | '季節性';
  servingTemp: string;
  history: string;
  funFact: string;
}



export function CocktailExamples() {
  const [examples, setExamples] = useState<CocktailExample[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedStrength, setSelectedStrength] = useState('全部');
  const [selectedOccasion, setSelectedOccasion] = useState('全部');
  const [selectedExample, setSelectedExample] = useState<CocktailExample | null>(null);
  const [showProwineOnly, setShowProwineOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price'>('popularity');

  React.useEffect(() => {
    fetch('/data/cocktail-examples.json')
      .then(res => res.json())
      .then(data => setExamples(data))
      .catch(err => console.error('Failed to load cocktail examples:', err));
  }, []);

  const categories = ['全部', '經典', '現代', '熱帶', '古典', '創意', '地區特色'];
  const strengths = ['全部', '輕盈', '中等', '濃烈'];
  const occasions = ['全部', '正式晚宴', '派對', '夏日', '浪漫約會', '輕鬆聚會', '餐前酒', '餐後酒'];

  const filteredExamples = useMemo(() => {
    return examples.filter(example => {
      const matchesSearch =
        example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) ||
        example.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === '全部' || example.category === selectedCategory;
      const matchesStrength = selectedStrength === '全部' || example.strength === selectedStrength;
      const matchesOccasion = selectedOccasion === '全部' || example.occasion.includes(selectedOccasion);
      const matchesProwine = !showProwineOnly || example.isOnProwine;

      return matchesSearch && matchesCategory && matchesStrength && matchesOccasion && matchesProwine;
    });
  }, [examples, searchTerm, selectedCategory, selectedStrength, selectedOccasion, showProwineOnly]);

  const sortedExamples = useMemo(() => {
    return [...filteredExamples].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [filteredExamples, sortBy]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4">
          <Star className="w-5 h-5 text-white" />
          <span className="text-white font-medium">代表性調酒實例</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Representative Cocktail Examples
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          精選來自世界各地的代表性調酒，涵蓋經典與現代創作，展現調酒文化的豐富多樣性
        </p>
      </m.div>

      {/* 搜尋與篩選 */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜尋調酒..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
              value={selectedStrength}
              onChange={(e) => setSelectedStrength(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {strengths.map(strength => (
                <option key={strength} value={strength} className="bg-gray-800">
                  {strength}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {occasions.map(occasion => (
                <option key={occasion} value={occasion} className="bg-gray-800">
                  {occasion}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            >
              <option value="popularity" className="bg-gray-800">人氣排序</option>
              <option value="rating" className="bg-gray-800">評分排序</option>
              <option value="price" className="bg-gray-800">價格排序</option>
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
        <span>找到 {sortedExamples.length} 款調酒</span>
        <span>總計 {examples.length} 款調酒</span>
      </m.div>

      {/* 調酒列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedExamples.map((example, index) => (
          <m.div
            key={example.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${example.isOnProwine
              ? 'border-amber-500/50 hover:border-amber-500/70'
              : 'border-white/10 hover:border-amber-500/30'
              } cursor-pointer transition-all duration-300 group relative`}
            onClick={() => setSelectedExample(example)}
          >
            {example.isOnProwine && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" />
                ProWine
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {example.name}
                </h3>
                <p className="text-amber-300 text-sm">{example.originalName}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{example.rating}</span>
                </div>
                <div className="text-amber-400 text-sm font-bold">{example.price} TWD</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {example.category}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {example.strength}
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {example.complexity}
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                {example.origin}
              </span>
            </div>

            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {example.description}
            </p>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>{example.baseSpirit}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Award className="w-3 h-3" />
                  <span>{example.popularity}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {example.tags.slice(0, 3).map((tag, idx) => (
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
                <span>{example.availability}</span>
              </div>
              <div className="flex gap-2">
                {example.prowineUrl && (
                  <a
                    href={example.prowineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(example.prowineUrl, '_blank');
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-500/30 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    購買
                  </a>
                )}
                <button className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white/70 rounded text-xs hover:bg-white/20 transition-colors">
                  <span>詳情</span>
                </button>
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
                  <div className="flex items-center gap-3 mb-2">
                    {selectedExample.isOnProwine && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        ProWine
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-white">{selectedExample.name}</h2>
                  </div>
                  <p className="text-amber-300 text-lg">{selectedExample.originalName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {selectedExample.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedExample.strength}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedExample.complexity}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
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
                    產品資訊
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">評分：</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white">{selectedExample.rating}/5.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">人氣指數：</span>
                      <span className="text-white">{selectedExample.popularity}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">基酒：</span>
                      <span className="text-white">{selectedExample.baseSpirit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">強度：</span>
                      <span className="text-white">{selectedExample.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">價格：</span>
                      <span className="text-amber-400 font-bold">{selectedExample.price} TWD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">產地：</span>
                      <span className="text-white">{selectedExample.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">可得性：</span>
                      <span className="text-white">{selectedExample.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">特色標籤</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.tags.map((tag, idx) => (
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
                    {selectedExample.occasion.map((occasion, idx) => (
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
                <p className="text-white/80 leading-relaxed">{selectedExample.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">風味特徵</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.flavorProfile.map((flavor, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">調製方法</h3>
                  <p className="text-white/80 text-sm">{selectedExample.preparation}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">成分與裝飾</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">成分</h4>
                    <ul className="space-y-1">
                      {selectedExample.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-white/70 text-sm flex items-center gap-2">
                          <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">裝飾</h4>
                    <p className="text-white/70 text-sm">{selectedExample.garnish}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">酒杯與服務</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">酒杯</h4>
                    <p className="text-white/70 text-sm">{selectedExample.glassware}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">飲用溫度</h4>
                    <p className="text-white/70 text-sm">{selectedExample.servingTemp}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">難度</h4>
                    <p className="text-white/70 text-sm">{selectedExample.complexity}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">歷史背景</h4>
                    <p className="text-white/70 text-sm">{selectedExample.history}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">趣味知識</h3>
                <p className="text-white/80 leading-relaxed">{selectedExample.funFact}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                {selectedExample.prowineUrl && (
                  <a
                    href={selectedExample.prowineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>在 ProWine 購買 - {selectedExample.price} TWD</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedExample(null)}
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