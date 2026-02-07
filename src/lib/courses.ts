/**
 * 152 課程資料：從 data/courses 讀取，供 learn/[courseId] 使用
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'

/** 158 章節內穿插測驗：單選題 */
export interface ChapterQuizItem {
  question: string
  options: string[]
  correctIndex: number
}

export interface Chapter {
  id: number
  title: string
  duration: string
  content: string
  /** 158 互動式測驗（可選） */
  quiz?: ChapterQuizItem[]
}

export interface CourseData {
  id: string
  title: string
  description: string
  duration: string
  free: boolean
  chapters: Chapter[]
}

const COURSE_IDS = ['wine-basics', 'wine-101', 'whisky-101', 'sake-intro', 'craft-beer'] as const
export type CourseId = (typeof COURSE_IDS)[number]

/** URL courseId 對應檔名（wine-basics → wine-101.json） */
const COURSE_FILE_MAP: Record<string, string> = {
  'wine-basics': 'wine-101',
}

function getDataPath(): string {
  return path.join(process.cwd(), 'data', 'courses')
}

export function getCourseIds(): string[] {
  return [
    'wine-basics', 'white-wine', 'whisky-101', 'sake-intro', 'craft-beer', 'cocktail-basics',
    'champagne-sparkling', 'rum-basics', 'gin-basics', 'tequila-mezcal',
    'wine-advanced', 'brandy-cognac', 'cocktail-classics', 'wine-pairing', 'sake-advanced',
    'whisky-single-malt', 'natural-wine', 'low-abv', 'tasting-notes', 'home-bar',
    'wset-l1-spirits', 'wset-l2-wines', 'wset-l3-viticulture', 'wset-l3-tasting',
    'wset-d1-production', 'wset-d2-business', 'wset-d3-world', 'fortified-wines',
    'cms-intro-somm', 'cms-deductive-tasting', 'cms-service', 'cms-advanced-regions',
    'mw-viticulture', 'mw-vinification', 'mw-business', 'organic-biodynamic',
    'wine-law-regions', 'dessert-wines', 'beer-cider',     'somm-exam-prep',
    'wset-d4-sparkling-pro',
    'quick-wine-5min',
    'quick-cocktail-5min',
    'dating-wine-select',
    'quick-whisky-5min',
    'party-wine-select',
    'home-sipping',
    'wine-label-read',
    'supermarket-wine',
    'beginner-faq',
    'bordeaux-deep',
    'burgundy-deep',
    'italy-deep',
    'new-world-deep',
    'blind-tasting-advanced',
    'viral-trends-2025',
  ]
}

export function getCourse(courseId: string): CourseData | null {
  const base = getDataPath()
  const fileName = COURSE_FILE_MAP[courseId] ?? courseId
  const filePath = path.join(base, `${fileName}.json`)
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf8')
    return JSON.parse(raw) as CourseData
  } catch {
    return null
  }
}

/** 課程列表（與 learn 頁面一致，含 Pro 鎖定） */
export const COURSE_META: Record<string, { title: string; free: boolean }> = {
  'wine-basics': { title: '葡萄酒入門', free: true },
  'wine-101': { title: '葡萄酒入門', free: true },
  'white-wine': { title: '白酒探索', free: true },
  'whisky-101': { title: '威士忌基礎', free: true },
  'sake-intro': { title: '清酒之道', free: false },
  'craft-beer': { title: '精釀啤酒探索', free: false },
  'cocktail-basics': { title: '調酒基礎', free: false },
  'champagne-sparkling': { title: '氣泡酒與香檳', free: true },
  'rum-basics': { title: '蘭姆酒入門', free: true },
  'gin-basics': { title: '琴酒入門', free: true },
  'tequila-mezcal': { title: '龍舌蘭與梅茲卡爾', free: true },
  'wine-advanced': { title: '葡萄酒進階', free: false },
  'brandy-cognac': { title: '白蘭地與干邑', free: false },
  'cocktail-classics': { title: '經典調酒實作', free: false },
  'wine-pairing': { title: '餐酒搭配進階', free: false },
  'sake-advanced': { title: '清酒進階', free: false },
  'whisky-single-malt': { title: '單一麥芽威士忌', free: false },
  'natural-wine': { title: '自然酒入門', free: false },
  'low-abv': { title: '低酒精飲品', free: true },
  'tasting-notes': { title: '品飲筆記與盲飲', free: false },
  'home-bar': { title: '居家酒吧入門', free: true },
  'wset-l1-spirits': { title: 'WSET L1 烈酒入門', free: true },
  'wset-l2-wines': { title: 'WSET L2 葡萄酒產區', free: false },
  'wset-l3-viticulture': { title: '葡萄栽培與風土', free: false },
  'wset-l3-tasting': { title: '系統化品飲分析', free: false },
  'wset-d1-production': { title: '葡萄酒生產原理', free: false },
  'wset-d2-business': { title: '葡萄酒商業與行銷', free: false },
  'wset-d3-world': { title: '世界葡萄酒深度', free: false },
  'fortified-wines': { title: '加烈酒：波特與雪莉', free: false },
  'cms-intro-somm': { title: 'CMS 入門侍酒師', free: false },
  'cms-deductive-tasting': { title: 'CMS 演繹品飲法', free: false },
  'cms-service': { title: '侍酒服務實務', free: false },
  'cms-advanced-regions': { title: '侍酒師產區與品種', free: false },
  'mw-viticulture': { title: 'MW 葡萄栽培深度', free: false },
  'mw-vinification': { title: 'MW 釀造與裝瓶前', free: false },
  'mw-business': { title: 'MW 葡萄酒商業', free: false },
  'organic-biodynamic': { title: '有機與生物動力法', free: false },
  'wine-law-regions': { title: '葡萄酒法規與產區', free: false },
  'dessert-wines': { title: '甜酒與貴腐', free: false },
  'beer-cider': { title: '啤酒與 Cider 進階', free: false },
  'somm-exam-prep': { title: '認證考試準備總覽', free: false },
  'wset-d4-sparkling-pro': { title: '氣泡酒專業', free: false },
  'quick-wine-5min': { title: '5 分鐘快懂葡萄酒', free: true },
  'quick-cocktail-5min': { title: '5 分鐘快懂調酒', free: true },
  'dating-wine-select': { title: '約會選酒速成', free: true },
  'quick-whisky-5min': { title: '5 分鐘快懂威士忌', free: true },
  'party-wine-select': { title: '聚餐選酒速成', free: true },
  'home-sipping': { title: '在家小酌入門', free: true },
  'wine-label-read': { title: '酒標一眼看懂', free: true },
  'supermarket-wine': { title: '超市選酒不求人', free: true },
  'beginner-faq': { title: '新手常見問題 FAQ', free: true },
  'bordeaux-deep': { title: '產區深度：波爾多', free: false },
  'burgundy-deep': { title: '產區深度：勃根地', free: false },
  'italy-deep': { title: '產區深度：義大利', free: false },
  'new-world-deep': { title: '產區深度：新世界', free: false },
  'blind-tasting-advanced': { title: '盲品實戰進階', free: false },
  'viral-trends-2025': { title: '2025-2026 酒類趨勢', free: true },
}
