# i18n Key 命名規範與審計（I18N-08）

本文件定義 key 的命名空間與命名原則，避免重複、便於審計與 fallback。

## 命名空間一覽

| 前綴 | 用途 | 範例 |
|------|------|------|
| `common.*` | 全站通用：按鈕、狀態、錯誤 | `common.loading`, `common.error`, `common.cancel`, `common.copied` |
| `nav.*` | 導覽列、選單 | `nav.home`, `nav.quiz`, `nav.games`, `nav.learn`, `nav.assistant`, `nav.pricing` |
| `footer.*` | 頁尾連結與區塊 | `footer.copyright`, `footer.privacy`, `footer.terms` |
| `meta.*` | SSR/SEO 用（title、description） | `meta.defaultTitle`, `meta.ogDescription` |
| `ageGate.*` | 年齡門檻 | `ageGate.title`, `ageGate.confirm`, `ageGate.under18` |
| `cookie.*` | Cookie 同意橫幅 | `cookie.title`, `cookie.accept`, `cookie.decline` |
| `pricing.*` | 定價頁、方案、FAQ | `pricing.title`, `pricing.cta`, `pricing.faq0q` |
| `profile.*` | 個人頁、訂閱狀態 | `profile.expiresOn`, `profile.planLabel`, `profile.manageSubscription` |
| `subscription.*` | 訂閱/取消/挽留流程 | `subscription.cancelPageTitle`, `subscription.ctaRetain` |
| `partyRoom.*` | 派對直播房 | `partyRoom.title`, `partyRoom.cheers`, `partyRoom.activeRooms` |
| `partyDj.*` | AI 派對 DJ | `partyDj.title`, `partyDj.submit` |
| `games.*` / `gamesRoom.*` | 遊戲大廳、房間 | `gamesRoom.create`, `games.error` |
| `quiz.*` | 靈魂酒測 | `quiz.resultTitle`, `quiz.shareText` |
| `assistant.*` | AI 侍酒師 | `assistant.placeholder`, `assistant.send` |
| `learn.*` | 品酒學院（若有專用 key） | 與 `error.learnTitle` 等搭配 |
| `scriptMurder.*` | 劇本殺 | `scriptMurder.createRoom`, `scriptMurder.leaveRoom` |
| `error.*` | 錯誤頁、重試 | `error.retry`, `error.learnTitle`, `error.quizTitle` |
| `notFound.*` | 404 | `notFound.title`, `notFound.back` |
| `auth.*` / `login.*` | 登入、忘記密碼、設定密碼 | `login.title`, `auth.forgotPassword` |

## 命名原則

1. **小寫 + 駝峰**：`partyRoom.inviteLink`，不要 `party_room.invite_link`。
2. **語意化**：key 名表達用途，例如 `expiresOn` 而非 `date1`。
3. **插值用雙大括號**：`{{date}}`、`{{name}}`、`{{count}}`，與現有 JSON 一致。
4. **避免重複**：同一文案只對應一個 key；若多處使用，放在 `common.*` 或對應功能命名空間。
5. **審計時**：以 `messages/zh-TW.json` 為基準，執行 `npm run check:i18n` 檢查其他 locale 是否缺 key。

## 審計檢查項

- [ ] 新功能上線前，新 key 已加入 zh-TW 並補齊至少 en（其餘語系可後補或依 fallback）。
- [ ] 無與現有 key 語意重複的 key（搜尋類似文案）。
- [ ] 法律/年齡/Cookie 相關文案（ageGate、cookie、footer）六語系已評估是否需補齊。
