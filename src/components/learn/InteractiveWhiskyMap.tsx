'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { MapPin, Globe, Info, Star, Award, History, Factory, Wine } from 'lucide-react';

// 威士忌產區資料
const WHISKY_REGIONS = [
  {
    id: 'scotland',
    name: '蘇格蘭',
    country: '英國',
    description: '威士忌的發源地，擁有最嚴格的法規和最悠久的歷史',
    subRegions: ['高地(Highland)', '低地(Lowland)', '坎貝爾鎮(Campbeltown)', '艾雷島(Islay)', '斯佩塞(Speyside)'],
    grapes: ['大麥芽'], // 威士忌使用大麥而非葡萄
    primaryStyles: ['單一麥芽', '調和威士忌'],
    famousBrands: ['麥卡倫(Macallan)', '格蘭菲迪(Glenfiddich)', '尊尼獲加(Johnnie Walker)', '拉加維林(Lagavulin)'],
    climate: '海洋性氣候，潮濕涼爽',
    soil: '泥炭質土壤',
    position: { x: 25, y: 15 },
    color: '#8B4513',
    area: 'Speyside'
  },
  {
    id: 'ireland',
    name: '愛爾蘭',
    country: '愛爾蘭',
    description: '威士忌的另一個發源地，以三重蒸餾聞名',
    subRegions: ['科克(Cork)', '都柏林(Dublin)', '高威(Galway)'],
    grapes: ['大麥芽', '玉米', '裸麥'],
    primaryStyles: ['愛爾蘭威士忌', '穀物威士忌'],
    famousBrands: ['詹姆森(Jameson)', '布什米爾(Bushmills)', '泰坦吉爾(Tea Tánaiste)'],
    climate: '溫帶海洋性氣候',
    soil: '肥沃的草原土壤',
    position: { x: 18, y: 20 },
    color: '#228B22',
    area: 'Cork'
  },
  {
    id: 'usa-kentucky',
    name: '肯塔基州',
    country: '美國',
    description: '波本威士忌的故鄉，以玉米為主的威士忌',
    subRegions: ['波本郡', '勞雷爾郡', '謝爾比郡'],
    grapes: ['玉米(≥51%)', '裸麥', '小麥', '大麥芽'],
    primaryStyles: ['波本威士忌', '田納西威士忌'],
    famousBrands: ['占邊(Jim Beam)', '野火雞(Wild Turkey)', '四玫瑰(Four Roses)', '杰克丹尼(Jack Daniel\'s)'],
    climate: '溫帶大陸性氣候',
    soil: '石灰岩過濾的水源',
    position: { x: 70, y: 45 },
    color: '#FF4500',
    area: 'Kentucky'
  },
  {
    id: 'usa-tennessee',
    name: '田納西州',
    country: '美國',
    description: '田納西威士忌的產地，經過糖楓木炭過濾',
    subRegions: ['林奇堡(Lynchburg)', '孟菲斯(Memphis)'],
    grapes: ['玉米(≥51%)', '裸麥', '小麥', '大麥芽'],
    primaryStyles: ['田納西威士忌'],
    famousBrands: ['杰克丹尼(Jack Daniel\'s)', '喬治迪克爾(George Dickel)'],
    climate: '溫帶濕潤氣候',
    soil: '糖楓木炭過濾系統',
    position: { x: 72, y: 48 },
    color: '#FF6347',
    area: 'Tennessee'
  },
  {
    id: 'japan',
    name: '日本',
    country: '日本',
    description: '精緻的威士忌工藝，融合東西方技術',
    subRegions: ['山崎(Yamazaki)', '白州(Hakushu)', '秩父(Chichibu)', '宮城峽(Miyagikyo)'],
    grapes: ['大麥芽', '玉米', '裸麥'],
    primaryStyles: ['日本威士忌', '調和威士忌'],
    famousBrands: ['山崎(Yamazaki)', '白州(Hakushu)', '響(Hibiki)', '竹鶴(Taketsuru)'],
    climate: '溫帶季風氣候',
    soil: '火山灰質土壤',
    position: { x: 92, y: 35 },
    color: '#DC143C',
    area: 'Japan'
  },
  {
    id: 'canada',
    name: '加拿大',
    country: '加拿大',
    description: '輕盈順口的調和威士忌，多樣化穀物配方',
    subRegions: ['安大略省', '魁北克省', '艾伯塔省'],
    grapes: ['玉米', '裸麥', '大麥芽'],
    primaryStyles: ['加拿大威士忌'],
    famousBrands: ['加拿大俱樂部(Canadian Club)', '皇冠(Crown Royal)', '威雀(Seagram\'s)'],
    climate: '大陸性氣候',
    soil: '肥沃平原土壤',
    position: { x: 65, y: 35 },
    color: '#FF0000',
    area: 'Canada'
  },
  {
    id: 'india',
    name: '印度',
    country: '印度',
    description: '快速發展的威士忌市場，熱帶氣候加速熟成',
    subRegions: ['班加羅爾', '浦那', '孟買'],
    grapes: ['大麥芽', '小麥', '玉米'],
    primaryStyles: ['印度威士忌'],
    famousBrands: ['皇家禮炮(Royal Stag)', '大使(Empress)', '8PM'],
    climate: '熱帶氣候',
    soil: '多樣化土壤類型',
    position: { x: 85, y: 55 },
    color: '#FFA500',
    area: 'India'
  },
  {
    id: 'taiwan',
    name: '台灣',
    country: '台灣',
    description: '金門高粱威士忌，特殊的亞熱帶氣候熟成環境',
    subRegions: ['金門', '台北', '台中'],
    grapes: ['高粱', '小麥', '大麥芽'],
    primaryStyles: ['台灣威士忌', '高粱威士忌'],
    famousBrands: ['金門高粱威士忌', '噶瑪蘭(Kavalan)', '威成立'],
    climate: '亞熱帶季風氣候',
    soil: '海島型氣候影響',
    position: { x: 95, y: 50 },
    color: '#006400',
    area: 'Taiwan'
  },
  {
    id: 'australia',
    name: '澳洲',
    country: '澳洲',
    description: '新世界的威士忌產區，創新的釀造方法',
    subRegions: ['塔斯馬尼亞', '維多利亞', '南澳'],
    grapes: ['大麥芽', '小麥', '燕麥'],
    primaryStyles: ['澳洲威士忌'],
    famousBrands: ['Lark', 'Sullivans Cove', 'Hellyers Road'],
    climate: '多樣化氣候',
    soil: '多樣化土壤類型',
    position: { x: 97, y: 85 },
    color: '#000080',
    area: 'Australia'
  },
  {
    id: 'germany',
    name: '德國',
    country: '德國',
    description: '精品威士忌生產，注重傳統工藝',
    subRegions: ['巴伐利亞', '巴登-符騰堡'],
    grapes: ['大麥芽', '小麥', '裸麥'],
    primaryStyles: ['德國威士忌'],
    famousBrands: ['Glen Elsass', 'Langatun', 'Zwack'],
    climate: '溫帶大陸性氣候',
    soil: '多樣化土壤類型',
    position: { x: 45, y: 25 },
    color: '#3CB371',
    area: 'Germany'
  }
];

// 產區比較資料
const REGION_COMPARISONS = [
  {
    category: '風味特點',
    scotland: '豐富多樣，從清淡到泥炭',
    ireland: '輕柔順滑，少有泥炭味',
    usa: '濃郁甜美，玉米風味明顯',
    japan: '精緻平衡，細膩複雜'
  },
  {
    category: '蒸餾次數',
    scotland: '通常二次蒸餾',
    ireland: '傳統三次蒸餾',
    usa: '工業化連續蒸餾',
    japan: '精細控制蒸餾'
  },
  {
    category: '熟成要求',
    scotland: '最少3年，橡木桶熟成',
    ireland: '最少3年',
    usa: '波本桶，無時間限制',
    japan: '最少3年，多樣化桶型'
  },
  {
    category: '主要穀物',
    scotland: '大麥芽',
    ireland: '大麥芽、穀物',
    usa: '玉米(≥51%)',
    japan: '大麥芽、穀物'
  }
];

export function InteractiveWhiskyMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const selectedRegionData = selectedRegion ? WHISKY_REGIONS.find(r => r.id === selectedRegion) : null;

  return (
    <div className="space-y-6">
      {/* 世界地圖背景和互動點 */}
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl border border-white/20 overflow-hidden">
        {/* 模擬世界地圖背景 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-green-600 rounded-full"></div>
          <div className="absolute top-1/3 left-1/2 w-12 h-12 bg-green-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-10 h-10 bg-green-700 rounded-full"></div>
          <div className="absolute top-2/3 left-3/4 w-14 h-14 bg-green-600 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-green-500 rounded-full"></div>
        </div>

        {/* 產區標記 */}
        {WHISKY_REGIONS.map((region) => (
          <m.div
            key={region.id}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white/50 shadow-lg ${
              hoveredRegion === region.id || selectedRegion === region.id
                ? 'scale-150 z-10'
                : 'scale-100'
            }`}
            style={{
              left: `${region.position.x}%`,
              top: `${region.position.y}%`,
              backgroundColor: selectedRegion === region.id ? region.color : hoveredRegion === region.id ? region.color : 'rgba(255,255,255,0.3)'
            }}
            onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: selectedRegion === region.id 
                ? `0 0 20px ${region.color}, 0 0 30px ${region.color}`
                : hoveredRegion === region.id
                ? `0 0 15px ${region.color}`
                : 'none'
            }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              {region.name}
            </div>
          </m.div>
        ))}

        {/* 地圖標題 */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2 text-white">
            <Globe className="w-5 h-5" />
            <h3 className="font-bold">世界威士忌產區地圖</h3>
          </div>
          <p className="text-white/70 text-sm mt-1">點擊標記查看詳細資訊</p>
        </div>
      </div>

      {/* 產區資訊面板 */}
      {selectedRegionData && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-white/20 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-400" />
                {selectedRegionData.name} - {selectedRegionData.country}
              </h3>
              <p className="text-white/70">{selectedRegionData.area}</p>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-white/50 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  產區介紹
                </h4>
                <p className="text-white/90">{selectedRegionData.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  主要子產區
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegionData.subRegions.map((sub, index) => (
                    <span key={index} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  知名品牌
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegionData.famousBrands.map((brand, index) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-full text-sm">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Wine className="w-4 h-4" />
                  主要風格
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegionData.primaryStyles.map((style, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <Factory className="w-4 h-4" />
                  風土條件
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-white/70">氣候：</span><span className="text-white">{selectedRegionData.climate}</span></p>
                  <p><span className="text-white/70">土壤：</span><span className="text-white">{selectedRegionData.soil}</span></p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  主要原料
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegionData.grapes.map((grain, index) => (
                    <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      {grain}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </m.div>
      )}

      {/* 產區比較表格 */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          產區風格比較
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 text-amber-400">比較項目</th>
                <th className="text-left py-2 text-blue-400">蘇格蘭</th>
                <th className="text-left py-2 text-green-400">愛爾蘭</th>
                <th className="text-left py-2 text-red-400">美國</th>
                <th className="text-left py-2 text-pink-400">日本</th>
              </tr>
            </thead>
            <tbody>
              {REGION_COMPARISONS.map((comparison, index) => (
                <tr key={index} className="border-b border-white/10 last:border-b-0 hover:bg-white/5">
                  <td className="py-3 font-medium text-white">{comparison.category}</td>
                  <td className="py-3 text-blue-300">{comparison.scotland}</td>
                  <td className="py-3 text-green-300">{comparison.ireland}</td>
                  <td className="py-3 text-red-300">{comparison.usa}</td>
                  <td className="py-3 text-pink-300">{comparison.japan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 產區特色總結 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
          <h4 className="font-semibold text-blue-400 mb-2">傳統工藝</h4>
          <p className="text-white/80 text-sm">
            蘇格蘭和愛爾蘭代表威士忌的傳統工藝，注重手工製作和長期熟成
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-white/10">
          <h4 className="font-semibold text-orange-400 mb-2">創新風格</h4>
          <p className="text-white/80 text-sm">
            美國和日本代表新世界的創新風格，融合現代技術和傳統工藝
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-white/10">
          <h4 className="font-semibold text-green-400 mb-2">全球發展</h4>
          <p className="text-white/80 text-sm">
            印度、台灣、澳洲等地區展現威士忌在全球的蓬勃發展
          </p>
        </div>
      </div>
    </div>
  );
}