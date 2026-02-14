# Cheersin - 你的 AI 派對靈魂伴侶 🎉

現代化派對遊戲與靈魂酒測平台：超過 90+ 款互動遊戲、AI 侍酒師、品酒學院與 18+ 辣味專區。專為聚會、情侶與派對設計。

## 🚀 功能特色

### 🎮 遊戲集合
- **30+ 精選派對遊戲** - 涵蓋經典與創新遊戲
- **多種遊戲類型**：
  - 🎉 派對遊戲 (Party) - 經典聚會遊戲
  - ⚡ 反應測試 (Reaction) - 考驗反應速度
  - 🎯 競技對決 (Guess) - 猜測與策略遊戲
  - 🎲 隨機選人 (Draw) - 抽籤與選擇遊戲
  - 👀 2人專屬 (Face-to-face) - 雙人互動遊戲
  - 🔞 18+辣味 (Adult) - 成人主題遊戲

### 🎨 技術亮點
- **現代化UI設計** - 使用Tailwind CSS和玻璃擬態效果
- **流暢動畫** - Framer Motion驅動的互動體驗
- **響應式設計** - 完美適配手機、平板和桌面設備
- **即時多人遊戲** - Supabase實時功能支持
- **音效反饋** - 沉浸式遊戲體驗
- **遊戲狀態持久化** - 本地存儲和雲端同步

### 🔧 技術棧
- **前端框架**: Next.js 15.5.7 (App Router) — P2-221：升級時請見 `package.json` 依賴與本說明
- **語言**: TypeScript
- **UI庫**: React 19
- **樣式**: Tailwind CSS
- **動畫**: Framer Motion
- **後端**: Supabase (PostgreSQL + Realtime)
- **部署**: Vercel

## 🔒 安全措施

### 環境變數保護
```bash
# 已在 .gitignore 中保護的敏感文件
.env.local
.env.production
.env.development.local
.env.test.local
.env.production.local
```

### API密鑰管理
- 所有第三方API密鑰通過環境變數管理
- 敏感配置不在版本控制中
- 使用Vault或加密服務進行密鑰輪換

### 安全實踐
- 輸入驗證和清理
- 防止XSS和CSRF攻擊
- 安全的會話管理
- 適當的錯誤處理，避免信息洩露

## 📁 專案結構

```
cheersin/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React組件
│   │   └── games/          # 遊戲組件
│   ├── config/             # 配置文件
│   ├── contexts/           # React Context
│   ├── hooks/              # 自定義Hooks
│   ├── lib/                # 工具函數和邏輯
│   └── types/              # TypeScript類型
├── data/                   # 靜態數據
├── supabase/               # 數據庫遷移和函數
├── public/                 # 靜態資源
└── scripts/                # 腳本工具
```

## 🚀 快速開始

### 環境要求
- Node.js 18+
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/justsum66/cheersin.git
cd cheersin
```

2. **安裝依賴**
```bash
npm install
```

3. **環境配置（必讀）**
```bash
# 複製環境變數範本（完整變量與註解見 .env.example）
cp .env.example .env.local

# 編輯 .env.local 並填入你的配置
```
**關鍵環境變量：** `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`（後端）、`GROQ_API_KEY`（Chat 主線，必填）、`OPENROUTER_API_KEY`（Embedding + Chat fallback，必填）、`NVIDIA_NIM_API_KEY`（Chat fallback，選填）。Chat 順序由 `CHAT_PRIMARY`、`CHAT_FALLBACK_ORDER` 控制（預設 groq → nim → openrouter）。PayPal 相關（`PAYPAL_CLIENT_ID`、`PAYPAL_CLIENT_SECRET`、`PAYPAL_WEBHOOK_ID`）。詳見 [.env.example](.env.example)。

**後端 env 單一來源：** 所有 API、lib、scripts 應經 `src/lib/env-config.ts` 讀取環境變數，勿在 route/lib 直接使用 `process.env`（除 `NODE_ENV` 等框架用變數）。

4. **啟動開發伺服器**
```bash
npm run dev
```

5. **訪問應用**
打開瀏覽器訪問 `http://localhost:3000`（改埠：`PORT=3099 npm run dev`）

### 常用指令
```bash
npm run validate-env  # 驗證環境變數（start 前自動執行）
npm run lint         # ESLint 檢查
npx tsc --noEmit     # TypeScript 型別檢查
npm run build        # 生產建置
npm run test:run     # 單次全量測試
npm run test:stress  # 兩輪測試（壓力/穩定性）
```

### 部署／整合前檢查
建議在提交或部署前依序執行：
1. `npm run validate-env` — 檢查 .env.local 必填與格式
2. `npm run lint` — 程式碼風格
3. `npx tsc --noEmit` — 型別檢查
4. `npm run test:run` — 單元與整合測試
5. `npm run build` — 生產建置

## 🎯 建置與部署（DEV-011）

新人可依下列步驟跑起專案：**快速開始**（上方）→ **建置** `npm run build` → **啟動** `npm start`。詳見 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

### Vercel 部署（推薦）
```bash
# 安裝 Vercel CLI
npm install -g vercel

# 部署到 Vercel（需先設定環境變數於 Vercel 專案）
vercel
```

靜態資源由 Vercel Edge/CDN 提供；關鍵 API 的 Cache-Control 見 `docs/performance-audit.md`（PERF-019/PERF-008）。

### 手動部署
```bash
# 建置生產版本
npm run build

# 啟動生產伺服器（需已設定 .env.local 或生產環境變數）
npm start
```

CI 流程與本地一致：lint → unit tests → build → E2E；見 `CONTRIBUTING.md`。

## 🧪 測試

```bash
# 開發模式（watch）
npm test

# 單次執行全部測試（CI）
npm run test:run
# 或
npx vitest run

# 單一檔案或路徑
npx vitest run src/lib/example.test.ts

# 遊戲 smoke 測試
npx vitest run src/components/games/__tests__/games.smoke.test.tsx
```

## 📊 監控與日誌

### 錯誤追蹤
- 集中式錯誤記錄
- 用戶行為分析
- 性能監控

### 日誌管理
```typescript
// src/lib/logger.ts
import { logger } from '@/lib/logger'

logger.info('遊戲開始', { gameId, players })
logger.error('遊戲錯誤', { error, gameId })
```

## 🔄 數據庫遷移

```bash
# 首次或更換專案：需先 link（連結遠端 Supabase 專案）
npm run supabase:link
# 或：npx supabase link --project-ref wdegandlipgdvqhgmoai

# 推送 migrations 到遠端 DB
npm run supabase:push

# 一鍵：link + db push + functions deploy（需 .env.local 有 SUPABASE_DB_PASSWORD）
npm run supabase:deploy
```

若 `supabase:push` 報錯 `Cannot find project ref. Have you run supabase link?`，請先執行 `npm run supabase:link`。無 CLI 權限時，可到 Supabase Dashboard → SQL Editor 手動執行 `supabase/migrations/RUN_ALL_IN_DASHBOARD.sql`。

## API 錯誤碼一覽

API 錯誤回應格式為 `{ success: false, error: { code, message } }`。錯誤碼與使用者訊息以 **單一來源** 定義於 `src/lib/api-error-codes.ts`，供 route 與前端 i18n 對齊。

| 領域 | 常數物件 | 用途 |
|------|----------|------|
| 遊戲房間 | `ROOM_ERROR` / `ROOM_MESSAGE` | `/api/games/rooms`、`/api/games/rooms/[slug]/*` |
| 學習 | `LEARN_ERROR` / `LEARN_MESSAGE` | `/api/learn/*`（筆記、證書、討論、品酒筆記、進度） |
| 管理後台 | `ADMIN_ERROR` / `ADMIN_MESSAGE` | `/api/admin/*`（knowledge、users、usage） |

完整錯誤碼與訊息請見 [docs/api-error-codes.md](docs/api-error-codes.md)。

## 🤝 貢獻指南

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

本專案採用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解更多資訊。

## 📞 支援

如有問題或建議，請通過以下方式聯繫：

- 開啟 [GitHub Issue](https://github.com/justsum66/cheersin/issues)
- 發送郵件至 support@cheersin.app

---

**Cheersin - 讓每一次聚會都充滿歡樂！** 🎊