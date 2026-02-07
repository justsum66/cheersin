/**
 * 155 課程評分資料源
 * 單一來源：可替換為 API / Supabase 查詢，頁面僅依此顯示評分
 */
export type CourseRatingMap = Record<string, number>

/** 課程 ID → 評分（1–5）。目前為靜態資料，日後可改為從 API 或 DB 取得 */
const RATINGS: CourseRatingMap = {
  'wine-basics': 4.8,
  'white-wine': 4.7,
  'whisky-101': 4.6,
  'sake-intro': 4.7,
  'craft-beer': 4.5,
  'cocktail-basics': 4.6,
  'champagne-sparkling': 4.6,
  'rum-basics': 4.5,
  'gin-basics': 4.6,
  'tequila-mezcal': 4.5,
  'wine-advanced': 4.8,
  'brandy-cognac': 4.6,
  'cocktail-classics': 4.7,
  'wine-pairing': 4.7,
  'sake-advanced': 4.6,
  'whisky-single-malt': 4.8,
  'natural-wine': 4.5,
  'low-abv': 4.4,
  'tasting-notes': 4.7,
  'home-bar': 4.6,
  'wset-l1-spirits': 4.5,
  'wset-l2-wines': 4.7,
  'wset-l3-viticulture': 4.7,
  'wset-l3-tasting': 4.8,
  'wset-d1-production': 4.8,
  'wset-d2-business': 4.6,
  'wset-d3-world': 4.9,
  'fortified-wines': 4.7,
  'cms-intro-somm': 4.7,
  'cms-deductive-tasting': 4.8,
  'cms-service': 4.6,
  'cms-advanced-regions': 4.8,
  'mw-viticulture': 4.9,
  'mw-vinification': 4.9,
  'mw-business': 4.7,
  'organic-biodynamic': 4.6,
  'wine-law-regions': 4.6,
  'dessert-wines': 4.7,
  'beer-cider': 4.5,
  'somm-exam-prep': 4.8,
  'wset-d4-sparkling-pro': 4.7,
  'quick-wine-5min': 4.8,
  'quick-cocktail-5min': 4.7,
  'dating-wine-select': 4.8,
  'quick-whisky-5min': 4.7,
  'party-wine-select': 4.8,
  'home-sipping': 4.7,
  'wine-label-read': 4.8,
  'supermarket-wine': 4.7,
  'beginner-faq': 4.8,
  'bordeaux-deep': 4.9,
  'burgundy-deep': 4.9,
  'italy-deep': 4.8,
  'new-world-deep': 4.8,
  'blind-tasting-advanced': 4.9,
  'viral-trends-2025': 4.8,
}

/**
 * 取得所有課程評分（同步）。日後可改為 async 從 /api/learn/course-ratings 取得
 */
export function getCourseRatings(): CourseRatingMap {
  return { ...RATINGS }
}

/**
 * 取得單一課程評分；無則回傳 undefined
 */
export function getCourseRating(courseId: string): number | undefined {
  return RATINGS[courseId]
}
