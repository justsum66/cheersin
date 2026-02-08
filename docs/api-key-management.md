# P2-351：API Key 管理（未來）

若未來開放 API 給第三方開發者，需建立 API Key 的生成、管理與撤銷機制。

## 建議能力

- **生成**：用戶在「開發者設定」頁申請 Key，後端寫入 `api_keys` 表（hash 存儲、前綴顯示如 `sk_live_xxx...`）
- **權限**：可選 scope（如 `read:games`、`write:rooms`）與 rate limit 綁定
- **撤銷**：用戶可撤銷單一 Key 或全部，立即失效
- **審計**：記錄最後使用時間與 IP，便於偵測濫用

## 資料表草案

```sql
api_keys (
  id uuid primary key,
  user_id uuid references auth.users,
  key_prefix text not null,   -- 顯示用，如 sk_live_abc
  key_hash text not null,    -- 僅存 hash
  scopes text[],
  rate_limit_per_min int default 60,
  last_used_at timestamptz,
  revoked_at timestamptz
)
```

## 當前狀態

文檔已建立；實際實作待開放對外 API 時再啟動。
