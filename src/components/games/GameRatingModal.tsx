import { useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Star } from 'lucide-react'
import { gamesWithCategory, getGameMeta } from '@/config/games.config'
import { incrementWeeklyPlay } from '@/modules/games/stats/weekly'
import { setGameRating } from '@/modules/games/user/favorites'
import type { SubscriptionTier } from '@/lib/subscription'
import { useGameReduceMotion } from './GameWrapper'

interface GameRatingModalProps {
    gameId: string | null
    ratingVariant: 0 | 1
    onClose: () => void
    onPlayNext: (id: string) => void
    tier: SubscriptionTier
}

export function GameRatingModal({
    gameId,
    ratingVariant,
    onClose,
    onPlayNext,
    tier
}: GameRatingModalProps) {
    const reducedMotion = useGameReduceMotion()
    // Logic to find next game
    const nextGame = (() => {
        if (!gameId) return undefined
        const idx = gamesWithCategory.findIndex((g) => g.id === gameId)
        // If found and not last, return next. Else if first is not current, return first.
        return idx >= 0 && idx < gamesWithCategory.length - 1
            ? gamesWithCategory[idx + 1]
            : gamesWithCategory[0]?.id !== gameId
                ? gamesWithCategory[0]
                : undefined
    })()

    // Analytics for show
    useEffect(() => {
        if (!gameId) return
        try {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'game_rating_modal_show', value: 1, id: `variant_${ratingVariant}` }),
            }).catch(() => { })
        } catch { /* noop */ }
    }, [gameId, ratingVariant])

    const handleRate = (stars: number) => {
        if (!gameId) return
        setGameRating(gameId, stars)
        try {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'game_rating_submit', value: stars, id: gameId ?? `variant_${ratingVariant}` }),
            }).catch(() => { })
        } catch { /* noop */ }
        onClose()
    }

    const handleSkip = () => {
        try {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'game_rating_skip', value: 1, id: `variant_${ratingVariant}` }),
            }).catch(() => { })
        } catch { /* noop */ }
        onClose()
    }

    if (!gameId) return null
    const meta = getGameMeta(gameId)
    if (!meta) return null

    return (
        <m.div
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <m.div
                initial={reducedMotion ? undefined : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reducedMotion ? undefined : { scale: 0.9, opacity: 0 }}
                transition={reducedMotion ? { duration: 0 } : undefined}
                className="bg-[#0a0a1a] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-white mb-2">
                    {ratingVariant === 0 ? '為剛才的遊戲評分' : '喜歡剛才的遊戲嗎？給個星'}
                </h3>
                <p className="text-white/60 text-sm mb-4">{meta.name}</p>
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                            key={stars}
                            type="button"
                            onClick={() => handleRate(stars)}
                            className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                            aria-label={`給 ${stars} 星`}
                        >
                            <Star className="w-8 h-8 text-secondary-400 hover:text-secondary-300 fill-secondary-500/50 hover:fill-secondary-400" />
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleSkip}
                    className="w-full min-h-[48px] rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium mb-3"
                >
                    略過
                </button>
                {/* R2-192：免費用戶顯示 Pro 統計預覽，引導升級 */}
                {tier === 'free' && (
                    <p className="text-white/40 text-xs mb-3 text-center">
                        升級 Pro 解鎖：勝率、連勝、完整遊戲統計
                    </p>
                )}
                {/* R2-209：下一款推薦遊戲 */}
                {nextGame && (
                    <button
                        type="button"
                        onClick={() => {
                            onPlayNext(nextGame.id)
                            onClose()
                        }}
                        className="w-full min-h-[48px] rounded-xl bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/40 text-primary-300 text-sm font-medium"
                    >
                        下一款推薦：{nextGame.name}
                    </button>
                )}
            </m.div>
        </m.div>
    )
}
