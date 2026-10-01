import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Building2,
  Tractor,
  Sun,
  GraduationCap,
  Coins,
  Percent,
} from 'lucide-react';
import { WhatIfScenario, WHAT_IF_SCENARIOS } from '../data/escalationAndWhatIfData';
import { UserProfile } from '../types/agent';
import { SupportedLanguage } from '../data/translations';

interface WhatIfCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onApplyForScheme?: (schemeId: string) => void;
  language: SupportedLanguage;
}

export const WhatIfCalculatorModal: React.FC<WhatIfCalculatorModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onApplyForScheme,
  language,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<WhatIfScenario>(WHAT_IF_SCENARIOS[0]);
  const [customInvestmentInr, setCustomInvestmentInr] = useState<number>(selectedScenario.investmentInr);

  if (!isOpen) return null;

  // Recalculate dynamic values based on slider
  const subsidyPercent = selectedScenario.totalGovtSubsidyInr / selectedScenario.investmentInr;
  const currentSubsidy = Math.round(customInvestmentInr * subsidyPercent);
  const outOfPocket = customInvestmentInr - currentSubsidy;
  const fiveYearGain = Math.round(selectedScenario.annualSavingsInr * 5 + currentSubsidy - customInvestmentInr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#1E7B34] text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Predictive "What-If" Strategic ROI Calculator (Pillar 10)
                </h3>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                  Capital Subsidy Simulator
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Simulate future asset purchases, FPO formations, and solar conversions to calculate exact government grants &amp; payback ROI.
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
          {/* Preset Scenario Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {WHAT_IF_SCENARIOS.map((sc) => {
              const isSelected = selectedScenario.id === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc);
                    setCustomInvestmentInr(sc.investmentInr);
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-[#1B2A6B] ring-2 ring-[#1B2A6B]/15 shadow-md'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{sc.iconEmoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {sc.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{sc.title}</h4>
                    <span className="text-xs font-bold text-[#1E7B34] mt-1 block">
                      Subsidy: ₹{sc.totalGovtSubsidyInr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
                    <span>Payback: <strong>{sc.paybackMonths}m</strong></span>
                    <span>5-Yr: <strong>+₹{(sc.fiveYearNetBenefitInr / 100000).toFixed(1)}L</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Financial Modeling Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Interactive Investment Slider & Subsidy Engine */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedScenario.iconEmoji}</span>
                  <h4 className="font-black text-slate-900 text-sm">{selectedScenario.title}</h4>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#1B2A6B]">
                  {selectedScenario.category}
                </span>
              </div>

              {/* Slider for Investment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Total Asset / Project Value:</span>
                  <span className="text-[#1B2A6B] text-sm">₹{customInvestmentInr.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={Math.round(selectedScenario.investmentInr * 0.5)}
                  max={Math.round(selectedScenario.investmentInr * 2.0)}
                  step={10000}
                  value={customInvestmentInr}
                  onChange={(e) => setCustomInvestmentInr(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1E7B34] cursor-pointer"
                />
              </div>

              {/* Financial Decomposition Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[11px] text-emerald-800 font-bold block">Government Capital Grant</span>
                  <span className="text-lg font-black text-[#1E7B34] mt-1 block">
                    ₹{currentSubsidy.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-700">({Math.round(subsidyPercent * 100)}% Direct Grant)</span>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-[11px] text-blue-800 font-bold block">Your Out-of-Pocket Cost</span>
                  <span className="text-lg font-black text-[#1B2A6B] mt-1 block">
                    ₹{outOfPocket.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-blue-700">KCC 4% Credit eligible</span>
                </div>
              </div>

              {/* 5-Year Cumulative ROI */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#1E7B34]" />
                  <div>
                    <span className="font-extrabold text-slate-900 block">5-Year Net Economic Wealth Unlocked:</span>
                    <span className="text-xl font-black text-[#1E7B34]">
                      +₹{fiveYearGain.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl shadow-2xs">
                  Payback: {selectedScenario.paybackMonths} Mo
                </span>
              </div>
            </div>

            {/* Right Column: Strategic Advisory & Action Roadmap */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Strategic Co-Pilot Advisory &amp; Action Plan
              </span>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
                <div className="flex items-center gap-2 font-bold text-[#1B2A6B]">
                  <Sparkles className="w-4 h-4 text-[#F28C28]" />
                  <span>Statutory Optimization Insight:</span>
                </div>
                <p className="leading-relaxed">{selectedScenario.strategicAdvice}</p>
              </div>

              {/* Action Steps */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">3-Step Execution Roadmap:</span>
                {selectedScenario.actionChecklist.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-[#1B2A6B] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>

              {/* Trigger Application Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onApplyForScheme) {
                      onApplyForScheme(selectedScenario.unlockedSchemeIds[0]);
                    }
                    onClose();
                  }}
                  className="w-full py-3 bg-[#1E7B34] hover:bg-[#18682B] text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apply for {selectedScenario.schemesApplicable[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by <strong>YojanaSathi ApnaAdhikar ("Your Right")</strong> Strategic ROI Simulator.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
