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
  {
    id: 'bordeaux',
    name: '波爾多',
    country: '法國',
    description: '世界最知名的紅酒產區，以 Cabernet Sauvignon 和 Merlot 混釀聞名。分為左岸（梅多克）和右岸（聖愛美濃）。',
    grapes: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'],
    courseId: 'bordeaux-deep',
    position: { x: 28, y: 35 },
    color: '#8B0000',
  },
  {
    id: 'burgundy',
    name: '勃根地',
    country: '法國',
    description: '以單一品種聞名：紅酒用 Pinot Noir，白酒用 Chardonnay。風土（Terroir）概念的發源地。',
    grapes: ['Pinot Noir', 'Chardonnay'],
    courseId: 'burgundy-deep',
    position: { x: 33, y: 30 },
    color: '#722F37',
  },
  {
    id: 'champagne',
    name: '香檳區',
    country: '法國',
    description: '氣泡酒的故鄉，只有此區生產的氣泡酒才能稱為「香檳」。採用傳統瓶中二次發酵法。',
    grapes: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier'],
    courseId: 'champagne-sparkling',
    position: { x: 32, y: 25 },
    color: '#F5E6C4',
  },
  {
    id: 'tuscany',
    name: '托斯卡尼',
    country: '義大利',
    description: '義大利最重要的葡萄酒產區之一，以 Sangiovese 為主，生產 Chianti、Brunello di Montalcino。',
    grapes: ['Sangiovese', 'Cabernet Sauvignon'],
    courseId: 'italy-deep',
    position: { x: 38, y: 38 },
    color: '#A52A2A',
  },
  {
    id: 'napa',
    name: '納帕谷',
    country: '美國',
    description: '加州最著名的葡萄酒產區，以高品質 Cabernet Sauvignon 聞名，世界頂級酒莊雲集。',
    grapes: ['Cabernet Sauvignon', 'Chardonnay', 'Merlot'],
    courseId: 'new-world-deep',
    position: { x: 12, y: 33 },
    color: '#800020',
  },
  {
    id: 'mendoza',
    name: '門多薩',
    country: '阿根廷',
    description: '阿根廷最重要的葡萄酒產區，高海拔種植，以 Malbec 紅酒聞名全球。',
    grapes: ['Malbec', 'Cabernet Sauvignon'],
    courseId: 'new-world-deep',
    position: { x: 22, y: 72 },
    color: '#4A0E4E',
  },
  {
    id: 'rioja',
    name: '里奧哈',
    country: '西班牙',
    description: '西班牙最知名的葡萄酒產區，以 Tempranillo 為主要品種，橡木桶陳年風格獨特。',
    grapes: ['Tempranillo', 'Garnacha'],
    position: { x: 26, y: 37 },
    color: '#B22222',
  },
  {
    id: 'mosel',
    name: '摩澤爾',
    country: '德國',
    description: '德國頂級白酒產區，以陡峭河岸葡萄園聞名，生產世界最佳的 Riesling。',
    grapes: ['Riesling'],
    position: { x: 34, y: 28 },
    color: '#FFEFD5',
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
