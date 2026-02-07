'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Award, MapPin, TrendingUp, Heart, Eye, ChefHat } from 'lucide-react';

// 威士忌例子資料庫
const WHISKY_EXAMPLES = [
  {
    id: 'whisky-001',
    name: '麥卡倫 18年',
    type: '單一麥芽威士忌',
    region: '斯佩塞',
    country: '蘇格蘭',
    priceRange: 'NT$ 12,000-15,000',
    rating: 4.8,
    description: '複雜的果乾、香草和橡木風味，悠長的尾韻',
    tastingNotes: '乾果、香草、橡木、蜂蜜、香料',
    foodPairing: '巧克力、堅果、藍紋起司',
    awards: ['IWSC 金牌', 'WWA 世界最佳單一麥芽'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/macallan18', price: 'NT$ 12,800' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 13,200' }
    ],
    age: '18年',
    caskType: '雪莉桶',
    abv: '43%',
    volume: '700ml',
    popularity: '高人氣',
    seasonal: '全年',
    expertRating: 98
  },
  {
    id: 'whisky-002',
    name: '格蘭菲迪 12年',
    type: '單一麥芽威士忌',
    region: '斯佩塞',
    country: '蘇格蘭',
    priceRange: 'NT$ 1,200-1,500',
    rating: 4.6,
    description: '清新果香、香草和蜂蜜風味，入口柔和',
    tastingNotes: '梨子、蘋果、香草、蜂蜜、奶油',
    foodPairing: '水果、輕食、海鮮',
    awards: ['ISC 金牌', 'SFWS 金牌'],
    availability: '台灣各大超市、酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/glenfiddich12', price: 'NT$ 1,280' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 1,350' }
    ],
    age: '12年',
    caskType: '波本桶',
    abv: '40%',
    volume: '700ml',
    popularity: '暢銷款',
    seasonal: '全年',
    expertRating: 94
  },
  {
    id: 'whisky-003',
    name: '拉加維林 16年',
    type: '單一麥芽威士忌',
    region: '艾雷島',
    country: '蘇格蘭',
    priceRange: 'NT$ 2,500-3,000',
    rating: 4.9,
    description: '強烈的泥炭煙燻味，複雜的海洋風味',
    tastingNotes: '煙燻、碘酒、海鹽、胡椒、橡木',
    foodPairing: '海鮮、燒烤、重口味料理',
    awards: ['WWA 世界最佳艾雷島威士忌', 'ISC 金牌'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/lagavulin16', price: 'NT$ 2,680' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 2,800' }
    ],
    age: '16年',
    caskType: '波本桶',
    abv: '43%',
    volume: '700ml',
    popularity: '威士忌愛好者首選',
    seasonal: '冬季',
    expertRating: 97
  },
  {
    id: 'whisky-004',
    name: '山崎 12年',
    type: '單一麥芽威士忌',
    region: '山崎',
    country: '日本',
    priceRange: 'NT$ 3,500-4,000',
    rating: 4.8,
    description: '日本威士忌的經典之作，平衡而優雅',
    tastingNotes: '蜜桃、蜂蜜、橡木、香草、薄荷',
    foodPairing: '日式料理、精緻美食',
    awards: ['WWA 世界最佳日本威士忌', 'ISC 金牌'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/yamazaki12', price: 'NT$ 3,780' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 3,900' }
    ],
    age: '12年',
    caskType: '多種桶型',
    abv: '43%',
    volume: '700ml',
    popularity: '人氣精選',
    seasonal: '全年',
    expertRating: 96
  },
  {
    id: 'whisky-005',
    name: '金門高粱威士忌 5年',
    type: '高粱威士忌',
    region: '金門',
    country: '台灣',
    priceRange: 'NT$ 1,500-1,800',
    rating: 4.4,
    description: '台灣在地威士忌，結合高粱酒特色與威士忌工藝',
    tastingNotes: '高粱、香草、橡木、淡淡甜味',
    foodPairing: '台式料理、海鮮、小吃',
    awards: ['金門酒廠年度最佳產品', '台灣精品獎'],
    availability: '台灣各地酒類專賣店、金門當地',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/kmwhisky5', price: 'NT$ 1,680' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 1,750' }
    ],
    age: '5年',
    caskType: '波本桶',
    abv: '46%',
    volume: '700ml',
    popularity: '台灣之光',
    seasonal: '全年',
    expertRating: 89
  },
  {
    id: 'whisky-006',
    name: '噶瑪蘭 狂醉',
    type: '單一麥芽威士忌',
    region: '宜蘭',
    country: '台灣',
    priceRange: 'NT$ 2,800-3,200',
    rating: 4.7,
    description: '台灣威士忌的驕傲，熱帶氣候熟成，風味濃郁',
    tastingNotes: '熱帶水果、香草、橡木、香料、蜂蜜',
    foodPairing: '亞洲料理、海鮮、水果',
    awards: ['WWA 世界最佳台灣威士忌', 'ISC 金牌'],
    availability: '台灣各大酒類專賣店',
    purchaseLinks: [
      { platform: 'prowine.com.tw', url: 'https://www.prowine.com.tw/kavalancaskstrength', price: 'NT$ 3,000' },
      { platform: '酒訊雜誌', url: 'https://www.winecis.com.tw', price: 'NT$ 3,100' }
    ],
    age: '非年份',
    caskType: '多種桶型',
    abv: '58.6%',
    volume: '700ml',
    popularity: '國際得獎',
    seasonal: '全年',
    expertRating: 95
  }
];

export function WhiskyExamples() {
  const [selectedWhisky, setSelectedWhisky] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name' | 'expertRating'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRegion, setFilterRegion] = useState<string>('全部');
  const [filterType, setFilterType] = useState<string>('全部');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 獲取唯一地區和類型選項
  const regions = ['全部', ...new Set(WHISKY_EXAMPLES.map((w: any) => w.region))];
  const types = ['全部', ...new Set(WHISKY_EXAMPLES.map((w: any) => w.type))];

  // 應用篩選和排序
  const filteredAndSortedWhiskies = [...WHISKY_EXAMPLES]
    .filter(whisky => filterRegion === '全部' || whisky.region === filterRegion)
    .filter(whisky => filterType === '全部' || whisky.type === filterType)
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'price':
          aValue = parseFloat(a.priceRange.split('-')[0].replace('NT$', '').replace(',', ''));
          bValue = parseFloat(b.priceRange.split('-')[0].replace('NT$', '').replace(',', ''));
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'expertRating':
          aValue = a.expertRating;
          bValue = b.expertRating;
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

  // 切換收藏
  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="space-y-6">
      {/* 篩選和排序控制 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as any);
            setSortOrder(order as any);
          }}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="rating-desc">評分高→低</option>
          <option value="rating-asc">評分低→高</option>
          <option value="expertRating-desc">專家評分高→低</option>
          <option value="expertRating-asc">專家評分低→高</option>
          <option value="price-desc">價格高→低</option>
          <option value="price-asc">價格低→高</option>
          <option value="name-asc">名稱 A→Z</option>
          <option value="name-desc">名稱 Z→A</option>
        </select>
      </div>

      {/* 威士忌卡片網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedWhiskies.map((whisky, index) => (
          <motion.div
            key={whisky.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary-500/10 transition-all cursor-pointer"
            onClick={() => setSelectedWhisky(whisky)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{whisky.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-400 text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {whisky.rating}
                  </span>
                  <span className="text-white/70 text-sm">{whisky.type}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(whisky.id);
                }}
                className="text-xl"
              >
                <Heart 
                  className={`w-6 h-6 ${favorites.has(whisky.id) ? 'fill-red-500 text-red-500' : 'text-white/40'}`} 
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">{whisky.priceRange}</span>
                <div className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3" />
                  {whisky.popularity}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4" />
                <span>{whisky.region}, {whisky.country}</span>
              </div>

              <p className="text-white/80 text-sm line-clamp-2">{whisky.description}</p>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {whisky.age}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300 flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  {whisky.caskType}
                </span>
                <span className="px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-300">
                  {whisky.abv}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {whisky.awards.slice(0, 2).map((award: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {award}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 威士忌詳細資訊彈窗 */}
      {selectedWhisky && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWhisky(null)}
        >
          <motion.div
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">酒精度</h4>
                    <p className="text-white/90">{selectedWhisky.abv}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">容量</h4>
                    <p className="text-white/90">{selectedWhisky.volume}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">年份</h4>
                    <p className="text-white/90">{selectedWhisky.age}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">桶型</h4>
                    <p className="text-white/90">{selectedWhisky.caskType}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">風味描述</h4>
                  <p className="text-white/90">{selectedWhisky.tastingNotes}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">餐酒搭配</h4>
                  <p className="text-white/90">{selectedWhisky.foodPairing}</p>
                </div>
              </div>

              <div className="space-y-6">
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
                  <h4 className="font-semibold text-amber-400 mb-2">專家評分</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-white">{selectedWhisky.expertRating}</div>
                    <div className="text-sm text-white/70">/ 100</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">可取得性</h4>
                  <p className="text-white/90">{selectedWhisky.availability}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">季節性</h4>
                  <p className="text-white/90">{selectedWhisky.seasonal}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">購買資訊</h4>
                  <div className="space-y-3">
                    {selectedWhisky.purchaseLinks.map((link: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{link.platform}</div>
                          <div className="text-sm text-white/60 truncate">{link.url}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{link.price}</span>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}