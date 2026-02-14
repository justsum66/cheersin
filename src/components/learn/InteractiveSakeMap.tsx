'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { MapPin, Globe, Info, Star, Award, History, Factory, Wine } from 'lucide-react';

// 清酒產區資料
const SAKE_REGIONS = [
  {
    id: 'niigata',
    name: '新潟縣',
    country: '日本',
    description: '日本最著名的清酒產區之一，以淡麗辛口的清酒聞名',
    subRegions: ['越後', '佐渡', '村上'],
    grapes: ['酒造好適米'], // 清酒使用酒米而非葡萄
    primaryStyles: ['純米酒', '吟釀酒'],
    famousBrands: ['越乃寒梅', '加藤吉平商店', '高橋酒造'],
    climate: '豪雪地帶，冬季漫長寒冷',
    soil: '豐富的雪融水提供優質釀造用水',
    position: { x: 88, y: 35 },
    color: '#87CEEB',
    area: 'Niigata'
  },
  {
    id: 'hyogo',
    name: '兵庫縣',
    country: '日本',
    description: '山田錦的最大產地，日本三大都市圈之一',
    subRegions: ['灘五鄉', '有馬郡', '神戶'],
    grapes: ['山田錦'],
    primaryStyles: ['大吟釀', '純米吟釀'],
    famousBrands: ['白鶴', '大關', '菊正宗'],
    climate: '溫暖的內陸性氣候',
    soil: '適合種植山田錦的肥沃土壤',
    position: { x: 85, y: 42 },
    color: '#4169E1',
    area: 'Hyogo'
  },
  {
    id: 'kyoto',
    name: '京都府',
    country: '日本',
    description: '傳統工藝與現代技術的結合，精緻清酒的代表',
    subRegions: ['伏見', '丹波', '綾部'],
    grapes: ['美山錦', '祝'],
    primaryStyles: ['京の美酒', '伏見'],
    famousBrands: ['月桂冠', '菊正宗', '松竹梅'],
    climate: '溫暖的內陸性氣候',
    soil: '伏見地區的優質地下水',
    position: { x: 84, y: 43 },
    color: '#9370DB',
    area: 'Kyoto'
  },
  {
    id: 'osaka',
    name: '大阪府',
    country: '日本',
    description: '江戶時代的酒文化中心，現代清酒技術發展地',
    subRegions: ['大山崎', '攝津', '豊中'],
    grapes: ['全國各地酒米'],
    primaryStyles: ['関西風味', '中辛口'],
    famousBrands: ['柏鶴', '仙禽', '天寶'],
    climate: '溫暖潮濕的氣候',
    soil: '適中的降水量',
    position: { x: 84, y: 44 },
    color: '#BA55D3',
    area: 'Osaka'
  },
  {
    id: 'ishikawa',
    name: '石川縣',
    country: '日本',
    description: '加賀百万石的文化底蘊，傳統釀造技術',
    subRegions: ['能登', '加賀', '金沢'],
    grapes: ['五百萬石', '山田錦'],
    primaryStyles: ['加賀酒', '能登酒'],
    famousBrands: ['菊鶴', '白真鶴', '新政'],
    climate: '日本海側氣候，冬季多雪',
    soil: '日本海的濕潤氣候',
    position: { x: 86, y: 42 },
    color: '#FF69B4',
    area: 'Ishikawa'
  },
  {
    id: 'fukushima',
    name: '福島縣',
    country: '日本',
    description: '東北地區的清酒重鎮，優質水資源豐富',
    subRegions: ['会津', '中通り', '浜通り'],
    grapes: ['雄町', '吟ぎんが'],
    primaryStyles: ['会津酒', '雄町酒'],
    famousBrands: ['十四代', '飛露喜', '梵'],
    climate: '內陸性氣候，四季分明',
    soil: '清澈的河水和地下水',
    position: { x: 90, y: 40 },
    color: '#FF1493',
    area: 'Fukushima'
  },
  {
    id: 'yamagata',
    name: '山形縣',
    country: '日本',
    description: '雪国の清酒文化，山形酵母的發源地',
    subRegions: ['庄内', '村山', '最上'],
    grapes: ['出羽燦々', '山形酒造好適米'],
    primaryStyles: ['山形酵母', '果香型'],
    famousBrands: ['くどき上手', '飛露喜', '新政'],
    climate: '豪雪地帶，冬季漫長',
    soil: '雪融水提供的優質水源',
    position: { x: 91, y: 39 },
    color: '#DC143C',
    area: 'Yamagata'
  },
  {
    id: 'akita',
    name: '秋田縣',
    country: '日本',
    description: '米どころとして有名，優質酒米的產地',
    subRegions: ['雄勝', '仙北', '湯沢'],
    grapes: ['美郷錦', '吟ぎんが'],
    primaryStyles: ['秋田酒', '米の旨み'],
    famousBrands: ['新政', '龍泉', '八海山'],
    climate: '豪雪地帶，內陸性氣候',
    soil: '肥沃的沖積土',
    position: { x: 92, y: 38 },
    color: '#B22222',
    area: 'Akita'
  },
  {
    id: 'hiroshima',
    name: '廣島縣',
    country: '日本',
    description: '軟水釀造的發源地，淡麗な口当たり',
    subRegions: ['西条', '庄原', '三次'],
    grapes: ['吟ぎんが', '山田錦'],
    primaryStyles: ['西条酒', '軟水系'],
    famousBrands: ['司牡丹', '廣島銘釀', '白牡丹'],
    climate: '瀨戶內海式氣候',
    soil: '軟水豐富的地下水源',
    position: { x: 82, y: 47 },
    color: '#FF4500',
    area: 'Hiroshima'
  },
  {
    id: 'okayama',
    name: '岡山縣',
    country: '日本',
    description: '晴れの国，優良な気候条件で酒米栽培',
    subRegions: ['吉備', '備前', '備中'],
    grapes: ['雄町', '山田錦'],
    primaryStyles: ['吉備の酒', 'マイルド系'],
    famousBrands: ['旭酒造', '大信酒造', '井上酒造'],
    climate: '瀨戶內海式氣候，日照充足',
    soil: '肥沃な沖積土',
    position: { x: 83, y: 46 },
    color: '#FF6347',
    area: 'Okayama'
  }
];

// 產區比較資料
const REGION_COMPARISONS = [
  {
    category: '風味特點',
    niigata: '淡麗辛口，清爽乾淨',
    hyogo: '醇厚豐滿，米香濃郁',
    kyoto: '精緻優雅，平衡感佳',
    fukushima: '果香型，複雜層次'
  },
  {
    category: '主要酒米',
    niigata: '五百万石、亀の尾',
    hyogo: '山田錦',
    kyoto: '美山錦、祝',
    fukushima: '雄町、吟ぎんが'
  },
  {
    category: '釀造特色',
    niigata: '豪雪地帶低溫發酵',
    hyogo: '灘五鄉傳統技術',
    kyoto: '伏見伏流水',
    fukushima: '十四代精工釀造'
  },
  {
    category: '氣候影響',
    niigata: '冬季漫長寒冷有利',
    hyogo: '溫暖內陸性氣候',
    kyoto: '四季分明',
    fukushima: '內陸性氣候四季分明'
  }
];

export function InteractiveSakeMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const selectedRegionData = selectedRegion ? SAKE_REGIONS.find(r => r.id === selectedRegion) : null;

  return (
    <div className="space-y-6">
      {/* 世界地圖背景和互動點 */}
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl border border-white/20 overflow-hidden">
        {/* 模擬日本地圖背景 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-green-600 rounded-full"></div>
          <div className="absolute top-1/3 left-1/2 w-12 h-12 bg-green-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-10 h-10 bg-green-700 rounded-full"></div>
          <div className="absolute top-2/3 left-3/4 w-14 h-14 bg-green-600 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-green-500 rounded-full"></div>
        </div>

        {/* 產區標記 */}
        {SAKE_REGIONS.map((region) => (
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
            <h3 className="font-bold">日本清酒產區地圖</h3>
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
                  主要酒米
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegionData.grapes.map((rice, index) => (
                    <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      {rice}
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
                <th className="text-left py-2 text-blue-400">新潟</th>
                <th className="text-left py-2 text-green-400">兵庫</th>
                <th className="text-left py-2 text-red-400">京都</th>
                <th className="text-left py-2 text-pink-400">福島</th>
              </tr>
            </thead>
            <tbody>
              {REGION_COMPARISONS.map((comparison, index) => (
                <tr key={index} className="border-b border-white/10 last:border-b-0 hover:bg-white/5">
                  <td className="py-3 font-medium text-white">{comparison.category}</td>
                  <td className="py-3 text-blue-300">{comparison.niigata}</td>
                  <td className="py-3 text-green-300">{comparison.hyogo}</td>
                  <td className="py-3 text-red-300">{comparison.kyoto}</td>
                  <td className="py-3 text-pink-300">{comparison.fukushima}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 產區特色總結 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
          <h4 className="font-semibold text-blue-400 mb-2">豪雪地帶</h4>
          <p className="text-white/80 text-sm">
            新潟、山形、秋田等地的豪雪地帶，冬季漫長寒冷，非常適合清酒的低溫發酵
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-white/10">
          <h4 className="font-semibold text-orange-400 mb-2">傳統中心</h4>
          <p className="text-white/80 text-sm">
            兵庫灘五鄉、京都伏見等地，擁有悠久的釀造傳統和技術
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-white/10">
          <h4 className="font-semibold text-green-400 mb-2">現代創新</h4>
          <p className="text-white/80 text-sm">
            福島十四代、新政等現代精工釀造，展現清酒的無限可能性
          </p>
        </div>
      </div>
    </div>
  );
}