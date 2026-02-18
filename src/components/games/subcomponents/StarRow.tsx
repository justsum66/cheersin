import { memo } from 'react';
import { Star } from 'lucide-react';
import { type GameDifficulty } from '@/config/games.config';

interface StarRowProps {
  rating?: number;
  onRate?: (id: string, stars: number) => void;
  gameId: string;
}

/** 任務 10：星級顯示/互動，1–5 星；GAMES_500 #120：0 星時可顯示「尚未評分」；P1-119 hover 顯示星級描述 */
const StarRowComponent = memo(({ rating, onRate, gameId }: StarRowProps) => {
  const value = rating ?? 0;
  
  if (!onRate) {
    if (value === 0) return null;
    const STAR_LABELS: Record<number, string> = {
      1: '很差',
      2: '普通',
      3: '還不錯',
      4: '推薦',
      5: '強烈推薦',
    };
    return (
      <span className="inline-flex items-center gap-0.5 text-secondary-400" aria-label={`評分 ${value} 星`} title={STAR_LABELS[value]}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-3.5 h-3.5 shrink-0 ${i <= value ? 'fill-current' : 'opacity-40'}`} aria-hidden />
        ))}
      </span>
    );
  }
  
  const STAR_LABELS: Record<number, string> = {
    1: '很差',
    2: '普通',
    3: '還不錯',
    4: '推薦',
    5: '強烈推薦',
  };
  
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
  );
});

StarRowComponent.displayName = 'StarRow';

export default StarRowComponent;