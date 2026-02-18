import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  EnhancedProgress, 
  EnhancedCircularProgress, 
  EnhancedStepProgress,
  EnhancedLoadingBar,
  useProgress
} from '@/components/ui/EnhancedProgress';
import { Play, Pause, RotateCcw, User, Settings, Bell, Heart, Star } from 'lucide-react';

export function EnhancedProgressDemo() {
  const [demoMode, setDemoMode] = useState(false);
  
  // Linear progress
  const linearProgress = useProgress(0, 100);
  
  // Circular progress
  const circularProgress = useProgress(0, 100);
  
  // Step progress
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['使用者資訊', '帳號設定', '偏好選擇', '完成註冊'];
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [showTopLoading, setShowTopLoading] = useState(false);
  const [showBottomLoading, setShowBottomLoading] = useState(false);

  const startDemo = () => {
    setDemoMode(true);
    linearProgress.reset();
    circularProgress.reset();
    setCurrentStep(0);
    
    // Demo sequence
    setTimeout(() => linearProgress.setValue(30), 500);
    setTimeout(() => linearProgress.setValue(70), 1500);
    setTimeout(() => linearProgress.complete(), 2500);
    
    setTimeout(() => circularProgress.setValue(25), 1000);
    setTimeout(() => circularProgress.setValue(50), 2000);
    setTimeout(() => circularProgress.setValue(75), 3000);
    setTimeout(() => circularProgress.complete(), 4000);
    
    setTimeout(() => setCurrentStep(1), 1200);
    setTimeout(() => setCurrentStep(2), 2400);
    setTimeout(() => setCurrentStep(3), 3600);
    
    // Loading bar demo
    setTimeout(() => {
      setShowTopLoading(true);
      setTimeout(() => setShowTopLoading(false), 3000);
    }, 2000);
    
    setTimeout(() => {
      setShowBottomLoading(true);
      setTimeout(() => setShowBottomLoading(false), 3000);
    }, 3500);
    
    // End demo
    setTimeout(() => setDemoMode(false), 5000);
  };

  const testLinearProgress = () => {
    if (linearProgress.value >= 100) {
      linearProgress.reset();
    } else {
      linearProgress.increment(10);
    }
  };

  const testCircularProgress = () => {
    if (circularProgress.value >= 100) {
      circularProgress.reset();
    } else {
      circularProgress.increment(15);
    }
  };

  const testStepProgress = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const testLoadingBars = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const resetAll = () => {
    linearProgress.reset();
    circularProgress.reset();
    setCurrentStep(0);
    setIsLoading(false);
    setShowTopLoading(false);
    setShowBottomLoading(false);
  };

  // Auto-increment demo
  useEffect(() => {
    if (demoMode) {
      const interval = setInterval(() => {
        if (linearProgress.value < 100) {
          linearProgress.increment(2);
        }
        if (circularProgress.value < 100) {
          circularProgress.increment(1);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [demoMode, linearProgress, circularProgress]);

  return (
    <div className="space-y-6">
      {/* Loading Bars */}
      <EnhancedLoadingBar 
        isLoading={showTopLoading}
        position="top"
        message="載入中..."
      />
      
      <EnhancedLoadingBar 
        isLoading={showBottomLoading}
        position="bottom"
        color="rgba(34, 197, 94, 0.8)"
        message="處理中..."
      />

      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">增強版進度指示器</h3>
        
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

          {/* Linear Progress Examples */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">線性進度條</h4>
            <div className="space-y-4">
              <EnhancedProgress
                value={linearProgress.value}
                variant="primary"
                size="md"
                showLabel={true}
                label="主要進度"
                showPercentage={true}
                animated={true}
              />
              
              <EnhancedProgress
                value={linearProgress.value}
                variant="gradient"
                size="lg"
                showPercentage={true}
                striped={true}
                label="漸層進度條"
                animated={true}
              />
              
              <EnhancedProgress
                value={linearProgress.value}
                variant="success"
                size="sm"
                showLabel={true}
                label="成功狀態"
                animated={true}
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={testLinearProgress}
                  variant="outline"
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {linearProgress.value >= 100 ? '重設' : '增加進度'}
                </Button>
              </div>
            </div>
          </div>

          {/* Circular Progress Examples */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">圓形進度</h4>
            <div className="flex flex-wrap gap-6 items-center justify-center">
              <div className="text-center">
                <EnhancedCircularProgress
                  value={circularProgress.value}
                  variant="primary"
                  size={100}
                  strokeWidth={8}
                  showInnerValue={true}
                  showPercentage={true}
                />
                <p className="text-white/70 text-sm mt-2">主要樣式</p>
              </div>
              
              <div className="text-center">
                <EnhancedCircularProgress
                  value={circularProgress.value}
                  variant="success"
                  size={80}
                  strokeWidth={6}
                  showPercentage={true}
                />
                <p className="text-white/70 text-sm mt-2">成功樣式</p>
              </div>
              
              <div className="text-center">
                <EnhancedCircularProgress
                  value={circularProgress.value}
                  variant="gradient"
                  size={120}
                  strokeWidth={10}
                  showInnerValue={true}
                  showPercentage={true}
                />
                <p className="text-white/70 text-sm mt-2">漸層樣式</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button
                onClick={testCircularProgress}
                variant="outline"
                className="w-48"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {circularProgress.value >= 100 ? '重設圓形進度' : '增加圓形進度'}
              </Button>
            </div>
          </div>

          {/* Step Progress Examples */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">步驟進度</h4>
            <div className="space-y-6">
              <EnhancedStepProgress
                steps={steps}
                currentStep={currentStep}
                variant="primary"
                vertical={false}
                showLabels={true}
              />
              
              <EnhancedStepProgress
                steps={['個人資料', '安全設定', '通知偏好', '主題選擇', '完成']}
                currentStep={currentStep}
                variant="primary"
                vertical={true}
                showLabels={true}
                completedIcon={<User className="w-4 h-4" />}
                currentIcon={<Settings className="w-4 h-4" />}
                pendingIcon={<Bell className="w-4 h-4" />}
              />
              
              <div className="flex justify-center">
                <Button
                  onClick={testStepProgress}
                  variant="outline"
                  className="w-48"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {currentStep >= steps.length - 1 ? '重新開始' : '下一個步驟'}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading Examples */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">載入狀態</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={testLoadingBars}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '載入中...' : '顯示載入條'}
              </Button>
              
              <Button
                onClick={() => {
                  setShowTopLoading(true);
                  setTimeout(() => setShowTopLoading(false), 2000);
                }}
                variant="outline"
              >
                頂部載入條
              </Button>
              
              <Button
                onClick={() => {
                  setShowBottomLoading(true);
                  setTimeout(() => setShowBottomLoading(false), 2000);
                }}
                variant="outline"
              >
                底部載入條
              </Button>
              
              <Button
                onClick={resetAll}
                variant="outline"
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                重設所有進度
              </Button>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">增強功能特色：</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• 多種進度條樣式 (線性、圓形、步驟)</li>
              <li>• 多種主題變體 (primary, success, warning, error, gradient)</li>
              <li>• 平滑動畫過渡</li>
              <li>• 不確定模式支援</li>
              <li>• 自定義尺寸和標籤</li>
              <li>• 響應式設計</li>
              <li>• 垂直步驟佈局</li>
              <li>• 自定義圖示支援</li>
              <li>• 載入條組件</li>
              <li>• 進度管理 Hook</li>
              <li>• 無障礙設計</li>
              <li>• 條紋動畫效果</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}