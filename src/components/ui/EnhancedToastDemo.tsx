import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useEnhancedToast } from '@/components/ui/EnhancedToast';

export function EnhancedToastDemo() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const toast = useEnhancedToast();

  const startDemo = () => {
    setIsDemoMode(true);
    
    // Demo sequence
    setTimeout(() => {
      toast.success('操作成功！資料已儲存', {
        position: 'top-right',
        duration: 3000
      });
    }, 500);

    setTimeout(() => {
      toast.info('系統更新提醒', {
        position: 'top-center',
        duration: 4000,
        action: {
          label: '立即更新',
          onClick: () => alert('開始更新...')
        }
      });
    }, 1500);

    setTimeout(() => {
      toast.warning('記憶體使用率過高', {
        position: 'bottom-left',
        duration: 3500
      });
    }, 2500);

    setTimeout(() => {
      toast.error('網路連線不穩定，請檢查設定', {
        position: 'bottom-center',
        duration: 5000
      });
    }, 3500);

    // Loading toast demo
    setTimeout(() => {
      const loadingId = toast.loading('處理中...請稍候', {
        position: 'top-left'
      });
      
      // Simulate long operation
      setTimeout(() => {
        toast.dismiss(loadingId);
        toast.success('處理完成！', {
          position: 'top-left',
          duration: 3000
        });
      }, 3000);
    }, 4500);

    // Progress toast demo
    setTimeout(() => {
      let progress = 0;
      toast.info('檔案上傳中...', {
        position: 'bottom-right',
        progress: 0,
        dismissible: false
      });

      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          toast.custom({
            message: `檔案上傳中... ${progress}%`,
            type: 'info',
            position: 'bottom-right',
            progress: progress,
            dismissible: false
          });
        } else {
          clearInterval(interval);
          toast.success('檔案上傳完成！', {
            position: 'bottom-right',
            duration: 3000
          });
        }
      }, 300);
    }, 6000);

    // End demo mode
    setTimeout(() => {
      setIsDemoMode(false);
    }, 8000);
  };

  const testIndividualTypes = () => {
    toast.success('成功訊息範例 - 操作已完成', { 
      duration: 3000,
      position: 'top-right'
    });
  };

  const testErrorToast = () => {
    toast.error('錯誤訊息範例 - 這是一個較長的錯誤訊息，用來測試換行效果和視覺呈現', { 
      duration: 5000,
      position: 'bottom-right'
    });
  };

  const testWarningToast = () => {
    toast.warning('警告訊息範例 - 請注意系統資源使用情況', { 
      duration: 4000,
      position: 'top-left'
    });
  };

  const testInfoToast = () => {
    toast.info('資訊訊息範例 - 新功能已上線', { 
      duration: 3500,
      position: 'bottom-left',
      action: {
        label: '了解更多',
        onClick: () => alert('新功能介紹')
      }
    });
  };

  const testLoadingToast = () => {
    const loadingId = toast.loading('載入中...請稍候', {
      position: 'top-center'
    });
    
    setTimeout(() => {
      toast.dismiss(loadingId);
      toast.success('載入完成！', {
        position: 'top-center',
        duration: 2000
      });
    }, 2000);
  };

  const testCustomPosition = () => {
    toast.custom({
      message: '自定義位置通知 - 中央頂部',
      type: 'success',
      position: 'top-center',
      duration: 3000
    });
  };

  const testProgressToast = () => {
    let progress = 0;
    toast.info('進度示範...', {
      progress: 0,
      dismissible: false
    });

    const interval = setInterval(() => {
      progress += 15;
      if (progress <= 100) {
        toast.custom({
          message: `處理進度: ${progress}%`,
          type: 'info',
          progress: progress,
          dismissible: false
        });
      } else {
        clearInterval(interval);
        toast.success('處理完成！', { duration: 2000 });
      }
    }, 200);
  };

  const clearAllToasts = () => {
    toast.clear();
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">增強版通知系統</h3>
      
      <div className="space-y-6">
        {/* Demo Controls */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white/90">示範模式</h4>
          <Button
            onClick={startDemo}
            disabled={isDemoMode}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isDemoMode ? '示範進行中...' : '開始完整示範'}
          </Button>
        </div>

        {/* Individual Tests */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white/90">個別測試</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={testIndividualTypes}
              className="bg-green-500 hover:bg-green-600"
            >
              成功通知
            </Button>
            
            <Button
              onClick={testErrorToast}
              variant="outline"
              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
            >
              錯誤通知
            </Button>
            
            <Button
              onClick={testWarningToast}
              variant="outline"
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
            >
              警告通知
            </Button>
            
            <Button
              onClick={testInfoToast}
              variant="outline"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
            >
              資訊通知
            </Button>
            
            <Button
              onClick={testLoadingToast}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              載入通知
            </Button>
            
            <Button
              onClick={testCustomPosition}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              自定位置
            </Button>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white/90">進階功能</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={testProgressToast}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              進度通知
            </Button>
            
            <Button
              onClick={clearAllToasts}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              清除所有通知
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">增強功能特色：</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• 多種位置選擇 (6個位置)</li>
            <li>• 自定義進度條顯示</li>
            <li>• 滑鼠懸停暫停功能</li>
            <li>• 平滑動畫過渡</li>
            <li>• 行動按鈕支援</li>
            <li>• 完整無障礙支援</li>
            <li>• 響應式設計</li>
            <li>• 輕量級實作</li>
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}