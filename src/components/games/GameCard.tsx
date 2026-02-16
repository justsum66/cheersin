'use client'

import { memo, useState, useEffect, useCallback } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'

import { ChevronRight, Users, Heart, Star, Share2, Crown, HelpCircle, type LucideIcon } from 'lucide-react'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { Badge } from '@/components/ui/Badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { GAME_DIFFICULTY_LABELS, type GameDifficulty } from '@/config/games.config'
import { GAMES_CARD_PLAYERS_I18N_KEY } from '@/lib/games-ui-constants'
import { useTranslation } from '@/contexts/I18nContext'

/** 卡片 hover 邊框漸變發光；顏色與遊戲主色呼應 */
const colorHoverGlow: Record<string, string> = {
  primary: 'group-hover:shadow-[0_0_20px_rgba(139,0,0,0.25)] group-hover:border-primary-500/50',
  secondary: 'group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:border-secondary-500/50',
  accent: 'group-hover:shadow-[0_0_20px_rgba(138,43,226,0.2)] group-hover:border-accent-500/50',
  white: 'group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:border-white/40',
}

export interface GameCardData {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  players: string
  category?: string
  popular?: boolean
  /** 任務 8：難度 */
  difficulty?: GameDifficulty
  /** 任務 9：每局約分鐘 */
  estimatedMinutes?: number
  /** 任務 4：是否收藏 */
  isFavorite?: boolean
  /** 任務 4：切換收藏（點心形不觸發 onSelect） */
  onToggleFavorite?: (id: string) => void
  /** 任務 10：1–5 星評分（顯示用） */
  rating?: number
  /** 任務 10：評分回調 */
  onRate?: (id: string, stars: number) => void
  /** T055 P1：免登入試玩遊戲，顯示「免費試玩」標籤 */
  isGuestTrial?: boolean
  /** AUDIT /games #10：兩人遊戲篩選「2 人」tab 已做，可於卡片上標示「2 人可玩」icon */
  twoPlayerFriendly?: boolean
  /** GAMES_500 #127：hover 時顯示的規則摘要（可選） */
  rulesSummary?: string
  /** P1-123：新遊戲標籤 */
  isNew?: boolean
  /** P1-195：付費功能角標（Pro/皇冠） */
  isPremium?: boolean
  /** R2-191：本週限時免費，與 isPremium 同時為 true 時顯示「本週免費」標籤 */
  isWeeklyFree?: boolean
  /** P1-118：點擊規則圖標時彈出 Modal 預覽規則 */
  onShowRules?: (game: { id: string; name: string; rulesSummary?: string }) => void
  /** Task 15: 顯示 18+ 內容標籤 */
  hasAdultContent?: boolean
  /** UI-33: 搜尋關鍵字高亮 */
  searchQuery?: string
}

/** GAMES_500 #115：描述 line-clamp 行數可配置，預設 2 */
interface GameCardProps {
  game: GameCardData
  index: number
  onSelect: (id: string) => void
  onKeyDown: (e: React.KeyboardEvent, index: number) => void
  buttonRef: (el: HTMLDivElement | null) => void
  displayLabel?: string
  lineClampLines?: 1 | 2 | 3
}

/** P1-119：星級 hover 描述（還不錯、強烈推薦等） */
const STAR_LABELS: Record<number, string> = {
  1: '很差',
  2: '普通',
  3: '還不錯',
  4: '推薦',
  5: '強烈推薦',
}

/** 任務 10：星級顯示/互動，1–5 星；GAMES_500 #120：0 星時可顯示「尚未評分」；P1-119 hover 顯示星級描述 */
function StarRow({ rating, onRate, gameId }: { rating?: number; onRate?: (id: string, stars: number) => void; gameId: string }) {
  const value = rating ?? 0
  if (!onRate) {
    if (value === 0) return null
    return (
      <span className="inline-flex items-center gap-0.5 text-secondary-400" aria-label={`評分 ${value} 星`} title={STAR_LABELS[value]}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-3.5 h-3.5 shrink-0 ${i <= value ? 'fill-current' : 'opacity-40'}`} aria-hidden />
        ))}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap" role="group" aria-label="評分">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={(e) => { e.stopPropagation(); onRate(gameId, i); }}
          onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
          className="games-touch-target flex items-center justify-center p-2 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 games-focus-ring"
          aria-label={`給 ${i} 星（${STAR_LABELS[i]}）`}
          title={STAR_LABELS[i]}
        >
          <Star className={`w-4 h-4 shrink-0 text-secondary-400 transition-colors ${i <= value ? 'fill-current' : 'opacity-40 hover:opacity-70'}`} />
        </button>
      ))}
      {value === 0 && <span className="text-white/40 text-[10px]">尚未評分</span>}
    </span>
  )
}

/** 純展示遊戲卡片，memo 避免 Lobby 篩選/搜尋時全列表 re-render；GAMES_500 #130 減少動畫時已關閉 hover/scale；#112 右鍵選單（收藏／評分／分享） */
function GameCardInner({ game, index, onSelect, onKeyDown, buttonRef, displayLabel, lineClampLines = 2 }: GameCardProps) {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  const lineClampClass = lineClampLines === 1 ? 'line-clamp-1' : lineClampLines === 3 ? 'line-clamp-3' : 'line-clamp-2'
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const closeMenu = useCallback(() => setContextMenu(null), [])
  /** P1-108：hover 顯示規則與評分覆蓋層；有 rulesSummary 或評分 UI 時顯示 */
  const showFlipOverlay = !reducedMotion && isHovered && (!!game.rulesSummary || !!game.onRate)
  useEffect(() => {
    if (!contextMenu) return
    const onGlobal = () => closeMenu()
    document.addEventListener('click', onGlobal)
    document.addEventListener('contextmenu', onGlobal)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onGlobal)
      document.removeEventListener('contextmenu', onGlobal)
      document.removeEventListener('keydown', onKey)
    }
  }, [contextMenu, closeMenu])
  const handleShare = useCallback(() => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/games?game=${encodeURIComponent(game.id)}` : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: game.name, text: game.description, url }).catch(() => {
        if (url) navigator.clipboard?.writeText(url)
      })
    } else if (url) {
      navigator.clipboard?.writeText(url)
    }
    closeMenu()
  }, [game.id, game.name, game.description, closeMenu])

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    game.onToggleFavorite?.(game.id)
  }

  return (
    <>
      {/* Phase 1 C5.2: Lobby 遊戲卡片 hover 深度效果增強 - 微妙 3D 傾角 + 深度陰影 */}
      {/* Phase 1 E3.3: virtual-scroll-card 優化長列表渲染性能 */}
      <m.div
        ref={buttonRef}
        role="listitem"
        tabIndex={0}
        onMouseMove={(e) => {
          if (reducedMotion) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          // Refined tilt calculation: smoother and more subtle
          // X rotation is based on Y position (tilt up/down)
          const rotateXVal = ((y - centerY) / centerY) * -3 // Max -3deg to 3deg
          // Y rotation is based on X position (tilt left/right)
          const rotateYVal = ((x - centerX) / centerX) * 3 // Max -3deg to 3deg

          // Directly animate to new values for responsiveness
          e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateXVal}deg) rotateY(${rotateYVal}deg) scale3d(1.02, 1.02, 1.02)`
        }}
        onMouseLeave={(e) => {
          setIsHovered(false)
          if (reducedMotion) return
          // Reset transform
          e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
        }}
        className={`virtual-scroll-card rounded-2xl text-left group relative h-full min-h-[180px] transition-all duration-300 outline-none cursor-pointer scroll-margin-block-[1.5rem] touch-feedback btn-icon-text-gap games-focus-ring`}
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out, box-shadow 0.3s ease' }}
        title={game.rulesSummary ?? game.name}
        onClick={() => onSelect(game.id)}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setContextMenu({ x: e.clientX, y: e.clientY })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(game.id)
          } else {
            onKeyDown(e, index)
          }
        }}
        aria-label={`進入遊戲：${game.name}，${game.players}，開始`}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
        }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      >
        <GlassCard
          variant="spotlight"
          className={`h-full p-4 md:p-6 flex flex-col gap-4 shadow-glass-2 transition-shadow duration-300 group-hover:shadow-xl group-hover:border-primary/30 ${colorHoverGlow[game.color] ?? ''}`}
        >
          {/* P1-195：付費遊戲 Pro/皇冠角標；R2-191：本週免費時加標籤 */}
          {game.isPremium && (
            <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1.5 flex-wrap justify-end max-w-[70%]">
              {game.isWeeklyFree && (
                <span className="inline-flex px-2 py-0.5 rounded-md bg-accent-500/90 text-white text-[10px] font-bold shadow-md" aria-label="本週限時免費">本週免費</span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-primary-500/90 to-accent-500/90 text-white text-[10px] font-bold shadow-md" aria-label="Pro 方案解鎖">
                <Crown className="w-3 h-3" /> Pro
              </span>
            </span>
          )}
          {/* Task 15: 18+ 標籤 - 與 Premium 並排或單獨顯示 */}
          {game.hasAdultContent && !game.isPremium && (
            <span className="absolute top-2 right-2 z-10 inline-flex px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-bold shadow-md" aria-label="含成人內容">18+</span>
          )}
          {game.hasAdultContent && game.isPremium && (
            <span className="absolute top-8 right-2 z-10 inline-flex px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-bold shadow-md" aria-label="含成人內容">18+</span>
          )}
          {/* GAMES_500 #111：熱門在右上、收藏在左上，不重疊；P1-123 / R2-071 New 標籤微閃爍 */}
          {game.isNew && !game.isPremium && (
            <span className="absolute top-2 right-2 z-10 animate-[pulse_2s_ease-in-out_infinite]">
              <Badge variant="accent" size="sm">{t('games.new')}</Badge>
            </span>
          )}
          {/* R2-057：人氣標籤脈動吸引注意 */}
          {game.popular && !game.isNew && (
            <span className="absolute top-2 right-2 origin-center rotate-12 inline-flex px-2 py-0.5 rounded bg-secondary-500/90 text-secondary-950 text-[10px] font-bold uppercase tracking-wider shadow-md z-10 animate-[pulse_2.5s_ease-in-out_infinite]">
              {t('games.popular')}
            </span>
          )}
          {/* GAMES_500 #110：免費試玩（accent）與 PRO 鎖定視覺區分 — 試玩用 accent，PRO 在 learn 課程卡 */}
          {game.isGuestTrial && (
            <span className="absolute top-10 right-2 inline-flex flex-col items-end gap-0.5 z-10" aria-label="可免費試玩，不需登入">
              <span className="inline-flex px-2 py-0.5 rounded bg-accent-500/90 text-white text-[10px] font-bold tracking-wider shadow-md">免費試玩</span>
              <span className="text-[9px] text-white/70">不需登入</span>
            </span>
          )}
          {/* 任務 4：收藏心形，左上角，點擊不觸發進入遊戲（不可用 button 包 button，故外層改為 div） */}
          {/* P1-173：收藏心形點擊時跳動動畫 — whileTap 放大 + 心形 keyframe */}
          {game.onToggleFavorite != null && (
            <m.button
              type="button"
              onClick={handleHeartClick}
              className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/30 hover:bg-white/10 transition-colors games-touch-target flex items-center justify-center games-focus-ring"
              aria-label={game.isFavorite ? '移除收藏' : '加入收藏'}
              whileTap={reducedMotion ? undefined : { scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <m.span
                key={game.isFavorite ? 'on' : 'off'}
                initial={reducedMotion ? false : { scale: 1 }}
                animate={reducedMotion ? {} : game.isFavorite ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="inline-block"
              >
                <Heart className={`w-4 h-4 ${game.isFavorite ? 'fill-red-500 text-red-500' : 'text-white/60'}`} />
              </m.span>
            </m.button>
          )}
          {/* GAMES_500 #118 #129：icon 尺寸與 FeatureIcon 一致；間距 token */}
          {/* Phase 1 C5.2: 圖示 hover 放大 + 右上箭頭淡入 */}
          <div className="flex justify-between items-start btn-icon-text-gap">
            <m.div
              className="flex items-center gap-2"
              whileHover={reducedMotion ? undefined : {
                scale: 1.08,
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
            >
              <FeatureIcon icon={game.icon} size="md" color={game.color as 'primary' | 'secondary' | 'accent' | 'white'} />
            </m.div>
            <m.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="-mr-2 -mt-2"
            >
              <div className="p-2 bg-white/10 rounded-full">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </m.div>
          </div>

          <div className="z-10 mt-auto">
            <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-primary-400 transition-colors duration-200 truncate" title={game.name}>
              {game.name}
            </h3>
            <p className={`text-white/50 text-sm mb-3 ${lineClampClass} min-h-[2.5rem]`}>{game.description}</p>
            {/* P0-11：主 CTA 使用 btn-secondary、觸控區域 ≥44px */}
            {/* Phase 1 B2.1: 按鈕增加 press scale 動畫 */}
            <span className="inline-flex items-center gap-2 btn-secondary btn-press-scale min-h-[48px] min-w-[44px] py-2 px-4 text-sm font-semibold rounded-xl mt-2 w-fit">
              <span>開始遊戲</span>
              <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
            </span>
            <div className="flex flex-wrap gap-1.5 items-center mt-3">
              {game.onShowRules != null && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); game.onShowRules?.({ id: game.id, name: game.name, rulesSummary: game.rulesSummary }); }}
                  className="games-touch-target inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs games-focus-ring"
                  aria-label="預覽遊戲規則"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> 規則
                </button>
              )}
              {game.category && displayLabel && (
                <Badge variant="default" size="sm">{displayLabel}</Badge>
              )}
              {game.difficulty != null && (
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] ${game.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' : game.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                    }`}
                >
                  {GAME_DIFFICULTY_LABELS[game.difficulty]}
                </span>
              )}
              {game.estimatedMinutes != null && game.estimatedMinutes > 0 && (
                <span className="inline-flex px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/50 tabular-nums">
                  約 {game.estimatedMinutes} 分鐘
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono uppercase tracking-widest ${game.color === 'primary' ? 'bg-primary-500/15 border-primary-500/30 text-primary-300' : game.color === 'secondary' ? 'bg-secondary-500/15 border-secondary-500/30 text-secondary-300' : game.color === 'accent' ? 'bg-accent-500/15 border-accent-500/30 text-accent-300' : 'bg-white/10 border-white/10 text-white/50'}`} data-i18n-key={GAMES_CARD_PLAYERS_I18N_KEY}>
                <Users className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {game.players}
              </span>
              {game.twoPlayerFriendly && (
                <Badge variant="secondary" size="sm" title="2 人即可玩">2 人可玩</Badge>
              )}
              <StarRow gameId={game.id} rating={game.rating} onRate={game.onRate} />
            </div>
          </div>
          {/* P1-108：hover 顯示規則與評分覆蓋層（背面效果） */}
          <AnimatePresence>
            {showFlipOverlay && (
              <m.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0a0a1a]/95 backdrop-blur-sm border border-white/10"
              >
                {game.rulesSummary && <p className="text-white/90 text-sm leading-relaxed text-center mb-2 line-clamp-4">{game.rulesSummary}</p>}
                <StarRow gameId={game.id} rating={game.rating} onRate={game.onRate} />
              </m.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </m.div >
      {contextMenu && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] min-w-[160px] rounded-xl border border-white/10 bg-[#1a0a2e] shadow-xl py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
          aria-label="卡片選單"
        >
          {game.onToggleFavorite != null && (
            <button type="button" role="menuitem" className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 games-touch-target games-focus-ring" onClick={() => { game.onToggleFavorite?.(game.id); closeMenu() }}>
              <Heart className={`w-4 h-4 shrink-0 ${game.isFavorite ? 'fill-red-500 text-red-500' : 'text-white/60'}`} />
              {game.isFavorite ? '移除收藏' : '加入收藏'}
            </button>
          )}
          {game.onRate != null && [1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" role="menuitem" className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 games-touch-target games-focus-ring" onClick={() => { game.onRate?.(game.id, star); closeMenu() }}>
              <Star className="w-4 h-4 shrink-0 text-secondary-400" /> 給 {star} 星
            </button>
          ))}
          <button type="button" role="menuitem" className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 games-touch-target games-focus-ring" onClick={handleShare}>
            <Share2 className="w-4 h-4 shrink-0" /> 分享
          </button>
        </div>,
        document.body
      )
      }
    </>
  )
}

export const GameCard = memo(GameCardInner)

/** GAMES_500 #124：卡片 loading 骨架與實際卡片佈局一致 */
export function GameCardSkeleton() {
  return (
    <div className="rounded-2xl glass-card-spotlight p-4 md:p-6 flex flex-col gap-4 h-full min-h-[180px] animate-pulse border border-white/10" role="status" aria-label="載入中">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-xl bg-white/10" />
        <div className="w-8 h-8 rounded-full bg-white/10" />
      </div>
      <div className="mt-auto space-y-2">
        <div className="h-6 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 rounded bg-white/10" />
          <div className="h-6 w-20 rounded bg-white/10" />
          <div className="h-6 w-24 rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}
