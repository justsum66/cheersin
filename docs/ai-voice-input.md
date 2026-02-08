# P2-387：AI 語音輸入

用戶可透過語音與 AI 助理對話，使用 Web Speech API（語音辨識），派對場景更便於免持輸入。

## 實作狀態（已完成）

- **lib/speech.ts**：`listen()`、`speak()`、`isRecognitionSupported()`、`isSpeechSupported()`。
- **assistant/page.tsx**：
  - 麥克風按鈕觸發 `startVoiceInput` / `stopVoiceInput`
  - 使用瀏覽器 `SpeechRecognition` / `webkitSpeechRecognition`，語系 `zh-TW`
  - 辨識結果寫入輸入框（`setInput`），可再編輯後送出
  - 語音朗讀回覆：`speakReply(content)`

## 限制

- 需 HTTPS 或 localhost
- 瀏覽器支援度：Chrome/Edge 佳，Safari/Firefox 部分支援

## 當前狀態

語音輸入與朗讀已整合於 AI 助理頁，本文件供維護與擴充參考。
