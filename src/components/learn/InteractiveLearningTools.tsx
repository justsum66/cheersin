'use client'

import { m } from 'framer-motion'
import { WineGlossary } from './WineGlossary'
import { WineExamples } from './WineExamples'
import { InteractiveRegionMap } from './InteractiveRegionMap'
import { WineRecommendationDatabase } from './WineRecommendationDatabase'
import { SeasonalWineGuide } from './SeasonalWineGuide'
import { WhiskyGlossary } from './WhiskyGlossary'
import { InteractiveWhiskyMap } from './InteractiveWhiskyMap'
import { WhiskyRecommendationDatabase } from './WhiskyRecommendationDatabase'
import { SeasonalWhiskyGuide } from './SeasonalWhiskyGuide'
import { WhiskyExamples } from './WhiskyExamples'
import { BeerCiderGlossary } from './BeerCiderGlossary'
import { InteractiveBeerCiderMap } from './InteractiveBeerCiderMap'
import { BeerCiderRecommendationDatabase } from './BeerCiderRecommendationDatabase'
import { SeasonalBeerCiderGuide } from './SeasonalBeerCiderGuide'
import { BeerCiderExamples } from './BeerCiderExamples'
import { CocktailGlossary } from './CocktailGlossary'
import { CocktailExamples } from './CocktailExamples'
import { InteractiveCocktailMap } from './InteractiveCocktailMap'
import { CocktailRecommendationDatabase } from './CocktailRecommendationDatabase'
import { SeasonalCocktailGuide } from './SeasonalCocktailGuide'

interface InteractiveLearningToolsProps {
  courseId: string
}

export function InteractiveLearningTools({ courseId }: InteractiveLearningToolsProps) {
  if (courseId === 'wine-basics') {
    return (
      <div className="mt-8 space-y-8">
        {/* 互動式世界葡萄酒產區地圖 */}
        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🌐 世界葡萄酒產區探索</h3>
            <p className="text-white/60 max-w-2xl mx-auto">
              探索全球主要葡萄酒產區的獨特風土條件與釀酒傳統
            </p>
          </div>
          <InteractiveRegionMap />
        </m.section>

        {/* 葡萄酒專業術語詞典 */}
        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">📚 葡萄酒專業術語</h3>
            <p className="text-white/60 max-w-2xl mx-auto">學習葡萄酒專業術語，提升品酒專業度</p>
          </div>
          <WineGlossary />
        </m.section>

        {/* 季節性內容與推薦酒款 */}
        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性酒款推薦</h3>
            <p className="text-white/60 max-w-2xl mx-auto">根據不同季節與場合，為您推薦最適合的葡萄酒</p>
          </div>
          <SeasonalWineGuide />
        </m.section>

        {/* 葡萄酒歷史演進脈絡 */}
        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">📜 葡萄酒歷史演進</h3>
            <p className="text-white/60 max-w-2xl mx-auto">從古希臘羅馬到現代，探索葡萄酒的發展歷程</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">古代起源</h4>
              <p className="text-white/70 text-sm">
                葡萄酒的歷史可追溯至公元前6000年，最早起源於高加索地區（現今喬治亞）。古埃及、希臘、羅馬文明都對葡萄酒文化有重要貢獻。
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">中世紀發展</h4>
              <p className="text-white/70 text-sm">
                修道院僧侶在中世紀扮演重要角色，他們不僅保存釀酒技術，更發展出精緻的釀酒工藝，奠定了現代葡萄酒產業基礎。
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">近代革新</h4>
              <p className="text-white/70 text-sm">
                18-19世紀的科學革命帶來釀酒技術突破，路易·巴斯德發現發酵原理，現代釀酒科學由此誕生。
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-2">現代演進</h4>
              <p className="text-white/70 text-sm">
                20世紀以來，新世界產區崛起，科技創新與傳統工藝結合，創造出多元化的葡萄酒風格。
              </p>
            </div>
          </div>
        </m.section>
      </div>
    )
  }

  if (courseId === 'whisky-101') {
    return (
      <div className="mt-8 space-y-8">
        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🥃 世界威士忌產區探索</h3>
            <p className="text-white/60 max-w-2xl mx-auto">從蘇格蘭高地到日本山崎，探索全球威士忌產區的獨特風土條件</p>
          </div>
          <InteractiveWhiskyMap />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">📚 威士忌專業術語</h3>
            <p className="text-white/60 max-w-2xl mx-auto">學習威士忌專業術語，提升品酩專業度</p>
          </div>
          <WhiskyGlossary />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🥃 威士忌實例案例</h3>
            <p className="text-white/60 max-w-2xl mx-auto">精選代表性威士忌，了解不同風格與特色</p>
          </div>
          <WhiskyExamples />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性威士忌推薦</h3>
            <p className="text-white/60 max-w-2xl mx-auto">根據不同季節與場合，為您推薦最適合的威士忌</p>
          </div>
          <SeasonalWhiskyGuide />
        </m.section>
      </div>
    )
  }

  if (courseId === 'beer-cider') {
    return (
      <div className="mt-8 space-y-8">
        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🍺 世界啤酒與蘋果酒產區探索</h3>
            <p className="text-white/60 max-w-2xl mx-auto">從德國皮爾森到美國精釀啤酒革命，探索全球啤酒與蘋果酒產區</p>
          </div>
          <InteractiveBeerCiderMap />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">📚 啤酒與蘋果酒專業術語</h3>
            <p className="text-white/60 max-w-2xl mx-auto">學習啤酒與蘋果酒專業術語，提升品飲專業度</p>
          </div>
          <BeerCiderGlossary />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🍺 啤酒與蘋果酒實例案例</h3>
            <p className="text-white/60 max-w-2xl mx-auto">精選代表性啤酒與蘋果酒，了解不同風格與特色</p>
          </div>
          <BeerCiderExamples />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性啤酒與蘋果酒推薦</h3>
            <p className="text-white/60 max-w-2xl mx-auto">根據不同季節與場合，為您推薦最適合的啤酒與蘋果酒</p>
          </div>
          <SeasonalBeerCiderGuide />
        </m.section>
      </div>
    )
  }

  if (courseId === 'cocktail-basics') {
    return (
      <div className="mt-8 space-y-8">
        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🍸 世界調酒產區探索</h3>
            <p className="text-white/60 max-w-2xl mx-auto">從美國禁酒令時期到現代雞尾酒吧，探索全球調酒文化</p>
          </div>
          <InteractiveCocktailMap />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">📚 調酒專業術語</h3>
            <p className="text-white/60 max-w-2xl mx-auto">學習調酒專業術語，提升品飲專業度</p>
          </div>
          <CocktailGlossary />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🍸 調酒實例案例</h3>
            <p className="text-white/60 max-w-2xl mx-auto">精選代表性調酒，了解不同風格與特色</p>
          </div>
          <CocktailExamples />
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/10"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性調酒推薦</h3>
            <p className="text-white/60 max-w-2xl mx-auto">根據不同季節與場合，為您推薦最適合的調酒</p>
          </div>
          <SeasonalCocktailGuide />
        </m.section>
      </div>
    )
  }

  return null
}
