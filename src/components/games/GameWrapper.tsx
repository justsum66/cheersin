'use client'

import { createContext, useContext } from 'react'
import { m } from 'framer-motion'
import { scaleIn } from '@/lib/animations'
import { GameSessionProvider } from './GameSessionProvider'
import { GameSoundProvider } from './GameSoundProvider'
import { useGameWrapperLogic } from './useGameWrapperLogic'
import GameWrapperHeader from './GameWrapperHeader'
import GameWrapperBody from './GameWrapperBody'
import PassPhoneMode from './PassPhoneMode'
import { GameModeSelector } from './GameModeSelector'
import type { GameWrapperProps, SwitchGameItem } from './GameWrapperTypes'

/** 供子元件（如 GameRules）註冊規則內文；任務 18 改為點擊問號觸發 */
export const GameRulesContext = createContext<{ setRulesContent: (s: string | null) => void } | null>(null)
export function useGameRulesContext() {
  return useContext(GameRulesContext)
}

/** R2-001：Contexts have been migrated to useGameStore. 
 *  Removed re-exports of legacy contexts. 
 *  Components should use useGameStore directly.
 */

/** 任務 19：遊戲快捷鍵，子元件可註冊 Space 下一題 / 1-9 選項 */
export const GameHotkeyContext = createContext<{
  registerSpace: (fn: () => void) => () => void
  registerDigit: (digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, fn: () => void) => () => void
} | null>(null)
export function useGameHotkey() {
  return useContext(GameHotkeyContext)
}

/** AUDIT #26：遊戲內「簡化動畫」設定即時反映；使用者設定或系統 prefers-reduced-motion */
export const GameReduceMotionContext = createContext<boolean>(false)
export function useGameReduceMotion(): boolean {
  return useContext(GameReduceMotionContext)
}

/** 85 換遊戲快捷：傳入列表與回調，設定內可快速切換 */
export type { SwitchGameItem, GameWrapperProps } from './GameWrapperTypes'

export default function GameWrapper(props: GameWrapperProps) {
  const logic = useGameWrapperLogic(props)

  /* R2-001: Deep Refactor - Removed GameStateProvider & GameTimerProvider */
  /* Logic now uses useGameStore directly */

  return (
    <GameSessionProvider players={props.players ?? []}>
      <GameRulesContext.Provider value={{ setRulesContent: logic.setRulesContent }}>
        <GameSoundProvider>
          <GameReduceMotionContext.Provider value={logic.reducedMotion}>
            <GameHotkeyContext.Provider value={{ registerSpace: logic.registerSpace, registerDigit: logic.registerDigit }}>
              <m.div
                ref={logic.wrapperRef}
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={`relative w-full max-w-6xl mx-auto glass-card overflow-hidden flex flex-col ${logic.isFullscreen ? 'min-h-[100dvh]' : 'min-h-[min(600px,80vh)]'}`}
              >
                {logic.titleAnnouncement && (
                  <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{logic.titleAnnouncement}</div>
                )}
                <GameWrapperHeader {...logic.headerProps} />
                <GameWrapperBody
                  showReportModal={logic.showReportModal}
                  setShowReportModal={logic.setShowReportModal}
                  reportContext={logic.reportContext}
                  reportSubmitted={logic.reportSubmitted}
                  setReportSubmitted={logic.setReportSubmitted}
                  reportType={logic.reportType}
                  reportDesc={logic.reportDesc}
                  reportSending={logic.reportSending}
                  setReportSending={logic.setReportSending}
                  setReportType={logic.setReportType}
                  setReportDesc={logic.setReportDesc}
                  showTrialEndModal={logic.showTrialEndModal}
                  setShowTrialEndModal={logic.setShowTrialEndModal}
                  onExit={logic.onExit}
                  rulesContent={logic.rulesContent}
                  showRulesModal={logic.showRulesModal}
                  closeRulesModal={logic.closeRulesModal}
                  rulesModalRef={logic.rulesModalRef}
                  isPaused={logic.isPaused}
                  togglePause={logic.togglePause}
                  contentScale={logic.contentScale}
                  multiTouchActiveRef={logic.multiTouchActiveRef}
                  multiTouchClearTimerRef={logic.multiTouchClearTimerRef}
                  handleTouchStart={logic.handleTouchStart}
                  handleTouchEnd={logic.handleTouchEnd}
                  handleTouchMove={logic.handleTouchMove}
                  handleTouchStartPinch={logic.handleTouchStartPinch}
                  handleTouchEndPinch={logic.handleTouchEndPinch}
                  handleTouchStartThree={logic.handleTouchStartThree}
                  handleTouchMoveThree={logic.handleTouchMoveThree}
                  handleTouchEndThree={logic.handleTouchEndThree}
                  showCountdown={logic.showCountdown}
                  onCountdownComplete={logic.onCountdownComplete}
                  reducedMotion={logic.reducedMotion}
                >
                  {logic.children}
                </GameWrapperBody>
              </m.div>
              <PassPhoneMode />

              {logic.showModeSelector && (
                <GameModeSelector
                  modes={logic.availableModes}
                  onSelect={logic.onSelectMode}
                  onCancel={() => logic.onExit?.()}
                  title={props.title}
                />
              )}
            </GameHotkeyContext.Provider>
          </GameReduceMotionContext.Provider>
        </GameSoundProvider>
      </GameRulesContext.Provider>
    </GameSessionProvider>
  )
}
