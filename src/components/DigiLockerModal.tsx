import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  Lock,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { AuthUser, UserDocument } from '../types/auth';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';
import { getDigiLockerProvider, isSimulatedMode, isLiveMode, DIGILOCKER_MODE } from '../digilocker';

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: (reason?: string) => void;
  onSuccess: (user: AuthUser) => void;
  language: SupportedLanguage;
}

const AVAILABLE_DOCS = [
  {
    id: 'aadhaar',
    nameKey: 'docAadhaar' as const,
    displayName: 'Aadhaar Card (Masked)',
    type: 'Identity',
    docNumberMasked: 'XXXX XXXX 4821',
    issuedBy: 'Unique Identification Authority of India (UIDAI)',
  },
  {
    id: 'income',
    nameKey: 'docIncome' as const,
    displayName: 'Income Certificate (Verified ₹80,000)',
    type: 'Revenue',
    docNumberMasked: 'INC/MH/2026/89412',
    issuedBy: 'Revenue & Forest Department, Govt. of Maharashtra',
  },
  {
    id: 'caste',
    nameKey: 'docCaste' as const,
    displayName: 'Caste Certificate (OBC)',
    type: 'Social',
    docNumberMasked: 'CST/MH/2024/51203',
    issuedBy: 'Sub-Divisional Officer (SDO), Nashik',
  },
  {
    id: 'land',
    nameKey: 'docLand' as const,
    displayName: 'Land Record (7/12 Extract, Verified 2.0 Acres)',
    type: 'Agriculture',
    docNumberMasked: 'MH/NSK/7-12/2024/9182',
    issuedBy: 'Mahabhulekh / Revenue Department, Maharashtra',
  },
  {
    id: 'marksheet',
    nameKey: 'docMarksheet' as const,
    displayName: 'Class XII Marksheet',
    type: 'Education',
    docNumberMasked: 'HSC/2004/774129',
    issuedBy: 'Maharashtra State Board of Secondary & Higher Secondary Education',
  },
];

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Flow stages: 1: 'connecting' -> 2: 'consent' -> 3: 'fetching' -> 4: 'completed'
  const [stage, setStage] = useState<'connecting' | 'consent' | 'fetching' | 'completed'>('connecting');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(AVAILABLE_DOCS.map((d) => d.id));
  const [fetchedDocIndex, setFetchedDocIndex] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setStage('connecting');
      setFetchedDocIndex(0);
      return;
    }

    // Step 1: Connecting spinner for 1.2 seconds
    setStage('connecting');
    const timer = setTimeout(() => {
      setStage('consent');
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Step 3: Fetching documents tick animation (350ms each)
  useEffect(() => {
    if (stage !== 'fetching') return;

    if (fetchedDocIndex < selectedDocIds.length) {
      const timer = setTimeout(() => {
        setFetchedDocIndex((prev) => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      // Completed fetching all selected docs!
      const timer = setTimeout(() => {
        setStage('completed');
        // Retrieve profile & documents via active provider (Simulated vs Live)
        const provider = getDigiLockerProvider();
        provider.handleCallback({ code: 'modal_success' }).then((result) => {
          const docs: UserDocument[] = AVAILABLE_DOCS.filter((d) => selectedDocIds.includes(d.id)).map((d) => {
            const fetched = result.documents.find((doc) => doc.type === d.type || doc.name.toLowerCase().includes(d.id));
            return {
              id: d.id,
              type: d.type,
              name: d.displayName || t[d.nameKey] || d.id,
              status: isSimulatedMode() ? 'VERIFIED_SIMULATED' : 'VERIFIED',
              issuedBy: d.issuedBy,
              fetchedAt: new Date().toISOString(),
              docNumberMasked: fetched?.docNumberMasked || d.docNumberMasked,
            };
          });

          const authenticatedUser: AuthUser = {
            name: result.profile.name,
            mobile: '9876543210',
            language,
            authMethod: 'digilocker',
            aadhaar_masked: result.profile.aadhaarMasked,
            documents: docs,
            profile: {
              name: result.profile.name,
              age: 38,
              gender: result.profile.gender as any,
              state: result.profile.state,
              district: result.profile.district,
              pincode: result.profile.pin,
              occupation: 'Farmer',
              land_acres: 2.0,
              land_hectares: 0.8094,
              has_land_ownership: true,
              annual_income_inr: 80000,
              social_category: 'OBC',
              housing_type: 'Kutcha',
              is_taxpayer: false,
              is_govt_employee: false,
              has_pension_above_10k: false,
              is_shg_member: false,
              is_student: false,
              preferred_language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English',
            },
          };

          setTimeout(() => {
            onSuccess(authenticatedUser);
          }, 600);
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [stage, fetchedDocIndex, selectedDocIds, language, onSuccess, t]);

  if (!isOpen) return null;

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAllow = () => {
    setFetchedDocIndex(0);
    setStage('fetching');
  };

  const handleDeny = () => {
    onClose(t.digiDeniedMsg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white border border-slate-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0 text-slate-800">
        {/* Top Mode Ribbon: "Simulated" vs "Connected to DigiLocker" */}
        {isSimulatedMode() ? (
          <div className="bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest text-center py-1 px-4 shadow-xs">
            Simulated • {t.simulatedRibbon}
          </div>
        ) : (
          <div className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest text-center py-1 px-4 shadow-xs flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Connected to DigiLocker • Official Government Gateway</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#1B2A6B] text-base tracking-tight">DigiLocker</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSimulatedMode()
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-[#1E7B34] border-emerald-200'
                }`}>
                  {isSimulatedMode() ? 'Simulated' : 'Connected to DigiLocker'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">National Digital Document Gateway</p>
            </div>
          </div>

          {stage !== 'fetching' && stage !== 'completed' && (
            <button
              type="button"
              onClick={() => onClose()}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body based on stage */}
        <div className="p-6">
          {stage === 'connecting' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold text-[#1B2A6B] text-base">{t.digiConnecting}</h4>
                <p className="text-xs text-slate-500">Establishing encrypted handshake with UIDAI &amp; State Registries...</p>
              </div>
            </div>
          )}

          {stage === 'consent' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="font-bold text-[#1B2A6B] text-base leading-snug">{t.digiConsentTitle}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t.digiPurpose}</p>
              </div>

              {/* Checkbox Document List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_DOCS.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <label
                      key={doc.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDoc(doc.id)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-[#1B2A6B] flex items-center justify-between">
                          <span>{t[doc.nameKey] || doc.id}</span>
                          <span className="font-mono text-[10px] text-slate-500 font-normal">
                            {doc.docNumberMasked}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.issuedBy}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#1E7B34] shrink-0" />
                <span>Encrypted 256-bit authentication. Only metadata is utilized for statutory rule evaluation.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDeny}
                  className="px-5 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  {t.deny}
                </button>
                <button
                  type="button"
                  onClick={handleAllow}
                  disabled={selectedDocIds.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <span>{t.allow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {stage === 'fetching' && (
            <div className="space-y-5 py-4">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-[#1B2A6B] text-base">{t.digiFetching}</h4>
                <p className="text-xs text-slate-500">Retrieving digital signatures from central repositories...</p>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {AVAILABLE_DOCS.filter((d) => selectedDocIds.includes(d.id)).map((doc, idx) => {
                  const isDone = idx < fetchedDocIndex;
                  const isCurrent = idx === fetchedDocIndex;

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/60 last:border-0"
                    >
                      <span className="font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>{t[doc.nameKey] || doc.id}</span>
                      </span>

                      {isDone && (
                        <span className="flex items-center gap-1 font-bold text-[#1E7B34] text-[11px] animate-fadeIn">
                          <Check className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}

                      {isCurrent && (
                        <span className="flex items-center gap-1 font-bold text-blue-600 text-[11px]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Fetching...</span>
                        </span>
                      )}

                      {!isDone && !isCurrent && (
                        <span className="text-slate-400 text-[11px]">Queued</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stage === 'completed' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1E7B34] flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-[#1B2A6B] text-base">{t.digiSuccess}</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Welcome Ramesh Patil! Your demographic profile has been prefilled into SchemeSetu.
              </p>
            </div>
          )}
        </div>

        {/* Footer disclaimer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
          {t.honestDisclaimer}
        </div>
      </div>
    </div>
  );
};
