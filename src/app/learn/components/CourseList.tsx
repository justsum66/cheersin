'use client'

import { useState, useDeferredValue, type ReactNode } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Wine, GlassWater, Beer, Martini, Lock, Star, BookOpen, Bookmark, Trophy, Award, Search, UserPlus, Share2, Check, Target, Clock, Flame, Play, ChevronDown, ChevronUp, LayoutGrid, List, AlertCircle, FileQuestion, Network, Users, Sparkles, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { canAccessProCourse, canUseProTrial, getProTrialRemainingThisMonth, hasProBadge } from '@/lib/subscription'
import { UpgradeModal } from '@/components/UpgradeModal'
import { getBookmarks } from '@/lib/learn-bookmarks'
import { getPoints, getLeaderboard, getStreak, getLearnMinutes, getUnlockedBadges, BADGE_LABELS, getCompletedChapterToday, getWeeklyChapterCount, maybeUnlockHolidayBadge, getSommelierLevel, getFriendCompare, setFriendCompare, getLearnDailyGoal, setLearnDailyGoal, getChaptersCompletedToday, getLearnChaptersHistory } from '@/lib/gamification'
import { LEARN_COURSE_COUNT, FREE_LEARN_COURSES_COUNT } from '@/lib/learn-constants'
import { getCourseRating } from '@/lib/learn-course-ratings'
import { getActiveLaunchAnnouncements } from '@/config/announcements.config'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { preventNumberScrollOnWheel } from '@/hooks/usePreventNumberScroll'
import { CoursePreviewModal } from '@/components/learn/CoursePreviewModal'
import { useTranslation } from '@/contexts/I18nContext'

// Types
type CourseLevel = 'beginner' | 'intermediate' | 'expert'
type CourseTag = 'hot' | 'new' | 'essential' | 'quick'

interface Course {
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
  rating?: number
  tags?: CourseTag[]
  targetAudience?: string
}

// Constants
const PROGRESS_KEY = 'cheersin_learn_progress'
const TOTAL_COURSES = LEARN_COURSE_COUNT

const COURSES: Course[] = [
  {
    id: 'wine-basics',
    title: '葡萄酒入門',
    description: '從零開始認識葡萄酒的世界',
    icon: Wine,
    lessons: 10,
    duration: '50分鐘',
    estimatedMinutes: 50,
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
    lessons: 8,
    duration: '40分鐘',
    estimatedMinutes: 40,
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
    lessons: 6,
    duration: '35分鐘',
    estimatedMinutes: 35,
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
    lessons: 8,
    duration: '40分鐘',
    estimatedMinutes: 40,
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
    lessons: 12,
    duration: '70分鐘',
    estimatedMinutes: 70,
    color: 'from-purple-600 to-indigo-700',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.8,
  },
  {
    id: 'wine-food-pairing',
    title: '餐酒搭配',
    description: '完美搭配的藝術',
    icon: Wine,
    lessons: 8,
    duration: '45分鐘',
    estimatedMinutes: 45,
    color: 'from-rose-500 to-pink-600',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.7,
  },
  {
    id: 'sparkling-wines',
    title: '氣泡酒世界',
    description: '香檳、普羅塞克、卡瓦...',
    icon: Wine,
    lessons: 7,
    duration: '40分鐘',
    estimatedMinutes: 40,
    color: 'from-yellow-100 to-amber-300',
    free: false,
    previewImage: null,
    level: 'intermediate',
    rating: 4.6,
  },
  {
    id: 'whisky-advanced',
    title: '威士忌進階',
    description: '產區、蒸餾法與熟成奧秘',
    icon: GlassWater,
    lessons: 10,
    duration: '60分鐘',
    estimatedMinutes: 60,
    color: 'from-amber-700 to-orange-800',
    free: false,
    previewImage: null,
    level: 'expert',
    rating: 4.8,
  },
  {
    id: 'whisky-tasting',
    title: '威士忌品飲',
    description: '品鑑技巧與風味解析',
    icon: GlassWater,
    lessons: 6,
    duration: '35分鐘',
    estimatedMinutes: 35,
    color: 'from-orange-600 to-amber-700',
    free: false,
    previewImage: null,
    level: 'expert',
    rating: 4.7,
  },
  {
    id: 'scotch-whisky',
    title: '蘇格蘭威士忌',
    description: '單一麥芽、調和威士忌...',
    icon: GlassWater,
    lessons: 9,
    duration: '50分鐘',
    estimatedMinutes: 50,
    color: 'from-amber-800 to-yellow-900',
    free: false,
    previewImage: null,
    level: 'expert',
    rating: 4.9,
  },
]

// Course Card Component
const CourseCard = ({ course, userHasPro, hasFreeTrial, userCanAccess }: { 
  course: Course; 
  userHasPro: boolean; 
  hasFreeTrial: boolean; 
  userCanAccess: boolean;
}) => {
  const [showPreview, setShowPreview] = useState(false)
  const Icon = course.icon
  const rating = course.rating ?? getCourseRating(course.id)
  const allBookmarks = getBookmarks()
  const isBookmarked = allBookmarks.some((bk) => bk.courseId === course.id)

  return (
    <>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`group relative h-full min-h-[200px] rounded-2xl border overflow-hidden bg-glass-card-spotlight border-white/10 backdrop-blur-xl p-4 md:p-6 flex flex-col gap-4 shadow-glass-2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,0,0,0.3)] hover:border-primary-500/50 ${
          course.free ? '' : userCanAccess ? '' : 'opacity-70 grayscale hover:opacity-100 hover:grayscale-0'
        }`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${course.color} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex gap-1.5">
            {course.tags?.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-full ${
                  tag === 'hot'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : tag === 'new'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : tag === 'essential'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {tag === 'hot' ? '🔥熱門' : tag === 'new' ? '🆕新課' : tag === 'essential' ? '⭐必讀' : '⚡速成'}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-white">{course.title}</h3>
            {isBookmarked && <Bookmark className="w-4 h-4 text-amber-400" />}
          </div>
          
          <p className="text-white/70 text-sm mb-3">{course.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
            <div className="flex items-center gap-1">
              <FileQuestion className="w-3 h-3" />
              <span>{course.lessons} 堂課</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.duration}</span>
            </div>
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {course.targetAudience ? (
            <p className="text-xs text-white/50 italic mb-3">{course.targetAudience}</p>
          ) : (
            <p className="text-xs text-white/50 italic mb-3">
              {course.level === 'beginner' 
                ? '適合：入門者' 
                : course.level === 'intermediate' 
                ? '適合：進階者' 
                : '適合：專家'}
            </p>
          )}

          <div className="mt-auto pt-3 flex flex-wrap gap-2">
            {!userCanAccess && !course.free && (
              <span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-primary-500/90 to-accent-500/90 text-white font-bold">
                Pro 解鎖
              </span>
            )}
            
            <Link
              href={`/learn/${course.id}`}
              className={`flex-1 text-center py-2 px-3 rounded-xl font-medium transition-colors ${
                userCanAccess
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              }`}
              prefetch={false}
            >
              {userCanAccess ? '開始學習' : '解鎖課程'}
            </Link>
            
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors"
              aria-label={`預覽 ${course.title}`}
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      </m.div>

      {showPreview && (
        <CoursePreviewModal
          course={course}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onStartLearning={() => {}}
          onShowDetails={() => {}}
        />
      )}
    </>
  )
}

// Main Course List Component
export const CourseList = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'course' | 'trial' | 'pro'>('course')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { tier } = useSubscription()
  const { t } = useTranslation()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  
  const hasFreeTrial = canUseProTrial(tier)
  const proTrialRemaining = getProTrialRemainingThisMonth(tier)
  const userCanUseTrial = hasFreeTrial && proTrialRemaining > 0
  
  // Filter courses based on search query
  const filteredCourses = COURSES.filter(course => {
    if (!deferredSearchQuery) return true
    const query = deferredSearchQuery.toLowerCase()
    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  })

  const handleCourseClick = (course: Course) => {
    const userCanAccess = course.free || canAccessProCourse(tier) || (userCanUseTrial && course.id.startsWith('whisky'))
    
    if (course.free || userCanAccess) {
      router.push(`/learn/${course.id}`)
    } else {
      setUpgradeReason('course')
      setShowUpgradeModal(true)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <input
            type="text"
            placeholder={t('搜尋課程...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl border transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            aria-label="網格檢視"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl border transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            aria-label="清單檢視"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Course Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredCourses.map((course) => {
              const userCanAccess = course.free || canAccessProCourse(tier) || (userCanUseTrial && course.id.startsWith('whisky'))
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  userHasPro={canAccessProCourse(tier)}
                  hasFreeTrial={hasFreeTrial}
                  userCanAccess={userCanAccess}
                />
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredCourses.map((course) => {
              const userCanAccess = course.free || canAccessProCourse(tier) || (userCanUseTrial && course.id.startsWith('whisky'))
              return (
                <div
                  key={course.id}
                  className={`p-4 rounded-2xl border bg-glass-card-spotlight border-white/10 backdrop-blur-xl flex items-center gap-4 shadow-glass-2 ${
                    course.free ? '' : userCanAccess ? '' : 'opacity-70 grayscale'
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${course.color} text-white`}>
                    <course.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-white truncate">{course.title}</h3>
                      {course.tags?.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-1 rounded-full ${
                            tag === 'hot'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : tag === 'new'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : tag === 'essential'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {tag === 'hot' ? '🔥熱門' : tag === 'new' ? '🆕新課' : tag === 'essential' ? '⭐必讀' : '⚡速成'}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/70 text-sm truncate">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-white/60 mt-2">
                      <div className="flex items-center gap-1">
                        <FileQuestion className="w-3 h-3" />
                        <span>{course.lessons} 堂課</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!userCanAccess && !course.free && (
                      <span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-primary-500/90 to-accent-500/90 text-white font-bold">
                        Pro 解鎖
                      </span>
                    )}
                    
                    <button
                      onClick={() => handleCourseClick(course)}
                      className={`py-2 px-4 rounded-xl font-medium transition-colors ${
                        userCanAccess
                          ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                          : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {userCanAccess ? '開始學習' : '解鎖課程'}
                    </button>
                  </div>
                </div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier="premium"
      />
    </div>
  )
}