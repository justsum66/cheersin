'use client'

import { useState } from 'react'
import { EmotionEmoji, AutoEmotionEmoji } from './EmotionEmoji'
import { Button } from './Button'

/**
 * D2. AI回覆表情豐富化演示元件
 * 展示情緒對應emoji動畫效果
 */
export function EmotionEmojiDemo() {
  const [selectedEmotion, setSelectedEmotion] = useState<'happy' | 'excited' | 'surprised' | 'thoughtful' | 'confident' | 'curious' | 'cheerful' | 'professional'>('happy')
  const [animationType, setAnimationType] = useState<'bounce' | 'pulse' | 'wave' | 'spin' | 'float'>('bounce')
  const [emojiSize, setEmojiSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md')
  const [testText, setTestText] = useState('這是一款非常棒的紅酒！')

  const emotionOptions = [
    { value: 'happy', label: '😊 開心', color: 'text-yellow-400' },
    { value: 'excited', label: '🤩 興奮', color: 'text-orange-400' },
    { value: 'surprised', label: '😮 驚訝', color: 'text-blue-400' },
    { value: 'thoughtful', label: '🤔 思考', color: 'text-purple-400' },
    { value: 'confident', label: '😎 自信', color: 'text-green-400' },
    { value: 'curious', label: '🧐 好奇', color: 'text-cyan-400' },
    { value: 'cheerful', label: '😄 愉快', color: 'text-pink-400' },
    { value: 'professional', label: '👔 專業', color: 'text-gray-400' }
  ]

  const sampleTexts = [
    '這是一款非常棒的紅酒！推薦給所有愛酒的朋友們 😊',
    '哇！這個價格真是太驚人了！完全超出了我的預期！😮',
    '讓我想想...根據您的預算，我建議考慮這幾款選擇 🤔',
    '絕對沒問題！這款酒的品質非常穩定，您可以放心購買 😎',
    '您提到的這個問題很有趣，讓我為您深入分析一下 🧐'
  ]

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">D2. AI回覆表情豐富化演示</h1>
        
        {/* 控制面板 */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">表情控制</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">情緒類型</label>
              <select 
                value={selectedEmotion}
                onChange={(e) => setSelectedEmotion(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                {emotionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">動畫類型</label>
              <select 
                value={animationType}
                onChange={(e) => setAnimationType(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="bounce">彈跳</option>
                <option value="pulse">脈動</option>
                <option value="wave">揮手</option>
                <option value="spin">旋轉</option>
                <option value="float">漂浮</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">大小</label>
              <select 
                value={emojiSize}
                onChange={(e) => setEmojiSize(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="sm">小</option>
                <option value="md">中</option>
                <option value="lg">大</option>
                <option value="xl">超大</option>
              </select>
            </div>
          </div>
        </div>

        {/* 單一表情演示 */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">單一表情效果</h2>
          
          <div className="flex justify-center items-center h-48">
            <EmotionEmoji
              emotion={selectedEmotion}
              animation={animationType}
              size={emojiSize}
              interactive={true}
            />
          </div>
          
          <div className="text-center mt-4">
            <p className="text-white/70">
              點擊emoji可以觸發互動動畫效果
            </p>
          </div>
        </div>

        {/* 所有情緒表情展示 */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">所有情緒表情</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {emotionOptions.map((option) => (
              <div key={option.value} className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <EmotionEmoji
                  emotion={option.value as any}
                  animation="bounce"
                  size="lg"
                  interactive={true}
                  className="mb-2"
                />
                <span className="text-xs text-white/60 text-center">{option.label.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 自動情緒檢測演示 */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">自動情緒檢測</h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">測試文字</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[100px]"
                placeholder="輸入AI回覆的文字內容..."
              />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {sampleTexts.map((text, index) => (
                  <button
                    key={index}
                    onClick={() => setTestText(text)}
                    className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    範例 {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AutoEmotionEmoji content={testText} />
                </div>
                <div className="flex-grow">
                  <p className="text-white/90 leading-relaxed">{testText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 對話整合演示 */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">對話整合效果</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 用戶訊息 */}
            <div className="flex justify-end">
              <div className="bg-primary-500/20 border border-primary-500/30 rounded-3xl rounded-tr-sm px-6 py-4 max-w-[80%]">
                <p className="text-white">我想找一款適合聚會的紅酒</p>
              </div>
            </div>
            
            {/* AI回覆 - 開心 */}
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <EmotionEmoji emotion="happy" animation="bounce" size="lg" />
                <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm px-6 py-4 max-w-[75%]">
                  <p className="text-white/90">
                    太好了！我推薦這款來自智利的卡門內紅酒，它有著豐富的黑色水果香氣，非常適合朋友聚會時享用！😊
                  </p>
                </div>
              </div>
            </div>
            
            {/* AI回覆 - 思考 */}
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <EmotionEmoji emotion="thoughtful" animation="float" size="lg" />
                <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm px-6 py-4 max-w-[75%]">
                  <p className="text-white/90">
                    讓我想想...根據您的預算和人數，我建議考慮這幾款選擇。每款都有不同的特色...🤔
                  </p>
                </div>
              </div>
            </div>
            
            {/* AI回覆 - 自信 */}
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <EmotionEmoji emotion="confident" animation="pulse" size="lg" />
                <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm px-6 py-4 max-w-[75%]">
                  <p className="text-white/90">
                    絕對沒問題！這款酒的品質非常穩定，獲獎無數，您可以放心購買。我個人也非常推薦！😎
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 技術說明 */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">技術特性</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">情緒識別</h4>
              <ul className="space-y-1">
                <li>• 8種基本情緒類型</li>
                <li>• 關鍵詞自動檢測</li>
                <li>• 可調節敏感度</li>
                <li>• 多語言支援</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">動畫效果</h4>
              <ul className="space-y-1">
                <li>• 5種動畫模式</li>
                <li>• 4種尺寸選項</li>
                <li>• 互動式觸發</li>
                <li>• 無障礙支援</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionEmojiDemo