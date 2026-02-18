'use client';

import { useState, useEffect } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

interface HapticSettingsProps {
  className?: string;
}

export function HapticSettings({ className = '' }: HapticSettingsProps) {
  const { enabled: hapticEnabled, setEnabled: setHapticEnabled } = useHaptic();

  return (
    <section aria-labelledby="settings-haptic-label" className={className}>
      <p id="settings-haptic-label" className="text-white/70 text-sm mb-2">觸覺反饋（震動）</p>
      <button
        type="button"
        onClick={() => setHapticEnabled(!hapticEnabled)}
        className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium ${hapticEnabled ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
      >
        {hapticEnabled ? '開' : '關'}
      </button>
    </section>
  );
}