/**
 * Phase 3 Task 3.02: Game Room Connection Manager
 * Advanced connection handling with auto-reconnect, fallback strategies, and status monitoring
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed'

export interface ConnectionOptions {
  /** Maximum retry attempts before failing */
  maxRetries?: number
  /** Base delay between retries (ms) */
  baseDelay?: number
  /** Maximum delay between retries (ms) */
  maxDelay?: number
  /** Timeout for connection attempts (ms) */
  timeout?: number
  /** Whether to enable automatic reconnection */
  autoReconnect?: boolean
  /** Fallback connection strategies */
  fallbackStrategies?: ConnectionStrategy[]
}

export type ConnectionStrategy = 'primary' | 'fallback' | 'offline'

export interface ConnectionManager {
  status: ConnectionStatus
  strategy: ConnectionStrategy
  retryCount: number
  lastError: string | null
  isConnected: boolean
  isReconnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  retry: () => Promise<void>
  getConnectionInfo: () => ConnectionInfo
}

export interface ConnectionInfo {
  status: ConnectionStatus
  strategy: ConnectionStrategy
  latency: number | null
  lastConnected: Date | null
  totalRetries: number
  errors: string[]
}

interface ConnectionStatusIndicatorProps {
  manager: ConnectionManager
  className?: string
}

export function ConnectionStatusIndicator({ 
  manager,
  className = ''
}: ConnectionStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (manager.status) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'reconnecting': return 'text-orange-500'
      case 'disconnected': return 'text-gray-500'
      case 'failed': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = () => {
    switch (manager.status) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'reconnecting': return `Reconnecting (${manager.retryCount})`
      case 'disconnected': return 'Disconnected'
      case 'failed': return 'Connection Failed'
      default: return 'Unknown'
    }
  }

  const getStrategyText = () => {
    switch (manager.strategy) {
      case 'primary': return 'Primary'
      case 'fallback': return 'Fallback'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {manager.status !== 'disconnected' && (
        <span className="text-gray-400">
          ({getStrategyText()})
        </span>
      )}
      {manager.lastError && (
        <span className="text-red-400" title={manager.lastError}>
          ⚠️
        </span>
      )}
    </div>
  )
}

class GameRoomConnectionManager {
  private status: ConnectionStatus = 'disconnected'
  private _strategy: ConnectionStrategy = 'primary'
  private _retryCount = 0
  private _lastError: string | null = null
  private lastConnected: Date | null = null
  private latency: number | null = null
  private errors: string[] = []
  private connectionTimeout: NodeJS.Timeout | null = null
  private retryTimeout: NodeJS.Timeout | null = null
  private options: Required<ConnectionOptions>
  
  private onStatusChangeCallbacks: ((status: ConnectionStatus) => void)[] = []
  private onStrategyChangeCallbacks: ((strategy: ConnectionStrategy) => void)[] = []

  constructor(options: ConnectionOptions = {}) {
    this.options = {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      timeout: 10000,
      autoReconnect: true,
      fallbackStrategies: ['primary', 'fallback'],
      ...options
    }
  }

  // Public API
  public getConnectionInfo(): ConnectionInfo {
    return {
      status: this.status,
      strategy: this._strategy,
      latency: this.latency,
      lastConnected: this.lastConnected,
      totalRetries: this._retryCount,
      errors: [...this.errors]
    }
  }

  public async connect(): Promise<void> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return
    }

    this.updateStatus('connecting')
    this.clearTimeouts()

    try {
      // Simulate connection attempt with timeout
      await this.withTimeout(this.attemptConnection(), this.options.timeout)
      
      this.updateStatus('connected')
      this.lastConnected = new Date()
      this._retryCount = 0
      this.latency = this.measureLatency()
      
      // Schedule heartbeat for connection monitoring
      this.scheduleHeartbeat()
      
    } catch (error) {
      this.handleError(error as Error)
      await this.handleReconnection()
    }
  }

  public disconnect(): void {
    this.clearTimeouts()
    this.updateStatus('disconnected')
    this.lastConnected = null
  }

  public async retry(): Promise<void> {
    if (this.status === 'connected') return
    
    this._retryCount++
    await this.connect()
  }

  // Event handling
  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.onStatusChangeCallbacks.push(callback)
    return () => {
      const index = this.onStatusChangeCallbacks.indexOf(callback)
      if (index > -1) {
        this.onStatusChangeCallbacks.splice(index, 1)
      }
    }
  }

  public onStrategyChange(callback: (strategy: ConnectionStrategy) => void): () => void {
    this.onStrategyChangeCallbacks.push(callback)
    return () => {
      const index = this.onStrategyChangeCallbacks.indexOf(callback)
      if (index > -1) {
        this.onStrategyChangeCallbacks.splice(index, 1)
      }
    }
  }

  // Getters
  public get isConnected(): boolean {
    return this.status === 'connected'
  }

  public get isReconnecting(): boolean {
    return this.status === 'reconnecting'
  }

  public get connectionStatus(): ConnectionStatus {
    return this.status
  }

  public get currentStrategy(): ConnectionStrategy {
    return this._strategy
  }

  public get currentRetryCount(): number {
    return this._retryCount
  }

  public get currentLastError(): string | null {
    return this._lastError
  }

  // Private methods
  private async attemptConnection(): Promise<void> {
    // In a real implementation, this would connect to your WebSocket server
    // For demo purposes, we'll simulate network conditions
    
    // Simulate network latency
    const latency = Math.random() * 500 + 100 // 100-600ms
    await new Promise(resolve => setTimeout(resolve, latency))
    
    // Simulate occasional failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('Network connection failed')
    }
    
    this.latency = latency
  }

  private async handleReconnection(): Promise<void> {
    if (!this.options.autoReconnect || this._retryCount >= this.options.maxRetries) {
      this.updateStatus('failed')
      return
    }

    this.updateStatus('reconnecting')
    
    // Calculate exponential backoff with jitter
    const delay = this.calculateRetryDelay()
    
    console.log(`[Connection Manager] Retrying in ${delay}ms (attempt ${this._retryCount + 1}/${this.options.maxRetries})`)
    
    this.retryTimeout = setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        // Continue retry cycle
        await this.handleReconnection()
      }
    }, delay)
  }

  private calculateRetryDelay(): number {
    const exponentialDelay = this.options.baseDelay * Math.pow(2, this._retryCount)
    const cappedDelay = Math.min(exponentialDelay, this.options.maxDelay)
    const jitter = cappedDelay * 0.1 * (Math.random() - 0.5) // ±5% jitter
    return Math.max(this.options.baseDelay, cappedDelay + jitter)
  }

  private handleError(error: Error): void {
    const errorMessage = error.message || 'Unknown connection error'
    this._lastError = errorMessage
    this.errors.push(`${new Date().toISOString()}: ${errorMessage}`)
    
    // Keep only last 10 errors
    if (this.errors.length > 10) {
      this.errors.shift()
    }
    
    console.error('[Connection Manager] Connection error:', errorMessage)
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.onStatusChangeCallbacks.forEach(callback => callback(newStatus))
    }
  }

  private updateStrategy(newStrategy: ConnectionStrategy): void {
    if (this._strategy !== newStrategy) {
      this._strategy = newStrategy
      this.onStrategyChangeCallbacks.forEach(callback => callback(newStrategy))
    }
  }

  private measureLatency(): number {
    // In a real implementation, measure actual round-trip time
    return Math.random() * 200 + 50 // 50-250ms simulated
  }

  private scheduleHeartbeat(): void {
    // Send periodic heartbeat to maintain connection
    this.connectionTimeout = setInterval(() => {
      if (this.status === 'connected') {
        this.latency = this.measureLatency()
      }
    }, 30000) // Every 30 seconds
  }

  private clearTimeouts(): void {
    if (this.connectionTimeout) {
      clearInterval(this.connectionTimeout)
      this.connectionTimeout = null
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), ms)
      promise.then(
        (result) => {
          clearTimeout(timeout)
          resolve(result)
        },
        (error) => {
          clearTimeout(timeout)
          reject(error)
        }
      )
    })
  }
}

// React Hook for using the connection manager
export function useGameRoomConnection(options: ConnectionOptions = {}): ConnectionManager {
  const managerRef = useRef<GameRoomConnectionManager | null>(null)
  
  if (!managerRef.current) {
    managerRef.current = new GameRoomConnectionManager(options)
  }
  
  const manager = managerRef.current
  const [status, setStatus] = useState<ConnectionStatus>(manager.connectionStatus)
  const [strategy, setStrategy] = useState<ConnectionStrategy>(manager.currentStrategy)
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeStatus = manager.onStatusChange((newStatus) => {
      setStatus(newStatus)
      setRetryCount(manager.currentRetryCount)
      setLastError(manager.currentLastError)
    })
    
    const unsubscribeStrategy = manager.onStrategyChange((newStrategy) => {
      setStrategy(newStrategy)
    })

    return () => {
      unsubscribeStatus()
      unsubscribeStrategy()
    }
  }, [manager])

  const connect = useCallback(async () => {
    await manager.connect()
  }, [manager])

  const disconnect = useCallback(() => {
    manager.disconnect()
  }, [manager])

  const retry = useCallback(async () => {
    await manager.retry()
  }, [manager])

  const getConnectionInfo = useCallback(() => {
    return manager.getConnectionInfo()
  }, [manager])

  return {
    status,
    strategy,
    retryCount,
    lastError,
    isConnected: status === 'connected',
    isReconnecting: status === 'reconnecting',
    connect,
    disconnect,
    retry,
    getConnectionInfo
  }
}