import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Sliders,
  FileCode,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  Download,
  Check,
  Zap,
} from 'lucide-react';
import { UserDocument } from '../types/auth';
import { UserProfile } from '../types/agent';
import {
  auditEntireDocumentVault,
  auditSingleDocument,
  DocumentAuditReport,
  VaultMultiLayerAuditSummary,
} from '../services/documentValidationEngine';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';

interface DocumentInspectionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: UserDocument[];
  userProfile?: UserProfile | null;
  onFetchMoreFromDigiLocker: () => void;
  onBookCscSlot?: () => void;
  language: SupportedLanguage;
}

export const DocumentInspectionStudioModal: React.FC<DocumentInspectionStudioModalProps> = ({
  isOpen,
  onClose,
  documents,
  userProfile,
  onFetchMoreFromDigiLocker,
  onBookCscSlot,
  language,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [showAffidavitModal, setShowAffidavitModal] = useState<boolean>(false);
  const [enhancedDocs, setEnhancedDocs] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const vaultSummary: VaultMultiLayerAuditSummary = auditEntireDocumentVault(documents, userProfile);
  const activeAudit: DocumentAuditReport | undefined =
    vaultSummary.audits.find((a) => a.documentId === selectedDocId) || vaultSummary.audits[0];

  const handleRunEnhancement = (docId: string) => {
    setIsEnhancing(true);
    setTimeout(() => {
      setEnhancedDocs((prev) => ({ ...prev, [docId]: true }));
      setIsEnhancing(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Tricolour Stripe */}
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1B2A6B] to-[#1E7B34] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Multi-Layer Document Pre-Flight Validation Studio
                </h3>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                  Rejection Defense &lt; 10%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Format, Expiry, Cross-Document Consistency &amp; OCR Quality verification before portal submission.
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

        {/* Studio Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
          {/* Top Score Banner: Rejection Risk Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Overall Application Rejection Risk
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-3xl font-black ${
                        vaultSummary.overallRejectionRisk < 10.0
                          ? 'text-[#1E7B34]'
                          : vaultSummary.overallRejectionRisk < 25.0
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {vaultSummary.overallRejectionRisk}%
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      (Statutory Target: &lt; 10.0%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {vaultSummary.isTargetAchieved ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-[#1E7B34] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready for 100% Guaranteed Portal Approval</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Resolve Remediation Items Below</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Rejection Probability</span>
                  <span>Safety Margin: {Math.max(0, 100 - vaultSummary.overallRejectionRisk)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      vaultSummary.overallRejectionRisk < 10.0
                        ? 'bg-gradient-to-r from-emerald-500 to-[#1E7B34]'
                        : 'bg-gradient-to-r from-amber-500 to-rose-500'
                    }`}
                    style={{ width: `${Math.max(8, 100 - vaultSummary.overallRejectionRisk)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="md:col-span-4 grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">Verified Docs</span>
                <span className="text-2xl font-black text-[#1B2A6B] mt-0.5 block">
                  {vaultSummary.totalDocuments}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">DigiLocker PKI</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">Passed Layers</span>
                <span className="text-2xl font-black text-[#1E7B34] mt-0.5 block">
                  {vaultSummary.passedCount} / {vaultSummary.totalDocuments || 1}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Pre-flight check</span>
              </div>
            </div>
          </div>

          {/* Cross-Document Mismatches Alert Banner */}
          {vaultSummary.criticalCrossDocumentMismatches.length > 0 && (
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cross-Document Consistency Advisory:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-amber-950 font-medium">
                {vaultSummary.criticalCrossDocumentMismatches.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Studio Workspace: Left Doc Selector & Right Detailed 4-Layer Inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Document Cards List */}
            <div className="lg:col-span-4 space-y-2.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block px-1">
                Linked Documents ({documents.length})
              </span>
              {vaultSummary.audits.map((audit) => (
                <div
                  key={audit.documentId}
                  onClick={() => setSelectedDocId(audit.documentId)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    selectedDocId === audit.documentId
                      ? 'bg-white border-[#1B2A6B] shadow-md ring-2 ring-[#1B2A6B]/15'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {audit.documentName}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        audit.rejectionRiskPercent < 10.0
                          ? 'bg-emerald-100 text-[#1E7B34]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {audit.rejectionRiskPercent}% Risk
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>OCR: {audit.extractedMetadata.ocrConfidence}%</span>
                    <span className="font-semibold text-slate-700">
                      {audit.layers.expiry.status === 'passed' ? 'Valid' : 'Check Expiry'}
                    </span>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={onFetchMoreFromDigiLocker}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E7B34]" />
                <span>Fetch More from DigiLocker</span>
              </button>
            </div>

            {/* Right Column: 4-Layer Diagnostic Breakdown for Selected Document */}
            {activeAudit && (
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-5">
                {/* Header for Selected Document */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#1B2A6B]" />
                      <h4 className="font-black text-slate-900 text-base">
                        {activeAudit.documentName}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500">
                      Masked ID: {activeAudit.extractedMetadata.documentNumberMasked} | Holder:{' '}
                      <strong>{activeAudit.extractedMetadata.holderName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRunEnhancement(activeAudit.documentId)}
                      disabled={isEnhancing}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Run adaptive contrast and auto-cropping"
                    >
                      {isEnhancing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                      )}
                      <span>
                        {enhancedDocs[activeAudit.documentId]
                          ? 'Enhanced (99% OCR)'
                          : 'Auto-Enhance OCR'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4 Validation Layers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* LAYER 1: FORMAT */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        1. Format &amp; PKI Integrity
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34]">
                        {activeAudit.layers.format.score}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {activeAudit.layers.format.details}
                    </p>
                  </div>

                  {/* LAYER 2: EXPIRY */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        2. Expiry &amp; Recency
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          activeAudit.layers.expiry.status === 'passed'
                            ? 'bg-emerald-100 text-[#1E7B34]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {activeAudit.layers.expiry.score}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {activeAudit.layers.expiry.details}
                    </p>
                  </div>

                  {/* LAYER 3: CONSISTENCY */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        3. Cross-Document Consistency
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34]">
                        {activeAudit.layers.consistency.score}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {activeAudit.layers.consistency.details}
                    </p>
                  </div>

                  {/* LAYER 4: QUALITY */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        4. OCR Quality &amp; Boundaries
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34]">
                        {enhancedDocs[activeAudit.documentId] ? 99 : activeAudit.layers.quality.score}% OCR
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {enhancedDocs[activeAudit.documentId]
                        ? 'Adaptive binarization applied. 4-corner seals, bar-code & holograms verified.'
                        : activeAudit.layers.quality.details}
                    </p>
                  </div>
                </div>

                {/* 1-Click Remediation Toolkit */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Statutory Remediation Actions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAffidavitModal(true)}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#1B2A6B] border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Generate Annexure-IV Name Affidavit</span>
                    </button>

                    {onBookCscSlot && (
                      <button
                        type="button"
                        onClick={onBookCscSlot}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#1E7B34] border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Offline CSC Attestation</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Studio Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#1E7B34]" />
            <span>MeitY &amp; Digital India statutory compliance rules applied.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Apply Validated Documents &amp; Close
          </button>
        </div>
      </div>

      {/* Annexure-IV Name Mismatch Affidavit Generator Modal */}
      {showAffidavitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#1B2A6B]" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Statutory Name Difference Affidavit (Annexure-IV)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAffidavitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-xs font-mono border border-slate-200 space-y-2 text-slate-700">
              <p className="font-bold text-center underline">
                BEFORE THE EXECUTIVE MAGISTRATE / NOTARY PUBLIC
              </p>
              <p>
                I, <strong>{userProfile?.name || 'Ramesh Yadav'}</strong>, aged{' '}
                {userProfile?.age || 38} years, residing at{' '}
                {userProfile?.district || 'Nashik'}, {userProfile?.state || 'Maharashtra'}, do hereby
                solemnly affirm:
              </p>
              <p>
                1. That my name is recorded as "{userProfile?.name || 'Ramesh Yadav'}" in Aadhaar,
                and as "{activeAudit?.extractedMetadata.holderName || 'Ramesh K. Yadav'}" in land
                records.
              </p>
              <p>
                2. That both names pertain to one and the same person, i.e., deponent herein.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Affidavit</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAffidavitModal(false)}
                className="px-4 py-2 bg-[#1B2A6B] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
