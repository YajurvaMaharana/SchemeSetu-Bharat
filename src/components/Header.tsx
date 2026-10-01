import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  LogIn,
  LogOut,
  User,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { OfficialEmblemLogo } from './OfficialEmblemLogo';
import { AuthState } from '../types/auth';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  onReset?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onSignInClick: () => void;
  authState: AuthState;
  onSignOut: () => void;
  onOpenProfile: () => void;
  onOpenDocuments: () => void;
  onOpenProactive?: () => void;
  onOpenFamilyDashboard?: () => void;
  onOpenVoiceCopilot?: () => void;
  isAuthRoute?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  onSignInClick,
  authState,
  onSignOut,
  onOpenProfile,
  onOpenDocuments,
  isAuthRoute,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isSignedIn = authState.status === 'signedIn' && authState.user;
  const userInitials = isSignedIn
    ? authState.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <header className={`${isAuthRoute ? 'relative' : 'sticky top-3'} z-40 max-w-7xl mx-auto px-3 sm:px-6 w-full transition-all duration-200`}>
      {/* Compact Floating Rounded Pill Navbar: Pure White with Subtle Gray Border & Soft Shadow */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-full px-3.5 sm:px-5 py-2 shadow-md shadow-slate-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3 transition-colors">
        
        {/* Left: Clean Logo & Brand on a Single Line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={onReset}>
            <div className="shrink-0 group-hover:scale-105 transition-transform duration-300">
              <OfficialEmblemLogo size={38} className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-2xs" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-lg sm:text-xl font-black tracking-tight text-[#002d61] leading-none"
                style={{ fontFamily: "'Playfair Display', 'Merriweather', 'Cinzel', Georgia, serif" }}
              >
                YojanaSathi
              </span>
              <span
                className="text-lg sm:text-xl font-black tracking-tight text-[#D96B00] leading-none"
                style={{ fontFamily: "'Playfair Display', 'Merriweather', 'Cinzel', Georgia, serif" }}
              >
                AI
              </span>
              <span className="ml-1 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-amber-50 text-[#B45309] border border-amber-300/80">
                ApnaAdhikar
              </span>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-7 h-7 rounded-full bg-[#002d61] text-white flex items-center justify-center font-bold text-[11px] shadow-2xs"
              >
                {userInitials}
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignInClick}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-full shadow-2xs"
              >
                {t.signIn}
              </button>
            )}
          </div>
        </div>

        {/* Right: Streamlined Essential Controls (Search, Language, Avatar) */}
        <div className="flex items-center gap-2 sm:gap-2.5 justify-between md:justify-end">
          {/* Compact Search Bar with White Background, Gray Border & Navy Blue Icon */}
          <div className="relative flex-1 md:w-60 lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search government schemes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-[#002d61] rounded-full placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002d61] transition"
            />
            <Search className="w-3.5 h-3.5 text-[#002d61] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Language Toggle with Light Gray Background */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-semibold">
            {(['hi', 'mr', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-white text-[#002d61] shadow-2xs font-extrabold border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'En'}
              </button>
            ))}
          </div>

          {/* Sign In Button / User Avatar Desktop */}
          {isSignedIn ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#002d61] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                  {userInitials}
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {authState.user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-[#002d61]" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-xs">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="font-bold text-[#002d61] truncate">{authState.user.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {authState.user.mobile ? `+91 ${authState.user.mobile}` : 'DigiLocker Citizen'}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#002d61]" />
                      <span>{t.myProfile}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenDocuments();
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#002d61]" />
                        <span>{t.myDocuments}</span>
                      </div>
                      {authState.user.documents && authState.user.documents.length > 0 && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
                          {authState.user.documents.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignInClick}
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-full shadow-2xs transition transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3 h-3 text-white" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
