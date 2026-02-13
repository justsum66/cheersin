# I18N-007：動態文案 ICU 參數化審計

## 規範

- 動態文案使用 `t('key', { param: value })` 與 messages 內 `{{param}}` 佔位符
- 禁止字串拼接如 `` `${a} 人` `` 用於使用者可見文案
- `interpolate()` 已支援 `{{key}}` 替換

## 已使用參數化

| 元件/頁面 | 範例 | 狀態 |
|-----------|------|------|
| profile | `t('profile.expiresInDays').replace('{{count}}', ...)` | ✅ |
| profile | `t('profile.avatarAlt').replace('{{name}}', ...)` | ✅ |
| scriptMurder | `t('scriptMurder.needMorePlayers').replace('{{count}}', ...)` | ✅ |
| login | `t('login.rateLimitMinutes').replace('{{minutes}}', ...)` | ✅ |
| I18nContext | `interpolate(template, params)` | ✅ |

## 建議改用 t() + 參數

| 位置 | 目前 | 建議 |
|------|------|------|
| NeverHaveIEver | `已出完 ${roundTotal} 題` | t('games.exhaustedCount', { count: roundTotal }) |
| GameWrapperHeader | `房間人數 ${players.length}／${maxPlayers} 人` | t('gamesRoom.playersCount', { current, max }) |
| PartyRoomManager | `${p.name || '有人'} 加入了派對` | t('partyRoom.playerJoinedName', { name }) |

## 檢查結果

- [x] 主要流程（登入、訂閱、派對房）已使用 t() 或 fallback
- [x] interpolate 支援 {{key}} 參數化
- [ ] 少數遊戲內動態字串仍為拼接，可逐步替換

**更新日期**：2025-02-12
