# P2-324：API 降級策略

當核心依賴（如 AI、支付）不可用時，應有降級行為而非直接失敗。

- **Chat**：`chat/route.ts` 已實作 Groq → NIM → OpenRouter 的 fallback 順序，並有 `OFFLINE_FALLBACK_REPLIES` 當全部失敗時回傳友善提示。
- **支付**：PayPal 未設定時回傳 503 與明確訊息；可擴充為「稍後再試」頁或替代支付方式。
- **建議**：其他關鍵 API 可仿照：先重試、再 fallback 到緩存或靜態回應、最後回傳統一錯誤訊息。
