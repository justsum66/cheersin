'use client';

import React, { useState } from 'react';
import { m , AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Info, BarChart3, Wheat } from 'lucide-react';

interface BeerCiderRegion {
  id: string;
  name: string;
  country: string;
  description: string;
  subRegions: string[];
  ingredients: string[]; // 主要原料
  primaryStyles: string[]; // 主要風格
  famousBrands: string[]; // 知名品牌
  climate: string; // 氣候條件
  soil: string; // 土壤條件
  position: { x: number; y: number }; // 在地圖上的位置
  color: string; // 區域顏色
  area: string; // 英文地區名稱
  population: number; // 人口數量
  productionVolume: number; // 年產量 (hl)
  avgTemperature: number; // 平均溫度
  annualRainfall: number; // 年降雨量 (mm)
  harvestPeriod: string; // 收穫期
  brewingHistory: string; // 釀造歷史
  specialFeatures: string[]; // 特色
}

const BEER_CIDER_REGIONS: BeerCiderRegion[] = [
  {
    id: 'czech-republic',
    name: '捷克共和國',
    country: '捷克',
    description: '世界最著名的啤酒產區之一，以皮爾森啤酒聞名全球',
    subRegions: ['波希米亞', '摩拉維亞', '西里西亞'],
    ingredients: ['大麥', '啤酒花', '水'],
    primaryStyles: ['皮爾森', '拉格', '艾爾'],
    famousBrands: ['Pilsner Urquell', 'Budweiser Budvar', 'Gambrinus'],
    climate: '溫帶大陸性氣候，四季分明',
    soil: '肥沃的衝積土和褐土',
    position: { x: 55, y: 35 },
    color: '#FFD700',
    area: 'Czech Republic',
    population: 10700000,
    productionVolume: 19000000,
    avgTemperature: 8.5,
    annualRainfall: 650,
    harvestPeriod: '八月至九月',
    brewingHistory: '自13世紀開始啤酒釀造傳統',
    specialFeatures: ['優質啤酒花', '傳統窖藏技術', '悠久釀造歷史']
  },
  {
    id: 'germany',
    name: '德國',
    country: '德國',
    description: '擁有世界上最嚴格的啤酒純淨法，以多樣化啤酒風格聞名',
    subRegions: ['巴伐利亞', '北萊茵-威斯特法倫', '巴登-符騰堡'],
    ingredients: ['大麥', '啤酒花', '水', '酵母'],
    primaryStyles: ['拉格', '小麥啤酒', '科隆啤酒'],
    famousBrands: ['Weihenstephan', 'Bitburger', 'Warsteiner'],
    climate: '溫帶海洋性氣候，適宜農業',
    soil: '多樣化的土壤類型，適合大麥種植',
    position: { x: 48, y: 32 },
    color: '#FF6347',
    area: 'Germany',
    population: 83200000,
    productionVolume: 89000000,
    avgTemperature: 9.5,
    annualRainfall: 750,
    harvestPeriod: '九月至十月',
    brewingHistory: '超過1000年的啤酒釀造歷史',
    specialFeatures: ['啤酒純淨法', '多樣風格', '啤酒花品質']
  },
  {
    id: 'belgium',
    name: '比利時',
    country: '比利時',
    description: '以複雜的酸啤酒和修道院啤酒聞名，擁有獨特的釀造傳統',
    subRegions: ['佛蘭德斯', '瓦隆', '布魯塞爾'],
    ingredients: ['大麥', '小麥', '燕麥', '香料'],
    primaryStyles: ['蘭比克', '修道院啤酒', '酸啤酒'],
    famousBrands: ['Westvleteren', 'Rochefort', 'Orval'],
    climate: '溫帶海洋性氣候，濕潤涼爽',
    soil: '適合多種穀物種植的肥沃土壤',
    position: { x: 42, y: 38 },
    color: '#9370DB',
    area: 'Belgium',
    population: 11600000,
    productionVolume: 16000000,
    avgTemperature: 10.5,
    annualRainfall: 850,
    harvestPeriod: '九月至十月',
    brewingHistory: '中世紀修道院釀造傳統',
    specialFeatures: ['野生酵母', '複雜風味', '手工釀造']
  },
  {
    id: 'england',
    name: '英格蘭',
    country: '英國',
    description: '艾爾啤酒的發源地，以傳統英式酒吧文化聞名',
    subRegions: ['肯特', '薩里', '約克郡'],
    ingredients: ['大麥', '啤酒花', '水'],
    primaryStyles: ['苦啤酒', '波特', '司陶特'],
    famousBrands: ['Fuller\'s', 'Samuel Smith', 'Young\'s'],
    climate: '溫帶海洋性氣候，多雨涼爽',
    soil: '適合大麥和啤酒花種植',
    position: { x: 35, y: 30 },
    color: '#32CD32',
    area: 'England',
    population: 56000000,
    productionVolume: 45000000,
    avgTemperature: 9.5,
    annualRainfall: 900,
    harvestPeriod: '九月至十月',
    brewingHistory: '超過500年的艾爾釀造傳統',
    specialFeatures: ['英式酒花', '傳統工藝', '酒吧文化']
  },
  {
    id: 'scotland',
    name: '蘇格蘭',
    country: '英國',
    description: '不僅以威士忌聞名，也擁有優質的啤酒釀造傳統',
    subRegions: ['高地', '低地', '艾雷島'],
    ingredients: ['大麥', '水', '泥炭'],
    primaryStyles: ['愛爾', '拉格', '小麥啤酒'],
    famousBrands: ['BrewDog', 'Innis & Gunn', 'Harviestoun'],
    climate: '溫帶海洋性氣候，涼爽多雨',
    soil: '適合大麥種植的酸性土壤',
    position: { x: 28, y: 22 },
    color: '#FF4500',
    area: 'Scotland',
    population: 5500000,
    productionVolume: 8000000,
    avgTemperature: 7.5,
    annualRainfall: 1200,
    harvestPeriod: '八月至九月',
    brewingHistory: '古老的釀造傳統',
    specialFeatures: ['高地水質', '傳統工藝', '創新精神']
  },
  {
    id: 'ireland',
    name: '愛爾蘭',
    country: '愛爾蘭',
    description: '以司陶特和愛爾啤酒聞名，特別是健力士黑啤酒',
    subRegions: ['都柏林', '科克', '高威'],
    ingredients: ['大麥', '烘烤大麥', '水'],
    primaryStyles: ['司陶特', '愛爾', '拉格'],
    famousBrands: ['Guinness', 'Smithwick\'s', 'Murphy\'s'],
    climate: '溫帶海洋性氣候，濕潤溫和',
    soil: '適合大麥種植的肥沃土壤',
    position: { x: 22, y: 28 },
    color: '#3CB371',
    area: 'Ireland',
    population: 5000000,
    productionVolume: 7500000,
    avgTemperature: 9.5,
    annualRainfall: 1000,
    harvestPeriod: '八月至十月',
    brewingHistory: '千年以上的釀造傳統',
    specialFeatures: ['烘烤風味', '氮氣口感', '黑色泡沫']
  },
  {
    id: 'france',
    name: '法國',
    country: '法國',
    description: '雖然以葡萄酒聞名，但也有優質的啤酒和蘋果酒產區',
    subRegions: ['布列塔尼', '阿爾薩斯', '諾曼第'],
    ingredients: ['大麥', '小麥', '蘋果', '梨子'],
    primaryStyles: ['法式艾爾', '西打', '梨酒'],
    famousBrands: ['Kronenbourg', 'Fischer', 'Dupont'],
    climate: '多樣化的氣候，適合多種作物',
    soil: '多樣化的土壤類型',
    position: { x: 40, y: 42 },
    color: '#1E90FF',
    area: 'France',
    population: 67400000,
    productionVolume: 18000000,
    avgTemperature: 11.5,
    annualRainfall: 750,
    harvestPeriod: '九月至十一月',
    brewingHistory: '區域性釀造傳統',
    specialFeatures: ['法式風格', '水果酒', '區域特色']
  },
  {
    id: 'usa',
    name: '美國',
    country: '美國',
    description: '精釀啤酒革命的中心，以創新的IPA和實驗性風格聞名',
    subRegions: ['科羅拉多', '加州', '華盛頓州', '俄勒岡州'],
    ingredients: ['大麥', '啤酒花', '水', '各種香料'],
    primaryStyles: ['美式IPA', '精釀艾爾', '實驗性啤酒'],
    famousBrands: ['Sierra Nevada', 'Stone', 'Russian River'],
    climate: '多樣化氣候，適合各地釀造',
    soil: '多樣化土壤，支持多種原料',
    position: { x: 10, y: 35 },
    color: '#FF1493',
    area: 'USA',
    population: 331000000,
    productionVolume: 250000000,
    avgTemperature: 13.5,
    annualRainfall: 760,
    harvestPeriod: '八月至十月',
    brewingHistory: '近40年的精釀啤酒革命',
    specialFeatures: ['創新精神', '酒花風味', '實驗性']
  },
  {
    id: 'china',
    name: '中國',
    country: '中國',
    description: '快速發展的啤酒市場，青島啤酒等知名品牌享譽國際',
    subRegions: ['山東', '遼寧', '四川'],
    ingredients: ['大麥', '大米', '水'],
    primaryStyles: ['拉格', '工業啤酒', '精釀啤酒'],
    famousBrands: ['Tsingtao', 'Snow', 'China Resources'],
    climate: '多樣化氣候，適合不同種植',
    soil: '廣泛的農業用地',
    position: { x: 85, y: 45 },
    color: '#DC143C',
    area: 'China',
    population: 1412000000,
    productionVolume: 380000000,
    avgTemperature: 14.5,
    annualRainfall: 650,
    harvestPeriod: '七月至九月',
    brewingHistory: '現代啤酒工業發展迅速',
    specialFeatures: ['大規模生產', '市場潛力', '品質提升']
  },
  {
    id: 'japan',
    name: '日本',
    country: '日本',
    description: '以精緻的釀造工藝和純淨口感的啤酒聞名',
    subRegions: ['北海道', '關東', '關西'],
    ingredients: ['大麥', '大米', '蛇麻草'],
    primaryStyles: ['日式拉格', '精釀啤酒', '清酒風格'],
    famousBrands: ['Asahi', 'Kirin', 'Sapporo'],
    climate: '溫帶季風氣候，四季分明',
    soil: '適合農業的多樣化土壤',
    position: { x: 95, y: 42 },
    color: '#4169E1',
    area: 'Japan',
    population: 125800000,
    productionVolume: 50000000,
    avgTemperature: 15.5,
    annualRainfall: 1700,
    harvestPeriod: '九月至十月',
    brewingHistory: '明治時代引入西方釀造技術',
    specialFeatures: ['精緻工藝', '純淨口感', '品質控制']
  }
];

const REGION_COMPARISON_DATA = [
  {
    region: '德國',
    production: 89000000,
    qualityScore: 9.2,
    variety: 9.5,
    tradition: 9.8
  },
  {
    region: '捷克',
    production: 19000000,
    qualityScore: 9.5,
    variety: 8.0,
    tradition: 9.6
  },
  {
    region: '比利時',
    production: 16000000,
    qualityScore: 9.8,
    variety: 9.8,
    tradition: 9.5
  },
  {
    region: '美國',
    production: 250000000,
    qualityScore: 8.8,
    variety: 9.8,
    tradition: 7.5
  },
  {
    region: '英格蘭',
    production: 45000000,
    qualityScore: 9.0,
    variety: 8.5,
    tradition: 9.7
  }
];

export function InteractiveBeerCiderMap() {
  const [selectedRegion, setSelectedRegion] = useState<BeerCiderRegion | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'comparison'>('info');

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題區域 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
          <Globe className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-medium">世界啤酒與蘋果酒產區地圖</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Interactive Beer & Cider Regions Map
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          探索全球最重要的啤酒與蘋果酒產區，了解各地的特色風味、釀造傳統和文化背景。
        </p>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 地圖區域 */}
        <m.div 
          className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative w-full h-96 bg-gradient-to-b from-blue-900/20 to-indigo-900/20 rounded-xl border border-white/10 overflow-hidden">
            {/* 簡化版世界地圖輪廓 */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M10,20 Q20,15 30,20 T50,25 T70,20 T90,25 L90,35 Q80,40 70,35 T50,40 T30,35 T10,40 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
              </svg>
            </div>

            {/* 3D 效果的區域標記 */}
            {BEER_CIDER_REGIONS.map((region, index) => (
              <m.div
                key={region.id}
                className={`absolute cursor-pointer group ${selectedRegion?.id === region.id ? 'z-10' : ''}`}
                style={{
                  left: `${region.position.x}%`,
                  top: `${region.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.3, zIndex: 20 }}
                onClick={() => setSelectedRegion(region)}
              >
                <m.div
                  className="relative"
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg"
                    style={{ backgroundColor: region.color }}
                  />
                  <m.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {region.name}
                  </m.div>
                  
                  {/* 3D 效果光暈 */}
                  <m.div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50"
                    style={{ 
                      backgroundColor: region.color,
                      filter: 'blur(8px)',
                      transform: 'scale(2)'
                    }}
                    animate={{ 
                      scale: selectedRegion?.id === region.id ? 2.5 : 2,
                      opacity: selectedRegion?.id === region.id ? 0.7 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </m.div>
              </m.div>
            ))}
          </div>

          {/* 地圖圖例 */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {BEER_CIDER_REGIONS.slice(0, 5).map((region) => (
              <div key={region.id} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: region.color }}
                />
                <span className="text-white/70">{region.name}</span>
              </div>
            ))}
          </div>
        </m.div>

        {/* 資訊面板 */}
        <m.div 
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'info' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('info')}
            >
              區域資訊
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'comparison' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('comparison')}
            >
              區域比較
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <m.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {selectedRegion ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedRegion.color }}
                      />
                      <h3 className="text-xl font-bold text-white">{selectedRegion.name}</h3>
                      <span className="text-amber-400 text-sm">{selectedRegion.area}</span>
                    </div>
                    
                    <p className="text-white/80">{selectedRegion.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-amber-400 font-medium">國家：</span>
                        <p className="text-white/70">{selectedRegion.country}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 font-medium">氣候：</span>
                        <p className="text-white/70">{selectedRegion.climate}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 font-medium">土壤：</span>
                        <p className="text-white/70">{selectedRegion.soil}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 font-medium">平均溫度：</span>
                        <p className="text-white/70">{selectedRegion.avgTemperature}°C</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Wheat className="w-4 h-4" />
                        主要原料
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.ingredients.map((ingredient, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">主要風格</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.primaryStyles.map((style, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">知名品牌</h4>
                      <ul className="space-y-1">
                        {selectedRegion.famousBrands.map((brand, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex items-center gap-2">
                            <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                            {brand}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="font-semibold text-white mb-2">特色</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.specialFeatures.map((feature, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Info className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/50">點擊地圖上的標記以查看區域詳細資訊</p>
                  </div>
                )}
              </m.div>
            ) : (
              <m.div
                key="comparison"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  產區比較
                </h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {REGION_COMPARISON_DATA.map((data, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">{data.region}</span>
                        <span className="text-amber-400 text-sm">{data.production.toLocaleString()} hl</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>品質</span>
                            <span>{data.qualityScore}/10</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <m.div 
                              className="bg-amber-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${data.qualityScore * 10}%` }}
                              transition={{ delay: index * 0.1, duration: 0.8 }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>多樣性</span>
                            <span>{data.variety}/10</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <m.div 
                              className="bg-blue-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${data.variety * 10}%` }}
                              transition={{ delay: index * 0.1, duration: 0.8 }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>傳統</span>
                            <span>{data.tradition}/10</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <m.div 
                              className="bg-green-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${data.tradition * 10}%` }}
                              transition={{ delay: index * 0.1, duration: 0.8 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </div>

      {/* 額外資訊區域 */}
      <m.div 
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-400" />
            釀造原料
          </h3>
          <p className="text-white/70 text-sm">
            世界各地的啤酒和蘋果酒使用當地特有的原料，形成了獨特的風味特徵。
            從德國的純淨法到捷克的優質啤酒花，每一處都有其釀造哲學。
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            風味特點
          </h3>
          <p className="text-white/70 text-sm">
            不同產區的啤酒和蘋果酒展現出截然不同的風味特點。從比利時的複雜酸啤酒
            到美國的柑橘香IPA，每種風格都反映了當地的飲食文化和氣候條件。
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            文化意義
          </h3>
          <p className="text-white/70 text-sm">
            啤酒和蘋果酒不僅是飲料，更是當地文化的重要組成部分。從德國的啤酒花園
            到英國的傳統酒吧，這些飲品承載著深厚的社會和文化意義。
          </p>
        </div>
      </m.div>
    </div>
  );
}