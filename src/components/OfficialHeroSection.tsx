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
    <section className="w-full bg-gradient-to-b from-white via-slate-50 to-[#F0F6FF] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
      {/* Subtle Sovereign Pattern Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, #CBD5E1 1px, transparent 1px), linear-gradient(to bottom, #CBD5E1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient Lighting Accents */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Expansive Centered Hero Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative z-10 text-center space-y-6">
        {/* Simple Trust Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs text-xs font-bold text-slate-700 dark:text-slate-200 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#1E7B34]" />
          <span className="text-[11px] font-bold tracking-wide">
            National Citizen Welfare &amp; Direct Benefits Helper
          </span>
        </div>

        {/* Hero Main Headline */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
            Apni Yojana, <span className="text-[#D96B00] dark:text-amber-500">Apna Haq.</span>
          </h1>
          <p
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight"
            style={{ fontFamily: "'Playfair Display', 'Merriweather', Georgia, serif" }}
          >
            Find every government scheme and money{' '}
            <span className="text-[#1E7B34] dark:text-emerald-400">you qualify for.</span>
          </p>
        </div>

        {/* 5th-Grade Simple English Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A simple AI helper to find government schemes and money you qualify for. Tell us your work, age, or location in your own language to get your benefits directly.
        </p>

        {/* Core Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGetStarted}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-[#1E7B34] hover:bg-[#18682B] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Find Schemes For You</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenVoiceCopilot && (
            <button
              type="button"
              onClick={onOpenVoiceCopilot}
              className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Voice Help (Hindi/Marathi)</span>
            </button>
          )}

          {onOpenFamilyDashboard && (
            <button
              type="button"
              onClick={onOpenFamilyDashboard}
              className="flex items-center gap-2 px-5 py-3.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-[#1B2A6B] dark:text-blue-300 font-bold text-sm rounded-2xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#1E7B34] dark:text-emerald-400" />
              <span>Family 5-Year Plan</span>
            </button>
          )}

          {onOpenProactive && (
            <button
              type="button"
              onClick={onOpenProactive}
              className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-amber-50/60 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-2xs transition-all cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F28C28]"></span>
              </span>
              <span>⚡ Alert Radar</span>
            </button>
          )}
        </div>

        {/* Quick Filter Category Pills */}
        <div className="pt-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B2A6B] text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Clear Plain English Trust Badges */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#1E7B34] dark:text-emerald-400 shrink-0" />
            <span>Accurate &amp; Verified by Govt Rules</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#1E7B34] dark:text-emerald-400 shrink-0" />
            <span>Direct Bank Transfer Ready (DBT)</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#1E7B34] dark:text-emerald-400 shrink-0" />
            <span>Easy Regional Languages (Hindi • Marathi • English)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
