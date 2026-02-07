# Cheersin 設計系統

任務 99：設計系統文件 — tokens、組件、用法與範例，供開發與設計對齊。

## 1. 色彩（色板與用途）

- **Primary（深酒紅 #8B0000）**：CTA 按鈕、連結、焦點環、進度條、品牌強調  
- **Secondary（香檳金 #D4AF37）**：點綴、徽章、次要強調  
- **Accent（藍紫 #8A2BE2）**：VIP/進階功能、遊戲分類、次要 CTA  
- **語義色**：error `#b91c1c`、success `#047857`、warning `#c2410c`  
- **背景**：`#1a0a2e` → `#0a0a0a` 漸層；文字層次 white / white 70% / 50% / 30%

來源：`src/config/design-tokens.ts`、`src/app/globals.css` `:root` CSS 變數。

## 2. 字級與行高

- **Type scale（rem）**：`--text-xs` 0.75rem、`--text-sm` 0.875rem、`--text-base` 1rem、`--text-lg`～`--text-5xl`、`--text-hero` clamp、`--text-h1`～`--text-h6`  
- **行高**：`--line-height-body` 1.6、`--line-height-tight` 1.25  
- **字體**：Playfair Display（標題）、Inter + Noto Sans TC（內文）

全站字級以 rem 為主，支援瀏覽器字級縮放（任務 96）。

## 3. 間距（8px grid）

- **Section**：`--space-section` 4rem、`--space-section-lg` 6rem  
- **Card**：`--space-card` 1rem、`--space-card-lg` 1.5rem  
- **Container**：`--space-container` 1rem、md 1.5rem、lg 2rem  
- **按鈕內距**：`--btn-padding-x` 2.5rem、`--btn-padding-y` 0.875rem

來源：`design-tokens.ts` `spacing`、globals `:root`。

## 4. 圓角與陰影

- **圓角**：`--radius-lg` 1rem、`--radius-md` 0.75rem；按鈕使用 `var(--radius-lg)`  
- **陰影**：design-tokens `shadows`（sm/base/md/lg/xl、glow.primary/secondary）；焦點環 `--focus-ring` 0 0 0 3px rgba(139,0,0,0.6)

## 5. 按鈕與輸入框

- **按鈕**：`.btn-primary`、`.btn-secondary`、`.btn-ghost`、`.btn-danger`；min-height 48px、focus-visible outline 2px + offset 2px  
- **輸入**：`.input-glass`、min-h 44px、focus-visible ring 與 border 過渡  
- **觸控**：`.games-touch-target`、`.min-touch` 48px；可點擊元素 ≥44px

## 6. 動畫 duration / easing

- **Duration**：fast 0.15s、base 0.3s、slow 0.5s（`design-tokens.ts` `animations`）  
- **Easing**：brand `cubic-bezier(0.32, 0.72, 0, 1)`；主題切換 background/color 0.25s ease（任務 95）

## 7. 組件清單與用法

- **導航**：`Navigation`、skip link、主導航/底部導航  
- **反饋**：`Toaster`（react-hot-toast）、`ErrorFallback`、`ConfirmDialog`  
- **橫幅**：`OfflineBanner`、`CookieConsentBanner`、`AddToHomeScreenBanner`、`MaintenanceBanner`  
- **表單**：登入、訂閱、FAQ 手風琴  
- **遊戲**：`GameWrapper`、規則 Modal、焦點陷阱、觸控 48px

文案與錯誤訊息：`src/config/copy.config.ts`、`src/config/errors.config.ts`、`src/config/toast.config.ts`。

---

## 8. 完美像素精細調校（微交互、排版、對比）

來源：完美像素審查（PERFECT_PIXEL_REVIEW.md）P0–P2 採用的數值，供未來改版與新成員對齊。

### 8.1 微交互時長

| 項目 | 數值 | 理由 |
|------|------|------|
| 主按鈕 / 連結 / 焦點環過渡 | 200ms | NNG 黃金法則：100–300ms 最佳感知響應 |
| 主按鈕脈動陰影 | 2.8s ease-in-out | 節奏舒緩、不搶焦點 |
| 漸層文字動畫 | 7s ease infinite | 略輕快、不干擾閱讀 |
| 骨架 shimmer | 1.5s ease-in-out | 載入狀態可辨識 |
| Loading 旋轉 | 0.8s linear | 與按鈕過渡同一量級 |

### 8.2 排版精調

| 項目 | 數值 | 用途 |
|------|------|------|
| 標題 letter-spacing | -0.025em（h1/h2）、-0.02em（h3） | 視覺緊湊、階層清晰 |
| 正文行高 | 1.65（--line-height-body） | 可讀性與無障礙 |
| 輸入框 placeholder | rgba(255,255,255,0.38) | 略弱於內容層次、不搶視覺 |

### 8.3 對比與無障礙

| 項目 | 數值 | 用途 |
|------|------|------|
| 焦點環 | rgba(139,0,0,0.8) | 對比 ≥3:1、WCAG 可見 |
| reduced-motion | 全站尊重 | @media (prefers-reduced-motion: reduce)：animation/transition 關閉或 0.01ms |
| 按鈕 hover | will-change: transform（僅 hover） | GPU 合成、60fps，預設 will-change: auto 省記憶體 |
