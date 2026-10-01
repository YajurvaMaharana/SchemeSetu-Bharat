import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CitizenInput } from './components/CitizenInput';
import { AgentTelemetry } from './components/AgentTelemetry';
import { SchemeResults } from './components/SchemeResults';
import { DemoControls } from './components/DemoControls';
import { ActionPackModal } from './components/ActionPackModal';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { AgentEvent, AgentResponse, UserProfile, Scheme } from './types/agent';
import { evaluateAllSchemes, normalizeProfile } from './services/rulesEngine';
import { findCsc, mockPortalSubmission } from './services/cscLocator';
import { generateFallbackEdgeReview, generateFallbackSummary, heuristicExtractProfile } from './services/heuristicExtractor';
import { X, ShieldCheck, Lock } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'mr' | 'en'>('hi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
  const [demoPacing, setDemoPacing] = useState<boolean>(true);
  const [useCachedDemo, setUseCachedDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [agentResult, setAgentResult] = useState<AgentResponse | null>(null);

  // Modals
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any | null>(null);
  const [submittingSchemeId, setSubmittingSchemeId] = useState<string | null>(null);

  // Sleep helper for demo pacing
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const scrollToCitizenInput = () => {
    const el = document.getElementById('citizen-input-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSchemeFromDashboard = (scheme: Scheme) => {
    // Smooth scroll down to input and set sample or context
    scrollToCitizenInput();
  };

  const runAgentWorkflow = async (input: {
    query?: string;
    profile?: Partial<UserProfile>;
    language: string;
  }) => {
    setIsLoading(true);
    setEvents([]);
    setAgentResult(null);

    const accumulatedEvents: AgentEvent[] = [];
    const emitEvent = async (
      step: string,
      status: 'STARTING' | 'IN_PROGRESS' | 'COMPLETED' | 'WARNING' | 'ERROR',
      message: string,
      data?: any,
      simulated: boolean = false
    ) => {
      const ev: AgentEvent = {
        step,
        status,
        message,
        data: data || null,
        simulated,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      accumulatedEvents.push(ev);
      setEvents([...accumulatedEvents]);
      if (demoPacing) {
        await sleep(350);
      }
    };

    try {
      if (!useCachedDemo) {
        // Try calling server API
        try {
          const res = await fetch('/api/agent/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });
          if (res.ok) {
            const data: AgentResponse = await res.json();
            // Replay events with pacing
            for (const ev of data.events) {
              accumulatedEvents.push(ev);
              setEvents([...accumulatedEvents]);
              if (demoPacing) await sleep(300);
            }
            setAgentResult(data);
            setIsLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('API endpoint unavailable, running client-side agent engine:', apiErr);
        }
      }

      // Client-Side Deterministic Agent Execution
      // Stage 1: UNDERSTAND
      await emitEvent(
        'PROFILE_EXTRACTION',
        'STARTING',
        'Analyzing citizen query and extracting demographic attributes...'
      );

      let profile: UserProfile;
      if (input.profile) {
        profile = normalizeProfile(input.profile);
      } else if (input.query) {
        profile = heuristicExtractProfile(input.query);
      } else {
        profile = normalizeProfile({});
      }
      profile.preferred_language = input.language === 'hi' ? 'Hindi' : input.language === 'mr' ? 'Marathi' : 'English';

      await emitEvent(
        'PROFILE_EXTRACTION',
        'COMPLETED',
        `Profile extracted: Age=${profile.age ?? 'N/A'}, Occupation=${profile.occupation ?? 'General'}, Land=${profile.land_hectares ?? 0} ha (${profile.land_acres ?? 0} acres), Income=₹${(profile.annual_income_inr ?? 0).toLocaleString('en-IN')}`,
        profile
      );

      // Stage 2: REASON
      await emitEvent(
        'DETERMINISTIC_RULES',
        'STARTING',
        'Evaluating statutory eligibility rules against knowledge base...'
      );

      const { eligible, review, ineligible } = evaluateAllSchemes(profile);

      await emitEvent(
        'DETERMINISTIC_RULES',
        'COMPLETED',
        `Deterministic verification complete: ${eligible.length} eligible, ${review.length} require review, ${ineligible.length} not eligible.`,
        {
          eligible_ids: eligible.map((s) => s.scheme_id),
          review_ids: review.map((s) => s.scheme_id),
          ineligible_ids: ineligible.map((s) => s.scheme_id),
        }
      );

      // Stage 3: EDGE CASE REVIEW
      let updatedReview = review;
      if (review.length > 0) {
        await emitEvent(
          'EDGE_CASE_REVIEW',
          'STARTING',
          `Reviewing ${review.length} schemes flagged with edge conditions...`
        );

        updatedReview = review.map((r) => {
          if (!r.llm_edge_review) {
            r.llm_edge_review = generateFallbackEdgeReview(r.scheme_name, r.edge_case_flags);
          }
          return r;
        });

        await emitEvent(
          'EDGE_CASE_REVIEW',
          'COMPLETED',
          'Edge case reviews formulated with statutory document resolution paths.',
          { reviewed_schemes: updatedReview.map((s) => s.scheme_id) }
        );
      } else {
        await emitEvent(
          'EDGE_CASE_REVIEW',
          'COMPLETED',
          'No borderline edge cases flagged; all statutory criteria clean.'
        );
      }

      // Stage 4: PLAN & RANK
      const totalBenefit = eligible.reduce((acc, s) => acc + s.benefit_amount_inr, 0);
      await emitEvent(
        'SCHEME_RANKING',
        'COMPLETED',
        `Schemes ranked by benefit: ₹${totalBenefit.toLocaleString('en-IN')} in potential welfare capital unlocked.`,
        {
          total_benefit_inr: totalBenefit,
          top_scheme: eligible[0]?.scheme_name ?? null,
        }
      );

      // Stage 5: CSC LOCATOR
      await emitEvent(
        'CSC_LOCATOR',
        'STARTING',
        'Querying geolocation directory for nearest Common Service Centre...',
        null,
        true
      );

      const cscInfo = findCsc(profile.district, profile.pincode, profile.state);
      await emitEvent(
        'CSC_LOCATOR',
        'COMPLETED',
        `Located nearest CSC desk: ${cscInfo.name} (${cscInfo.distance_km ?? 1.5} km away).`,
        cscInfo,
        true
      );

      // Stage 6: DELIVER
      await emitEvent(
        'EXPLANATION_GENERATION',
        'STARTING',
        'Generating personalized action plan and vernacular explanations...'
      );

      const summaryText = generateFallbackSummary(profile, eligible, updatedReview);
      await emitEvent(
        'EXPLANATION_GENERATION',
        'COMPLETED',
        'Action plan and document checklist compiled.'
      );

      await emitEvent(
        'DELIVER',
        'COMPLETED',
        `Execution successful: ${eligible.length} eligible welfare schemes delivered.`,
        { total_benefit_inr: totalBenefit, eligible_count: eligible.length }
      );

      const finalResponse: AgentResponse = {
        user_profile: profile,
        eligible_schemes: eligible,
        review_schemes: updatedReview,
        ineligible_schemes: ineligible,
        total_potential_benefit_inr: totalBenefit,
        summary_text: summaryText,
        vernacular_summary: summaryText,
        csc_recommendation: cscInfo,
        events: accumulatedEvents,
        used_fallback: true,
      };

      setAgentResult(finalResponse);
    } catch (err: any) {
      console.error('Execution error:', err);
      await emitEvent('DELIVER', 'ERROR', `Execution failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySubmission = async (schemeId: string, profile: UserProfile) => {
    setSubmittingSchemeId(schemeId);
    try {
      const res = await fetch('/api/agent/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheme_id: schemeId, user_profile: profile }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissionReceipt(data);
        return;
      }
    } catch (e) {
      // Fallback
    }

    // Client fallback
    const localReceipt = mockPortalSubmission(schemeId, profile);
    setSubmissionReceipt(localReceipt);
    setSubmittingSchemeId(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-[#374151]'} flex flex-col font-sans transition-colors duration-200`}>
      <Header
        onReset={() => {
          setAgentResult(null);
          setEvents([]);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onSignInClick={() => setIsSignInModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        {/* NEW DASHBOARD SECTION: Hero Row + 4-Slide Auto Carousel + Flagship Cards */}
        <Dashboard
          onGetStarted={scrollToCitizenInput}
          onSelectScheme={handleSelectSchemeFromDashboard}
          searchFilter={searchQuery}
        />

        {/* Demo Controls Bar */}
        <DemoControls
          demoPacing={demoPacing}
          onToggleDemoPacing={setDemoPacing}
          useCachedDemo={useCachedDemo}
          onToggleUseCachedDemo={setUseCachedDemo}
        />

        {/* Citizen Input vs Live Telemetry Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <CitizenInput
              onRunAgent={runAgentWorkflow}
              isLoading={isLoading}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
          <div className="lg:col-span-6">
            <AgentTelemetry events={events} isLoading={isLoading} />
          </div>
        </div>

        {/* Welfare Discovery Results */}
        {agentResult && (
          <SchemeResults
            response={agentResult}
            selectedLanguage={selectedLanguage}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onSubmitApplication={handleApplySubmission}
            submittingSchemeId={submittingSchemeId}
          />
        )}
      </main>

      {/* Official Government Portal Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1B2A6B]">SchemeSetu Bharat</span>
            <span>•</span>
            <span>Apni Yojana, Apna Haq</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <span>#GOVERNMENTSCHEMES</span>
            <span>/</span>
            <span>#SCHEMESFORYOU</span>
            <span>/</span>
            <span>#DIGITALINDIA</span>
          </div>
        </div>
      </footer>

      {/* Action Pack PDF Modal */}
      {isPdfModalOpen && (
        <ActionPackModal
          response={agentResult}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* Submission Success Modal */}
      {submissionReceipt && (
        <SubmissionSuccessModal
          receipt={submissionReceipt}
          onClose={() => {
            setSubmissionReceipt(null);
            setSubmittingSchemeId(null);
          }}
        />
      )}

      {/* Simulation Sign-in Modal (MeriPehchan / DigiLocker / Aadhaar OTP) */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-0 text-slate-800">
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F28C28]/15 text-[#F28C28] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1B2A6B] text-sm">Citizen Single Sign-On</h3>
                  <p className="text-[11px] text-slate-500">MeriPehchan / DigiLocker Integration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignInModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Log in via your verified Aadhaar or DigiLocker profile for instantaneous pre-filled applications.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsSignInModalOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold transition shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Continue with MeriPehchan (SSO)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSignInModalOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition cursor-pointer"
                >
                  <span>Continue as Guest Citizen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
