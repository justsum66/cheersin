'use client';

import { useState, useEffect } from 'react';
import { getReduceMotion, setReduceMotion } from '@/modules/games/settings';

interface MotionSettingsProps {
  className?: string;
}

export function MotionSettings({ className = '' }: MotionSettingsProps) {
  const [reduceMotion, setReduceMotionState] = useState(false);

  useEffect(() => {
    setReduceMotionState(getReduceMotion());
  }, []);

  const handleReduceMotion = (v: boolean) => {
    setReduceMotionState(v);
    setReduceMotion(v);
  };

  return (
    <section aria-labelledby="settings-motion-label" className={className}>
      <p id="settings-motion-label" className="text-white/70 text-sm mb-2">簡化動畫（直播友善）</p>
      <button
        type="button"
        onClick={() => handleReduceMotion(!reduceMotion)}
        className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium ${reduceMotion ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
      >
        {reduceMotion ? '開' : '關'}
      </button>
    </section>
  );
}