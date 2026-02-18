'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { Calendar, Sun, CloudSnow, Leaf, Wind, Utensils, Sparkles, Coffee, IceCream, Flame, Snowflake } from 'lucide-react';

const SEASONAL_GUIDES = [
  {
    id: 'spring',
    name: '春季推薦',
    icon: <Leaf className="w-6 h-6" />,
    seasonColor: 'from-green-400 to-emerald-500',
    description: '春暖花開，適合輕盈果香的威士忌',
    whiskies: [
      { name: '格蘭菲迪 12年', type: '單一麥芽', region: '斯佩塞', description: '清新果香，適合春季品飲' },
      { name: '山崎 12年', type: '單一麥芽', region: '日本', description: '平衡優雅，展現春日精緻' },
      { name: '百富雙桶', type: '單一麥芽', region: '蘇格蘭', description: '花香果香，完美詮釋春天' }
    ],
    occasions: ['春遊野餐', '春季聚會', '輕食搭配'],
    foodPairing: ['沙拉', '海鮮', '白肉']
  },
  {
    id: 'summer',
    name: '夏季推薦',
    icon: <Sun className="w-6 h-6" />,
    seasonColor: 'from-yellow-400 to-orange-500',
    description: '炎熱夏日，清爽調和威士忌與威士忌調酒最佳',
    whiskies: [
      { name: '尊尼獲加紅牌', type: '調和威士忌', region: '蘇格蘭', description: '清爽順口，適合加冰品飲' },
      { name: '占邊白標', type: '波本威士忌', region: '美國', description: '經典波本，調酒基酒首選' },
      { name: '帝王', type: '調和威士忌', region: '蘇格蘭', description: '輕盈口感，夏日暢飲' }
    ],
    occasions: ['海灘派對', 'BBQ烤肉', '戶外聚會'],
    foodPairing: ['燒烤', '海鮮', '沙律']
  },
  {
    id: 'autumn',
    name: '秋季推薦',
    icon: <Leaf className="w-6 h-6" style={{ transform: 'rotate(180deg)' }} />,
    seasonColor: 'from-amber-500 to-red-600',
    description: '秋高氣爽，中等酒體的威士忌很適合',
    whiskies: [
      { name: '麥卡倫 12年', type: '單一麥芽', region: '斯佩塞', description: '雪莉桶風味，秋季溫暖之選' },
      { name: '格蘭多納', type: '單一麥芽', region: '高地', description: '雪莉桶熟成，適合秋日品飲' },
      { name: '泰斯卡 10年', type: '單一麥芽', region: '艾雷島', description: '海風泥炭，展現秋季深沉' }
    ],
    occasions: ['賞楓聚會', '感恩節慶', '溫馨晚餐'],
    foodPairing: ['烤肉', '蘑菇料理', '南瓜料理']
  },
  {
    id: 'winter',
    name: '冬季推薦',
    icon: <Snowflake className="w-6 h-6" />,
    seasonColor: 'from-blue-400 to-indigo-600',
    description: '寒冷冬日，濃郁厚重的威士忌最暖人心',
    whiskies: [
      { name: '拉加維林 16年', type: '單一麥芽', region: '艾雷島', description: '強烈泥炭味，溫暖身心' },
      { name: '高原騎士 18年', type: '單一麥芽', region: '島嶼', description: '泥炭與香草平衡，冬日聖品' },
      { name: '尊尼獲加黑牌', type: '調和威士忌', region: '蘇格蘭', description: '濃郁複雜，適合冬日慢品' }
    ],
    occasions: ['聖誕晚宴', '跨年派對', '家庭聚會'],
    foodPairing: ['紅肉', '起司', '巧克力']
  }
];

const CALENDAR_EVENTS = [
  { month: 1, event: '威士忌嘉年華', description: '年度威士忌盛會，各大品牌齊聚' },
  { month: 3, event: '蒸餾廠開放日', description: '蘇格蘭各大蒸餾廠開放參觀' },
  { month: 7, event: '艾雷島音樂節', description: '威士忌與音樂的完美結合' },
  { month: 10, event: '威士忌拍賣會', description: '珍稀威士忌拍賣，收藏家盛事' },
  { month: 12, event: '聖誕威士忌禮盒', description: '節慶期間的傳統選擇' }
];

const SPECIAL_OCCASIONS = [
  {
    occasion: '新年慶祝',
    recommended: ['尊尼獲加藍牌', '麥卡倫 25年', '山崎 25年'],
    serving: '純飲，室溫',
    mood: '慶祝、展望'
  },
  {
    occasion: '情人節',
    recommended: ['格蘭菲迪 15年', '百富波特桶', '艾茲伯格 12年'],
    serving: '加冰或少量水',
    mood: '浪漫、溫馨'
  },
  {
    occasion: '父親節',
    recommended: ['占邊精英', '野火雞 101', '四玫瑰黃標'],
    serving: '純飲或古典杯',
    mood: '敬意、懷念'
  },
  {
    occasion: '中秋節',
    recommended: ['金門高粱威士忌', '噶瑪蘭經典獨奏', '南投威士忌'],
    serving: '少量冰塊',
    mood: '團圓、思鄉'
  }
];

export function SeasonalWhiskyGuide() {
  const [activeSeason, setActiveSeason] = useState('summer');

  return (
    <div className="space-y-6">
      {/* 季節選擇導航 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {SEASONAL_GUIDES.map((season) => (
          <m.button
            key={season.id}
            onClick={() => setActiveSeason(season.id)}
            className={`p-3 rounded-xl text-left transition-all ${
              activeSeason === season.id
                ? `bg-gradient-to-r ${season.seasonColor} text-white shadow-lg`
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={activeSeason === season.id ? 'text-white' : 'text-white/70'}>
                {season.icon}
              </span>
              <span className="font-medium text-sm">{season.name}</span>
            </div>
            <p className={`text-xs ${activeSeason === season.id ? 'text-white/90' : 'text-white/50'}`}>
              {season.whiskies.length} 款推薦
            </p>
          </m.button>
        ))}
      </div>

      {/* 活動日曆 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">威士忌活動日曆</h3>
        </div>
        <div className="space-y-2">
          {CALENDAR_EVENTS.map((event, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-2 rounded-lg bg-white/5"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                {event.month}月
              </div>
              <div>
                <p className="text-white font-medium text-sm">{event.event}</p>
                <p className="text-white/60 text-xs">{event.description}</p>
              </div>
            </m.div>
          ))}
        </div>
      </m.div>

      {/* 特殊場合推薦 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-white/10"
      >
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          特殊場合推薦
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {SPECIAL_OCCASIONS.map((occasion, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <h4 className="font-medium text-white mb-2">{occasion.occasion}</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-white/60 mb-1">推薦威士忌</p>
                  <div className="flex flex-wrap gap-1">
                    {occasion.recommended.map((whisky, idx) => (
                      <span key={idx} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs">
                        {whisky}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">享用方式</p>
                  <p className="text-sm text-white/80">{occasion.serving}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">氛圍</p>
                  <p className="text-sm text-white/80">{occasion.mood}</p>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </m.div>

      {/* 當前季節推薦 */}
      {SEASONAL_GUIDES.map((season) => (
        <m.div
          key={season.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={activeSeason === season.id ? 'block' : 'hidden'}
        >
          <div className={`p-4 rounded-xl bg-gradient-to-r ${season.seasonColor} bg-opacity-10 border border-white/10`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${season.seasonColor} bg-opacity-20`}>
                {season.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{season.name}</h3>
                <p className="text-white/70 text-sm">{season.description}</p>
              </div>
            </div>

            {/* 推薦威士忌 */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                季節推薦威士忌
              </h4>
              <div className="grid gap-3">
                {season.whiskies.map((whisky, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-white">{whisky.name}</h5>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                        {whisky.type}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-1">{whisky.region}</p>
                    <p className="text-xs text-white/50">{whisky.description}</p>
                  </m.div>
                ))}
              </div>
            </div>

            {/* 適合場合與餐酒搭配 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-400" />
                  適合場合
                </h5>
                <div className="flex flex-wrap gap-2">
                  {season.occasions.map((occasion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-green-400" />
                  餐酒搭配
                </h5>
                <div className="flex flex-wrap gap-2">
                  {season.foodPairing.map((food, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </m.div>
      ))}

      {/* 季節小貼士 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-white/10"
      >
        <h4 className="text-lg font-semibold text-white mb-3">🥃 季節品飲小貼士</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-white mb-2">溫度控制</h5>
            <ul className="text-white/70 space-y-1">
              <li>• 夏季威士忌：室溫或加冰塊</li>
              <li>• 春秋季威士忌：室溫 18-20°C</li>
              <li>• 冬季威士忌：室溫或稍微加溫</li>
              <li>• 輕盈威士忌：稍冷 15-18°C</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">享用方式</h5>
            <ul className="text-white/70 space-y-1">
              <li>• 夏日：加冰或調酒</li>
              <li>• 冬日：純飲或少量水</li>
              <li>• 特殊場合：室溫純飲</li>
              <li>• 日常品飲：個人喜好</li>
            </ul>
          </div>
        </div>
      </m.div>
    </div>
  );
}