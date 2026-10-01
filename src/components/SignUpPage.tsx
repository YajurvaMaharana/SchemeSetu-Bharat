import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Landmark,
  Layers,
  Languages,
  Check,
} from 'lucide-react';
import { OtpInput } from './OtpInput';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';
import { AuthUser } from '../types/auth';
import { UserProfile, SocialCategory, HousingType } from '../types/agent';

interface SignUpPageProps {
  onSuccess: (user: AuthUser) => void;
  onOpenDigiLocker: () => void;
  onNavigateSignIn: () => void;
  onContinueGuest: () => void;
  language: SupportedLanguage;
  onShowToast?: (msg: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onSuccess,
  onOpenDigiLocker,
  onNavigateSignIn,
  onContinueGuest,
  language,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Wizard Steps: 1: Details, 2: Verify, 3: Profile, 4: Done
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State
  const [fullName, setFullName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [step1Error, setStep1Error] = useState<string>('');

  // Step 3 State (Manual Profile)
  const [profileOption, setProfileOption] = useState<'digi' | 'manual'>('manual');
  const [age, setAge] = useState<string>('38');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [state, setState] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('Nashik');
  const [pincode, setPincode] = useState<string>('422001');
  const [occupation, setOccupation] = useState<string>('Farmer');
  const [landAcres, setLandAcres] = useState<string>('1.5');
  const [income, setIncome] = useState<string>('150000');
  const [casteCategory, setCasteCategory] = useState<SocialCategory>('General');
  const [isBpl, setIsBpl] = useState<boolean>(false);
  const [step3Error, setStep3Error] = useState<string>('');

  // Built AuthUser payload
  const [finalUser, setFinalUser] = useState<AuthUser | null>(null);

  const validateMobile = (num: string): boolean => {
    const cleaned = num.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error('');

    if (!fullName.trim()) {
      setStep1Error('Please enter your full name.');
      return;
    }

    if (!validateMobile(mobileNumber)) {
      setStep1Error(t.invalidMobile);
      return;
    }

    if (!agreedTerms) {
      setStep1Error('Please agree to the Terms of Service to continue.');
      return;
    }

    setCurrentStep(2);
    if (onShowToast) {
      onShowToast('Demo mode: OTP not sent to your phone');
    }
  };

  const handleVerifyOtp = (otp: string): boolean => {
    if (otp === '123456') {
      setCurrentStep(3);
      return true;
    }
    return false;
  };

  const handleStep3Submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStep3Error('');

    if (profileOption === 'digi') {
      onOpenDigiLocker();
      return;
    }

    if (!state.trim() || !district.trim()) {
      setStep3Error('State and District are required.');
      return;
    }

    const acresNum = occupation === 'Farmer' ? parseFloat(landAcres) || 0 : 0;
    const haNum = Number((acresNum * 0.4047).toFixed(4));
    const incomeNum = parseInt(income, 10) || 0;

    const profileData: Partial<UserProfile> = {
      name: fullName.trim(),
      age: parseInt(age, 10) || null,
      gender,
      state: state.trim(),
      district: district.trim(),
      pincode: pincode.trim(),
      occupation,
      land_acres: acresNum,
      land_hectares: haNum,
      has_land_ownership: acresNum > 0,
      annual_income_inr: incomeNum,
      social_category: casteCategory,
      housing_type: isBpl ? 'Kutcha' : 'Pucca',
      is_taxpayer: false,
      is_govt_employee: false,
      has_pension_above_10k: false,
      is_shg_member: false,
      is_student: occupation === 'Student',
      preferred_language: selectedLang === 'hi' ? 'Hindi' : selectedLang === 'mr' ? 'Marathi' : 'English',
    };

    const user: AuthUser = {
      name: fullName.trim(),
      mobile: mobileNumber,
      language: selectedLang,
      authMethod: 'otp',
      documents: [],
      profile: profileData,
    };

    setFinalUser(user);
    setCurrentStep(4);
  };

  const handleSkipProfile = () => {
    const user: AuthUser = {
      name: fullName.trim() || 'Citizen',
      mobile: mobileNumber,
      language: selectedLang,
      authMethod: 'otp',
      documents: [],
      profile: {
        name: fullName.trim() || 'Citizen',
        preferred_language: selectedLang === 'hi' ? 'Hindi' : selectedLang === 'mr' ? 'Marathi' : 'English',
      },
    };
    setFinalUser(user);
    setCurrentStep(4);
  };

  const handleFinish = () => {
    if (finalUser) {
      onSuccess(finalUser);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#F8FAFC] pt-3 sm:pt-6 pb-12">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1B2A6B] via-[#162255] to-[#1E7B34] p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

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

        {/* Center */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>4-Step Express Registration</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              {t.signUpTitle}
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {t.signUpSubtitle}
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-200 leading-relaxed">
                Unlock instant eligibility across 10 flagship central and state welfare programs.
              </span>
            </div>
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-200 leading-relaxed">
                Seamless prefill for simulated DBT applications and offline CSC Action Packs.
              </span>
            </div>
            <div className="flex items-start gap-3 bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-200 leading-relaxed">
                Connect DigiLocker or configure details manually in under 2 minutes.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span>#GOVERNMENTSCHEMES / #SCHEMESFORYOU</span>
          <div className="h-1.5 w-32 tricolour-gradient rounded-full opacity-80" />
        </div>
      </div>

      {/* Right Panel (Wizard Card) */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
        <div className="w-full max-w-[500px] bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 my-auto">
          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              {[
                { step: 1, label: t.step1 },
                { step: 2, label: t.step2 },
                { step: 3, label: t.step3 },
                { step: 4, label: t.step4 },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-1.5 ${
                    currentStep === s.step
                      ? 'text-[#1B2A6B]'
                      : currentStep > s.step
                      ? 'text-[#1E7B34]'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      currentStep === s.step
                        ? 'bg-[#1B2A6B] text-white ring-2 ring-[#1B2A6B]/20'
                        : currentStep > s.step
                        ? 'bg-[#1E7B34] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {currentStep > s.step ? '✓' : s.step}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E7B34] transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100 + 25}%` }}
              />
            </div>
          </div>

          {/* STEP 1: YOUR DETAILS */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#1B2A6B] tracking-tight">
                  {t.step1}: {t.fullName} &amp; Mobile
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your details to initiate registration.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1B2A6B]">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none transition"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1B2A6B]">
                  {t.mobileNumber} *
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
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.mobilePlaceholder}
                    className="flex-1 px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none rounded-r-xl"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1B2A6B]">
                  {t.preferredLang}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['hi', 'mr', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        selectedLang === lang
                          ? 'bg-[#F28C28]/10 border-2 border-[#F28C28] text-[#1B2A6B]'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34] cursor-pointer"
                />
                <span>{t.agreeTerms}</span>
              </label>

              {step1Error && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{step1Error}</span>
                </div>
              )}

              {/* Next Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm transition shadow-sm cursor-pointer"
              >
                <span>{t.nextStep}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary button: DigiLocker */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenDigiLocker}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1B2A6B] border border-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#1E7B34]" />
                  <span>{t.signUpDigiLockerInstead}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY MOBILE OTP */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#1B2A6B] tracking-tight">
                  {t.step2}: {t.enterOtp}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit confirmation code sent to +91 {mobileNumber}
                </p>
              </div>

              <OtpInput
                onVerify={handleVerifyOtp}
                language={selectedLang}
              />

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.back}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETE PROFILE */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#1B2A6B] tracking-tight">
                  {t.completeProfileTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.completeProfileSubtitle}
                </p>
              </div>

              {/* 2 Selectable Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOption('digi');
                    onOpenDigiLocker();
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    profileOption === 'digi'
                      ? 'bg-blue-50/60 border-2 border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1B2A6B]">{t.digiOptionTitle}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1">{t.digiOptionDesc}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileOption('manual')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    profileOption === 'manual'
                      ? 'bg-emerald-50/60 border-2 border-[#1E7B34] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#1E7B34] text-white flex items-center justify-center mb-2">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1B2A6B]">{t.manualOptionTitle}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1">{t.manualOptionDesc}</p>
                </button>
              </div>

              {/* Manual Form Fields */}
              {profileOption === 'manual' && (
                <form onSubmit={handleStep3Submit} className="space-y-3.5 text-xs pt-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.age}</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="38"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.gender}</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      >
                        <option value="Male">{t.male}</option>
                        <option value="Female">{t.female}</option>
                        <option value="Other">{t.other}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.state} *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.district} *</label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Nashik"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.pincode}</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="422001"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.occupation}</label>
                      <select
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      >
                        <option value="Farmer">{t.farmer}</option>
                        <option value="Agricultural Worker">{t.agriWorker}</option>
                        <option value="Student">{t.student}</option>
                        <option value="Labourer">{t.labourer}</option>
                        <option value="Homemaker">{t.homemaker}</option>
                        <option value="Other">{t.otherOcc}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.annualIncome}</label>
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        placeholder="150000"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>

                  {occupation === 'Farmer' && (
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        {t.landAcres}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={landAcres}
                        onChange={(e) => setLandAcres(e.target.value)}
                        placeholder="1.5"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.casteCategory}</label>
                      <select
                        value={casteCategory}
                        onChange={(e) => setCasteCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      >
                        <option value="General">{t.general}</option>
                        <option value="OBC">{t.obc}</option>
                        <option value="SC">{t.sc}</option>
                        <option value="ST">{t.st}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">{t.bplQuestion}</label>
                      <select
                        value={isBpl ? 'yes' : 'no'}
                        onChange={(e) => setIsBpl(e.target.value === 'yes')}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                      >
                        <option value="no">{t.no}</option>
                        <option value="yes">{t.yes}</option>
                      </select>
                    </div>
                  </div>

                  {step3Error && (
                    <div className="text-xs text-rose-600 font-medium">{step3Error}</div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleSkipProfile}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                    >
                      {t.skipForNow}
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs transition shadow-sm cursor-pointer"
                    >
                      <span>{t.saveAndContinue}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 4: ALL SET */}
          {currentStep === 4 && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#1E7B34] flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#1B2A6B] tracking-tight">
                  {t.allSetTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.allSetSubtitle}
                </p>
              </div>

              {/* Profile Snapshot Card */}
              {finalUser && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
                  <div className="font-bold text-[#1B2A6B] border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>{t.profileSummary}</span>
                    <span className="text-[10px] text-[#1E7B34] font-bold">VERIFIED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      Name: <span className="font-bold text-slate-900">{finalUser.name}</span>
                    </div>
                    <div>
                      Mobile: <span className="font-bold text-slate-900">+91 {finalUser.mobile}</span>
                    </div>
                    <div>
                      Location:{' '}
                      <span className="font-medium text-slate-800">
                        {finalUser.profile.district || 'District'}, {finalUser.profile.state || 'State'}
                      </span>
                    </div>
                    <div>
                      Occupation:{' '}
                      <span className="font-medium text-slate-800">
                        {finalUser.profile.occupation || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm transition shadow-sm cursor-pointer"
              >
                <span>{t.goToDashboard}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-slate-100 text-center text-xs space-y-1">
            <span className="text-slate-500">Already have an account? </span>
            <button
              type="button"
              onClick={onNavigateSignIn}
              className="font-bold text-[#1B2A6B] hover:text-[#F28C28] hover:underline cursor-pointer"
            >
              Sign In here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
