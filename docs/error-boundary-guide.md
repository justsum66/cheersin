# P1-097: 錯誤邊界處理優化系統

## 概述
錯誤邊界處理優化系統提供完整的錯誤處理機制，包括組件錯誤捕獲、優雅的錯誤回退 UI、錯誤報告和用戶體驗優化。

## 核心功能

### 1. 錯誤捕獲
- 自動捕獲組件渲染時的 JavaScript 錯誤
- 捕獲組件生命週期中的錯誤
- 防止錯誤導致整個應用崩潰

### 2. 錯誤回退 UI
- 提供美觀的錯誤頁面
- 顯示有意義的錯誤信息
- 提供重新載入選項

### 3. 錯誤報告
- 自動記錄錯誤堆疊信息
- 支援外部錯誤監控服務集成
- 提供錯誤調試所需的信息

### 4. 多重實現方式
- Class Component 版本
- Hook 版本
- Higher-Order Component (HOC) 版本
- Context Provider 版本

## 安裝使用

### 1. 基本使用
```typescript
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div>
          <h2>出錯了!</h2>
          <p>{error.message}</p>
          <button onClick={resetError}>重試</button>
        </div>
      )}
    >
      <MyWidget />
    </ErrorBoundary>
  )
}
```

### 2. 自定義錯誤處理
```typescript
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

function MyApp() {
  const handleError = (error: Error, errorInfo: any) => {
    // 發送錯誤到監控服務
    console.error('錯誤被捕捉:', error, errorInfo)
  }

  const handleReset = () => {
    // 重置錯誤狀態時的處理
    console.log('錯誤已重置')
  }

  return (
    <ErrorBoundary
      onError={handleError}
      onReset={handleReset}
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} onReset={resetError} />
      )}
    >
      <MainContent />
    </ErrorBoundary>
  )
}
```

### 3. Hook 版本使用
```typescript
import { useErrorBoundary } from '@/components/ui/ErrorBoundary'

function MyComponent() {
  const { hasError, error, resetError } = useErrorBoundary()

  if (hasError) {
    return (
      <div>
        <h2>發生錯誤</h2>
        <p>{error?.message}</p>
        <button onClick={resetError}>重試</button>
      </div>
    )
  }

  return <div>正常內容</div>
}
```

### 4. HOC 版本使用
```typescript
import { withErrorBoundary } from '@/components/ui/ErrorBoundary'

const ComponentWithErrorBoundary = withErrorBoundary(MyComponent)

function App() {
  return <ComponentWithErrorBoundary />
}
```

## API 參考

### ErrorBoundary Props
| 屬性 | 類型 | 說明 |
|------|------|------|
| children | ReactNode | 需要保護的組件 |
| fallback | ComponentType | 錯誤時顯示的組件 |
| onError | (error, errorInfo) => void | 錯誤發生時的回調 |
| onReset | () => void | 重置錯誤時的回調 |
| className | string | 自定義樣式類名 |
| resetText | string | 重試按鈕文字 |
| errorTitle | string | 錯誤標題 |
| errorMessage | string | 錯誤描述 |

### useErrorBoundary 返回值
| 名稱 | 類型 | 說明 |
|------|------|------|
| hasError | boolean | 是否發生錯誤 |
| error | Error \| null | 錯誤對象 |
| resetError | () => void | 重置錯誤狀態 |
| setError | (error) => void | 手動設置錯誤 |

### ErrorBoundaryContext
提供全域錯誤處理能力：

```typescript
import { ErrorBoundaryProvider, useErrorBoundaryContext } from '@/components/ui/ErrorBoundary'

// 在應用根部包裝
function App() {
  return (
    <ErrorBoundaryProvider
      fallback={CustomErrorFallback}
      onError={(error, errorInfo) => {
        // 全域錯誤處理
      }}
    >
      <MainApp />
    </ErrorBoundaryProvider>
  )
}

// 在子組件中使用
function ChildComponent() {
  const { reportError, resetError } = useErrorBoundaryContext()
  
  const handleClick = () => {
    try {
      // 可能出錯的操作
    } catch (error) {
      reportError(error as Error)
    }
  }
}
```

## 最佳實踐

### 1. 合理使用錯誤邊界
- 不要在每個組件上都使用錯誤邊界
- 在適當的組件層級放置錯誤邊界
- 錯誤邊界通常放在可能出錯的組件樹頂層

### 2. 提供有意義的錯誤信息
```typescript
const ErrorFallback = ({ error, resetError }) => (
  <div className="error-container">
    <h2>很抱歉，發生了錯誤</h2>
    <p>我們已記錄此問題，正在努力修復中。</p>
    <details>
      <summary>錯誤詳情</summary>
      <p>{error.message}</p>
    </details>
    <button onClick={resetError}>重試</button>
  </div>
)
```

### 3. 錯誤報告最佳化
```typescript
const onError = (error: Error, errorInfo: any) => {
  // 在生產環境中發送到錯誤監控服務
  if (process.env.NODE_ENV === 'production') {
    // 例如 Sentry
    // Sentry.captureException(error, { contexts: { react: errorInfo } })
  }
  
  // 在開發環境中打印到控制台
  console.error('錯誤邊界捕獲:', error, errorInfo)
}
```

### 4. 錯誤處理策略
- **記錄錯誤**：始終記錄錯誤以便調試
- **用戶友好**：提供清晰的錯誤信息和解決方案
- **恢復能力**：提供重置或重試選項
- **影響範圍**：將錯誤限制在最小範圍內

## 實際應用場景

### 1. 頁面級錯誤處理
```typescript
function Page() {
  return (
    <ErrorBoundary 
      fallback={PageErrorFallback}
      onError={(error) => {
        // 頁面級錯誤處理
        logError(error, 'page')
      }}
    >
      <PageContent />
    </ErrorBoundary>
  )
}
```

### 2. 組件級錯誤處理
```typescript
function Dashboard() {
  return (
    <div>
      <ErrorBoundary fallback={WidgetErrorFallback}>
        <WeatherWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={ChartErrorFallback}>
        <DataChart />
      </ErrorBoundary>
    </div>
  )
}
```

### 3. 動態組件錯誤處理
```typescript
function DynamicComponentRenderer({ componentType }) {
  const Component = getComponentByType(componentType)
  
  return (
    <ErrorBoundary 
      fallback={DynamicErrorFallback}
      onError={(error) => {
        // 記錄動態組件錯誤
        trackDynamicComponentError(componentType, error)
      }}
    >
      <Component />
    </ErrorBoundary>
  )
}
```

## 測試建議

### 1. 錯誤邊界測試
```typescript
// 測試錯誤邊界是否正確捕獲錯誤
const ThrowingComponent = () => {
  throw new Error('Test error')
}

render(
  <ErrorBoundary fallback={({ error }) => <div>Error: {error.message}</div>}>
    <ThrowingComponent />
  </ErrorBoundary>
)

// 驗證錯誤回退 UI 被渲染
expect(screen.getByText(/Error: Test error/)).toBeInTheDocument()
```

### 2. 重置功能測試
```typescript
// 測試重置功能
const ResettingComponent = () => {
  const [shouldThrow, setShouldThrow] = useState(true)
  
  if (shouldThrow) {
    throw new Error('Reset test')
  }
  
  return <div>Reset successful</div>
}

const { getByText } = render(
  <ErrorBoundary fallback={({ resetError }) => <button onClick={resetError}>Reset</button>}>
    <ResettingComponent />
  </ErrorBoundary>
)

// 點擊重置按鈕後，組件應正常渲染
fireEvent.click(getByText('Reset'))
expect(getByText('Reset successful')).toBeInTheDocument()
```

### 3. 錯誤報告測試
```typescript
// 測試錯誤報告功能
const mockOnError = jest.fn()
const error = new Error('Test error')

render(
  <ErrorBoundary 
    fallback={() => <div>Error</div>}
    onError={mockOnError}
  >
    <ThrowingComponent />
  </ErrorBoundary>
)

expect(mockOnError).toHaveBeenCalledWith(error, expect.any(Object))
```

## 效能考量

### 1. 錯誤邊界數量
- 避免過度使用錯誤邊界
- 只在必要的組件層級使用
- 平衡錯誤隔離和組件複雜度

### 2. 錯誤處理效能
- 錯誤處理不應影響正常渲染效能
- 錯誤記錄應是非同步的
- 避免在錯誤處理中產生新的錯誤

### 3. 記憶體管理
- 確保錯誤邊界正確清理
- 避免錯誤狀態導致的記憶體洩漏
- 及時清除錯誤相關的數據

## 除錯技巧

### 1. 開發環境調試
```typescript
// 在開發環境中提供詳細的錯誤信息
const DevErrorFallback = ({ error, componentStack, resetError }) => (
  <div className="dev-error-boundary">
    <h2>開發模式錯誤</h2>
    <pre>{error.message}</pre>
    <pre>{componentStack}</pre>
    <button onClick={resetError}>重置</button>
  </div>
)
```

### 2. 生產環境監控
```typescript
// 在生產環境中發送錯誤到監控服務
const ProductionErrorFallback = ({ error, resetError }) => {
  useEffect(() => {
    // 發送錯誤到監控服務
    sendErrorToMonitoring(error)
  }, [error])
  
  return (
    <div className="prod-error-boundary">
      <h2>發生錯誤</h2>
      <p>請稍後重試或聯繫客服</p>
      <button onClick={resetError}>重試</button>
    </div>
  )
}
```

### 3. 錯誤分類處理
```typescript
const classifyError = (error: Error) => {
  if (error.message.includes('network')) {
    return 'network_error'
  } else if (error.message.includes('permission')) {
    return 'permission_error'
  }
  return 'unknown_error'
}
```

## 未來擴充

### 1. 智慧錯誤處理
- 根據錯誤類型提供不同的處理策略
- 自動重試機制
- 錯誤模式分析

### 2. 用戶體驗優化
- 錯誤發生時的動畫效果
- 漸進式錯誤恢復
- 錯誤預防機制

### 3. 監控集成
- 更深入的錯誤分析
- 性能影響評估
- 錯誤趨勢預測

### 4. A/B 測試支持
- 不同錯誤處理策略的測試
- 用戶反應分析
- 錯誤處理效果評估