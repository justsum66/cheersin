# 設計師覆核清單 — 與設計稿對齊

**用途**：以 docs/DESIGN_SYSTEM.md、docs/DESIGN_HANDOFF.md 與審查報告對齊設計稿（Figma 或視覺規格）。  
**產出**：本清單供設計師逐項勾選，確保開發實作與設計一致。

---

## 1. 色彩對齊（DESIGN_SYSTEM §1、DESIGN_HANDOFF 色板）

| 項目 | 設計稿 | 實作來源 | 審查備註 |
|------|--------|----------|----------|
| Primary CTA / 連結 | #8B0000 | globals --primary、btn-primary | UX 審查 1–7、81 |
| Secondary 點綴 | #D4AF37 | secondary-500 | DESIGN_HANDOFF 表 |
| Accent VIP/進階 | #8A2BE2 | accent-500 | 同上 |
| 錯誤 / 成功 / 警告 | 語義色 | errors.config、globals --error/--success/--warning | 任務 91、66 |
| 背景漸層 | #1a0a2e → #0a0a0a | globals --background-start/end | DESIGN_SYSTEM §1 |
| 文字層次 | white / 70% / 50% / 30% | globals --text-primary 等 | 任務 96 |

**對齊動作**：設計稿色碼與上表一致；若有新增色，需加入 design-tokens 並更新 DESIGN_SYSTEM + DESIGN_HANDOFF。

---

## 2. 字級與排版（DESIGN_SYSTEM §2、DESIGN_HANDOFF 字級）

| 項目 | 設計稿 | 實作來源 | 審查備註 |
|------|--------|----------|----------|
| 字級單位 | rem | globals :root --text-* | 任務 96 字級縮放 |
| Hero / h1 | 3rem～3.5rem、clamp | --text-hero、home-heading-1 | UX 審查 6、14 |
| 區塊標題 h2 | 1.875rem～2.25rem | home-heading-2、--text-h2 | 同上 |
| 小標 / 卡片標題 | 1.125rem～1.5rem | home-heading-3、--text-h3 | 同上 |
| 內文 | 1rem | --text-base、--line-height-body 1.65 | 任務 241 正文行高 |
| 標題字距 | -0.025em / -0.02em | .home-heading-1 / .home-heading-2 | DESIGN_SYSTEM §8.2 |
| 字體 | Playfair Display、Inter、Noto Sans TC | layout next/font、globals --font-* | 任務 61 |

**對齊動作**：設計稿字級與 rem 對照表一致；標題 letter-spacing 與 §8.2 一致。

---

## 3. 間距與 8px grid（DESIGN_SYSTEM §3、DESIGN_HANDOFF 間距）

| 項目 | 設計稿 | 實作來源 | 審查備註 |
|------|--------|----------|----------|
| Section 間距 | 4rem / 6rem | --space-section、--space-section-lg | 任務 133、42 |
| Card 內距 / gap | 1rem / 1.5rem | --space-card、--space-card-lg | 同上 |
| 按鈕內距 | 2.5rem 水平、0.875rem 垂直 | --btn-padding-x/y | DESIGN_SYSTEM §3 |
| 主要間距為 8 倍數 | 8/16/24/32/48/64 px | design-tokens、globals | 任務 42 |

**對齊動作**：設計稿間距與 8px grid 及 token 對照一致。

---

## 4. 圓角與陰影（DESIGN_SYSTEM §4）

| 項目 | 設計稿 | 實作來源 | 審查備註 |
|------|--------|----------|----------|
| 按鈕圓角 | 1rem / 0.75rem | --radius-lg、--radius-md | 任務 7、33 |
| 卡片圓角 | 1rem～1.5rem | rounded-2xl、shadow-glass-* | 任務 25、57 |
| 焦點環 | 2px outline + 2px offset | .games-focus-ring、--focus-ring | 任務 82 |
| 主按鈕 hover 陰影/高光 | 10px/28px、inset 0.18 | .btn-primary:hover | 完美像素 P0 |

**對齊動作**：按鈕/卡片圓角與陰影與 DESIGN_SYSTEM §4 及審查報告一致。

---

## 5. 按鈕與輸入框（DESIGN_SYSTEM §5）

| 項目 | 設計稿 | 實作來源 | 審查備註 |
|------|--------|----------|----------|
| 主/次/ghost 按鈕 | 48px 最小高、圓角 1rem | .btn-primary、.btn-secondary、.btn-ghost | 任務 7、83 |
| 按鈕 hover 過渡 | 200ms | globals transition 200ms、brand easing | 完美像素 P0 |
| 輸入框最小高 | 44px～48px | .input-glass min-h、games 48px | 任務 83 |
| 輸入框焦點環 | 2px primary、offset 2px | .input-glass :focus-visible | 任務 82 |

**對齊動作**：觸控目標 ≥44px、焦點環可見；與 DESIGN_HANDOFF 組件清單一致。

---

## 6. 動畫與過渡（DESIGN_SYSTEM §6、§8.1）

| 項目 | 設計稿 | 實作來源 | 審查備註 |
|------|--------|----------|----------|
| 按鈕/連結過渡 | 200ms、brand easing | globals 200ms、cubic-bezier(0.32,0.72,0,1) | 任務 16、完美像素 P0 |
| 主題切換 | 0.25s | html/body transition | 任務 95 |
| 骨架 shimmer | 1.5s、opacity 0.45–0.85 | .skeleton-shimmer | 任務 64、完美像素 P1 |
| reduced-motion | 關閉或極簡 | @media prefers-reduced-motion、組件分支 | 任務 70、完美像素 P3 |

**對齊動作**：動畫時長與 DESIGN_SYSTEM §8.1 表一致；reduced-motion 有對應處理。

---

## 7. 組件與審查報告對照

| 組件/頁面 | 設計稿檢查 | 審查報告索引 |
|-----------|------------|--------------|
| 首頁 Hero CTA | 單一主 CTA、52px、陰影 | UX 審查 1、3、6；完美像素 P0 |
| 定價方案卡 | 推薦卡 ring、主卡 btn 字級 | UX 審查 1、4、9 |
| 登入表單 | 區塊對比、必填 *、錯誤區塊 | UX 審查 2、10、47、84 |
| 測驗入口/進度 | 主 CTA 單一、進度條 RWD | UX 審查 3、12、29、62 |
| 助理頁 | 輸入區 sticky、快速回覆 48px | UX 審查 11、58、67 |
| 學院課程卡/目錄 | 圓角陰影、當前章節高亮 | UX 審查 25、36、52 |
| 遊戲大廳/規則 Modal | 卡片 hover、Modal 關閉 48px、焦點陷阱 | UX 審查 13、24、77、88 |
| 訂閱成功/取消 | 成功綠色、取消頁 CTA 層次 | UX 審查 5、37、85 |
| 個人頁/登出 | 成就卡 hover、登出確認 Dialog | UX 審查 56、90 |
| 橫幅 | 離線/Cookie/PWA 文案與不擋 CTA | UX 審查 93、94、98 |

**對齊動作**：設計稿與上列組件規格一致；若有差異，以 DESIGN_SYSTEM + design-tokens 為準並更新設計稿或實作。

---

## 8. 設計稿連結與變更流程（DESIGN_HANDOFF）

- **Figma / 設計稿連結**：填入 DESIGN_HANDOFF.md「Figma / 設計稿連結」一節。
- **變更流程**：提出 → 產品/設計審核 → 開發依 DESIGN_SYSTEM 與 tokens 實作 → 同步更新 DESIGN_SYSTEM、DESIGN_HANDOFF、本清單。

---

**使用方式**：設計師依本清單逐項與設計稿比對，勾選通過或註記差異；差異處依變更流程更新設計稿或程式，並同步 tokens 與文件。
