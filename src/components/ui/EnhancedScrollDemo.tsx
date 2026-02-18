import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useEnhancedScroll, ScrollIndicator, ScrollToTopButton, SmoothScroll } from '@/hooks/useEnhancedScroll';

export function EnhancedScrollDemo() {
  const [demoMode, setDemoMode] = useState(false);
  const {
    scrollPosition,
    scrollDirection,
    scrollProgress,
    isScrolling,
    isScrollLocked,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    lockScroll,
    unlockScroll,
    saveScrollPosition,
    restoreScrollPosition
  } = useEnhancedScroll({
    key: 'scroll-demo',
    restoreOnBack: true,
    saveOnUnmount: true
  });

  const [sections, setSections] = useState([
    { id: 1, title: '第一區塊', content: '這是第一個內容區塊' },
    { id: 2, title: '第二區塊', content: '這是第二個內容區塊' },
    { id: 3, title: '第三區塊', content: '這是第三個內容區塊' },
    { id: 4, title: '第四區塊', content: '這是第四個內容區塊' },
    { id: 5, title: '第五區塊', content: '這是第五個內容區塊' }
  ]);

  const startDemo = () => {
    setDemoMode(true);
    
    // Demo sequence
    setTimeout(() => scrollTo('#section-2'), 500);
    setTimeout(() => scrollTo('#section-3'), 1500);
    setTimeout(() => scrollTo('#section-1'), 2500);
    setTimeout(() => scrollToBottom(), 3500);
    setTimeout(() => scrollToTop(), 4500);
    setTimeout(() => lockScroll(), 5500);
    setTimeout(() => unlockScroll(), 7000);
    
    // End demo
    setTimeout(() => setDemoMode(false), 8000);
  };

  const testScrollToTop = () => {
    scrollToTop({ behavior: 'smooth' });
  };

  const testScrollToBottom = () => {
    scrollToBottom({ behavior: 'smooth' });
  };

  const testScrollToSection = (sectionId: number) => {
    scrollTo(`#section-${sectionId}`, { behavior: 'smooth', block: 'center' });
  };

  const testScrollLock = () => {
    if (isScrollLocked) {
      unlockScroll();
    } else {
      lockScroll();
    }
  };

  const testSaveRestore = () => {
    saveScrollPosition();
    setTimeout(() => {
      // Scroll somewhere else
      scrollTo(200);
      // Restore after delay
      setTimeout(() => restoreScrollPosition(), 1000);
    }, 500);
  };

  const addSection = () => {
    const newId = sections.length + 1;
    setSections(prev => [...prev, {
      id: newId,
      title: `第${newId}區塊`,
      content: `這是第${newId}個內容區塊`
    }]);
  };

  const removeSection = () => {
    if (sections.length > 1) {
      setSections(prev => prev.slice(0, -1));
    }
  };

  return (
    <SmoothScroll>
      <div className="space-y-6">
        {/* Demo Controls */}
        <GlassCard className="p-6 sticky top-4 z-10">
          <h3 className="text-xl font-bold text-white mb-4">增強版滾動系統</h3>
          
          <div className="space-y-4">
            {/* Status Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">位置</div>
                <div className="text-white font-mono">
                  X: {Math.round(scrollPosition.x)}<br/>
                  Y: {Math.round(scrollPosition.y)}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">方向</div>
                <div className="text-white capitalize">{scrollDirection}</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">進度</div>
                <div className="text-white">{Math.round(scrollProgress)}%</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">狀態</div>
                <div className="text-white">
                  {isScrolling ? '滾動中' : '靜止'}
                  {isScrollLocked && ' (已鎖定)'}
                </div>
              </div>
            </div>

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

            {/* Scroll Controls */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white/90">滾動控制</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Button
                  onClick={testScrollToTop}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  滾到頂部
                </Button>
                
                <Button
                  onClick={testScrollToBottom}
                  variant="outline"
                  className="border-green-500/50 text-green-300 hover:bg-green-500/10"
                >
                  滾到底部
                </Button>
                
                <Button
                  onClick={testScrollLock}
                  variant={isScrollLocked ? "primary" : "outline"}
                  className={isScrollLocked 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
                  }
                >
                  {isScrollLocked ? '解除鎖定' : '鎖定滾動'}
                </Button>
                
                <Button
                  onClick={() => testScrollToSection(2)}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  滾到第2區塊
                </Button>
                
                <Button
                  onClick={testSaveRestore}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  儲存/還原位置
                </Button>
                
                <Button
                  onClick={addSection}
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
                >
                  新增區塊
                </Button>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">增強功能特色：</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• 平滑滾動動畫</li>
                <li>• 滾動方向偵測</li>
                <li>• 滾動進度追蹤</li>
                <li>• 滾動位置儲存/還原</li>
                <li>• 滾動鎖定功能</li>
                <li>• 響應式滾動指示器</li>
                <li>• 回到頂部按鈕</li>
                <li>• 完整鍵盤支援</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Content Sections */}
        <div className="space-y-8 pb-20">
          {sections.map((section) => (
            <GlassCard 
              key={section.id} 
              id={`section-${section.id}`}
              className="p-8 min-h-[400px] flex items-center justify-center"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                <p className="text-white/70 text-lg">{section.content}</p>
                <div className="mt-6 text-white/50 text-sm">
                  區塊 #{section.id} - 滾動到此處測試定位功能
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator 
          color="rgba(96, 165, 250, 0.8)" 
          height={4}
          showPercentage={true}
        />

        {/* Scroll to Top Button */}
        <ScrollToTopButton 
          threshold={200}
          position="bottom-right"
          offset={24}
        />
      </div>
    </SmoothScroll>
  );
}