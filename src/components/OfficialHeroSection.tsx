import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Search,
  Mic,
  Users,
  Coins,
  HeartPulse,
  Home,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

interface OfficialHeroSectionProps {
  onGetStarted: () => void;
  onOpenProactive?: () => void;
  onOpenVoiceCopilot?: () => void;
  onOpenFamilyDashboard?: () => void;
  onCategoryClick?: (category: string) => void;
}

const QUICK_CATEGORIES = [
  { label: 'All Schemes', icon: '✨', key: 'all' },
  { label: 'Farmers', icon: '🌾', key: 'farmer' },
  { label: 'Women & SHG', icon: '👩‍🌾', key: 'women' },
  { label: 'Students', icon: '🎓', key: 'student' },
  { label: 'Health & Medical', icon: '🏥', key: 'health' },
  { label: 'Housing Grants', icon: '🏠', key: 'housing' },
  { label: 'Small Business', icon: '💼', key: 'business' },
];

export const OfficialHeroSection: React.FC<OfficialHeroSectionProps> = ({
  onGetStarted,
  onOpenProactive,
  onOpenVoiceCopilot,
  onOpenFamilyDashboard,
  onCategoryClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCategorySelect = (catKey: string) => {
    setSelectedCategory(catKey);
    if (onCategoryClick) {
      onCategoryClick(catKey);
    }
    onGetStarted();
  };

  return (
    <section className="w-full bg-white border-b border-slate-200 relative overflow-hidden transition-colors">
      {/* Subtle Pattern Grid Overlay on Pure White */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(#002d61 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px, 64px 64px, 64px 64px',
        }}
      />

      {/* Main Expansive Centered Hero Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative z-10 text-center space-y-6">
        {/* Simple Trust Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-800 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="text-[11px] font-bold tracking-wide text-slate-800">
            Government of India • National Citizen Welfare Portal
          </span>
        </div>

        {/* Hero Main Headline */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#002d61] leading-[1.12]">
            Apni Yojana, <span className="text-[#D96B00]">Apna Haq.</span>
          </h1>
          <p
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002d61] leading-tight"
            style={{ fontFamily: "'Playfair Display', 'Merriweather', Georgia, serif" }}
          >
            Find every government scheme and money{' '}
            <span className="text-emerald-700 font-black">you qualify for.</span>
          </p>
        </div>

        {/* Dark Charcoal Paragraph for Maximum Readability */}
        <p className="text-base sm:text-lg text-slate-800 max-w-2xl mx-auto leading-relaxed font-medium">
          A simple AI helper to find government schemes and money you qualify for. Tell us your work, age, or location in your own language to get your benefits directly.
        </p>

        {/* Core Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGetStarted}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <span>Find Schemes For You</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenVoiceCopilot && (
            <button
              type="button"
              onClick={onOpenVoiceCopilot}
              className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#002d61]" />
              <span>Voice Help (Hindi/Marathi)</span>
            </button>
          )}

          {onOpenFamilyDashboard && (
            <button
              type="button"
              onClick={onOpenFamilyDashboard}
              className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-blue-50/60 text-[#002d61] font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Family 5-Year Plan</span>
            </button>
          )}

          {onOpenProactive && (
            <button
              type="button"
              onClick={onOpenProactive}
              className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-amber-50/50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F28C28]"></span>
              </span>
              <span className="text-[#002d61]">⚡</span>
              <span>Alert Radar</span>
            </button>
          )}
        </div>

        {/* Category Pills: Pure White Background, Gray Border, Dark Text */}
        <div className="pt-4 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Popular Categories:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategorySelect(cat.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#002d61] text-white border border-[#002d61] shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs hover:bg-blue-50/70 hover:border-blue-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Trust Indicators in Reassuring Green */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-bold text-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Accurate &amp; Verified by Govt Rules</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Direct Bank Transfer Ready (DBT)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Easy Regional Languages (Hindi • Marathi • English)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
