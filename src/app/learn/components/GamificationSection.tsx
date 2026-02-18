'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Award, 
  Flame, 
  Target, 
  Clock, 
  Trophy, 
  BookOpen, 
  Bookmark, 
  UserPlus, 
  Share2, 
  ChevronUp, 
  ChevronDown, 
  AlertCircle,
  Check,
  Star
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/contexts/I18nContext'
import { preventNumberScrollOnWheel } from '@/hooks/usePreventNumberScroll'
import { getPoints, getLeaderboard, getStreak, getLearnMinutes, getUnlockedBadges, BADGE_LABELS, getCompletedChapterToday, getWeeklyChapterCount, maybeUnlockHolidayBadge, getSommelierLevel, getFriendCompare, setFriendCompare, getLearnDailyGoal, setLearnDailyGoal, getChaptersCompletedToday, getLearnChaptersHistory } from '@/lib/gamification'
import { getBookmarks } from '@/lib/learn-bookmarks'

type ProgressEntry = { completed: number; total: number; completedAt?: string };

/** CLEAN: Proper types replacing `any` */
interface LeaderboardEntry { rank: number; name: string; points: number; isCurrentUser?: boolean }
interface BookmarkEntry { courseId: string; chapterId: string | number; courseTitle?: string; title?: string }
interface TimelineEntry { courseId: string; title: string; completedAt: string }
interface FriendCompare { nickname: string; completedCourses: number; updatedAt: string }

interface GamificationSectionProps {
  progress: Record<string, ProgressEntry>;
  refreshStats: () => void;
  showUpgrade?: boolean;
  setShowUpgrade?: (show: boolean) => void;
  showTaskSection?: boolean;
  showAchievementSection?: boolean;
  showFriendSection?: boolean;
  showBookmarkSection?: boolean;
  showTimelineSection?: boolean;
  taskOpen?: boolean;
  setTaskOpen?: (open: boolean) => void;
  achievementOpen?: boolean;
  setAchievementOpen?: (open: boolean) => void;
  friendOpen?: boolean;
  setFriendOpen?: (open: boolean) => void;
  bookmarkOpen?: boolean;
  setBookmarkOpen?: (open: boolean) => void;
  timelineOpen?: boolean;
  setTimelineOpen?: (open: boolean) => void;
  completedCourseCount?: number;
  sommelierLevel?: string;
  points?: number;
  learnMinutes?: number;
  streak?: { days: number; lastDate: string };
  badges?: string[];
  leaderboard?: LeaderboardEntry[];
  bookmarks?: BookmarkEntry[];
  timelineEntries?: TimelineEntry[];
  dailyDone?: boolean;
  weeklyCount?: number;
  dailyGoal?: number;
  chaptersToday?: number;
  heatmapHistory?: { date: string; count: number }[];
  friendCompare?: FriendCompare | null;
  setFriendCompareState?: (compare: FriendCompare | null) => void;
  inviteToast?: boolean;
  setInviteToast?: (toast: boolean) => void;
  shareProgressToast?: boolean;
  setShareProgressToast?: (toast: boolean) => void;
  shareAchieveToast?: boolean;
  setShareAchieveToast?: (toast: boolean) => void;
  shareFilterToast?: boolean;
  setShareFilterToast?: (toast: boolean) => void;
  friendNickname?: string;
  setFriendNickname?: (nickname: string) => void;
  friendCompleted?: string;
  setFriendCompleted?: (completed: string) => void;
  onRefreshStats?: () => void;
  onShareAchievements?: () => void;
  onShareProgress?: () => void;
  onInviteFriends?: () => void;
  setDailyGoal?: (goal: number) => void;
}

export default function GamificationSection({
  progress,
  refreshStats,
  showTaskSection = true,
  showAchievementSection = true,
  showFriendSection = true,
  showBookmarkSection = true,
  showTimelineSection = true,
  taskOpen = true,
  setTaskOpen,
  achievementOpen = true,
  setAchievementOpen,
  friendOpen = true,
  setFriendOpen,
  bookmarkOpen = true,
  setBookmarkOpen,
  timelineOpen = true,
  setTimelineOpen,
  completedCourseCount = 0,
  sommelierLevel = '',
  points = 0,
  learnMinutes = 0,
  streak = { days: 0, lastDate: '' },
  badges = [],
  leaderboard = [],
  bookmarks = [],
  timelineEntries = [],
  dailyDone = false,
  weeklyCount = 0,
  dailyGoal = 1,
  chaptersToday = 0,
  heatmapHistory = [],
  friendCompare = null,
  setFriendCompareState,
  inviteToast = false,
  setInviteToast,
  shareProgressToast = false,
  setShareProgressToast,
  shareAchieveToast = false,
  setShareAchieveToast,
  shareFilterToast = false,
  setShareFilterToast,
  friendNickname = '',
  setFriendNickname,
  friendCompleted = '',
  setFriendCompleted,
  onRefreshStats,
  onShareAchievements,
  onShareProgress,
  onInviteFriends,
  setDailyGoal,
}: GamificationSectionProps) {
  const { t } = useTranslation()
  
  const handleRefreshStats = () => {
    refreshStats()
    if (onRefreshStats) onRefreshStats()
  }

  const handleShareAchievements = () => {
    if (onShareAchievements) {
      onShareAchievements()
      return
    }
    
    const url = typeof window !== 'undefined' ? window.location.origin + '/learn' : 'https://cheersin.app/learn'
    const labels = badges.map((id) => (BADGE_LABELS as Record<string, string>)[id] ?? id).join('、')
    const text = `我在 Cheersin 解鎖了 ${badges.length} 個成就：${labels}`
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${url}`)
        .then(() => {
          if (setShareAchieveToast) setShareAchieveToast(true)
          setTimeout(() => {
            if (setShareAchieveToast) setShareAchieveToast(false)
          }, 2500)
        })
        .catch(() => {})
    }
  }

  const handleShareProgress = () => {
    if (onShareProgress) {
      onShareProgress()
      return
    }
    
    const url = typeof window !== 'undefined' ? window.location.origin + '/learn' : 'https://cheersin.app/learn'
    const done = Object.keys(progress).filter((cid) => {
      const p = progress[cid]
      // Completed courses have completed >= total (total stored in progress)
      return p && p.total > 0 && p.completed >= p.total
    }).length
    const text = `我在 Cheersin 完成了 ${done} 堂課${learnMinutes > 0 ? `，累計學習 ${learnMinutes} 分鐘` : ''}！`
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${url}`)
        .then(() => {
          if (setShareProgressToast) setShareProgressToast(true)
          setTimeout(() => {
            if (setShareProgressToast) setShareProgressToast(false)
          }, 2500)
        })
        .catch(() => {})
    }
  }

  const handleInviteFriends = () => {
    if (onInviteFriends) {
      onInviteFriends()
      return
    }
    
    const url = typeof window !== 'undefined' ? window.location.origin + '/learn' : 'https://cheersin.app/learn'
    const text = '一起來 Cheersin 學品酒！'
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${url}`)
        .then(() => {
          if (setInviteToast) setInviteToast(true)
          setTimeout(() => {
            if (setInviteToast) setInviteToast(false)
          }, 2500)
        })
        .catch(() => {})
    }
  }

  const handleAddFriend = () => {
    if (!setFriendCompareState || !setFriendNickname || !setFriendCompleted) return
    
    const nick = friendNickname.trim()
    const cnt = parseInt(friendCompleted, 10)
    if (nick && Number.isFinite(cnt) && cnt >= 0) {
      setFriendCompareState({ nickname: nick, completedCourses: cnt, updatedAt: '' })
      setFriendNickname('')
      setFriendCompleted('')
    }
  }

  const handleRemoveFriend = () => {
    if (setFriendCompareState) setFriendCompareState(null)
  }

  return (
    <>
      {/* Daily Tasks Section */}
      {showTaskSection && (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="mb-6">
          <button 
            type="button" 
            onClick={() => setTaskOpen && setTaskOpen(!taskOpen)} 
            className="flex items-center justify-between w-full text-left mb-2 py-2 rounded-lg hover:bg-white/5 transition-colors -mx-1 px-1" 
            aria-expanded={taskOpen}
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Target className="w-5 h-5 text-primary-400 shrink-0" />
              任務
            </h2>
            <span className="text-white/50 transition-transform duration-200">
              {taskOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {taskOpen && (
              <m.div
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
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      )}

      {/* Timeline Section */}
      {showTimelineSection && timelineEntries.length > 0 && (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
          <button 
            type="button" 
            onClick={() => setTimelineOpen && setTimelineOpen(!timelineOpen)} 
            className="flex items-center justify-between w-full text-left mb-3" 
            aria-expanded={timelineOpen}
          >
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
        </m.div>
      )}

      {/* Learning Reminder Section */}
      <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
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
              if (setDailyGoal) setDailyGoal(n)
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
      </m.div>

      {/* Leaderboard Section */}
      {leaderboard.length > 0 && (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
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
        </m.div>
      )}

      {/* LEARN-041: 學習分析儀表板 */}
      <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 border border-white/10">
        <h2 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-400" />
          學習分析
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-bold text-primary-300">{completedCourseCount}</p>
            <p className="text-xs text-white/50 mt-1">完成課程</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-bold text-amber-300">{learnMinutes}</p>
            <p className="text-xs text-white/50 mt-1">學習分鐘</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-bold text-green-300">{streak.days}</p>
            <p className="text-xs text-white/50 mt-1">連續天數</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-bold text-violet-300">{points}</p>
            <p className="text-xs text-white/50 mt-1">累計積分</p>
          </div>
        </div>
        {/* LEARN-041: 學習熱力圖 */}
        {heatmapHistory.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-white/40 mb-2">近 30 天學習熱力圖</p>
            <div className="flex flex-wrap gap-1">
              {heatmapHistory.slice(-30).map((h, i) => {
                const intensity = h.count === 0 ? 'bg-white/5' : h.count <= 1 ? 'bg-primary-500/20' : h.count <= 3 ? 'bg-primary-500/40' : 'bg-primary-500/70'
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${intensity}`}
                    title={`${h.date}: ${h.count} 章`}
                  />
                )
              })}
            </div>
          </div>
        )}
      </m.div>

      {/* Achievement Section */}
      {(badges.length > 0 || sommelierLevel) && showAchievementSection && (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
          <button 
            type="button" 
            onClick={() => setAchievementOpen && setAchievementOpen(!achievementOpen)} 
            className="flex items-center justify-between w-full text-left mb-3" 
            aria-expanded={achievementOpen}
          >
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
              {badges.map((id, index) => {
                const badgeIcons: Record<string, LucideIcon> = {
                  'first-quiz': Award,
                  'streak-7': Flame,
                  'games-10': Trophy,
                  'learn-1': BookOpen,
                  'wishlist-5': Bookmark,
                }
                const BadgeIcon = badgeIcons[id] || Award
                
                return (
                  <m.span
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
                    title={(BADGE_LABELS as Record<string, string>)[id] ?? id}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {(BADGE_LABELS as Record<string, string>)[id] ?? id}
                  </m.span>
                )
              })}
            </div>
          )}
        </m.div>
      )}

      {/* Friend Comparison Section */}
      {showFriendSection && (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
          <button 
            type="button" 
            onClick={() => setFriendOpen && setFriendOpen(!friendOpen)} 
            className="flex items-center justify-between w-full text-left mb-3" 
            aria-expanded={friendOpen}
          >
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
                      onClick={handleRemoveFriend}
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
                    {completedCourseCount > friendCompare.completedCourses ? '你領先！' : 
                     completedCourseCount < friendCompare.completedCourses ? '加油，繼續學習！' : '平分秋色'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={friendNickname}
                    onChange={(e) => setFriendNickname && setFriendNickname(e.target.value)}
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
                    onChange={(e) => setFriendCompleted && setFriendCompleted(e.target.value)}
                    onWheel={preventNumberScrollOnWheel}
                    placeholder="完成堂數"
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm w-20"
                    aria-label="好友完成堂數"
                  />
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-primary-500/30 hover:bg-primary-500/50 active:scale-[0.98] text-white text-sm font-medium transition-transform"
                  >
                    加入比較
                  </button>
                </div>
              )}
              <p className="text-white/40 text-xs">邀請好友一起學，輸入好友的完成堂數來比拼（最多 55 堂）</p>
            </div>
          )}
        </m.div>
      )}

      {/* Bookmarks Section */}
      {bookmarks.length > 0 && showBookmarkSection && (
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button 
            type="button" 
            onClick={() => setBookmarkOpen && setBookmarkOpen(!bookmarkOpen)} 
            className="flex items-center justify-between w-full text-left mb-3" 
            aria-expanded={bookmarkOpen} 
            aria-label={bookmarkOpen ? '收合我的書籤' : '展開我的書籤'}
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Bookmark className="w-5 h-5 text-primary-400" aria-hidden />
              我的書籤
            </h2>
            {bookmarkOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
          </button>
          {bookmarkOpen && (
            <div className="space-y-2">
              {bookmarks.slice(0, 5).map((b, i) => (
                <m.div
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
                    <span className="text-white/50"> · {t('common.chapterLabel', { n: b.chapterId })} {b.title}</span>
                  </Link>
                </m.div>
              ))}
            </div>
          )}
        </m.div>
      )}

      {/* Heatmap Section */}
      {heatmapHistory.length > 0 && (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
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
        </m.div>
      )}

      {/* Share Buttons */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex flex-wrap justify-center gap-3"
      >
        {badges.length > 0 && (
          <button
            type="button"
            onClick={handleShareAchievements}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
            aria-label="複製成就分享文字"
          >
            <Share2 className="w-4 h-4" />
            分享成就
          </button>
        )}
        {(Object.keys(progress).filter((cid) => {
          const p = progress[cid]
          return p && p.total > 0 && p.completed >= p.total
        }).length > 0 || learnMinutes > 0) && (
          <button
            type="button"
            onClick={handleShareProgress}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
            aria-label="複製學習進度分享文字"
          >
            <Share2 className="w-4 h-4" />
            分享進度
          </button>
        )}
        <button
          type="button"
          onClick={handleInviteFriends}
          className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
          aria-label="複製邀請連結"
        >
          <UserPlus className="w-4 h-4" />
          邀請好友學品酒
        </button>
      </m.div>

      {/* Toast Messages */}
      {(inviteToast || shareProgressToast || shareAchieveToast) && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-primary-500/90 text-white text-sm font-medium shadow-lg" role="status">
          {shareAchieveToast ? '已複製成就分享' : shareProgressToast ? '已複製學習進度' : '已複製邀請連結'}
        </div>
      )}
    </>
  )
}