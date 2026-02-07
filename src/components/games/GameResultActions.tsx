'use client'

/**
 * DEDUP #13：遊戲結束「再來一局／返回大廳」共用區塊，統一 48px 觸控與焦點環
 * 各遊戲結果區可改用此組件，避免重複按鈕樣式與 aria
 */
interface GameResultActionsProps {
  /** 再來一局 callback */
  onRestart: () => void
  /** 返回大廳 callback（可選；不傳則不顯示返回鈕，由 GameWrapper 頂部返回即可） */
  onExit?: () => void
  /** 主按鈕文案，預設「再來一局」 */
  restartLabel?: string
  /** 次按鈕文案，預設「返回大廳」 */
  exitLabel?: string
  className?: string
}

export function GameResultActions({
  onRestart,
  onExit,
  restartLabel = '再來一局',
  exitLabel = '返回大廳',
  className = '',
}: GameResultActionsProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onRestart}
        className="btn-primary games-touch-target px-6 py-3 rounded-xl font-bold games-focus-ring"
        aria-label={restartLabel}
      >
        {restartLabel}
      </button>
      {onExit != null && (
        <button
          type="button"
          onClick={onExit}
          className="btn-secondary games-touch-target px-6 py-3 rounded-xl font-medium games-focus-ring"
          aria-label={exitLabel}
        >
          {exitLabel}
        </button>
      )}
    </div>
  )
}
