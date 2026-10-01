import React from 'react';
import {
  FileText,
  ShieldCheck,
  X,
  ExternalLink,
  Download,
  Calendar,
  Building2,
  Lock,
  Trash2,
} from 'lucide-react';
import { UserDocument } from '../types/auth';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';
import { isSimulatedMode, isLiveMode } from '../digilocker';

interface DocumentVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: UserDocument[];
  onFetchMoreFromDigiLocker: () => void;
  onDisconnectDigiLocker?: () => void;
  language: SupportedLanguage;
}

export const DocumentVaultModal: React.FC<DocumentVaultModalProps> = ({
  isOpen,
  onClose,
  documents,
  onFetchMoreFromDigiLocker,
  onDisconnectDigiLocker,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#1B2A6B] text-base">DigiLocker Document Vault</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSimulatedMode()
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-[#1E7B34] border-emerald-200'
                }`}>
                  {isSimulatedMode() ? 'Simulated' : 'Connected to DigiLocker'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Official digital repository linked with your profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">Your documents are directly synchronized for 1-click filing.</span>
            <div className="flex items-center gap-2">
              {onDisconnectDigiLocker && documents.length > 0 && (
                <button
                  type="button"
                  onClick={onDisconnectDigiLocker}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Revoke session and remove stored documents"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect DigiLocker</span>
                </button>
              )}
              <button
                type="button"
                onClick={onFetchMoreFromDigiLocker}
                className="px-3.5 py-2 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Add document via DigiLocker</span>
              </button>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-[#1B2A6B]">No documents linked yet</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fetch Aadhaar, Income certificate, or Land records via DigiLocker.
                </p>
              </div>
              <button
                type="button"
                onClick={onFetchMoreFromDigiLocker}
                className="px-5 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-[10px] shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Add document via DigiLocker</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl shadow-2xs space-y-2 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1B2A6B]">{doc.name}</h4>
                        <div className="text-[11px] text-slate-500">{doc.issuedBy}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isSimulatedMode()
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-emerald-50 text-[#1E7B34] border-emerald-200'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isSimulatedMode() ? 'Simulated' : 'Connected to DigiLocker'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">Doc ID: {doc.docNumberMasked || 'MH/NSK/7-12/2024/9182'}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Issue Date: {new Date(doc.fetchedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">{t.honestDisclaimer}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
