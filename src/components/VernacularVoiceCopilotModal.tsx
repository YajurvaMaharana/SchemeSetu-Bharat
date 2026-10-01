import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  StopCircle,
  Play,
  RotateCcw,
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Activity,
  Zap,
} from 'lucide-react';
import {
  SupportedDialect,
  SUPPORTED_DIALECTS,
  extractDialectProfile,
  generateDeterministicDialectResponse,
} from '../services/dialectService';
import { UserProfile } from '../types/agent';

interface VernacularVoiceCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfileToDiscovery?: (profile: UserProfile) => void;
}

type ConversationState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'INTERRUPTED';

interface MessageItem {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  dialect: SupportedDialect;
  timestamp: string;
}

export const VernacularVoiceCopilotModal: React.FC<VernacularVoiceCopilotModalProps> = ({
  isOpen,
  onClose,
  onApplyProfileToDiscovery,
}) => {
  const [selectedDialect, setSelectedDialect] = useState<SupportedDialect>('bhojpuri');
  const [conversationState, setConversationState] = useState<ConversationState>('IDLE');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [extractedProfile, setExtractedProfile] = useState<UserProfile | null>(null);
  const [isSpeakingActive, setIsSpeakingActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentDialectInfo =
    SUPPORTED_DIALECTS.find((d) => d.id === selectedDialect) || SUPPORTED_DIALECTS[0];

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  // Handle Initial Dialect Welcome
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText =
        selectedDialect === 'bhojpuri'
          ? 'प्रणाम! हम SchemeSetu आवाज सहायक हईं। रउआ आपन नाम, खेत आ काम के बारे में आपन भाषा में बताईं, हम सब सरकारी योजना बतइब।'
          : selectedDialect === 'marwari'
          ? 'खम्मा घणी सा! म्हे SchemeSetu री आवाज सहेली हां। थारो नाम, खेती अर काम री बात बताओ, म्हे थानै सगळी सरकारी योजनावां बतासूं।'
          : selectedDialect === 'maithili'
          ? 'प्रणाम! हम SchemeSetu आवाज सहायक छी। अहाँक नाम, खेत आ काजक बारे मे अपन मातृभाषा मे कहू।'
          : selectedDialect === 'marathi'
          ? 'नमस्कार! मी SchemeSetu व्हॉईस असिस्टंट आहे. आपले नाव, शेती आणि व्यवसायाची माहिती आपल्या भाषेत सांगा.'
          : 'नमस्ते! मैं SchemeSetu वॉइस सहायक हूँ। आप अपनी बोली में अपनी जानकारी बोलिए, मैं सभी पात्र योजनाओं की जानकारी दूंगा।';

      setMessages([
        {
          id: 'welcome',
          sender: 'agent',
          text: welcomeText,
          dialect: selectedDialect,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, selectedDialect]);

  // Clean up Web Speech on unmount/close
  useEffect(() => {
    return () => {
      stopAudioVisualizer();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Audio Visualizer setup
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(avg);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#1E7B34');
          gradient.addColorStop(0.5, '#F28C28');
          gradient.addColorStop(1, '#1B2A6B');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn('Microphone access for visualizer not granted or unavailable:', err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start Voice Recording & Speech Recognition
  const handleStartListening = () => {
    // If speaking, immediately interrupt
    if (conversationState === 'SPEAKING') {
      handleBargeInInterrupt();
      return;
    }

    setConversationState('LISTENING');
    setCurrentTranscript('');
    startAudioVisualizer();

    // Check for browser Web Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        selectedDialect === 'marathi'
          ? 'mr-IN'
          : selectedDialect === 'marwari'
          ? 'hi-IN'
          : 'hi-IN';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            interim += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setCurrentTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        handleProcessSpokenText(currentTranscript || currentDialectInfo.sampleAudioPrompt);
      };

      recognition.onend = () => {
        if (conversationState === 'LISTENING') {
          handleProcessSpokenText(currentTranscript || currentDialectInfo.sampleAudioPrompt);
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.warn('Failed to start recognition:', e);
      }
    } else {
      // Fallback for browsers without Web Speech API
      setTimeout(() => {
        setCurrentTranscript(currentDialectInfo.sampleAudioPrompt);
      }, 800);
    }
  };

  // Process Recognized Spoken Text into Dialect Response
  const handleProcessSpokenText = async (text: string) => {
    const query = text.trim() || currentDialectInfo.sampleAudioPrompt;
    stopAudioVisualizer();
    setConversationState('PROCESSING');

    // Add user message
    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      dialect: selectedDialect,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCurrentTranscript('');

    // Extract profile & generate dialect grounded response
    const profile = extractDialectProfile(query, selectedDialect);
    setExtractedProfile(profile);

    try {
      // Server API Call with Gemini Dialect Reasoning
      const res = await fetch('/api/agent/dialect-voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dialect: selectedDialect,
          queryText: query,
          userProfile: profile,
        }),
      });

      let responseText = '';
      if (res.ok) {
        const data = await res.json();
        responseText = data.dialectResponseText;
      } else {
        const fallback = generateDeterministicDialectResponse(query, selectedDialect, profile);
        responseText = fallback.responseText;
      }

      const agentMsg: MessageItem = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        dialect: selectedDialect,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setConversationState('SPEAKING');
      speakDialectResponse(responseText);
    } catch (err) {
      const fallback = generateDeterministicDialectResponse(query, selectedDialect, profile);
      const agentMsg: MessageItem = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: fallback.responseText,
        dialect: selectedDialect,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setConversationState('SPEAKING');
      speakDialectResponse(fallback.responseText);
    }
  };

  // Dialect Speech Synthesis (TTS)
  const speakDialectResponse = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) {
      setConversationState('IDLE');
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeakingActive(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedDialect === 'marathi' ? 'mr-IN' : 'hi-IN';
    utterance.rate = 0.95; // Clear civic cadence
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeakingActive(false);
      setConversationState('IDLE');
    };

    utterance.onerror = () => {
      setIsSpeakingActive(false);
      setConversationState('IDLE');
    };

    window.speechSynthesis.speak(utterance);
  };

  // BARGE-IN INTERRUPT HANDLER: Halts speech immediately and listens to user
  const handleBargeInInterrupt = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingActive(false);
    setConversationState('INTERRUPTED');

    setTimeout(() => {
      handleStartListening();
    }, 200);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingActive(false);
    setConversationState('IDLE');
  };

  const handleSelectSamplePrompt = (sampleText: string) => {
    handleProcessSpokenText(sampleText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Tricolour Stripe */}
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E7B34] to-[#F28C28] text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Vernacular Dialect Voice Copilot
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34]">
                  Interrupt-Driven (Barge-in)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Speaks native Bhojpuri, Marwari, Maithili, Awadhi &amp; Marathi with instant statutory scheme calculation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleStopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialect Selector Strip */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs overflow-x-auto">
          <span className="font-bold text-slate-600 shrink-0">Select Dialect:</span>
          {SUPPORTED_DIALECTS.map((dialect) => (
            <button
              key={dialect.id}
              type="button"
              onClick={() => {
                setSelectedDialect(dialect.id);
                handleStopSpeaking();
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1.5 ${
                selectedDialect === dialect.id
                  ? 'bg-[#1B2A6B] text-white border-[#1B2A6B] font-bold shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{dialect.flagEmoji}</span>
              <span className="font-bold">{dialect.nativeName}</span>
              <span className="text-[10px] opacity-75">({dialect.name})</span>
            </button>
          ))}
        </div>

        {/* Conversation Stream Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 min-h-[260px] max-h-[380px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm space-y-1.5 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1B2A6B] text-white rounded-br-xs'
                    : 'bg-white text-gray-900 border border-slate-200/90 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                  <span className="font-bold uppercase tracking-wider">
                    {msg.sender === 'user' ? 'Citizen' : 'SchemeSetu Voice Agent'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Real-time Listening / Processing Status */}
          {conversationState === 'LISTENING' && (
            <div className="flex justify-end animate-fadeIn">
              <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-3.5 text-xs max-w-[80%] space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Listening to {currentDialectInfo.nativeName}...</span>
                </div>
                <p className="italic text-slate-600">
                  {currentTranscript || 'Speaking... (Bhojpuri / Marwari / Hindi)'}
                </p>
              </div>
            </div>
          )}

          {conversationState === 'PROCESSING' && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl p-3.5 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F28C28] animate-spin" />
                <span>Evaluating statutory scheme eligibility in {currentDialectInfo.name}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Audio Waveform Canvas */}
        <div className="px-5 py-2 bg-slate-900 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>
              STATUS:{' '}
              <strong className="text-emerald-400 font-bold">{conversationState}</strong>
            </span>
          </div>

          <canvas ref={canvasRef} width="220" height="28" className="rounded-lg bg-black/40" />

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Interrupt: Supported</span>
          </div>
        </div>

        {/* Interactive Control Deck */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
          {/* Quick Dialect Sample Prompts */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Quick {currentDialectInfo.nativeName} Prompts (Click to test):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectSamplePrompt(currentDialectInfo.sampleAudioPrompt)}
                className="text-left px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs text-slate-700 transition cursor-pointer"
              >
                "{currentDialectInfo.sampleAudioPrompt.slice(0, 45)}..."
              </button>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {/* Push-to-Talk / Start Listening */}
              <button
                type="button"
                onClick={
                  conversationState === 'LISTENING'
                    ? () => handleProcessSpokenText(currentTranscript || currentDialectInfo.sampleAudioPrompt)
                    : handleStartListening
                }
                className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer ${
                  conversationState === 'LISTENING'
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-[#1E7B34] hover:bg-[#18682B] text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>
                  {conversationState === 'LISTENING'
                    ? 'Done Speaking (Submit)'
                    : `Speak in ${currentDialectInfo.nativeName}`}
                </span>
              </button>

              {/* BARGE-IN INTERRUPT BUTTON */}
              {conversationState === 'SPEAKING' && (
                <button
                  type="button"
                  onClick={handleBargeInInterrupt}
                  className="px-4 py-3 bg-[#F28C28] hover:bg-[#D97706] text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-sm transition cursor-pointer animate-bounce"
                  title="Interrupt AI speaking and talk immediately"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>🛑 Interrupt / टोकें (Barge-in)</span>
                </button>
              )}

              {conversationState === 'SPEAKING' && (
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition cursor-pointer"
                  title="Stop voice playback"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Launch Discovery from Voice Profile */}
            {extractedProfile && (
              <button
                type="button"
                onClick={() => {
                  if (onApplyProfileToDiscovery) {
                    onApplyProfileToDiscovery(extractedProfile);
                  }
                  onClose();
                }}
                className="px-4 py-2.5 bg-[#1B2A6B] hover:bg-[#142052] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <span>Run Scheme Discovery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
