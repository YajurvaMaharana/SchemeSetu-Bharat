import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Sparkles,
  Landmark,
  Users,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { AuthState } from '../types/auth';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';
import { isSimulatedMode } from '../digilocker';

interface HeaderProps {
  onReset?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSignInClick: () => void;
  authState: AuthState;
  onSignOut: () => void;
  onOpenProfile: () => void;
  onOpenDocuments: () => void;
  isAuthRoute?: boolean;
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
  authState,
  onSignOut,
  onOpenProfile,
  onOpenDocuments,
  isAuthRoute = false,
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const user = authState.status === 'signedIn' && authState.user ? authState.user : null;
  const isSignedIn = Boolean(user);
  const userInitials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <header className={`${isAuthRoute ? 'relative' : 'sticky top-0'} z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs`}>
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
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-[#1B2A6B] text-white flex items-center justify-center font-bold text-xs shadow-xs"
                >
                  {userInitials}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignInClick}
                  className="px-3 py-1.5 bg-[#F28C28] text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  {t.signIn}
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: Search + Sign In / User Profile + Language + Theme */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search Input with Orange Border */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-700 bg-white border-2 border-[#F28C28] rounded-full placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F28C28]/25 shadow-xs transition"
              />
              <Search className="w-4 h-4 text-[#F28C28] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* User Profile Dropdown OR Sign in Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1B2A6B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {userInitials}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#1B2A6B] max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-[#1B2A6B] truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {user.mobile ? `+91 ${user.mobile}` : 'DigiLocker Citizen'}
                      </div>
                      <span className={`mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        user.authMethod === 'digilocker'
                          ? isSimulatedMode()
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-emerald-50 text-[#1E7B34] border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {user.authMethod === 'digilocker'
                          ? isSimulatedMode()
                            ? 'Simulated'
                            : 'Connected to DigiLocker'
                          : 'OTP Verified'}
                      </span>
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
                        <User className="w-4 h-4 text-slate-500" />
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
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span>{t.myDocuments}</span>
                        </div>
                        {user.documents && user.documents.length > 0 && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
                            {user.documents.length}
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
                className="flex items-center gap-1.5 px-4 py-2 bg-[#F28C28] hover:bg-[#d97706] text-white font-bold text-xs rounded-xl shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </button>
            )}

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
