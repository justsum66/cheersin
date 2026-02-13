# 劇本殺設定指南

劇本殺頁面顯示「無法連線至資料庫」時，請依序檢查以下項目。

## 1. Supabase 環境變數

`.env.local` 需設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://wdegandlipgdvqhgmoai.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的 service_role key
```

- **專案 ref** 須為 `wdegandlipgdvqhgmoai`（與 next.config、layout 一致）
- 若曾使用 `etrqxhpbhimrkcyolbrr`，請改為 `wdegandlipgdvqhgmoai` 並重新取得對應 key

## 2. 驗證環境

```bash
npm run validate-env
```

若出現 `etrqxhpbhimrkcyolbrr` 警告，表示 URL 指向不可達專案，請更新 `.env.local`。

## 3. 健康檢查

```bash
npm run dev
# 另開終端
curl http://localhost:3000/api/health
```

檢查 Supabase 是否為 `connected`。若為 `error`，依 `hint` 調整設定。

## 4. Migrations

若表不存在，需執行 migrations：

- **有 CLI 權限**：`npm run supabase:link` → `npm run supabase:push`
- **無 CLI 權限**：Supabase Dashboard → SQL Editor → 執行 `supabase/migrations/RUN_ALL_IN_DASHBOARD.sql`

## 5. 劇本種子

`scripts` 表為空時，API 會自動種子 8 支劇本。若種子失敗（RLS 阻擋等），會回傳連線錯誤。

確認 `scripts`、`script_chapters`、`script_roles` 表存在且 RLS 允許 service_role 寫入。

## 6. 單人測試（solo 模式）

- 建立房間 → 輸入暱稱 → **加入** → 大廳會顯示「尚需 X 位玩家才能開始」。
- 當只有你一人時，大廳會出現 **「單人測試：點此以 1 人開始遊戲」** 連結，點下去會帶上 `solo=1` 並重新載入，即可顯示「開始遊戲」按鈕。
- 或手動在網址加 `&solo=1`，例如：`/script-murder?room=8d46p0ir&solo=1`（`room=` 後須為**完整 8 碼**，否則會 404）。
- 邀請連結從大廳「複製邀請」取得，在該連結後加 `&solo=1` 也可單人開始。
