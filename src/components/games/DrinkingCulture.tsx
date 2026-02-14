'use client'

import { useState } from 'react'
import { Globe, Wine } from 'lucide-react'
import GameRules from './GameRules'

/** R2-140：各國喝酒文化 — 靜態/輕互動，點選國家顯示簡短介紹 */
const CULTURES: { country: string; text: string }[] = [
  { country: '台灣', text: '台灣酒桌文化重視乾杯與敬酒順序，常以「打通關」輪流敬酒；啤酒、高粱、紹興常見，敬長輩或上司時杯緣要低於對方。' },
  { country: '日本', text: '日本飲酒禮儀：為他人斟酒（酌り合い），自己的杯不自己倒；乾杯說「乾杯」但通常只喝一口；居酒屋下班小酌是常見社交。' },
  { country: '韓國', text: '韓國喝酒要側身、雙手接杯；敬長輩時需轉身飲盡；燒酒常配烤肉，與同事或長輩共飲是建立關係的重要場合。' },
  { country: '德國', text: '德國啤酒文化深厚，啤酒節（Oktoberfest）聞名；碰杯時要目視對方；不同地區有不同啤酒風格（如科隆的 Kölsch）。' },
  { country: '法國', text: '法國餐酒搭配講究，葡萄酒佐餐是日常；敬酒說「À votre santé」；午餐也可小酌，但不過量。' },
  { country: '中國', text: '中國酒桌文化各地不同：北方豪飲、南方細品；敬酒時常說「乾杯」或「隨意」；商務宴請中敬酒順序與輩分很重要。' },
]

export default function DrinkingCulture() {
  const [selected, setSelected] = useState<number | null>(null)
  const item = selected != null ? CULTURES[selected] : null
  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="各國喝酒文化">
      <GameRules rules="點選國家看看當地的喝酒文化小知識。" rulesKey="drinking-culture.rules" />
      <Globe className="w-12 h-12 text-primary-400 mb-4" />
      <p className="text-white/60 text-sm mb-4">各國喝酒文化</p>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {CULTURES.map((c, i) => (
          <button
            key={c.country}
            type="button"
            onClick={() => setSelected(i)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium games-focus-ring ${selected === i ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
          >
            {c.country}
          </button>
        ))}
      </div>
      {item && (
        <div className="max-w-md w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
          <p className="flex items-center gap-2 text-primary-400 font-semibold mb-2">
            <Wine className="w-4 h-4" />
            {item.country}
          </p>
          <p className="text-white/80 text-sm leading-relaxed">{item.text}</p>
        </div>
      )}
    </div>
  )
}
