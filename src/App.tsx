import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CitizenInput } from './components/CitizenInput';
import { AgentTelemetry } from './components/AgentTelemetry';
import { SchemeResults } from './components/SchemeResults';
import { DemoControls } from './components/DemoControls';
import { ActionPackModal } from './components/ActionPackModal';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { SignInPage } from './components/SignInPage';
import { SignUpPage } from './components/SignUpPage';
import { DigiLockerModal } from './components/DigiLockerModal';
import { DocumentVaultModal } from './components/DocumentVaultModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CitizenProfileSetupPage } from './components/CitizenProfileSetupPage';
import { SchemeApplicationModal } from './components/SchemeApplicationModal';
import { AgentEvent, AgentResponse, UserProfile, Scheme } from './types/agent';
import { AuthState, AuthUser } from './types/auth';
import { SupportedLanguage, TRANSLATIONS } from './data/translations';
import { evaluateAllSchemes, normalizeProfile } from './services/rulesEngine';
import { findCsc, mockPortalSubmission } from './services/cscLocator';
import { generateFallbackEdgeReview, generateFallbackSummary, heuristicExtractProfile } from './services/heuristicExtractor';
import { X, ShieldCheck, Lock, LogIn, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'schemesetu_user';

export const App: React.FC = () => {
  // Routing state based on window.location.hash
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  // Global Auth State
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) {
          return { status: 'signedIn', user: parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to load auth state from localStorage:', e);
    }
    return { status: 'guest', user: null };
  });

  // Language & UI Controls
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    if (authState.user?.language) return authState.user.language;
    return 'hi';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [demoPacing, setDemoPacing] = useState<boolean>(true);
  const [useCachedDemo, setUseCachedDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [agentResult, setAgentResult] = useState<AgentResponse | null>(null);

  // Modals & Drawers
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any | null>(null);
  const [submittingSchemeId, setSubmittingSchemeId] = useState<string | null>(null);

  // Guest banner dismissal for session
  const [isGuestBannerDismissed, setIsGuestBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('schemesetu_dismiss_guest_banner') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissGuestBanner = () => {
    setIsGuestBannerDismissed(true);
    try {
      sessionStorage.setItem('schemesetu_dismiss_guest_banner', 'true');
    } catch {
      // Ignore
    }
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSchemeForApplication, setSelectedSchemeForApplication] = useState<Scheme | null>(null);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  // Listen to hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentRoute(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Handlers
  const handleAuthSuccess = (user: AuthUser) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user to localStorage:', e);
    }
    setAuthState({ status: 'signedIn', user });
    if (user.language) {
      setSelectedLanguage(user.language);
    }
    setIsDigiLockerOpen(false);
    // Smoothly redirect to citizen profile setup / selection screen
    navigateTo('#/profile-setup');
    showToast(
      user.authMethod === 'google'
        ? `Signed in with Google. Review and confirm your citizen profile.`
        : user.authMethod === 'digilocker'
        ? 'Signed in with DigiLocker. Review prefilled profile.'
        : `Signed in as ${user.name}. Review citizen demographic profile.`
    );
  };

  const handleProfileSetupConfirm = async (profile: UserProfile) => {
    if (authState.user) {
      const updatedUser: AuthUser = {
        ...authState.user,
        name: profile.name || authState.user.name,
        profile,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('Failed to save updated user profile:', e);
      }
      setAuthState({ status: 'signedIn', user: updatedUser });
    }

    navigateTo('#/');
    showToast(`Profile confirmed! Evaluating welfare schemes for ${profile.name}...`);
    await handleExecutePipeline(profile);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove auth key from localStorage:', e);
    }
    setAuthState({ status: 'guest', user: null });
    navigateTo('#/');
    showToast('Signed out. Continuing as guest citizen.');
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    if (authState.user) {
      const updatedUser = { ...authState.user, language: lang };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (e) {
        // Ignore
      }
      setAuthState({ ...authState, user: updatedUser });
    }
  };

  const handleUpdateUser = (updatedUser: AuthUser) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Failed to save updated user to localStorage:', e);
    }
    setAuthState({ status: 'signedIn', user: updatedUser });
    showToast('Profile updated successfully.');
  };

  // Sleep helper for demo pacing
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const scrollToCitizenInput = () => {
    const el = document.getElementById('citizen-input-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSchemeFromDashboard = (scheme: Scheme) => {
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
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#1B2A6B] text-white text-xs font-bold rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-300 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Header */}
      <Header
        onReset={() => {
          navigateTo('#/');
          setAgentResult(null);
          setEvents([]);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onSignInClick={() => navigateTo('#/signin')}
        authState={authState}
        onSignOut={handleSignOut}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenDocuments={() => setIsDocumentsModalOpen(true)}
        isAuthRoute={currentRoute === '#/signin' || currentRoute === '#/signup' || currentRoute === '#/profile-setup'}
      />

      {/* VIEW ROUTING: #/signin, #/signup, #/profile-setup, or #/ (Dashboard & Main App) */}
      {currentRoute === '#/signin' ? (
        <div className="flex-1 animate-fadeIn">
          <SignInPage
            onSuccess={handleAuthSuccess}
            onOpenDigiLocker={() => setIsDigiLockerOpen(true)}
            onNavigateSignUp={() => navigateTo('#/signup')}
            onContinueGuest={() => navigateTo('#/')}
            language={selectedLanguage}
            onShowToast={showToast}
          />
        </div>
      ) : currentRoute === '#/signup' ? (
        <div className="flex-1 animate-fadeIn">
          <SignUpPage
            onSuccess={handleAuthSuccess}
            onOpenDigiLocker={() => setIsDigiLockerOpen(true)}
            onNavigateSignIn={() => navigateTo('#/signin')}
            onContinueGuest={() => navigateTo('#/')}
            language={selectedLanguage}
            onShowToast={showToast}
          />
        </div>
      ) : currentRoute === '#/profile-setup' ? (
        <div className="flex-1 animate-fadeIn">
          <CitizenProfileSetupPage
            user={
              authState.user || {
                name: 'Citizen Applicant',
                email: 'valentinine14feb@gmail.com',
                language: selectedLanguage,
                authMethod: 'google',
                documents: [],
                profile: {
                  name: 'Citizen Applicant',
                  state: 'Maharashtra',
                  district: 'Nashik',
                  occupation: 'Farmer',
                  age: 38,
                  land_acres: 1.5,
                  annual_income_inr: 120000,
                  housing_type: 'Kutcha',
                  social_category: 'OBC',
                },
              }
            }
            onConfirmProfile={handleProfileSetupConfirm}
            onSkip={() => navigateTo('#/')}
            language={selectedLanguage}
          />
        </div>
      ) : (
        /* Default Dashboard & Autonomous Discovery App View (#/) */
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full animate-fadeIn">
          {/* Guest Citizen Callout Banner */}
          {authState.status === 'guest' && !isGuestBannerDismissed && (
            <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#F28C28] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1B2A6B] block">
                    {t.guestBannerText}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Use simulated DigiLocker or Mobile OTP to link land records and instant filing kits.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigateTo('#/signin')}
                  className="px-4 py-2 bg-[#1E7B34] hover:bg-[#18682B] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {t.guestBannerAction}
                </button>
                <button
                  type="button"
                  onClick={handleDismissGuestBanner}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                  title="Dismiss for session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* DASHBOARD SECTION: Hero Row + 4-Slide Auto Carousel + Flagship Cards */}
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
                onLanguageChange={handleLanguageChange}
                prefilledProfile={authState.user?.profile}
                isSignedIn={authState.status === 'signedIn'}
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
              onOpenApplyModal={(scheme) => setSelectedSchemeForApplication(scheme)}
            />
          )}
        </main>
      )}

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

      {/* Scheme Application Modal with DigiLocker Document Verification */}
      <SchemeApplicationModal
        isOpen={Boolean(selectedSchemeForApplication)}
        onClose={() => setSelectedSchemeForApplication(null)}
        scheme={selectedSchemeForApplication}
        profile={agentResult?.user_profile || (authState.user?.profile as UserProfile) || null}
        authUser={authState.user}
        onSubmitSuccess={(schemeId, prof) => {
          setSelectedSchemeForApplication(null);
          handleApplySubmission(schemeId, prof);
        }}
        isSubmitting={Boolean(submittingSchemeId)}
      />

      {/* Shared Simulated DigiLocker Modal */}
      <DigiLockerModal
        isOpen={isDigiLockerOpen}
        onClose={(reason) => {
          setIsDigiLockerOpen(false);
          if (reason) showToast(reason);
        }}
        onSuccess={handleAuthSuccess}
        language={selectedLanguage}
      />

      {/* Document Vault Drawer/Modal */}
      <DocumentVaultModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        documents={authState.user?.documents || []}
        onFetchMoreFromDigiLocker={() => {
          setIsDocumentsModalOpen(false);
          setIsDigiLockerOpen(true);
        }}
        language={selectedLanguage}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={authState.user}
        onUpdateUser={handleUpdateUser}
        language={selectedLanguage}
      />

      {/* Action Pack PDF Modal */}
      {isPdfModalOpen && (
        <ActionPackModal
          response={agentResult}
          onClose={() => setIsPdfModalOpen(false)}
          authUser={authState.user}
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
          authUser={authState.user}
        />
      )}
    </div>
  );
};
