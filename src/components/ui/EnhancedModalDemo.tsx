import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { EnhancedModal, useEnhancedModal, ConfirmModal } from '@/components/ui/EnhancedModal';
import { Settings, User, Bell, Shield, Info, AlertTriangle } from 'lucide-react';

export function EnhancedModalDemo() {
  const [demoMode, setDemoMode] = useState(false);
  const basicModal = useEnhancedModal();
  const formModal = useEnhancedModal();
  const fullscreenModal = useEnhancedModal();
  const dangerModal = useEnhancedModal();
  const successModal = useEnhancedModal();

  const startDemo = () => {
    setDemoMode(true);
    
    // Open different modals in sequence
    setTimeout(() => basicModal.open(), 500);
    setTimeout(() => formModal.open(), 2000);
    setTimeout(() => fullscreenModal.open(), 3500);
    setTimeout(() => dangerModal.open(), 5000);
    setTimeout(() => successModal.open(), 6500);
    
    // End demo
    setTimeout(() => setDemoMode(false), 8000);
  };

  const testBasicModal = () => {
    basicModal.open();
  };

  const testFormModal = () => {
    formModal.open();
  };

  const testFullscreenModal = () => {
    fullscreenModal.open();
  };

  const testConfirmModal = () => {
    // This would typically be called from within a component
    // For demo purposes, we'll show how it would be used
    alert('Confirm modal would appear here with custom message and actions');
  };

  const testDangerModal = () => {
    dangerModal.open();
  };

  const testSuccessModal = () => {
    successModal.open();
  };

  const clearAllModals = () => {
    basicModal.close();
    formModal.close();
    fullscreenModal.close();
    dangerModal.close();
    successModal.close();
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">增強版彈窗系統</h3>
      
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

        {/* Modal Types */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white/90">彈窗類型測試</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={testBasicModal}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Info className="w-4 h-4 mr-2" />
              基本彈窗
            </Button>
            
            <Button
              onClick={testFormModal}
              variant="outline"
              className="border-green-500/50 text-green-300 hover:bg-green-500/10"
            >
              <User className="w-4 h-4 mr-2" />
              表單彈窗
            </Button>
            
            <Button
              onClick={testFullscreenModal}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              全螢幕彈窗
            </Button>
            
            <Button
              onClick={testDangerModal}
              variant="outline"
              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              警告彈窗
            </Button>
            
            <Button
              onClick={testSuccessModal}
              variant="outline"
              className="border-green-500/50 text-green-300 hover:bg-green-500/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              成功彈窗
            </Button>
            
            <Button
              onClick={testConfirmModal}
              variant="outline"
              className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
            >
              <Bell className="w-4 h-4 mr-2" />
              確認彈窗
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={clearAllModals}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            關閉所有彈窗
          </Button>
        </div>

        {/* Features List */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">增強功能特色：</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• 多種尺寸選擇 (sm, md, lg, xl, fullscreen)</li>
            <li>• 不同主題樣式 (default, danger, success, warning)</li>
            <li>• 多種動畫效果 (slide, fade, scale, flip)</li>
            <li>• 完整鍵盤導航支援</li>
            <li>• 焦點陷阱 (Focus Trap)</li>
            <li>• 無障礙設計 (ARIA 標籤)</li>
            <li>• 響應式全螢幕切換</li>
            <li>• 自動焦點管理</li>
            <li>• 背景模糊效果</li>
            <li>• 確認彈窗預設樣式</li>
          </ul>
        </div>
      </div>

      {/* Modal Instances */}
      <EnhancedModal
        open={basicModal.isOpen}
        onClose={basicModal.close}
        title="基本彈窗範例"
        size="md"
        variant="default"
      >
        <div className="space-y-4">
          <p className="text-white/80">
            這是一個基本的彈窗範例，展示標準的內容展示方式。
            彈窗包含標題、關閉按鈕，並支援鍵盤導航和焦點管理。
          </p>
          <div className="flex justify-end">
            <Button onClick={basicModal.close} className="min-h-[44px]">
              關閉
            </Button>
          </div>
        </div>
      </EnhancedModal>

      <EnhancedModal
        open={formModal.isOpen}
        onClose={formModal.close}
        title="表單彈窗範例"
        size="lg"
        variant="success"
        animationType="slide"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                使用者名稱
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="輸入使用者名稱"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                電子郵件
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="輸入電子郵件"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              訊息
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="輸入您的訊息..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              onClick={formModal.close}
              variant="outline"
              className="min-h-[44px]"
            >
              取消
            </Button>
            <Button className="min-h-[44px]">
              儲存變更
            </Button>
          </div>
        </div>
      </EnhancedModal>

      <EnhancedModal
        open={fullscreenModal.isOpen}
        onClose={fullscreenModal.close}
        title="全螢幕彈窗範例"
        size="fullscreen"
        variant="default"
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-xl font-bold text-white mb-4">全螢幕內容</h3>
            <div className="space-y-4">
              <p className="text-white/80">
                這是一個全螢幕彈窗，適合展示大量內容或複雜的介面。
                可以包含多個區塊、表單、表格或其他互動元素。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">項目 {item}</h4>
                    <p className="text-white/60 text-sm">
                      這裡是項目 {item} 的詳細內容，展示全螢幕彈窗的內容佈局能力。
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex justify-end gap-3">
              <Button
                onClick={fullscreenModal.close}
                variant="outline"
                className="min-h-[44px]"
              >
                關閉
              </Button>
              <Button className="min-h-[44px]">
                確認
              </Button>
            </div>
          </div>
        </div>
      </EnhancedModal>

      <EnhancedModal
        open={dangerModal.isOpen}
        onClose={dangerModal.close}
        title="警告彈窗範例"
        size="md"
        variant="danger"
        animationType="flip"
      >
        <div className="space-y-4">
          <p className="text-white/80">
            這是一個警告樣式的彈窗，用於顯示重要或需要用戶特別注意的訊息。
            警告彈窗通常用於確認刪除操作或其他重要動作。
          </p>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              重要：此操作無法復原，請謹慎處理。
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              onClick={dangerModal.close}
              variant="outline"
              className="min-h-[44px] border-white/30 text-white hover:bg-white/10"
            >
              取消
            </Button>
            <Button
              onClick={dangerModal.close}
              className="min-h-[44px] bg-red-500 hover:bg-red-600"
            >
              確認刪除
            </Button>
          </div>
        </div>
      </EnhancedModal>

      <EnhancedModal
        open={successModal.isOpen}
        onClose={successModal.close}
        title="成功彈窗範例"
        size="sm"
        variant="success"
        animationType="fade"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">操作成功！</h3>
            <p className="text-white/70">
              您的操作已成功完成，相關變更已儲存。
            </p>
          </div>
          <Button
            onClick={successModal.close}
            className="w-full min-h-[44px]"
          >
            確定
          </Button>
        </div>
      </EnhancedModal>
    </GlassCard>
  );
}