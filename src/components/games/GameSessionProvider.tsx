'use client'

import type { ReactNode } from 'react'
import { GamesProvider } from './GamesContext'
import { PassPhoneProvider } from './PassPhoneContext'
import { GamePunishmentProvider } from './GamePunishmentProvider'

/**
 * 遊戲階段統一 Provider：合併 Games（玩家名單 + 搖晃）、傳手機、懲罰轉盤狀態。
 * R2-001：懲罰改用 GamePunishmentProvider 命名。
 */
export function GameSessionProvider({
  players,
  children,
}: {
  players: string[]
  children: ReactNode
}) {
  return (
    <GamesProvider players={players}>
      <PassPhoneProvider players={players}>
        <GamePunishmentProvider players={players}>
          {children}
        </GamePunishmentProvider>
      </PassPhoneProvider>
    </GamesProvider>
  )
}
