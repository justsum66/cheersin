'use client';

import { useState, useEffect } from 'react';
import { getNonAlcoholMode, setNonAlcoholMode } from '@/modules/games/settings';

interface NonAlcoholSettingsProps {
  className?: string;
}

export function NonAlcoholSettings({ className = '' }: NonAlcoholSettingsProps) {
  const [nonAlcoholMode, setNonAlcoholModeState] = useState(false);

  useEffect(() => {
    setNonAlcoholModeState(getNonAlcoholMode());
  }, []);

  const handleNonAlcoholMode = (v: boolean) => {
    setNonAlcoholModeState(v);
    setNonAlcoholMode(v);
  };

  return (
    <section aria-labelledby="settings-non-alcohol-label" className={className}>
      <p id="settings-non-alcohol-label" className="text-white/70 text-sm mb-2">非酒精模式（懲罰改為「做一下」）</p>
      <button
        type="button"
        onClick={() => handleNonAlcoholMode(!nonAlcoholMode)}
        className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium ${nonAlcoholMode ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
      >
        {nonAlcoholMode ? '開' : '關'}
      </button>
    </section>
  );
}