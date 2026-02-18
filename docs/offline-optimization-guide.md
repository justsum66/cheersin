# P1-084: 離線體驗優化系統

## 概述
離線體驗優化系統提供完整的離線功能支援，包括網路狀態監控、資料同步管理、重試策略和直觀的用戶界面。

## 核心功能

### 1. 網路狀態監控
- 自動偵測網路連線狀態變化
- 即時切換離線/線上模式
- 提供連線狀態回調和事件監聽

### 2. 資料同步機制
- 離線時自動儲存操作到本地
- 恢復連線後自動同步資料
- 支援 CRUD 操作的同步

### 3. 智慧重試策略
- 指數退避重試機制
- 可設定最大重試次數
- 重試間隔時間可調整

### 4. 狀態可視化
- 多種UI元件顯示離線狀態
- 同步進度指示器
- 詳細的狀態面板

## 安裝使用

### 1. 基本設定
```typescript
import { OfflineManager } from '@/lib/offline-optimization'

// 初始化離線管理器
const offlineManager = OfflineManager.getInstance({
  maxRetries: 3,
  retryInterval: 5000,
  autoSyncInterval: 30000
})
```

### 2. React Hook 使用
```typescript
import { useOfflineManager } from '@/lib/offline-optimization'

function MyComponent() {
  const { state, addPendingItem, triggerSync } = useOfflineManager()

  const handleSave = async (data) => {
    try {
      // 嘗試線上儲存
      await saveDataToServer(data)
    } catch (error) {
      // 離線時儲存到待同步佇列
      addPendingItem({
        type: 'create',
        table: 'user_data',
        data: data
      })
    }
  }

  return (
    <div>
      {/* 顯示離線狀態 */}
      {state.isOffline && <div>目前為離線狀態</div>}
      
      {/* 顯示待同步項目數量 */}
      {state.pendingSync.length > 0 && (
        <div>待同步: {state.pendingSync.length} 項</div>
      )}
    </div>
  )
}
```

### 3. 離線資料管理
```typescript
import { useOfflineData } from '@/lib/offline-optimization'

function NotesComponent() {
  const [notes, setNotes] = useOfflineData('user-notes', [])

  const addNote = (content) => {
    const newNote = {
      id: Date.now(),
      content,
      timestamp: Date.now()
    }
    setNotes([...notes, newNote])
  }

  return (
    <div>
      {notes.map(note => (
        <div key={note.id}>{note.content}</div>
      ))}
    </div>
  )
}
```

## UI 元件

### 1. 離線指示器 (OfflineIndicator)
顯示在頁面頂部或底部的離線狀態提示

```typescript
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'

function App() {
  return (
    <div>
      {/* 全域離線指示器 */}
      <OfflineIndicator position="top" />
      
      {/* 內容 */}
      <main>...</main>
    </div>
  )
}
```

### 2. 同步進度指示器 (SyncProgressIndicator)
小型元件顯示同步狀態和進度

```typescript
import { SyncProgressIndicator } from '@/components/ui/OfflineIndicator'

function Toolbar() {
  return (
    <div className="toolbar">
      <SyncProgressIndicator />
    </div>
  )
}
```

### 3. 離線狀態面板 (OfflineStatusPanel)
詳細的狀態管理面板

```typescript
import { OfflineStatusPanel } from '@/components/ui/OfflineIndicator'

function SettingsPage() {
  return (
    <div>
      <h2>離線設定</h2>
      <OfflineStatusPanel />
    </div>
  )
}
```

## 配置選項

```typescript
interface OfflineConfig {
  /** 最大重試次數 */
  maxRetries: number        // 預設: 3
  
  /** 重試間隔(毫秒) */
  retryInterval: number     // 預設: 5000 (5秒)
  
  /** 最大離線資料量 */
  maxPendingItems: number   // 預設: 100
  
  /** 自動同步間隔(毫秒) */
  autoSyncInterval: number  // 預設: 30000 (30秒)
  
  /** 離線資料儲存位置 */
  storageKey: string        // 預設: 'offline-pending-sync'
}
```

## 實際應用場景

### 1. 表單提交
```typescript
const handleSubmit = async (formData) => {
  try {
    await submitForm(formData)
  } catch (error) {
    // 離線時儲存表單資料
    addPendingItem({
      type: 'create',
      table: 'forms',
      data: formData
    })
    
    // 顯示離線提示
    toast('已儲存到待同步佇列，恢復連線後自動提交')
  }
}
```

### 2. 資料編輯
```typescript
const handleUpdate = async (id, data) => {
  try {
    await updateData(id, data)
  } catch (error) {
    // 離線時儲存更新
    addPendingItem({
      type: 'update',
      table: 'user_profiles',
      data: { id, ...data }
    })
  }
}
```

### 3. 資料刪除
```typescript
const handleDelete = async (id) => {
  try {
    await deleteData(id)
  } catch (error) {
    // 離線時標記為待刪除
    addPendingItem({
      type: 'delete',
      table: 'items',
      data: { id }
    })
  }
}
```

## 最佳實踐

### 1. 資料結構設計
```typescript
// 建議的待同步項目結構
interface PendingSyncItem {
  id: string
  type: 'create' | 'update' | 'delete'
  table: string  // 資料表名稱
  data: any      // 要同步的資料
  timestamp: number
  retryCount: number
}
```

### 2. 錯誤處理
```typescript
const syncItem = async (item: PendingSyncItem) => {
  try {
    const response = await fetch(`/api/${item.table}`, {
      method: item.type === 'create' ? 'POST' : 
             item.type === 'update' ? 'PUT' : 'DELETE',
      body: JSON.stringify(item.data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    console.error('同步失敗:', error)
    throw error
  }
}
```

### 3. 使用者體驗
- 提供清晰的離線狀態指示
- 顯示待同步項目數量
- 在適當時機自動觸發同步
- 提供手動同步選項

## 效能考量

### 1. 儲存最佳化
- 限制待同步項目數量
- 定期清理過期資料
- 使用高效的序列化方式

### 2. 網路最佳化
- 合理設定重試間隔
- 避免過於頻繁的同步請求
- 實作請求去重機制

### 3. 使用者體驗
- 離線操作保持流暢
- 同步過程不阻塞主介面
- 提供進度回饋

## 測試建議

### 1. 網路切斷測試
```typescript
// 模擬網路斷線
navigator.onLine = false
window.dispatchEvent(new Event('offline'))

// 模擬網路恢復
navigator.onLine = true
window.dispatchEvent(new Event('online'))
```

### 2. 資料同步測試
```typescript
// 測試離線資料儲存
const testData = { message: 'test' }
addPendingItem({
  type: 'create',
  table: 'test',
  data: testData
})

// 驗證資料儲存
const state = offlineManager.getState()
expect(state.pendingSync).toHaveLength(1)
```

## 除錯技巧

### 1. 啟用詳細日誌
```typescript
// 在開發環境啟用詳細日誌
localStorage.setItem('debug', 'offline:*')
```

### 2. 狀態檢查
```typescript
// 檢查目前離線狀態
console.log('離線狀態:', offlineManager.getState())

// 手動觸發同步
offlineManager.triggerSync()
```

### 3. 資料清理
```typescript
// 清除所有待同步資料
offlineManager.clearPendingItems()

// 重置整個系統
offlineManager.destroy()
```

## 未來擴充

### 1. 優先級支援
- 為不同類型的操作設定優先級
- 重要資料優先同步

### 2. 衝突解決
- 實作資料衝突檢測機制
- 提供衝突解決策略

### 3. 增量同步
- 只同步變更的部分
- 減少資料傳輸量

### 4. 智慧同步
- 根據使用模式最佳化同步時機
- 預測使用者行為