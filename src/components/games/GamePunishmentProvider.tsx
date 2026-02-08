'use client'

import type { ReactNode } from 'react'
import { PunishmentProvider } from './Punishments/PunishmentContext'

/** R2-001：懲罰狀態獨立 Provider；對外名稱與 GameState/GameTimer/GameSound 一致。實際邏輯在 PunishmentContext。 */
export function GamePunishmentProvider({ players, children }: { players: string[]; children: ReactNode }) {
  return <PunishmentProvider players={players}>{children}</PunishmentProvider>
}
