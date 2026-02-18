/**
 * Empty State Component
 * Standardized empty state for lists, search results, and user content areas
 */
import { ComponentProps, isValidElement } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ComponentType<any> | React.ReactElement;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
  action?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: IconOrElement,
  title,
  description,
  actionText,
  onAction,
  showAction = false,
  action,
  className = '',
  iconClassName = ''
}: EmptyStateProps) {
  return (
    <GlassCard className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {IconOrElement && (
        <div className={`mb-4 ${iconClassName}`}>
          {isValidElement(IconOrElement) ? (
            IconOrElement
          ) : (
            <IconOrElement className="w-12 h-12 text-white/40 mx-auto" aria-hidden="true" />
          )}
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-white/60 mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
      {!action && showAction && actionText && onAction && (
        <Button onClick={onAction} variant="secondary" className="mt-4">
          {actionText}
        </Button>
      )}
    </GlassCard>
  );
}

// Export a default set of common empty states
export const CommonEmptyStates = {
  search: {
    title: "沒有找到相符的結果",
    description: "試著調整您的搜尋條件，或瀏覽其他內容。",
    icon: undefined
  },
  list: {
    title: "目前沒有項目",
    description: "您可以新增新的項目開始使用。",
    icon: undefined
  },
  favorites: {
    title: "還沒有收藏",
    description: "點擊愛心圖示收藏您喜愛的內容。",
    icon: undefined
  },
  games: {
    title: "暫無遊戲",
    description: "探索我們豐富的遊戲庫，找到適合您派對的遊戲。",
    icon: undefined
  }
};