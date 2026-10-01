import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  X,
  Play,
  ArrowRight,
  HelpCircle,
  Trophy,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { SupportedLanguage } from '../data/translations';

interface GamifiedEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
}

interface QuizModule {
  id: string;
  title: string;
  titleHi: string;
  badgeName: string;
  badgeEmoji: string;
  duration: string;
  summary: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const QUIZ_MODULES: QuizModule[] = [
  {
    id: 'pm_kisan_dbt',
    title: 'PM-KISAN Direct Benefit Transfer (DBT)',
    titleHi: 'पीएम-किसान प्रत्यक्ष लाभ अंतरण गाइड',
    badgeName: 'Jan-Kalyan Mitra',
    badgeEmoji: '🌾',
    duration: '2 Mins',
    summary: 'Learn how ₹6,000 yearly direct benefit transfer arrives into your bank account and how e-KYC prevents payment blocks.',
    questions: [
      {
        question: 'How much direct financial transfer is given to eligible farmers under PM-KISAN every year?',
        options: ['₹2,000 in 1 installment', '₹6,000 in 3 equal installments of ₹2,000', '₹10,000 lump-sum', '₹500 per month'],
        correctIndex: 1,
        explanation: 'PM-KISAN provides ₹6,000 per year directly to bank accounts in 3 equal four-monthly installments of ₹2,000.',
      },
      {
        question: 'Which mandatory digital step is required to receive uninterrupted PM-KISAN installments?',
        options: ['Pay cash fee at bank', 'Complete OTP or Biometric e-KYC and NPCI Aadhaar bank seeding', 'Purchase extra land', 'Apply for commercial PAN'],
        correctIndex: 1,
        explanation: 'Government mandates Aadhaar-based e-KYC and active NPCI DBT seeding to guarantee 100% leak-proof fund transfers.',
      },
    ],
  },
  {
    id: 'kcc_interest',
    title: 'Kisan Credit Card (KCC) 4% Subsidized Loan',
    titleHi: 'केसीसी 4% ब्याज छूट और फसल ऋण',
    badgeName: 'Smart Krishi Planner',
    badgeEmoji: '💳',
    duration: '2 Mins',
    summary: 'Understand how prompt repayment unlocks a 3% Interest Subvention, dropping your net borrowing interest to just 4%.',
    questions: [
      {
        question: 'What is the effective net interest rate on KCC crop loans up to ₹3 Lakhs upon prompt on-time repayment?',
        options: ['12% per year', '9% standard rate', 'Just 4% per annum (after 3% prompt repayment incentive)', 'Zero interest'],
        correctIndex: 2,
        explanation: 'Standard interest is 7%, and Government of India provides a 3% prompt repayment subvention, bringing net interest down to 4%.',
      },
    ],
  },
  {
    id: 'lakhpati_didi',
    title: 'Lakhpati Didi & Women SHG Capital Grant',
    titleHi: 'लखपति दीदी एवं महिला स्वयं सहायता समूह',
    badgeName: 'Nari Shakti Champion',
    badgeEmoji: '👩‍🌾',
    duration: '2 Mins',
    summary: 'How rural women in Self Help Groups (SHGs) access collateral-free micro enterprise capital of ₹1,00,000+.',
    questions: [
      {
        question: 'What is the primary objective of the Lakhpati Didi welfare mission for SHG women?',
        options: ['Provide temporary food kits', 'Enable every rural SHG woman to earn at least ₹1,00,000 sustainable annual income', 'Mandatory urban relocation', 'Offer lottery tickets'],
        correctIndex: 1,
        explanation: 'Lakhpati Didi empowers women members of Self-Help Groups with enterprise training, community investment funds, and market linkages to attain ₹1 Lakh+ sustainable annual income.',
      },
    ],
  },
];

export const GamifiedEducationModal: React.FC<GamifiedEducationModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [selectedModule, setSelectedModule] = useState<QuizModule>(QUIZ_MODULES[0]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['Jan-Kalyan Mitra']);

  if (!isOpen) return null;

  const currentQ = selectedModule.questions[currentQIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      if (!earnedBadges.includes(selectedModule.badgeName)) {
        setEarnedBadges((prev) => [...prev, selectedModule.badgeName]);
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentQIndex < selectedModule.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E7B34] to-[#F28C28] text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Gamified Scheme Literacy &amp; Badges (Pillar 8)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34]">
                  2-Minute Micro-Courses
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Interactive case studies and quick quizzes to understand your rights and unlock Jan-Kalyan Badges.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
          {/* Badges Earned Ribbon */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-700">Your Civic Badges:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-300 text-emerald-950 font-extrabold text-xs rounded-full flex items-center gap-1.5 shadow-2xs"
                >
                  <span>🏅</span>
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Module Selector Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUIZ_MODULES.map((mod) => {
              const isSelected = selectedModule.id === mod.id;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedModule(mod);
                    setCurrentQIndex(0);
                    setSelectedOption(null);
                    setIsAnswerSubmitted(false);
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-white border-[#1B2A6B] ring-2 ring-[#1B2A6B]/15 shadow-md'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{mod.badgeEmoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {mod.duration}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{mod.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{mod.summary}</p>
                  </div>

                  <span className="text-[10px] font-bold text-[#1E7B34] border-t border-slate-100 pt-1.5 block">
                    Unlock "{mod.badgeName}" Badge
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Quiz Card */}
          {currentQ && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500">
                  Question {currentQIndex + 1} of {selectedModule.questions.length}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#1B2A6B]">
                  {selectedModule.title}
                </span>
              </div>

              <h4 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let optStyle = 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-blue-50 border-[#1B2A6B] ring-2 ring-[#1B2A6B]/20 text-[#1B2A6B] font-bold';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 text-xs ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation upon submission */}
              {isAnswerSubmitted && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-1 animate-fadeIn">
                  <span className="font-extrabold text-[#1B2A6B] block">💡 Statutory Explanation:</span>
                  <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-5 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-[#1B2A6B] hover:bg-[#142052] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Question / Finish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by <strong>YojanaSathi ApnaAdhikar ("Your Right")</strong> Financial Literacy Engine.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Done Learning
          </button>
        </div>
      </div>
    </div>
  );
};
