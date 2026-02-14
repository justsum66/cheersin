# R2-011 換皮遊戲審查報告

**日期：** 2026-02-12  
**目標：** 保留 50–60 款有獨特機制的遊戲，移除僅更換 ID/名稱的換皮遊戲。

## 已移除（前期完成）

| 原 ID | 原因 | 對應保留遊戲 |
|:---|:---|:---|
| drinking-fist | 換皮 | finger-guessing（已移除）→ name-train 機制不同 |
| captain-hook | 換皮 | name-train |
| count-seven | 換皮 | buzz-game |
| ultimate-code | 換皮 | number-bomb |
| support-front | 換皮 | random-picker |
| drink-or-safe | 品質 2.5/10 | — |
| finger-guessing | overlap 2p only | — |
| coin-flip | overlap dice | dice |
| spin-bottle | 品質 2.0/10 | — |
| fortune-draw | overlap lucky-draw | lucky-draw |
| truth-wheel | overlap truth-or-dare | truth-or-dare |
| finger-point | overlap reaction-master | reaction-master |
| imitate-me | 品質 3.0/10 | — |
| time-freeze | 品質 3.0/10 | — |
| stare-contest | 品質 2.5/10 | — |

## 當前狀態

- **GAMES_META 數量：** 85 款（2026-02 審查縮減：自約 99 款合併/移除 14 款，見 `docs/games-audit-85.md`）
- **GameLazyMap loaders：** 85 個，與 GAMES_META 一致
- **18+ 變體：** spicy-truth-or-dare、spicy-never-have-i-ever、spicy-who-most-likely、spicy-would-you-rather、spicy-dice 使用獨立組件與題庫，非單純換皮

## 結論

- 換皮遊戲已於前期移除
- 2026-02 依六維評分與相似度完成「縮減至 85 款」：合併 7 組、移除 7 款（手機不適合/吸引力低）
- 當前列表每款皆有獨立機制或專用題庫
- 若需進一步縮減，建議依 **使用率 / 評分 / 維護成本** 做產品決策，非技術換皮問題
