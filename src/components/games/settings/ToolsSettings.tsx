'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ToolsSettingsProps {
  className?: string;
  onClose?: () => void;
}

export function ToolsSettings({ className = '', onClose }: ToolsSettingsProps) {
  return (
    <section aria-labelledby="settings-tools-label" className={className}>
      <p id="settings-tools-label" className="text-white/70 text-sm mb-2">主持人工具</p>
      <Link
        href="/games/tools"
        onClick={onClose}
        className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-primary-400 group-hover:text-primary-300" />
          <span className="text-white font-medium">計分板與音效庫</span>
        </div>
        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80" />
      </Link>
    </section>
  );
}