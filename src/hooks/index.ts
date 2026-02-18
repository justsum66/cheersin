/**
 * CLEAN-025: Tree-shaking friendly barrel exports for hooks.
 * All hooks use named exports for optimal bundle splitting.
 */

// Core UI hooks
export { useDebounce } from './useDebounce'
export { useThrottle } from './useThrottle'
export { useLocalStorage } from './useLocalStorage'
export { usePrefersReducedMotion } from './usePrefersReducedMotion'
export { useFocusTrap } from './useFocusTrap'
export { useAccordion } from './useAccordion'
export { useLazyLoad } from './useLazyLoad'
export { useKeyboardShortcuts } from './useKeyboardShortcuts'
export { useForm } from './useForm'

// Game hooks
export { useGameState } from './useGameState'
export { useGamePersistence } from './useGamePersistence'
export { useGameLogic } from './useGameLogic'
export { useGameSound } from './useGameSound'
export { useGameRoom } from './useGameRoom'
export { useHaptic } from './useHaptic'
export { usePunishmentCopy } from './usePunishmentCopy'
export { useTournament } from './useTournament'
export { useCountdown, useTurnManager, useScoreTracker, usePhase } from './useGameShared'

// Feature hooks
export { useSubscription } from './useSubscription'
export { useProfileData } from './useProfileData'
export { useLimits } from './useLimits'
export { useWishlist } from './useWishlist'
export { usePolling } from './usePolling'
export { useCopyInvite } from './useCopyInvite'
export { useShake } from './useShake'
export { useAppBadge } from './useAppBadge'
export { useInAppReview } from './useInAppReview'
export { useFeedback } from './useFeedback'

// Assistant hooks
export { useAssistantChat } from './useAssistantChat'
export { useAssistantHistory } from './useAssistantHistory'

// Party/Script Murder hooks
export { usePartyRoomState } from './usePartyRoomState'
export { usePartyRoomRealtime } from './usePartyRoomRealtime'
export { useScriptMurderState } from './useScriptMurderState'
export { useScriptMurderRoom } from './useScriptMurderRoom'
export { useScriptMurderRealtime } from './useScriptMurderRealtime'
