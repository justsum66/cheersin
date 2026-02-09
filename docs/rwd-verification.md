# RWD 驗證清單（R2-009 對應）

P0 R2-009：360px (iPhone SE) ～ 1920px (Desktop) 無破損或橫向滾動條。

## 斷點檢查

| 寬度 | 裝置代表 | 重點頁面 | 備註 |
|------|----------|----------|------|
| 360px | iPhone SE | 首頁、遊戲列表、定價、品酒學院、助理 | 無 overflow-x、觸控 44px |
| 390px | iPhone 14 | 同上 | 漢堡選單、Modal 全屏 |
| 768px | iPad 豎屏 | 同上 | 導航可展開 |
| 1024px | iPad 橫屏 | 同上 | Bento/網格不破版 |
| 1920px | Desktop | 同上 | 最大寬度容器、無過度拉伸 |

## 已知修復

- Footer/Header 已依 footer-30-tasks、header-10-tasks 做 RWD 與 focus-visible、觸控目標。
- 遊戲頁面：GamesPageClient 與 GameWrapper 具備響應式佈局。
- 定價頁、品酒學院：使用 Tailwind 斷點 md/lg。

## 驗證方式

1. Chrome DevTools → Toggle device toolbar，切換 360 / 768 / 1920。
2. 檢查 `overflow-x: auto` 或 `overflow-x: scroll` 僅出現在預期之橫向捲動區（如表格），不在 body/main。
3. 本文件作為 R2-009 驗收依據，後續可補具體截圖或 E2E 視窗測試。
