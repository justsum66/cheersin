# Cursor 指令 v2：全站品牌 Logo 系統部署（路徑修正版）

## 背景

我們剛完成了 Cheersin 品牌重塑，中文名確定為「沁飲」，Logo 已全部重新設計。現在需要你將新的 Logo 資產部署到整個 Next.js 專案中，替換所有舊的 Logo。這是一個**修改現有代碼**的任務，不是重寫。請保留所有現有功能和邏輯，只替換 Logo 相關的部分。

**重要：** 新的 Logo 檔案都放在 `public/` 根目錄下，`sizes` 資料夾也直接在 `public/` 下。所有路徑引用都必須從根目錄開始，**沒有 `brand/` 這個子目錄**。

---

## 新 Logo 資源清單

請先審查 `public/` 目錄下的新 Logo 檔案，了解所有可用的 Logo 版本。以下是關鍵檔案的用途說明：

### 原始高解析度 Logo（`public/` 根目錄）

| 檔案名 | 用途 | 背景 |
|:---|:---|:---|
| `logo_monochrome_gold.png` | **主力 Logo** — 金色線條，全站深色背景首選 | 黑底 |
| `logo_monochrome_white.png` | 白色線條版本，用於需要低對比的場景（如頁尾） | 黑底 |
| `logo_horizontal_dark.png` | 橫版 Logo，深色背景用（適合導航欄） | 深色 |
| `logo_icon_transparent.png` | 純圖標，透明背景（去背版） | 透明 |

### 多尺寸版本（`public/sizes/` 子目錄）

| 檔案名 | 尺寸 | 用途 |
|:---|:---|:---|
| `favicon.ico` | 16+32+48 | 瀏覽器頁籤 favicon |
| `apple_touch_180.png` | 180x180 | Apple Touch Icon (iPhone) |
| `android_192.png` | 192x192 | Android PWA 圖標 |
| `android_512.png` | 512x512 | Android PWA 啟動畫面 |
| `icon_128_gold.png` | 128x128 | 小型圖標（金色版） |
| `og_image_1200x630.png` | 1200x630 | 社群分享 OG Image |

---

## 需要修改的檔案和具體任務

### 任務 1：更新 `src/components/BrandLogo.tsx`

這是全站品牌 Logo 的核心統一元件。

1. 將常數 `LOGO_SRC` 從 `'/logo.png'` 修改為 `'/logo_monochrome_gold.png'`。這是我們的新主力 Logo。

2. 同時新增一個常數 `LOGO_ICON_SRC`，值為 `'/sizes/icon_128_gold.png'`，用於需要小型圖標的場景。

3. 將 `BRAND_TAGLINE` 從 `'Sensory Lab'` 修改為 `'沁飲 Sensory Lab'`，在 tagline 中加入中文名。

4. 確保 `export { BRAND_NAME, LOGO_SRC }` 也同時導出新增的 `LOGO_ICON_SRC`。

---

### 任務 2：更新 `src/app/layout.tsx`（全站 Metadata）

1. 找到 `metadata.icons` 物件，更新所有圖標路徑：
   - `icon` 陣列中的 favicon 路徑改為 `'/sizes/favicon_16.png'`（16x16）和 `'/sizes/favicon_32.png'`（32x32）
   - `apple` 陣列改為 `'/sizes/apple_touch_180.png'`（180x180）
   - 新增一個 `shortcut` 屬性，指向 `'/sizes/favicon.ico'`

2. 找到 `<link rel="preload" href="/logo.png" ...>` 這一行，將 `href` 修改為 `'/logo_monochrome_gold.png'`。

---

### 任務 3：更新 `src/app/manifest.ts`（PWA Manifest）

1. 更新 `icons` 陣列中的所有路徑：
   - 192x192 的 `src` 改為 `'/sizes/android_192.png'`
   - 512x512 的 `src` 改為 `'/sizes/android_512.png'`
   - 16x16 的 `src` 改為 `'/sizes/favicon_16.png'`
   - 32x32 的 `src` 改為 `'/sizes/favicon_32.png'`
   - 144x144 和 384x384 的 `src` 改為 `'/sizes/icon_256_gold.png'` 和 `'/sizes/icon_512_gold.png'`

2. 更新 `screenshots` 陣列：
   - 將兩個 screenshot 的 `src` 從 `${BASE}/logo.png` 改為 `${BASE}/sizes/og_image_1200x630.png`
   - 將 `sizes` 改為 `'1200x630'`

3. 更新 `name` 從 `'Cheersin 乾杯 | 探索你的靈魂之酒'` 改為 `'Cheersin 沁飲 | 探索你的靈魂之酒'`。

4. 更新 `short_name` 從 `'Cheersin'` 改為 `'沁飲 Cheersin'`。

---

### 任務 4：更新 `src/app/assistant/page.tsx`（AI 侍酒師頁面）

這個頁面有 3 處直接引用 `/logo.png` 作為 AI 聊天頭像。

1. 全域搜索此檔案中的 `src="/logo.png"`，共有 3 處。
2. 將所有 3 處的 `src` 從 `"/logo.png"` 修改為 `"/sizes/icon_128_gold.png"`。

---

### 任務 5：更新所有 `opengraph-image.tsx`（社群分享預覽圖）

對於主要的 `src/app/opengraph-image.tsx`：
1. 修改它，讓它讀取我們預先生成好的 `public/sizes/og_image_1200x630.png` 檔案。
2. 使用 `fs.readFileSync` 或 `fetch` 來讀取這個圖片檔案，然後將其作為 `Response` 返回，Content-Type 設為 `image/png`。
3. 對於其他 4 個 opengraph-image 檔案，也做類似的修改，在 OG 圖中加入新的 Logo 圖標和「沁飲」中文名。

---

### 任務 6：更新 `public/sw.js`（Service Worker）

1. 找到 `STATIC_URLS` 陣列。
2. 將其中的舊路徑替換為新路徑：
   - `'logo.png'` 改為 `'logo_monochrome_gold.png'`
   - `'favicon-32x32.png'` 改為 `'sizes/favicon_32.png'`
   - `'favicon-16x16.png'` 改為 `'sizes/favicon_16.png'`
   - `'icons/icon-192.png'` 改為 `'sizes/android_192.png'`
   - `'icons/icon-512.png'` 改為 `'sizes/android_512.png'`

---

### 任務 7：更新 `src/app/(app)/games/layout.tsx` 和 `src/app/learn/certificate/layout.tsx`

1. 找到這兩個檔案中的 `images: [{ url: ...}]`。
2. 將 `url` 中的 `'/icons/icon-512.png'` 修改為 `'/sizes/icon_512_gold.png'`。

---

### 任務 8：全域最終掃描

1. 在整個專案中執行全域搜索，搜索以下字串，確保沒有遺漏：
   - `"/logo.png"`
   - `"/favicon-`
   - `"/icons/icon-`

2. 如果還有遺漏的引用，請根據上下文將它們替換為 `public/` 中對應的新檔案。

---

## 完成後的驗證清單

請在完成所有修改後，逐一確認：

- [ ] 瀏覽器頁籤顯示新的 favicon
- [ ] 導航欄 Logo 顯示新的金色 Logo + 「沁飲 Sensory Lab」tagline
- [ ] AI 侍酒師聊天頁面的 AI 頭像是新的金色小圖標
- [ ] PWA 安裝時顯示新的 Android 圖標
- [ ] 社群分享預覽（OG Image）顯示新的品牌圖片
- [ ] Service Worker 快取的是新的 Logo 路徑
- [ ] 全域搜索 `"/logo.png"` 返回 0 結果
- [ ] 沒有任何 console 錯誤或 404 圖片請求
