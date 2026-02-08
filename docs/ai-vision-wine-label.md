# P2-386：AI 酒標識別（可選）

- **目標**：用戶上傳酒標照片，AI 識別酒款並回傳名稱、產區、簡述。
- **技術選型**：OpenAI Vision 或 Google Cloud Vision + 自建酒款 DB 匹配；或專用酒標 API。
- **入口**：chat 支援 image 上傳時可一併處理；或獨立 `POST /api/vision/wine-label`。
- **狀態**：文檔已建立；待選型與成本評估後實作。
