'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Heart, ExternalLink } from 'lucide-react'

export interface WineCardData {
  id: string
  name: string
  type: string
  region?: string
  country?: string
  description?: string
  /** 141 圖片 URL（無則用 placeholder） */
  imageUrl?: string | null
  /** 141 價格（顯示用，如 "NT$ 1,200"） */
  price?: string | null
  /** P1-085：價格範圍（如 "NT$ 800–1,200"） */
  priceRange?: string | null
  /** 141 評分 1–5 或 0–100 */
  rating?: number | null
  /** 143 購買連結 */
  buyLink?: string | null
  variety?: string
  tags?: string[]
}

interface WineCardProps {
  wine: WineCardData
  /** 142 加入願望清單 callback */
  onAddToWishlist?: (wine: WineCardData) => void
  /** 是否已加入願望清單 */
  inWishlist?: boolean
  /** 144 相似酒款（顯示於下方） */
  similar?: WineCardData[]
  /** 145 用戶評價（簡短一句） */
  review?: string | null
  /** UXUI 41：horizontal = 圖左資訊右；vertical = 圖上資訊下（預設） */
  variant?: 'vertical' | 'horizontal'
  className?: string
}

/** 141–145 酒款卡片：圖片/價格/評分/加入願望清單/購買連結/相似推薦/評價。memo 避免父層重繪時不必要 re-render */
const WineCardInner = function WineCard({
  wine,
  onAddToWishlist,
  inWishlist = false,
  similar = [],
  review,
  variant = 'vertical',
  className = '',
}: WineCardProps) {
  const rating = wine.rating != null ? (wine.rating <= 5 ? wine.rating : wine.rating / 20) : null

  /** WineRec-07/08/09：圖片 aspect-ratio RWD、願望清單鈕 48px、焦點環 */
  const imageBlock = (
    <div className={variant === 'horizontal' ? 'w-28 sm:w-36 shrink-0 aspect-square relative bg-white/5 rounded-t-xl overflow-hidden' : 'aspect-[4/3] relative bg-white/5 rounded-t-xl overflow-hidden'}>
      {wine.imageUrl ? (
        <Image
          src={wine.imageUrl}
          alt={wine.name}
          fill
          className="object-cover"
          sizes={variant === 'horizontal' ? '144px' : '(max-width: 400px) 100vw, 320px'}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-secondary-500/20 text-white/40 text-sm">
          {wine.type || '酒款'}
        </div>
      )}
      {rating != null && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 text-primary-400 text-sm font-medium tabular-nums">
          <Star className="w-4 h-4 fill-current" aria-hidden />
          {rating.toFixed(1)}
        </div>
      )}
      {onAddToWishlist && (
        <motion.button
          type="button"
          onClick={() => onAddToWishlist(wine)}
          className={`absolute top-2 left-2 p-2 games-touch-target rounded-full transition-colors flex items-center justify-center games-focus-ring ${
            inWishlist ? 'bg-primary-500/80 text-white' : 'bg-black/50 text-white/70 hover:text-primary-400'
          }`}
          title="加入願望清單"
          aria-label={inWishlist ? '已加入願望清單' : '加入願望清單'}
          whileTap={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} aria-hidden />
        </motion.button>
      )}
    </div>
  )

  /** WineRec-08/16：標題/描述 truncate、line-clamp；P1-085 視覺層次：標題 > 產區 > 評分區 > 價格區 > 描述 > 操作 */
  const infoBlock = (
    <div className={variant === 'horizontal' ? 'flex-1 min-w-0 p-4 flex flex-col justify-center' : 'p-4'}>
      <h3 className="font-display font-bold text-white text-lg mb-1 truncate" title={wine.name}>{wine.name || '酒款'}</h3>
      <p className="text-white/50 text-xs mb-2 truncate">
        {[wine.region, wine.country].filter(Boolean).join(' · ')}
        {wine.variety ? ` · ${wine.variety}` : ''}
      </p>
      {rating != null && (
        <p className="flex items-center gap-1.5 text-primary-400 text-sm font-medium mb-2" aria-label={`評分 ${rating.toFixed(1)}`}>
          <Star className="w-4 h-4 fill-current shrink-0" aria-hidden />
          <span className="tabular-nums">{rating.toFixed(1)}</span>
          <span className="text-white/40 text-xs font-normal">評分</span>
        </p>
      )}
      {(wine.price != null && wine.price !== '') && (
        <p className="text-primary-400 font-semibold text-sm mb-0.5 tabular-nums">{wine.price}</p>
      )}
      {wine.priceRange != null && wine.priceRange !== '' && !(wine.price != null && wine.price !== '') && (
        <p className="text-primary-400/90 font-medium text-sm mb-0.5 tabular-nums">{wine.priceRange}</p>
      )}
      {(wine.description != null && wine.description !== '') && (
        <p className="text-white/70 text-sm mb-2 line-clamp-2 leading-relaxed">{wine.description}</p>
      )}
      {review && (
        <p className="text-white/60 text-xs italic mb-2 line-clamp-2">「{review}」</p>
      )}
      {wine.buyLink && !wine.buyLink.startsWith('javascript:') && (
        <a
          href={wine.buyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 games-touch-target text-primary-400 text-sm font-medium hover:text-primary-300 games-focus-ring rounded"
          aria-label="購買連結（開新分頁）"
        >
          購買連結
          <ExternalLink className="w-3 h-3" aria-hidden />
        </a>
      )}
    </div>
  )

  /** WineRec-06/10：卡片 max-w 不溢出、列表 RWD；WineRec-20 ARIA */
  return (
    <article className={`glass-card overflow-hidden transition-shadow duration-300 hover:shadow-glass-hover max-w-full min-w-0 ${className}`} aria-label={`酒款：${wine.name}`}>
      <div className={variant === 'horizontal' ? 'flex flex-row' : ''}>
        {imageBlock}
        {infoBlock}
      </div>
      {similar.length > 0 && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-white/40 text-xs mb-2">相似推薦</p>
          <div className="flex flex-wrap gap-2">
            {similar.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                href={`/assistant?q=${encodeURIComponent(s.name)}`}
                className="px-2 py-1 games-touch-target inline-flex items-center rounded-lg bg-white/5 text-white/70 text-xs hover:bg-white/10 games-focus-ring"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

export const WineCard = memo(WineCardInner)
