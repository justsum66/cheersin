'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { useGameSound } from '@/hooks/useGameSound';

interface AudioSettingsProps {
  className?: string;
}

export function AudioSettings({ className = '' }: AudioSettingsProps) {
  const { enabled: soundEnabled, toggle: toggleSound, volume, setVolume, bgmEnabled, toggleBGM } = useGameSound();

  return (
    <section aria-labelledby="settings-audio-label" className={className}>
      <p id="settings-audio-label" className="text-white/70 text-sm mb-2">音效</p>
      <div className="flex items-center gap-3 flex-wrap">
        <m.button
          type="button"
          onClick={toggleSound}
          key={soundEnabled ? 'on' : 'off'}
          initial={false}
          animate={soundEnabled ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(139,0,0,0)', '0 0 0 8px rgba(139,0,0,0.2)', '0 0 0 0 rgba(139,0,0,0)'] } : {}}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium ${soundEnabled ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
        >
          {soundEnabled ? '開' : '關'}
        </m.button>
        {soundEnabled && (
          <div className="flex-1 min-w-[120px] flex items-center gap-2">
            <span className="text-white/50 text-xs w-8">音量</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="flex-1 h-2 rounded-full bg-white/10 accent-primary-500 min-w-0"
              aria-label="音量"
            />
          </div>
        )}
      </div>
      {/* 101 背景音樂開關 */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-white/50 text-xs">背景音樂</span>
        <button
          type="button"
          onClick={toggleBGM}
          className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium ${bgmEnabled ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
        >
          {bgmEnabled ? '開' : '關'}
        </button>
      </div>
    </section>
  );
}