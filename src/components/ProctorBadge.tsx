import React from 'react';
import { Shield } from 'lucide-react';

interface ProctorBadgeProps {
  visible: boolean;
}

export const ProctorBadge: React.FC<ProctorBadgeProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-5 right-5 bg-slate-900/90 text-white px-3.5 py-2 rounded-full flex items-center gap-2.5 text-xs font-bold z-[1001] shadow-[0_4px_15px_rgba(0,0,0,0.3)] tracking-wide backdrop-blur-sm border border-slate-700/50"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-rec-blink shadow-[0_0_8px_#ef4444]" />
      <span className="flex items-center gap-1.5 font-mono">
        <Shield className="w-3.5 h-3.5 text-red-400 inline" /> REC: Layar Diawasi
      </span>
    </div>
  );
};
