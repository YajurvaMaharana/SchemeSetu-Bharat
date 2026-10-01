import React, { useState } from 'react';
import { Header } from './components/Header';
import { CitizenInput } from './components/CitizenInput';
import { AgentTelemetry } from './components/AgentTelemetry';
import { SchemeResults } from './components/SchemeResults';
import { DemoControls } from './components/DemoControls';
import { ActionPackModal } from './components/ActionPackModal';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { AgentEvent, AgentResponse, UserProfile } from './types/agent';
import { evaluateAllSchemes, normalizeProfile } from './services/rulesEngine';
import { findCsc, mockPortalSubmission } from './services/cscLocator';
import { generateFallbackEdgeReview, generateFallbackSummary, heuristicExtractProfile } from './services/heuristicExtractor';

export const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'mr' | 'en'>('hi');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        onReset={() => {
          setAgentResult(null);
          setEvents([]);
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        {/* Hackathon Demo Controls Banner */}
        <DemoControls
          demoPacing={demoPacing}
          onToggleDemoPacing={setDemoPacing}
          useCachedDemo={useCachedDemo}
          onToggleUseCachedDemo={setUseCachedDemo}
        />

        {/* Top Split: Citizen Input vs Live Telemetry */}
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

        {/* Discovery Results View */}
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

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>SchemeSetu Bharat — Autonomous Welfare Discovery & Application Agent for Bharat</div>
          <div className="flex items-center gap-3">
            <span>Deterministic Python/TypeScript Rules Engine</span>
            <span>•</span>
            <span>Simulated CSC & DBT Submission</span>
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
    </div>
  );
};
