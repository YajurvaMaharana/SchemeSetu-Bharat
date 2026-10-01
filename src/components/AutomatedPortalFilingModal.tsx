import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Scan,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Laptop,
  Check,
  Play,
  RotateCcw,
  Zap,
  Printer,
  Copy,
  Lock,
  Globe,
  Loader2,
  Building2,
  User,
  Landmark,
  Layers,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  SAMPLE_OCR_DOCUMENTS,
  PORTAL_26_FIELDS,
  OCRDocumentSample,
  PortalField,
} from '../data/ocrSamplesData';
import { UserProfile, Scheme } from '../types/agent';
import { AuthUser } from '../types/auth';

interface AutomatedPortalFilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme?: Scheme | null;
  userProfile?: UserProfile | null;
  authUser?: AuthUser | null;
  onApplicationConfirmed?: (applicationId: string, receiptData: any) => void;
}

export const AutomatedPortalFilingModal: React.FC<AutomatedPortalFilingModalProps> = ({
  isOpen,
  onClose,
  scheme,
  userProfile,
  authUser,
  onApplicationConfirmed,
}) => {
  // Stages: 1 = 'ocr_extraction', 2 = 'portal_filling', 3 = 'confirmed_id'
  const [currentStage, setCurrentStage] = useState<'ocr_extraction' | 'portal_filling' | 'confirmed_id'>('ocr_extraction');

  // OCR state
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  // Portal filling state
  const [filledFieldCount, setFilledFieldCount] = useState<number>(0);
  const [isAutomating, setIsAutomating] = useState<boolean>(false);
  const [automationSpeed, setAutomationSpeed] = useState<'normal' | 'fast' | 'instant'>('normal');

  // Confirmed Receipt state
  const [applicationId, setApplicationId] = useState<string>('PMK-MH-2026-8941203');
  const [acknowledgementNo, setAcknowledgementNo] = useState<string>('ACK-DBT-2026-091482');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const selectedDoc: OCRDocumentSample = SAMPLE_OCR_DOCUMENTS[selectedDocIndex] || SAMPLE_OCR_DOCUMENTS[0];

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStage('ocr_extraction');
      setSelectedDocIndex(0);
      setIsScanning(true);
      setFilledFieldCount(0);
      setIsAutomating(false);

      // Generate a dynamic unique application ID based on timestamp
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      setApplicationId(`PMK-MH-2026-${randomSuffix}`);
      setAcknowledgementNo(`ACK-DBT-2026-${randomSuffix + 11}`);

      // Simulated scanner stops after 1.2s
      const timer = setTimeout(() => {
        setIsScanning(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Automated form filling step timer
  useEffect(() => {
    if (currentStage !== 'portal_filling' || !isAutomating) return;

    if (filledFieldCount < PORTAL_26_FIELDS.length) {
      const delay = automationSpeed === 'instant' ? 40 : automationSpeed === 'fast' ? 120 : 250;
      const timer = setTimeout(() => {
        setFilledFieldCount((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Completed all 26 fields! Transition to confirmed ID
      const finishTimer = setTimeout(() => {
        setIsAutomating(false);
        setCurrentStage('confirmed_id');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF9933', '#1B2A6B', '#1E7B34'],
        });
        if (onApplicationConfirmed) {
          onApplicationConfirmed(applicationId, {
            applicationId,
            acknowledgementNo,
            timestamp: new Date().toISOString(),
          });
        }
      }, 800);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStage, isAutomating, filledFieldCount, automationSpeed]);

  if (!isOpen) return null;

  const handleStartPortalFilling = () => {
    setCurrentStage('portal_filling');
    setFilledFieldCount(0);
    setIsAutomating(true);
  };

  const handleInstantFill = () => {
    setAutomationSpeed('instant');
    setIsAutomating(true);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(applicationId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Tricolour Accent Line */}
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Modal Header */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B2A6B] to-[#1E7B34] text-white flex items-center justify-center shadow-xs shrink-0">
              <Scan className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Autonomous RPA Agent
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                  OCR Engine Active
                </span>
              </div>
              <h3 className="font-extrabold text-[#1B2A6B] text-base sm:text-lg">
                Autonomous 25+ Field Portal RPA &amp; OCR Engine
              </h3>
              <p className="text-xs text-slate-500">
                Extracts statutory proofs via optical character recognition and simulates automated multi-field portal submission.
              </p>
            </div>
          </div>

          {/* Stepper Indicators */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                currentStage === 'ocr_extraction'
                  ? 'bg-[#1B2A6B] text-white'
                  : 'text-slate-400'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>1. OCR Scan</span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                currentStage === 'portal_filling'
                  ? 'bg-[#1E7B34] text-white'
                  : 'text-slate-400'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>2. 26 Fields Auto-Fill</span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                currentStage === 'confirmed_id'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Confirmed ID</span>
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

        {/* Modal Dynamic Body based on Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================= */}
          {/* STAGE 1: OCR DOCUMENT SCANNING & EXTRACTION */}
          {/* ======================================================= */}
          {currentStage === 'ocr_extraction' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/70 p-4 rounded-2xl border border-blue-200 shadow-2xs">
                <div>
                  <h4 className="font-extrabold text-[#1B2A6B] text-sm flex items-center gap-2">
                    <Scan className="w-4 h-4 text-[#F28C28]" />
                    <span>Optical Character Recognition (OCR) Scanner</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Select a document to inspect bounding boxes and confidence metrics extracted from citizen records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartPortalFilling}
                  className="px-5 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <span>Launch 26-Field Portal RPA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Document Selector Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_OCR_DOCUMENTS.map((doc, idx) => {
                  const isSelected = selectedDocIndex === idx;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocIndex(idx);
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 800);
                      }}
                      className={`text-left p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#1B2A6B] ring-2 ring-[#1B2A6B]/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {doc.docType}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#1E7B34]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#1B2A6B] truncate">{doc.docTitle}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{doc.docNumber}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* OCR Visual Document Mockup with Bounding Boxes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Document Canvas with Laser Scan & Bounding Box Overlays */}
                <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-700 text-white space-y-3 relative overflow-hidden shadow-md">
                  <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-emerald-400 font-bold">OCR_STREAM: LIVE</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      RESOLUTION: 300 DPI • TESSERACT_V5
                    </span>
                  </div>

                  {/* Simulated Document Canvas */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border-2 border-slate-600 p-4 text-slate-800 overflow-hidden shadow-inner select-none">
                    {/* Laser Scanner Bar */}
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34D399] animate-bounce z-30" />
                    )}

                    {/* Official Document Emblem Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                      <Landmark className="w-48 h-48 text-[#1B2A6B]" />
                    </div>

                    {/* Certificate Top Header */}
                    <div className="text-center border-b border-slate-300 pb-2 mb-2">
                      <div className="text-[10px] font-black text-[#1B2A6B] uppercase tracking-wider">
                        {selectedDoc.issuingBody}
                      </div>
                      <div className="text-xs font-black text-slate-900 tracking-tight">
                        {selectedDoc.docTitle}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        REF NO: {selectedDoc.docNumber}
                      </div>
                    </div>

                    {/* Bounding Box Overlays on Detected Key Attributes */}
                    {selectedDoc.boundingBoxes.map((box) => {
                      const isHovered = activeHighlightId === box.id;
                      return (
                        <div
                          key={box.id}
                          onMouseEnter={() => setActiveHighlightId(box.id)}
                          onMouseLeave={() => setActiveHighlightId(null)}
                          style={{
                            top: `${box.topPercent}%`,
                            left: `${box.leftPercent}%`,
                            width: `${box.widthPercent}%`,
                            height: `${box.heightPercent}%`,
                          }}
                          className={`absolute rounded-md border-2 transition-all flex items-center px-1.5 cursor-pointer z-20 ${
                            isHovered
                              ? 'border-[#F28C28] bg-amber-400/25 ring-2 ring-amber-400/50 scale-102'
                              : 'border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-900 truncate">
                            {box.extractedValue}
                          </span>
                          <span className="absolute -top-3.5 right-0 bg-[#1E7B34] text-white text-[8px] font-extrabold px-1 rounded">
                            {box.confidence}%
                          </span>
                        </div>
                      );
                    })}

                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>Digital India Optical Ingestion Gateway</span>
                      <span>Verified Stamp: 2026-OK</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Hover over green bounding boxes to inspect parsed statutory tokens.
                  </p>
                </div>

                {/* Right: Extracted Key-Value Table */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-[#1B2A6B] uppercase tracking-wider">
                      Extracted Statutory Proofs ({selectedDoc.boundingBoxes.length} Attributes):
                    </h5>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Mean Confidence: 99.4%
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedDoc.boundingBoxes.map((box) => (
                      <div
                        key={box.id}
                        onMouseEnter={() => setActiveHighlightId(box.id)}
                        onMouseLeave={() => setActiveHighlightId(null)}
                        className={`p-3 rounded-xl border text-xs transition flex items-center justify-between gap-3 ${
                          activeHighlightId === box.id
                            ? 'bg-amber-50 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {box.label}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            {box.extractedValue}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-extrabold text-[#1E7B34] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ✓ {box.confidence}%
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                            {box.fieldKey}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Call to Action to proceed to 26 Fields filling */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleStartPortalFilling}
                      className="w-full py-3.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Laptop className="w-4 h-4" />
                      <span>Proceed to Automated Portal Navigation (26 Fields)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* STAGE 2: AUTOMATED PORTAL NAVIGATION & 26-FIELD AUTO-FILL */}
          {/* ======================================================= */}
          {currentStage === 'portal_filling' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Browser Simulation Chrome Frame */}
              <div className="border border-slate-300 rounded-3xl overflow-hidden shadow-md bg-white">
                {/* Browser Top Navigation Bar */}
                <div className="bg-slate-100 p-3 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 bg-white px-3 py-1 rounded-xl border border-slate-300 text-[11px] font-mono text-slate-700 shadow-2xs">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>https://pmkisan.gov.in/FarmerRegistration_New2026.aspx</span>
                    </div>
                  </div>

                  {/* Automation Speed Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">RPA Pace:</span>
                    <button
                      type="button"
                      onClick={() => setAutomationSpeed('normal')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        automationSpeed === 'normal'
                          ? 'bg-[#1B2A6B] text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      1x Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutomationSpeed('fast')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        automationSpeed === 'fast'
                          ? 'bg-[#1B2A6B] text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      3x Fast
                    </button>
                    <button
                      type="button"
                      onClick={handleInstantFill}
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#F28C28] text-white hover:bg-[#d97706] cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Instant</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Official Government Portal Page Header */}
                <div className="p-4 bg-gradient-to-r from-emerald-800 to-[#0B1329] text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg">
                      🇮🇳
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-300">
                        Government of India • Ministry of Agriculture &amp; Farmers Welfare
                      </div>
                      <div className="text-sm font-black tracking-wide">
                        PM-KISAN Direct Benefit Transfer (DBT) Portal
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                      Session ID: #NIC-904128
                    </span>
                  </div>
                </div>

                {/* Progress Bar of 26 Fields */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Loader2
                      className={`w-4 h-4 text-[#1E7B34] ${
                        filledFieldCount < PORTAL_26_FIELDS.length ? 'animate-spin' : ''
                      }`}
                    />
                    <span className="font-bold text-[#1B2A6B]">
                      Field Auto-Fill Progress: {filledFieldCount} / {PORTAL_26_FIELDS.length} Fields Verified
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    {Math.round((filledFieldCount / PORTAL_26_FIELDS.length) * 100)}% Complete
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-[#1B2A6B] via-[#F28C28] to-[#1E7B34] transition-all duration-300"
                    style={{
                      width: `${(filledFieldCount / PORTAL_26_FIELDS.length) * 100}%`,
                    }}
                  />
                </div>

                {/* 26-Field Live Portal Form Grid */}
                <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto space-y-6">
                  {/* Group fields by Section */}
                  {['1. Administrative Jurisdiction', '2. Identity & Biometrics', '3. Land Revenue Records', '4. Public Financial Management (PFMS)'].map(
                    (sectionTitle) => {
                      const fieldsInSection = PORTAL_26_FIELDS.filter(
                        (f) => f.section === sectionTitle
                      );

                      return (
                        <div key={sectionTitle} className="space-y-3">
                          <h6 className="font-black text-xs text-[#1B2A6B] uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center justify-between">
                            <span>{sectionTitle}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {fieldsInSection.filter((f) => f.fieldNumber <= filledFieldCount).length} / {fieldsInSection.length} Filled
                            </span>
                          </h6>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                            {fieldsInSection.map((field) => {
                              const isFilled = field.fieldNumber <= filledFieldCount;
                              const isCurrentlyFilling = field.fieldNumber === filledFieldCount;

                              return (
                                <div
                                  key={field.id}
                                  className={`p-3 rounded-xl border transition-all ${
                                    isCurrentlyFilling
                                      ? 'border-[#F28C28] bg-amber-50/70 shadow-xs ring-2 ring-[#F28C28]/25 scale-102'
                                      : isFilled
                                      ? 'border-emerald-200 bg-emerald-50/30'
                                      : 'border-slate-200 bg-slate-50/50 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-slate-500">
                                      #{field.fieldNumber}. {field.label}
                                    </span>
                                    {isFilled && (
                                      <span className="text-[9px] font-bold text-[#1E7B34] flex items-center gap-0.5">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                        <span>OK</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-bold text-xs text-slate-900 truncate">
                                    {isFilled ? field.value : '—'}
                                  </div>

                                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-200/60 text-[9px] text-slate-400">
                                    <span>Src: {field.sourceDoc}</span>
                                    <span className="font-mono text-emerald-700">
                                      OCR: {field.ocrConfidence}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Submitting Status Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-600">
                    {filledFieldCount < PORTAL_26_FIELDS.length ? (
                      <span>Simulating robotic process navigation across official portal endpoints...</span>
                    ) : (
                      <span className="font-bold text-[#1E7B34] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>All 26 statutory fields verified. Generating confirmed application ID...</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleInstantFill}
                    className="px-4 py-2 bg-[#1B2A6B] hover:bg-[#142052] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Finish Auto-Fill Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* STAGE 3: CONFIRMED APPLICATION ID & STATUTORY RECEIPT */}
          {/* ======================================================= */}
          {currentStage === 'confirmed_id' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
              {/* Confirmed Banner */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-md relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-[#1E7B34] text-white flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-[#1E7B34]/15 text-[#1E7B34] border border-[#1E7B34]/30 font-extrabold text-xs uppercase tracking-wider">
                  ✓ Statutory Application Registered
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#1B2A6B]">
                  Confirmed Application ID Issued
                </h3>

                {/* The Golden Application ID Display */}
                <div className="max-w-md mx-auto bg-white border-2 border-[#1E7B34] rounded-2xl p-4 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Government Portal Application ID:
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-[#1E7B34] tracking-wider select-all">
                    {applicationId}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500">
                    <span>Acknowledgement No:</span>
                    <strong className="text-slate-800 font-mono">{acknowledgementNo}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  All 26 fields populated from OCR scans have been successfully dispatched to the National DBT Gateway and mapped to the PFMS treasury endpoint.
                </p>
              </div>

              {/* Printable Official Acknowledgment Receipt */}
              <div className="bg-white border border-slate-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 text-xs" id="official-receipt-print">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-base border border-slate-200">
                      🇮🇳
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#1B2A6B]">
                        Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Official Direct Benefit Transfer (DBT) Registration Slip
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block">Registration Date:</span>
                    <span className="font-bold text-slate-800">
                      {new Date().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* 2-Col Receipt Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Applicant Name:</span>
                    <strong className="text-slate-900">Ramesh Vithal Patil</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Aadhaar (Masked):</span>
                    <strong className="text-slate-900 font-mono">XXXX-XXXX-4821</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Land Khata &amp; Gat:</span>
                    <strong className="text-slate-900">Khata 84 / Gat 84/2A</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Cultivable Area:</span>
                    <strong className="text-emerald-700 font-bold">0.6070 ha (1.5 Acres)</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700">
                  <div>
                    <span className="text-slate-400 text-[10px] block">PFMS Bank Status:</span>
                    <strong className="text-slate-900">State Bank of India</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">IFSC Code:</span>
                    <strong className="text-slate-900 font-mono">SBIN0000412</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Annual Entitlement:</span>
                    <strong className="text-[#1E7B34] font-black">₹6,000 / Year (DBT)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nodal Desk:</span>
                    <strong className="text-slate-900">Nashik District Office</strong>
                  </div>
                </div>

                {/* Digital Attestation Stamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1E7B34]" />
                    <span>Digitally Verified &amp; Signed via SchemeSetu Autonomous Civic Agent</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    SHA-256: 8f4a129d891b04a872
                  </span>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStage('ocr_extraction');
                    setFilledFieldCount(0);
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Run Another Document OCR</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1E7B34]" />
                        <span className="text-[#1E7B34]">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Application ID</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Done &amp; Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
