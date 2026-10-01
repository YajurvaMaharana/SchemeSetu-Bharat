import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Send, SlidersHorizontal, User, RefreshCw, FileText } from 'lucide-react';
import { UserProfile } from '../types/agent';

interface CitizenInputProps {
  onRunAgent: (input: { query?: string; profile?: Partial<UserProfile>; language: string }) => void;
  isLoading: boolean;
  selectedLanguage: 'hi' | 'mr' | 'en';
  onLanguageChange: (lang: 'hi' | 'mr' | 'en') => void;
}

const SAMPLES = [
  {
    id: 'ramesh',
    label: 'Sample 1: Ramesh (Farmer)',
    lang: 'hi' as const,
    text: 'Main Nashik se Ramesh hoon, 1.5 acre zameen hai, aamdani Rs 1.5 lakh hai. Mujhe sarkari madad chahiye.',
    desc: '38y, 1.5 acres land, ₹1.5L income',
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
    desc: 'Kutcha house, Bihar, BPL family',
  },
  {
    id: 'lakhpati',
    label: 'Sample 4: Anandi (SHG Woman)',
    lang: 'hi' as const,
    text: 'Mera naam Anandi Devi hai, Jharkhand se hoon, Mahila Swayam Sahayata Samuh (SHG) ki sadasya hoon, aamdani 80 hazar hai.',
    desc: 'Female, SHG Member, ₹80k income',
  },
];

export const CitizenInput: React.FC<CitizenInputProps> = ({
  onRunAgent,
  isLoading,
  selectedLanguage,
  onLanguageChange,
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
    <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-semibold text-sm border border-amber-500/30">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Citizen Input</h2>
            <p className="text-xs text-slate-400">Voice, Vernacular Text, or Structured Profile</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
          {(['hi', 'mr', 'en'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedLanguage === lang
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="text-slate-400 font-medium">
          {showStructuredForm ? 'Manual Form Mode' : 'Natural Language / Voice Mode'}
        </div>
        <button
          type="button"
          onClick={() => setShowStructuredForm(!showStructuredForm)}
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showStructuredForm ? 'Switch to Free Text / Voice' : 'Switch to Structured Form'}</span>
        </button>
      </div>

      {!showStructuredForm ? (
        <>
          {/* Preset sample buttons */}
          <div className="mb-3.5">
            <div className="text-xs text-slate-400 mb-1.5 font-medium">Try a verified test persona:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setQueryText(s.text);
                    onLanguageChange(s.lang);
                  }}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                    queryText === s.text
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-900/50 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="font-semibold text-amber-300 flex items-center justify-between">
                    <span>{s.label}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {s.lang}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Type or speak citizen details in Hindi, Marathi, or English (e.g., मैं नासिक से रमेश हूँ, 1.5 एकड़ जमीन है, सालाना आय 1.5 लाख है...)"
                rows={4}
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 p-3.5 text-sm text-slate-100 placeholder-slate-500 resize-none outline-none leading-relaxed transition"
              />
              <button
                type="button"
                onClick={startSpeechRecognition}
                className={`absolute bottom-3 right-3 p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold border transition-all shadow-md ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700 hover:text-white'
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
                    <Mic className="w-4 h-4 text-amber-400" />
                    <span>Speak</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                🎙️ Supports real-time speech-to-text in Hindi, Marathi & English
              </span>
              <button
                type="submit"
                disabled={isLoading || !queryText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Agent...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Find My Schemes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        /* Structured Form */
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={structuredProfile.name || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, name: e.target.value })}
                placeholder="e.g. Ramesh Yadav"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Age (years)</label>
              <input
                type="number"
                value={structuredProfile.age || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, age: parseInt(e.target.value, 10) || null })}
                placeholder="e.g. 38"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Gender</label>
              <select
                value={structuredProfile.gender || 'Male'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, gender: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-400 font-medium mb-1">State</label>
              <input
                type="text"
                value={structuredProfile.state || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">District</label>
              <input
                type="text"
                value={structuredProfile.district || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, district: e.target.value })}
                placeholder="e.g. Nashik"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Pincode (6-digit)</label>
              <input
                type="text"
                maxLength={6}
                value={structuredProfile.pincode || ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, pincode: e.target.value })}
                placeholder="e.g. 422011"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Occupation</label>
              <select
                value={structuredProfile.occupation || 'Farmer'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, occupation: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
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
              <label className="block text-slate-400 font-medium mb-1">Landholding (Acres)</label>
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {structuredProfile.land_hectares ? `≈ ${structuredProfile.land_hectares} ha` : '1 acre = 0.4047 ha'}
              </span>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Annual Family Income (₹)</label>
              <input
                type="number"
                value={structuredProfile.annual_income_inr ?? ''}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, annual_income_inr: parseInt(e.target.value, 10) || 0 })}
                placeholder="e.g. 150000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Social Category</label>
              <select
                value={structuredProfile.social_category || 'General'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, social_category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="General">General / Open</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Housing Type</label>
              <select
                value={structuredProfile.housing_type || 'Pucca'}
                onChange={(e) => setStructuredProfile({ ...structuredProfile, housing_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="Pucca">Pucca (Brick/Concrete)</option>
                <option value="Kutcha">Kutcha (Thatched/Mud/Tin)</option>
                <option value="Homeless">Homeless / Landless</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Statutory Exclusions & Special Declarations:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_taxpayer}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_taxpayer: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Income Taxpayer</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_govt_employee}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_govt_employee: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Govt Employee</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={structuredProfile.has_pension_above_10k}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, has_pension_above_10k: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Pension &gt; ₹10k/mo</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_shg_member}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_shg_member: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>SHG Member</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={structuredProfile.is_student}
                  onChange={(e) => setStructuredProfile({ ...structuredProfile, is_student: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Enrolled Student</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
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
