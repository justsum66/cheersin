'use client'

import { m } from 'framer-motion'
import { scaleIn } from '@/lib/animations'
import { GlassCard } from '@/components/ui/GlassCard'
import GameWrapperHeader from '../GameWrapperHeader'
import GameWrapperBody from '../GameWrapperBody'
import PassPhoneMode from '../PassPhoneMode'
import { GameModeSelector } from '../GameModeSelector'
import type { GameWrapperProps } from '../GameWrapperTypes'

interface GameWrapperMainProps {
  logic: any;
  children: React.ReactNode;
  props: GameWrapperProps;
}

export default function GameWrapperMain({ logic, children, props }: GameWrapperMainProps) {
  return (
    <m.div
      ref={logic.wrapperRef}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={`relative w-full max-w-6xl mx-auto flex flex-col ${logic.isFullscreen ? 'min-h-[100dvh]' : 'min-h-[min(600px,80vh)]'}`}
    >
      <GlassCard className="w-full flex-1 flex flex-col overflow-hidden">
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
          {children}
        </GameWrapperBody>
      </GlassCard>
    </m.div>
  )
}