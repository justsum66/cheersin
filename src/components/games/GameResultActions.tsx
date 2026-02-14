'use client'

/**
 * DEDUP #13：遊戲結束「再來一局／返回大廳」共用區塊，統一 48px 觸控與焦點環
 * P0-010：可選「分享故事卡」一鍵產圖分享 IG/FB
 * R2-053：再來一局按鈕從底部彈入、輕微彈跳
 * i18n：預設使用 games.playAgain、gamesError.backLobby
 */
import { m } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import { ShareStoryCardButton } from './ShareStoryCardButton'

interface GameResultActionsProps {
  /** 再來一局 callback */
  onRestart: () => void
  /** 返回大廳 callback（可選；不傳則不顯示返回鈕，由 GameWrapper 頂部返回即可） */
  onExit?: () => void
  /** 主按鈕文案，預設 t('games.playAgain') */
  restartLabel?: string
  /** 次按鈕文案，預設 t('gamesError.backLobby') */
  exitLabel?: string
  /** P0-010：提供則顯示「分享故事卡」按鈕 */
  shareStoryCard?: { resultText: string; gameName?: string; subtitle?: string }
  className?: string
}

export function GameResultActions({
  onRestart,
  onExit,
  restartLabel,
  exitLabel,
  shareStoryCard,
  className = '',
}: GameResultActionsProps) {
  const { t } = useTranslation()
  const restartText = restartLabel ?? t('games.playAgain')
  const exitText = exitLabel ?? t('gamesError.backLobby')
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <m.button
        type="button"
        onClick={onRestart}
        className="btn-primary games-touch-target px-6 py-3 rounded-xl font-bold games-focus-ring"
        aria-label={restartText}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: [12, -4, 0] }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {restartText}
      </m.button>
      {shareStoryCard != null && (
        <ShareStoryCardButton
          resultText={shareStoryCard.resultText}
          gameName={shareStoryCard.gameName}
          subtitle={shareStoryCard.subtitle}
        />
      )}
      {onExit != null && (
        <button
          type="button"
          onClick={onExit}
          className="btn-secondary games-touch-target px-6 py-3 rounded-xl font-medium games-focus-ring"
          aria-label={exitText}
        >
          {exitText}
        </button>
      )}
    </div>
  )
}
