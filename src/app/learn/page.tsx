'use client'

import { useState, useEffect, useDeferredValue, useRef, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Wine, GlassWater, Beer, Martini, Lock, Star, BookOpen, Bookmark, Trophy, Award, Search, UserPlus, Share2, Check, Target, Clock, Flame, Play, ChevronDown, ChevronUp, LayoutGrid, List, AlertCircle, FileQuestion, Network, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { canAccessProCourse, canUseProTrial, getProTrialRemainingThisMonth, hasProBadge } from '@/lib/subscription'
import { UpgradeModal } from '@/components/UpgradeModal'
import { getBookmarks } from '@/lib/learn-bookmarks'
import { getPoints, getLeaderboard, getStreak, getLearnMinutes, getUnlockedBadges, BADGE_LABELS, getCompletedChapterToday, getWeeklyChapterCount, maybeUnlockHolidayBadge, getSommelierLevel, getFriendCompare, setFriendCompare, getLearnDailyGoal, setLearnDailyGoal, getChaptersCompletedToday, getLearnChaptersHistory } from '@/lib/gamification'
import { LEARN_COURSE_COUNT } from '@/lib/learn-constants'
import { getCourseRating } from '@/lib/learn-course-ratings'
import { getActiveLaunchAnnouncements } from '@/config/announcements.config'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { preventNumberScrollOnWheel } from '@/hooks/usePreventNumberScroll'
import { CoursePreviewModal } from '@/components/learn/CoursePreviewModal'

/** 151–155：課程進度存於 localStorage，key 為 cheersin_learn_progress */
const PROGRESS_KEY = 'cheersin_learn_progress'
/** 與 layout 共用，避免 hydration mismatch */
const TOTAL_COURSES = LEARN_COURSE_COUNT

/** 151 課程分類：入門 / 進階 / 專家 */
type CourseLevel = 'beginner' | 'intermediate' | 'expert'

const COURSES: {
  id: string
  title: string
  description: string
  icon: typeof Wine
  lessons: number
  duration: string
  estimatedMinutes: number
  color: string
  free: boolean
  previewImage: string | null
  level: CourseLevel
  /** 155 課程評分：優先從 getCourseRating(id) 取得，無則用此 fallback */
  rating?: number
  /** 19 課程標籤；15 入門必讀 */
  tags?: ('hot' | 'new' | 'essential' | 'quick')[]
  /** AUDIT #41：每門課自訂「適合誰」一句；未設則用「適合：入門者/進階者/專家者」 */
  targetAudience?: string
}[] = [
  {
    id: 'wine-basics',
    title: '葡萄酒入門',
    description: '從零開始認識葡萄酒的世界',
    icon: Wine,
    lessons: 8,
    duration: '45分鐘',
    estimatedMinutes: 45,
    color: 'from-red-500 to-purple-600',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.8,
    tags: ['hot', 'essential'],
    targetAudience: '適合：零基礎、想認識葡萄酒的人',
  },
  {
    id: 'white-wine',
    title: '白酒探索',
    description: '深入認識白酒的品種、產區與風格',
    icon: Wine,
    lessons: 6,
    duration: '35分鐘',
    estimatedMinutes: 35,
    color: 'from-amber-200 to-yellow-500',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.7,
    tags: ['new'],
  },
  {
    id: 'whisky-101',
    title: '威士忌基礎',
    description: '探索威士忌的迷人魅力',
    icon: GlassWater,
    lessons: 6,
    duration: '35分鐘',
    estimatedMinutes: 35,
    color: 'from-amber-500 to-orange-600',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.6,
    tags: ['hot', 'essential'],
    targetAudience: '適合：想快速認識威士忌的入門者',
  },
  {
    id: 'sake-intro',
    title: '清酒之道',
    description: '日本清酒的精緻文化',
    icon: Martini,
    lessons: 5,
    duration: '30分鐘',
    estimatedMinutes: 30,
    color: 'from-blue-400 to-cyan-500',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.7,
  },
  {
    id: 'craft-beer',
    title: '精釀啤酒探索',
    description: '進入精釀啤酒的多彩世界',
    icon: Beer,
    lessons: 6,
    duration: '30分鐘',
    estimatedMinutes: 30,
    color: 'from-green-500 to-emerald-600',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.5,
  },
  {
    id: 'cocktail-basics',
    title: '調酒基礎',
    description: '認識基酒、調酒技法與經典雞尾酒',
    icon: Martini,
    lessons: 6,
    duration: '35分鐘',
    estimatedMinutes: 35,
    color: 'from-orange-400 to-rose-500',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.6,
    tags: ['new'],
  },
  {
    id: 'champagne-sparkling',
    title: '氣泡酒與香檳',
    description: '慶祝時刻的選酒指南',
    icon: Wine,
    lessons: 5,
    duration: '30分鐘',
    estimatedMinutes: 30,
    color: 'from-slate-200 to-amber-100',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.6,
    tags: ['new'],
  },
  {
    id: 'rum-basics',
    title: '蘭姆酒入門',
    description: '從甘蔗到 Mojito',
    icon: Martini,
    lessons: 5,
    duration: '30分鐘',
    estimatedMinutes: 30,
    color: 'from-amber-600 to-amber-900',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.5,
    tags: ['new'],
  },
  {
    id: 'gin-basics',
    title: '琴酒入門',
    description: '杜松子風味與經典調酒',
    icon: Martini,
    lessons: 5,
    duration: '30分鐘',
    estimatedMinutes: 30,
    color: 'from-slate-400 to-green-800',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.6,
  },
  {
    id: 'tequila-mezcal',
    title: '龍舌蘭與梅茲卡爾',
    description: '產區、等級與煙燻魅力',
    icon: Martini,
    lessons: 5,
    duration: '30分鐘',
    estimatedMinutes: 30,
    color: 'from-lime-400 to-emerald-800',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.5,
  },
  {
    id: 'wine-advanced',
    title: '葡萄酒進階',
    description: '產區、風土與進階品飲',
    icon: Wine,
    lessons: 6,
    duration: '45分鐘',
    estimatedMinutes: 45,
    color: 'from-purple-600 to-red-800',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.8,
  },
  {
    id: 'brandy-cognac',
    title: '白蘭地與干邑',
    description: '葡萄蒸餾酒的經典世界',
    icon: GlassWater,
    lessons: 5,
    duration: '35分鐘',
    estimatedMinutes: 35,
    color: 'from-amber-700 to-amber-950',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.6,
  },
  {
    id: 'cocktail-classics',
    title: '經典調酒實作',
    description: '從原料到手法重現經典',
    icon: Martini,
    lessons: 6,
    duration: '45分鐘',
    estimatedMinutes: 45,
    color: 'from-rose-500 to-orange-600',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.7,
  },
  {
    id: 'wine-pairing',
    title: '餐酒搭配進階',
    description: '風味互動與進階搭配',
    icon: Wine,
    lessons: 5,
    duration: '40分鐘',
    estimatedMinutes: 40,
    color: 'from-red-400 to-rose-600',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.7,
  },
  {
    id: 'sake-advanced',
    title: '清酒進階',
    description: '精米步合、酒造與品飲',
    icon: Martini,
    lessons: 5,
    duration: '35分鐘',
    estimatedMinutes: 35,
    color: 'from-cyan-500 to-blue-700',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.6,
  },
  {
    id: 'whisky-single-malt',
    title: '單一麥芽威士忌',
    description: '產區、酒廠深度探索',
    icon: GlassWater,
    lessons: 6,
    duration: '45分鐘',
    estimatedMinutes: 45,
    color: 'from-amber-600 to-yellow-800',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.8,
  },
  {
    id: 'natural-wine',
    title: '自然酒入門',
    description: '低干預、有機與自然派',
    icon: Wine,
    lessons: 4,
    duration: '25分鐘',
    estimatedMinutes: 25,
    color: 'from-lime-600 to-green-800',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.5,
  },
  {
    id: 'low-abv',
    title: '低酒精飲品',
    description: '無醇、低酒精與 Session',
    icon: GlassWater,
    lessons: 4,
    duration: '25分鐘',
    estimatedMinutes: 25,
    color: 'from-teal-400 to-cyan-600',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.4,
    tags: ['new'],
  },
  {
    id: 'tasting-notes',
    title: '品飲筆記與盲飲',
    description: '系統化記錄與盲飲技巧',
    icon: BookOpen,
    lessons: 5,
    duration: '40分鐘',
    estimatedMinutes: 40,
    color: 'from-violet-500 to-purple-700',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.7,
  },
  {
    id: 'home-bar',
    title: '居家酒吧入門',
    description: '從零開始打造家庭酒吧',
    icon: Martini,
    lessons: 5,
    duration: '35分鐘',
    estimatedMinutes: 35,
    color: 'from-amber-500 to-orange-700',
    free: true,
    previewImage: null,
    level: 'beginner',
    rating: 4.6,
    tags: ['new'],
  },
  { id: 'wset-l1-spirits', title: 'WSET L1 烈酒入門', description: '對應 WSET L1，主要烈酒類型與品飲', icon: GlassWater, lessons: 5, duration: '35分鐘', estimatedMinutes: 35, color: 'from-slate-500 to-slate-800', free: true, previewImage: null, level: 'beginner', rating: 4.5, tags: ['new'] },
  { id: 'wset-l2-wines', title: 'WSET L2 葡萄酒產區', description: '主要產區、品種與風格', icon: Wine, lessons: 6, duration: '50分鐘', estimatedMinutes: 50, color: 'from-rose-600 to-red-900', free: false, previewImage: null, level: 'intermediate', rating: 4.7 },
  { id: 'wset-l3-viticulture', title: '葡萄栽培與風土', description: 'WSET L3/MW 種植、氣候、土壤', icon: Wine, lessons: 5, duration: '45分鐘', estimatedMinutes: 45, color: 'from-green-700 to-emerald-900', free: false, previewImage: null, level: 'intermediate', rating: 4.7 },
  { id: 'wset-l3-tasting', title: '系統化品飲分析', description: 'WSET L3/CMS 結構化品飲與盲品', icon: BookOpen, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-indigo-500 to-purple-800', free: false, previewImage: null, level: 'intermediate', rating: 4.8 },
  { id: 'wset-d1-production', title: '葡萄酒生產原理', description: 'WSET D1 栽培與釀造', icon: Wine, lessons: 6, duration: '55分鐘', estimatedMinutes: 55, color: 'from-amber-800 to-rose-900', free: false, previewImage: null, level: 'expert', rating: 4.8 },
  { id: 'wset-d2-business', title: '葡萄酒商業與行銷', description: 'WSET D2 產業、通路、定價', icon: BookOpen, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-blue-700 to-slate-800', free: false, previewImage: null, level: 'expert', rating: 4.6 },
  { id: 'wset-d3-world', title: '世界葡萄酒深度', description: 'WSET D3 全球產區與品飲', icon: Wine, lessons: 6, duration: '60分鐘', estimatedMinutes: 60, color: 'from-purple-700 to-red-900', free: false, previewImage: null, level: 'expert', rating: 4.9 },
  { id: 'fortified-wines', title: '加烈酒：波特與雪莉', description: 'WSET D5 波特、雪莉、馬德拉', icon: Wine, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-amber-900 to-red-950', free: false, previewImage: null, level: 'intermediate', rating: 4.7 },
  { id: 'cms-intro-somm', title: 'CMS 入門侍酒師', description: 'Court of Master Sommeliers 入門', icon: Wine, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-amber-600 to-amber-900', free: false, previewImage: null, level: 'intermediate', rating: 4.7 },
  { id: 'cms-deductive-tasting', title: 'CMS 演繹品飲法', description: 'Deductive tasting 結構與技巧', icon: BookOpen, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-teal-600 to-cyan-800', free: false, previewImage: null, level: 'intermediate', rating: 4.8 },
  { id: 'cms-service', title: '侍酒服務實務', description: '開瓶、斟酒、decanting', icon: Martini, lessons: 5, duration: '35分鐘', estimatedMinutes: 35, color: 'from-slate-600 to-amber-800', free: false, previewImage: null, level: 'intermediate', rating: 4.6 },
  { id: 'cms-advanced-regions', title: '侍酒師產區與品種', description: 'CMS Advanced 指定品種產區', icon: Wine, lessons: 6, duration: '50分鐘', estimatedMinutes: 50, color: 'from-rose-700 to-amber-900', free: false, previewImage: null, level: 'expert', rating: 4.8 },
  { id: 'mw-viticulture', title: 'MW 葡萄栽培深度', description: 'Master of Wine 栽培與當代議題', icon: Wine, lessons: 5, duration: '45分鐘', estimatedMinutes: 45, color: 'from-green-800 to-teal-900', free: false, previewImage: null, level: 'expert', rating: 4.9 },
  { id: 'mw-vinification', title: 'MW 釀造與裝瓶前', description: '釀造工藝與當代技術', icon: Wine, lessons: 5, duration: '45分鐘', estimatedMinutes: 45, color: 'from-violet-700 to-purple-900', free: false, previewImage: null, level: 'expert', rating: 4.9 },
  { id: 'mw-business', title: 'MW 葡萄酒商業', description: '產業、市場、當代議題', icon: BookOpen, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-blue-800 to-slate-900', free: false, previewImage: null, level: 'expert', rating: 4.7 },
  { id: 'organic-biodynamic', title: '有機與生物動力法', description: '有機、生物動力、自然酒', icon: Wine, lessons: 4, duration: '30分鐘', estimatedMinutes: 30, color: 'from-lime-600 to-green-800', free: false, previewImage: null, level: 'intermediate', rating: 4.6 },
  { id: 'wine-law-regions', title: '葡萄酒法規與產區', description: 'AOC、DOC、AVA 等法定產區', icon: BookOpen, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-amber-700 to-rose-800', free: false, previewImage: null, level: 'intermediate', rating: 4.6 },
  { id: 'dessert-wines', title: '甜酒與貴腐', description: '貴腐、冰酒、風乾甜酒', icon: Wine, lessons: 4, duration: '35分鐘', estimatedMinutes: 35, color: 'from-amber-300 to-yellow-600', free: false, previewImage: null, level: 'intermediate', rating: 4.7 },
  { id: 'beer-cider', title: '啤酒與 Cider 進階', description: '精釀風格、Cider 類型', icon: Beer, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-amber-500 to-yellow-700', free: false, previewImage: null, level: 'intermediate', rating: 4.5 },
  { id: 'somm-exam-prep', title: '認證考試準備總覽', description: 'WSET、CMS、MW 考試策略', icon: BookOpen, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-slate-600 to-indigo-900', free: false, previewImage: null, level: 'expert', rating: 4.8 },
  { id: 'wset-d4-sparkling-pro', title: '氣泡酒專業', description: 'WSET D4 氣泡酒生產與品飲', icon: Wine, lessons: 5, duration: '40分鐘', estimatedMinutes: 40, color: 'from-slate-200 to-amber-100', free: false, previewImage: null, level: 'expert', rating: 4.7 },
  { id: 'quick-wine-5min', title: '5 分鐘快懂葡萄酒', description: '約會、聚餐前快速補課', icon: Wine, lessons: 3, duration: '5分鐘', estimatedMinutes: 5, color: 'from-rose-400 to-red-600', free: true, previewImage: null, level: 'beginner', rating: 4.8, tags: ['quick', 'new'] },
  { id: 'quick-cocktail-5min', title: '5 分鐘快懂調酒', description: '在家調酒、吧台點酒不求人', icon: Martini, lessons: 3, duration: '5分鐘', estimatedMinutes: 5, color: 'from-amber-400 to-orange-600', free: true, previewImage: null, level: 'beginner', rating: 4.7, tags: ['quick', 'new'] },
  { id: 'dating-wine-select', title: '約會選酒速成', description: '約會、紀念日選酒不踩雷', icon: Wine, lessons: 3, duration: '10分鐘', estimatedMinutes: 10, color: 'from-pink-400 to-rose-600', free: true, previewImage: null, level: 'beginner', rating: 4.8, tags: ['quick', 'new'] },
  { id: 'quick-whisky-5min', title: '5 分鐘快懂威士忌', description: '蘇格蘭、波本、日本一次搞懂', icon: GlassWater, lessons: 3, duration: '5分鐘', estimatedMinutes: 5, color: 'from-amber-500 to-amber-800', free: true, previewImage: null, level: 'beginner', rating: 4.7, tags: ['quick', 'new'] },
  { id: 'party-wine-select', title: '聚餐選酒速成', description: '尾牙、婚宴、家聚選酒不踩雷', icon: Wine, lessons: 3, duration: '10分鐘', estimatedMinutes: 10, color: 'from-red-500 to-rose-700', free: true, previewImage: null, level: 'beginner', rating: 4.8, tags: ['quick', 'new'] },
  { id: 'home-sipping', title: '在家小酌入門', description: '一個人或兩人輕鬆喝', icon: Wine, lessons: 4, duration: '15分鐘', estimatedMinutes: 15, color: 'from-violet-400 to-purple-600', free: true, previewImage: null, level: 'beginner', rating: 4.7, tags: ['quick'] },
  { id: 'wine-label-read', title: '酒標一眼看懂', description: '產區、年份、品種一次搞懂', icon: Wine, lessons: 4, duration: '15分鐘', estimatedMinutes: 15, color: 'from-amber-400 to-orange-600', free: true, previewImage: null, level: 'beginner', rating: 4.8, tags: ['quick'] },
  { id: 'supermarket-wine', title: '超市選酒不求人', description: '全聯、家樂福、好市多選酒攻略', icon: Wine, lessons: 4, duration: '15分鐘', estimatedMinutes: 15, color: 'from-green-500 to-emerald-600', free: true, previewImage: null, level: 'beginner', rating: 4.7, tags: ['quick'] },
  { id: 'beginner-faq', title: '新手常見問題 FAQ', description: '開瓶、保存、禮儀一次解答', icon: BookOpen, lessons: 4, duration: '15分鐘', estimatedMinutes: 15, color: 'from-slate-500 to-slate-700', free: true, previewImage: null, level: 'beginner', rating: 4.8, tags: ['quick'] },
  { id: 'bordeaux-deep', title: '產區深度：波爾多', description: '左岸、右岸、五大酒莊', icon: Wine, lessons: 5, duration: '45分鐘', estimatedMinutes: 45, color: 'from-red-700 to-red-950', free: false, previewImage: null, level: 'expert', rating: 4.9 },
  { id: 'burgundy-deep', title: '產區深度：勃根地', description: '黑皮諾、夏多內與風土', icon: Wine, lessons: 5, duration: '45分鐘', estimatedMinutes: 45, color: 'from-rose-600 to-red-900', free: false, previewImage: null, level: 'expert', rating: 4.9 },
  { id: 'italy-deep', title: '產區深度：義大利', description: '皮蒙特、托斯卡尼、原生品種', icon: Wine, lessons: 5, duration: '45分鐘', estimatedMinutes: 45, color: 'from-green-600 to-emerald-800', free: false, previewImage: null, level: 'expert', rating: 4.8 },
  { id: 'new-world-deep', title: '產區深度：新世界', description: '澳洲、美國、智利、阿根廷', icon: Wine, lessons: 5, duration: '45分鐘', estimatedMinutes: 45, color: 'from-amber-600 to-orange-800', free: false, previewImage: null, level: 'expert', rating: 4.8 },
  { id: 'blind-tasting-advanced', title: '盲品實戰進階', description: 'CMS 演繹法進階、品種產區辨識', icon: Wine, lessons: 5, duration: '50分鐘', estimatedMinutes: 50, color: 'from-violet-600 to-purple-800', free: false, previewImage: null, level: 'expert', rating: 4.9 },
  { id: 'viral-trends-2025', title: '2025-2026 酒類趨勢', description: '爆紅調酒、葡萄酒趨勢、低酒精', icon: Martini, lessons: 5, duration: '25分鐘', estimatedMinutes: 25, color: 'from-fuchsia-500 to-pink-600', free: true, previewImage: null, level: 'beginner', rating: 4.8, tags: ['quick', 'new'] },
]

const WINE_BASICS_LESSONS = [
  { id: 1, title: '什麼是葡萄酒？', duration: '5分鐘', completed: false },
  { id: 2, title: '紅酒 vs 白酒 vs 粉紅酒', duration: '6分鐘', completed: false },
  { id: 3, title: '認識主要葡萄品種', duration: '8分鐘', completed: false },
  { id: 4, title: '如何看懂酒標', duration: '5分鐘', completed: false },
  { id: 5, title: '品酒的基本步驟', duration: '7分鐘', completed: false },
  { id: 6, title: '適飲溫度與醒酒', duration: '5分鐘', completed: false },
  { id: 7, title: '餐酒搭配入門', duration: '6分鐘', completed: false },
  { id: 8, title: '如何選購第一瓶酒', duration: '5分鐘', completed: false },
]

/** 讀取課程進度；18 邊界檢查；22 localStorage 格式容錯 */
type ProgressEntry = { completed: number; total: number; completedAt?: string }
function loadProgress(): Record<string, ProgressEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed !== 'object' || parsed === null) return {}
    const out: Record<string, ProgressEntry> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'completed' in v && 'total' in v) {
        const ent = v as ProgressEntry
        let completed = Math.floor(Number(ent.completed)) || 0
        let total = Math.floor(Number(ent.total)) || 0
        if (total < 1 || completed < 0) continue
        completed = Math.min(completed, total)
        out[k] = { completed, total }
        if (typeof ent.completedAt === 'string' && ent.completedAt.length >= 10) out[k].completedAt = ent.completedAt
      }
    }
    return out
  } catch {
    return {}
  }
}

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: '入門',
  intermediate: '進階',
  expert: '專家',
}

const LEVEL_TABS = ['all', 'beginner', 'intermediate', 'expert'] as const

/** 僅 client mount 後渲染，避免 hydration 54/55 或 className 不一致；suppressHydrationWarning 防擴充修改 */
function HeroSubtitle({ count }: { count: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const baseClass = 'text-white/60 max-w-md mx-auto text-sm sm:text-base leading-relaxed'
  if (!mounted) {
    return <p className={baseClass} suppressHydrationWarning>載入中…</p>
  }
  return (
    <p className={baseClass} suppressHydrationWarning>
      {count} 門課程 · 5 分鐘快懂到專家級 · WSET · CMS · MW 認證對應 · 從零開始成為品酒達人
    </p>
  )
}

/** 23 小白專用學習路徑（5–15 分鐘課程優先） */
const BEGINNER_QUICK_PATH: string[] = [
  'quick-wine-5min', 'quick-whisky-5min', 'quick-cocktail-5min', 'dating-wine-select', 'party-wine-select',
  'home-sipping', 'wine-label-read', 'supermarket-wine', 'beginner-faq',
  'viral-trends-2025',
]

/** 16 學習路徑建議順序（入門→進階→專家） */
const LEARNING_PATH: string[] = [
  ...BEGINNER_QUICK_PATH,
  'wine-basics', 'whisky-101', 'white-wine', 'champagne-sparkling', 'rum-basics', 'gin-basics', 'tequila-mezcal',
  'wset-l1-spirits', 'low-abv', 'home-bar',
  'sake-intro', 'craft-beer', 'cocktail-basics', 'wine-advanced', 'wset-l2-wines', 'fortified-wines',
  'cms-intro-somm', 'wset-l3-viticulture', 'wset-l3-tasting', 'cms-deductive-tasting', 'cms-service',
  'wine-pairing', 'brandy-cognac', 'cocktail-classics', 'dessert-wines', 'organic-biodynamic',
  'cms-advanced-regions', 'wset-d1-production', 'wset-d2-business', 'wset-d3-world', 'mw-viticulture',
  'mw-vinification', 'mw-business',   'wset-d4-sparkling-pro', 'somm-exam-prep',
  'bordeaux-deep', 'burgundy-deep', 'italy-deep', 'new-world-deep',
  'blind-tasting-advanced',
  'viral-trends-2025',
]

/** 7 進階課程前置知識 */
const PREREQ_MAP: Record<string, string> = {
  'wine-advanced': '葡萄酒入門',
  'wset-l2-wines': '葡萄酒入門',
  'wset-l3-viticulture': '葡萄酒入門',
  'wset-l3-tasting': '葡萄酒進階',
  'cms-intro-somm': '葡萄酒入門',
  'cms-deductive-tasting': '葡萄酒進階',
  'cms-service': '葡萄酒入門',
  'cms-advanced-regions': 'CMS 入門侍酒師',
  'wset-d1-production': '葡萄栽培與風土',
  'wset-d2-business': '葡萄酒進階',
  'wset-d3-world': '葡萄酒進階',
  'mw-viticulture': '葡萄栽培與風土',
  'mw-vinification': '葡萄酒進階',
  'mw-business': '葡萄酒進階',
  'fortified-wines': '葡萄酒入門',
  'organic-biodynamic': '葡萄酒入門',
  'wine-law-regions': '葡萄酒進階',
  'dessert-wines': '葡萄酒入門',
  'sake-advanced': '清酒之道',
  'whisky-single-malt': '威士忌基礎',
  'cocktail-classics': '調酒基礎',
  'wine-pairing': '葡萄酒進階',
  'somm-exam-prep': '葡萄酒進階',
  'wset-d4-sparkling-pro': '氣泡酒與香檳',
  'bordeaux-deep': '葡萄酒進階',
  'burgundy-deep': '葡萄酒進階',
  'italy-deep': '葡萄酒進階',
  'new-world-deep': '葡萄酒進階',
  'blind-tasting-advanced': 'CMS 演繹品飲法',
}

/** P2.D3.3 關鍵字高亮：將搜尋詞在文字中標出，回傳 React 可用的片段 */
function highlightQuery(text: string, query: string): ReactNode {
  if (!query.trim()) return text
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${q})`, 'gi')
  const parts = text.split(re)
  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="bg-primary-500/30 text-primary-200 rounded px-0.5">{part}</mark> : part
  )
}

/** 5/38/46 認證對應：WSET/CMS/MW */
const CERT_MAP: Record<string, string> = {
  'wine-basics': 'WSET', 'whisky-101': 'WSET', 'wset-l1-spirits': 'WSET L1', 'wset-l2-wines': 'WSET L2',
  'wset-l3-viticulture': 'WSET L3', 'wset-l3-tasting': 'WSET L3', 'wset-d1-production': 'WSET D1',
  'wset-d2-business': 'WSET D2', 'wset-d3-world': 'WSET D3', 'wset-d4-sparkling-pro': 'WSET D4',
  'fortified-wines': 'WSET', 'dessert-wines': 'WSET', 'organic-biodynamic': 'WSET',
  'cms-intro-somm': 'CMS', 'cms-deductive-tasting': 'CMS', 'cms-service': 'CMS',
  'cms-advanced-regions': 'CMS Adv', 'mw-viticulture': 'MW', 'mw-vinification': 'MW', 'mw-business': 'MW',
  'somm-exam-prep': 'WSET/CMS/MW', 'wine-law-regions': 'WSET/CMS',
  'bordeaux-deep': 'WSET', 'burgundy-deep': 'WSET', 'italy-deep': 'WSET',   'new-world-deep': 'WSET',
  'blind-tasting-advanced': 'CMS',
}

export default function LearnPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { tier, isLoading: subLoading } = useSubscription()
  /** 避免 hydration mismatch：訂閱狀態來自 localStorage，SSR 與 client 首繪需一致 */
  const canAccessPro = canAccessProCourse(tier)
  const proTrialAllowed = subLoading ? true : canUseProTrial(tier)
  const proTrialRemaining = subLoading ? 3 : getProTrialRemainingThisMonth(tier)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({})
  /** 151 課程分類篩選；56-57 URL 持久化；AUDIT #3 預設為「全部」或「入門」 */
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>(() => {
    const v = searchParams.get('level')
    return (v === 'beginner' || v === 'intermediate' || v === 'expert') ? v : 'all'
  })
  const [certFilter, setCertFilter] = useState<string>(() => searchParams.get('cert') || 'all')
  const [quickOnly, setQuickOnly] = useState(() => searchParams.get('quick') === '1')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '')
  /** P2.D1.1 卡片/列表切換 */
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  /** 32 搜尋防抖：useDeferredValue 延遲過濾，減少輸入時卡頓 */
  const deferredSearch = useDeferredValue(searchQuery)
  /** 161–165 遊戲化：等級徽章、排行榜、書籤 */
  const [bookmarks, setBookmarks] = useState<ReturnType<typeof getBookmarks>>([])
  const [points, setPoints] = useState(0)
  const [leaderboard, setLeaderboard] = useState<ReturnType<typeof getLeaderboard>>([])
  const [streak, setStreak] = useState({ days: 0, lastDate: '' })
  const [learnMinutes, setLearnMinutes] = useState(0)
  const [badges, setBadges] = useState<ReturnType<typeof getUnlockedBadges>>([])
  const [inviteToast, setInviteToast] = useState(false)
  const [shareProgressToast, setShareProgressToast] = useState(false)
  const [shareAchieveToast, setShareAchieveToast] = useState(false)
  const [dailyDone, setDailyDone] = useState(false)
  const [weeklyCount, setWeeklyCount] = useState(0)
  /** P2.B2.2 學習提醒排程：每日目標章數與今日已完成 */
  const [dailyGoal, setDailyGoal] = useState(1)
  const [chaptersToday, setChaptersToday] = useState(0)
  /** P2.B3.3 學習時間熱力圖：過去 7 天每日完成章數 */
  const [heatmapHistory, setHeatmapHistory] = useState<{ date: string; count: number }[]>([])
  /** 56 與好友比較 */
  const [friendCompare, setFriendCompareState] = useState<ReturnType<typeof getFriendCompare>>(null)
  const [friendNickname, setFriendNickname] = useState('')
  const [friendCompleted, setFriendCompleted] = useState('')
  /** 36 可摺疊模組 */
  const [taskOpen, setTaskOpen] = useState(true)
  const [achievementOpen, setAchievementOpen] = useState(true)
  /** AUDIT #27：等級 tab 方向鍵切換 */
  const levelTabListRef = useRef<HTMLDivElement>(null)
  const levelTabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const handleLevelTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const i = LEVEL_TABS.indexOf(levelFilter)
    if (e.key === 'ArrowLeft' || e.key === 'Home') {
      e.preventDefault()
      const next = e.key === 'Home' ? 0 : Math.max(0, i - 1)
      setLevelFilter(LEVEL_TABS[next])
      levelTabRefs.current[next]?.focus()
    } else if (e.key === 'ArrowRight' || e.key === 'End') {
      e.preventDefault()
      const next = e.key === 'End' ? LEVEL_TABS.length - 1 : Math.min(LEVEL_TABS.length - 1, i + 1)
      setLevelFilter(LEVEL_TABS[next])
      levelTabRefs.current[next]?.focus()
    }
  }, [levelFilter])
  const [friendOpen, setFriendOpen] = useState(true)
  const [bookmarkOpen, setBookmarkOpen] = useState(true)
  const [timelineOpen, setTimelineOpen] = useState(true)
  const [pathMapOpen, setPathMapOpen] = useState(false)
  const [showBackTop, setShowBackTop] = useState(false)
  /** 58 篩選分享連結：複製當前篩選 URL */
  const [shareFilterToast, setShareFilterToast] = useState(false)
  /** UX_LAYOUT_200 #181：篩選變更時載入指示 — 短暫 aria-busy */
  const [isFiltering, setIsFiltering] = useState(false)
  
  /** Phase 1 D1.7: 課程預覽 Modal 狀態 */
  const [previewCourse, setPreviewCourse] = useState<typeof COURSES[number] | null>(null)
  
  /** Phase 1 D1.7: 課程預覽 Modal 事件處理 */
  const handleCoursePreview = (course: typeof COURSES[number]) => {
    setPreviewCourse(course)
  }
  
  const handleStartLearning = () => {
    if (previewCourse) {
      router.push(`/learn/${previewCourse.id}`)
      setPreviewCourse(null)
    }
  }
  
  const handleShowDetails = () => {
    if (previewCourse) {
      router.push(`/learn/${previewCourse.id}`)
      setPreviewCourse(null)
    }
  }
  
  const handleClosePreview = () => {
    setPreviewCourse(null)
  }

  useEffect(() => {
    const onScroll = () => setShowBackTop(typeof window !== 'undefined' ? window.scrollY > 400 : false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  /** 56-57 篩選同步 URL；59 瀏覽器返回時還原篩選 */
  const searchString = searchParams.toString()
  useEffect(() => {
    const level = searchParams.get('level')
    setLevelFilter((level === 'beginner' || level === 'intermediate' || level === 'expert') ? level : 'all')
    setCertFilter(searchParams.get('cert') || 'all')
    setQuickOnly(searchParams.get('quick') === '1')
    setSearchQuery(searchParams.get('q') || '')
  }, [searchString]) // eslint-disable-line react-hooks/exhaustive-deps -- 依 URL 還原篩選
  useEffect(() => {
    const params = new URLSearchParams()
    if (levelFilter !== 'all') params.set('level', levelFilter)
    if (certFilter !== 'all') params.set('cert', certFilter)
    if (quickOnly) params.set('quick', '1')
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    if (typeof window !== 'undefined' && window.location.pathname + (window.location.search || '') !== url) {
      router.replace(url, { scroll: false })
    }
  }, [levelFilter, certFilter, quickOnly, searchQuery, pathname, router])

  /** L85：篩選變更時 scroll to top，方便看到新結果；#181 篩選變更時載入指示 */
  const prevFilterRef = useRef({ levelFilter, certFilter, quickOnly, searchQuery: searchQuery.trim() })
  useEffect(() => {
    const prev = prevFilterRef.current
    const filterChanged = prev.levelFilter !== levelFilter || prev.certFilter !== certFilter || prev.quickOnly !== quickOnly
    if (filterChanged || prev.searchQuery !== searchQuery.trim()) {
      prevFilterRef.current = { levelFilter, certFilter, quickOnly, searchQuery: searchQuery.trim() }
      if (filterChanged) {
        setIsFiltering(true)
        const t = setTimeout(() => setIsFiltering(false), 120)
        return () => clearTimeout(t)
      }
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [levelFilter, certFilter, quickOnly, searchQuery])

  const refreshStats = () => {
    maybeUnlockHolidayBadge()
    setBookmarks(getBookmarks())
    setPoints(getPoints())
    setLeaderboard(getLeaderboard())
    setStreak(getStreak())
    setLearnMinutes(getLearnMinutes())
    setBadges(getUnlockedBadges())
    setDailyGoal(getLearnDailyGoal())
    setChaptersToday(getChaptersCompletedToday())
    setHeatmapHistory(getLearnChaptersHistory(7))
    setDailyDone(getCompletedChapterToday())
    setWeeklyCount(getWeeklyChapterCount())
    setProgress(loadProgress())
    setFriendCompareState(getFriendCompare())
  }
  useEffect(() => {
    refreshStats()
    const onFocus = () => refreshStats()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const levelFiltered = levelFilter === 'all' ? COURSES : COURSES.filter((c) => c.level === levelFilter)
  const quickFiltered = quickOnly ? levelFiltered.filter((c) => c.tags?.includes('quick') || (c.estimatedMinutes ?? 0) <= 10) : levelFiltered
  const certFiltered = certFilter === 'all'
    ? quickFiltered
    : quickFiltered.filter((c) => {
        const cert = CERT_MAP[c.id] ?? ''
        if (certFilter === 'WSET') return cert.startsWith('WSET')
        if (certFilter === 'CMS') return cert.startsWith('CMS')
        if (certFilter === 'MW') return cert.startsWith('MW')
        return true
      })
  const filteredCourses = !deferredSearch.trim()
    ? certFiltered
    : certFiltered.filter((c) =>
        c.title.toLowerCase().includes(deferredSearch.trim().toLowerCase()) ||
        c.description.toLowerCase().includes(deferredSearch.trim().toLowerCase())
      )

  /** 15 課程完成後下一堂建議：找第一個 100% 完成的課程，建議下一堂 */
  /** 60 學習歷程時間軸：已完成的課程與完成日期 */
  const timelineEntries = (() => {
    const names: Record<string, string> = {
      'wine-basics': '葡萄酒入門',
      'white-wine': '白酒探索',
      'whisky-101': '威士忌基礎',
      'sake-intro': '清酒之道',
      'craft-beer': '精釀啤酒探索',
      'cocktail-basics': '調酒基礎',
      'champagne-sparkling': '氣泡酒與香檳',
      'rum-basics': '蘭姆酒入門',
      'gin-basics': '琴酒入門',
      'tequila-mezcal': '龍舌蘭與梅茲卡爾',
      'wine-advanced': '葡萄酒進階',
      'brandy-cognac': '白蘭地與干邑',
      'cocktail-classics': '經典調酒實作',
      'wine-pairing': '餐酒搭配進階',
      'sake-advanced': '清酒進階',
      'whisky-single-malt': '單一麥芽威士忌',
      'natural-wine': '自然酒入門',
      'low-abv': '低酒精飲品',
      'tasting-notes': '品飲筆記與盲飲',
      'home-bar': '居家酒吧入門',
      'wset-l1-spirits': 'WSET L1 烈酒入門',
      'wset-l2-wines': 'WSET L2 葡萄酒產區',
      'wset-l3-viticulture': '葡萄栽培與風土',
      'wset-l3-tasting': '系統化品飲分析',
      'wset-d1-production': '葡萄酒生產原理',
      'wset-d2-business': '葡萄酒商業與行銷',
      'wset-d3-world': '世界葡萄酒深度',
      'fortified-wines': '加烈酒：波特與雪莉',
      'cms-intro-somm': 'CMS 入門侍酒師',
      'cms-deductive-tasting': 'CMS 演繹品飲法',
      'cms-service': '侍酒服務實務',
      'cms-advanced-regions': '侍酒師產區與品種',
      'mw-viticulture': 'MW 葡萄栽培深度',
      'mw-vinification': 'MW 釀造與裝瓶前',
      'mw-business': 'MW 葡萄酒商業',
      'organic-biodynamic': '有機與生物動力法',
      'wine-law-regions': '葡萄酒法規與產區',
      'dessert-wines': '甜酒與貴腐',
      'beer-cider': '啤酒與 Cider 進階',
      'somm-exam-prep': '認證考試準備總覽',
      'wset-d4-sparkling-pro': '氣泡酒專業',
      'quick-wine-5min': '5 分鐘快懂葡萄酒',
      'quick-cocktail-5min': '5 分鐘快懂調酒',
      'dating-wine-select': '約會選酒速成',
      'quick-whisky-5min': '5 分鐘快懂威士忌',
      'party-wine-select': '聚餐選酒速成',
      'home-sipping': '在家小酌入門',
      'wine-label-read': '酒標一眼看懂',
      'supermarket-wine': '超市選酒不求人',
      'beginner-faq': '新手常見問題 FAQ',
      'bordeaux-deep': '產區深度：波爾多',
      'burgundy-deep': '產區深度：勃根地',
      'italy-deep': '產區深度：義大利',
      'new-world-deep': '產區深度：新世界',
      'blind-tasting-advanced': '盲品實戰進階',
      'viral-trends-2025': '2025-2026 酒類趨勢',
    }
    return Object.entries(progress)
      .filter(([, v]) => v.total > 0 && v.completed >= v.total && v.completedAt)
      .map(([cid, v]) => ({ courseId: cid, title: names[cid] ?? cid, completedAt: v.completedAt! }))
      .sort((a, b) => (b.completedAt > a.completedAt ? 1 : -1))
  })()

  /** 89 品酒師等級：依完成課程數 */
  const completedCourseCount = Object.values(progress).filter((p) => p.total > 0 && p.completed >= p.total).length
  const sommelierLevel = getSommelierLevel(completedCourseCount)

  /** P2.B2.3 遺忘曲線複習：艾賓浩斯建議 1/3/7 天後複習 */
  const reviewSuggestions = (() => {
    const today = new Date().toISOString().slice(0, 10)
    const names: Record<string, string> = { ...Object.fromEntries(COURSES.map((c) => [c.id, c.title])) }
    const out: { courseId: string; title: string; completedAt: string; daysAgo: number }[] = []
    for (const [cid, v] of Object.entries(progress)) {
      if (!v?.completedAt || v.total === 0 || v.completed < v.total) continue
      const completed = v.completedAt.slice(0, 10)
      const days = Math.floor((new Date(today).getTime() - new Date(completed).getTime()) / (24 * 60 * 60 * 1000))
      if ([1, 2, 3, 4, 7, 8].includes(days)) out.push({ courseId: cid, title: names[cid] ?? cid, completedAt: completed, daysAgo: days })
    }
    return out.slice(0, 3)
  })()

  /** 6/16 依學習路徑建議下一堂 */
  const nextCourseSuggestion = (() => {
    const path = LEARNING_PATH
    for (const cid of path) {
      const p = progress[cid]
      const total = COURSES.find((c) => c.id === cid)?.lessons ?? 0
      if (total > 0 && p && p.completed >= total) {
        const idx = path.indexOf(cid)
        const nextId = path[idx + 1]
        if (nextId) return COURSES.find((c) => c.id === nextId)
        break
      }
    }
    return null
  })()

  /** P3 學習推薦：有進度但未完成的課程，取進度最高一門顯示「繼續學習」 */
  const continueLearningCourse = (() => {
    const inProgress: { course: (typeof COURSES)[0]; pct: number }[] = []
    for (const c of COURSES) {
      const p = progress[c.id]
      const total = c.lessons
      if (total > 0 && p && p.completed > 0 && p.completed < total) {
        inProgress.push({ course: c, pct: Math.round((p.completed / total) * 100) })
      }
    }
    if (inProgress.length === 0) return null
    inProgress.sort((a, b) => b.pct - a.pct)
    return inProgress[0].course
  })()

  return (
    <main id="learn-main" className="relative min-h-screen px-3 sm:px-6 md:px-8 pt-0 pb-10 md:pb-12 safe-area-px safe-area-pb page-container-mobile" tabIndex={-1} role="main" aria-label="品酒學院課程列表">
        {/* 172 skip link；66-70 RWD：鍵盤 Tab 可見 */}
        <a
          href="#learn-main"
          className="absolute left-4 z-[100] px-4 py-3 rounded-lg bg-primary-500 text-white text-sm font-medium min-h-[48px] min-w-[48px] inline-flex items-center justify-center -translate-y-24 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/50 transition-transform duration-200"
        >
          跳到主要內容
        </a>
        <div className="max-w-4xl xl:max-w-[1440px] mx-auto px-0 sm:px-2 space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <Link href="/" className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center gap-1 text-white/60 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            返回
          </Link>
        </div>

        {/* L01：學院主標字級與字重階層明確；Hero 區；排版優化：間距與圓角 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center px-4 sm:px-6 py-8 md:py-10 rounded-2xl md:rounded-3xl bg-gradient-to-b from-primary-500/8 via-transparent to-transparent"
          aria-labelledby="learn-hero-title"
        >
          <h1 id="learn-hero-title" className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2 leading-tight tracking-tight">
            品酒學院
          </h1>
          {/* 4 主副標層級視覺區分：副標用較淡色與較小字級 */}
          <HeroSubtitle count={LEARN_COURSE_COUNT} />
        </motion.div>

        {/* 50 進度環形圖；161 等級徽章；66-70 RWD 間距；動畫 stagger */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6 md:mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          {/* 進度環形圖；AUDIT #23 進度環 role="progressbar"、aria-valuenow */}
          <div
            className="relative w-16 h-16 flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
            role="progressbar"
            tabIndex={0}
            aria-valuenow={completedCourseCount}
            aria-valuemin={0}
            aria-valuemax={TOTAL_COURSES}
            aria-label={`已完成 ${completedCourseCount} 門，共 ${TOTAL_COURSES} 門課程，${Math.round((completedCourseCount / TOTAL_COURSES) * 100)}%`}
          >
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${((completedCourseCount / TOTAL_COURSES) * 100).toFixed(1)} ${(100 - (completedCourseCount / TOTAL_COURSES) * 100).toFixed(1)}`}
                className="text-primary-500 transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
              {completedCourseCount}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-medium min-h-[44px] sm:min-h-0">
              <Award className="w-4 h-4 shrink-0" />
              {sommelierLevel || (points < 50 ? '新手' : points < 150 ? '學徒' : '品酒師')}
            </span>
            <span className="text-white/50 text-sm">{points} 積分</span>
            {learnMinutes > 0 && (
              <span className="text-white/50 text-sm">累計 {learnMinutes} 分鐘</span>
            )}
            {streak.days > 0 && (
              <span className="inline-flex items-center gap-1.5 text-amber-400/90 text-sm">
                <Flame className="w-4 h-4" />
                連續 {streak.days} 天
              </span>
            )}
          </div>
        </motion.div>

        {/* 57 每日任務；58 週挑戰；36 可摺疊；59 模組動畫；排版優化 */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="mb-6">
          <button type="button" onClick={() => setTaskOpen((o) => !o)} className="flex items-center justify-between w-full text-left mb-2 py-2 rounded-lg hover:bg-white/5 transition-colors -mx-1 px-1" aria-expanded={taskOpen}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Target className="w-5 h-5 text-primary-400 shrink-0" />
              任務
            </h2>
            <span className="text-white/50 transition-transform duration-200">{taskOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</span>
          </button>
          <AnimatePresence initial={false}>
          {taskOpen && (
          <motion.div
            key="task-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
          <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            {dailyDone ? (
              <>
                <Check className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-white/90">今日：完成一章</span>
                <span className="text-primary-400 text-sm">✓</span>
              </>
            ) : (
              <span className="text-white/70">今日：完成任一章節</span>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <Flame className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-white/90">本週：完成 3 章</span>
            <span className={`text-sm ml-auto ${weeklyCount >= 3 ? 'text-primary-400' : 'text-white/50'}`}>
              {weeklyCount}/3
            </span>
            {weeklyCount >= 3 && <Check className="w-5 h-5 text-primary-400 flex-shrink-0" />}
          </div>
          </div>
          </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* 60 學習歷程時間軸；36 可摺疊；59 模組動畫 */}
        {timelineEntries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
            <button type="button" onClick={() => setTimelineOpen((o) => !o)} className="flex items-center justify-between w-full text-left mb-3" aria-expanded={timelineOpen}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Clock className="w-5 h-5 text-primary-400" />
                學習歷程
              </h2>
              {timelineOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
            </button>
            {timelineOpen && (
            <div className="space-y-2">
              {timelineEntries.map((e) => (
                <div
                  key={e.courseId}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <span className="text-primary-400 text-sm font-medium w-24 flex-shrink-0">
                    {e.completedAt.replace(/-/g, '/')}
                  </span>
                  <span className="text-white/90">{e.title}</span>
                  <Check className="w-4 h-4 text-primary-400 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
            )}
          </motion.div>
        )}

        {/* P3 學習推薦：有進度未完成時顯示「繼續學習」區塊 */}
        {continueLearningCourse && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
              <Play className="w-5 h-5 text-primary-400" />
              繼續學習
            </h2>
            <Link
              href={`/learn/${continueLearningCourse.id}`}
              className="flex items-center gap-3 min-h-[48px] p-4 rounded-xl bg-primary-500/15 border border-primary-500/30 hover:bg-primary-500/25 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${continueLearningCourse.color} shrink-0`}>
                <continueLearningCourse.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{continueLearningCourse.title}</p>
                <p className="text-white/60 text-sm">
                  已完成 {progress[continueLearningCourse.id]?.completed ?? 0} / {continueLearningCourse.lessons} 課
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-400 shrink-0" />
            </Link>
          </motion.div>
        )}

        {/* P2.B2.2 學習提醒排程：每日目標 */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-400" />
            今日目標
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-white/70 text-sm">完成</span>
            <select
              value={dailyGoal}
              onChange={(e) => {
                const n = Number(e.target.value)
                setLearnDailyGoal(n)
                setDailyGoal(n)
              }}
              className="min-h-[40px] px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
              aria-label="每日目標章數"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} 章</option>
              ))}
            </select>
            <span className="text-white/70 text-sm">今日已完成 <strong className="text-primary-400">{chaptersToday}</strong> 章</span>
            {chaptersToday >= dailyGoal && dailyGoal > 0 && (
              <span className="text-green-400 text-sm">✓ 達標</span>
            )}
          </div>
        </motion.div>

        {/* P2.C3.2 本週之星：排行榜 */}
        {leaderboard.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              本週之星
            </h2>
            <div className="flex flex-wrap gap-2">
              {leaderboard.slice(0, 5).map((e) => (
                <span
                  key={e.rank}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${e.isCurrentUser ? 'bg-primary-500/30 text-primary-200 border border-primary-500/50' : 'bg-white/10 text-white/80'}`}
                >
                  <span className="text-white/50">#{e.rank}</span>
                  <span>{e.name}</span>
                  <span className="text-amber-400/90">{e.points} 分</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* P2.B2.3 遺忘曲線複習：艾賓浩斯 1/3/7 天建議複習 */}
        {reviewSuggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              建議複習
            </h2>
            <p className="text-white/50 text-xs mb-3">根據艾賓浩斯曲線，以下課程適合近期複習</p>
            <div className="flex flex-wrap gap-2">
              {reviewSuggestions.map((r) => (
                <Link
                  key={r.courseId}
                  href={`/learn/${r.courseId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 text-sm border border-amber-500/20 hover:bg-amber-500/20"
                >
                  {r.title}
                  <span className="text-white/50 text-xs">{r.daysAgo} 天前完成</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* P2.B3.3 學習時間熱力圖：過去 7 天每日完成章數 */}
        {heatmapHistory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" />
              過去 7 天學習
            </h2>
            <div className="flex gap-1.5 items-end" role="img" aria-label="過去7天每日完成章數">
              {heatmapHistory.map(({ date, count }) => {
                const max = Math.max(1, ...heatmapHistory.map((h) => h.count))
                const intensity = max > 0 ? count / max : 0
                return (
                  <div
                    key={date}
                    className="flex-1 min-w-0 flex flex-col items-center gap-0.5"
                    title={`${date}：${count} 章`}
                  >
                    <div
                      className="w-full rounded-t min-h-[24px] transition-colors"
                      style={{
                        backgroundColor: intensity > 0.6 ? 'rgba(139, 92, 246, 0.6)' : intensity > 0.2 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.08)',
                      }}
                    />
                    <span className="text-[10px] text-white/50">{date.slice(5).replace('-', '/')}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* AUDIT /learn #36：無進行中、無書籤時空狀態文案引導 */}
        {!continueLearningCourse && (
          <div className="mb-6 py-4 px-4 rounded-xl bg-white/[0.03] border border-white/5 text-center" role="status">
            <p className="text-white/50 text-sm">尚無進行中課程{bookmarks.length === 0 ? '與書籤' : ''} · 從下方挑一門開始學習吧</p>
          </div>
        )}

        {/* 51 成就列表；89 品酒師等級認證；90 專屬會員徽章；36 可摺疊；59 模組動畫 */}
        {(badges.length > 0 || hasProBadge(tier) || sommelierLevel) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
            <button type="button" onClick={() => setAchievementOpen((o) => !o)} className="flex items-center justify-between w-full text-left mb-3" aria-expanded={achievementOpen}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Star className="w-5 h-5 text-primary-400" />
                我的成就
              </h2>
              {achievementOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
            </button>
            {achievementOpen && (
            <div className="flex flex-wrap gap-2">
              {sommelierLevel && (
                <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-sm border border-amber-500/40" title="品酒師等級認證">
                  {sommelierLevel}
                </span>
              )}
              {hasProBadge(tier) && (
                <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-sm" title="Pro 專屬會員">
                  Pro 會員
                </span>
              )}
              {/* Phase 1 D2.1: 成就徽章系統視覺升級 - 專業圖標 + 動畫 */}
              {badges.map((id, index) => {
                const badgeIcons: Record<string, typeof Trophy> = {
                  'first-quiz': Award,
                  'streak-7': Flame,
                  'games-10': Trophy,
                  'learn-1': BookOpen,
                  'wishlist-5': Bookmark,
                }
                const BadgeIcon = badgeIcons[id] || Award
                
                return (
                  <motion.span
                    key={id}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.4,
                      ease: [0.68, -0.55, 0.265, 1.55]
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500/30 to-amber-500/30 text-primary-200 text-sm border border-primary-500/30 shadow-md hover:shadow-xl transition-shadow cursor-default"
                    title={BADGE_LABELS[id] ?? id}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {BADGE_LABELS[id] ?? id}
                  </motion.span>
                )
              })}
            </div>
            )}
          </motion.div>
        )}

        {/* 56 與好友比較；36 可摺疊；59 模組動畫 */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
          <button type="button" onClick={() => setFriendOpen((o) => !o)} className="flex items-center justify-between w-full text-left mb-3" aria-expanded={friendOpen}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <UserPlus className="w-5 h-5 text-primary-400" />
              與好友比較
            </h2>
            {friendOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
          </button>
          {friendOpen && (
          <div className="space-y-3">
            {friendCompare ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90">你 vs {friendCompare.nickname}</span>
                  <button
                    type="button"
                    onClick={() => { setFriendCompare(null); setFriendCompareState(null) }}
                    className="text-white/40 hover:text-white text-xs"
                  >
                    移除
                  </button>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-primary-400">你：{completedCourseCount} 堂</span>
                  <span className="text-white/40">|</span>
                  <span className="text-white/70">{friendCompare.nickname}：{friendCompare.completedCourses} 堂</span>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  {completedCourseCount > friendCompare.completedCourses ? '你領先！' : completedCourseCount < friendCompare.completedCourses ? '加油，繼續學習！' : '平分秋色'}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={friendNickname}
                  onChange={(e) => setFriendNickname(e.target.value)}
                  placeholder="好友暱稱"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm w-24"
                  aria-label="好友暱稱"
                />
                <input
                  type="number"
                  min={0}
                  max={55}
                  step={1}
                  value={friendCompleted}
                  onChange={(e) => setFriendCompleted(e.target.value)}
                  onWheel={preventNumberScrollOnWheel}
                  placeholder="完成堂數"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm w-20"
                  aria-label="好友完成堂數"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nick = friendNickname.trim()
                    const cnt = parseInt(friendCompleted, 10)
                    if (nick && Number.isFinite(cnt) && cnt >= 0) {
                      setFriendCompare({ nickname: nick, completedCourses: cnt, updatedAt: '' })
                      setFriendCompareState({ nickname: nick, completedCourses: cnt, updatedAt: '' })
                      setFriendNickname('')
                      setFriendCompleted('')
                    }
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-primary-500/30 hover:bg-primary-500/50 active:scale-[0.98] text-white text-sm font-medium transition-transform"
                >
                  加入比較
                </button>
              </div>
            )}
            <p className="text-white/40 text-xs">邀請好友一起學，輸入好友的完成堂數來比拼（最多 55 堂）</p>
          </div>
          )}
        </motion.div>

        {/* 160 我的書籤；36 可摺疊 */}
        {bookmarks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <button type="button" onClick={() => setBookmarkOpen((o) => !o)} className="flex items-center justify-between w-full text-left mb-3" aria-expanded={bookmarkOpen} aria-label={bookmarkOpen ? '收合我的書籤' : '展開我的書籤'}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Bookmark className="w-5 h-5 text-primary-400" aria-hidden />
                我的書籤
              </h2>
              {bookmarkOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
            </button>
            {/* Phase 1 D3.3: 書籤快速跳轉動畫 */}
            {bookmarkOpen && (
            <div className="space-y-2">
              {bookmarks.slice(0, 5).map((b, i) => (
                <motion.div
                  key={`${b.courseId}-${b.chapterId}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link
                    href={`/learn/${b.courseId}#ch-${b.chapterId}`}
                    className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 text-white text-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="font-medium">{b.courseTitle ?? b.courseId}</span>
                    <span className="text-white/50"> · 第{b.chapterId}章 {b.title}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
            )}
          </motion.div>
        )}

        {/* 9 課程關聯圖（前置/後續）視覺化 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button type="button" onClick={() => setPathMapOpen((o) => !o)} className="flex items-center justify-between w-full text-left mb-3" aria-expanded={pathMapOpen} aria-controls="learn-path-map-content">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Target className="w-5 h-5 text-primary-400" />
              課程關聯圖
            </h2>
            {pathMapOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
          </button>
          <div
            id="learn-path-map-content"
            className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${pathMapOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
            aria-hidden={!pathMapOpen}
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
              <p className="text-white/60 text-sm">依建議順序：前置課程完成後再學進階</p>
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">快懂</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">入門</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">進階</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
                <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400">專家</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['quick-wine-5min', 'wine-basics', 'wine-advanced', 'bordeaux-deep'].map((cid, i) => {
                  const c = COURSES.find((x) => x.id === cid)
                  const p = progress[cid]
                  const done = p && p.total > 0 && p.completed >= p.total
                  return c ? (
                    <Link key={cid} href={`/learn/${cid}`} className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm">
                      <span className={done ? 'text-emerald-400 line-through' : 'text-white'}>{c.title}</span>
                      {PREREQ_MAP[cid] && <span className="block text-white/40 text-[10px] mt-0.5">先修：{PREREQ_MAP[cid]}</span>}
                    </Link>
                  ) : null
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 酒類知識入口；49 樣式優化 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <Link
            href="/learn/knowledge"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-primary-500/20">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">酒類知識</h2>
              <p className="text-white/50 text-sm">WSET · CMS · MW 等級 FAQ、酒杯指南、醒酒與品酒技巧</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/plan"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-primary-500/20">
              <Target className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">學習計劃生成器</h2>
              <p className="text-white/50 text-sm">依 WSET / CMS / MW 目標取得個人化課程順序</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/badges"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-primary-500/20">
              <Award className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">徽章牆</h2>
              <p className="text-white/50 text-sm">解鎖成就、展示學習徽章</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/weakness"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">弱項診斷</h2>
              <p className="text-white/50 text-sm">依錯題本分析需加強的課程與章節</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/exam-practice"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-primary-500/20">
              <FileQuestion className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">考古題練習區</h2>
              <p className="text-white/50 text-sm">認證考試歷年考題與模擬練習</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/knowledge-map"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-primary-500/20">
              <Network className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">知識圖譜</h2>
              <p className="text-white/50 text-sm">課程關聯視覺化，完成後可接續的課程</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/kol"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">KOL 推薦榜單</h2>
              <p className="text-white/50 text-sm">網紅與專家精選課程（籌備中）</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/study-buddy"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-primary-500/20">
              <Users className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">學習夥伴配對</h2>
              <p className="text-white/50 text-sm">同進度學員互相激勵（籌備中）</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/study-group"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-primary-500/20">
              <UserPlus className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">學習小組</h2>
              <p className="text-white/50 text-sm">邀請好友組隊一起學（籌備中）</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
          <Link
            href="/learn/coming-soon"
            className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-all shadow-md"
          >
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">進階功能籌備中</h2>
              <p className="text-white/50 text-sm">筆記 PDF、推播、盲品、模擬考、短影片等</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 ml-auto" />
          </Link>
        </motion.div>

        {/* L87：課程篩選區 aria-label */}
        {/* UX_LAYOUT_200 #77：篩選與列表關係標示 — 篩選區 aria-describedby 指向結果數量 */}
        <motion.div
          role="region"
          aria-label="課程篩選"
          aria-describedby="learn-course-list"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3"
        >
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋課程名稱或描述"
              className="w-full pl-10 pr-10 py-3 min-h-[48px] rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
              aria-label="搜尋課程名稱或描述"
              aria-busy={searchQuery !== deferredSearch}
            />
            {/* UX_LAYOUT_200 #180：搜尋防抖與載入狀態 */}
            {searchQuery !== deferredSearch && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-white/40 text-xs" aria-live="polite">搜尋中…</span>
            )}
            {searchQuery === deferredSearch && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-2 rounded min-h-[48px] min-w-[48px] inline-flex items-center justify-center games-focus-ring"
                aria-label="清除搜尋"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            )}
          </div>
          {(searchQuery || levelFilter !== 'all' || certFilter !== 'all' || quickOnly) && (
            <>
              <button
                type="button"
                onClick={async () => {
                  const params = new URLSearchParams()
                  if (levelFilter !== 'all') params.set('level', levelFilter)
                  if (certFilter !== 'all') params.set('cert', certFilter)
                  if (quickOnly) params.set('quick', '1')
                  if (searchQuery.trim()) params.set('q', searchQuery.trim())
                  const url = params.toString() ? `${typeof window !== 'undefined' ? window.location.origin : ''}${pathname}?${params}` : `${typeof window !== 'undefined' ? window.location.origin : ''}${pathname}`
                  try {
                    await navigator.clipboard.writeText(url)
                    setShareFilterToast(true)
                    setTimeout(() => setShareFilterToast(false), 2000)
                  } catch { /* fallback ignored */ }
                }}
                className="min-h-[48px] px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white shrink-0 transition-all games-focus-ring flex items-center gap-2"
                aria-label="複製篩選連結"
                title="複製篩選連結"
              >
                <Share2 className="w-4 h-4" aria-hidden />
                {shareFilterToast ? '已複製' : '分享篩選'}
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setLevelFilter('all'); setCertFilter('all'); setQuickOnly(false) }}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15 active:scale-[0.98] shrink-0 transition-all games-focus-ring"
                aria-label="清除所有篩選"
              >
                清除篩選
              </button>
            </>
          )}
        </motion.div>

        {/* 151 課程分類；AUDIT #27 篩選為 tablist、方向鍵可切換 */}
        {/* L78：等級 tab 小屏橫向捲動 */}
        <div className="mb-4">
          <p id="learn-level-label" className="text-white/50 text-xs mb-2 text-center sm:text-left">等級</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-4 overflow-x-auto scrollbar-hide pb-1"
          role="tablist"
          aria-labelledby="learn-level-label"
          ref={levelTabListRef}
          onKeyDown={handleLevelTabKeyDown}
        >
          {(['all', 'beginner', 'intermediate', 'expert'] as const).map((level, idx) => {
            const count = level === 'all' ? COURSES.length : COURSES.filter((c) => c.level === level).length
            return (
              <button
                key={level}
                ref={(el) => { levelTabRefs.current[idx] = el }}
                type="button"
                role="tab"
                aria-selected={levelFilter === level}
                tabIndex={levelFilter === level ? 0 : -1}
                onClick={() => setLevelFilter(level)}
                className={`min-h-[48px] px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-none touch-manipulation active:scale-[0.97] ${
                  levelFilter === level ? 'bg-primary-500/30 border border-primary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                {level === 'all' ? `全部 ${count}` : `${LEVEL_LABELS[level]} ${count}`}
              </button>
            )
          })}
        </motion.div>
        </div>
        {/* L90：篩選與列表間距一致 */}
        <div className="mb-6">
          <p className="text-white/50 text-xs mb-2 text-center sm:text-left">認證</p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
          {['all', 'WSET', 'CMS', 'MW'].map((cert) => {
            const count = cert === 'all' ? levelFiltered.length : levelFiltered.filter((c) => {
              const ce = CERT_MAP[c.id] ?? ''
              return cert === 'WSET' ? ce.startsWith('WSET') : cert === 'CMS' ? ce.startsWith('CMS') : cert === 'MW' ? ce.startsWith('MW') : false
            }).length
            return (
              <button
                key={cert}
                type="button"
                onClick={() => setCertFilter(cert)}
                aria-pressed={certFilter === cert}
                className={`min-h-[48px] px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 games-focus-ring touch-manipulation active:scale-[0.97] ${
                  certFilter === cert ? 'bg-slate-600/50 border border-slate-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.07]'
                }`}
              >
                {cert === 'all' ? '認證' : cert}
              </button>
            )
          })}
        </motion.div>
        </div>

        {/* P2.D1.1 卡片/列表切換 */}
        {filteredCourses.length > 0 && (
          <div className="flex items-center justify-end gap-2 mb-3" role="group" aria-label="檢視模式">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              aria-pressed={viewMode === 'card'}
              className={`p-2 rounded-lg transition-colors games-focus-ring ${viewMode === 'card' ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-white/50 hover:text-white'}`}
              title="卡片檢視"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`p-2 rounded-lg transition-colors games-focus-ring ${viewMode === 'list' ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-white/50 hover:text-white'}`}
              title="列表檢視"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Course Grid；147 進階課程鎖定；18 空篩選；11 專家佔位 */}
        {filteredCourses.length === 0 ? (
          <div className="py-16 md:py-20 text-center rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10" role="status" aria-live="polite" aria-label="無符合篩選條件的課程">
            {/* UX_LAYOUT_200 #79：篩選結果數量提示（空時也顯示 0） */}
            <p className="text-white/40 text-sm mb-4">篩選結果：0 門課程</p>
            {/* L18/L76：空狀態友善提示與清除篩選 CTA；#80 空搜尋/空篩選友善文案 */}
            <div className="mx-auto w-24 h-24 mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-14 h-14 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {levelFilter === 'expert' && COURSES.filter((c) => c.level === 'expert').length === 0 ? (
              <>
                <p className="text-white/80 font-medium mb-2">目前沒有專家級課程</p>
                <p className="text-white/50 text-sm mb-4 max-w-xs mx-auto">先完成入門與進階課程，解鎖更深內容</p>
                <button type="button" onClick={() => setLevelFilter('intermediate')} className="min-h-[48px] px-5 py-3 rounded-xl bg-primary-500/30 hover:bg-primary-500/50 text-primary-300 text-sm font-medium transition-colors active:scale-[0.98] games-focus-ring">查看進階課程</button>
              </>
            ) : (
              <>
                <p className="text-white/80 font-medium mb-2">
                  {deferredSearch.trim() ? (
                    <>找不到「{deferredSearch.trim()}」相關課程</>
                  ) : (
                    <>目前沒有{levelFilter !== 'all' ? `${LEVEL_LABELS[levelFilter as CourseLevel]}等級的` : ''}符合課程</>
                  )}
                </p>
                <p className="text-white/50 text-sm mb-4 max-w-xs mx-auto">
                  {deferredSearch.trim() ? '試試其他關鍵字或放寬篩選條件' : '篩選過嚴時可點下方按鈕一鍵清除，或切換「全部」等級'}
                </p>
                <button type="button" onClick={() => { setSearchQuery(''); setLevelFilter('all'); setCertFilter('all'); setQuickOnly(false) }} className="min-h-[48px] px-5 py-3 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium transition-all duration-200 active:scale-[0.98] games-focus-ring touch-manipulation">清除所有篩選</button>
              </>
            )}
          </div>
        ) : (
        <>
        {/* E91 P2：新課程上線預告橫幅 — announcements.config 有 type=course 時顯示 */}
        {getActiveLaunchAnnouncements().filter((a) => a.type === 'course').map((a) => {
          const course = COURSES.find((c) => c.id === a.id)
          return course ? (
            <div key={a.id} className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20" role="region" aria-label="新課程上線">
              <p className="text-primary-300 text-sm font-medium">{a.label}：{course.title}</p>
              <Link href={`/learn/${course.id}`} className="text-white/70 hover:text-white text-xs mt-1 inline-block underline underline-offset-1">前往課程</Link>
            </div>
          ) : null
        })}
        {/* E78 P2：付費用戶專屬區塊預留 — Pro/VIP 專屬感、後續接實際活動 */}
        {(tier === 'basic' || tier === 'premium') && (
          <div className="mb-6 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
            <p className="text-accent-300 text-sm font-medium mb-1">{tier === 'premium' ? 'VIP 專屬' : 'Pro 專屬'}</p>
            <p className="text-white/60 text-xs md:text-sm">專屬活動與進階內容即將推出，敬請期待。</p>
          </div>
        )}
        {/* L99：推薦路徑入口可見；47 學習路徑 */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch">
          <div className="flex-1 min-w-0 sm:min-w-[200px] p-4 md:p-5 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <p className="text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">推薦路徑</p>
            <p className="text-primary-300 text-sm font-medium mb-1">建議學習路徑</p>
            <p className="text-white/60 text-xs md:text-sm">5 分鐘快懂 → 入門 → 進階 → 專家</p>
          </div>
          <button
            type="button"
            onClick={() => setQuickOnly((o) => !o)}
            className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 touch-manipulation active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-none ${quickOnly ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/[0.07]'}`}
            aria-pressed={quickOnly}
          >
            ⚡ 只要 10 分鐘內課程
          </button>
        </div>
        {/* UX_LAYOUT_200 #181：篩選變更時載入指示 — 結果區 aria-busy；P3-50：未來若列表增長可考慮虛擬捲動或分頁 */}
        <div role="region" aria-busy={isFiltering || searchQuery !== deferredSearch} aria-label="課程列表" id="learn-course-list">
          <p className="text-white/50 text-sm mb-5 md:mb-6" aria-live="polite">
            {isFiltering ? '篩選中…' : `共 ${filteredCourses.length} 門課程`}
          </p>
        {/* 37 課程依等級分組；58 響應式；94 區塊間視覺分隔 */}
        <div className="space-y-10 md:space-y-12 mb-12 divide-y divide-white/5 md:divide-y-0 md:space-y-12">
          {(['beginner', 'intermediate', 'expert'] as const).map((level) => {
            const levelCourses = filteredCourses.filter((c) => c.level === level)
            if (levelCourses.length === 0) return null
            return (
              <section key={level} aria-labelledby={`section-${level}`} className="pt-10 md:pt-0 first:pt-0 scroll-mt-20">
                <h2 id={`section-${level}`} className="text-lg md:text-xl font-semibold text-white mb-5 md:mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 md:h-7 rounded-full bg-primary-500 shrink-0" aria-hidden />
                  <span>{LEVEL_LABELS[level]}（{levelCourses.length}）</span>
                </h2>
                <div className={viewMode === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6'}>
          {levelCourses.map((course, index) => {
            const isProCourse = !course.free
            const hasAccess = canAccessPro || (isProCourse && tier === 'free' && proTrialAllowed)
            const isLocked = isProCourse && !hasAccess
            const prog = progress[course.id]
            const totalChapters = course.lessons
            const completed = prog ? Math.min(prog.completed, totalChapters) : 0
            const progressPct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0
            return (
              <InViewAnimate key={course.id} delay={Math.min(index * 0.06, 0.4)} y={20} amount={0.15}>
              {viewMode === 'list' ? (
                <Link
                  href={isLocked ? '/pricing' : `/learn/${course.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors"
                  aria-label={`${course.title}，${course.lessons} 課`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${course.color} shrink-0`}>
                    <course.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{highlightQuery(course.title, deferredSearch)}</h3>
                    <p className="text-white/50 text-sm truncate">{highlightQuery(course.description, deferredSearch)}</p>
                  </div>
                  <span className="text-white/40 text-xs shrink-0">{course.lessons} 課 · {course.estimatedMinutes ?? course.duration}</span>
                  <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
                </Link>
              ) : (
              <motion.div
                style={{ transformStyle: 'preserve-3d' }}
                whileHover={{
                  scale: 1.025,
                  rotateX: 1.5,
                  rotateY: -1.5,
                  z: 10,
                  boxShadow: '0 20px 40px rgba(139, 0, 0, 0.15), 0 0 30px rgba(139, 0, 0, 0.1)',
                  transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
                }}
                onClick={() => !isLocked && handleCoursePreview(course)}
                className="cursor-pointer group/card"
              >
                {/* P2.D3.2 快速預覽 hover：桌面版 hover 顯示描述 */}
                <div className="hidden sm:block absolute inset-0 z-[2] pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 rounded-2xl bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 flex flex-col justify-end">
                  <p className="text-white/90 text-sm line-clamp-3 mb-2">{course.description}</p>
                  <span className="text-primary-300 text-xs font-medium">點擊進入課程</span>
                </div>
                {/* L05/L06：課程卡 hover 一致、focus-visible 由內層 Link 提供 */}
                <div
                  className={`card-interactive glass-card rounded-2xl h-full relative overflow-hidden shadow-glass-1 hover:shadow-glass-hover hover:border-white/20 transition-all duration-300 ease-out active:scale-[0.99] min-h-[120px] ${isLocked ? 'cursor-pointer' : ''}`}
                  onClick={isLocked ? () => setShowUpgrade(true) : undefined}
                  onKeyDown={isLocked ? (e) => e.key === 'Enter' && setShowUpgrade(true) : undefined}
                  role={isLocked ? 'button' : undefined}
                  tabIndex={isLocked ? 0 : undefined}
                >
                  {!isLocked && (
                    <div 
                      className="absolute inset-0 z-[1] focus:outline-none games-focus-ring focus-visible:ring-inset rounded-2xl min-h-[48px]" 
                      aria-label={`進入課程：${course.title}，${course.lessons} 堂課、約 ${course.estimatedMinutes != null ? `${course.estimatedMinutes} 分鐘` : course.duration}`} 
                    />
                  )}
                  {/* AUDIT #32：課程標籤與全站 badge 一致 — 統一 rounded-full text-xs px-2 py-1 + 語意色 */}
                  {course.tags?.includes('essential') && (
                    <span className="absolute top-3 left-3 learn-badge learn-badge-primary z-20">入門必讀</span>
                  )}
                  {course.tags?.includes('hot') && !course.tags?.includes('essential') && (
                    <span className="absolute top-3 left-3 learn-badge learn-badge-amber z-20">熱門</span>
                  )}
                  {course.tags?.includes('quick') && (
                    <span className="absolute top-3 left-3 learn-badge learn-badge-amber z-20">快速</span>
                  )}
                  {course.tags?.includes('new') && !course.tags?.includes('essential') && !course.tags?.includes('quick') && (
                    <span className="absolute top-3 left-3 learn-badge learn-badge-green z-20">新上架</span>
                  )}
                  {/* P3-425：課程難度標籤 — 入門/進階/專家 */}
                  <span className="absolute bottom-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 z-20">{LEVEL_LABELS[course.level]}</span>
                  {CERT_MAP[course.id] && (
                    <div className={`absolute top-3 text-[10px] px-2 py-0.5 rounded bg-slate-600/80 text-white/90 z-20 ${!course.free ? 'right-14' : 'right-3'}`}>{CERT_MAP[course.id]}</div>
                  )}
                  {!course.free && (
                    <div className="absolute top-3 right-3 bg-accent-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-20" aria-label="需升級">
                      <Lock className="w-3 h-3" aria-hidden />
                      {tier === 'free' && proTrialAllowed && proTrialRemaining >= 0 ? `試用 ${proTrialRemaining} 次` : 'PRO'}
                    </div>
                  )}
                  {/* AUDIT #2：Pro 鎖定課程 CTA「升級解鎖」與免費「開始」視覺區分 — 鎖定區主 CTA 按鈕樣式 */}
                  {/* E20：Pro 課程未訂閱時 paywall 與 CTA 連 /pricing */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10" aria-label="需升級解鎖">
                      <Lock className="w-8 h-8 text-primary-400" aria-hidden />
                      <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm border border-primary-400/50 shadow-lg games-focus-ring"
                      >
                        升級解鎖
                      </Link>
                      {tier === 'free' && proTrialAllowed && proTrialRemaining >= 0 && (
                        <span className="text-white/60 text-xs">試用剩餘 {proTrialRemaining} 次</span>
                      )}
                    </div>
                  )}
                  {/* Phase 1 D1.2: 課程封面 hover 播放圖示放大動畫 */}
                  {/* 151–155：預覽圖；AUDIT #14 課程封面 previewImage 為 null 時用佔位（漸層+icon） */}
                  <div className={`aspect-video w-full rounded-t-2xl bg-gradient-to-br ${course.color} flex items-center justify-center relative overflow-hidden group/cover`} aria-hidden>
                    <course.icon className="w-12 h-12 text-white/80 transition-transform duration-300 group-hover/cover:scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-xl transition-all duration-300 group-hover/cover:bg-black/30" aria-hidden>
                      <motion.div 
                        className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50"
                        whileHover={{
                          scale: 1.15,
                          backgroundColor: 'rgba(255,255,255,0.4)',
                          transition: { duration: 0.2, ease: 'easeOut' }
                        }}
                      >
                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${course.color} shrink-0`}>
                      <course.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="home-heading-3 text-white leading-snug">{highlightQuery(course.title, deferredSearch)}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-medium">
                          {LEVEL_LABELS[course.level]}
                        </span>
                        {course.level === 'expert' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300" title="深度內容">深度</span>
                        )}
                        {PREREQ_MAP[course.id] && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/90 max-w-[120px] truncate" title={`建議先完成：${PREREQ_MAP[course.id]}`}>
                            先修：{PREREQ_MAP[course.id]}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm mb-3 line-clamp-2">{highlightQuery(course.description, deferredSearch)}</p>
                      {/* AUDIT #41：每門課自訂「適合誰」或依 level 回退 */}
                      <p className="text-white/40 text-xs mb-2">{course.targetAudience ?? `適合：${LEVEL_LABELS[course.level]}者`}</p>
                      {/* 155 課程評分：來自評分資料源 getCourseRating，無則用 course.rating */}
                      {(() => {
                        const displayRating = getCourseRating(course.id) ?? course.rating
                        return displayRating != null ? (
                          <div className="flex items-center gap-1 mb-2 text-primary-400" title="學員評價">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{displayRating}</span>
                            <span className="text-white/40 text-xs">評價</span>
                          </div>
                        ) : null
                      })()}
                      <div className="flex items-center gap-3 flex-wrap text-sm text-white/60">
                        <span className="font-medium">{course.lessons} 課</span>
                        <span className="text-white/40">•</span>
                        <span>預計 {course.estimatedMinutes ?? course.duration} 分鐘</span>
                        {progressPct > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary-400 font-medium">已完成 {progressPct}%</span>
                          </>
                        )}
                      </div>
                      {/* Phase 1 D2.1: 進度環形圖與進度條動畫增強 */}
                      {/* F72 進度環形圖；AUDIT #23 進度環 role="progressbar" aria-valuenow */}
                      {progressPct > 0 && (
                        <motion.div 
                          className="mt-2 flex items-center gap-2" 
                          role="progressbar" 
                          aria-valuenow={progressPct} 
                          aria-valuemin={0} 
                          aria-valuemax={100} 
                          aria-label={`已完成 ${progressPct}%`}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <motion.div 
                            className="relative w-7 h-7 shrink-0" 
                            aria-hidden
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 32 32">
                              <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
                              <motion.circle 
                                cx="16" 
                                cy="16" 
                                r="14" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                strokeDasharray={`${(progressPct / 100) * 88} 88`} 
                                className="text-primary-500" 
                                strokeLinecap="round"
                                initial={{ strokeDasharray: '0 88' }}
                                animate={{ strokeDasharray: `${(progressPct / 100) * 88} 88` }}
                                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                              />
                            </svg>
                            <motion.span 
                              className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5, duration: 0.3 }}
                            >
                              {progressPct}%
                            </motion.span>
                          </motion.div>
                          {progressPct < 100 && (
                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                              <motion.div 
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                              />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              )}
              </InViewAnimate>
            )
          })}
                </div>
              </section>
            )
          })}
        </div>
        </div>
        </>
        )}

        {/* 12 跨課程關聯推薦：依學習路徑與同類型 */}
        {filteredCourses.length > 0 && (() => {
          const inGrid = new Set(filteredCourses.map((c) => c.id))
          const completed = new Set(LEARNING_PATH.filter((cid) => {
            const p = progress[cid]
            const total = COURSES.find((c) => c.id === cid)?.lessons ?? 0
            return total > 0 && p && p.completed >= total
          }))
          const nextInPath = LEARNING_PATH.find((cid) => !completed.has(cid) && !inGrid.has(cid))
          const sameLevel = COURSES.filter((c) => !inGrid.has(c.id) && c.level === (filteredCourses[0]?.level ?? 'beginner'))
          const recommended = nextInPath
            ? [COURSES.find((c) => c.id === nextInPath), ...sameLevel.filter((c) => c.id !== nextInPath).slice(0, 1)].filter(Boolean) as typeof COURSES
            : sameLevel.slice(0, 2)
          if (recommended.length === 0) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <p className="text-white/70 text-sm mb-3">推薦課程（F80 水平滾動）</p>
              <div className="flex overflow-x-auto gap-3 pb-2 -mx-1 scrollbar-hide">
                {recommended.map((c) => (
                  <Link
                    key={c.id}
                    href={`/learn/${c.id}`}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium"
                  >
                    {c.title}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )
        })()}

        {/* 15 課程完成後下一堂建議 */}
        {nextCourseSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-primary-500/15 border border-primary-500/30"
          >
            <p className="text-white/70 text-sm mb-2">已完成上一堂？建議下一堂：</p>
            <Link
              href={`/learn/${nextCourseSuggestion.id}`}
              className="inline-flex items-center gap-2 font-semibold text-primary-300 hover:text-primary-200"
            >
              {nextCourseSuggestion.title}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Featured Course Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-purple-600">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">葡萄酒入門</h2>
              <p className="text-white/60 text-sm">免費課程 • 8課 • 45分鐘</p>
            </div>
          </div>

          <div className="space-y-2">
            {WINE_BASICS_LESSONS.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                    {lesson.id}
                  </div>
                  <div>
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-sm text-white/50">{lesson.duration}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/learn/wine-basics" className="btn-primary inline-block min-h-[48px] px-6 py-3 games-focus-ring">
              開始學習
            </Link>
          </div>
        </motion.div>

        {/* 161–165 排行榜（僅自己，可後端擴充） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Trophy className="w-5 h-5 text-primary-400" />
              學習排行榜
            </h3>
            <button
              type="button"
              onClick={() => refreshStats()}
              className="min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10"
              aria-label="重新整理排行榜"
            >
              重新整理
            </button>
          </div>
          {/* Phase 1 D2.2: 學習排行榜動畫增強 - 逐項彈出 + hover 效果 */}
          <div className="space-y-2">
            <AnimatePresence>
              {leaderboard.slice(0, 5).map((e, index) => (
                <motion.div
                  key={e.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    x: 5,
                    transition: { duration: 0.2 } 
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 games-focus-ring ${
                    e.isCurrentUser ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-white/5 hover:bg-white/10'
                  } ${e.rank === 1 ? 'ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/20' : ''} ${e.rank === 2 ? 'ring-1 ring-slate-300/50' : ''} ${e.rank === 3 ? 'ring-1 ring-amber-700/50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <motion.span 
                      className="text-2xl w-8 text-center"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: index * 0.08 + 0.2,
                        type: 'spring', 
                        stiffness: 200,
                        damping: 15
                      }}
                    >
                      {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : `#${e.rank}`}
                    </motion.span>
                    <span className="text-white/70 font-medium">{e.name}</span>
                  </div>
                  <motion.span 
                    className="text-primary-400 font-semibold flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 + 0.3 }}
                  >
                    <Target className="w-4 h-4" />
                    {e.points} 分
                  </motion.span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 91 學習成就分享卡片；92 邀請好友；93 學習進度分享 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          {badges.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.origin + '/learn' : 'https://cheersin.app/learn'
                const labels = badges.map((id) => BADGE_LABELS[id] ?? id).join('、')
                const text = `我在 Cheersin 解鎖了 ${badges.length} 個成就：${labels}`
                navigator.clipboard?.writeText(`${text}\n${url}`).then(() => {
                  setShareAchieveToast(true)
                  setTimeout(() => setShareAchieveToast(false), 2500)
                }).catch(() => {})
              }}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
              aria-label="複製成就分享文字"
            >
              <Share2 className="w-4 h-4" />
              分享成就
            </button>
          )}
          {(Object.keys(progress).filter((cid) => {
            const p = progress[cid]
            const total = COURSES.find((c) => c.id === cid)?.lessons ?? 0
            return total > 0 && p && p.completed >= total
          }).length > 0 || learnMinutes > 0) && (
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.origin + '/learn' : 'https://cheersin.app/learn'
                const done = Object.keys(progress).filter((cid) => {
                  const p = progress[cid]
                  const total = COURSES.find((c) => c.id === cid)?.lessons ?? 0
                  return total > 0 && p && p.completed >= total
                }).length
                const text = `我在 Cheersin 完成了 ${done} 堂課${learnMinutes > 0 ? `，累計學習 ${learnMinutes} 分鐘` : ''}！`
                navigator.clipboard?.writeText(`${text}\n${url}`).then(() => {
                  setShareProgressToast(true)
                  setTimeout(() => setShareProgressToast(false), 2500)
                }).catch(() => {})
              }}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
              aria-label="複製學習進度分享文字"
            >
              <Share2 className="w-4 h-4" />
              分享進度
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.origin + '/learn' : 'https://cheersin.app/learn'
              const text = '一起來 Cheersin 學品酒！'
              navigator.clipboard?.writeText(`${text}\n${url}`).then(() => {
                setInviteToast(true)
                setTimeout(() => setInviteToast(false), 2500)
              }).catch(() => {})
            }}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
            aria-label="複製邀請連結"
          >
            <UserPlus className="w-4 h-4" />
            邀請好友學品酒
          </button>
        </motion.div>
        {/* 33 Toast 位置統一：fixed bottom-24 */}
        {(inviteToast || shareProgressToast || shareAchieveToast) && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-primary-500/90 text-white text-sm font-medium shadow-lg" role="status">
            {shareAchieveToast ? '已複製成就分享' : shareProgressToast ? '已複製學習進度' : '已複製邀請連結'}
          </div>
        )}

        {/* 40 返回頂部 */}
        {showBackTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-4 z-40 min-h-[48px] min-w-[48px] rounded-full bg-primary-500/90 text-white shadow-lg hover:bg-primary-500 flex items-center justify-center print:hidden"
            aria-label="返回頂部"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 card bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-center"
        >
          <h3 className="text-xl font-bold mb-2">解鎖所有課程 🔓</h3>
          <p className="text-white/70 mb-4">
            升級 PRO 會員，享受完整的酒類學習體驗
          </p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">NT$199</div>
              <div className="text-sm text-white/50">基礎方案/月</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">NT$499</div>
              <div className="text-sm text-white/50">進階方案/月</div>
            </div>
          </div>
          <Link href="/pricing" className="btn-secondary mt-4 inline-block min-h-[48px] min-w-[48px] inline-flex items-center justify-center games-focus-ring rounded">
            立即升級
          </Link>
        </motion.div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="進階課程需 Pro 會員"
        description="清酒之道、精釀啤酒探索等進階課程僅限 Pro 會員。升級後即可解鎖全部課程。"
        requiredTier="premium"
      />
      
      {/* Phase 1 D1.7: 課程預覽 Modal */}
      <CoursePreviewModal
        course={previewCourse}
        isOpen={!!previewCourse}
        onClose={handleClosePreview}
        onStartLearning={handleStartLearning}
        onShowDetails={handleShowDetails}
      />
      </div>
    </main>
  )
}
