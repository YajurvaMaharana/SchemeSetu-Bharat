import React from 'react';
import { Settings2, Clock, Database, Scan } from 'lucide-react';

interface DemoControlsProps {
  demoPacing: boolean;
  onToggleDemoPacing: (val: boolean) => void;
  useCachedDemo: boolean;
  onToggleUseCachedDemo: (val: boolean) => void;
  onLaunchPortalFiling?: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  demoPacing,
  onToggleDemoPacing,
  useCachedDemo,
  onToggleUseCachedDemo,
  onLaunchPortalFiling,
}) => {
  return (
    <div className="bg-slate-100/90 border border-slate-200/90 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
      <div className="flex items-center gap-2 text-slate-700 font-bold">
        <Settings2 className="w-4 h-4 text-[#F28C28]" />
        <span>Hackathon Demo Controls:</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 transition">
          <input
            type="checkbox"
            checked={demoPacing}
            onChange={(e) => onToggleDemoPacing(e.target.checked)}
            className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
          />
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Demo Pacing (0.35s delay per step)</span>
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 transition">
          <input
            type="checkbox"
            checked={useCachedDemo}
            onChange={(e) => onToggleUseCachedDemo(e.target.checked)}
            className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
          />
          <span className="flex items-center gap-1.5 font-medium">
            <Database className="w-3.5 h-3.5 text-[#1E7B34]" />
            <span>Deterministic Demo Cache</span>
          </span>
        </label>

        {onLaunchPortalFiling && (
          <button
            type="button"
            onClick={onLaunchPortalFiling}
            className="px-3 py-1.5 bg-[#1B2A6B] hover:bg-[#142052] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Scan className="w-3.5 h-3.5 text-amber-300" />
            <span>OCR &amp; 25+ Field Portal RPA</span>
          </button>
        )}
      </div>
    </div>
  );
};

