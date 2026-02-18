/**
 * P1-097: 錯誤邊界優化系統演示
 * 展示錯誤邊界功能的完整使用方式
 */

'use client'

import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// 模擬會發生錯誤的組件
const ErrorComponent: React.FC<{ throwError?: boolean }> = ({ throwError = false }) => {
  if (throwError) {
    throw new Error('這是測試錯誤！');
  }
  
  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
      <h3 className="text-green-800 font-medium">正常運行的組件</h3>
      <p className="text-green-700">沒有發生錯誤</p>
    </div>
  );
};

// 使用 Hook 版本的組件
const ComponentWithErrorHandling: React.FC = () => {
  const { hasError, error, resetError } = useErrorBoundary();

  if (hasError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-bold">Hook 版本錯誤處理</h3>
        <p className="text-red-700">錯誤訊息: {error?.message}</p>
        <button
          onClick={resetError}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          重置錯誤
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
      <h3 className="text-blue-800 font-medium">使用 Hook 的組件</h3>
      <p className="text-blue-700">正常運行中</p>
    </div>
  );
};

// 錯誤邊界演示組件
export const ErrorBoundaryDemo: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [showHookError, setShowHookError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: '功能概覽' },
    { id: 'basic', name: '基本使用' },
    { id: 'hook', name: 'Hook 版本' },
    { id: 'hoc', name: 'HOC 版本' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          P1-097: 錯誤邊界處理優化
        </h1>
        <p className="text-gray-600">
          完整的錯誤邊界處理系統，提供優雅的錯誤處理和用戶體驗
        </p>
      </div>

      {/* 標籤頁導航 */}
      <div className="flex gap-1 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 font-medium text-sm border-b-2 transition-colors
              ${activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 內容區域 */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewDemo />}
        {activeTab === 'basic' && (
          <BasicUsageDemo 
            showError={showError} 
            setShowError={setShowError} 
          />
        )}
        {activeTab === 'hook' && (
          <HookUsageDemo 
            showHookError={showHookError} 
            setShowHookError={setShowHookError} 
          />
        )}
        {activeTab === 'hoc' && <HOCUsageDemo />}
      </div>
    </div>
  );
};

// 功能概覽示範
const OverviewDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">錯誤邊界系統特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2"> componentDidCatch</h3>
            <p className="text-blue-700 text-sm">
              使用 React 的生命周期方法捕獲組件錯誤
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">自定義回退 UI</h3>
            <p className="text-green-700 text-sm">
              提供美觀的錯誤頁面，保持良好的用戶體驗
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-2">錯誤報告</h3>
            <p className="text-amber-700 text-sm">
              自動記錄錯誤信息，便於調試和監控
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">多重實現</h3>
            <p className="text-purple-700 text-sm">
              提供 Class、Hook、HOC 多種實現方式
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">錯誤處理最佳實踐</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>只在必要時使用錯誤邊界，不要濫用</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>提供有意義的錯誤回退 UI</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>記錄錯誤信息以便調試</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>提供重置錯誤狀態的方法</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// 基本使用示範
interface BasicUsageDemoProps {
  showError: boolean;
  setShowError: (show: boolean) => void;
}

const BasicUsageDemo: React.FC<BasicUsageDemoProps> = ({ showError, setShowError }) => {
  const handleToggleError = () => {
    setShowError(!showError);
  };

  const handleError = (error: Error, errorInfo: any) => {
    console.log('錯誤被捕獲:', error, errorInfo);
  };

  const handleReset = () => {
    setShowError(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">基本錯誤邊界使用</h2>
        <p className="text-gray-600 mb-4">
          使用 ErrorBoundary 組件包裝可能出錯的組件
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleToggleError}
            className={`px-4 py-2 rounded-md font-medium ${
              showError 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            {showError ? '隱藏錯誤' : '觸發錯誤'}
          </button>
          
          <button
            onClick={() => setShowError(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            重置狀態
          </button>
        </div>

        <div className="border rounded-lg p-4 min-h-[200px]">
          <ErrorBoundary 
            onError={handleError}
            onReset={handleReset}
          >
            <ErrorComponent throwError={showError} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

// Hook 使用示範
interface HookUsageDemoProps {
  showHookError: boolean;
  setShowHookError: (show: boolean) => void;
}

const HookUsageDemo: React.FC<HookUsageDemoProps> = ({ showHookError, setShowHookError }) => {
  const handleTriggerError = () => {
    setShowHookError(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Hook 版本使用</h2>
        <p className="text-gray-600 mb-4">
          使用 useErrorBoundary Hook 處理組件內部錯誤
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleTriggerError}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            觸發錯誤
          </button>
          
          <button
            onClick={() => setShowHookError(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            重置狀態
          </button>
        </div>

        <div className="border rounded-lg p-4 min-h-[200px]">
          {showHookError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-bold">模擬錯誤狀態</h3>
              <p className="text-red-700">這裡展示了錯誤狀態</p>
              <button
                onClick={() => setShowHookError(false)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                重置錯誤
              </button>
            </div>
          ) : (
            <ComponentWithErrorHandling />
          )}
        </div>
      </div>
    </div>
  );
};

// HOC 使用示範
const ComponentWithErrorBoundary = withErrorBoundary(ErrorComponent);

const HOCUsageDemo: React.FC = () => {
  const [showHOCError, setShowHOCError] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">HOC 版本使用</h2>
        <p className="text-gray-600 mb-4">
          使用 withErrorBoundary 高階組件處理錯誤
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowHOCError(!showHOCError)}
            className={`px-4 py-2 rounded-md font-medium ${
              showHOCError 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            {showHOCError ? '隱藏錯誤' : '觸發錯誤'}
          </button>
          
          <button
            onClick={() => setShowHOCError(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            重置狀態
          </button>
        </div>

        <div className="border rounded-lg p-4 min-h-[200px]">
          <ComponentWithErrorBoundary throwError={showHOCError} />
        </div>
      </div>
    </div>
  );
};