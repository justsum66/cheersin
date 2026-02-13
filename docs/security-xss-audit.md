# SEC-006：XSS 審計

## 概述

用戶輸入與輸出皆經 sanitize 或 React 轉義，無未淨化的 `dangerouslySetInnerHTML`。

## dangerouslySetInnerHTML

| 位置 | 用法 | 風險 |
|------|------|------|
| `SafeJsonLdScript.tsx` | `JSON.stringify(data)` 輸出結構化物件 | ✅ 低：僅結構化 JSON-LD，非用戶 HTML |

**政策**：僅允許 `type="application/ld+json"` 且內容為 `JSON.stringify(結構化物件)`。禁止將用戶輸入或 API 回傳的原始 HTML 寫入。

## 用戶輸入 Sanitize

| 路徑 | 處理 |
|------|------|
| `api/games/rooms/[slug]/join` | `sanitizeUserInput(rawName, 20)` 暱稱 |
| `api/chat` | `sanitizeUserInput()` 訊息內容 |
| `api/report` | `stripHtml` |
| `api/games/rooms` | `stripHtml` |
| `api/games/rooms/.../script-murder` | `stripHtml` |
| `GamesPageClient` | `sanitizePlayerName()` 移除 `<>\"'&` |
| `GameWrapperBody` | `stripHtml`（規則內容） |

## Markdown / AI 回覆

- `MarkdownMessage` 使用 react-markdown，**預設不解析 raw HTML**（無 rehype-raw）
- 連結 `javascript:` 已阻擋
- AI 內容經 markdown 解析為 React 節點，非 innerHTML

## 相關程式

- `src/lib/sanitize.ts`：`sanitizeHtml`、`stripHtml`、`sanitizeUserInput`
- `src/lib/games-sanitize.ts`：`stripHtml`（規則）
- `src/components/SafeJsonLdScript.tsx`
