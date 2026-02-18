/**
 * Error State Component
 * Standardized error state for failed operations and data loading
 */
import { RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  showRetry = false,
  className = ''
}: ErrorStateProps) {
  return (
    <GlassCard className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6 text-red-400" aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-red-300 mb-2">{title}</h3>
      <p className="text-white/60 mb-6 max-w-md">{description}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          重試
        </Button>
      )}
    </GlassCard>
  );
}

// Export a default set of common error states
export const CommonErrorStates = {
  network: {
    title: "網路連線錯誤",
    description: "請檢查您的網路連線後重試。",
    showRetry: true
  },
  data: {
    title: "載入失敗",
    description: "資料載入發生問題，請稍後重試。",
    showRetry: true
  },
  unauthorized: {
    title: "存取被拒",
    description: "您可能需要登入才能查看此內容。",
    showRetry: false
  },
  notFound: {
    title: "找不到頁面",
    description: "您尋找的頁面似乎不存在。",
    showRetry: false
  }
};