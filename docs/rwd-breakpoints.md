# UX-009：響應式斷點與 RWD 文件

本文件紀錄全站斷點與對應用途，供設計與開發對齊。

## 三斷點定義

| 斷點 | 最小寬度 | Tailwind 前綴 | 用途 |
|------|----------|---------------|------|
| sm   | 640px    | `sm:`         | 小型平板、橫向手機 |
| md   | 768px    | `md:`         | 平板、小桌機；頂部導航取代底部導航 |
| lg   | 1024px   | `lg:`         | 桌機、寬螢幕 |

來源：`src/lib/design-tokens.ts` `screens`、Tailwind `theme.extend.screens`。

## 主要區塊對應

| 區塊 | 手機 <640px | sm 640–768 | md 768+ | lg 1024+ |
|------|-------------|------------|---------|----------|
| 導航 | 底部導航固定 | 同上 | 頂部導航、底部隱藏 | 同上 |
| main 底部 padding | `main-content-pb` 5rem + safe-area | 同上 | `md:pb-0` 無額外 | 同上 |
| 頁面水平 padding | `page-container-mobile` 1rem + safe-area | 同上 | 1.5rem | 2rem |
| 觸控目標 | 48px 全站 | 同上 | 同上 | 同上 |

## 驗收

- 三斷點無錯位；320px–1920px 適配
- 手機底部導航、鍵盤彈起時 UX-004 確保可操作
