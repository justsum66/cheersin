# P2-235：Storybook 組件文檔

為核心 UI 組件（Button, Modal, Card 等）建立 Storybook，方便單獨測試、預覽與複用。

## 安裝（可選，尚未加入專案）

```bash
npx storybook@latest init
```

會建立 `.storybook/` 與 `stories/`，並安裝 `@storybook/react`、`@storybook/nextjs` 等。

## 建議結構

- `stories/Button.stories.tsx`：按鈕變體（primary、secondary、danger、disabled）
- `stories/Modal.stories.tsx`：Modal 開關、無障礙焦點
- `stories/Card.stories.tsx`：課程卡、遊戲卡等
- `stories/WineCard.stories.tsx`：酒款卡片

## 與 Tailwind / Next 整合

- 使用 `@storybook/nextjs` 的 `nextConfig` 指向專案 `next.config.ts`
- 在 `.storybook/preview.ts` 引入全域樣式：`import '../src/app/globals.css'`

## 當前狀態

文檔已建立；實際 Storybook 安裝與 stories 可依需求再加入，以控制 bundle 與 CI 時間。
