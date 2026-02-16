'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Filter, Volume2, VolumeX } from 'lucide-react';

interface CocktailTerm {
  id: string;
  term: string;
  english: string;
  category: string;
  definition: string;
  pronunciation: string;
  example: string;
  origin: string;
  complexity: '初級' | '中級' | '高級';
  usage: string;
  relatedTerms: string[];
}



export function CocktailGlossary() {
  const [terms, setTerms] = useState<CocktailTerm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedComplexity, setSelectedComplexity] = useState('全部');
  const [selectedTerm, setSelectedTerm] = useState<CocktailTerm | null>(null);
  const [showPronunciation, setShowPronunciation] = useState(true);

  React.useEffect(() => {
    fetch('/data/cocktail-glossary.json')
      .then(res => res.json())
      .then(data => setTerms(data))
      .catch(err => console.error('Failed to load cocktail glossary:', err));
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(terms.map(term => term.category))];
    return ['全部', ...uniqueCategories];
  }, [terms]);

  const complexities = ['全部', '初級', '中級', '高級'];

  const filteredTerms = useMemo(() => {
    return terms.filter(term => {
      const matchesSearch =
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '全部' || term.category === selectedCategory;
      const matchesComplexity = selectedComplexity === '全部' || term.complexity === selectedComplexity;

      return matchesSearch && matchesCategory && matchesComplexity;
    });
  }, [terms, searchTerm, selectedCategory, selectedComplexity]);

  const groupedTerms = useMemo(() => {
    return filteredTerms.reduce((acc, term) => {
      const firstLetter = term.term.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(term);
      return acc;
    }, {} as Record<string, CocktailTerm[]>);
  }, [filteredTerms]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <BookOpen className="w-5 h-5 text-white" />
          <span className="text-white font-medium">調酒專業術語詞典</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Cocktail Professional Glossary
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          收錄超過70個調酒專業術語，從基礎到高級，助您深入了解調酒文化與技法
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜尋調酒術語..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-white/60" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {complexities.map(complexity => (
                  <option key={complexity} value={complexity} className="bg-gray-800">
                    {complexity}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-white/60">
          <span>顯示 {filteredTerms.length} 個術語</span>
          <div className="flex items-center gap-2">
            <span>發音顯示</span>
            <button
              onClick={() => setShowPronunciation(!showPronunciation)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${showPronunciation ? 'bg-purple-500' : 'bg-white/20'
                }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full transition-transform ${showPronunciation ? 'translate-x-6' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
        </div>
      </m.div>

      {/* 術語列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedTerms).map(([letter, terms]) => (
          <div key={letter} className="space-y-4">
            <h2 className="text-2xl font-bold text-white sticky top-0 bg-gray-900/80 py-2 z-10">
              {letter}
            </h2>
            {terms.map((term, index) => (
              <m.div
                key={term.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-purple-500/30 cursor-pointer transition-all duration-300"
                onClick={() => setSelectedTerm(term)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{term.term}</h3>
                    <p className="text-purple-300">{term.english}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${term.complexity === '初級'
                      ? 'bg-green-500/20 text-green-400'
                      : term.complexity === '中級'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                      {term.complexity}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                    {term.category}
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    {term.origin}
                  </span>
                  {showPronunciation && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-mono">
                      {term.pronunciation}
                    </span>
                  )}
                </div>

                <p className="text-white/70 text-sm line-clamp-2">
                  {term.definition}
                </p>
              </m.div>
            ))}
          </div>
        ))}
      </div>

      {/* 術語詳細資訊模態框 */}
      <AnimatePresence>
        {selectedTerm && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedTerm.term}</h2>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedTerm.english}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${selectedTerm.complexity === '初級'
                      ? 'bg-green-500/20 text-green-400'
                      : selectedTerm.complexity === '中級'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                      {selectedTerm.complexity}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedTerm.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedTerm.origin}
                    </span>
                    {showPronunciation && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-mono">
                        {selectedTerm.pronunciation}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-2">定義</h3>
                  <p className="text-white/80 leading-relaxed">{selectedTerm.definition}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">使用範例</h3>
                  <p className="text-white/80 leading-relaxed">{selectedTerm.example}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">應用方式</h3>
                  <p className="text-white/80 leading-relaxed">{selectedTerm.usage}</p>
                </div>

                {selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-2">相關術語</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((relatedTerm, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-sm"
                        >
                          {relatedTerm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
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