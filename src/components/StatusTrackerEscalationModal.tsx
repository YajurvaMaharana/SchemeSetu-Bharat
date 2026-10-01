import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Send,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle2,
  X,
  ShieldAlert,
  ArrowRight,
  Printer,
  Copy,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ApplicationTrackerItem, SAMPLE_TRACKED_APPLICATIONS } from '../data/escalationAndWhatIfData';
import { UserProfile } from '../types/agent';
import { SupportedLanguage } from '../data/translations';

interface StatusTrackerEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  language: SupportedLanguage;
}

export const StatusTrackerEscalationModal: React.FC<StatusTrackerEscalationModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  language,
}) => {
  const [selectedApp, setSelectedApp] = useState<ApplicationTrackerItem>(SAMPLE_TRACKED_APPLICATIONS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'rti' | 'collector_email' | 'cpgrams'>('overview');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const citizenName = userProfile?.name || 'Ramesh Yadav';
  const district = userProfile?.district || selectedApp.district;
  const state = userProfile?.state || selectedApp.state;

  const rtiText = `FORM 'A' - APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF RTI ACT, 2005

To:
The Public Information Officer (PIO)
Office of the ${selectedApp.officerDesignation}, ${district}, ${state}
Department: ${selectedApp.department}

Subject: Request for statutory status of stalled welfare application (${selectedApp.schemeName}) - Reg.

1. Full Name of Applicant: ${citizenName}
2. Address: Village/Post: ${district}, District: ${district}, State: ${state}
3. Application Reference Number: ${selectedApp.applicationNumber}
4. Date of Application Submission: ${selectedApp.appliedDate} (${selectedApp.daysPending} days elapsed)

PARTICULARS OF INFORMATION SOUGHT:
1. Daily Progress Report: Please provide certified daily progress report of my application No. ${selectedApp.applicationNumber} from date of submission to present date.
2. Officer Accountability: Please state the name and designation of the officials who were duty-bound to process this application within the statutory 45-day citizen charter limit.
3. Reason for Delay: Certified reason why this application has remained stalled for ${selectedApp.daysPending} days without sanction or rejection.
4. Expected Date of Final Order: Please state the exact date by which final sanction and disbursement of ₹${selectedApp.disbursementAmountInr.toLocaleString('en-IN')} will be credited to my bank account.

I state that the information sought does not fall under the exemptions of Section 8 and 9 of the RTI Act.

Application Fee: ₹10 Postal Order Enclosed.

Place: ${district}
Date: ${new Date().toLocaleDateString('en-IN')}
Signature: [${citizenName}]`;

  const collectorEmail = `Subject: URGENT: Redressal for Stalled ${selectedApp.schemeName} Application (${selectedApp.applicationNumber}) - ${citizenName}

Respected District Collector / Magistrate (${district}),

I am writing to bring to your urgent personal attention an egregious delay in the processing of my statutory welfare benefit application under the ${selectedApp.schemeName}.

Application Details:
- Applicant Name: ${citizenName}
- Application ID: ${selectedApp.applicationNumber}
- Portal: ${selectedApp.portalName}
- Date of Filing: ${selectedApp.appliedDate}
- Days Pending: ${selectedApp.daysPending} Days (Statutory Limit: 45 Days)
- Sanction Amount: ₹${selectedApp.disbursementAmountInr.toLocaleString('en-IN')}
- Current Bottleneck: ${selectedApp.officerDesignation}

Despite multiple representations and fulfilling all biometric/land documentation criteria, no progress has been made for over 2 months. 

In accordance with the State Citizen Charter and Right to Public Services Act, I respectfully request your office to:
1. Direct the ${selectedApp.department} to expedite field inspection within 7 days.
2. Instruct the Lead Bank/Revenue Officer to process sanction and credit the entitled subsidy.

A copy of this representation has also been logged on the CPGRAMS central grievance portal.

Yours faithfully,
${citizenName}
Mobile: +91 98765 [Redacted]
${district}, ${state}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Status Tracker &amp; Automated Escalation Bot (Pillar 7)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  RTI &amp; CPGRAMS 60-Day Defense
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Monitors portal bottlenecks. Auto-drafts Section 6(1) RTI notice, District Collector escalation, and CPGRAMS petition.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
          {/* Applications Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_TRACKED_APPLICATIONS.map((app) => {
              const isSelected = selectedApp.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setActiveTab('overview');
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-white border-[#1B2A6B] ring-2 ring-[#1B2A6B]/15 shadow-md'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {app.applicationNumber}
                    </span>
                    {app.isStalled ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
                        {app.daysPending}d Stalled
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {app.daysPending}d Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {app.schemeNameHi || app.schemeName}
                    </h4>
                    <span className="text-[11px] font-bold text-[#1E7B34] block">
                      ₹{app.disbursementAmountInr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>{app.portalName}</span>
                    <span className="font-bold text-rose-600">
                      {app.isStalled ? 'Action Required' : 'In Progress'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stalled Alert Banner */}
          {selectedApp.isStalled && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-black text-rose-950">
                    Application Exceeded 60-Day Citizen Charter Limit ({selectedApp.daysPending} Days Elapsed)
                  </span>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Bottleneck: {selectedApp.stallReason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('rti')}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Generate Section 6(1) RTI
                </button>
              </div>
            </div>
          )}

          {/* Action Tabs Deck */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#1B2A6B] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                1. Status Timeline &amp; Bottleneck
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rti')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'rti'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2. Statutory RTI Application (Form A)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('collector_email')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'collector_email'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>3. District Collector Escalation</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cpgrams')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cpgrams'
                    ? 'bg-[#1E7B34] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>4. CPGRAMS Portal Launch</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">Assigned Department</span>
                    <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">
                      {selectedApp.department}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">Competent Officer</span>
                    <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">
                      {selectedApp.officerDesignation}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">Sanctioned Amount</span>
                    <span className="font-extrabold text-[#1E7B34] text-sm mt-0.5 block">
                      ₹{selectedApp.disbursementAmountInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block">Recommended Autonomous Escalation Strategy:</span>
                  <p className="text-slate-600 leading-relaxed">
                    Under the <strong>Right to Public Services Legislation</strong>, welfare benefits delayed past 45 days empower the applicant to demand daily accountability logs and invoke supervisory inquiry via Section 6(1) RTI. Click Tab 2 or 3 to instantly produce verified statutory filing templates.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: RTI FORM */}
            {activeTab === 'rti' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    Pre-filled Section 6(1) Right to Information (RTI) Petition:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(rtiText, 'RTI Notice')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedNotification === 'RTI Notice' ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-[#1B2A6B] hover:bg-[#142052] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Form A</span>
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={rtiText}
                  rows={10}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 font-mono text-[11px] text-slate-800 leading-relaxed outline-none"
                />
              </div>
            )}

            {/* TAB 3: COLLECTOR EMAIL */}
            {activeTab === 'collector_email' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    District Magistrate Direct Escalation Memo:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(collectorEmail, 'Collector Email')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedNotification === 'Collector Email' ? 'Copied!' : 'Copy Email'}</span>
                    </button>
                    <a
                      href={`mailto:collector.${district.toLowerCase()}@nic.in?subject=${encodeURIComponent(
                        `URGENT: Stalled ${selectedApp.schemeName} Application (${selectedApp.applicationNumber})`
                      )}&body=${encodeURIComponent(collectorEmail)}`}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open Mail Client</span>
                    </a>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={collectorEmail}
                  rows={9}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 font-mono text-[11px] text-slate-800 leading-relaxed outline-none"
                />
              </div>
            )}

            {/* TAB 4: CPGRAMS */}
            {activeTab === 'cpgrams' && (
              <div className="p-6 bg-gradient-to-r from-emerald-50 via-white to-blue-50 rounded-2xl border border-emerald-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1E7B34] text-white flex items-center justify-center mx-auto shadow-sm">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-black text-base text-slate-900">
                    Centralized Public Grievance Redress and Monitoring System (CPGRAMS)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Prime Minister's Office &amp; DARPG public grievance portal with statutory 30-day escalation mandate.
                  </p>
                </div>

                <a
                  href="https://pgportal.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E7B34] hover:bg-[#18682B] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Launch Official CPGRAMS Portal (pgportal.gov.in)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by <strong>YojanaSathi ApnaAdhikar ("Your Right")</strong> Civic Escalation Engine.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
