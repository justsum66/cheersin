/**
 * P1-084: 離線功能整合示範
 * 展示離線功能的完整使用方式
 */

'use client'

import { useState } from 'react'
import { 
  useOfflineManager, 
  useOfflineData,
  OfflineState 
} from '@/lib/offline-optimization'
import { 
  OfflineIndicator,
  SyncProgressIndicator,
  OfflineStatusPanel
} from '@/components/ui/OfflineIndicator'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

export function OfflineOptimizationDemo() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabs = [
    { id: 'overview', name: '功能概覽' },
    { id: 'indicator', name: '狀態指示器' },
    { id: 'data', name: '離線資料' },
    { id: 'sync', name: '同步管理' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          P1-084: 離線體驗優化
        </h1>
        <p className="text-gray-600">
          完整的離線功能支援，包括狀態管理、資料同步和用戶體驗優化
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
        {activeTab === 'indicator' && <IndicatorDemo />}
        {activeTab === 'data' && <OfflineDataDemo />}
        {activeTab === 'sync' && <SyncManagementDemo />}
      </div>

      {/* 全局離線指示器 */}
      <OfflineIndicator position="top" />
    </div>
  )
}

// 功能概覽示範
function OverviewDemo() {
  const { state } = useOfflineManager()

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">🌐 網路狀態監控</h3>
            <p className="text-blue-700 text-sm">
              自動偵測網路連線狀態變化，即時切換離線/線上模式
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">🔄 資料同步機制</h3>
            <p className="text-green-700 text-sm">
              離線時儲存操作，恢復連線後自動同步資料
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-2">⚡ 重試策略</h3>
            <p className="text-amber-700 text-sm">
              智慧重試機制，避免過度嘗試和資源浪費
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">📊 狀態可視化</h3>
            <p className="text-purple-700 text-sm">
              直觀的UI元件顯示離線狀態和同步進度
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">目前狀態</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusItem 
            label="網路狀態" 
            value={state.isOffline ? '離線' : '線上'}
            color={state.isOffline ? 'amber' : 'green'}
          />
          <StatusItem 
            label="待同步項目" 
            value={state.pendingSync.length.toString()}
            color="blue"
          />
          <StatusItem 
            label="重試次數" 
            value={state.retryCount.toString()}
            color="purple"
          />
          <StatusItem 
            label="離線時間" 
            value={state.offlineSince 
              ? `${Math.floor((Date.now() - state.offlineSince.getTime()) / 60000)}分鐘`
              : 'N/A'
            }
            color="gray"
          />
        </div>
      </GlassCard>
    </div>
  )
}

// 狀態指示器示範
function IndicatorDemo() {
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">狀態指示器</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">頂部指示器</h3>
            <p className="text-gray-600 text-sm mb-3">
              固定在頁面頂部的離線狀態提示
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <div className="bg-amber-500 text-white py-2 px-4 rounded flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-medium">目前為離線狀態</span>
                <span className="text-sm opacity-80">(重試中... 2)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">進度指示器</h3>
            <p className="text-gray-600 text-sm mb-3">
              顯示同步進度的小型元件
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-700">同步中...</span>
              <span className="text-gray-500">(3 項)</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// 離線資料示範
function OfflineDataDemo() {
  const [notes, setNotes] = useOfflineData('demo-notes', [
    { id: 1, content: '離線筆記 1', timestamp: Date.now() }
  ])

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      content: `離線筆記 ${notes.length + 1}`,
      timestamp: Date.now()
    }
    setNotes([...notes, newNote])
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">離線資料管理</h2>
        <p className="text-gray-600 mb-4">
          資料會自動儲存在 localStorage 中，即使重新整理頁面也會保留
        </p>
        
        <div className="flex gap-2 mb-4">
          <Button onClick={addNote} variant="primary">
            新增筆記
          </Button>
          <Button 
            onClick={() => setNotes([])} 
            variant="outline"
          >
            清除所有
          </Button>
        </div>

        <div className="space-y-2">
          {notes.map(note => (
            <div key={note.id} className="bg-gray-50 p-3 rounded border">
              <p className="text-gray-800">{note.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(note.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

// 同步管理示範
function SyncManagementDemo() {
  const { state, addPendingItem, triggerSync, clearPendingItems } = useOfflineManager()

  const simulateOfflineAction = () => {
    addPendingItem({
      type: 'create',
      table: 'user_notes',
      data: {
        content: `筆記內容 ${Date.now()}`,
        created_at: new Date().toISOString()
      }
    })
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">同步管理</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">模擬操作</h3>
            <div className="space-y-2">
              <Button 
                onClick={simulateOfflineAction}
                className="w-full"
                variant="primary"
              >
                新增待同步項目
              </Button>
              <Button 
                onClick={() => triggerSync()}
                disabled={state.isOffline || state.pendingSync.length === 0}
                className="w-full"
                variant="secondary"
              >
                觸發同步
              </Button>
              <Button 
                onClick={() => clearPendingItems()}
                disabled={state.pendingSync.length === 0}
                className="w-full"
                variant="outline"
              >
                清除待同步項目
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">狀態面板</h3>
            <OfflineStatusPanel />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// 狀態項目元件
function StatusItem({ 
  label, 
  value, 
  color 
}: { 
  label: string
  value: string
  color: string
}) {
  const colorClasses = {
    amber: 'text-amber-600 bg-amber-100',
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    gray: 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold mb-1 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}