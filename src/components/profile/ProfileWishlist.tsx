import Link from 'next/link'
import { m, Reorder } from 'framer-motion'
import { Heart, GripVertical, Wine, Trash2 } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import type { WishlistItem } from '@/hooks/useProfileData'

interface ProfileWishlistProps {
    wishlist: WishlistItem[]
    onReorder: (newOrder: WishlistItem[]) => void
    onRemove: (id: string) => void
}

export function ProfileWishlist({ wishlist, onReorder, onRemove }: ProfileWishlistProps) {
    const { t } = useTranslation()

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-8"
        >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                {t('profile.wishlist')}
            </h2>
            {wishlist.length === 0 ? (
                <p className="text-white/50 text-sm mb-4">{t('profile.wishlistEmpty')}</p>
            ) : (
                /* B5.2 拖曳排序願望清單 */
                <Reorder.Group axis="y" values={wishlist} onReorder={onReorder} className="space-y-3 mb-4">
                    {wishlist.map((w) => (
                        <Reorder.Item
                            key={w.id}
                            value={w}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 group cursor-grab active:cursor-grabbing"
                            whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' }}
                        >
                            <GripVertical className="w-4 h-4 text-white/30 shrink-0 touch-none" aria-hidden />
                            <Wine className="w-5 h-5 text-white/40 shrink-0" />
                            <span className="flex-1 min-w-0 text-white/90 truncate">{w.name}</span>
                            <span className="text-white/40 text-xs shrink-0">{w.type}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(w.id)}
                                className="p-2 min-h-[48px] min-w-[48px] rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 flex items-center justify-center games-focus-ring"
                                title={t('profile.remove')}
                                aria-label={t('profile.removeFromWishlist')}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}
            <Link href="/assistant" className="text-primary-400 hover:text-primary-300 text-sm min-h-[48px] inline-flex items-center games-focus-ring rounded">
                {t('profile.findWithAssistant')} &rarr;
            </Link>
        </m.div>
    )
}
