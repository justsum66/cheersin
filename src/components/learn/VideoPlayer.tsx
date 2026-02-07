'use client'

/**
 * 156 影片播放器：支援 video src 或 YouTube embed；無 src 時顯示佔位。
 * T016 P2：不做自動播放酒類影片 — 本站影片皆用戶觸發（無 autoplay），YouTube embed 不帶 autoplay=1。
 */
interface VideoPlayerProps {
  /** 影片 URL（mp4 等）或 YouTube 嵌入 URL */
  src?: string | null
  /** 標題（無障礙） */
  title?: string
  /** 16:9 容器 class */
  className?: string
}

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/

export default function VideoPlayer({ src, title = '課程影片', className = '' }: VideoPlayerProps) {
  if (!src?.trim()) {
    return (
      <div
        className={`aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${className}`}
        aria-hidden
      >
        <span className="text-white/40 text-sm">本節無影片</span>
      </div>
    )
  }

  const ytMatch = src.match(YOUTUBE_REGEX)
  const youtubeId = ytMatch?.[1]

  if (youtubeId) {
    return (
      <div className={`aspect-video w-full max-w-3xl rounded-xl overflow-hidden bg-black safe-area-px games-focus-ring ${className}`} data-video-player aria-label={`${title} 影片`}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          width={640}
          height={360}
        />
      </div>
    )
  }

  return (
    <div className={`aspect-video w-full max-w-3xl rounded-xl overflow-hidden bg-black safe-area-px games-focus-ring ${className}`} data-video-player aria-label={title}>
      <video
        src={src}
        title={title}
        controls
        width={640}
        height={360}
        className="w-full h-full object-contain [&::-webkit-media-controls-panel]:min-h-[48px] [&::-webkit-media-controls-play-button]:min-h-[48px] [&::-webkit-media-controls-play-button]:min-w-[48px]"
        preload="metadata"
      >
        您的瀏覽器不支援影片播放。
      </video>
    </div>
  )
}
