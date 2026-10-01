import React from 'react';
import { ShieldCheck, X, FileText, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthUser } from '../types/auth';

interface SubmissionSuccessModalProps {
  receipt: {
    submission_id: string;
    acknowledgement_number: string;
    scheme_id: string;
    portal_endpoint: string;
    timestamp: string;
    applicant_snapshot: any;
    next_step: string;
    simulated: boolean;
  } | null;
  onClose: () => void;
  authUser?: AuthUser | null;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  receipt,
  onClose,
  authUser,
}) => {
  React.useEffect(() => {
    if (receipt) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9933', '#1B2A6B', '#1E7B34'],
      });
    }
  }, [receipt]);

  if (!receipt) return null;

  const isDigiLocker = authUser?.authMethod === 'digilocker';
  const applicantName = authUser?.name || receipt.applicant_snapshot?.name || 'Citizen Applicant';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0 text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E7B34]/15 text-[#1E7B34] flex items-center justify-center border border-[#1E7B34]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1B2A6B] text-base">Application Receipt Generated</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E7B34]/15 text-[#1E7B34] border border-[#1E7B34]/30">
                  SIMULATED
                </span>
              </div>
              <p className="text-xs text-slate-500">Government Direct Benefit Transfer (DBT) Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-1.5">
            <div className="text-emerald-800 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Acknowledgement Number:</span>
              {isDigiLocker && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#1E7B34] border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>DigiLocker Verified</span>
                </span>
              )}
            </div>
            <div className="text-2xl font-mono font-black text-[#1E7B34] tracking-wider">
              {receipt.acknowledgement_number}
            </div>
            <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-emerald-200">
              <span>Submission Ref ID:</span>
              <span className="font-mono font-semibold text-slate-800">{receipt.submission_id}</span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="font-bold text-[#1B2A6B] border-b border-slate-200 pb-1.5">
              Applicant &amp; Scheme Details
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                Scheme Code: <span className="text-slate-900 font-bold">{receipt.scheme_id.toUpperCase()}</span>
              </div>
              <div>
                Applicant: <span className="text-slate-900 font-bold">{applicantName}</span>
              </div>
              <div>
                Location:{' '}
                <span className="text-slate-900 font-medium">
                  {receipt.applicant_snapshot?.district || 'Nashik'}, {receipt.applicant_snapshot?.state || 'Maharashtra'}
                </span>
              </div>
              <div>
                Status: <span className="text-[#1E7B34] font-bold">Pre-Filed (Success)</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/80 border border-amber-300 p-4 rounded-2xl space-y-1 text-slate-700">
            <div className="font-bold text-[#d97706] flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Mandatory Next Step:</span>
            </div>
            <p className="leading-relaxed text-[11px] font-medium">{receipt.next_step}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
