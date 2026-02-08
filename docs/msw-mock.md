# P2-276：API Mock Server (MSW)

使用 MSW (Mock Service Worker) 可在瀏覽器或 Node 中攔截請求，供前端獨立開發與測試。

- **安裝**：`npm i -D msw`
- **設定**：在 `mocks/` 下定義 handlers（如 `GET /api/health` 回傳 200），並在測試 setup 或 dev 時 `worker.start()`。
- **好處**：不依賴後端即可跑 E2E 或元件測試；可模擬錯誤與延遲。
