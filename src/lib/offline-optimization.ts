/**
 * P1-084: 離線體驗核心邏輯
 * 提供完整的離線功能和資料同步管理
 */

// 離線狀態管理
interface OfflineState {
  /** 是否離線 */
  isOffline: boolean
  /** 離線時間 */
  offlineSince: Date | null
  /** 重新連線嘗試次數 */
  retryCount: number
  /** 等待同步的資料 */
  pendingSync: PendingSyncItem[]
}

// 待同步項目
interface PendingSyncItem {
  /** 唯一ID */
  id: string
  /** 操作類型 */
  type: 'create' | 'update' | 'delete'
  /** 資料表名稱 */
  table: string
  /** 資料內容 */
  data: any
  /** 時間戳 */
  timestamp: number
  /** 重試次數 */
  retryCount: number
}

// 離線功能配置
interface OfflineConfig {
  /** 最大重試次數 */
  maxRetries: number
  /** 重試間隔(毫秒) */
  retryInterval: number
  /** 最大離線資料量 */
  maxPendingItems: number
  /** 自動同步間隔(毫秒) */
  autoSyncInterval: number
  /** 離線資料儲存位置 */
  storageKey: string
}

// 預設配置
const DEFAULT_OFFLINE_CONFIG: OfflineConfig = {
  maxRetries: 3,
  retryInterval: 5000,
  maxPendingItems: 100,
  autoSyncInterval: 30000, // 30秒
  storageKey: 'offline-pending-sync'
}

// 離線管理器
class OfflineManager {
  private static instance: OfflineManager
  private state: OfflineState
  private config: OfflineConfig
  private retryTimer: NodeJS.Timeout | null = null
  private syncTimer: NodeJS.Timeout | null = null
  private subscribers: Array<(state: OfflineState) => void> = []

  private constructor(config: Partial<OfflineConfig> = {}) {
    this.config = { ...DEFAULT_OFFLINE_CONFIG, ...config }
    this.state = {
      isOffline: false,
      offlineSince: null,
      retryCount: 0,
      pendingSync: this.loadPendingItems()
    }
    
    this.setupNetworkListeners()
    this.startAutoSync()
  }

  static getInstance(config?: Partial<OfflineConfig>): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager(config)
    }
    return OfflineManager.instance
  }

  // 設定網路監聽
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return

    const updateNetworkStatus = () => {
      const isOffline = !navigator.onLine
      this.setOfflineStatus(isOffline)
    }

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    // 初始化網路狀態
    updateNetworkStatus()
  }

  // 設定離線狀態
  private setOfflineStatus(isOffline: boolean): void {
    const prevState = this.state.isOffline
    
    this.state.isOffline = isOffline
    
    if (isOffline && !prevState) {
      // 從線上切換到離線
      this.state.offlineSince = new Date()
      this.state.retryCount = 0
      console.log('[Offline] 進入離線模式')
    } else if (!isOffline && prevState) {
      // 從離線切換到線上
      console.log('[Offline] 恢復線上連線')
      this.state.offlineSince = null
      this.state.retryCount = 0
      this.triggerSync()
    }
    
    this.notifySubscribers()
  }

  // 新增待同步項目
  addPendingItem(item: Omit<PendingSyncItem, 'id' | 'timestamp' | 'retryCount'>): void {
    if (this.state.pendingSync.length >= this.config.maxPendingItems) {
      console.warn('[Offline] 待同步項目已達上限')
      return
    }

    const pendingItem: PendingSyncItem = {
      id: `${item.type}-${item.table}-${Date.now()}-${Math.random()}`,
      ...item,
      timestamp: Date.now(),
      retryCount: 0
    }

    this.state.pendingSync.push(pendingItem)
    this.savePendingItems()
    this.notifySubscribers()
    
    console.log(`[Offline] 新增待同步項目: ${item.type} ${item.table}`)
  }

  // 移除待同步項目
  removePendingItem(id: string): void {
    const index = this.state.pendingSync.findIndex(item => item.id === id)
    if (index !== -1) {
      this.state.pendingSync.splice(index, 1)
      this.savePendingItems()
      this.notifySubscribers()
      console.log(`[Offline] 移除待同步項目: ${id}`)
    }
  }

  // 觸發同步
  async triggerSync(): Promise<void> {
    if (this.state.isOffline || this.state.pendingSync.length === 0) {
      return
    }

    console.log(`[Offline] 開始同步 ${this.state.pendingSync.length} 個項目`)
    
    const itemsToSync = [...this.state.pendingSync]
    const failedItems: PendingSyncItem[] = []

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item)
        this.removePendingItem(item.id)
      } catch (error) {
        console.error(`[Offline] 同步失敗 ${item.id}:`, error)
        item.retryCount++
        
        if (item.retryCount < this.config.maxRetries) {
          failedItems.push(item)
        } else {
          console.error(`[Offline] 項目 ${item.id} 達到最大重試次數，放棄同步`)
        }
      }
    }

    // 保留失敗的項目
    this.state.pendingSync = failedItems
    this.savePendingItems()
    this.notifySubscribers()
  }

  // 同步單一項目
  private async syncItem(item: PendingSyncItem): Promise<void> {
    // 這裡應該根據實際的API結構來實作
    const endpoint = `/api/${item.table}`
    
    const response = await fetch(endpoint, {
      method: item.type === 'create' ? 'POST' : 
             item.type === 'update' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // 啟動自動同步
  private startAutoSync(): void {
    if (typeof window === 'undefined') return

    this.syncTimer = setInterval(() => {
      if (!this.state.isOffline) {
        this.triggerSync()
      }
    }, this.config.autoSyncInterval)
  }

  // 停止自動同步
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  // 啟動重試機制
  private startRetry(): void {
    if (this.retryTimer) return

    this.retryTimer = setInterval(() => {
      if (this.state.isOffline) {
        this.state.retryCount++
        console.log(`[Offline] 重試連線 (${this.state.retryCount})`)
        this.notifySubscribers()
      } else {
        this.stopRetry()
      }
    }, this.config.retryInterval)
  }

  // 停止重試機制
  private stopRetry(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer)
      this.retryTimer = null
    }
  }

  // 儲存待同步項目
  private savePendingItems(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          this.config.storageKey,
          JSON.stringify(this.state.pendingSync)
        )
      }
    } catch (error) {
      console.error('[Offline] 無法儲存待同步項目:', error)
    }
  }

  // 載入待同步項目
  private loadPendingItems(): PendingSyncItem[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.config.storageKey)
        return saved ? JSON.parse(saved) : []
      }
    } catch (error) {
      console.error('[Offline] 無法載入待同步項目:', error)
    }
    return []
  }

  // 訂閱狀態變更
  subscribe(callback: (state: OfflineState) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // 通知訂閱者
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state))
  }

  // 取得目前狀態
  getState(): OfflineState {
    return { ...this.state }
  }

  // 清除所有待同步項目
  clearPendingItems(): void {
    this.state.pendingSync = []
    this.savePendingItems()
    this.notifySubscribers()
    console.log('[Offline] 清除所有待同步項目')
  }

  // 銷毀管理器
  destroy(): void {
    this.stopAutoSync()
    this.stopRetry()
    this.subscribers = []
  }
}

// React Hook for offline management
import { useState, useEffect } from 'react'

export function useOfflineManager(config?: Partial<OfflineConfig>) {
  const [state, setState] = useState<OfflineState>(() => 
    OfflineManager.getInstance(config).getState()
  )
  
  const manager = OfflineManager.getInstance(config)

  useEffect(() => {
    const unsubscribe = manager.subscribe(setState)
    return unsubscribe
  }, [manager])

  const addPendingItem = (item: Omit<PendingSyncItem, 'id' | 'timestamp' | 'retryCount'>) => {
    manager.addPendingItem(item)
  }

  const triggerSync = async () => {
    await manager.triggerSync()
  }

  const clearPendingItems = () => {
    manager.clearPendingItems()
  }

  return {
    state,
    addPendingItem,
    triggerSync,
    clearPendingItems
  }
}

// 離線資料鉤子
export function useOfflineData<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [data, setData] = useState<T>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(`offline-data-${key}`)
        return saved ? JSON.parse(saved) : initialValue
      } catch {
        return initialValue
      }
    }
    return initialValue
  })

  const updateData = (value: T) => {
    setData(value)
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`offline-data-${key}`, JSON.stringify(value))
      } catch (error) {
        console.error('[Offline] 無法儲存離線資料:', error)
      }
    }
  }

  return [data, updateData]
}

// 匯出類型
export type {
  OfflineState,
  PendingSyncItem,
  OfflineConfig
}

// 匯出類別和常數
export {
  OfflineManager,
  DEFAULT_OFFLINE_CONFIG
}

export default OfflineManager