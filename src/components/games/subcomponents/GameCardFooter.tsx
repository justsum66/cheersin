import { memo } from 'react';
import { Users, HelpCircle } from 'lucide-react';
import { GAME_DIFFICULTY_LABELS, type GameDifficulty } from '@/config/games.config';
import { Badge } from '@/components/ui/Badge';
import StarRow from './StarRow';

interface GameCardFooterProps {
  game: any;
  displayLabel?: string;
  t: (key: string) => string;
}

const GameCardFooter = memo(({ game, displayLabel, t }: GameCardFooterProps) => {
  return (
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
          className={`inline-flex px-2 py-0.5 rounded text-[10px] ${
            game.difficulty === 'easy' 
              ? 'bg-emerald-500/20 text-emerald-300' 
              : game.difficulty === 'medium' 
                ? 'bg-amber-500/20 text-amber-300' 
                : 'bg-red-500/20 text-red-300'
          }`}
        >
          {GAME_DIFFICULTY_LABELS[game.difficulty as GameDifficulty]}
        </span>
      )}
      {game.estimatedMinutes != null && game.estimatedMinutes > 0 && (
        <span className="inline-flex px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/50 tabular-nums">
          約 {game.estimatedMinutes} 分鐘
        </span>
      )}
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono uppercase tracking-widest ${game.color === 'primary' ? 'bg-primary-500/15 border-primary-500/30 text-primary-300' : game.color === 'secondary' ? 'bg-secondary-500/15 border-secondary-500/30 text-secondary-300' : game.color === 'accent' ? 'bg-accent-500/15 border-accent-500/30 text-accent-300' : 'bg-white/10 border-white/10 text-white/50'}`}>
        <Users className="w-3.5 h-3.5 shrink-0" aria-hidden />
        {game.players}
      </span>
      {game.twoPlayerFriendly && (
        <Badge variant="secondary" size="sm" title="2 人即可玩">2 人可玩</Badge>
      )}
      <StarRow gameId={game.id} rating={game.rating} onRate={game.onRate} />
    </div>
  );
});

GameCardFooter.displayName = 'GameCardFooter';

export default GameCardFooter;