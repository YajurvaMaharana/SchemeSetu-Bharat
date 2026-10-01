import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, SlidersHorizontal, RefreshCw, Send, Check } from 'lucide-react';
import { UserProfile } from '../types/agent';

interface CitizenInputProps {
  onRunAgent: (input: { query?: string; profile?: Partial<UserProfile>; language: string }) => void;
  isLoading: boolean;
  selectedLanguage: 'hi' | 'mr' | 'en';
  onLanguageChange: (lang: 'hi' | 'mr' | 'en') => void;
  prefilledProfile?: Partial<UserProfile> | null;
  isSignedIn?: boolean;
}

const SAMPLES = [
  {
    id: 'ramesh',
    label: 'Sample 1: Ramesh (Farmer)',
    lang: 'hi' as const,
    text: 'Main Nashik se Ramesh hoon, 1.5 acre zameen hai, aamdani Rs 1.5 lakh hai. Mujhe sarkari madad chahiye.',
    desc: '38y, 1.5 acres land, ₹1.5L income, Nashik',
  },
  {
    id: 'student',
    label: 'Sample 2: Marathi Student',
    lang: 'mr' as const,
    text: 'Mi Pune madhun vidyarthi ahe, SC category, family income 2 lakh ahe.',
    desc: 'Student, SC category, Pune, ₹2L income',
  },
  {
    id: 'sunita',
    label: 'Sample 3: Sunita (BPL/Kutcha)',
    lang: 'hi' as const,
    text: 'Main Sunita Bihar se hoon, BPL parivar se, kutcha makaan hai aur mere paas gas connection nahi hai.',
    desc: 'Kutcha house, Bihar, BPL family, low income',
  },
  {
    id: 'lakhpati',
    label: 'Sample 4: Anandi (SHG Woman)',
    lang: 'hi' as const,
    text: 'Mera naam Anandi Devi hai, Jharkhand se hoon, Mahila Swayam Sahayata Samuh (SHG) ki sadasya hoon, aamdani 80 hazar hai.',
    desc: 'Female, SHG Member, ₹80k income, Rural',
  },
];

export const CitizenInput: React.FC<CitizenInputProps> = ({
  onRunAgent,
  isLoading,
  selectedLanguage,
  onLanguageChange,
  prefilledProfile,
  isSignedIn,
}) => {
  const [queryText, setQueryText] = useState<string>(SAMPLES[0].text);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showStructuredForm, setShowStructuredForm] = useState<boolean>(false);

  // Structured Form State
  const [structuredProfile, setStructuredProfile] = useState<Partial<UserProfile>>({
    name: '',
    age: 38,
    state: 'Maharashtra',
    district: 'Nashik',
    pincode: '422011',
    occupation: 'Farmer',
    land_acres: 1.5,
    annual_income_inr: 150000,
    social_category: 'General',
    housing_type: 'Pucca',
    is_taxpayer: false,
    is_govt_employee: false,
    has_pension_above_10k: false,
    is_shg_member: false,
    is_student: false,
    special_conditions: [],
  });

  // Prefill when signed in with a user profile
  useEffect(() => {
    if (isSignedIn && prefilledProfile && Object.keys(prefilledProfile).length > 0) {
      setStructuredProfile((prev) => ({
        ...prev,
        ...prefilledProfile,
      }));

      // Also set a natural language query representing the citizen
      const nameStr = prefilledProfile.name ? `Mera naam ${prefilledProfile.name} hai. ` : '';
      const stateStr = prefilledProfile.district ? `${prefilledProfile.district}, ${prefilledProfile.state || ''} se hoon. ` : '';
      const occStr = prefilledProfile.occupation ? `${prefilledProfile.occupation} hoon. ` : '';
      const landStr = prefilledProfile.land_acres ? `${prefilledProfile.land_acres} acre zameen hai. ` : '';
      const incStr = prefilledProfile.annual_income_inr ? `Saalana aamdani Rs ${prefilledProfile.annual_income_inr} hai. ` : '';
      const constructed = `${nameStr}${stateStr}${occStr}${landStr}${incStr}Mujhe patra sarkari yojanaon ki jankari chahiye.`.trim();
      setQueryText(constructed);
    }
  }, [isSignedIn, prefilledProfile]);

  // Web Speech API STT
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by this browser. Please use Chrome or type directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap: Record<string, string> = {
        hi: 'hi-IN',
        mr: 'mr-IN',
        en: 'en-IN',
      };
      recognition.lang = langMap[selectedLanguage] || 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQueryText(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showStructuredForm) {
      onRunAgent({
        profile: structuredProfile,
        language: selectedLanguage,
      });
    } else {
      if (!queryText.trim()) return;
      onRunAgent({
        query: queryText.trim(),
        language: selectedLanguage,
      });
    }
  };

  return (
    <div id="citizen-input-section" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B2A6B]/10 text-[#1B2A6B] flex items-center justify-center font-bold text-sm border border-[#1B2A6B]/20">
            1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1B2A6B]">Citizen Input</h2>
              {isSignedIn && prefilledProfile && Object.keys(prefilledProfile).length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E7B34] border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#1E7B34]" />
                  <span>Prefilled from your profile</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Voice, Vernacular Text, or Structured Profile</p>
          </div>
        </div>

        {/* Mode toggle */}
        <button
          type="button"
          onClick={() => setShowStructuredForm(!showStructuredForm)}
          className="inline-flex items-center gap-1.5 text-xs text-[#1B2A6B] font-bold hover:text-[#F28C28] transition bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#F28C28]" />
          <span>{showStructuredForm ? 'Switch to Free Text / Voice' : 'Switch to Structured Form'}</span>
        </button>
      </div>

      {!showStructuredForm ? (
        <>
          {/* Preset sample buttons */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              Try a verified test persona:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLES.map((s) => {
                const isSelected = queryText === s.text;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setQueryText(s.text);
                      onLanguageChange(s.lang);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-[#F28C28]/10 border-2 border-[#F28C28] shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between text-[#1B2A6B]">
                      <span>{s.label}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-[#F28C28] text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {s.lang}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] truncate mt-1">{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Type or speak citizen details in Hindi, Marathi, or English (e.g., मैं नासिक से रमेश हूँ, 1.5 एकड़ जमीन है, सालाना आय 1.5 लाख है...)"
                rows={4}
                className="w-full rounded-xl bg-white border border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/20 p-3.5 text-sm text-slate-800 placeholder-slate-400 resize-none outline-none leading-relaxed transition shadow-2xs"
              />
              <button
                type="button"
                onClick={startSpeechRecognition}
                className={`absolute bottom-3 right-3 p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-all shadow-xs cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Click to speak with microphone"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#F28C28]" />
                    <span>Speak</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-500">
                🎙️ Supports real-time speech-to-text in Hindi, Marathi &amp; English
              </span>

              <button
                type="submit"
                disabled={isLoading || !queryText.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm rounded-[10px] shadow-sm transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Agent...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find My Schemes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        /* Structured Form */
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={structuredProfile.name || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, name: e.target.value })}
                placeholder="e.g. Ramesh Yadav"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Age (years)</label>
              <input
                type="number"
                value={structuredProfile.age || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, age: parseInt(e.target.value, 10) || null })}
                placeholder="e.g. 38"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Gender</label>
              <select
                value={structuredProfile.gender || 'Male'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, gender: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">State</label>
              <input
                type="text"
                value={structuredProfile.state || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">District</label>
              <input
                type="text"
                value={structuredProfile.district || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, district: e.target.value })}
                placeholder="e.g. Nashik"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pincode (6-digit)</label>
              <input
                type="text"
                maxLength={6}
                value={structuredProfile.pincode || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, pincode: e.target.value })}
                placeholder="e.g. 422011"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Occupation</label>
              <select
                value={structuredProfile.occupation || 'Farmer'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, occupation: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none cursor-pointer"
              >
                <option value="Farmer">Farmer (किसान)</option>
                <option value="Agricultural Labourer">Agricultural Labourer</option>
                <option value="Daily Wage Worker">Daily Wage Worker (मजदूर)</option>
                <option value="Student">Student (विद्यार्थी)</option>
                <option value="Artisan">Artisan / Weaver (कारीगर)</option>
                <option value="Self-Employed">Self-Employed / Shopkeeper</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Landholding (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={structuredProfile.land_acres ?? ''}
                onChange={(e) => {
                  const ac = parseFloat(e.target.value) || 0;
                  setStructuredProfile({
                    ...structuredProfile,
                    land_acres: ac,
                    land_hectares: Number((ac * 0.4047).toFixed(4)),
                  });
                }}
                placeholder="e.g. 1.5"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {structuredProfile.land_hectares ? `≈ ${structuredProfile.land_hectares} ha` : '1 acre = 0.4047 ha'}
              </span>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Annual Family Income (₹)</label>
              <input
                type="number"
                value={structuredProfile.annual_income_inr ?? ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, annual_income_inr: parseInt(e.target.value, 10) || 0 })}
                placeholder="e.g. 150000"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Social Category</label>
              <select
                value={structuredProfile.social_category || 'General'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, social_category: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none cursor-pointer"
              >
                <option value="General">General / Open</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Housing Type</label>
              <select
                value={structuredProfile.housing_type || 'Pucca'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, housing_type: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:border-[#F28C28] outline-none cursor-pointer"
              >
                <option value="Pucca">Pucca (Brick/Concrete)</option>
                <option value="Kutcha">Kutcha (Thatched/Mud/Tin)</option>
                <option value="Homeless">Homeless / Landless</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="text-[11px] font-bold text-[#1B2A6B] uppercase tracking-wider">
              Statutory Exclusions &amp; Special Declarations:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_taxpayer}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_taxpayer: e.target.checked })}
                  className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
                />
                <span>Income Taxpayer</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_govt_employee}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_govt_employee: e.target.checked })}
                  className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
                />
                <span>Govt Employee</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={structuredProfile.has_pension_above_10k}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, has_pension_above_10k: e.target.checked })}
                  className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
                />
                <span>Pension &gt; ₹10k/mo</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_shg_member}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_shg_member: e.target.checked })}
                  className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
                />
                <span>SHG Member</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_student}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_student: e.target.checked })}
                  className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
                />
                <span>Enrolled Student</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm rounded-[10px] shadow-sm transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
