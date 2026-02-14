# Cheersin REPO 100 個優化建議

## 總覽
- **審查檔案數**: 727 個 TypeScript/TSX 檔案
- **總程式碼行數**: ~96,000 行
- **發現問題數**: 100+
- **優化優先級分布**: P0(緊急): 15 / P1(重要): 45 / P2(一般): 40

### 審查統計
| 類別 | 數量 |
|------|------|
| `any` 類型使用 | 24+ 處 |
| console 語句 | 2 處 (集中於 logger) |
| TODO/FIXME | 15+ 處 |
| @ts-ignore | 0 處 |
| 'use client' 組件 | 422 個 |
| useMemo/useCallback/memo | 925 處 |
| 測試檔案 | 40 個 |
| a11y 屬性 | 1,735 處 |
| Zod 驗證 | 70 處 |
| 錯誤處理 (catch) | 207 處 |

---

## 一、程式碼品質 (1-20)

### 1. [P0] 移除 `any` 類型 - WhiskyExamples 組件
- **檔案**: `src/components/learn/WhiskyExamples.tsx:170-171, 178-179`
- **問題**: 使用 `any` 類型進行排序，失去類型安全
```typescript
// Before
const regions = ['全部', ...new Set(WHISKY_EXAMPLES.map((w: any) => w.region))];
let aValue: any;
let bValue: any;
```
- **建議**: 定義明確的 WhiskyExample 介面
```typescript
// After
interface WhiskyExample {
  region: string;
  type: string;
  name: string;
  // ...其他屬性
}
const regions = ['全部', ...new Set(WHISKY_EXAMPLES.map((w: WhiskyExample) => w.region))];
let aValue: string | number;
let bValue: string | number;
```

### 2. [P0] 移除 `as any` 強制轉型 - Supabase 操作
- **檔案**: `src/lib/subscription-lifecycle.ts:121, 148, 151`
- **問題**: 使用 `(supabase as any)` 繞過類型檢查
- **建議**: 正確定義 Supabase 資料庫類型
```typescript
// Before
const { data: row, error } = await (supabase as any).from('promo_codes')...

// After
import type { Database } from '@/types/api-generated'
const supabase = createClient<Database>()
const { data: row, error } = await supabase.from('promo_codes')...
```

### 3. [P1] 移除 `as any` - 表單事件處理
- **檔案**: `src/components/learn/BeerCiderRecommendationDatabase.tsx:419`
- **問題**: `setSortBy(e.target.value as any)` 不安全
- **建議**: 使用泛型或聯合類型
```typescript
// Before
onChange={(e) => setSortBy(e.target.value as any)}

// After
type SortByOption = 'name' | 'rating' | 'price';
onChange={(e) => setSortBy(e.target.value as SortByOption)}
```

### 4. [P1] 移除 AudioContext `as any` 轉型
- **檔案**: `src/components/games/PitchPerfect.tsx:55`
- **問題**: `(window as any).webkitAudioContext` 不安全
- **建議**: 擴展 Window 介面
```typescript
// Before
audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

// After
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
```

### 5. [P1] 移除 ref `as any` 轉型
- **檔案**: `src/app/party-dj/page.tsx:215`
- **問題**: `ref={startPartyRef as any}` 類型不安全
- **建議**: 正確定義 ref 類型
```typescript
// Before
ref={startPartyRef as any}

// After
const startPartyRef = useRef<HTMLButtonElement>(null)
ref={startPartyRef}
```

### 6. [P1] 移除 quiz icon `any` 類型
- **檔案**: `src/app/quiz/page.tsx:172`
- **問題**: `icon: any` 類型定義過於寬鬆
- **建議**: 使用 Lucide 圖示類型
```typescript
// Before
icon: any

// After
import type { LucideIcon } from 'lucide-react'
icon: LucideIcon
```

### 7. [P1] Pinecone 測試函數返回類型
- **檔案**: `src/lib/pinecone.ts:150`
- **問題**: `stats?: any` 返回類型不明確
- **建議**: 定義 PineconeStats 介面
```typescript
// Before
export async function testPineconeConnection(): Promise<{ success: boolean; message: string; stats?: any }>

// After
interface PineconeStats {
  totalVectors: number;
  namespaces: Record<string, { vectorCount: number }>;
}
export async function testPineconeConnection(): Promise<{ success: boolean; message: string; stats?: PineconeStats }>
```

### 8. [P0] 巨型組件需要拆分 - learn/page.tsx
- **檔案**: `src/app/learn/page.tsx` (2,346 行)
- **問題**: 單一檔案過大，難以維護和測試
- **建議**: 拆分為多個子組件
```
src/app/learn/
├── page.tsx (主頁面，<200行)
├── components/
│   ├── CourseList.tsx
│   ├── CourseCard.tsx
│   ├── CourseFilter.tsx
│   ├── ProgressStats.tsx
│   ├── LeaderboardPanel.tsx
│   └── BadgesPanel.tsx
└── hooks/
    ├── useCourseProgress.ts
    └── useLearnStats.ts
```

### 9. [P0] 巨型組件需要拆分 - LearnCourseContent.tsx
- **檔案**: `src/components/learn/LearnCourseContent.tsx` (1,926 行)
- **問題**: 組件職責過多
- **建議**: 按功能拆分為獨立模組

### 10. [P0] 巨型組件需要拆分 - GamesPageClient.tsx
- **檔案**: `src/components/games/GamesPageClient.tsx` (1,650 行)
- **問題**: 遊戲頁面邏輯過於集中
- **建議**: 抽取遊戲列表、篩選器、分類等為獨立組件

### 11. [P1] 處理未完成的 TODO
- **檔案**: `src/app/api/cron/subscription-reminder/route.ts:19`
- **問題**: `// TODO: 查詢 current_period_end 在 3 天內與 1 天內的訂閱，發送提醒`
- **建議**: 實作訂閱到期提醒功能或移除此 cron job

### 12. [P1] 處理 ScriptMurderLobby TODO
- **檔案**: `src/app/script-murder/ScriptMurderLobby.tsx:111`
- **問題**: `{/* SM-50 TODO: 若劇本數 >20 可考慮虛擬捲動或分頁以優化效能 */}`
- **建議**: 實作虛擬列表或分頁

### 13. [P2] 統一命名規範 - Store 檔案
- **檔案**: `src/store/useGameStore.ts`, `src/store/usePartyStore.ts`
- **問題**: Store 檔案使用 `use` 前綴，但實際為 store 定義而非 hook
- **建議**: 重命名為 `gameStore.ts`、`partyStore.ts`，匯出時再用 `useGameStore`

### 14. [P2] 統一錯誤訊息語言
- **檔案**: 多個 API 路由
- **問題**: 錯誤訊息混用中英文
- **建議**: 使用 i18n 統一管理錯誤訊息

### 15. [P2] 移除重複的常數定義
- **檔案**: `src/lib/constants.ts`, `src/lib/learn-constants.ts`
- **問題**: 常數分散在多個檔案
- **建議**: 整合到統一的 constants 目錄下按功能分類

### 16. [P2] 函數過長 - 需要拆分
- **檔案**: `src/app/assistant/page.tsx` (972 行)
- **問題**: 頁面組件包含過多邏輯
- **建議**: 抽取自定義 hooks (useChat, useAssistantState)

### 17. [P2] 缺少 JSDoc 文檔
- **檔案**: 多數組件
- **問題**: 關鍵組件缺少文檔說明
- **建議**: 為公開 API 和關鍵組件添加 JSDoc

### 18. [P2] 改善變數命名
- **檔案**: 多處
- **問題**: 部分變數命名過於簡短 (e.g., `w`, `p`, `i`)
- **建議**: 使用更具描述性的命名

### 19. [P2] 統一 import 順序
- **檔案**: 全專案
- **問題**: import 順序不一致
- **建議**: 配置 ESLint `import/order` 規則

### 20. [P2] 移除未使用的程式碼
- **檔案**: 需要執行 `depcheck`
- **問題**: 可能存在未使用的依賴或程式碼
- **建議**: 定期執行 `npm run depcheck` 並清理

---

## 二、架構設計 (21-35)

### 21. [P0] ESLint 配置過於簡單
- **檔案**: `.eslintrc.json`
- **問題**: 僅繼承 `next/core-web-vitals`，缺少嚴格的類型檢查規則
- **建議**: 擴展配置
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### 22. [P1] 缺少路徑別名統一管理
- **檔案**: `tsconfig.json`
- **問題**: 僅有 `@/*` 別名
- **建議**: 添加更細緻的別名
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/types/*": ["./src/types/*"]
  }
}
```

### 23. [P1] Store 架構改善
- **檔案**: `src/store/`
- **問題**: 所有 store 在同一層級，缺少模組化
- **建議**: 按功能領域組織
```
src/store/
├── index.ts (統一匯出)
├── game/
│   ├── gameStore.ts
│   └── selectors.ts
├── party/
│   └── partyStore.ts
├── subscription/
│   └── subscriptionStore.ts
└── user/
    └── userStore.ts
```

### 24. [P1] API 路由缺少中間件層
- **檔案**: `src/app/api/`
- **問題**: 認證、限流邏輯重複在各路由中
- **建議**: 建立中間件工廠
```typescript
// src/lib/api-middleware.ts
export function withAuth(handler: Handler) {
  return async (req: Request) => {
    const user = await getCurrentUser()
    if (!user) return errorResponse(401, 'UNAUTHORIZED')
    return handler(req, user)
  }
}

export function withRateLimit(context: string) {
  return (handler: Handler) => async (req: Request) => {
    const ip = getClientIp(req.headers)
    if (await isRateLimitedAsync(ip, context)) {
      return errorResponse(429, 'RATE_LIMITED')
    }
    return handler(req)
  }
}
```

### 25. [P1] 缺少 Repository 層
- **檔案**: API 路由直接操作 Supabase
- **問題**: 資料存取邏輯分散
- **建議**: 抽象資料存取層
```typescript
// src/repositories/userRepository.ts
export const userRepository = {
  findById: async (id: string) => {
    const { data } = await supabase.from('profiles').select().eq('id', id).single()
    return data
  },
  update: async (id: string, updates: Partial<Profile>) => {
    return supabase.from('profiles').update(updates).eq('id', id)
  }
}
```

### 26. [P1] 缺少 Service 層
- **檔案**: 業務邏輯分散在組件和 API 中
- **問題**: 業務邏輯難以測試和複用
- **建議**: 建立服務層
```
src/services/
├── subscriptionService.ts
├── gameService.ts
├── learnService.ts
└── userService.ts
```

### 27. [P2] 配置檔案分散
- **檔案**: `src/config/`
- **問題**: 部分配置在 `lib/` 和 `constants/`
- **建議**: 統一到 `config/` 目錄

### 28. [P2] 缺少 DTO 層
- **檔案**: API 直接返回資料庫模型
- **問題**: 可能暴露敏感欄位
- **建議**: 定義 Data Transfer Objects

### 29. [P2] hooks 目錄組織
- **檔案**: `src/hooks/`
- **問題**: hooks 數量增加後難以管理
- **建議**: 按功能分類
```
src/hooks/
├── auth/
├── game/
├── learn/
├── subscription/
└── ui/
```

### 30. [P2] 缺少依賴注入機制
- **檔案**: 全專案
- **問題**: 服務間直接依賴，難以測試
- **建議**: 考慮使用 Context 或 IoC 容器

### 31. [P2] 缺少 Feature Flag 管理系統
- **檔案**: `src/lib/feature-flags.ts`
- **問題**: Feature flags 硬編碼
- **建議**: 整合遠端配置服務 (如 LaunchDarkly)

### 32. [P2] 多語言檔案結構
- **檔案**: `messages/`
- **問題**: 單一大型 JSON 檔案
- **建議**: 按功能模組拆分翻譯檔案

### 33. [P2] 缺少 API 版本管理
- **檔案**: `src/app/api/`
- **問題**: 無版本號，未來更新可能破壞客戶端
- **建議**: 採用 `/api/v1/` 路徑結構

### 34. [P2] 共用類型定義整理
- **檔案**: `src/types/`
- **問題**: 類型定義分散且部分重複
- **建議**: 統一整理並匯出

### 35. [P2] 缺少統一的事件系統
- **檔案**: 遊戲相關組件
- **問題**: 組件間通訊依賴 props drilling
- **建議**: 建立事件總線或使用 Zustand 的 subscribe

---

## 三、效能優化 (36-50)

### 36. [P0] 過多 'use client' 指令
- **檔案**: 422 個檔案使用 'use client'
- **問題**: 過度使用客戶端渲染，影響 SSR 效能
- **建議**: 審查每個 'use client'，將純展示組件改為 Server Components

### 37. [P0] 巨型組件影響初次載入
- **檔案**: `src/app/learn/page.tsx` (2,346 行)
- **問題**: 大型組件增加 JavaScript bundle 大小
- **建議**: 使用 `next/dynamic` 進行代碼分割
```typescript
const CourseList = dynamic(() => import('./components/CourseList'), {
  loading: () => <CourseListSkeleton />
})
```

### 38. [P1] 實作虛擬列表
- **檔案**: 長列表組件
- **問題**: 已安裝 `react-window` 但使用不足
- **建議**: 對超過 20 項的列表使用虛擬化
```typescript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={400}
  width="100%"
  itemCount={items.length}
  itemSize={60}
>
  {({ index, style }) => <ItemRow item={items[index]} style={style} />}
</FixedSizeList>
```

### 39. [P1] 優化圖片載入
- **檔案**: 多個組件
- **問題**: 部分圖片未使用 Next.js Image 組件
- **建議**: 統一使用 `next/image` 並設定適當的 sizes 屬性

### 40. [P1] 添加 Suspense 邊界
- **檔案**: 頁面組件
- **問題**: Suspense 使用不足 (約 20 處)
- **建議**: 為異步組件添加 Suspense
```typescript
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

### 41. [P1] 減少重複渲染
- **檔案**: `src/app/assistant/page.tsx` (多個 useEffect)
- **問題**: 10+ 個 useEffect 可能導致多次渲染
- **建議**: 合併相關的 effects，使用 useReducer 管理複雜狀態

### 42. [P1] 優化 Framer Motion 動畫
- **檔案**: 多個動畫組件
- **問題**: 複雜動畫可能影響效能
- **建議**: 使用 `will-change` 和 `transform` 屬性，避免觸發 layout

### 43. [P2] 實作請求去重
- **檔案**: API 調用處
- **問題**: 相同請求可能被重複發送
- **建議**: 利用 React Query 的內建去重功能

### 44. [P2] 優化 Zustand store
- **檔案**: `src/store/`
- **問題**: 可能訂閱過多狀態導致不必要的重渲染
- **建議**: 使用 selector 進行精確訂閱
```typescript
// Before
const { players, gameState, round } = useGameStore()

// After
const players = useGameStore((state) => state.players)
const gameState = useGameStore((state) => state.gameState)
```

### 45. [P2] 優化 bundle 分割
- **檔案**: `next.config.ts`
- **問題**: 已有 vendor 分割，但可進一步優化
- **建議**: 分析 bundle 並按路由分割
```bash
npm run build:analyze
```

### 46. [P2] 預載入關鍵資源
- **檔案**: `src/app/layout.tsx`
- **問題**: 關鍵字體和樣式可預載入
- **建議**: 添加 preload hints
```typescript
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin="" />
```

### 47. [P2] 優化 localStorage 存取
- **檔案**: 多處使用 localStorage
- **問題**: 頻繁存取可能影響效能
- **建議**: 實作批量更新和防抖

### 48. [P2] 實作 Service Worker 快取
- **檔案**: `public/`
- **問題**: 靜態資源可離線快取
- **建議**: 配置 next-pwa 或自定義 service worker

### 49. [P2] 優化 API 回應壓縮
- **檔案**: API 路由
- **問題**: 大型 JSON 回應可壓縮
- **建議**: 確保 Vercel/伺服器啟用 gzip/brotli

### 50. [P2] 減少客戶端 hydration 範圍
- **檔案**: 頁面組件
- **問題**: 過多客戶端組件增加 hydration 時間
- **建議**: 使用 partial hydration 模式

---

## 四、安全性 (51-65)

### 51. [P0] 強化 CSP 設定
- **檔案**: `next.config.ts`
- **問題**: CSP 包含 `'unsafe-inline'` 和 `'unsafe-eval'`
- **建議**: 移除不安全指令，使用 nonce
```typescript
"script-src 'self' 'nonce-{random}' https://www.googletagmanager.com",
"style-src 'self' 'nonce-{random}' https://fonts.googleapis.com",
```

### 52. [P0] API 輸入驗證強化
- **檔案**: API 路由
- **問題**: Zod 驗證使用不足 (70 處 vs 大量 API)
- **建議**: 所有 API 輸入必須經過 Zod schema 驗證
```typescript
const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = bodySchema.safeParse(body)
  if (!result.success) {
    return errorResponse(400, 'VALIDATION_ERROR', { errors: result.error.flatten() })
  }
  // 處理驗證後的資料
}
```

### 53. [P0] 敏感資料保護
- **檔案**: `src/lib/env-config.ts`
- **問題**: 所有 API keys 集中管理但需確保不被客戶端存取
- **建議**: 確保敏感變數僅在 server-side 使用
```typescript
// 確保這些變數不被意外匯出到客戶端
if (typeof window !== 'undefined') {
  throw new Error('env-config should only be used server-side')
}
```

### 54. [P1] 強化認證檢查
- **檔案**: 受保護的 API 路由
- **問題**: 認證檢查分散在各路由
- **建議**: 建立統一的認證中間件

### 55. [P1] 實作 CSRF 防護
- **檔案**: `src/lib/csrf.ts`
- **問題**: CSRF 保護需確保完整覆蓋
- **建議**: 所有狀態變更操作必須驗證 CSRF token

### 56. [P1] SQL 注入防護
- **檔案**: Supabase 查詢
- **問題**: 確保使用參數化查詢
- **建議**: 審查所有 `.rpc()` 調用，避免字串拼接

### 57. [P1] Rate Limiting 強化
- **檔案**: `src/lib/rate-limit.ts`
- **問題**: In-memory 限流在多實例部署時失效
- **建議**: 確保生產環境使用 Upstash Redis
```typescript
// 生產環境強制使用 Redis
if (process.env.NODE_ENV === 'production' && !process.env.UPSTASH_REDIS_REST_URL) {
  console.warn('Production should use Redis for rate limiting')
}
```

### 58. [P1] 檔案上傳驗證
- **檔案**: `src/lib/validate-image-upload.ts`
- **問題**: 需確保完整的檔案類型和大小驗證
- **建議**: 添加 magic number 檢查
```typescript
const ALLOWED_MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
}
```

### 59. [P1] XSS 防護審查
- **檔案**: 使用 `dangerouslySetInnerHTML` 的組件
- **問題**: 目前僅用於 JSON-LD，需持續監控
- **建議**: 添加 ESLint 規則禁止新增使用

### 60. [P2] Session 管理強化
- **檔案**: Supabase Auth
- **問題**: JWT 刷新由 Supabase 處理，但需監控
- **建議**: 實作 session 失效日誌

### 61. [P2] 密碼政策強化
- **檔案**: 認證相關組件
- **問題**: 密碼強度檢查可加強
- **建議**: 添加密碼強度指示器

### 62. [P2] 敏感操作日誌
- **檔案**: API 路由
- **問題**: 關鍵操作缺少審計日誌
- **建議**: 記錄訂閱變更、權限變更等操作

### 63. [P2] 依賴安全審計
- **檔案**: `package.json`
- **問題**: 需定期檢查依賴漏洞
- **建議**: 在 CI 中添加 `npm audit`
```yaml
- name: Security Audit
  run: npm audit --audit-level=high
```

### 64. [P2] 環境變數驗證
- **檔案**: `scripts/validate-env.mjs`
- **問題**: 啟動時驗證環境變數
- **建議**: 擴展驗證涵蓋所有必要變數

### 65. [P2] 錯誤訊息安全
- **檔案**: API 錯誤處理
- **問題**: 避免在生產環境暴露堆疊追蹤
- **建議**: 確保 `serverErrorResponse` 不洩漏敏感資訊

---

## 五、UI/UX (66-80)

### 66. [P0] 改善無障礙設計 - 按鈕標籤
- **檔案**: 多個組件
- **問題**: 部分圖示按鈕缺少 aria-label
- **建議**: 為所有圖示按鈕添加標籤
```typescript
<button aria-label="關閉選單" onClick={onClose}>
  <X className="h-5 w-5" />
</button>
```

### 67. [P0] 鍵盤導航支援
- **檔案**: 互動式組件
- **問題**: 部分自定義元件無法用鍵盤操作
- **建議**: 確保所有互動元素支援 Tab 和 Enter/Space

### 68. [P1] 焦點管理
- **檔案**: Modal 和 Drawer 組件
- **問題**: 開啟 modal 後焦點可能跳出
- **建議**: 實作焦點陷阱 (focus trap)
```typescript
import { FocusTrap } from '@headlessui/react'

<FocusTrap>
  <Dialog>...</Dialog>
</FocusTrap>
```

### 69. [P1] 顏色對比度
- **檔案**: `src/lib/design-tokens.ts`
- **問題**: 部分文字可能對比度不足
- **建議**: 確保符合 WCAG AA 標準 (4.5:1)

### 70. [P1] 響應式設計完善
- **檔案**: 多個頁面組件
- **問題**: 部分組件在小螢幕顯示不佳
- **建議**: 使用 Tailwind 斷點進行測試和調整

### 71. [P1] 載入狀態改善
- **檔案**: 多處 (僅 19 處 loading=)
- **問題**: 載入狀態處理不一致
- **建議**: 統一使用 Skeleton 組件
```typescript
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
```

### 72. [P1] 錯誤反饋改善
- **檔案**: 表單組件
- **問題**: 錯誤訊息顯示不夠明顯
- **建議**: 使用顯眼的錯誤樣式和圖示

### 73. [P2] 動畫 prefers-reduced-motion
- **檔案**: 動畫組件
- **問題**: 部分使用者偏好減少動畫
- **建議**: 尊重使用者設定
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 74. [P2] 表單驗證即時反饋
- **檔案**: 表單組件
- **問題**: 部分表單僅在提交時顯示錯誤
- **建議**: 實作即時驗證

### 75. [P2] 空狀態設計
- **檔案**: 列表組件
- **問題**: 空列表可能顯示空白
- **建議**: 添加友善的空狀態提示

### 76. [P2] 觸控目標大小
- **檔案**: 行動裝置互動元素
- **問題**: 部分按鈕可能太小
- **建議**: 確保最小 44x44px 觸控區域

### 77. [P2] 螢幕閱讀器支援
- **檔案**: 動態內容區域
- **問題**: 內容更新可能未通知螢幕閱讀器
- **建議**: 使用 aria-live 區域

### 78. [P2] 語言切換體驗
- **檔案**: 語言選擇器
- **問題**: 切換語言後可能閃爍
- **建議**: 使用平滑過渡

### 79. [P2] 深色模式支援
- **檔案**: 主題配置
- **問題**: 確保深色模式完整支援
- **建議**: 測試所有組件的深色模式顯示

### 80. [P2] 印刷樣式
- **檔案**: 全域樣式
- **問題**: 頁面列印可能不美觀
- **建議**: 添加 print 媒體查詢樣式

---

## 六、測試與品質保證 (81-90)

### 81. [P0] 測試覆蓋率嚴重不足
- **檔案**: 全專案
- **問題**: 727 個檔案僅 40 個測試檔 (~5.5%)
- **建議**: 目標提升至 60% 覆蓋率
```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  lines: 60,
  branches: 60,
  functions: 60,
}
```

### 82. [P0] 關鍵路徑缺少測試
- **檔案**: 認證、訂閱、支付流程
- **問題**: 核心業務邏輯測試不足
- **建議**: 優先為關鍵功能添加測試

### 83. [P1] E2E 測試擴展
- **檔案**: `e2e/`
- **問題**: E2E 測試覆蓋不完整
- **建議**: 添加完整的使用者流程測試
```typescript
test('完整訂閱流程', async ({ page }) => {
  await page.goto('/pricing')
  await page.click('[data-testid="subscribe-button"]')
  // ...完整流程
})
```

### 84. [P1] 組件測試不足
- **檔案**: `src/components/`
- **問題**: 大多數組件缺少單元測試
- **建議**: 使用 React Testing Library 測試互動

### 85. [P1] API 路由測試
- **檔案**: `src/app/api/`
- **問題**: API 測試覆蓋不足
- **建議**: 為每個 API 端點添加測試

### 86. [P2] 視覺回歸測試
- **檔案**: UI 組件
- **問題**: 樣式變更可能引入視覺問題
- **建議**: 整合 Percy 或 Chromatic

### 87. [P2] 效能測試
- **檔案**: 關鍵頁面
- **問題**: 缺少效能基準測試
- **建議**: 在 CI 中添加 Lighthouse CI

### 88. [P2] 無障礙測試自動化
- **檔案**: 已安裝 `@axe-core/playwright`
- **問題**: 需確保實際運行
- **建議**: 在 E2E 測試中包含 a11y 檢查

### 89. [P2] Mock 資料管理
- **檔案**: 測試檔案
- **問題**: Mock 資料分散
- **建議**: 建立統一的 fixtures 目錄

### 90. [P2] 測試報告整合
- **檔案**: CI 配置
- **問題**: 測試結果可視化
- **建議**: 在 PR 中顯示覆蓋率變化

---

## 七、開發體驗與維護 (91-100)

### 91. [P1] 文檔完善
- **檔案**: `README.md`, `docs/`
- **問題**: 開發文檔可更完整
- **建議**: 添加架構圖、API 文檔、開發指南

### 92. [P1] 元件文檔 (Storybook)
- **檔案**: 未配置
- **問題**: 缺少組件展示和文檔
- **建議**: 引入 Storybook 進行組件開發和文檔
```bash
npx storybook@latest init
```

### 93. [P1] 型別文檔產生
- **檔案**: `src/types/`
- **問題**: API 類型文檔不完整
- **建議**: 使用 TypeDoc 產生文檔

### 94. [P2] Git Hooks 強化
- **檔案**: `.husky/`
- **問題**: 僅有 lint-staged
- **建議**: 添加 commit-msg hook 驗證 conventional commits
```bash
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

### 95. [P2] PR 模板
- **檔案**: `.github/`
- **問題**: 缺少 PR/Issue 模板
- **建議**: 添加標準化模板

### 96. [P2] CI/CD 完善
- **檔案**: CI 配置
- **問題**: 需確保完整的 CI 流程
- **建議**: 包含 lint、test、build、deploy 階段

### 97. [P2] 本地開發環境文檔
- **檔案**: `WINDOWS_DEV.md`
- **問題**: 已有 Windows 指南，可擴展
- **建議**: 添加 Mac/Linux 開發指南

### 98. [P2] 依賴更新策略
- **檔案**: `package.json`
- **問題**: 依賴版本管理
- **建議**: 使用 Dependabot 或 Renovate

### 99. [P2] 錯誤監控強化
- **檔案**: Sentry 配置
- **問題**: 已整合 Sentry，可優化
- **建議**: 設定錯誤分類和警報規則

### 100. [P2] 開發工具配置
- **檔案**: `.vscode/`
- **問題**: 可添加推薦配置
- **建議**: 添加 extensions.json 和 settings.json
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

## 優先級總結

### P0 緊急 (需立即處理)
1. 移除 `any` 類型
2. 拆分巨型組件 (learn/page.tsx, LearnCourseContent.tsx, GamesPageClient.tsx)
3. 強化 CSP 設定
4. API 輸入驗證
5. 測試覆蓋率提升

### P1 重要 (本次迭代)
- ESLint 配置強化
- 建立中間件層
- 虛擬列表實作
- 無障礙設計改善
- 關鍵路徑測試

### P2 一般 (持續改進)
- 文檔完善
- 開發工具配置
- 效能監控
- 視覺回歸測試

---

## 附錄：執行腳本參考

```bash
# 檢查 any 類型
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String ": any|as any"

# 檢查大型檔案
Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object { 
  @{File=$_.Name; Lines=(Get-Content $_ | Measure-Object -Line).Lines} 
} | Sort-Object { $_.Lines } -Descending | Select-Object -First 10

# 執行測試覆蓋率
npm run test:run -- --coverage

# Bundle 分析
npm run build:analyze

# 安全審計
npm audit --audit-level=high
```

---

*報告產生時間：2026-02-14*
*審查人員：Matrix Agent*
