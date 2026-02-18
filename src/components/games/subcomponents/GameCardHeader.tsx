import { memo } from 'react';
import { Crown, Heart, ChevronRight } from 'lucide-react';
import { m } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { FeatureIcon } from '@/components/ui/FeatureIcon';
import { Badge } from '@/components/ui/Badge';
import { highlightMatch } from '../utils';

interface GameCardHeaderProps {
  game: any;
  lineClampLines?: 1 | 2 | 3;
  handleHeartClick: (e: React.MouseEvent) => void;
  reducedMotion: boolean;
  searchQuery?: string;
}

const GameCardHeader = memo(({ 
  game, 
  lineClampLines = 2, 
  handleHeartClick,
  reducedMotion,
  searchQuery
}: GameCardHeaderProps) => {
  const lineClampClass = lineClampLines === 1 ? 'line-clamp-1' : lineClampLines === 3 ? 'line-clamp-3' : 'line-clamp-2';

  return (
    <>
      {/* P1-195：付費遊戲 Pro/皇冠角標；R2-191：本週免費時加標籤 */}
      {game.isPremium && (
        <span className="absolute top-2 right-2 z-20 inline-flex items-center gap-1.5 flex-wrap justify-end max-w-[70%]">
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
        <span className="absolute top-2 right-2 z-19 inline-flex px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] md:text-xs font-bold shadow-md" aria-label="含成人內容">18+</span>
      )}
      {game.hasAdultContent && game.isPremium && (
        <span className="absolute top-8 right-2 z-19 inline-flex px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] md:text-xs font-bold shadow-md" aria-label="含成人內容">18+</span>
      )}
      {/* GAMES_500 #111：熱門在右上、收藏在左上，不重疊；P1-123 / R2-071 New 標籤微閃爍 */}
      {game.isNew && !game.isPremium && (
        <span className="absolute top-2 right-2 z-18 animate-[pulse_2s_ease-in-out_infinite]">
          <Badge variant="accent" size="sm">{typeof window !== 'undefined' && (window as any).t ? (window as any).t('games.new') : 'NEW'}</Badge>
        </span>
      )}
      {/* R2-057：人氣標籤脈動吸引注意 */}
      {game.popular && !game.isNew && (
        <span className="absolute top-2 right-2 origin-center rotate-12 inline-flex px-2 py-0.5 rounded bg-secondary-500/90 text-secondary-950 text-[10px] font-bold uppercase tracking-wider shadow-md z-10 animate-[pulse_2.5s_ease-in-out_infinite]">
          {typeof window !== 'undefined' && (window as any).t ? (window as any).t('games.popular') : 'POPULAR'}
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
          {searchQuery && searchQuery.length >= 2
            ? highlightMatch(game.name, searchQuery)
            : game.name}
        </h3>
        <p className={`text-white/50 text-sm mb-3 ${lineClampClass} min-h-[2.5rem]`}>
          {searchQuery && searchQuery.length >= 2
            ? highlightMatch(game.description, searchQuery)
            : game.description}
        </p>
      </div>
    </>
  );
});

GameCardHeader.displayName = 'GameCardHeader';

export default GameCardHeader;