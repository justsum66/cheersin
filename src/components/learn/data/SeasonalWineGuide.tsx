'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { Calendar, Sun, CloudSnow, Leaf, Wind, Utensils, Sparkles } from 'lucide-react';

const SEASONAL_GUIDES = [
  {
    id: 'spring',
    name: '春季推薦',
    icon: <Leaf className="w-6 h-6" />,
    seasonColor: 'from-green-400 to-emerald-500',
    description: '春暖花開，適合清爽果香的白酒與粉紅酒',
    wines: [
      { name: '普羅旺斯粉紅酒', type: '粉紅酒', region: '法國普羅旺斯', description: '清新果香，適合春季野餐' },
      { name: '夏布利白酒', type: '白酒', region: '法國勃根地', description: '礦物感十足，搭配春季蔬果' },
      { name: '雷司令', type: '白酒', region: '德國摩澤爾', description: '酸甜平衡，完美詮釋春天' }
    ],
    occasions: ['踏青野餐', '春季聚會', '輕食搭配'],
    foodPairing: ['沙拉', '海鮮', '白肉']
  },
  {
    id: 'summer',
    name: '夏季推薦',
    icon: <Sun className="w-6 h-6" />,
    seasonColor: 'from-yellow-400 to-orange-500',
    description: '炎熱夏日，清涼爽口的白酒與氣泡酒最佳',
    wines: [
      { name: '卡瓦氣泡酒', type: '氣泡酒', region: '西班牙', description: '價格親民，夏日派對首選' },
      { name: '普伊芙美', type: '白酒', region: '法國盧瓦爾河谷', description: '花香果香，冰鎮後極佳' },
      { name: '維歐尼耶', type: '白酒', region: '法國隆河谷', description: '濃郁果香，適合海鮮料理' }
    ],
    occasions: ['海灘派對', 'BBQ烤肉', '戶外聚會'],
    foodPairing: ['燒烤', '海鮮', '沙律']
  },
  {
    id: 'autumn',
    name: '秋季推薦',
    icon: <Leaf className="w-6 h-6" style={{ transform: 'rotate(180deg)' }} />,
    seasonColor: 'from-amber-500 to-red-600',
    description: '秋高氣爽，中等酒體的紅酒與白酒都很適合',
    wines: [
      { name: '博若萊新酒', type: '紅酒', region: '法國博若萊', description: '新鮮果香，秋季限定' },
      { name: '灰皮諾', type: '白酒', region: '法國阿爾薩斯', description: '圓潤口感，適合秋日品嚐' },
      { name: '黑皮諾', type: '紅酒', region: '法國勃根地', description: '細膩單寧，完美搭配秋菜' }
    ],
    occasions: ['賞楓聚會', '感恩節慶', '溫馨晚餐'],
    foodPairing: ['烤肉', '蘑菇料理', '南瓜料理']
  },
  {
    id: 'winter',
    name: '冬季推薦',
    icon: <CloudSnow className="w-6 h-6" />,
    seasonColor: 'from-blue-400 to-indigo-600',
    description: '寒冷冬日，濃郁厚重的紅酒與甜酒最暖人心',
    wines: [
      { name: '西拉', type: '紅酒', region: '澳洲巴羅莎谷', description: '濃郁果醬味，溫暖身心' },
      { name: '波特酒', type: '甜酒', region: '葡萄牙杜羅河谷', description: '濃郁甜美，冬日聖品' },
      { name: '雪莉酒', type: '強化酒', region: '西班牙赫雷斯', description: '複雜風味，適合佐餐' }
    ],
    occasions: ['聖誕晚宴', '跨年派對', '家庭聚會'],
    foodPairing: ['紅肉', '起司', '甜點']
  }
];

const CALENDAR_EVENTS = [
  { month: 3, event: '波爾多期酒發布', description: '每年春季的重要酒業盛事' },
  { month: 8, event: '收穫季節', description: '全球葡萄採收的重要時期' },
  { month: 10, event: '酒莊開放日', description: '品酒愛好者的朝聖季節' },
  { month: 12, event: '聖誕波特酒', description: '節慶期間的傳統選擇' }
];

export function SeasonalWineGuide() {
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
              {season.wines.length} 款推薦
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
          <h3 className="text-lg font-semibold text-white">葡萄酒活動日曆</h3>
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

            {/* 推薦酒款 */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                季節推薦酒款
              </h4>
              <div className="grid gap-3">
                {season.wines.map((wine, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-white">{wine.name}</h5>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                        {wine.type}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-1">{wine.region}</p>
                    <p className="text-xs text-white/50">{wine.description}</p>
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
        <h4 className="text-lg font-semibold text-white mb-3">🍷 季節品酒小貼士</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-white mb-2">溫度控制</h5>
            <ul className="text-white/70 space-y-1">
              <li>• 夏季白酒：冰鎮至 8-10°C</li>
              <li>• 春秋季白酒：10-12°C</li>
              <li>• 冬季紅酒：室溫 16-18°C</li>
              <li>• 氣泡酒：冰鎮至 6-8°C</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">保存訣竅</h5>
            <ul className="text-white/70 space-y-1">
              <li>• 避免陽光直射</li>
              <li>• 保持恆溫恆濕</li>
              <li>• 水平放置酒瓶</li>
              <li>• 避免劇烈震動</li>
            </ul>
          </div>
        </div>
      </m.div>
    </div>
  );
}