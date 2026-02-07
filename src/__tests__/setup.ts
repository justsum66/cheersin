// 擴充 expect（toBeInTheDocument 等）。若無 jest-dom 可改為 vitest 內建 assert。
// 安裝：npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom --legacy-peer-deps
import '@testing-library/jest-dom/vitest'

// P3-67：API 單元測試載入 chat route 時 groq.ts 會 new Groq()，需有 GROQ_API_KEY 才不拋錯
if (!process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = 'test-key-unit-tests'
