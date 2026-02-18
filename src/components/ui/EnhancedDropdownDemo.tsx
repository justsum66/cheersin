import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { EnhancedDropdown, useDropdownState } from '@/components/ui/EnhancedDropdown';
import { User, Settings, Bell, Heart, Star, Calendar, MapPin, Tag } from 'lucide-react';

export function EnhancedDropdownDemo() {
  const [demoMode, setDemoMode] = useState(false);
  
  // Single selection dropdown
  const singleSelect = useDropdownState<string | number>();
  
  // Multiple selection dropdown
  const multiSelect = useDropdownState<(string | number)[]>([]);
  
  // Searchable dropdown
  const searchableSelect = useDropdownState<string | number>();
  
  // Dropdown options
  const userOptions = [
    { value: '1', label: '張小明', icon: <User className="w-4 h-4" /> },
    { value: '2', label: '李小華', icon: <User className="w-4 h-4" /> },
    { value: '3', label: '王大偉', icon: <User className="w-4 h-4" /> },
    { value: '4', label: '陳美玲', icon: <User className="w-4 h-4" /> },
    { value: '5', label: '林志明', icon: <User className="w-4 h-4" /> }
  ];

  const categoryOptions = [
    { value: 'tech', label: '科技', icon: <Settings className="w-4 h-4" />, description: '技術相關內容' },
    { value: 'design', label: '設計', icon: <Star className="w-4 h-4" />, description: '設計相關內容' },
    { value: 'business', label: '商業', icon: <Bell className="w-4 h-4" />, description: '商業相關內容' },
    { value: 'lifestyle', label: '生活', icon: <Heart className="w-4 h-4" />, description: '生活相關內容' },
    { value: 'travel', label: '旅遊', icon: <MapPin className="w-4 h-4" />, description: '旅遊相關內容' }
  ];

  const tagOptions = [
    { value: 'react', label: 'React', group: '前端' },
    { value: 'vue', label: 'Vue.js', group: '前端' },
    { value: 'angular', label: 'Angular', group: '前端' },
    { value: 'node', label: 'Node.js', group: '後端' },
    { value: 'python', label: 'Python', group: '後端' },
    { value: 'java', label: 'Java', group: '後端' },
    { value: 'ui', label: 'UI設計', group: '設計' },
    { value: 'ux', label: 'UX設計', group: '設計' },
    { value: 'mobile', label: '行動應用', group: '平台' },
    { value: 'web', label: '網頁開發', group: '平台' }
  ];

  const startDemo = () => {
    setDemoMode(true);
    
    // Demo sequence
    setTimeout(() => singleSelect.setValue('2'), 500);
    setTimeout(() => multiSelect.setValue(['tech', 'design']), 1500);
    setTimeout(() => searchableSelect.setValue('張小明'), 2500);
    setTimeout(() => singleSelect.clear(), 3500);
    setTimeout(() => multiSelect.clear(), 4500);
    
    // End demo
    setTimeout(() => setDemoMode(false), 5500);
  };

  const testSingleSelect = () => {
    singleSelect.setValue('3' as any);
  };

  const testMultiSelect = () => {
    multiSelect.setValue(['business', 'lifestyle'] as any);
  };

  const testClearAll = () => {
    singleSelect.clear();
    multiSelect.clear();
    searchableSelect.clear();
  };

  const testResetAll = () => {
    singleSelect.reset();
    multiSelect.reset();
    searchableSelect.reset();
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">增強版下拉選單</h3>
      
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

        {/* Dropdown Examples */}
        <div className="space-y-6">
          {/* Single Selection */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">單選下拉選單</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedDropdown
                options={userOptions}
                value={singleSelect.value}
                onChange={singleSelect.setValue}
                placeholder="選擇使用者..."
                variant="default"
                size="md"
                clearable={true}
              />
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-sm mb-1">已選擇:</div>
                <div className="text-white">
                  {singleSelect.value 
                    ? userOptions.find(opt => opt.value === singleSelect.value)?.label 
                    : '無'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Multiple Selection */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">多選下拉選單</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedDropdown
                options={categoryOptions}
                value={multiSelect.value}
                onChange={multiSelect.setValue}
                placeholder="選擇分類..."
                multiple={true}
                variant="outline"
                size="md"
                clearable={true}
                showCheckboxes={true}
              />
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-sm mb-1">已選擇 ({multiSelect.value?.length || 0}):</div>
                <div className="text-white text-sm">
                  {multiSelect.value && multiSelect.value.length > 0
                    ? multiSelect.value.map(val => 
                        categoryOptions.find(opt => opt.value === val)?.label
                      ).join(', ')
                    : '無'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Searchable Dropdown */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">可搜尋下拉選單</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedDropdown
                options={userOptions}
                value={searchableSelect.value}
                onChange={searchableSelect.setValue}
                placeholder="搜尋使用者..."
                searchable={true}
                variant="filled"
                size="md"
                clearable={true}
                maxHeight={200}
              />
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-sm mb-1">搜尋結果:</div>
                <div className="text-white">
                  {searchableSelect.value 
                    ? userOptions.find(opt => opt.value === searchableSelect.value)?.label 
                    : '請輸入搜尋關鍵字'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Dropdown */}
          <div>
            <h4 className="text-lg font-semibold text-white/90 mb-3">分組下拉選單</h4>
            <EnhancedDropdown
              options={tagOptions}
              value={multiSelect.value}
              onChange={multiSelect.setValue}
              placeholder="選擇標籤..."
              multiple={true}
              searchable={true}
              variant="ghost"
              size="lg"
              clearable={true}
              groupBy="group"
              showCheckboxes={true}
              maxHeight={250}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={testSingleSelect}
            variant="outline"
            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
          >
            設定單選值
          </Button>
          
          <Button
            onClick={testMultiSelect}
            variant="outline"
            className="border-green-500/50 text-green-300 hover:bg-green-500/10"
          >
            設定多選值
          </Button>
          
          <Button
            onClick={testClearAll}
            variant="outline"
            className="border-red-500/50 text-red-300 hover:bg-red-500/10"
          >
            清除所有
          </Button>
          
          <Button
            onClick={testResetAll}
            variant="outline"
            className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
          >
            重設所有
          </Button>
        </div>

        {/* Features List */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">增強功能特色：</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• 單選與多選模式支援</li>
            <li>• 即時搜尋過濾功能</li>
            <li>• 鍵盤導航完整支援</li>
            <li>• 自定義圖示與描述</li>
            <li>• 分組顯示選項</li>
            <li>• 核取方塊顯示模式</li>
            <li>• 響應式設計</li>
            <li>• 無障礙設計 (ARIA)</li>
            <li>• 平滑動畫過渡</li>
            <li>• 自定義樣式變體</li>
            <li>• 載入狀態處理</li>
            <li>• 選項建立功能</li>
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">鍵盤快捷鍵：</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/70 text-sm">
            <div>• <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> / <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Space</kbd> 開啟/選擇</div>
            <div>• <kbd className="px-2 py-1 bg-white/10 rounded text-xs">↑↓</kbd> 上下選擇</div>
            <div>• <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Home</kbd> / <kbd className="px-2 py-1 bg-white/10 rounded text-xs">End</kbd> 首尾選項</div>
            <div>• <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd> 關閉選單</div>
            <div>• <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Tab</kbd> 離開選單</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}