import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  UploadCloud,
  Check,
  Building2,
  Lock,
  ChevronRight,
  FileCheck,
  RefreshCw,
  Loader2,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import { Scheme, UserProfile } from '../types/agent';
import { AuthUser } from '../types/auth';

interface SchemeApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
  profile: UserProfile | null;
  authUser: AuthUser | null;
  onSubmitSuccess: (schemeId: string, profile: UserProfile) => void;
  isSubmitting?: boolean;
}

interface StatutoryDocStatus {
  name: string;
  category: string;
  docNumber: string;
  verifiedViaDigiLocker: boolean;
  manualUploadName?: string;
  verifiedAt?: string;
}

export const SchemeApplicationModal: React.FC<SchemeApplicationModalProps> = ({
  isOpen,
  onClose,
  scheme,
  profile,
  authUser,
  onSubmitSuccess,
  isSubmitting = false,
}) => {
  const [isFetchingDigiLocker, setIsFetchingDigiLocker] = useState<boolean>(false);
  const [allowManualUpload, setAllowManualUpload] = useState<boolean>(false);
  const [hasFetchedDigiLocker, setHasFetchedDigiLocker] = useState<boolean>(false);
  const [declarationAgreed, setDeclarationAgreed] = useState<boolean>(true);

  // Initialize statutory document list
  const defaultDocs: StatutoryDocStatus[] = [
    {
      name: 'Aadhaar Card (UIDAI)',
      category: 'Identity Proof',
      docNumber: 'XXXX-XXXX-4821',
      verifiedViaDigiLocker: false,
    },
    {
      name: 'Land Record / 7/12 Extract',
      category: 'Agricultural Proof',
      docNumber: 'MH/NSK/7-12/2026/8912',
      verifiedViaDigiLocker: false,
    },
    {
      name: 'Income Certificate',
      category: 'Revenue Proof',
      docNumber: 'INC/MH/2026/41029',
      verifiedViaDigiLocker: false,
    },
    {
      name: 'Ration Card / SECC Data',
      category: 'Civil Supplies & Welfare',
      docNumber: 'RC/MH/2025/11904',
      verifiedViaDigiLocker: false,
    },
  ];

  const [docStatuses, setDocStatuses] = useState<StatutoryDocStatus[]>(defaultDocs);

  // Reset or initialize when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Check if user already has verified documents
      const hasDocs = (authUser?.documents?.length ?? 0) > 0 || authUser?.authMethod === 'digilocker';
      if (hasDocs) {
        setHasFetchedDigiLocker(true);
        setDocStatuses(
          defaultDocs.map((doc) => ({
            ...doc,
            verifiedViaDigiLocker: true,
            verifiedAt: new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
          }))
        );
      } else {
        setHasFetchedDigiLocker(false);
        setDocStatuses(defaultDocs);
      }
      setAllowManualUpload(false);
    }
  }, [isOpen, authUser]);

  if (!isOpen || !scheme || !profile) return null;

  // 1-second simulated DigiLocker fetch
  const handleFetchViaDigiLocker = () => {
    setIsFetchingDigiLocker(true);
    setTimeout(() => {
      setIsFetchingDigiLocker(false);
      setHasFetchedDigiLocker(true);
      const timestamp = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      setDocStatuses((prev) =>
        prev.map((doc) => ({
          ...doc,
          verifiedViaDigiLocker: true,
          verifiedAt: timestamp,
        }))
      );
    }, 1000);
  };

  const handleManualUpload = (index: number) => {
    const fakeFileName = `${docStatuses[index].name.split(' ')[0].toLowerCase()}_certified_scan.pdf`;
    setDocStatuses((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        manualUploadName: fakeFileName,
      };
      return updated;
    });
  };

  const allDocumentsSatisfied = docStatuses.every(
    (d) => d.verifiedViaDigiLocker || Boolean(d.manualUploadName)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allDocumentsSatisfied || !declarationAgreed) return;
    onSubmitSuccess(scheme.scheme_id, profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Tricolour Accent Line */}
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Modal Header */}
        <div className="bg-slate-50/90 p-5 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1B2A6B] to-[#1E7B34] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#1E7B34]/15 text-[#1E7B34] border border-[#1E7B34]/30">
                  Direct Benefit Transfer (DBT)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1B2A6B] border border-blue-200">
                  {scheme.nodal_ministry}
                </span>
              </div>
              <h3 className="font-extrabold text-[#1B2A6B] text-lg mt-1">
                {scheme.scheme_name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {scheme.scheme_name_hi || scheme.benefit_description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Benefit Spotlight Card */}
          <div className="bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/70 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Statutory Benefit Sum:
              </span>
              <div className="text-2xl font-black text-[#1E7B34]">
                ₹ {scheme.benefit_amount_inr.toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-600 ml-1.5">
                  ({scheme.benefit_frequency})
                </span>
              </div>
            </div>
            <div className="text-xs sm:text-right text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <span className="font-semibold text-slate-700">Application Mode:</span>
              <div className="font-bold text-[#1B2A6B]">{scheme.application_mode}</div>
            </div>
          </div>

          {/* Citizen Applicant Snapshot */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
              <span className="font-bold text-[#1B2A6B] uppercase tracking-wide text-[11px]">
                Applicant Demographics
              </span>
              <span className="text-[11px] text-slate-500">
                Aadhaar e-KYC: <strong className="text-slate-700">Verified</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
              <div>
                <span className="text-slate-400 text-[10px] block">Citizen Name:</span>
                <span className="font-bold text-slate-800">{profile.name || authUser?.name || 'Citizen'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Location:</span>
                <span className="font-semibold text-slate-800">{profile.district}, {profile.state}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Occupation:</span>
                <span className="font-semibold text-slate-800">{profile.occupation || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Landholding / Income:</span>
                <span className="font-semibold text-slate-800">
                  {profile.land_acres ? `${profile.land_acres} Acres` : `₹${profile.annual_income_inr?.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Document Verification Section (DigiLocker Integration) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-[#1B2A6B]">
                    Statutory Document Verification
                  </h4>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Official DigiLocker
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Attach statutory certificates directly from Government of India DigiLocker gateway.
                </p>
              </div>

              {/* Official DigiLocker Button */}
              <button
                type="button"
                onClick={handleFetchViaDigiLocker}
                disabled={isFetchingDigiLocker || hasFetchedDigiLocker}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0 ${
                  hasFetchedDigiLocker
                    ? 'bg-emerald-50 text-[#1E7B34] border border-emerald-300 cursor-default'
                    : 'bg-[#1E7B34] hover:bg-[#18682B] text-white'
                }`}
              >
                {isFetchingDigiLocker ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying with DigiLocker...</span>
                  </>
                ) : hasFetchedDigiLocker ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#1E7B34]" />
                    <span>All Certificates Linked</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-sm bg-white/20 flex items-center justify-center font-black text-[10px]">
                      DL
                    </div>
                    <span>Fetch via DigiLocker</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulated Fetching Progress Banner */}
            {isFetchingDigiLocker && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 text-xs text-blue-900 animate-fadeIn">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-bold">Contacting National DigiLocker Gateway...</div>
                  <div className="text-[11px] text-blue-700">
                    Validating biometric e-KYC and retrieving tamper-evident digital certificates.
                  </div>
                </div>
              </div>
            )}

            {/* List of 4 Statutory Documents */}
            <div className="space-y-2">
              {docStatuses.map((doc, idx) => {
                const isVerified = doc.verifiedViaDigiLocker;
                const isManual = Boolean(doc.manualUploadName);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isVerified
                        ? 'bg-emerald-50/60 border-emerald-200 shadow-2xs'
                        : isManual
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isVerified
                            ? 'bg-[#1E7B34] text-white shadow-2xs'
                            : isManual
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isVerified ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isManual ? (
                          <FileCheck className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {doc.category}
                          </span>
                        </div>

                        {/* Status Label (Exact requirement string) */}
                        {isVerified ? (
                          <p className="text-[11px] font-bold text-[#1E7B34] mt-0.5 flex items-center gap-1">
                            <span>✓ Verified via DigiLocker (Statutory Digital Certificate)</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              • Ref: {doc.docNumber}
                            </span>
                          </p>
                        ) : isManual ? (
                          <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                            Attached: {doc.manualUploadName} (Manual Upload)
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Pending authentication • Required for statutory disbursement
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Manual Upload trigger if user enables manual fallback */}
                    {allowManualUpload && !isVerified && !isManual && (
                      <button
                        type="button"
                        onClick={() => handleManualUpload(idx)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload PDF/JPG</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Optional Fallback Toggle for Non-Digitized Documents */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowManualUpload}
                  onChange={(e) => setAllowManualUpload(e.target.checked)}
                  className="rounded text-[#1E7B34] focus:ring-[#1E7B34] w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">
                  Upload Manually (PDF/JPG)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Fallback for non-digitized certificates)
                </span>
              </label>

              <span className="text-[11px] text-slate-400 italic">
                DigiLocker certificates do not require physical attestation.
              </span>
            </div>
          </div>

          {/* Statutory Declaration */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={declarationAgreed}
                onChange={(e) => setDeclarationAgreed(e.target.checked)}
                className="rounded text-[#1E7B34] focus:ring-[#1E7B34] w-4 h-4 mt-0.5 cursor-pointer shrink-0"
              />
              <span className="leading-snug">
                I hereby declare that the certificates submitted are genuine and I satisfy all eligibility rules under <strong>{scheme.scheme_name}</strong> guidelines. Any misstatement is subject to recovery under statutory law.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!allDocumentsSatisfied || !declarationAgreed || isSubmitting}
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Submitting to DBT Gateway...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Confirm &amp; Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
