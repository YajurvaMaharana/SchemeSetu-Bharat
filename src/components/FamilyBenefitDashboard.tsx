import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  DollarSign,
  Landmark,
  GraduationCap,
  Home,
  HeartPulse,
  Briefcase,
  Zap,
  Printer,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  HouseholdMember,
  HouseholdOptimizationResult,
  MemberBenefitSummary,
} from '../types/household';
import {
  DEFAULT_HOUSEHOLD_PRESETS,
  optimizeHouseholdBenefits,
} from '../services/householdOptimizer';

interface FamilyBenefitDashboardProps {
  onOpenPdfModal?: () => void;
  onBookCscSlot?: (district: string) => void;
}

export const FamilyBenefitDashboard: React.FC<FamilyBenefitDashboardProps> = ({
  onOpenPdfModal,
  onBookCscSlot,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    DEFAULT_HOUSEHOLD_PRESETS[0].id
  );
  const [members, setMembers] = useState<HouseholdMember[]>(
    DEFAULT_HOUSEHOLD_PRESETS[0].members
  );
  const [householdName, setHouseholdName] = useState<string>(
    DEFAULT_HOUSEHOLD_PRESETS[0].name
  );
  const [district, setDistrict] = useState<string>(
    DEFAULT_HOUSEHOLD_PRESETS[0].district
  );
  const [state, setState] = useState<string>(
    DEFAULT_HOUSEHOLD_PRESETS[0].state
  );
  const [activeMemberTab, setActiveMemberTab] = useState<string>('all');
  const [showConstraintLogs, setShowConstraintLogs] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Compute optimization result
  const [optimizationResult, setOptimizationResult] =
    useState<HouseholdOptimizationResult>(() =>
      optimizeHouseholdBenefits(
        DEFAULT_HOUSEHOLD_PRESETS[0].members,
        DEFAULT_HOUSEHOLD_PRESETS[0].name,
        DEFAULT_HOUSEHOLD_PRESETS[0].district,
        DEFAULT_HOUSEHOLD_PRESETS[0].state
      )
    );

  const handleSelectPreset = (presetId: string) => {
    const preset = DEFAULT_HOUSEHOLD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setMembers(preset.members);
    setHouseholdName(preset.name);
    setDistrict(preset.district);
    setState(preset.state);
    setActiveMemberTab('all');

    setIsOptimizing(true);
    setTimeout(() => {
      const res = optimizeHouseholdBenefits(
        preset.members,
        preset.name,
        preset.district,
        preset.state
      );
      setOptimizationResult(res);
      setIsOptimizing(false);
    }, 300);
  };

  const handleReOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const res = optimizeHouseholdBenefits(
        members,
        householdName,
        district,
        state
      );
      setOptimizationResult(res);
      setIsOptimizing(false);
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find max yearly cash flow for scaling bars
  const maxYearlyCashflow = Math.max(
    ...optimizationResult.yearlyCashflows.map((y) => y.totalYearlyInr),
    1
  );

  return (
    <div className="space-y-8 animate-fadeIn" id="family-benefit-dashboard">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-white via-[#F0F6FF] to-[#E6F0FA] border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200 shadow-2xs text-xs font-bold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-[#1E7B34]" />
              <span>Multi-Member Statutory Constraint Solver</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 leading-tight">
              Family Benefit Dashboard <br />
              <span className="text-[#1E7B34]">
                5-Year Maximum Entitlement Engine
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              Evaluates all household members simultaneously, enforces mutual
              exclusion rules (single PMAY-G per family, unified Ayushman pool,
              SHG capital), and computes the maximum 5-year financial capital
              unlocked.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleReOptimize}
              disabled={isOptimizing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1B2A6B] hover:bg-[#142052] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`}
              />
              <span>{isOptimizing ? 'Optimizing...' : 'Re-Run Optimizer'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print 5-Yr Dossier</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 shrink-0">
            Household Scenarios:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {DEFAULT_HOUSEHOLD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  selectedPresetId === preset.id
                    ? 'bg-[#1E7B34] text-white border-[#1E7B34] font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] opacity-75">
                  ({preset.district})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top Executive 4-Stat Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 5-Year Grand Total */}
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>5-Yr Grand Total</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34]">
              MAX CAP
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1E7B34] font-mono">
            ₹
            {optimizationResult.year5GrandTotalEntitlementInr.toLocaleString(
              'en-IN'
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Includes direct DBTs, housing grant &amp; 5-yr floating health cover
          </p>
        </div>

        {/* 5-Year Direct Cash Grants */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Direct Cash &amp; Grants</span>
            <DollarSign className="w-4 h-4 text-[#F28C28]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">
            ₹
            {optimizationResult.year5TotalDirectGrantsInr.toLocaleString(
              'en-IN'
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Pure non-repayable disbursements (PM-KISAN, PMAY, Lakhpati, NSP)
          </p>
        </div>

        {/* Year 1 Immediate Liquidity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Year 1 Inflow</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1B2A6B] font-mono">
            ₹{optimizationResult.year1TotalInr.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            First-year direct disbursements + credit limit activation
          </p>
        </div>

        {/* Optimization Engine Stats */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Combinations Solved</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 font-mono">
            {optimizationResult.totalCombinationsEvaluated} Tested
          </div>
          <p className="text-[11px] text-slate-500">
            Global Rank #{optimizationResult.optimalCombinationRank} • 0 Mutual
            Exclusion Collisions
          </p>
        </div>
      </div>

      {/* 3. 5-Year Cash Flow Trajectory & Yearly Bar Chart */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-[#1B2A6B] text-lg sm:text-xl">
              5-Year Household Entitlement Trajectory (Year 1 to Year 5)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Year-by-year cashflow distribution showing when grants, credit
              lines, and health pools are disbursed.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#1E7B34]" /> Direct Grants
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#1B2A6B]" /> Protection &amp; Credit
            </span>
          </div>
        </div>

        {/* 5-Year Bar Chart Visualizer */}
        <div className="space-y-4">
          {optimizationResult.yearlyCashflows.map((y) => {
            const directShare =
              y.directCashDbtInr +
              y.housingGrantsInr +
              y.scholarshipsInr +
              y.livelihoodGrantsInr;
            const protectionShare = y.creditAndProtectionInr;
            const percentWidth = Math.min(
              100,
              Math.max(12, Math.round((y.totalYearlyInr / maxYearlyCashflow) * 100))
            );

            return (
              <div key={y.year} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-mono font-black text-[#1B2A6B]">
                      Y{y.year}
                    </span>
                    <span>
                      Year {y.year} (
                      {y.year === 1
                        ? 'Immediate Inflows'
                        : y.year <= 3
                        ? 'Sustained Grants & Degree Completion'
                        : 'Pension & Maintenance'}
                      )
                    </span>
                  </span>
                  <span className="font-mono text-[#1E7B34] font-black text-sm">
                    ₹{y.totalYearlyInr.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Stacked Progress Bar */}
                <div className="w-full h-8 bg-slate-100 rounded-xl overflow-hidden flex p-1 gap-1 border border-slate-200">
                  {/* Direct Grants Segment */}
                  {directShare > 0 && (
                    <div
                      style={{
                        width: `${Math.round(
                          (directShare / y.totalYearlyInr) * percentWidth
                        )}%`,
                      }}
                      className="h-full bg-gradient-to-r from-[#1E7B34] to-emerald-500 rounded-lg flex items-center px-2 text-[10px] font-bold text-white whitespace-nowrap overflow-hidden transition-all duration-700"
                      title={`Direct Grants: ₹${directShare.toLocaleString(
                        'en-IN'
                      )}`}
                    >
                      Grants: ₹{(directShare / 1000).toFixed(0)}k
                    </div>
                  )}

                  {/* Protection / Credit Segment */}
                  {protectionShare > 0 && (
                    <div
                      style={{
                        width: `${Math.round(
                          (protectionShare / y.totalYearlyInr) * percentWidth
                        )}%`,
                      }}
                      className="h-full bg-gradient-to-r from-[#1B2A6B] to-blue-600 rounded-lg flex items-center px-2 text-[10px] font-bold text-white whitespace-nowrap overflow-hidden transition-all duration-700"
                      title={`Protection/Credit: ₹${protectionShare.toLocaleString(
                        'en-IN'
                      )}`}
                    >
                      Health/Credit: ₹{(protectionShare / 1000).toFixed(0)}k
                    </div>
                  )}
                </div>

                {/* Sub-breakdown Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pl-8">
                  {y.housingGrantsInr > 0 && (
                    <span>
                      🏠 PMAY Housing: ₹{y.housingGrantsInr.toLocaleString('en-IN')}
                    </span>
                  )}
                  {y.scholarshipsInr > 0 && (
                    <span>
                      🎓 Scholarship: ₹{y.scholarshipsInr.toLocaleString('en-IN')}
                    </span>
                  )}
                  {y.livelihoodGrantsInr > 0 && (
                    <span>
                      💼 SHG Livelihood: ₹{y.livelihoodGrantsInr.toLocaleString('en-IN')}
                    </span>
                  )}
                  {y.directCashDbtInr > 0 && (
                    <span>
                      🌾 PM-KISAN/Pension: ₹{y.directCashDbtInr.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span>
                    🛡️ Ayushman &amp; Protection: ₹{y.creditAndProtectionInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Member-by-Member Benefit Allocations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-[#1B2A6B] text-lg sm:text-xl">
              Member-by-Member Entitlement Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Statutory verification and scheme allocations tailored to each
              individual profile.
            </p>
          </div>

          {/* Member Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveMemberTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                activeMemberTab === 'all'
                  ? 'bg-white text-[#1B2A6B] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Members ({members.length})
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMemberTab(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                  activeMemberTab === m.id
                    ? 'bg-white text-[#1B2A6B] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.name.split(' ')[0]} ({m.relation})
              </button>
            ))}
          </div>
        </div>

        {/* Member Benefit Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {optimizationResult.memberSummaries
            .filter(
              (ms) => activeMemberTab === 'all' || ms.member.id === activeMemberTab
            )
            .map((ms) => (
              <div
                key={ms.member.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Member Profile Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-gray-900">
                          {ms.member.name}
                        </h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          {ms.member.relation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ms.member.age} yrs • {ms.member.gender} •{' '}
                        {ms.member.occupation}
                        {ms.member.landAcres
                          ? ` • ${ms.member.landAcres} acres land`
                          : ''}
                        {ms.member.isShgMember ? ' • SHG Member' : ''}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        5-Yr Value
                      </span>
                      <strong className="text-base font-black font-mono text-[#1E7B34]">
                        ₹{ms.total5YearGrandTotalInr.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Allocated Schemes List */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Allocated Statutory Schemes ({ms.allocatedSchemes.length}):
                    </span>

                    {ms.allocatedSchemes.length === 0 ? (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                        Covered under Unified Ayushman Bharat Family Health Pool.
                      </div>
                    ) : (
                      ms.allocatedSchemes.map((scheme) => (
                        <div
                          key={scheme.schemeId}
                          className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-slate-900 font-bold block">
                                {scheme.schemeName}
                              </strong>
                              <span className="text-[10px] text-slate-500 block">
                                {scheme.frequency}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                              ₹{scheme.fiveYearTotalInr.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600">
                            {scheme.description}
                          </p>

                          <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-[#1E7B34] shrink-0" />
                            <span>
                              <strong>Statutory Rationale:</strong>{' '}
                              {scheme.statutoryReason}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Card Footer Breakdown */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl">
                  <span>
                    Direct Grants: ₹
                    {ms.total5YearDirectCashInr.toLocaleString('en-IN')}
                  </span>
                  <span>
                    Credit/Insurance: ₹
                    {ms.total5YearProtectionInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 5. Combinatorial Constraint Logs (Collapsible) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
        <button
          type="button"
          onClick={() => setShowConstraintLogs(!showConstraintLogs)}
          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1B2A6B]">
                Combinatorial Mutual-Exclusion Audit Log
              </h4>
              <p className="text-xs text-slate-500">
                {optimizationResult.constraintsEnforced.length} statutory
                household constraint rules applied
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            {showConstraintLogs ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {showConstraintLogs && (
          <div className="pt-3 space-y-2.5 animate-fadeIn border-t border-slate-100">
            {optimizationResult.constraintsEnforced.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-2xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-purple-900">
                  <span>{rule.ruleName}</span>
                  <span className="text-[10px] font-mono bg-purple-100 px-2 py-0.5 rounded-md text-purple-800">
                    {rule.status}
                  </span>
                </div>
                <p className="text-slate-600">{rule.description}</p>
                <div className="text-emerald-700 text-[11px] font-medium pt-0.5">
                  ✓ {rule.resolution}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. 5-Year Sequential Action Roadmap */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h3 className="font-extrabold text-[#1B2A6B] text-lg sm:text-xl">
            5-Year Household Implementation Roadmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential milestones to maximize grant capture with minimal
            administrative friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {optimizationResult.filingPhases.map((phase, idx) => (
            <div
              key={idx}
              className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1E7B34]/15 text-[#1E7B34] border border-[#1E7B34]/25">
                    {phase.timeline}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Step {idx + 1}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                  {phase.phase}
                </h4>

                <p className="text-[11px] text-slate-600">{phase.action}</p>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Focus Schemes:
                  </span>
                  {phase.schemes.map((s, sIdx) => (
                    <div
                      key={sIdx}
                      className="text-[11px] text-slate-700 flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-[#1E7B34] shrink-0" />
                      <span className="line-clamp-1">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                <strong>Lead Member:</strong> {phase.responsibleMember}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
