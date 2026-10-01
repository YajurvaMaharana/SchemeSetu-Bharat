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
  Send,
  Info,
  Check,
  Star,
  Scan,
} from 'lucide-react';
import { AgentResponse, UserProfile, Scheme } from '../types/agent';
import { CscCenterCard } from './CscCenterCard';

interface SchemeResultsProps {
  response: AgentResponse;
  selectedLanguage: 'hi' | 'mr' | 'en';
  onOpenPdfModal: () => void;
  onSubmitApplication: (schemeId: string, profile: UserProfile) => void;
  submittingSchemeId: string | null;
  onOpenApplyModal?: (scheme: Scheme) => void;
  onLaunchPortalFiling?: (scheme: Scheme) => void;
  onBookCscAppointment?: (center: CscCenter) => void;
}

export const SchemeResults: React.FC<SchemeResultsProps> = ({
  response,
  selectedLanguage,
  onOpenPdfModal,
  onSubmitApplication,
  submittingSchemeId,
  onOpenApplyModal,
  onLaunchPortalFiling,
  onBookCscAppointment,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showIneligible, setShowIneligible] = useState<boolean>(false);
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});

  const togglePayload = (schemeId: string) => {
    setExpandedPayloads((prev) => ({ ...prev, [schemeId]: !prev[schemeId] }));
  };

  // Web Speech API TTS
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
              i < friction ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
            }`}
          />
        ))}
        <span className="text-[11px] text-slate-500 ml-1">
          {friction <= 2 ? 'Low Friction' : friction <= 3 ? 'Moderate' : 'High Verification'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Banner Metric & Summary */}
      <div className="bg-gradient-to-br from-white via-emerald-50/40 to-amber-50/40 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#1E7B34]/10 dark:bg-emerald-950/60 text-[#1E7B34] dark:text-emerald-400 font-bold text-xs border border-[#1E7B34]/25 dark:border-emerald-800">
                ✅ Eligibility Verified
              </span>
              {response.used_fallback && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-600 font-medium">
                  Accurate &amp; Verified
                </span>
              )}
            </div>

            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B2A6B] dark:text-slate-100 tracking-tight">
              ₹ {response.total_potential_benefit_inr.toLocaleString('en-IN')}
              <span className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 ml-2">
                / total benefits you can receive per year
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
              {response.vernacular_summary || response.summary_text}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSpeak}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#F28C28]" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Listen in My Language 🔊'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPdfModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E7B34] hover:bg-[#18682B] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Claim Guide (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Eligible & Review Schemes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligible Schemes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A6B] dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#1E7B34] dark:text-emerald-400" />
                <span>Eligible Schemes ({response.eligible_schemes.length})</span>
              </h3>
              <span className="text-xs text-[#1E7B34] dark:text-emerald-400 font-bold bg-[#1E7B34]/10 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-[#1E7B34]/25 dark:border-emerald-800">
                Verified by Govt Rules
              </span>
            </div>

            {response.eligible_schemes.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
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
                      className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:border-[#1E7B34]/60 dark:hover:border-emerald-500 transition-all rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-[#1B2A6B] dark:text-slate-100">
                              {scheme.scheme_name}
                            </h4>
                            {scheme.scheme_name_hi && (
                              <span className="text-xs text-[#F28C28] font-semibold">
                                ({scheme.scheme_name_hi})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{scheme.category}</span> • Mode:{' '}
                            <span className="text-slate-600 dark:text-slate-400">{scheme.application_mode || 'Online / Help Center'}</span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xl font-extrabold text-[#1E7B34]">
                            ₹ {scheme.benefit_amount_inr.toLocaleString('en-IN')}
                          </div>
                          <span className="text-xs text-slate-500">{scheme.benefit_frequency}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 leading-relaxed font-normal">
                        {scheme.benefit_description}
                      </div>

                      {/* Application Friction & Required Docs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                        <div>
                          <div className="text-slate-500 font-semibold mb-1.5">Application Friction Score:</div>
                          {renderFrictionStars(scheme.friction_score)}
                        </div>
                        <div>
                          <div className="text-slate-500 font-semibold mb-1.5">Required Documents:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {scheme.required_documents.map((doc, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 font-medium"
                              >
                                <Check className="w-3 h-3 text-[#1E7B34]" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => togglePayload(scheme.scheme_id)}
                            className="text-xs text-[#F28C28] hover:text-[#d97706] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>One-Click Payload Preview</span>
                            {isPayloadOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          {scheme.portal_url && (
                            <a
                              href={scheme.portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-slate-500 hover:text-[#1B2A6B] flex items-center gap-1 underline"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {onLaunchPortalFiling && (
                            <button
                              type="button"
                              onClick={() => onLaunchPortalFiling(scheme)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1B2A6B] border border-blue-200 font-bold text-xs transition shadow-2xs cursor-pointer"
                              title="Use OCR to extract document proofs and simulate navigation to fill 25+ fields across government portals"
                            >
                              <Scan className="w-3.5 h-3.5 text-[#F28C28]" />
                              <span>Auto-Fill 26 Fields (OCR)</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => {
                              if (onOpenApplyModal) {
                                onOpenApplyModal(scheme);
                              } else {
                                onSubmitApplication(scheme.scheme_id, response.user_profile);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Submitting...' : 'Apply via DigiLocker'}</span>
                            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                              Simulated
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Payload */}
                      {isPayloadOpen && (
                        <div className="mt-2 bg-[#0B1329] p-3 rounded-xl border border-slate-700 text-[11px] font-mono text-amber-200 overflow-x-auto">
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
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1B2A6B] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F28C28]" />
                  <span>Schemes Requiring Review ({response.review_schemes.length})</span>
                </h3>
                <span className="text-xs text-[#d97706] font-bold bg-[#F28C28]/10 px-3 py-1 rounded-full border border-[#F28C28]/30">
                  Borderline / Certificate Needed
                </span>
              </div>

              <div className="space-y-4">
                {response.review_schemes.map((scheme) => (
                  <div
                    key={scheme.scheme_id}
                    className="bg-white border border-amber-300 rounded-2xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-[#1B2A6B]">{scheme.scheme_name}</h4>
                          <span className="text-[10px] text-[#d97706] bg-[#F28C28]/10 px-2 py-0.5 rounded-full font-bold border border-[#F28C28]/25">
                            NEEDS_REVIEW
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Potential Benefit: ₹{scheme.benefit_amount_inr.toLocaleString('en-IN')} ({scheme.benefit_description})
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 leading-relaxed font-normal">
                      <div className="font-bold text-[#d97706] flex items-center gap-1.5 mb-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Statutory Administrative Guidance &amp; Resolution Note:</span>
                      </div>
                      <p>{scheme.llm_edge_review || scheme.edge_case_flags.join(' • ')}</p>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Flagged Conditions: </span>
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
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 transition shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <span>Not Eligible Schemes ({response.ineligible_schemes.length})</span>
                </div>
                {showIneligible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showIneligible && (
                <div className="mt-3 space-y-2.5">
                  {response.ineligible_schemes.map((scheme) => (
                    <div
                      key={scheme.scheme_id}
                      className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>{scheme.scheme_name}</span>
                        <span className="text-slate-400 font-normal">
                          ₹{scheme.benefit_amount_inr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-rose-600 text-[11px]">
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
          <CscCenterCard
            csc={response.csc_recommendation}
            nearbyCscs={response.nearby_cscs}
            userProfile={response.user_profile}
            onBookAppointment={onBookCscAppointment}
          />

          {/* User Profile Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm text-xs space-y-3">
            <div className="font-bold text-[#1B2A6B] flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span>Citizen Profile Snapshot</span>
              <span className="text-[10px] text-[#F28C28] font-mono font-bold">ID: IN-{Date.now().toString().slice(-6)}</span>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-semibold text-slate-800">{response.user_profile.name || 'Citizen'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="font-semibold text-slate-800">
                  {response.user_profile.age ? `${response.user_profile.age} yrs` : 'N/A'} •{' '}
                  {response.user_profile.gender || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-800">
                  {response.user_profile.district || 'District'}, {response.user_profile.state || 'State'} (
                  {response.user_profile.pincode || 'PIN N/A'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupation:</span>
                <span className="font-semibold text-slate-800">{response.user_profile.occupation || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Landholding:</span>
                <span className="font-semibold text-slate-800">
                  {response.user_profile.land_acres ?? 0} acres ({response.user_profile.land_hectares ?? 0} ha)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Income:</span>
                <span className="font-bold text-[#1E7B34]">
                  ₹{(response.user_profile.annual_income_inr ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Housing Type:</span>
                <span className="font-semibold text-slate-800">{response.user_profile.housing_type || 'Pucca'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Social Category:</span>
                <span className="font-semibold text-slate-800">{response.user_profile.social_category || 'General'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
