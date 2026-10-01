import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Phone,
  ArrowRight,
  Landmark,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Users,
  Languages,
} from 'lucide-react';
import { OtpInput } from './OtpInput';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';
import { AuthUser } from '../types/auth';

interface SignInPageProps {
  onSuccess: (user: AuthUser) => void;
  onOpenDigiLocker: () => void;
  onNavigateSignUp: () => void;
  onContinueGuest: () => void;
  language: SupportedLanguage;
  onShowToast?: (msg: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSuccess,
  onOpenDigiLocker,
  onNavigateSignUp,
  onContinueGuest,
  language,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [mobileError, setMobileError] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);

  const handleGoogleSignIn = () => {
    setIsGoogleSigningIn(true);
    setTimeout(() => {
      setIsGoogleSigningIn(false);
      const googleUser: AuthUser = {
        name: 'Citizen Applicant',
        email: 'valentinine14feb@gmail.com',
        language,
        authMethod: 'google',
        documents: [],
        profile: {
          name: 'Citizen Applicant',
          state: 'Maharashtra',
          district: 'Nashik',
          occupation: 'Farmer',
          age: 38,
          land_acres: 1.5,
          annual_income_inr: 120000,
          housing_type: 'Kutcha',
          social_category: 'OBC',
          preferred_language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English',
        },
      };
      onSuccess(googleUser);
    }, 600);
  };

  const validateMobile = (num: string): boolean => {
    const cleaned = num.replace(/\D/g, '');
    const valid = /^[6-9]\d{9}$/.test(cleaned);
    return valid;
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError('');

    if (!validateMobile(mobileNumber)) {
      setMobileError(t.invalidMobile);
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsOtpSent(true);
      if (onShowToast) {
        onShowToast('Demo mode: OTP not sent to your phone');
      }
    }, 600);
  };

  const handleVerifyOtp = (otp: string): boolean => {
    if (otp === '123456') {
      const user: AuthUser = {
        name: 'Citizen ' + mobileNumber.slice(-4),
        mobile: mobileNumber,
        language,
        authMethod: 'otp',
        documents: [],
        profile: {
          name: 'Citizen ' + mobileNumber.slice(-4),
          preferred_language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English',
        },
      };
      onSuccess(user);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#F8FAFC] pt-3 sm:pt-6 pb-12">
      {/* Left Panel (Split screen, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1B2A6B] via-[#162255] to-[#1E7B34] p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#1E7B34]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Top */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-[#F28C28]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                SchemeSetu <span className="text-[#F28C28]">Bharat</span>
              </span>
              <p className="text-xs text-slate-300 font-medium tracking-wide">
                Apni Yojana, Apna Haq • अपनी योजना, अपना हक
              </p>
            </div>
          </div>
        </div>

        {/* Center Headline & 3 Trust Points */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>National Welfare Portal</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              {t.welcomeBack}
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* 3 Short Trust Points */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-[#1E7B34]/30 text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{t.trust1Title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{t.trust1Desc}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{t.trust2Title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{t.trust2Desc}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{t.trust3Title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{t.trust3Desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Faded Tricolour Ribbon at bottom */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span>#GOVERNMENTSCHEMES / #SCHEMESFORYOU</span>
          <div className="h-1.5 w-32 tricolour-gradient rounded-full opacity-80" />
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
        <div className="w-full max-w-[440px] bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 my-auto">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-black tracking-tight text-[#1B2A6B]">
              {t.signInTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Sign in with Google, verified DigiLocker, or mobile OTP.
            </p>
          </div>

          {/* 1. Primary button: Continue with Google / Gmail */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50/90 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 group"
            >
              {isGoogleSigningIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Connecting to Google Account...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google / Gmail</span>
                </>
              )}
            </button>

            {/* DigiLocker Button (Digital Identity) */}
            <button
              type="button"
              onClick={onOpenDigiLocker}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1E7B34]/10 hover:bg-[#1E7B34]/15 text-[#1E7B34] font-bold text-xs rounded-xl border border-[#1E7B34]/25 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E7B34]" />
                <span>Or Continue with DigiLocker</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                Govt. e-KYC
              </span>
            </button>
          </div>

          {/* Divider "or login with mobile OTP" */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              or with mobile OTP
            </span>
          </div>

          {/* c) Mobile number sign-in with OTP */}
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1B2A6B]">
                  {t.mobileNumber}
                </label>
                <div className="relative flex rounded-xl border border-slate-300 focus-within:border-[#F28C28] focus-within:ring-2 focus-within:ring-[#F28C28]/20 transition shadow-2xs">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileError('');
                      setMobileNumber(e.target.value.replace(/\D/g, ''));
                    }}
                    placeholder={t.mobilePlaceholder}
                    className="flex-1 px-3.5 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none rounded-r-xl"
                  />
                </div>
                {mobileError && (
                  <p className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                    {mobileError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || mobileNumber.length < 10}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-[#1B2A6B] hover:bg-[#142052] text-white font-bold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.sendingOtp}</span>
                  </>
                ) : (
                  <>
                    <span>{t.sendOtp}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600">
                  OTP sent to: <strong className="text-slate-900">+91 {mobileNumber}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-[#1E7B34] font-bold underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <OtpInput
                onVerify={handleVerifyOtp}
                onResend={() => setIsOtpSent(true)}
                language={language}
              />
            </div>
          )}

          {/* d) Footer links */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-center text-xs">
            <div>
              <span className="text-slate-500">{t.newHere} </span>
              <button
                type="button"
                onClick={onNavigateSignUp}
                className="font-bold text-[#F28C28] hover:text-[#d97706] hover:underline cursor-pointer"
              >
                {t.createAccount}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={onContinueGuest}
                className="text-slate-600 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
              >
                {t.continueGuest}
              </button>
            </div>
          </div>

          {/* e) Privacy note */}
          <div className="text-[11px] text-center text-slate-400 font-medium">
            🔒 {t.privacyNote}
          </div>

          {/* Honest Disclaimer */}
          <div className="text-[10px] text-center text-slate-400 bg-slate-50 p-2 rounded-xl border border-slate-100">
            {t.honestDisclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
