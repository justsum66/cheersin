# Cheersin UI 元件文件

## 目錄
- [簡介](#簡介)
- [安裝](#安裝)
- [核心元件](#核心元件)
  - [PageTransition 頁面過渡](#pagetransition-頁面過渡)
  - [EnhancedCardHover 卡片懸浮](#enhancedcardhover-卡片懸浮)
  - [TypingAnimation 打字機動畫](#typinganimation-打字機動畫)
  - [EmotionEmoji 情緒表情](#emotionemoji-情緒表情)
  - [InteractiveParticleBackground 粒子背景](#interactiveparticlebackground-粒子背景)
  - [ShimmerProgressBar 流光進度條](#shimmerprogressbar-流光進度條)
  - [InteractiveToast 互動通知](#interactivetoast-互動通知)
- [主題系統](#主題系統)
- [自定義系統](#自定義系統)
- [最佳實踐](#最佳實踐)

## 簡介

Cheersin UI 元件庫提供了一套現代化、可高度自定義的 React 元件，專為提升用戶體驗而設計。所有元件都支援：

- 🎨 統一的設計語言
- ⚡ 流暢的動畫效果
- 🎯 無障礙設計支援
- 📱 響應式設計
- 🛠️ 高度可自定義

## 安裝

```bash
# 元件已在專案中，直接使用即可
import { PageTransition } from '@/components/ui/PageTransition'
import { EnhancedCardHover } from '@/components/ui/EnhancedCardHover'
```

## 核心元件

### PageTransition 頁面過渡

提供多種頁面切換動畫效果。

#### 基本用法

```tsx
import { PageTransition } from '@/components/ui/PageTransition'

function MyPage() {
  return (
    <PageTransition type="slide" direction="right">
      <div>頁面內容</div>
    </PageTransition>
  )
}
```

#### 屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `type` | `'slide' \| 'fade' \| 'scale' \| 'flip'` | `'slide'` | 過渡類型 |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'right'` | 滑動方向 |
| `duration` | `number` | `0.4` | 動畫持續時間(秒) |
| `delay` | `number` | `0` | 延遲時間(秒) |
| `enable3d` | `boolean` | `true` | 是否啟用3D效果 |

#### 使用範例

```tsx
// 淡入淡出效果
<PageTransition type="fade" duration={0.5}>
  <Content />
</PageTransition>

// 縮放效果
<PageTransition type="scale" enable3d={false}>
  <Content />
</PageTransition>

// 翻轉效果
<PageTransition type="flip" direction="left">
  <Content />
</PageTransition>
```

### EnhancedCardHover 卡片懸浮

帶有3D變換和光影效果的互動卡片。

#### 基本用法

```tsx
import { EnhancedCardHover } from '@/components/ui/EnhancedCardHover'

function CardExample() {
  return (
    <EnhancedCardHover 
      variant="premium"
      tiltIntensity={5}
      onClick={() => console.log('卡片被點擊')}
    >
      <div className="p-6">
        <h3 className="text-xl font-bold">卡片標題</h3>
        <p>卡片內容</p>
      </div>
    </EnhancedCardHover>
  )
}
```

#### 屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `variant` | `'standard' \| 'premium' \| 'glass'` | `'standard'` | 卡片樣式變體 |
| `tiltIntensity` | `number` | `3` | 傾斜效果強度(1-10) |
| `scaleIntensity` | `number` | `1.05` | 縮放效果強度(1.0-1.3) |
| `enableLighting` | `boolean` | `true` | 是否啟用光影效果 |
| `enableGlow` | `boolean` | `true` | 是否啟用光暈效果 |
| `onClick` | `() => void` | `undefined` | 點擊回調函數 |
| `onHover` | `(isHovered: boolean) => void` | `undefined` | 懸浮狀態回調 |

#### 樣式變體

```tsx
// 標準樣式
<EnhancedCardHover variant="standard">
  <Content />
</EnhancedCardHover>

// 高級樣式
<EnhancedCardHover variant="premium">
  <Content />
</EnhancedCardHover>

// 玻璃樣式
<EnhancedCardHover variant="glass">
  <Content />
</EnhancedCardHover>
```

### TypingAnimation 打字機動畫

模擬打字機效果的文字動畫。

#### 基本用法

```tsx
import { TypingAnimation } from '@/components/ui/TypingAnimation'

function TypingExample() {
  return (
    <TypingAnimation
      text="歡迎使用Cheersin！"
      speed={50}
      showCursor={true}
      onComplete={() => console.log('打字完成')}
    />
  )
}
```

#### 屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `text` | `string` | `''` | 要顯示的文字 |
| `speed` | `number` | `60` | 打字速度(毫秒/字元) |
| `showCursor` | `boolean` | `true` | 是否顯示游標 |
| `cursorChar` | `string` | `'|'` | 游標字元 |
| `loop` | `boolean` | `false` | 是否循環播放 |
| `onComplete` | `() => void` | `undefined` | 完成回調 |

#### 使用範例

```tsx
// 基本打字效果
<TypingAnimation text="Hello World!" />

// 自定義速度和游標
<TypingAnimation 
  text="快速打字效果"
  speed={30}
  cursorChar="▶"
/>

// 循環播放
<TypingAnimation 
  text="循環播放的文字"
  loop={true}
/>
```

### EmotionEmoji 情緒表情

根據內容自動檢測情緒並顯示對應emoji。

#### 基本用法

```tsx
import { AutoEmotionEmoji } from '@/components/ui/EmotionEmoji'

function EmojiExample() {
  return (
    <AutoEmotionEmoji 
      content="太棒了！這個想法真的很棒！"
      sensitivity={0.7}
    />
  )
}
```

#### 屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `content` | `string` | `''` | 要分析的文字內容 |
| `sensitivity` | `number` | `0.7` | 情緒檢測敏感度(0-1) |

#### 手動指定情緒

```tsx
import { EmotionEmoji } from '@/components/ui/EmotionEmoji'

// 手動指定情緒類型
<EmotionEmoji 
  emotion="happy"
  animation="bounce"
  size="lg"
/>
```

#### 情緒類型

- `happy` - 開心 😊
- `excited` - 興奮 🤩
- `surprised` - 驚訝 😮
- `thoughtful` - 思考 🤔
- `confident` - 自信 😎
- `curious` - 好奇 🧐
- `cheerful` - 愉快 😄
- `professional` - 專業 👔

### InteractiveParticleBackground 粒子背景

互動式粒子動畫背景。

#### 基本用法

```tsx
import { InteractiveParticleBackground } from '@/components/ui/InteractiveParticleBackground'

function BackgroundExample() {
  return (
    <div className="relative min-h-screen">
      <InteractiveParticleBackground
        type="stars"
        particleCount={150}
        sensitivity={0.7}
      />
      <div className="relative z-10">
        {/* 頁面內容 */}
      </div>
    </div>
  )
}
```

#### 屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `particleCount` | `number` | `150` | 粒子數量 |
| `type` | `'stars' \| 'aurora' \| 'galaxy' \| 'nebula'` | `'stars'` | 背景類型 |
| `sensitivity` | `number` | `0.7` | 互動敏感度(0-1) |
| `mouseInteractive` | `boolean` | `true` | 是否啟用滑鼠互動 |
| `parallax` | `boolean` | `true` | 是否啟用視差效果 |

### ShimmerProgressBar 流光進度條

帶有流光效果的進度條元件。

#### 基本用法

```tsx
import { ShimmerProgressBar } from '@/components/ui/ShimmerProgressBar'

function ProgressExample() {
  return (
    <ShimmerProgressBar
      value={75}
      variant="primary"
      height="md"
      shimmer={true}
      showLabel={true}
    />
  )
}
```

#### 屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `value` | `number` | `0` | 進度值(0-100) |
| `max` | `number` | `100` | 最大值 |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | 顏色變體 |
| `height` | `'sm' \| 'md' \| 'lg'` | `'md'` | 高度 |
| `shimmer` | `boolean` | `true` | 是否啟用流光效果 |
| `shimmerSpeed` | `number` | `2` | 流光速度(秒) |
| `showLabel` | `boolean` | `false` | 是否顯示標籤 |

### InteractiveToast 互動通知

支援滑動關閉的互動式通知元件。

#### 基本用法

```tsx
import { useInteractiveToast } from '@/components/ui/InteractiveToast'

function ToastExample() {
  const toast = useInteractiveToast()

  const handleClick = () => {
    toast.success('操作成功！', {
      duration: 3000,
      action: {
        label: '檢視',
        onClick: () => console.log('檢視詳情')
      }
    })
  }

  return <button onClick={handleClick}>顯示通知</button>
}
```

#### 通知類型

```tsx
// 成功通知
toast.success('操作成功！')

// 錯誤通知
toast.error('操作失敗！')

// 警告通知
toast.warning('請注意！')

// 資訊通知
toast.info('提示訊息')

// 載入通知
toast.loading('處理中...')
```

#### 屬性選項

```tsx
toast.success('訊息', {
  duration: 3000,           // 持續時間(毫秒)
  action: {                 // 互動按鈕
    label: '按鈕文字',
    onClick: () => {}
  }
})
```

## 主題系統

### 使用預設主題

```tsx
import { useAnimationTheme } from '@/lib/animation-theme-system'

function ThemeExample() {
  const { theme, changeTheme } = useAnimationTheme()

  return (
    <div>
      <p>目前主題: {theme.name}</p>
      <button onClick={() => changeTheme('vibrant')}>
        切換到活潑主題
      </button>
    </div>
  )
}
```

### 可用主題

- `modern` - 現代簡約主題
- `vibrant` - 活潑動感主題
- `elegant` - 優雅專業主題
- `dark` - 深色主題

### 自定義主題

```tsx
import { AnimationThemeManager } from '@/lib/animation-theme-system'

// 建立自定義主題
const customTheme = {
  name: 'my-theme',
  durations: {
    fast: 0.1,
    normal: 0.3,
    slow: 0.5,
    slowest: 0.8
  },
  colors: {
    primary: '#ff0000',
    secondary: '#00ff00'
    // ... 其他顏色設定
  }
  // ... 其他設定
}

// 註冊主題
const manager = AnimationThemeManager.getInstance()
manager.registerTheme('my-theme', customTheme)
```

## 自定義系統

### 元件自定義

```tsx
import { useComponentCustomization } from '@/lib/component-customization'

function CustomizationExample() {
  const { settings, updateSettings } = useComponentCustomization('enhancedCardHover')

  return (
    <div>
      <EnhancedCardHover
        variant={settings.variant}
        tiltIntensity={settings.tiltIntensity}
      >
        <Content />
      </EnhancedCardHover>
      
      <div>
        <label>傾斜強度</label>
        <input
          type="range"
          value={settings.tiltIntensity}
          onChange={(e) => updateSettings({ tiltIntensity: e.target.value })}
        />
      </div>
    </div>
  )
}
```

### 匯出/匯入設定

```tsx
import { CustomizationManager } from '@/lib/component-customization'

const manager = CustomizationManager.getInstance()

// 匯出設定
const settings = manager.exportSettings()
console.log(settings)

// 匯入設定
manager.importSettings(settingsString)
```

## 最佳實踐

### 效能優化

1. **使用 React.memo** 包裝元件
2. **避免過度動畫**，保持60fps
3. **使用 `prefers-reduced-motion`** 媒體查詢
4. **適當的動畫持續時間** (200-500ms)

### 無障礙設計

```tsx
// 為動畫元件提供無障礙支援
<PageTransition 
  aria-label="頁面內容"
  role="main"
>
  <Content />
</PageTransition>
```

### 響應式設計

```tsx
// 使用 Tailwind CSS 類別
<EnhancedCardHover className="w-full md:w-96 lg:w-1/3">
  <Content />
</EnhancedCardHover>
```

### 狀態管理

```tsx
// 使用 React Context 管理主題
import { AnimationThemeManager } from '@/lib/animation-theme-system'

const manager = AnimationThemeManager.getInstance()
manager.subscribe((theme) => {
  // 處理主題變更
  document.documentElement.className = theme.name
})
```

### 錯誤處理

```tsx
// 為元件提供錯誤邊界
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary fallback={<div>元件載入失敗</div>}>
  <EnhancedCardHover>
    <Content />
  </EnhancedCardHover>
</ErrorBoundary>
```

## 除錯技巧

### 檢查動畫效能

```tsx
// 使用 React DevTools Profiler
// 檢查元件重新渲染頻率
// 監控記憶體使用情況
```

### 測試無障礙性

```bash
# 使用 axe-core 測試
npm install axe-core
npx axe http://localhost:3000
```

### 效能監控

```tsx
// 監控動畫效能
import { useReducedMotion } from 'framer-motion'

const reducedMotion = useReducedMotion()
// 根據系統設定調整動畫
```

## 常見問題

### Q: 動畫不流暢怎麼辦？
A: 檢查是否啟用了硬體加速，減少同時運行的動畫數量

### Q: 如何禁用所有動畫？
A: 使用 CSS `prefers-reduced-motion: reduce` 媒體查詢

### Q: 元件設定如何保存？
A: 設定會自動保存到 localStorage，頁面重新載入後會恢復

### Q: 如何自定義主題顏色？
A: 使用 `AnimationThemeManager` 建立和註冊自定義主題

## 貢獻指南

歡迎貢獻新的元件和改進現有功能：

1. Fork 專案
2. 建立功能分支
3. 實作功能
4. 撰寫測試
5. 提交 Pull Request

## 授權

MIT License