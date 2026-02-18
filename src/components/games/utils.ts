import { ReactNode, createElement } from 'react';

/** UI-33: 搜尋關鍵字高亮 */
export function highlightMatch(text: string, query: string): ReactNode {
  if (!query || query.length < 2) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? createElement('mark', { 
          key: i, 
          className: "bg-primary-500/30 text-primary-200 rounded-sm px-0.5" 
        }, part)
      : part
  );
}