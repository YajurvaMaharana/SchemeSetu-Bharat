import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  Flame,
  CheckCheck,
  RefreshCw,
  Navigation,
} from 'lucide-react';
import { LIFE_EVENTS } from '../data/lifeEventsData';
import { LifeEvent, ProactiveWhatsAppMessage } from '../types/proactive';
import { generateProactiveWhatsAppMessage } from '../services/proactiveEngine';
import { UserProfile } from '../types/agent';
import { SupportedLanguage } from '../data/translations';

interface ProactiveWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onApplyScheme?: (schemeId: string) => void;
  onLocateCsc?: () => void;
  language?: SupportedLanguage;
}

export const ProactiveWhatsAppModal: React.FC<ProactiveWhatsAppModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onApplyScheme,
  onLocateCsc,
  language = 'hi',
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(LIFE_EVENTS[0].id);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'mr' | 'en'>(
    language === 'mr' ? 'mr' : language === 'en' ? 'en' : 'hi'
  );
  const [proactiveMessage, setProactiveMessage] = useState<ProactiveWhatsAppMessage | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const currentEvent = LIFE_EVENTS.find((e) => e.id === selectedEventId) || LIFE_EVENTS[0];

  // Fetch or generate message on event or language change
  useEffect(() => {
    if (!isOpen) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return;
    }

    const fetchOrGenerate = async () => {
      setIsRegenerating(true);
      try {
        const res = await fetch('/api/agent/proactive-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lifeEventId: selectedEventId,
            userProfile,
            language: selectedLang,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.message) {
            setProactiveMessage(data.message);
            setIsRegenerating(false);
            return;
          }
        }
      } catch (e) {
        // Fallback to client generation
      }

      const clientMsg = generateProactiveWhatsAppMessage(
        currentEvent,
        userProfile || null,
        selectedLang
      );
      setProactiveMessage(clientMsg);
      setIsRegenerating(false);
    };

    fetchOrGenerate();
  }, [isOpen, selectedEventId, selectedLang]);

  if (!isOpen) return null;

  const handleCopyMessage = () => {
    if (!proactiveMessage) return;
    navigator.clipboard.writeText(proactiveMessage.messageText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSendToWhatsApp = () => {
    if (!proactiveMessage) return;
    const url = `https://wa.me/?text=${encodeURIComponent(proactiveMessage.messageText)}`;
    window.open(url, '_blank');
  };

  const handleSpeak = () => {
    if (!proactiveMessage) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(proactiveMessage.messageText);
    const langMap = { hi: 'hi-IN', mr: 'mr-IN', en: 'en-IN' };
    utterance.lang = langMap[selectedLang] || 'hi-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Tricolour Ribbon */}
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Modal Top Header */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#1B2A6B] text-base sm:text-lg">
                  Proactive Life-Event Welfare Radar
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                  Pre-Search AI Assistance
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Detects statutory events (weather alerts, Aadhaar updates) &amp; dispatches instant WhatsApp guidance.
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

        {/* Body Grid: Left Event Selector & Context, Right WhatsApp Chat Simulator */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Event Stream Picker & Civic Intelligence (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 space-y-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                Simulate Statutory Life Events:
              </span>
              <div className="space-y-2">
                {LIFE_EVENTS.map((event) => {
                  const isSelected = event.id === selectedEventId;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEventId(event.id)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-white border-[#1E7B34] shadow-xs ring-2 ring-[#1E7B34]/15'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{event.icon}</span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#1B2A6B] truncate">{event.title}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                              event.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-700'
                                : event.severity === 'HIGH'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {event.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {event.district}, {event.state} • {event.timestamp}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Deep-Dive Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#1B2A6B] font-bold text-xs border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-[#F28C28]" />
                <span>Statutory Event Details</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-normal">
                {currentEvent.description}
              </p>
              <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-2.5 text-amber-900 text-[11px] space-y-1">
                <strong>Why Proactive Intervention Matters:</strong>
                <div>{currentEvent.impactSummary}</div>
                <div className="font-medium text-amber-800">
                  Recommended: {currentEvent.suggestedAction}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive WhatsApp Phone View (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-emerald-50/20">
            {/* WhatsApp Phone Mockup Container */}
            <div className="rounded-3xl border border-slate-300 shadow-md bg-[#EFEAE2] overflow-hidden flex flex-col flex-1 min-h-[440px]">
              {/* WhatsApp App Header */}
              <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-sm">
                    🇮🇳
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm">SchemeSetu Bharat</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-white text-[#075E54] flex items-center justify-center font-black text-[9px]">
                        ✓
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-200 block">
                      Official Jan Seva Assistant • Verified
                    </span>
                  </div>
                </div>

                {/* Language Switcher in WhatsApp Bar */}
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
                  {(['hi', 'mr', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        selectedLang === lang
                          ? 'bg-white text-[#075E54]'
                          : 'text-emerald-100 hover:text-white'
                      }`}
                    >
                      {lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : 'EN'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div
                className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3"
                style={{
                  backgroundImage:
                    'radial-gradient(#CBD5E1 0.75px, transparent 0.75px), radial-gradient(#CBD5E1 0.75px, #EFEAE2 0.75px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              >
                {/* Encryption Disclaimer Badge */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#FFF2CD] text-[#725400] px-3 py-1 rounded-lg shadow-2xs font-medium border border-[#FFE7A0]">
                    🔒 End-to-end encrypted • Direct Benefit Transfer (DBT) Copilot
                  </span>
                </div>

                {/* Proactive Inbound Message Bubble */}
                <div className="max-w-[92%] bg-white rounded-2xl rounded-tl-sm p-3.5 sm:p-4 shadow-sm space-y-3 text-xs text-slate-800 leading-relaxed border border-slate-200/80">
                  {isRegenerating ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#1E7B34]" />
                      <span className="text-xs">
                        Synthesizing proactive message from life event signals...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-line font-sans text-slate-800 text-[12px] sm:text-[13px] leading-relaxed">
                        {proactiveMessage?.messageText}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="font-semibold text-emerald-700">
                          {currentEvent.source.split('•')[0]}
                        </span>
                        <div className="flex items-center gap-1">
                          <span>{proactiveMessage?.generatedAt || '05:32 AM'}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Interactive WhatsApp Quick-Reply Cards */}
                {proactiveMessage?.schemesSuggested && proactiveMessage.schemesSuggested.length > 0 && (
                  <div className="space-y-2 max-w-[92%]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      1-Click Interactive Actions:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {proactiveMessage.schemesSuggested.map((scheme, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (onApplyScheme) {
                              onApplyScheme(scheme.schemeId);
                              onClose();
                            }
                          }}
                          className="bg-white hover:bg-emerald-50 text-left p-2.5 rounded-xl border border-emerald-300 text-xs text-slate-800 font-semibold shadow-2xs flex items-center justify-between gap-2 transition cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[#1E7B34] font-bold block">{scheme.schemeName}</span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              {scheme.benefitText}
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-[#1E7B34] text-white px-2.5 py-1 rounded-lg shrink-0">
                            Apply
                          </span>
                        </button>
                      ))}

                      {/* CSC Quick Action */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onLocateCsc) {
                            onLocateCsc();
                            onClose();
                          }
                        }}
                        className="bg-white hover:bg-blue-50 text-left p-2.5 rounded-xl border border-blue-200 text-xs text-slate-800 font-semibold shadow-2xs flex items-center justify-between gap-2 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-blue-600" />
                          <span>Visit Nearest Common Service Center (Nashik Desk)</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase bg-blue-700 text-white px-2 py-1 rounded-lg shrink-0">
                          Directions
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp Audio & Action Bar Footer */}
              <div className="bg-[#F0F2F5] p-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSpeak}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    isSpeaking
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>Listen Vernacular Audio</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    className="px-4 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
