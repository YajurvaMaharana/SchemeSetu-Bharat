import React from 'react';
import { Search, ShieldCheck, Sparkles, Landmark, Users, Sun, Moon, LogIn } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLanguage: 'hi' | 'mr' | 'en';
  onLanguageChange: (lang: 'hi' | 'mr' | 'en') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSignInClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  isDarkMode,
  onToggleDarkMode,
  onSignInClick,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Tricolour Accent Bar */}
      <div className="h-1.5 w-full tricolour-gradient" />

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={onReset}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B2A6B] to-[#1E7B34] flex items-center justify-center shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-[#1B2A6B]">
                    SchemeSetu
                  </span>
                  <span className="text-xl font-extrabold tracking-tight text-[#F28C28]">
                    Bharat
                  </span>
                  <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#1E7B34]/10 text-[#1E7B34] border border-[#1E7B34]/20 uppercase tracking-wider">
                    Autonomous
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                  Apni Yojana, Apna Haq • अपनी योजना, अपना हक
                </p>
              </div>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label="Toggle theme"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>

          {/* Right Controls: Search + Sign In + Language + Theme */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search Input with Orange Border */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search a scheme by name..."
                className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-700 bg-white border-2 border-[#F28C28] rounded-full placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F28C28]/25 shadow-xs transition"
              />
              <Search className="w-4 h-4 text-[#F28C28] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sign in Button */}
            <button
              type="button"
              onClick={onSignInClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F28C28] hover:bg-[#d97706] text-white font-bold text-xs rounded-xl shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{selectedLanguage === 'hi' ? 'साइन इन करें' : selectedLanguage === 'mr' ? 'साइन इन' : 'Sign in'}</span>
            </button>

            {/* Language Toggle Pill */}
            <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs">
              {(['hi', 'mr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-white text-[#1B2A6B] shadow-xs font-bold border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'English'}
                </button>
              ))}
            </div>

            {/* Light / Dark Mode Icon */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle visual mode"
              className="hidden md:flex p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              title="Toggle view"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Feature Badges Strip (Light clean pills) */}
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 mt-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E7B34]" />
            <span>100% Deterministic Engine</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 font-medium">
            <Users className="w-3.5 h-3.5 text-[#1B2A6B]" />
            <span>10 Flagship Schemes</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Vernacular AI (Hindi • Marathi • English)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
