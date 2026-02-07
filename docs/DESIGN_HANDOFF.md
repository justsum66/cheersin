# Cheersin 設計師交接清單

任務 100：設計師與開發交接 — 色板、字級、間距、組件、變更流程。

## 色板（hex / 代碼）

| 用途     | Hex       | CSS / Tailwind 備註        |
|----------|-----------|----------------------------|
| Primary  | #8B0000   | primary-500、rgb(139,0,0)  |
| Secondary| #D4AF37   | secondary-500、香檳金       |
| Accent   | #8A2BE2   | accent-500、VIP/進階       |
| Error    | #b91c1c   | red-700 語義               |
| Success  | #047857   | emerald-700 語義           |
| 背景起   | #1a0a2e   | 漸層起點                   |
| 背景終   | #0a0a0a   | 漸層終點、主背景           |

## 字級（rem 與用途）

- 0.75rem：輔助、標籤  
- 0.875rem：小內文、按鈕小字  
- 1rem：內文基準  
- 1.125rem～1.5rem：小標、卡片標題  
- 1.875rem～2.25rem：區塊標題 h2  
- 3rem～3.5rem：首屏 h1、hero  

全站以 rem 為主，避免固定 px 以支援字級縮放。

## 間距（8px grid）

- 8px、16px、24px、32px、48px、64px 為常用；section 4rem/6rem、card 1rem/1.5rem。

## 組件清單

- **按鈕**：主/次/ghost/danger、48px 最小高、圓角 1rem  
- **輸入**：input-glass、44px 最小高、焦點環 primary  
- **卡片**：glass-card、圓角、邊框 white/10  
- **Modal**：規則彈窗、ConfirmDialog、z-index 低於 Toaster 層級  
- **橫幅**：離線/Cookie/PWA/維護，不擋首屏 CTA  

## Figma / 設計稿連結

（可在此填入 Figma 或設計稿連結）

## 變更流程

1. **提出**：設計變更以 issue 或 PR 說明，附截圖或 Figma 連結。  
2. **審核**：產品/設計確認後，開發依 DESIGN_SYSTEM.md 與 tokens 實作。  
3. **對齊**：色碼、字級、間距以 `design-tokens.ts` 與 `globals.css` 為單一來源；新增 token 時同步更新本文件與 DESIGN_SYSTEM.md。

與 DESIGN_SYSTEM.md 互補，不重複細節；開發以 DESIGN_SYSTEM 為實作參考，本文件為設計師交接用。
