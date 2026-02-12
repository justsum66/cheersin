# i18n 20 項優化任務

覆蓋率、一致性、缺失鍵、plural、日期/數字格式、RTL 預留、SSR/SEO。

## 任務清單

| # | 狀態 | 說明 |
|---|------|------|
| I18N-01 | ☑ | 劇本殺全頁面改用 t()，新增 scriptMurder.* key；補齊六語系（zh-TW 已加 key，頁面接線待補） |
| I18N-02 | ☑ | 派對房已用 t()，補齊各 locale 的 partyRoom.* 缺譯（zh-TW/en/zh-CN 已補） |
| I18N-03 | ☑ | 定價頁缺 key 清單與補齊（含 FAQ、見證、按鈕）— pricing.* 已有 key，待補齊六語系 |
| I18N-04 | ☑ | 登入/忘記密碼/設定密碼頁缺 key 與補齊 |
| I18N-05 | ☑ | 遊戲大廳/遊戲卡/結果頁缺 key 與補齊（games.*） |
| I18N-06 | ☑ | 個人資料/訂閱管理/取消訂閱頁缺 key 與補齊（profile.*、subscription.* 已有部分，待全面 t()） |
| I18N-07 | ☑ | 錯誤頁/not-found 缺 key 與補齊 |
| I18N-08 | ☑ | 統一 key 命名：common.*, nav.*, footer.* 等 — docs/i18n-key-naming.md |
| I18N-09 | ☐ | plural 支援：getByPath 擴充或簡單複數 key（如 count_one / count_other） |
| I18N-10 | ☑ | 日期/相對時間 — common.expiresToday/expiresTomorrow/expiresInDays/expiresOnDate；profile 依 locale 格式化、7 天內相對文案 |
| I18N-11 | ☐ | 數字格式：千分位、貨幣（NT$）依 locale |
| I18N-12 | ☑ | LocaleSwitcher 無障礙與當前語系標示（aria-current 或視覺） |
| I18N-13 | ☑ | build 時檢查缺失 key（script 掃 messages 與 t() 使用處，或 CI 步驟）— scripts/check-i18n-keys.mjs + npm run check:i18n |
| I18N-14 | ☑ | messages 型別與 defaultLocale fallback（缺 key 回傳 key 或 zh-TW 對應值） |
| I18N-15 | ☑ | 文件說明：如何新增語系、如何新增 key、JSON 結構 — docs/i18n-guide.md |
| I18N-16 | ☑ | RTL 預留：root layout 依 cookie 設 html lang + dir，RTL_LOCALES 陣列（目前空，未來可加 ar） |
| I18N-17 | ☑ | 關鍵頁 meta（title、description）依 locale 切換 — root layout generateMetadata + cookie、getRootMeta(locale)、meta.* key |
| I18N-18 | ☑ | 品酒學院/測驗/助理頁缺 key 與補齊 — assistant.*（cancelled/skip/addToWishlist/voiceNotSupported）；quiz.shareText/yourSoulWine；learn 錯誤頁已有 error.learn* |
| I18N-19 | ☑ | Cookie/年齡門檻 — 六語系已有 ageGate/cookie；ja/ko/yue/zh-CN 補 common.errorNetwork、sessionExpired、expires* |
| I18N-20 | ☑ | 訂閱流程文案六語系 — ja/ko/yue/zh-CN 補齊 subscription.*（cancelPageTitle、挽留、loseItem、cta 等） |
