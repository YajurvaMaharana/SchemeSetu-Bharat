import React from 'react';
import { Settings2, Clock, Database, Sparkles } from 'lucide-react';

interface DemoControlsProps {
  demoPacing: boolean;
  onToggleDemoPacing: (val: boolean) => void;
  useCachedDemo: boolean;
  onToggleUseCachedDemo: (val: boolean) => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  demoPacing,
  onToggleDemoPacing,
  useCachedDemo,
  onToggleUseCachedDemo,
}) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-slate-300 font-semibold">
        <Settings2 className="w-4 h-4 text-amber-400" />
        <span>Hackathon Demo Controls:</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition">
          <input
            type="checkbox"
            checked={demoPacing}
            onChange={(e) => onToggleDemoPacing(e.target.checked)}
            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
          />
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Demo Pacing (0.35s delay per step)</span>
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition">
          <input
            type="checkbox"
            checked={useCachedDemo}
            onChange={(e) => onToggleUseCachedDemo(e.target.checked)}
            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
          />
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic Demo Cache</span>
          </span>
        </label>
      </div>
    </div>
  );
};
