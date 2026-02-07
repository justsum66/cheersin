'use client'

import type { ReactNode } from 'react'
import { GamesProvider } from './GamesContext'
import { PassPhoneProvider } from './PassPhoneContext'
import { PunishmentProvider } from './Punishments/PunishmentContext'

/**
 * 遊戲階段統一 Provider：合併 Games（玩家名單 + 搖晃）、傳手機、懲罰轉盤狀態。
 * 單一入口，避免多層巢狀；hooks 仍從各自 Context 讀取（useGamesPlayers、usePassPhone、usePunishment）。
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
        <PunishmentProvider players={players}>
          {children}
        </PunishmentProvider>
      </PassPhoneProvider>
    </GamesProvider>
  )
}
