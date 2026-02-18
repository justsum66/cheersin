'use client'

import { useState } from 'react'
import { TypingAnimation, TypingIndicator } from './TypingAnimation'
import { Button } from './Button'

/**
 * D1. AI聊天載入動畫演示元件
 * 展示打字機效果和各種指示器
 */
export function TypingAnimationDemo() {
  const [isTyping, setIsTyping] = useState(false)
  const [demoText, setDemoText] = useState("歡迎來到Cheersin！我是你的AI侍酒師，可以幫你推薦適合的酒類、解答品酒問題，或是陪你聊聊天。有什麼我可以幫助你的嗎？")
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [indicatorType, setIndicatorType] = useState<'thinking' | 'typing' | 'loading'>('thinking')

  const sampleTexts = [
    "讓我為你推薦一款適合今晚聚會的紅酒...",
    "根據你的喜好，我建議試試這款來自法國波爾多的佳釀。",
    "品酒時記得觀察顏色、聞香氣、品嚐口感，每個步驟都很重要。",
    "威士忌的風味會因為陳年時間和橡木桶類型而有所不同。"
  ]

  const startTyping = () => {
    setIsTyping(true)
  }

  const handleTypingComplete = () => {
    setIsTyping(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">D1. AI聊天載入動畫演示</h1>
        
        {/* 控制面板 */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">動畫控制</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">打字速度</label>
              <select 
                value={speed}
                onChange={(e) => setSpeed(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="slow">慢速</option>
                <option value="normal">正常</option>
                <option value="fast">快速</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">指示器類型</label>
              <select 
                value={indicatorType}
                onChange={(e) => setIndicatorType(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="thinking">思考中</option>
                <option value="typing">打字中</option>
                <option value="loading">載入中</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">示範文字</label>
              <select 
                onChange={(e) => setDemoText(sampleTexts[parseInt(e.target.value)])}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="0">推薦紅酒</option>
                <option value="1">波爾多佳釀</option>
                <option value="2">品酒技巧</option>
                <option value="3">威士忌風味</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={startTyping} 
              disabled={isTyping}
              variant="primary"
            >
              {isTyping ? '打字中...' : '開始演示'}
            </Button>
            
            <Button 
              onClick={() => setIsTyping(false)}
              variant="secondary"
            >
              停止
            </Button>
          </div>
        </div>

        {/* 打字機效果演示 */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">打字機效果</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 min-h-[120px] flex items-center justify-center">
              {isTyping ? (
                <TypingAnimation
                  text={demoText}
                  speed={speed === 'slow' ? 60 : speed === 'fast' ? 20 : 30}
                  showCursor={true}
                  cursorChar="▋"
                  onComplete={handleTypingComplete}
                  className="text-lg leading-relaxed"
                />
              ) : (
                <div className="text-white/50 text-center">
                  點擊「開始演示」查看打字機效果
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 指示器演示 */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">狀態指示器</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4 text-center">思考中</h3>
              <div className="flex justify-center">
                <TypingIndicator 
                  type="thinking"
                  text="AI正在思考中..."
                  speed={speed}
                />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4 text-center">打字中</h3>
              <div className="flex justify-center">
                <TypingIndicator 
                  type="typing"
                  text="AI正在回覆..."
                  speed={speed}
                />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4 text-center">載入中</h3>
              <div className="flex justify-center">
                <TypingIndicator 
                  type="loading"
                  text="處理中..."
                  speed={speed}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 對話氣泡演示 */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">對話氣泡整合</h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {/* 用戶訊息 */}
            <div className="flex justify-end">
              <div className="bg-primary-500/20 border border-primary-500/30 rounded-3xl rounded-tr-sm px-6 py-4 max-w-[80%]">
                <p className="text-white">我想找一款適合聚會的紅酒</p>
              </div>
            </div>
            
            {/* AI回覆 */}
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm px-6 py-4 max-w-[80%]">
                {isTyping ? (
                  <TypingAnimation
                    text="根據聚會場合，我推薦這款來自智利中央山谷的卡門內紅酒。它有著豐富的黑色水果香氣，單寧柔順，酒精度適中，非常適合朋友聚會時享用。"
                    speed={speed === 'slow' ? 40 : speed === 'fast' ? 20 : 30}
                    showCursor={true}
                    onComplete={handleTypingComplete}
                  />
                ) : (
                  <p className="text-white/90">
                    根據聚會場合，我推薦這款來自智利中央山谷的卡門內紅酒。它有著豐富的黑色水果香氣，單寧柔順，酒精度適中，非常適合朋友聚會時享用。
                  </p>
                )}
              </div>
            </div>
            
            {/* 載入狀態 */}
            {!isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm px-6 py-4 max-w-[80%]">
                  <TypingIndicator 
                    type="thinking"
                    text="正在為您搜尋更多選擇..."
                    speed={speed}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 技術說明 */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">技術特性</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">打字機效果</h4>
              <ul className="space-y-1">
                <li>• 可調節的打字速度</li>
                <li>• 真實的隨機速度變化</li>
                <li>• 閃爍光標指示</li>
                <li>• 循環播放功能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">狀態指示器</h4>
              <ul className="space-y-1">
                <li>• 三種不同狀態模式</li>
                <li>• 可調節的動畫速度</li>
                <li>• 無障礙支援</li>
                <li>• 平滑的過渡效果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingAnimationDemo