# GAME 與 TEST 檢查清單（Phase 2）

對應 TASKS-170 Batch 5：GAME-001～009、TEST-001～010。

## GAME

| ID | 項目 | 實作/驗收 |
|----|------|-----------|
| GAME-001 | 派對房建立→加入→遊戲→離開無狀態錯亂 | E2E 與手動通過；見 e2e/persona-flows/party-room.spec.ts |
| GAME-002 | 劇本殺房間狀態與 Realtime 同步一致 | 多人同步無錯；script-murder persona flow |
| GAME-003 | 遊戲狀態寫入前 Zod 校驗 | api/games/rooms/[slug]/game-state POST 使用 parsePartyStatePayload，非法 payload 400 |
| GAME-004～009 | 房主離開、邀請連結、乾杯切換、真心話/輪盤/骰子、結束返回、劇本角色、邀請文案 | 見 party-room-flow-api.md、partyRoom.* messages；手動或 E2E 抽檢 |

## TEST

| ID | 項目 | 實作/驗收 |
|----|------|-----------|
| TEST-001 | 關鍵 API 路由單元測試 | src/__tests__/api：rooms, game-state, subscription, upload, chat, health 等 |
| TEST-002 | E2E critical-paths 全通過 | e2e/critical-paths.spec.ts：nav, quiz, 登入, 訂閱 |
| TEST-003 | test:run 無失敗 | vitest 全部 pass |
| TEST-004 | test:stress 兩輪通過 | 無 flake |
| TEST-005 | TypeScript strict 無 any 新增 | tsc 過，any 僅註記 |
| TEST-006 | 建置成功 npm run build | 常規驗證 |
| TEST-007 | 學習與課程 validate 腳本通過 | validate:lessons, validate:content |
| TEST-009 | E2E persona-flows 至少 6 條通過 | assistant, games, learn, party-room, script-murder, subscription 等 |
| TEST-010 | 遊戲邏輯單元測試 | truth-or-dare、never-have-i-ever 等 lib 單元測試 |

執行：`npm run test:run`、`npm run build`、必要時 `npm run test:e2e:critical`。
