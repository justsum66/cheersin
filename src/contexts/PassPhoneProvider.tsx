/**
 * 傳手機模式 Provider：統一入口，委派至 components/games 實作。
 * BACKLOG Phase 2c 基礎建設：全屏覆蓋、「我準備好了」、搖晃/音效由 PassPhoneMode 處理。
 */

export {
  PassPhoneProvider,
  usePassPhone,
  type PassPhoneState,
  type PassPhoneActions,
  type PlayerRoundStat,
} from '@/components/games/PassPhoneContext'
