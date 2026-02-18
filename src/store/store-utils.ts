/**
 * Task #52: Zustand store utilities for best practices
 * - Shallow equality selectors to prevent unnecessary re-renders
 * - Dev-only devtools middleware
 */
import { useShallow } from 'zustand/react/shallow'
import { devtools } from 'zustand/middleware'
import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

/**
 * Re-export useShallow for convenient shallow comparison in selectors
 * Usage: const { players, gameState } = useGameStore(useShallow(s => ({ players: s.players, gameState: s.gameState })))
 */
export { useShallow }

/**
 * Wrap store creator with devtools in development only
 * Usage: create<T>()(withDevtools(storeFn, 'StoreName'))
 */
export function withDevtools<T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
  fn: StateCreator<T, [], Mos>,
  name: string
): StateCreator<T, [], Mos> {
  if (process.env.NODE_ENV === 'production') {
    return fn
  }
  return devtools(fn, { name, enabled: true }) as unknown as StateCreator<T, [], Mos>
}
