# I18N-008 / UX-019：SEO 與 og 依 locale 審計

## 摘要

layout `generateMetadata` 已依 cookie `cheersin_locale` 切換 title、description、ogTitle、ogDescription；meta 與 OG 與 locale 一致。

## 實作位置

- `src/app/layout.tsx` — `generateMetadata()` 呼叫 `getRootMeta(locale)`
- `src/lib/i18n/server-meta.ts` — `getRootMeta()` 從 messages 取 meta.defaultTitle、meta.defaultDescription、meta.ogTitle、meta.ogDescription
- messages/*.json — 各 locale 的 meta.* 欄位

## 勾選摘要

- [x] title 依 locale
- [x] description 依 locale
- [x] og:title、og:description 依 locale
- [x] openGraph.locale 依 locale（zh_TW、zh_CN、en_US 等）
- [ ] hreflang：目前為 cookie 語系，無 URL 路徑區分；若未來改為 /zh-TW/、/en/ 路由，可補 alternates.languages

## UX-019：meta 描述差異化

- 首頁 meta 已依 locale 差異化
- 子頁（quiz、games、learn 等）若有 `generateMetadata`，可依 locale 傳入不同 description

**更新日期**：2026-02-12
