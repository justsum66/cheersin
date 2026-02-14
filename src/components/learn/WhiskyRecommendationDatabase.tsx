'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Star, ShoppingCart, Award, TrendingUp, MapPin, Calendar, DollarSign } from 'lucide-react';
import { m } from 'framer-motion';

// 威士忌推薦資料庫
const WHISKY_RECOMMENDATIONS = [
  {
    id: 'whisky-001',
    name: '麥卡倫 18年',
    type: '單一麥芽威士忌',
    region: '斯佩塞',
    country: '蘇格蘭',
    priceRange: 'NT$ 12,000-15,000',
    rating: 4.8,
    abv: '43%',
    description: '複雜的果乾、香草和橡木風味，悠長的尾韻',
    tastingNotes: '乾果、香草、橡木、蜂蜜、香料',
    foodPairing: '巧克力、堅果、藍紋起司',
    awards: ['IWSC 金牌', 'WWA 世界最佳單一麥芽'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/macallan18', price: 'NT$ 12,800' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 13,200' }
    ],
    seasonality: ['全年', '節慶禮品'],
    expertReview: '平衡完美的經典之作，適合收藏和品飲',
    pros: ['風味複雜度高', '陳年表現優秀', '品牌聲譽佳'],
    cons: ['價格較高', '可能過於複雜'],
    vintage: '2005',
    caskType: '雪莉桶',
    distillery: 'The Macallan',
    ageStatement: '18年',
    availabilityScore: 9,
    trending: true
  },
  {
    id: 'whisky-002',
    name: '格蘭菲迪 12年',
    type: '單一麥芽威士忌',
    region: '斯佩塞',
    country: '蘇格蘭',
    priceRange: 'NT$ 1,200-1,500',
    rating: 4.6,
    abv: '40%',
    description: '清新果香、香草和蜂蜜風味，入口柔和',
    tastingNotes: '梨子、蘋果、香草、蜂蜜、奶油',
    foodPairing: '水果、輕食、海鮮',
    awards: ['ISC 金牌', 'SFWS 金牌'],
    availability: '台灣各大超市、酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/glenfiddich12', price: 'NT$ 1,280' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 1,350' }
    ],
    seasonality: ['全年', '入門首選'],
    expertReview: '性價比極佳的入門威士忌，適合日常品飲',
    pros: ['價格合理', '口感柔和', '容易取得'],
    cons: ['複雜度一般', '缺乏驚喜'],
    vintage: '2012',
    caskType: '波本桶',
    distillery: 'Glenfiddich',
    ageStatement: '12年',
    availabilityScore: 10,
    trending: false
  },
  {
    id: 'whisky-003',
    name: '尊尼獲加 藍牌',
    type: '調和威士忌',
    region: '調和',
    country: '蘇格蘭',
    priceRange: 'NT$ 8,000-10,000',
    rating: 4.7,
    abv: '40%',
    description: '精選珍稀威士忌調和而成，風味深邃複雜',
    tastingNotes: '蜂蜜、橡木、煙燻、香料、果乾',
    foodPairing: '高級料理、雪茄',
    awards: ['IWSC 最佳調和威士忌', 'WWA 金牌'],
    availability: '高端酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/johnniewalkerblue', price: 'NT$ 8,900' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 9,200' }
    ],
    seasonality: ['節慶禮品', '商務送禮'],
    expertReview: '調和威士忌的巔峰之作，展現調和藝術',
    pros: ['品質頂尖', '品牌影響力', '收藏價值'],
    cons: ['價格昂貴', '入門者可能不易欣賞'],
    vintage: '非年份',
    caskType: '多種桶型',
    distillery: 'Johnnie Walker',
    ageStatement: '無年份',
    availabilityScore: 7,
    trending: true
  },
  {
    id: 'whisky-004',
    name: '拉加維林 16年',
    type: '單一麥芽威士忌',
    region: '艾雷島',
    country: '蘇格蘭',
    priceRange: 'NT$ 2,500-3,000',
    rating: 4.9,
    abv: '43%',
    description: '強烈的泥炭煙燻味，複雜的海洋風味',
    tastingNotes: '煙燻、碘酒、海鹽、胡椒、橡木',
    foodPairing: '海鮮、燒烤、重口味料理',
    awards: ['WWA 世界最佳艾雷島威士忌', 'ISC 金牌'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/lagavulin16', price: 'NT$ 2,680' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 2,800' }
    ],
    seasonality: ['冬季', '威士忌愛好者'],
    expertReview: '艾雷島威士忌的典型代表，泥炭愛好者的首選',
    pros: ['風味獨特', '品質穩定', '代表性強'],
    cons: ['味道強烈', '可能不適合所有人'],
    vintage: '2008',
    caskType: '波本桶',
    distillery: 'Lagavulin',
    ageStatement: '16年',
    availabilityScore: 8,
    trending: true
  },
  {
    id: 'whisky-005',
    name: '山崎 12年',
    type: '單一麥芽威士忌',
    region: '山崎',
    country: '日本',
    priceRange: 'NT$ 3,500-4,000',
    rating: 4.8,
    abv: '43%',
    description: '日本威士忌的經典之作，平衡而優雅',
    tastingNotes: '蜜桃、蜂蜜、橡木、香草、薄荷',
    foodPairing: '日式料理、精緻美食',
    awards: ['WWA 世界最佳日本威士忌', 'ISC 金牌'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/yamazaki12', price: 'NT$ 3,780' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 3,900' }
    ],
    seasonality: ['全年', '精緻場合'],
    expertReview: '東西合璧的完美體現，展現日本工匠精神',
    pros: ['平衡優雅', '工藝精良', '文化價值'],
    cons: ['價格較高', '供應有限'],
    vintage: '2012',
    caskType: '多種桶型',
    distillery: 'Suntory Yamazaki',
    ageStatement: '12年',
    availabilityScore: 7,
    trending: true
  },
  {
    id: 'whisky-006',
    name: '占邊 白標',
    type: '波本威士忌',
    region: '肯塔基',
    country: '美國',
    priceRange: 'NT$ 800-1,000',
    rating: 4.5,
    abv: '40%',
    description: '經典波本威士忌，玉米甜味突出，口感順滑',
    tastingNotes: '玉米、香草、焦糖、橡木、香料',
    foodPairing: '美式料理、燒烤、漢堡',
    awards: ['ISC 金牌', 'SFWS 金牌'],
    availability: '台灣各大超市、便利商店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/jimbeamwhite', price: 'NT$ 850' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 900' }
    ],
    seasonality: ['全年', '調酒基酒'],
    expertReview: '入門波本的經典選擇，性價比極佳',
    pros: ['價格親民', '容易取得', '調酒適用'],
    cons: ['複雜度一般', '缺乏特色'],
    vintage: '2023',
    caskType: '全新燒焦橡木桶',
    distillery: 'Jim Beam',
    ageStatement: '無年份',
    availabilityScore: 10,
    trending: false
  },
  {
    id: 'whisky-007',
    name: '金門高粱威士忌 5年',
    type: '高粱威士忌',
    region: '金門',
    country: '台灣',
    priceRange: 'NT$ 1,500-1,800',
    rating: 4.4,
    abv: '46%',
    description: '台灣在地威士忌，結合高粱酒特色與威士忌工藝',
    tastingNotes: '高粱、香草、橡木、淡淡甜味',
    foodPairing: '台式料理、海鮮、小吃',
    awards: ['金門酒廠年度最佳產品', '台灣精品獎'],
    availability: '台灣各地酒類專賣店、金門當地',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/kmwhisky5', price: 'NT$ 1,680' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 1,750' }
    ],
    seasonality: ['全年', '台灣特色'],
    expertReview: '台灣威士忌的先驅，展現在地風味',
    pros: ['台灣特色', '獨特風味', '支持本地'],
    cons: ['知名度較低', '風味特殊'],
    vintage: '2019',
    caskType: '波本桶',
    distillery: '金門酒廠',
    ageStatement: '5年',
    availabilityScore: 9,
    trending: true
  },
  {
    id: 'whisky-008',
    name: '噶瑪蘭 狂醉',
    type: '單一麥芽威士忌',
    region: '宜蘭',
    country: '台灣',
    priceRange: 'NT$ 2,800-3,200',
    rating: 4.7,
    abv: '58.6%',
    description: '台灣威士忌的驕傲，熱帶氣候熟成，風味濃郁',
    tastingNotes: '熱帶水果、香草、橡木、香料、蜂蜜',
    foodPairing: '亞洲料理、海鮮、水果',
    awards: ['WWA 世界最佳台灣威士忌', 'ISC 金牌'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/kavalancaskstrength', price: 'NT$ 3,000' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 3,100' }
    ],
    seasonality: ['全年', '威士忌愛好者'],
    expertReview: '台灣威士忌的巔峰之作，獲得國際認可',
    pros: ['品質卓越', '國際認可', '台灣之光'],
    cons: ['價格較高', '酒精度高'],
    vintage: '2018',
    caskType: '多種桶型',
    distillery: '噶瑪蘭酒廠',
    ageStatement: '非年份',
    availabilityScore: 8,
    trending: true
  }
];

// 篩選選項
const FILTER_OPTIONS = {
  type: [
    '單一麥芽威士忌', '調和威士忌', '波本威士忌', '高粱威士忌', '愛爾蘭威士忌', '田納西威士忌', '加拿大威士忌', '日本威士忌'
  ],
  region: [
    '斯佩塞', '高地', '艾雷島', '坎貝爾鎮', '低地', '肯塔基', '田納西', '山崎', '金門', '宜蘭', '愛爾蘭', '加拿大', '澳洲', '德國', '印度'
  ],
  country: ['蘇格蘭', '美國', '日本', '台灣', '愛爾蘭', '加拿大', '澳洲', '德國', '印度'],
  priceRange: [
    'NT$ 500-1,000', 'NT$ 1,000-2,000', 'NT$ 2,000-5,000', 'NT$ 5,000-10,000', 'NT$ 10,000+'
  ],
  rating: ['4.5+', '4.6+', '4.7+', '4.8+', '4.9+'],
  availability: ['易取得', '普通', '稀有'],
  abv: ['40%以下', '40-45%', '45-50%', '50%以上']
};

type WhiskyRecommendation = typeof WHISKY_RECOMMENDATIONS[number];

export function WhiskyRecommendationDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({
    type: [],
    region: [],
    country: [],
    priceRange: [],
    rating: [],
    availability: [],
    abv: []
  });
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name' | 'abv'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedWhisky, setSelectedWhisky] = useState<WhiskyRecommendation | null>(null);

  // 應用篩選和排序
  const filteredAndSortedWhiskies = useMemo(() => {
    let result = [...WHISKY_RECOMMENDATIONS];

    // 應用搜尋
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(whisky =>
        whisky.name.toLowerCase().includes(term) ||
        whisky.description.toLowerCase().includes(term) ||
        whisky.tastingNotes.toLowerCase().includes(term) ||
        whisky.type.toLowerCase().includes(term) ||
        whisky.region.toLowerCase().includes(term) ||
        whisky.country.toLowerCase().includes(term)
      );
    }

    // 應用篩選
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        result = result.filter(whisky => {
          if (key === 'rating') {
            return values.some(v => {
              const minRating = parseFloat(v.replace('+', ''));
              return whisky.rating >= minRating;
            });
          }
          if (key === 'availability') {
            const score = whisky.availabilityScore;
            return values.some(v => {
              if (v === '易取得') return score >= 8;
              if (v === '普通') return score >= 5 && score < 8;
              if (v === '稀有') return score < 5;
              return true;
            });
          }
          if (key === 'abv') {
            const abv = parseFloat(whisky.abv);
            return values.some(v => {
              if (v === '40%以下') return abv < 40;
              if (v === '40-45%') return abv >= 40 && abv <= 45;
              if (v === '45-50%') return abv > 45 && abv <= 50;
              if (v === '50%以上') return abv > 50;
              return true;
            });
          }
          if (key === 'type') return values.includes(whisky.type);
          if (key === 'region') return values.includes(whisky.region);
          if (key === 'country') return values.includes(whisky.country);
          if (key === 'priceRange') return values.includes(whisky.priceRange);
          return false;
        });
      }
    });

    // 應用排序
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'price':
          // 處理價格範圍字串
          aValue = parseFloat(a.priceRange.split('-')[0].replace('NT$', '').replace(',', ''));
          bValue = parseFloat(b.priceRange.split('-')[0].replace('NT$', '').replace(',', ''));
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'abv':
          aValue = parseFloat(a.abv);
          bValue = parseFloat(b.abv);
          break;
        default:
          aValue = a.rating;
          bValue = b.rating;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [searchTerm, filters, sortBy, sortOrder]);

  // 切換篩選選項
  const toggleFilter = (category: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  // 清除所有篩選
  const clearAllFilters = () => {
    setFilters({
      type: [],
      region: [],
      country: [],
      priceRange: [],
      rating: [],
      availability: [],
      abv: []
    });
  };

  return (
    <div className="space-y-6">
      {/* 搜索和排序控制 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="搜尋威士忌名稱、風味、產區..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as typeof sortBy);
            setSortOrder(order as typeof sortOrder);
          }}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="rating-desc">評分高→低</option>
          <option value="rating-asc">評分低→高</option>
          <option value="price-desc">價格高→低</option>
          <option value="price-asc">價格低→高</option>
          <option value="name-asc">名稱 A→Z</option>
          <option value="name-desc">名稱 Z→A</option>
          <option value="abv-desc">酒精度高→低</option>
          <option value="abv-asc">酒精度低→高</option>
        </select>
      </div>

      {/* 篩選器 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            篩選條件
          </h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-400 hover:text-primary-300 px-3 py-1 rounded-lg bg-primary-500/20"
          >
            清除全部
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(FILTER_OPTIONS).map(([category, options]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-white/80 capitalize">
                {category === 'type' && '威士忌類型'}
                {category === 'region' && '產區'}
                {category === 'country' && '國家'}
                {category === 'priceRange' && '價格範圍'}
                {category === 'rating' && '評分'}
                {category === 'availability' && '取得難度'}
                {category === 'abv' && '酒精度'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {options.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleFilter(category, option)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${filters[category].includes(option)
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 結果統計 */}
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>找到 {filteredAndSortedWhiskies.length} 款威士忌</span>
        <span>排序方式: {sortBy === 'rating' && '評分'}{sortBy === 'price' && '價格'}{sortBy === 'name' && '名稱'}{sortBy === 'abv' && '酒精度'} {sortOrder === 'desc' ? '▼' : '▲'}</span>
      </div>

      {/* 威士忌卡片列表 */}
      <div className="grid gap-4">
        {filteredAndSortedWhiskies.map((whisky, index) => (
          <m.div
            key={whisky.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/20 hover:border-amber-400/30 transition-all cursor-pointer"
            onClick={() => setSelectedWhisky(whisky)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{whisky.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-amber-400 text-sm flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        {whisky.rating}
                      </span>
                      <span className="text-white/70 text-sm">{whisky.type}</span>
                      <span className="text-white/70 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {whisky.region}, {whisky.country}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{whisky.priceRange}</div>
                    <div className="text-sm text-white/60">{whisky.abv}</div>
                  </div>
                </div>

                <p className="text-white/80 mt-2 text-sm">{whisky.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                    {whisky.ageStatement}
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">
                    {whisky.caskType}
                  </span>
                  {whisky.trending && (
                    <span className="px-2 py-1 bg-pink-500/20 rounded-full text-xs text-pink-300 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      熱門
                    </span>
                  )}
                </div>
              </div>

              <div className="lg:w-64">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">風味:</span>
                    <span className="text-white ml-2">{whisky.tastingNotes}</span>
                  </div>
                  <div>
                    <span className="text-white/60">配餐:</span>
                    <span className="text-white ml-2">{whisky.foodPairing}</span>
                  </div>
                  <div>
                    <span className="text-white/60">評鑑:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {whisky.awards.slice(0, 2).map((award, i) => (
                        <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {award}
                        </span>
                      ))}
                      {whisky.awards.length > 2 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                          +{whisky.awards.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* 威士忌詳細資訊彈窗 */}
      {selectedWhisky && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWhisky(null)}
        >
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {selectedWhisky.name}
                  <span className="text-sm bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                    {selectedWhisky.type}
                  </span>
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-amber-400 flex items-center gap-1">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-white">{selectedWhisky.rating}/5.0</span>
                  </div>
                  <div className="text-white/70 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedWhisky.region}, {selectedWhisky.country}
                  </div>
                  <div className="text-white font-medium">{selectedWhisky.priceRange}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedWhisky(null)}
                className="text-white/50 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">產品介紹</h4>
                  <p className="text-white/90">{selectedWhisky.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">風味描述</h4>
                  <p className="text-white/90">{selectedWhisky.tastingNotes}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">餐酒搭配</h4>
                  <p className="text-white/90">{selectedWhisky.foodPairing}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">酒精度</h4>
                    <p className="text-white/90">{selectedWhisky.abv}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">年份</h4>
                    <p className="text-white/90">{selectedWhisky.vintage}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">蒸餾廠</h4>
                    <p className="text-white/90">{selectedWhisky.distillery}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">桶型</h4>
                    <p className="text-white/90">{selectedWhisky.caskType}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">專家評鑑</h4>
                  <p className="text-white/90 italic">&quot;{selectedWhisky.expertReview}&quot;</p>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">優缺點分析</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-green-400 text-sm font-medium mb-1">優點</h5>
                      <ul className="text-white/80 text-sm list-disc list-inside space-y-1">
                        {selectedWhisky.pros.map((pro: string, i: number) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-red-400 text-sm font-medium mb-1">缺點</h5>
                      <ul className="text-white/80 text-sm list-disc list-inside space-y-1">
                        {selectedWhisky.cons.map((con: string, i: number) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">獲得獎項</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWhisky.awards.map((award: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {award}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">季節性推薦</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWhisky.seasonality.map((season: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {season}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">購買資訊</h4>
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm">可取得性: {selectedWhisky.availability}</p>
                    <div className="space-y-2">
                      {selectedWhisky.purchaseLinks.map((link: WhiskyRecommendation['purchaseLinks'][number], i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{link.platform}</div>
                            <div className="text-sm text-white/60">{link.url}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{link.price}</span>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </div>
  );
}