'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Wine, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface WineRegion {
  id: string
  name: string
  country: string
  description: string
  grapes: string[]
  courseId?: string
  position: { x: number; y: number }
  color: string
}

const WINE_REGIONS: WineRegion[] = [
  // 法國產區
  {
    id: 'bordeaux',
    name: '波爾多',
    country: '法國',
    description: '世界最知名的紅酒產區，以 Cabernet Sauvignon 和 Merlot 混釀聞名。分為左岸（梅多克）和右岸（聖愛美濃），擁有悠久的釀酒歷史和分級制度。',
    grapes: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Petit Verdot'],
    courseId: 'bordeaux-deep',
    position: { x: 28, y: 35 },
    color: '#8B0000',
  },
  {
    id: 'burgundy',
    name: '勃根地',
    country: '法國',
    description: '以單一品種聞名：紅酒用 Pinot Noir，白酒用 Chardonnay。風土（Terroir）概念的發源地，擁有世界上最複雜的葡萄園分級系統。',
    grapes: ['Pinot Noir', 'Chardonnay', 'Gamay', 'Aligoté'],
    courseId: 'burgundy-deep',
    position: { x: 33, y: 30 },
    color: '#722F37',
  },
  {
    id: 'champagne',
    name: '香檳區',
    country: '法國',
    description: '氣泡酒的故鄉，只有此區生產的氣泡酒才能稱為「香檳」。採用傳統瓶中二次發酵法，以三個葡萄品種為主。',
    grapes: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier'],
    courseId: 'champagne-sparkling',
    position: { x: 32, y: 25 },
    color: '#F5E6C4',
  },
  {
    id: 'rhone',
    name: '隆河谷',
    country: '法國',
    description: '分為北隆河和南隆河，北隆河以 Syrah 為主，南隆河以 Grenache 混釀聞名，風格多樣化。',
    grapes: ['Syrah', 'Grenache', 'Mourvèdre', 'Viognier'],
    position: { x: 35, y: 38 },
    color: '#CD5C5C',
  },
  
  // 義大利產區
  {
    id: 'tuscany',
    name: '托斯卡納',
    country: '義大利',
    description: '以 Sangiovese 品種聞名，經典基安帝和超級托斯卡納的故鄉。擁有豐富的歷史文化和優美的鄉村風景。',
    grapes: ['Sangiovese', 'Cabernet Sauvignon', 'Merlot', 'Canaiolo'],
    courseId: 'italy-deep',
    position: { x: 38, y: 38 },
    color: '#A52A2A',
  },
  {
    id: 'piedmont',
    name: '皮埃蒙特',
    country: '義大利',
    description: '以 Nebbiolo 品種聞名，巴羅洛和巴巴瑞斯可的故鄉。擁有陡峭的山坡葡萄園和傳統的釀酒工藝。',
    grapes: ['Nebbiolo', 'Barbera', 'Dolcetto', 'Moscato'],
    position: { x: 37, y: 32 },
    color: '#800000',
  },
  
  // 西班牙產區
  {
    id: 'rioja',
    name: '里奧哈',
    country: '西班牙',
    description: '西班牙最知名的葡萄酒產區，以 Tempranillo 為主要品種，橡木桶陳年風格獨特，分為三個子產區。',
    grapes: ['Tempranillo', 'Garnacha', 'Graciano', 'Mazuelo'],
    position: { x: 26, y: 37 },
    color: '#B22222',
  },
  {
    id: 'priorat',
    name: '普里奧拉托',
    country: '西班牙',
    description: '加泰隆尼亞的頂級產區，以 Garnacha 和 Cariñena 為主，陡峭的板岩土壤賦予酒款獨特的礦物質特色。',
    grapes: ['Garnacha', 'Cariñena', 'Cabernet Sauvignon', 'Syrah'],
    position: { x: 28, y: 39 },
    color: '#A52A2A',
  },
  
  // 德國產區
  {
    id: 'mosel',
    name: '摩澤爾',
    country: '德國',
    description: '德國頂級白酒產區，以陡峭河岸葡萄園聞名，生產世界最佳的 Riesling，風格從極乾到甜型都有。',
    grapes: ['Riesling', 'Müller-Thurgau', 'Pinot Noir'],
    position: { x: 34, y: 28 },
    color: '#FFEFD5',
  },
  {
    id: 'rheingau',
    name: '萊茵高',
    country: '德國',
    description: '萊茵河畔的重要產區，以優質 Riesling 和 Pinot Noir 聞名，擁有許多歷史悠久的酒莊。',
    grapes: ['Riesling', 'Pinot Noir', 'Spatburgunder'],
    position: { x: 33, y: 29 },
    color: '#F5DEB3',
  },
  
  // 新世界產區
  {
    id: 'napa',
    name: '納帕谷',
    country: '美國',
    description: '加州最知名的葡萄酒產區，以 Cabernet Sauvignon 聞名世界，擁有先進的釀酒技術和現代化設施。',
    grapes: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Zinfandel'],
    courseId: 'new-world-deep',
    position: { x: 12, y: 33 },
    color: '#800020',
  },
  {
    id: 'mendoza',
    name: '門多薩',
    country: '阿根廷',
    description: '阿根廷最重要的葡萄酒產區，高海拔種植，以 Malbec 紅酒聞名全球，擁有獨特的沙漠風土條件。',
    grapes: ['Malbec', 'Cabernet Sauvignon', 'Torrontés'],
    courseId: 'new-world-deep',
    position: { x: 22, y: 72 },
    color: '#4A0E4E',
  },
  {
    id: 'barossa',
    name: '巴羅莎谷',
    country: '澳洲',
    description: '澳洲最知名的葡萄酒產區，以 Shiraz 聞名，擁有百年老藤葡萄樹和獨特的澳洲釀酒風格。',
    grapes: ['Shiraz', 'Cabernet Sauvignon', 'Grenache', 'Mataro'],
    position: { x: 80, y: 70 },
    color: '#8B0000',
  },
  {
    id: 'central-otago',
    name: '中奧塔哥',
    country: '紐西蘭',
    description: '紐西蘭南島的頂級產區，以 Pinot Noir 聞名，擁有獨特的大陸性氣候和壯麗的自然風光。',
    grapes: ['Pinot Noir', 'Riesling', 'Pinot Gris', 'Chardonnay'],
    position: { x: 85, y: 80 },
    color: '#4A0E4E',
  },
  
  // 台灣產區
  {
    id: 'yilan-kavalan',
    name: '宜蘭噶瑪蘭',
    country: '台灣',
    description: '台灣威士忌的代表產區，噶瑪蘭酒廠在此設立，利用亞熱帶氣候加速威士忌熟成，創造獨特的熱帶風味。',
    grapes: ['大麥芽'],
    position: { x: 85, y: 45 },
    color: '#FF8C00',
  },
  {
    id: 'hsinchu-fuji',
    name: '新竹富士',
    country: '台灣',
    description: '台灣葡萄酒的新興產區，結合日本釀酒技術與台灣風土條件，生產具有東方特色的葡萄酒。',
    grapes: ['黑后', '金香', '巨峰'],
    position: { x: 83, y: 42 },
    color: '#9370DB',
  },
]

interface InteractiveRegionMapProps {
  className?: string
  onRegionSelect?: (region: WineRegion) => void
}

/**
 * Phase 2 A2.2: 互動產區地圖
 * 顯示主要葡萄酒產區的互動地圖，點擊可查看詳細資訊
 */
export function InteractiveRegionMap({ className = '', onRegionSelect }: InteractiveRegionMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<WineRegion | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const handleRegionClick = (region: WineRegion) => {
    setSelectedRegion(region)
    onRegionSelect?.(region)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1a] border border-white/10">
        {/* World Map SVG Background */}
        <svg 
          viewBox="0 0 100 60" 
          className="absolute inset-0 w-full h-full opacity-20"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Simplified continent outlines */}
          <path 
            d="M5 20 Q15 15, 25 20 T35 25 Q45 20, 55 15 L60 20 Q65 25, 70 20 L80 25 Q85 30, 90 28 L95 35 Q90 40, 85 38 L75 45 Q70 50, 60 48 L50 55 Q40 52, 30 55 L20 50 Q10 45, 5 40 Z"
            fill="currentColor"
            className="text-white/10"
          />
        </svg>

        {/* Region Markers */}
        {WINE_REGIONS.map((region) => (
          <motion.button
            key={region.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${region.position.x}%`, top: `${region.position.y}%` }}
            onClick={() => handleRegionClick(region)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: region.color }}
              animate={{
                scale: hoveredRegion === region.id ? [1, 1.5, 1] : 1,
                opacity: hoveredRegion === region.id ? [0.5, 0, 0.5] : 0.3,
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            {/* Marker */}
            <div 
              className="relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200"
              style={{ backgroundColor: region.color }}
            >
              <MapPin className="absolute -top-5 left-1/2 -translate-x-1/2 w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Label */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="px-2 py-1 rounded-lg bg-white/90 text-dark-900 text-xs font-medium shadow-lg">
                {region.name}
              </span>
            </div>
          </motion.button>
        ))}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm">
          <Wine className="w-4 h-4 text-primary-400" />
          <span className="text-white/70 text-xs">點擊產區了解更多</span>
        </div>
      </div>

      {/* Region Info Panel */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedRegion.color + '40' }}
                >
                  <Wine className="w-5 h-5" style={{ color: selectedRegion.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedRegion.name}</h3>
                  <p className="text-white/60 text-sm">{selectedRegion.country}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              {selectedRegion.description}
            </p>
            
            <div className="mt-3">
              <p className="text-white/50 text-xs mb-2">主要品種</p>
              <div className="flex flex-wrap gap-2">
                {selectedRegion.grapes.map((grape) => (
                  <span 
                    key={grape} 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: selectedRegion.color + '20',
                      color: selectedRegion.color,
                    }}
                  >
                    {grape}
                  </span>
                ))}
              </div>
            </div>
            
            {selectedRegion.courseId && (
              <Link
                href={`/learn/${selectedRegion.courseId}`}
                className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 transition-colors group"
              >
                <span className="text-primary-300 text-sm font-medium">深入了解 {selectedRegion.name}</span>
                <ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
