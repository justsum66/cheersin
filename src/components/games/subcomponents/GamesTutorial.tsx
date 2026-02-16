'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/contexts/I18nContext'

interface GamesTutorialProps {
  showTutorial: boolean
  roomSlug: string | null
  joinedDisplayName: string | null
  tutorialDontShowAgain: boolean
  setTutorialDontShowAgain: (dontShow: boolean) => void
  setShowTutorial: (show: boolean) => void
}

export function GamesTutorial({
  showTutorial,
  roomSlug,
  joinedDisplayName,
  tutorialDontShowAgain,
  setTutorialDontShowAgain,
  setShowTutorial
}: GamesTutorialProps) {
  const { t } = useTranslation()

  if (!showTutorial || (roomSlug && !joinedDisplayName)) {
    return null
  }

  return (
    <GlassCard variant="layer-2" className="mb-6 p-5 text-left border-primary-500/40" role="region" aria-label="使用教學">
      <p className="text-white font-medium mb-2">歡迎來到派對遊樂場！</p>
      <ul className="text-white/80 text-sm space-y-1 mb-4 list-disc list-inside">
        <li>點選下方遊戲卡片即可開始</li>
        <li>右上角「設定」可調音量與字級</li>
        <li>「管理玩家」可新增名單，供轉盤等遊戲使用</li>
      </ul>
      <label className="flex items-center gap-2 text-white/70 text-sm mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={tutorialDontShowAgain}
          onChange={(e) => setTutorialDontShowAgain(e.target.checked)}
          className="rounded border-white/30 text-primary-500 focus:ring-primary-400"
          aria-label="不再顯示此教學"
        />
        不再顯示此教學
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => {
            if (tutorialDontShowAgain) {
              try { localStorage.setItem('cheersin_games_tutorial_done', '1') } catch { /* ignore */ }
            }
            setShowTutorial(false)
          }}
          size="sm"
        >
          知道了
        </Button>
        <Button
          type="button"
          onClick={() => setShowTutorial(false)}
          variant="ghost"
          size="sm"
          aria-label="跳過教學"
        >
          跳過
        </Button>
      </div>
    </GlassCard>
  )
}