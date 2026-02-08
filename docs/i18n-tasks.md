# i18n 優化任務清單（15 項）

目標：亞洲 #1 AI 酒類 SaaS，六語系 — 繁中、簡中、粵語、英文、日文、韓文。

## 已完成（15/15）

| # | 任務 | 狀態 | 備註 |
|---|------|------|------|
| 1 | 導航改為 t('nav.*') | ✅ | NAV_ITEMS 改為 navKey，Navigation 使用 useTranslation + t(\`nav.${item.navKey}\`) |
| 2 | 首頁 CTA / tagline 改為 t('common.*') | ✅ | Hero 標題 t('common.heroTitle1/2')、主 CTA t('common.cta')、次連結 t('nav.games/assistant/learn') |
| 3 | 年齡門改為 t('ageGate.*') | ✅ | AgeGate 全文案：title, desc, confirm, under18, under18Title, under18Desc, leave, disclaimer |
| 4 | Footer 語系切換與 t('footer.*') | ✅ | LocaleSwitcher、footer 連結/區塊標題用 t() |
| 5 | messages 六語系補齊 | ✅ | zh-TW, zh-CN, yue, en, ja, ko 含 common/nav/footer/ageGate 完整鍵 |
| 6 | 主內容區 RWD 統一 | ✅ | page-container-mobile 用於 Hero、Quiz、Learn、Pricing、Assistant、Profile、Login、AgeGate |
| 7 | I18nProvider 接入 | ✅ | ClientProviders 包 I18nProvider，cookie cheersin_locale 持久化 |
| 8 | 語系切換器 UI | ✅ | Footer 內 LocaleSwitcher（select），觸控 44px |
| 9 | 設計 token 與 safe-area | ✅ | globals.css 含 page-container-mobile、touch-target、safe-area-* |
| 10 | 首頁 Hero 區 i18n | ✅ | 標題、CTA、次連結皆 t() |
| 11 | 導航桌面/行動/選單一致 | ✅ | 三處皆用 t(\`nav.${item.navKey}\`) |
| 12 | 年齡門六語系文案 | ✅ | 六個 JSON 皆含 ageGate.* 完整鍵 |
| 13 | common 鍵擴充 | ✅ | heroTitle1, heroTitle2, cta, tagline, loading, error, save, cancel, close |
| 14 | nav 鍵完整 | ✅ | home, quiz, games, learn, assistant, pricing, login, profile |
| 15 | 文檔與報告對齊 | ✅ | 本文件 + 報告完成率更新 |

## 後續建議

- 定價頁、登入頁、Quiz 結果頁、Assistant 佔位符等逐步改為 t()
- Cookie 橫幅、not-found、error 頁文案納入 messages
- 若有 E2E，語系切換後關鍵路徑改用可選 data-testid 或 role 穩定選取
