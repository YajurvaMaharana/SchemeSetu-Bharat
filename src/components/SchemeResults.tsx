import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  FileDown,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  Building2,
  Info,
  Check,
  Star,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { AgentResponse, SchemeEligibilityResult, UserProfile } from '../types/agent';
import { CscCenterCard } from './CscCenterCard';

interface SchemeResultsProps {
  response: AgentResponse;
  selectedLanguage: 'hi' | 'mr' | 'en';
  onOpenPdfModal: () => void;
  onSubmitApplication: (schemeId: string, profile: UserProfile) => void;
  submittingSchemeId: string | null;
}

export const SchemeResults: React.FC<SchemeResultsProps> = ({
  response,
  selectedLanguage,
  onOpenPdfModal,
  onSubmitApplication,
  submittingSchemeId,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showIneligible, setShowIneligible] = useState<boolean>(false);
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});

  const togglePayload = (schemeId: string) => {
    setExpandedPayloads((prev) => ({ ...prev, [schemeId]: !prev[schemeId] }));
  };

  // Web Speech API Text-to-Speech
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = response.vernacular_summary || response.summary_text;
    if (!text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      en: 'en-IN',
    };
    utterance.lang = langMap[selectedLanguage] || 'hi-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const renderFrictionStars = (friction: number = 1) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < friction ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
            }`}
          />
        ))}
        <span className="text-[11px] text-slate-400 ml-1">
          {friction <= 2 ? 'Low Friction' : friction <= 3 ? 'Moderate' : 'High Verification'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Top Banner Metric & Summary */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                ✅ Discovery Complete
              </span>
              {response.used_fallback && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs border border-slate-700">
                  Deterministic Verified
                </span>
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ₹ {response.total_potential_benefit_inr.toLocaleString('en-IN')}
              <span className="text-sm sm:text-base font-normal text-slate-300 ml-2">
                / total annual potential welfare unlocked
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed whitespace-pre-line">
              {response.vernacular_summary || response.summary_text}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSpeak}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Listen in My Language 🔊'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPdfModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Action Pack (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Eligible & Review Schemes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligible Schemes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Eligible Schemes ({response.eligible_schemes.length})</span>
              </h3>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                100% Criteria Verified
              </span>
            </div>

            {response.eligible_schemes.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 text-center text-slate-400 text-sm">
                No direct eligibility found with current criteria. Check review section or update profile details.
              </div>
            ) : (
              <div className="space-y-4">
                {response.eligible_schemes.map((scheme) => {
                  const isPayloadOpen = Boolean(expandedPayloads[scheme.scheme_id]);
                  const isSubmitting = submittingSchemeId === scheme.scheme_id;

                  return (
                    <div
                      key={scheme.scheme_id}
                      className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 transition rounded-2xl p-5 shadow-lg space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white">
                              {scheme.scheme_name}
                            </h4>
                            {scheme.scheme_name_hi && (
                              <span className="text-xs text-amber-300 font-medium">
                                ({scheme.scheme_name_hi})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Category: <span className="text-slate-300 font-medium">{scheme.category}</span> • Mode:{' '}
                            <span className="text-slate-300">{scheme.application_mode || 'Online / CSC'}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-emerald-400">
                            ₹ {scheme.benefit_amount_inr.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[11px] text-slate-400">{scheme.benefit_frequency}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                        {scheme.benefit_description}
                      </div>

                      {/* Application Friction & Required Docs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                        <div>
                          <div className="text-slate-400 font-medium mb-1">Application Friction Score:</div>
                          {renderFrictionStars(scheme.friction_score)}
                        </div>
                        <div>
                          <div className="text-slate-400 font-medium mb-1">Required Documents:</div>
                          <div className="flex flex-wrap gap-1">
                            {scheme.required_documents.map((doc, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3 text-emerald-400" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => togglePayload(scheme.scheme_id)}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>One-Click Payload Preview</span>
                            {isPayloadOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          {scheme.portal_url && (
                            <a
                              href={scheme.portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 underline ml-2"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => onSubmitApplication(scheme.scheme_id, response.user_profile)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Submitting...' : 'Submit Simulated Application'}</span>
                          <span className="text-[9px] bg-slate-950/30 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                            Simulated
                          </span>
                        </button>
                      </div>

                      {/* Expandable Payload */}
                      {isPayloadOpen && (
                        <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto">
                          <div className="text-slate-400 text-[10px] mb-1 font-sans">
                            API Pre-filled Payload (ready for automated dispatch):
                          </div>
                          <pre>
                            {JSON.stringify(
                              {
                                scheme_id: scheme.scheme_id,
                                scheme_name: scheme.scheme_name,
                                user_profile: response.user_profile,
                                timestamp: new Date().toISOString(),
                              },
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Needs Review Schemes Section */}
          {response.review_schemes.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Schemes Requiring Review ({response.review_schemes.length})</span>
                </h3>
                <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Borderline / Certificate Needed
                </span>
              </div>

              <div className="space-y-4">
                {response.review_schemes.map((scheme) => (
                  <div
                    key={scheme.scheme_id}
                    className="bg-slate-800/60 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{scheme.scheme_name}</h4>
                          <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                            NEEDS_REVIEW
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Potential Benefit: ₹{scheme.benefit_amount_inr.toLocaleString('en-IN')} ({scheme.benefit_description})
                        </div>
                      </div>
                    </div>

                    {/* Edge case resolution note */}
                    <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 leading-relaxed">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Statutory Administrative Guidance & Resolution Note:</span>
                      </div>
                      <p>{scheme.llm_edge_review || scheme.edge_case_flags.join(' • ')}</p>
                    </div>

                    <div className="text-xs text-slate-300">
                      <span className="text-slate-400 font-medium">Flagged Conditions: </span>
                      {scheme.edge_case_flags.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not Eligible Schemes (Collapsible) */}
          {response.ineligible_schemes.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowIneligible(!showIneligible)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span>Not Eligible Schemes ({response.ineligible_schemes.length})</span>
                </div>
                {showIneligible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showIneligible && (
                <div className="mt-3 space-y-2.5">
                  {response.ineligible_schemes.map((scheme) => (
                    <div
                      key={scheme.scheme_id}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-300">
                        <span>{scheme.scheme_name}</span>
                        <span className="text-slate-500 font-normal">
                          ₹{scheme.benefit_amount_inr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-rose-400/90 text-[11px]">
                        <strong>Disqualification Reasons: </strong>
                        {scheme.failed_criteria.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Nearest CSC recommendation & Profile Summary */}
        <div className="space-y-6">
          <CscCenterCard csc={response.csc_recommendation} />

          {/* User Profile Summary Card */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg text-xs space-y-3">
            <div className="font-bold text-white flex items-center justify-between border-b border-slate-700/60 pb-2">
              <span>Citizen Profile Snapshot</span>
              <span className="text-[10px] text-amber-400 font-mono">ID: IN-{Date.now().toString().slice(-6)}</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-medium text-white">{response.user_profile.name || 'Citizen'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="font-medium text-white">
                  {response.user_profile.age ? `${response.user_profile.age} yrs` : 'N/A'} •{' '}
                  {response.user_profile.gender || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-white">
                  {response.user_profile.district || 'District'}, {response.user_profile.state || 'State'} (
                  {response.user_profile.pincode || 'PIN N/A'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupation:</span>
                <span className="font-medium text-white">{response.user_profile.occupation || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Landholding:</span>
                <span className="font-medium text-white">
                  {response.user_profile.land_acres ?? 0} acres ({response.user_profile.land_hectares ?? 0} ha)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Income:</span>
                <span className="font-medium text-emerald-400">
                  ₹{(response.user_profile.annual_income_inr ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Housing Type:</span>
                <span className="font-medium text-white">{response.user_profile.housing_type || 'Pucca'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Social Category:</span>
                <span className="font-medium text-white">{response.user_profile.social_category || 'General'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
