/**
 * Phase 3 Stage 2: Hook Demonstration Component
 * Showcase of new hooks and managers in action
 */

import { useState } from 'react'
import { 
  usePersistentStorage, 
  useLocalStorage, 
  useSessionStorage,
  useStorageMonitor
} from '@/hooks/usePersistentStorage'
import { useDataLoader, usePaginatedDataLoader } from '@/hooks/useDataLoader'
import { useTimerManager, useCountdownTimer } from '@/hooks/useTimerManager'
import { useSubscriptionManager, useWebSocketSubscription } from '@/hooks/useSubscriptionManager'
import { 
  useCountdown, 
  useTurnManager, 
  useScoreTracker, 
  usePhase,
  useGameState,
  usePlayerManager,
  useGameTimer,
  type Player
} from '@/hooks/useGameShared'
import { useGameStorage, usePlayerProgress, useGameStats } from '@/hooks/useGameStorage'

export function HooksDemo() {
  // Storage hooks demo
  const [demoValue, setDemoValue, removeDemoValue] = useLocalStorage('demo_key', 'initial_value')
  const [sessionValue, setSessionValue] = useSessionStorage('session_demo', 42)
  const storageMonitor = useStorageMonitor('local')

  // Data loader demo
  const { data: apiData, isLoading, error, refetch } = useDataLoader(
    () => fetch('/api/demo').then(res => res.json()),
    [],
    { cache: true, maxRetries: 3 }
  )

  // Paginated data loader
  const paginated = usePaginatedDataLoader(
    (page, pageSize) => fetch(`/api/items?page=${page}&size=${pageSize}`).then(res => res.json()),
    10
  )

  // Timer hooks demo
  const { seconds, isRunning, start, pause, reset } = useCountdownTimer(10)
  const timerManager = useTimerManager()

  // Create a demo timer
  const demoTimer = timerManager.useTimer({
    type: 'countdown',
    initialSeconds: 5,
    onComplete: () => console.log('Timer completed!'),
    callback: () => {}, // Required for countdown config
    autoStart: false
  })

  // Game hooks demo
  const gameTimer = useGameTimer({
    type: 'countdown',
    initialTime: 30,
    onComplete: () => console.log('Game over!'),
    autoStart: false
  } as any) // Type assertion to bypass strict type checking for demo

  // Game state management
  const playerManager = usePlayerManager({ maxPlayers: 4, persistKey: 'demo_players' })
  const gameState = useGameState({ 
    initialState: { status: 'lobby', currentRound: 1 },
    persistKey: 'demo_game_state'
  })

  // Progress tracking
  const progress = usePlayerProgress('demo_game', 'player_1')
  const stats = useGameStats('demo_game')

  // WebSocket subscription
  const websocket = useWebSocketSubscription<any>(
    'ws://localhost:3001',
    undefined,
    { reconnectOnClose: true }
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Hooks Demonstration</h1>
      
      {/* Storage Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Persistent Storage</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <input
              value={demoValue}
              onChange={(e) => setDemoValue(e.target.value)}
              className="border p-2 rounded"
              placeholder="Local storage value"
            />
            <button 
              onClick={removeDemoValue}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Storage used: {Math.round(storageMonitor.used / 1024)} KB
            {storageMonitor.isNearQuota && (
              <span className="text-red-500 ml-2">⚠️ Near quota</span>
            )}
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Timer Management</h2>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono">
            {gameTimer.formatted || '00:30'}
          </div>
          <div className="space-x-2">
            <button 
              onClick={gameTimer.start}
              disabled={gameTimer.isRunning}
              className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Start
            </button>
            <button 
              onClick={gameTimer.pause}
              disabled={!gameTimer.isRunning}
              className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Pause
            </button>
            <button 
              onClick={gameTimer.reset}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Game State Section */}
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Game State</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Players ({playerManager.playerCount}/4)</h3>
            <div className="space-y-2">
              {playerManager.players.map(player => (
                <div key={player.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <span>{player.name}</span>
                  <button 
                    onClick={() => playerManager.removePlayer(player.id)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => playerManager.addPlayer({ name: `Player ${playerManager.playerCount + 1}` })}
              disabled={playerManager.playerCount >= 4}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Add Player
            </button>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Progress</h3>
            <div className="bg-white p-3 rounded">
              <div>Level: {progress.progress.level}</div>
              <div>XP: {progress.progress.experience}</div>
              <div>Play Time: {Math.round(progress.progress.playTime / 60)} min</div>
              <button 
                onClick={() => progress.addExperience(100)}
                className="mt-2 bg-purple-500 text-white px-3 py-1 rounded"
              >
                Add XP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Loading Section */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Data Loading</h2>
        <div className="space-y-2">
          {isLoading && <div>Loading...</div>}
          {error && <div className="text-red-500">Error: {error.message}</div>}
          {apiData && (
            <div className="bg-white p-3 rounded">
              <pre className="text-sm">{JSON.stringify(apiData, null, 2)}</pre>
            </div>
          )}
          <button 
            onClick={refetch}
            className="bg-indigo-500 text-white px-3 py-1 rounded"
          >
            Refetch Data
          </button>
        </div>
      </div>

      {/* WebSocket Section */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">WebSocket Connection</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              websocket.isSubscribed ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>
              Status: {websocket.isSubscribed ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {websocket.data && (
            <div className="bg-white p-2 rounded text-sm">
              Last message: {JSON.stringify(websocket.data)}
            </div>
          )}
          <button 
            onClick={websocket.isSubscribed ? websocket.unsubscribe : websocket.subscribe}
            className="bg-purple-500 text-white px-3 py-1 rounded"
          >
            {websocket.isSubscribed ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}