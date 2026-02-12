# 狼人殺簡化版 30 項優化任務（WW-01～WW-30）

對應 WerewolfLite 元件，依劇本殺／派對房模式：i18n、RWD、UX、功能、型別。

## Phase 1：i18n（WW-01～WW-10）

| ID | 狀態 | 說明 |
|----|------|------|
| WW-01 | ☑ | 遊戲標題、副標題改為 t('werewolf.*') |
| WW-02 | ☑ | 規則文案改為 t('werewolf.rules') 或動態組合 |
| WW-03 | ☑ | 分配角色、開始投票、下一夜等按鈕改為 t() |
| WW-04 | ☑ | 夜晚/白天/投票階段提示改為 t() |
| WW-05 | ☑ | 角色名稱（狼人、村民、預言家）改為 t() |
| WW-06 | ☑ | 勝負結果（村民勝、狼人勝）改為 t() |
| WW-07 | ☑ | 複製結果按鈕 label 與文案模板改為 t() |
| WW-08 | ☑ | messages 六語系補齊 werewolf 鍵 |
| WW-09 | ☑ | GameRules title 傳入 t('werewolf.rulesTitle') |
| WW-10 | ☑ | aria-label 使用 t() |

## Phase 2：RWD / UX（WW-11～WW-20）

| ID | 狀態 | 說明 |
|----|------|------|
| WW-11 | ☑ | 按鈕 min-h 48px、games-touch-target |
| WW-12 | ☑ | 玩家按鈕 flex-wrap、gap、RWD |
| WW-13 | ☑ | 結果區 max-w-md、padding RWD |
| WW-14 | ☑ | 按鈕 whileTap scale |
| WW-15 | ☑ | 階段切換 AnimatePresence / motion |
| WW-16 | ☑ | 規則區 GameRules 無障礙 aria |
| WW-17 | ☑ | 按鈕 games-focus-ring |
| WW-18 | ☑ | safe-area-px 已套用 |
| WW-19 | ☑ | 複製按鈕使用 games.copyResult |
| WW-20 | ☑ | role="main" aria-label i18n |

## Phase 3：功能 / 型別（WW-21～WW-30）

| ID | 狀態 | 說明 |
|----|------|------|
| WW-21 | ☑ | Role 型別集中或匯出（WerewolfRole） |
| WW-22 | ☑ | Phase 型別明確（idle/night/day/vote/result） |
| WW-23 | ☑ | 規則模板參數化（wolfCount、hasSeer） |
| WW-24 | ☑ | 複製結果文案模板 t() 插值 |
| WW-25 | ☑ | 預設玩家名稱可選 i18n |
| WW-26 | ☑ | vibrate 前檢查支援（navigator.vibrate） |
| WW-27 | — | 音效 play 錯誤處理（現有靜默） |
| WW-28 | ☑ | 註解與 JSDoc 補齊 |
| WW-29 | ☑ | 與 games.config werewolf-lite 名稱一致 |
| WW-30 | ☑ | 全員檢視無殘留中文 |
