/** 85 換遊戲快捷：傳入列表與回調，設定內可快速切換 */
export interface SwitchGameItem {
  id: string
  name: string
}

export interface GameWrapperProps {
  title: string
  description?: string
  onExit: () => void
  children: React.ReactNode
  players?: string[]
  switchGameList?: SwitchGameItem[]
  onSwitchGame?: (id: string) => void
  currentGameId?: string | null
  shareInviteUrl?: string | null
  isSpectator?: boolean
  onPlayAgain?: () => void
  reportContext?: { roomSlug?: string; gameId?: string }
  isGuestTrial?: boolean
  trialRoundsMax?: number
  maxPlayers?: number
  onSkipRound?: () => void
  onRestart?: () => void
  anonymousMode?: boolean
  isHost?: boolean
  onToggleAnonymous?: (value: boolean) => Promise<{ ok: boolean; error?: string }>
}
