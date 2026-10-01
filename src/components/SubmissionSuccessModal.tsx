import React from 'react';
import { CheckCircle, ShieldCheck, X, FileText, ArrowRight, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

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
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  receipt,
  onClose,
}) => {
  React.useEffect(() => {
    if (receipt) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9933', '#FFFFFF', '#138808'],
      });
    }
  }, [receipt]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0 text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Application Receipt Generated</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SIMULATED
                </span>
              </div>
              <p className="text-xs text-slate-400">Government DBT Application System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
              Acknowledgement Number:
            </div>
            <div className="text-2xl font-mono font-black text-emerald-300 tracking-wider">
              {receipt.acknowledgement_number}
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-emerald-500/20">
              <span>Submission Ref ID:</span>
              <span className="font-mono text-slate-300">{receipt.submission_id}</span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-slate-300 border-b border-slate-800 pb-1">
              Applicant & Scheme Details
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div>
                Scheme Code: <span className="text-white font-medium">{receipt.scheme_id.toUpperCase()}</span>
              </div>
              <div>
                Applicant: <span className="text-white font-medium">{receipt.applicant_snapshot?.name || 'Citizen'}</span>
              </div>
              <div>
                State / District:{' '}
                <span className="text-white font-medium">
                  {receipt.applicant_snapshot?.district || 'Patna'}, {receipt.applicant_snapshot?.state || 'Bihar'}
                </span>
              </div>
              <div>
                Status: <span className="text-emerald-400 font-bold">Pre-Filed (Success)</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl space-y-1 text-amber-200">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Mandatory Next Step:</span>
            </div>
            <p className="leading-relaxed text-[11px]">{receipt.next_step}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
