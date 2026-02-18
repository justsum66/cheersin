'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PageTransition 
} from './PageTransition'
import { 
  EnhancedCardHover 
} from './EnhancedCardHover'
import { 
  TypingAnimation 
} from './TypingAnimation'
import { 
  EmotionEmoji,
  AutoEmotionEmoji
} from './EmotionEmoji'
import { 
  InteractiveParticleBackground 
} from './InteractiveParticleBackground'
import { 
  ShimmerProgressBar 
} from './ShimmerProgressBar'
import { 
  ToastManager, 
  useInteractiveToast 
} from './InteractiveToast'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

/**
 * 動畫元件整合示範頁面
 * 展示如何在實際頁面中使用優化元件
 */
export function AnimationIntegrationDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('overview')
  const toast = useInteractiveToast()
  const [progress, setProgress] = useState(0)

  // 模擬進度條動畫
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  const demos = [
    { id: 'overview', name: '整合概覽', component: <OverviewDemo toast={toast} progress={progress} /> },
    { id: 'games', name: '遊戲頁面整合', component: <GamesIntegrationDemo /> },
    { id: 'chat', name: '聊天介面整合', component: <ChatIntegrationDemo /> },
    { id: 'profile', name: '個人頁面整合', component: <ProfileIntegrationDemo /> },
  ]

  const currentDemo = demos.find(d => d.id === activeDemo) || demos[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <ToastManager />
      
      {/* 導航選單 */}
      <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {demos.map((demo) => (
              <Button
                key={demo.id}
                variant={activeDemo === demo.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveDemo(demo.id)}
                className="transition-all duration-300"
              >
                {demo.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageTransition type="slide" direction="right">
          {currentDemo.component}
        </PageTransition>
      </div>
    </div>
  )
}

function OverviewDemo({ toast, progress }: { toast: any; progress: number }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">動畫元件整合示範</h1>
        <p className="text-white/70 text-lg">展示如何在實際頁面中使用優化元件</p>
      </div>

      {/* 元件展示網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 卡片懸浮效果 */}
        <EnhancedCardHover variant="premium">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">卡片懸浮效果</h3>
            <p className="text-white/70">3D變換和光影效果</p>
          </div>
        </EnhancedCardHover>

        {/* 打字機動畫 */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">AI打字機效果</h3>
          <TypingAnimation
            text="歡迎使用Cheersin！這是一個互動式AI聊天平台。"
            speed={50}
            showCursor={true}
          />
        </GlassCard>

        {/* 情緒表情 */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">情緒表情系統</h3>
          <div className="space-y-3">
            <AutoEmotionEmoji content="太棒了！這個想法真的很棒！" />
            <AutoEmotionEmoji content="糟糕，我忘記帶鑰匙了。" />
            <AutoEmotionEmoji content="這是一個中性的陳述。" />
          </div>
        </GlassCard>

        {/* 進度條 */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">流光進度條</h3>
          <ShimmerProgressBar
            value={progress}
            variant="primary"
            height="lg"
            showLabel={true}
            shimmer={true}
          />
        </GlassCard>

        {/* 互動通知 */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">互動式通知</h3>
          <div className="space-y-3">
            <Button
              onClick={() => toast.success('操作成功！')}
              className="w-full"
            >
              成功通知
            </Button>
            <Button
              onClick={() => toast.error('操作失敗！')}
              variant="outline"
              className="w-full"
            >
              錯誤通知
            </Button>
          </div>
        </GlassCard>

        {/* 粒子背景按鈕 */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">動態背景</h3>
          <p className="text-white/70 mb-4">互動式粒子系統</p>
          <Button
            onClick={() => toast.info('背景動畫已啟用！')}
            className="w-full"
          >
            啟用背景效果
          </Button>
        </GlassCard>
      </div>
    </div>
  )
}

function GamesIntegrationDemo() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">遊戲頁面整合</h2>
        <p className="text-white/70">在遊戲大廳和遊戲過程中使用動畫元件</p>
      </div>

      {/* 遊戲大廳整合 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">遊戲大廳優化</h3>
          <div className="space-y-4">
            <EnhancedCardHover variant="standard" className="cursor-pointer">
              <div className="p-4">
                <h4 className="font-bold text-white">真心話大冒險</h4>
                <p className="text-white/70 text-sm">經典派對遊戲</p>
              </div>
            </EnhancedCardHover>
            
            <EnhancedCardHover variant="standard" className="cursor-pointer">
              <div className="p-4">
                <h4 className="font-bold text-white">俄羅斯輪盤</h4>
                <p className="text-white/70 text-sm">刺激冒險遊戲</p>
              </div>
            </EnhancedCardHover>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">遊戲載入體驗</h3>
          <div className="space-y-4">
            <TypingAnimation
              text="正在為您準備遊戲..."
              speed={80}
              showCursor={true}
            />
            <ShimmerProgressBar
              value={65}
              variant="success"
              height="md"
              label="遊戲載入進度"
            />
          </div>
        </GlassCard>
      </div>

      {/* 遊戲中互動 */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">遊戲中互動元素</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <AutoEmotionEmoji content="太厲害了！你贏了這局！" />
            <p className="text-white/70 text-sm mt-2">勝利表情</p>
          </div>
          <div className="text-center">
            <AutoEmotionEmoji content="哎呀，差一點就贏了。" />
            <p className="text-white/70 text-sm mt-2">安慰表情</p>
          </div>
          <div className="text-center">
            <AutoEmotionEmoji content="這遊戲真有趣！" />
            <p className="text-white/70 text-sm mt-2">興奮表情</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

function ChatIntegrationDemo() {
  const [messages, setMessages] = useState([
    { id: 1, text: "你好！很高興認識你。", sender: 'ai' },
    { id: 2, text: "我也很高興！有什麼可以幫助你的嗎？", sender: 'user' },
  ])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">聊天介面整合</h2>
        <p className="text-white/70">提升AI聊天體驗的動畫效果</p>
      </div>

      {/* 聊天視窗 */}
      <GlassCard className="p-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-4">AI聊天體驗</h3>
        
        <div className="space-y-4 mb-6 h-64 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {message.sender === 'ai' ? (
                  <TypingAnimation
                    text={message.text}
                    speed={60}
                    showCursor={false}
                  />
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="輸入訊息..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
          />
          <Button>發送</Button>
        </div>
      </GlassCard>

      {/* 情緒回饋 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-3">即時情緒回饋</h3>
          <div className="space-y-3">
            <AutoEmotionEmoji content="這個回答太棒了！" />
            <AutoEmotionEmoji content="我需要更多解釋。" />
            <AutoEmotionEmoji content="感謝你的幫助！" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-3">打字狀態指示</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white/70">AI正在思考...</span>
            </div>
            <TypingAnimation
              text="讓我為您查找相關資訊..."
              speed={70}
              showCursor={true}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function ProfileIntegrationDemo() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">個人頁面整合</h2>
        <p className="text-white/70">提升用戶個人頁面的視覺體驗</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 個人資料卡片 */}
        <EnhancedCardHover variant="premium">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white mb-4">個人資料</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">等級</span>
                <span className="text-white font-medium">Lv. 25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">經驗值</span>
                <span className="text-white font-medium">1,250/1,500</span>
              </div>
              <ShimmerProgressBar
                value={83}
                variant="primary"
                height="sm"
                showLabel={false}
              />
            </div>
          </div>
        </EnhancedCardHover>

        {/* 成就展示 */}
        <GlassCard className="p-6">
          <h3 className="text-2xl font-bold text-white mb-4">最新成就</h3>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                🏆
              </div>
              <div>
                <h4 className="font-bold text-white">遊戲達人</h4>
                <p className="text-white/70 text-sm">完成100場遊戲</p>
              </div>
            </motion.div>
          </div>
        </GlassCard>
      </div>

      {/* 統計數據 */}
      <GlassCard className="p-6">
        <h3 className="text-2xl font-bold text-white mb-6">遊戲統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: '總遊戲數', value: '156', change: '+12%' },
            { label: '勝率', value: '78%', change: '+5%' },
            { label: '好友數', value: '24', change: '+3' },
            { label: '成就數', value: '42', change: '+2' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 bg-white/5 rounded-xl"
            >
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/70 text-sm mb-1">{stat.label}</div>
              <div className="text-green-400 text-xs">↑ {stat.change}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}