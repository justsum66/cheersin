# UX-020：離線/網路錯誤提示審計

## 摘要

OfflineBanner 已實作並置於 layout，離線時顯示橫幅、上線後隱藏；文案多語。

## 實作位置

- `src/components/OfflineBanner.tsx`
- `src/app/layout.tsx` — 引入並渲染 `<OfflineBanner />`
- messages — `common.offlineMessage` 多語

## 功能

- `navigator.onLine` + `online`/`offline` 事件監聽
- `role="alert"`、`aria-live="assertive"` 語意化
- 文案 `t('common.offlineMessage')` 支援 zh-TW、en、zh-CN 等
- print 時隱藏（print.css）

## 勾選摘要

- [x] 離線時顯示橫幅
- [x] 上線後隱藏
- [x] 文案多語
- [x] 語意化 role/aria

**更新日期**：2026-02-12
