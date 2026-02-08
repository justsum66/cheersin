# OneSignal 整合

**目的：** 推播通知、用戶識別（Create User API），與 Cheersin 訂閱/遊戲房等情境整合。

## App 與金鑰

- **App ID（Dashboard）：** `df9af18e-c7f3-40c2-b454-b1460b496ccd`
- **Dashboard：** https://dashboard.onesignal.com/apps/df9af18e-c7f3-40c2-b454-b1460b496ccd
- **Create User API：** https://documentation.onesignal.com/reference/create-user

## 環境變數

- `ONESIGNAL_APP_ID`：上列 App ID（用於 API 路徑與前端 SDK）
- `ONESIGNAL_REST_API_KEY`：REST API Key（Dashboard → Settings → Keys & IDs），僅後端使用，勿暴露前端

選填（前端 Web Push）：

- `NEXT_PUBLIC_ONESIGNAL_APP_ID`：與 ONESIGNAL_APP_ID 相同，供 OneSignal Web SDK 使用

## 後端：Create User

- **POST /api/notifications/onesignal-user**  
  Body：`{ "external_id": "supabase_user_uuid" }`  
  以 `external_id` 對應 Cheersin 用戶，呼叫 OneSignal Create User API；可選帶 `subscriptions`（例如 Web Push 訂閱）一併建立。

## 前端（可選）

- 在 layout 或 PWA 內載入 OneSignal Web SDK（v16+ User Model），並以 `NEXT_PUBLIC_ONESIGNAL_APP_ID` 初始化。
- 使用者登入後可呼叫後端 `/api/notifications/onesignal-user` 傳入 `external_id`，或由後端在登入/訂閱時自動建立/更新 OneSignal User。

## 與現有 push_subscriptions 的關係

- 目前 Supabase `push_subscriptions` 用於儲存 Web Push 訂閱；可改為或並行：建立 OneSignal User 時將同一訂閱透過 Create User 的 `subscriptions` 傳給 OneSignal，由 OneSignal 負責發送。
