import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  EnhancedTooltip, 
  InfoTooltip, 
  SuccessTooltip, 
  ErrorTooltip,
  useTooltip 
} from '@/components/ui/EnhancedTooltip';
import { Settings, User, Bell, Heart, Star, Copy, Check, X } from 'lucide-react';

export function EnhancedTooltipDemo() {
  const [demoMode, setDemoMode] = useState(false);
  const manualTooltip = useTooltip();
  
  const startDemo = () => {
    setDemoMode(true);
    
    // Demo sequence
    setTimeout(() => manualTooltip.show(), 500);
    setTimeout(() => manualTooltip.hide(), 2000);
    setTimeout(() => manualTooltip.toggle(), 3000);
    setTimeout(() => manualTooltip.toggle(), 4000);
    
    // End demo
    setTimeout(() => setDemoMode(false), 5000);
  };

  const testManualTooltip = () => {
    manualTooltip.toggle();
  };

  const testCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`已複製: ${text}`);
    });
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">增強版工具提示</h3>
      
      <div className="space-y-6">
        {/* Demo Controls */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white/90">示範模式</h4>
          <Button
            onClick={startDemo}
            disabled={demoMode}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {demoMode ? '示範進行中...' : '開始完整示範'}
          </Button>
        </div>

        {/* Basic Tooltips */}
        <div>
          <h4 className="text-lg font-semibold text-white/90 mb-3">基本工具提示</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <EnhancedTooltip
              content="這是頂部工具提示"
              position="top"
              trigger="hover"
              variant="default"
            >
              <Button variant="outline" className="w-full">
                頂部
              </Button>
            </EnhancedTooltip>
            
            <EnhancedTooltip
              content="這是底部工具提示"
              position="bottom"
              trigger="hover"
              variant="primary"
            >
              <Button variant="outline" className="w-full">
                底部
              </Button>
            </EnhancedTooltip>
            
            <EnhancedTooltip
              content="這是左側工具提示"
              position="left"
              trigger="hover"
              variant="success"
            >
              <Button variant="outline" className="w-full">
                左側
              </Button>
            </EnhancedTooltip>
            
            <EnhancedTooltip
              content="這是右側工具提示"
              position="right"
              trigger="hover"
              variant="warning"
            >
              <Button variant="outline" className="w-full">
                右側
              </Button>
            </EnhancedTooltip>
          </div>
        </div>

        {/* Trigger Types */}
        <div>
          <h4 className="text-lg font-semibold text-white/90 mb-3">觸發方式</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EnhancedTooltip
              content="滑鼠懸停觸發"
              trigger="hover"
              delay={300}
            >
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                懸停觸發
              </Button>
            </EnhancedTooltip>
            
            <EnhancedTooltip
              content="點擊觸發工具提示"
              trigger="click"
            >
              <Button className="w-full bg-green-500 hover:bg-green-600">
                點擊觸發
              </Button>
            </EnhancedTooltip>
            
            <EnhancedTooltip
              content="焦點觸發工具提示"
              trigger="focus"
            >
              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                焦點觸發
              </Button>
            </EnhancedTooltip>
          </div>
        </div>

        {/* Pre-built Variants */}
        <div>
          <h4 className="text-lg font-semibold text-white/90 mb-3">預設樣式</h4>
          <div className="flex flex-wrap gap-4 items-center">
            <InfoTooltip text="這是一個資訊提示" />
            <span>資訊提示</span>
            
            <SuccessTooltip text="操作成功完成" />
            <span>成功提示</span>
            
            <ErrorTooltip text="發生錯誤，請重試" />
            <span>錯誤提示</span>
          </div>
        </div>

        {/* Interactive Tooltips */}
        <div>
          <h4 className="text-lg font-semibold text-white/90 mb-3">互動式工具提示</h4>
          <div className="space-y-4">
            <EnhancedTooltip
              content={
                <div className="space-y-2">
                  <h4 className="font-semibold">使用者資訊</h4>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>張小明</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>最後上線: 2小時前</span>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    傳送訊息
                  </Button>
                </div>
              }
              position="right"
              trigger="click"
              interactive={true}
              maxWidth={250}
              variant="dark"
            >
              <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20">
                <User className="w-5 h-5 text-white" />
                <span className="text-white">張小明</span>
              </div>
            </EnhancedTooltip>
            
            <EnhancedTooltip
              content={
                <div className="space-y-2">
                  <h4 className="font-semibold">設定選項</h4>
                  <div className="space-y-1">
                    <button className="flex items-center gap-2 w-full text-left p-1 rounded hover:bg-white/10">
                      <Settings className="w-4 h-4" />
                      <span>帳號設定</span>
                    </button>
                    <button className="flex items-center gap-2 w-full text-left p-1 rounded hover:bg-white/10">
                      <Heart className="w-4 h-4" />
                      <span>偏好設定</span>
                    </button>
                    <button className="flex items-center gap-2 w-full text-left p-1 rounded hover:bg-white/10">
                      <Star className="w-4 h-4" />
                      <span>主題設定</span>
                    </button>
                  </div>
                </div>
              }
              trigger="click"
              interactive={true}
              maxWidth={200}
              variant="dark"
            >
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                設定
              </Button>
            </EnhancedTooltip>
          </div>
        </div>

        {/* Manual Control */}
        <div>
          <h4 className="text-lg font-semibold text-white/90 mb-3">手動控制</h4>
          <div className="flex items-center gap-4">
            <EnhancedTooltip
              ref={manualTooltip as any}
              content="這是手動控制的工具提示"
              trigger="manual"
              variant="primary"
            >
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                手動控制元素
              </div>
            </EnhancedTooltip>
            
            <Button
              onClick={testManualTooltip}
              variant="outline"
              className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
            >
              切換工具提示
            </Button>
          </div>
        </div>

        {/* Copy Functionality */}
        <div>
          <h4 className="text-lg font-semibold text-white/90 mb-3">複製功能</h4>
          <div className="flex flex-wrap gap-3">
            <EnhancedTooltip
              content="點擊複製到剪貼簿"
              trigger="hover"
              variant="success"
              animationType="scale"
            >
              <Button
                onClick={() => testCopyToClipboard('user@example.com')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                複製信箱
              </Button>
            </EnhancedTooltip>
            
            <EnhancedTooltip
              content="複製成功!"
              trigger="click"
              variant="success"
              duration={2000}
            >
              <Button
                onClick={() => testCopyToClipboard('https://example.com')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                複製連結
              </Button>
            </EnhancedTooltip>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">增強功能特色：</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• 多種定位選項 (top, bottom, left, right, auto)</li>
            <li>• 多種觸發方式 (hover, click, focus, manual)</li>
            <li>• 自定義動畫效果 (fade, scale, slide, bounce)</li>
            <li>• 互動式工具提示支援</li>
            <li>• 響應式位置調整</li>
            <li>• 箭頭指示器</li>
            <li>• 觸控裝置支援</li>
            <li>• 無障礙設計 (ARIA)</li>
            <li>• 延遲顯示/隱藏</li>
            <li>• 預設樣式組件</li>
            <li>• 手動控制 API</li>
            <li>• 自動視窗邊界調整</li>
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">鍵盤支援：</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/70 text-sm">
            <div>• <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd> 關閉工具提示</div>
            <div>• <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Tab</kbd> 焦點導航</div>
            <div>• 觸控裝置自動支援</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}