'use client';

import { useState, useEffect } from 'react';
import { getFontSize, setFontSize, type FontSize } from '@/modules/games/settings';

interface FontSizeSettingsProps {
  className?: string;
}

export function FontSizeSettings({ className = '' }: FontSizeSettingsProps) {
  const [fontSize, setFontSizeState] = useState<FontSize>('md');

  useEffect(() => {
    setFontSizeState(getFontSize());
  }, []);

  const handleFontSize = (v: FontSize) => {
    setFontSizeState(v);
    setFontSize(v);
  };

  return (
    <section aria-labelledby="settings-font-label" className={className}>
      <p id="settings-font-label" className="text-white/70 text-sm mb-2">字級</p>
      <div className="flex gap-2">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleFontSize(s)}
            className={`min-h-[48px] min-w-[48px] flex-1 px-3 rounded-lg text-sm font-medium transition-colors ${fontSize === s ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
          </button>
        ))}
      </div>
    </section>
  );
}