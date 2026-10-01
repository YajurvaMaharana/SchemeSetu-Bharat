import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
  Briefcase,
  IndianRupee,
  Layers,
  Home,
  Check,
  Building2,
  Lock,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { UserProfile, SocialCategory, HousingType } from '../types/agent';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';

interface CitizenProfileSetupPageProps {
  user: AuthUser;
  onConfirmProfile: (profile: UserProfile) => void;
  onSkip?: () => void;
  language: SupportedLanguage;
}

interface DemoPreset {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  expectedSchemes: string;
  potentialBenefit: string;
  data: Partial<UserProfile>;
}

export const CitizenProfileSetupPage: React.FC<CitizenProfileSetupPageProps> = ({
  user,
  onConfirmProfile,
  onSkip,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // 1-Click Quick-Fill Demo Presets
  const DEMO_PRESETS: DemoPreset[] = [
    {
      id: 'ramesh',
      badge: '👨🌾 Small Cultivator',
      title: 'Ramesh - Small Farmer, Nashik',
      tagline: '38 yrs • 1.5 Acres land • ₹1,20,000/yr • OBC',
      expectedSchemes: 'PM-KISAN, KCC, PM-KMY, PMJJBY, PMSBY',
      potentialBenefit: '₹7,92,000',
      data: {
        name: 'Ramesh Patil',
        age: 38,
        gender: 'Male',
        state: 'Maharashtra',
        district: 'Nashik',
        pincode: '422001',
        occupation: 'Farmer',
        land_acres: 1.5,
        land_hectares: 0.607,
        has_land_ownership: true,
        annual_income_inr: 120000,
        social_category: 'OBC',
        housing_type: 'Kutcha',
        is_taxpayer: false,
        is_govt_employee: false,
        has_pension_above_10k: false,
        is_student: false,
        is_shg_member: false,
        special_conditions: [],
        preferred_language: 'Hindi',
      },
    },
    {
      id: 'priya',
      badge: '🎓 Higher Education',
      title: 'Priya - Student, Pune',
      tagline: '20 yrs • Post-Matric • ₹1,50,000/yr • SC',
      expectedSchemes: 'NSP Post-Matric Scholarship, PMJJBY, PMSBY',
      potentialBenefit: '₹4,48,000',
      data: {
        name: 'Priya Sharma',
        age: 20,
        gender: 'Female',
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001',
        occupation: 'Student',
        land_acres: 0,
        land_hectares: 0,
        has_land_ownership: false,
        annual_income_inr: 150000,
        social_category: 'SC',
        housing_type: 'Pucca',
        is_taxpayer: false,
        is_govt_employee: false,
        has_pension_above_10k: false,
        is_student: true,
        is_shg_member: false,
        special_conditions: [],
        preferred_language: 'Marathi',
      },
    },
    {
      id: 'sunita',
      badge: '👩👧 Rural Livelihood',
      title: 'Sunita - BPL Family',
      tagline: '34 yrs • SHG Member • ₹48,000/yr • BPL / Kutcha',
      expectedSchemes: 'Lakhpati Didi, PMAY-G, Ayushman Bharat, Mudra',
      potentialBenefit: '₹9,70,000',
      data: {
        name: 'Sunita Devi',
        age: 34,
        gender: 'Female',
        state: 'Bihar',
        district: 'Patna',
        pincode: '800001',
        occupation: 'SHG Member',
        land_acres: 0.5,
        land_hectares: 0.202,
        has_land_ownership: true,
        annual_income_inr: 48000,
        social_category: 'General',
        housing_type: 'Kutcha',
        is_taxpayer: false,
        is_govt_employee: false,
        has_pension_above_10k: false,
        is_student: false,
        is_shg_member: true,
        special_conditions: ['bpl_card_holder', 'kutcha_house'],
        preferred_language: 'Hindi',
      },
    },
  ];

  // Default to Ramesh preset or existing user profile
  const existingProfile = user.profile || {};
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ramesh');

  // Form Fields
  const [name, setName] = useState<string>(existingProfile.name || 'Ramesh Patil');
  const [age, setAge] = useState<string>(
    existingProfile.age ? String(existingProfile.age) : '38'
  );
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    existingProfile.gender || 'Male'
  );
  const [state, setState] = useState<string>(existingProfile.state || 'Maharashtra');
  const [district, setDistrict] = useState<string>(existingProfile.district || 'Nashik');
  const [pincode, setPincode] = useState<string>(existingProfile.pincode || '422001');
  const [occupation, setOccupation] = useState<string>(
    existingProfile.occupation || 'Farmer'
  );
  const [landAcres, setLandAcres] = useState<string>(
    existingProfile.land_acres !== undefined ? String(existingProfile.land_acres) : '1.5'
  );
  const [annualIncome, setAnnualIncome] = useState<string>(
    existingProfile.annual_income_inr !== undefined
      ? String(existingProfile.annual_income_inr)
      : '120000'
  );
  const [socialCategory, setSocialCategory] = useState<SocialCategory>(
    existingProfile.social_category || 'OBC'
  );
  const [housingType, setHousingType] = useState<HousingType>(
    existingProfile.housing_type || 'Kutcha'
  );
  const [isTaxpayer, setIsTaxpayer] = useState<boolean>(
    Boolean(existingProfile.is_taxpayer)
  );

  const applyPreset = (preset: DemoPreset) => {
    setSelectedPresetId(preset.id);
    const d = preset.data;
    if (d.name) setName(d.name);
    if (d.age) setAge(String(d.age));
    if (d.gender) setGender(d.gender);
    if (d.state) setState(d.state);
    if (d.district) setDistrict(d.district);
    if (d.pincode) setPincode(d.pincode);
    if (d.occupation) setOccupation(d.occupation);
    if (d.land_acres !== undefined) setLandAcres(String(d.land_acres));
    if (d.annual_income_inr !== undefined) setAnnualIncome(String(d.annual_income_inr));
    if (d.social_category) setSocialCategory(d.social_category);
    if (d.housing_type) setHousingType(d.housing_type);
    if (d.is_taxpayer !== undefined) setIsTaxpayer(d.is_taxpayer);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const acresNum = occupation === 'Farmer' || occupation === 'Cultivator' ? parseFloat(landAcres) || 0 : 0;
    const haNum = Number((acresNum * 0.4047).toFixed(4));
    const incNum = parseInt(annualIncome, 10) || 0;
    const ageNum = parseInt(age, 10) || 35;

    const finalProfile: UserProfile = {
      name: name.trim() || user.name || 'Citizen',
      age: ageNum,
      gender,
      state: state.trim() || 'Maharashtra',
      district: district.trim() || 'Nashik',
      pincode: pincode.trim() || '422001',
      occupation: occupation.trim() || 'Farmer',
      land_acres: acresNum,
      land_hectares: haNum,
      has_land_ownership: acresNum > 0,
      annual_income_inr: incNum,
      social_category: socialCategory,
      housing_type: housingType,
      is_taxpayer: isTaxpayer,
      is_govt_employee: false,
      has_pension_above_10k: false,
      is_student: occupation.toLowerCase().includes('student'),
      is_shg_member: occupation.toLowerCase().includes('shg'),
      special_conditions: housingType === 'Kutcha' ? ['kutcha_house'] : [],
      preferred_language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English',
    };

    onConfirmProfile(finalProfile);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1B2A6B]/10 text-[#1B2A6B] text-xs font-bold border border-[#1B2A6B]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
          <span>Step 2: Citizen Demographic Setup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1B2A6B]">
          Verify Citizen Profile
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          SchemeSetu Bharat evaluates statutory rules deterministically. Select a verified persona below or fine-tune details to unlock welfare benefits.
        </p>
      </div>

      {/* User Login Badge Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B2A6B] to-[#1E7B34] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {user.name ? user.name[0].toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{user.name}</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                {user.authMethod === 'google' ? 'Google Account' : user.authMethod === 'digilocker' ? 'DigiLocker Linked' : 'Mobile Verified'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {user.email || (user.mobile ? `+91 ${user.mobile}` : 'Verified Citizen Session')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#1E7B34]" />
          <span>Statutory Rules Engine v2.4 Active</span>
        </div>
      </div>

      {/* 2. 1-Click Quick-Fill Demo Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1B2A6B] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#F28C28]" />
            <span>1-Click Benchmark Demo Presets</span>
          </h2>
          <span className="text-xs text-slate-400">Click any preset to test eligibility instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#1E7B34] bg-emerald-50/40 shadow-sm ring-2 ring-[#1E7B34]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#1E7B34] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-[#1B2A6B] text-sm">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-snug">
                    {preset.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                  <div className="text-slate-600">
                    <strong className="text-[#1E7B34]">{preset.potentialBenefit}</strong> Potential Welfare
                  </div>
                  <div className="text-slate-400 line-clamp-1">
                    {preset.expectedSchemes}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Profile Overview & Editing Form */}
      <form onSubmit={handleConfirm} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1B2A6B]">
              Demographic Profile Overview
            </h3>
            <p className="text-xs text-slate-500">
              Values determine statutory fit across 10 flagship welfare schemes.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Active Profile: {name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#1B2A6B]">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium"
              placeholder="e.g. Ramesh Patil"
              required
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#1B2A6B]">
                Age (Years)
              </label>
              <input
                type="number"
                min={14}
                max={99}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-[#1B2A6B]">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* State & District */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#1B2A6B]">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-[#1B2A6B]">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#1B2A6B]">
              Primary Occupation
            </label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium bg-white"
            >
              <option value="Farmer">Farmer / Cultivator</option>
              <option value="Student">Student</option>
              <option value="SHG Member">Self-Help Group (SHG) Member</option>
              <option value="Artisan">Artisan / Micro Entrepreneur</option>
              <option value="Daily Wage Laborer">Daily Wage Laborer</option>
              <option value="Salaried Employee">Salaried / Private</option>
            </select>
          </div>

          {/* Landholding in Acres */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B2A6B]">
                Agricultural Land (Acres)
              </label>
              <span className="text-[10px] text-slate-400">
                {parseFloat(landAcres) > 0
                  ? `≈ ${(parseFloat(landAcres) * 0.4047).toFixed(3)} ha`
                  : 'No farmland'}
              </span>
            </div>
            <input
              type="number"
              step="0.1"
              min={0}
              max={50}
              value={landAcres}
              onChange={(e) => setLandAcres(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium"
            />
          </div>

          {/* Annual Household Income (INR) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B2A6B]">
                Annual Household Income (₹)
              </label>
              <span className="text-[10px] text-slate-400">
                ₹{parseInt(annualIncome || '0', 10).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="number"
              step="1000"
              min={0}
              max={10000000}
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium"
              required
            />
          </div>

          {/* Social Category */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#1B2A6B]">
              Social Category
            </label>
            <select
              value={socialCategory}
              onChange={(e) => setSocialCategory(e.target.value as SocialCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium bg-white"
            >
              <option value="General">General</option>
              <option value="OBC">OBC (Other Backward Class)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
            </select>
          </div>

          {/* Housing Type */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#1B2A6B]">
              Housing Structure Type
            </label>
            <select
              value={housingType}
              onChange={(e) => setHousingType(e.target.value as HousingType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 outline-none text-slate-800 font-medium bg-white"
            >
              <option value="Kutcha">Kutcha (Thatched / Mud / Tin - PMAY-G eligible)</option>
              <option value="Semi-Pucca">Semi-Pucca</option>
              <option value="Pucca">Pucca (Permanent Concrete)</option>
            </select>
          </div>

          {/* Taxpayer Status */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#1B2A6B]">
              Income Tax Payer Status
            </label>
            <div className="flex items-center gap-4 pt-1.5">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="taxpayer"
                  checked={!isTaxpayer}
                  onChange={() => setIsTaxpayer(false)}
                  className="text-[#1E7B34] focus:ring-[#1E7B34]"
                />
                <span>Non-Taxpayer (Statutory Eligible)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="taxpayer"
                  checked={isTaxpayer}
                  onChange={() => setIsTaxpayer(true)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Taxpayer</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Clicking confirm triggers autonomous statutory evaluation against 10 flagship welfare rules.
          </div>

          <div className="flex items-center gap-3">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Skip to Dashboard
              </button>
            )}

            <button
              type="submit"
              className="px-7 py-3 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>Confirm &amp; Evaluate Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
