/**
 * R2-371：品酒學院三級課程體系（入門 → 進階 → 專家）
 * 單一來源：與 getCourseIds()、learn 頁 COURSES 對齊；供 LearningRoadmap、解鎖邏輯使用。
 */

export type CourseLevel = 'beginner' | 'intermediate' | 'expert'

/** 三級課程體系標籤 */
export const COURSE_LEVELS: readonly CourseLevel[] = ['beginner', 'intermediate', 'expert'] as const

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: '入門',
  intermediate: '進階',
  expert: '專家',
}

/** 課程 id → 等級；與 learn 頁 COURSES 一致，覆蓋 getCourseIds() 全部 */
export const COURSE_LEVEL_MAP: Record<string, CourseLevel> = {
  'wine-basics': 'beginner',
  'white-wine': 'beginner',
  'whisky-101': 'beginner',
  'sake-intro': 'intermediate',
  'craft-beer': 'intermediate',
  'cocktail-basics': 'intermediate',
  'champagne-sparkling': 'beginner',
  'rum-basics': 'beginner',
  'gin-basics': 'beginner',
  'tequila-mezcal': 'beginner',
  'wine-advanced': 'intermediate',
  'brandy-cognac': 'intermediate',
  'cocktail-classics': 'intermediate',
  'wine-pairing': 'intermediate',
  'sake-advanced': 'intermediate',
  'whisky-single-malt': 'intermediate',
  'natural-wine': 'intermediate',
  'low-abv': 'beginner',
  'tasting-notes': 'intermediate',
  'home-bar': 'beginner',
  'wset-l1-spirits': 'beginner',
  'wset-l2-wines': 'intermediate',
  'wset-l3-viticulture': 'intermediate',
  'wset-l3-tasting': 'intermediate',
  'wset-d1-production': 'expert',
  'wset-d2-business': 'expert',
  'wset-d3-world': 'expert',
  'fortified-wines': 'intermediate',
  'cms-intro-somm': 'intermediate',
  'cms-deductive-tasting': 'intermediate',
  'cms-service': 'intermediate',
  'cms-advanced-regions': 'expert',
  'organic-biodynamic': 'intermediate',
  'dessert-wines': 'intermediate',
  'beer-cider': 'intermediate',
  'somm-exam-prep': 'expert',
  'sake-shochu-intro': 'intermediate',
  'hk-sg-cocktail-etiquette': 'intermediate',
  'quick-wine-5min': 'beginner',
  'quick-cocktail-5min': 'beginner',
  'dating-wine-select': 'beginner',
  'quick-whisky-5min': 'beginner',
  'party-wine-select': 'beginner',
  'home-sipping': 'beginner',
  'wine-label-read': 'beginner',
  'supermarket-wine': 'beginner',
  'beginner-faq': 'beginner',
  'bordeaux-deep': 'expert',
  'burgundy-deep': 'expert',
  'italy-deep': 'expert',
  'new-world-deep': 'expert',
  'blind-tasting-advanced': 'expert',
  'viral-trends-2025': 'beginner',
  'wine-law-regions': 'intermediate',
  'mw-viticulture': 'expert',
  'mw-vinification': 'expert',
  'mw-business': 'expert',
  'wset-d4-sparkling-pro': 'expert',
}

/** 課程 id → 建議先修課程 id 陣列（完成後解鎖） */
export const COURSE_PREREQUISITES: Record<string, string[]> = {
  'white-wine': ['wine-basics'],
  'wine-advanced': ['wine-basics', 'white-wine'],
  'wset-l2-wines': ['wine-basics'],
  'wset-l3-viticulture': ['wine-basics'],
  'wset-l3-tasting': ['wine-advanced'],
  'cms-intro-somm': ['wine-basics'],
  'cms-deductive-tasting': ['wine-advanced'],
  'cms-service': ['wine-basics'],
  'cms-advanced-regions': ['cms-intro-somm'],
  'wset-d1-production': ['wset-l3-viticulture'],
  'wset-d2-business': ['wine-advanced'],
  'wset-d3-world': ['wine-advanced'],
  'mw-viticulture': ['wset-l3-viticulture'],
  'mw-vinification': ['wine-advanced'],
  'mw-business': ['wine-advanced'],
  'fortified-wines': ['wine-basics'],
  'organic-biodynamic': ['wine-basics'],
  'wine-law-regions': ['wine-advanced'],
  'dessert-wines': ['wine-basics'],
  'sake-advanced': ['sake-intro'],
  'whisky-single-malt': ['whisky-101'],
  'cocktail-classics': ['cocktail-basics'],
  'wine-pairing': ['wine-advanced'],
  'somm-exam-prep': ['wine-advanced'],
  'wset-d4-sparkling-pro': ['champagne-sparkling'],
  'bordeaux-deep': ['wine-advanced'],
  'burgundy-deep': ['wine-advanced'],
  'italy-deep': ['wine-advanced'],
  'new-world-deep': ['wine-advanced'],
  'blind-tasting-advanced': ['cms-deductive-tasting'],
}

/** Phase 2 B2.1: 智慧推薦下一堂課程 - 課程關聯地圖 */
export const NEXT_COURSE_MAP: Record<string, { id: string; title: string; reason: string }[]> = {
  'wine-basics': [
    { id: 'white-wine', title: '白酒探索', reason: '深入認識白酒的品種與產區' },
    { id: 'wine-advanced', title: '葡萄酒進階', reason: '延伸學習，提升專業知識' },
    { id: 'tasting-notes', title: '品飲筆記與盲飲', reason: '實際應用品酒技巧' },
  ],
  'white-wine': [
    { id: 'champagne-sparkling', title: '氣泡酒與香檳', reason: '探索另一類白酒' },
    { id: 'wine-pairing', title: '餐酒搭配進階', reason: '學會將白酒與食物搭配' },
  ],
  'whisky-101': [
    { id: 'whisky-single-malt', title: '單一麥芽威士忌', reason: '深入探索威士忌世界' },
    { id: 'brandy-cognac', title: '白蘭地與干邑', reason: '認識另一類烈酒' },
  ],
  'sake-intro': [
    { id: 'sake-advanced', title: '清酒進階', reason: '深入學習清酒釀造與品飲' },
  ],
  'cocktail-basics': [
    { id: 'cocktail-classics', title: '經典調酒實作', reason: '學會更多經典配方' },
    { id: 'home-bar', title: '居家酒吧入門', reason: '在家打造調酒空間' },
  ],
  'wine-advanced': [
    { id: 'wset-l2-wines', title: 'WSET L2 葡萄酒產區', reason: '獲取国際認證' },
    { id: 'bordeaux-deep', title: '產區深度：波爾多', reason: '探索頂級產區' },
  ],
  // 默認推薦（無專屬映射時）
  '_default': [
    { id: 'wine-basics', title: '葡萄酒入門', reason: '基礎課程，適合所有人' },
    { id: 'cocktail-basics', title: '調酒基礎', reason: '學習調酒技巧' },
  ],
}

export function getCourseLevel(courseId: string): CourseLevel {
  return COURSE_LEVEL_MAP[courseId] ?? 'beginner'

}

export function getPrerequisites(courseId: string): string[] {
  return COURSE_PREREQUISITES[courseId] ?? []
}

/** 學習路徑節點：供 LearningRoadmap 節點圖使用（入門→進階→專家，含前置關係） */
export interface CurriculumNode {
  id: string
  title: string
  shortTitle: string
  level: CourseLevel
  category: 'wine' | 'spirits' | 'cocktail' | 'beer' | 'certification' | 'other'
  prerequisites: string[]
  duration: string
}

/** 節點標題與簡稱（與 COURSE_META 對齊，不足處用 id） */
const NODE_TITLES: Record<string, { title: string; shortTitle: string; duration: string; category: CurriculumNode['category'] }> = {
  'wine-basics': { title: '葡萄酒入門', shortTitle: '葡酒入門', duration: '45分', category: 'wine' },
  'white-wine': { title: '白酒探索', shortTitle: '白酒探索', duration: '35分', category: 'wine' },
  'whisky-101': { title: '威士忌基礎', shortTitle: '威士忌入門', duration: '35分', category: 'spirits' },
  'sake-intro': { title: '清酒之道', shortTitle: '清酒入門', duration: '30分', category: 'spirits' },
  'craft-beer': { title: '精釀啤酒探索', shortTitle: '精釀啤酒', duration: '30分', category: 'beer' },
  'cocktail-basics': { title: '調酒基礎', shortTitle: '調酒基礎', duration: '35分', category: 'cocktail' },
  'champagne-sparkling': { title: '氣泡酒與香檳', shortTitle: '氣泡酒', duration: '30分', category: 'wine' },
  'rum-basics': { title: '蘭姆酒入門', shortTitle: '蘭姆酒', duration: '30分', category: 'spirits' },
  'gin-basics': { title: '琴酒入門', shortTitle: '琴酒', duration: '30分', category: 'spirits' },
  'tequila-mezcal': { title: '龍舌蘭與梅茲卡爾', shortTitle: '龍舌蘭', duration: '30分', category: 'spirits' },
  'wine-advanced': { title: '葡萄酒進階', shortTitle: '葡酒進階', duration: '45分', category: 'wine' },
  'brandy-cognac': { title: '白蘭地與干邑', shortTitle: '白蘭地', duration: '35分', category: 'spirits' },
  'cocktail-classics': { title: '經典調酒實作', shortTitle: '經典調酒', duration: '45分', category: 'cocktail' },
  'wine-pairing': { title: '餐酒搭配進階', shortTitle: '餐酒搭配', duration: '40分', category: 'wine' },
  'sake-advanced': { title: '清酒進階', shortTitle: '清酒進階', duration: '35分', category: 'spirits' },
  'whisky-single-malt': { title: '單一麥芽威士忌', shortTitle: '單麥威士忌', duration: '45分', category: 'spirits' },
  'natural-wine': { title: '自然酒入門', shortTitle: '自然酒', duration: '25分', category: 'wine' },
  'low-abv': { title: '低酒精飲品', shortTitle: '低酒精', duration: '25分', category: 'other' },
  'tasting-notes': { title: '品飲筆記與盲飲', shortTitle: '盲飲技巧', duration: '40分', category: 'wine' },
  'home-bar': { title: '居家酒吧入門', shortTitle: '居家酒吧', duration: '35分', category: 'cocktail' },
  'wset-l1-spirits': { title: 'WSET L1 烈酒入門', shortTitle: 'WSET L1', duration: '35分', category: 'certification' },
  'wset-l2-wines': { title: 'WSET L2 葡萄酒產區', shortTitle: 'WSET L2', duration: '50分', category: 'certification' },
  'wset-l3-viticulture': { title: '葡萄栽培與風土', shortTitle: '栽培風土', duration: '45分', category: 'certification' },
  'wset-l3-tasting': { title: '系統化品飲分析', shortTitle: '品飲分析', duration: '40分', category: 'certification' },
  'wset-d1-production': { title: '葡萄酒生產原理', shortTitle: 'WSET D1', duration: '55分', category: 'certification' },
  'wset-d2-business': { title: '葡萄酒商業與行銷', shortTitle: 'WSET D2', duration: '40分', category: 'certification' },
  'wset-d3-world': { title: '世界葡萄酒深度', shortTitle: 'WSET D3', duration: '60分', category: 'certification' },
  'fortified-wines': { title: '加烈酒：波特與雪莉', shortTitle: '加烈酒', duration: '40分', category: 'wine' },
  'cms-intro-somm': { title: 'CMS 入門侍酒師', shortTitle: 'CMS 入門', duration: '40分', category: 'certification' },
  'cms-deductive-tasting': { title: 'CMS 演繹品飲法', shortTitle: '演繹品飲', duration: '40分', category: 'certification' },
  'cms-service': { title: '侍酒服務實務', shortTitle: '侍酒服務', duration: '35分', category: 'certification' },
  'cms-advanced-regions': { title: '侍酒師產區與品種', shortTitle: 'CMS 進階', duration: '50分', category: 'certification' },
  'mw-viticulture': { title: 'MW 葡萄栽培深度', shortTitle: 'MW 栽培', duration: '45分', category: 'certification' },
  'mw-vinification': { title: 'MW 釀造與裝瓶前', shortTitle: 'MW 釀造', duration: '45分', category: 'certification' },
  'mw-business': { title: 'MW 葡萄酒商業', shortTitle: 'MW 商業', duration: '40分', category: 'certification' },
  'organic-biodynamic': { title: '有機與生物動力法', shortTitle: '有機生物動力', duration: '30分', category: 'wine' },
  'wine-law-regions': { title: '葡萄酒法規與產區', shortTitle: '法規產區', duration: '40分', category: 'wine' },
  'dessert-wines': { title: '甜酒與貴腐', shortTitle: '甜酒', duration: '35分', category: 'wine' },
  'beer-cider': { title: '啤酒與 Cider 進階', shortTitle: '啤酒 Cider', duration: '40分', category: 'beer' },
  'somm-exam-prep': { title: '認證考試準備總覽', shortTitle: '考試準備', duration: '40分', category: 'certification' },
  'wset-d4-sparkling-pro': { title: '氣泡酒專業', shortTitle: 'WSET D4', duration: '40分', category: 'certification' },
  'sake-shochu-intro': { title: '日韓清酒與燒酎入門', shortTitle: '清酒燒酎', duration: '35分', category: 'spirits' },
  'hk-sg-cocktail-etiquette': { title: '新加坡・香港調酒與法規禮儀', shortTitle: '港新調酒', duration: '30分', category: 'cocktail' },
  'quick-wine-5min': { title: '5 分鐘快懂葡萄酒', shortTitle: '5分葡酒', duration: '5分', category: 'wine' },
  'quick-cocktail-5min': { title: '5 分鐘快懂調酒', shortTitle: '5分調酒', duration: '5分', category: 'cocktail' },
  'dating-wine-select': { title: '約會選酒速成', shortTitle: '約會選酒', duration: '10分', category: 'wine' },
  'quick-whisky-5min': { title: '5 分鐘快懂威士忌', shortTitle: '5分威士忌', duration: '5分', category: 'spirits' },
  'party-wine-select': { title: '聚餐選酒速成', shortTitle: '聚餐選酒', duration: '10分', category: 'wine' },
  'home-sipping': { title: '在家小酌入門', shortTitle: '在家小酌', duration: '15分', category: 'wine' },
  'wine-label-read': { title: '酒標一眼看懂', shortTitle: '酒標解讀', duration: '15分', category: 'wine' },
  'supermarket-wine': { title: '超市選酒不求人', shortTitle: '超市選酒', duration: '15分', category: 'wine' },
  'beginner-faq': { title: '新手常見問題 FAQ', shortTitle: '新手 FAQ', duration: '15分', category: 'other' },
  'bordeaux-deep': { title: '產區深度：波爾多', shortTitle: '波爾多', duration: '45分', category: 'wine' },
  'burgundy-deep': { title: '產區深度：勃根地', shortTitle: '勃根地', duration: '45分', category: 'wine' },
  'italy-deep': { title: '產區深度：義大利', shortTitle: '義大利', duration: '45分', category: 'wine' },
  'new-world-deep': { title: '產區深度：新世界', shortTitle: '新世界', duration: '45分', category: 'wine' },
  'blind-tasting-advanced': { title: '盲品實戰進階', shortTitle: '盲品進階', duration: '50分', category: 'wine' },
  'viral-trends-2025': { title: '2025-2026 酒類趨勢', shortTitle: '酒類趨勢', duration: '25分', category: 'other' },
}

/** 學習路徑圖顯示的課程 id（入門→進階→專家主路徑 + 常用）；與 getCourseIds 對齊 */
export const ROADMAP_COURSE_IDS: string[] = [
  'wine-basics', 'whisky-101', 'cocktail-basics', 'sake-intro',
  'white-wine', 'whisky-single-malt', 'cocktail-classics',
  'wine-advanced', 'tasting-notes', 'wine-pairing',
  'wset-l2-wines', 'wset-l3-viticulture', 'wset-l3-tasting',
  'cms-intro-somm', 'cms-deductive-tasting', 'cms-service', 'cms-advanced-regions',
  'wset-d1-production', 'wset-d2-business', 'wset-d3-world',
  'blind-tasting-advanced', 'somm-exam-prep',
]

/** 學習路徑節點列表（供 LearningRoadmap 使用）；可依 courseIds 篩選 */
export function getCurriculumNodes(courseIds: string[] = ROADMAP_COURSE_IDS): CurriculumNode[] {
  return courseIds.map((id) => {
    const level = getCourseLevel(id)
    const prereqs = getPrerequisites(id)
    const meta = NODE_TITLES[id]
    const title = meta?.title ?? id
    const shortTitle = meta?.shortTitle ?? id
    const duration = meta?.duration ?? '—'
    const category = meta?.category ?? 'other'
    return { id, title, shortTitle, level, category, prerequisites: prereqs, duration }
  })
}
