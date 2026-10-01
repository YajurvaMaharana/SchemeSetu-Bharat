import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Volume2,
  ThumbsUp,
  Share2,
  Sparkles,
  X,
  Play,
  CheckCircle2,
  HelpCircle,
  Plus,
  Send,
  Radio,
} from 'lucide-react';
import { SupportedLanguage } from '../data/translations';
import { UserProfile } from '../types/agent';

interface PeerCommunityVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  language: SupportedLanguage;
}

interface ForumStory {
  id: string;
  authorName: string;
  villageDistrict: string;
  state: string;
  schemeTag: string;
  schemeTagHi: string;
  amountReceivedInr: number;
  timeframe: string;
  audioDuration: string;
  dialectTag: string;
  storyText: string;
  upvotes: number;
  verifiedBeneficiary: boolean;
}

const FORUM_STORIES: ForumStory[] = [
  {
    id: 'story-1',
    authorName: 'Sunita Devi',
    villageDistrict: 'Vaishali',
    state: 'Bihar',
    schemeTag: 'PMAY-Gramin',
    schemeTagHi: 'पीएम आवास योजना',
    amountReceivedInr: 120000,
    timeframe: 'Received in 28 Days',
    audioDuration: '0:42',
    dialectTag: 'Bhojpuri (भोजपुरी)',
    storyText: 'हमार पक्का मकान ना रहे। हम योजनासाथी से जियो-टैगिंग के बाद फॉर्म भरली आ बिना कवनो घूस के सीधे 1 लाख 20 हजार रुपिया खाता में आ गईल। अपना पंचायत के मुखिया से मिले के जरूरत ना परल!',
    upvotes: 428,
    verifiedBeneficiary: true,
  },
  {
    id: 'story-2',
    authorName: 'Kailash Ram Choudhary',
    villageDistrict: 'Nagaur',
    state: 'Rajasthan',
    schemeTag: 'PM-KUSUM Solar',
    schemeTagHi: 'पीएम कुसुम सोलर पंप',
    amountReceivedInr: 240000,
    timeframe: 'Installed in 45 Days',
    audioDuration: '0:55',
    dialectTag: 'Marwari (मारवाड़ी)',
    storyText: 'म्हे 5 HP रो सोलर पंप लगवायो। सरकार रो 60% अनुदान मिल्यो अर म्हारो डीजल रो खर्च 7000 रुपिया महीना रो बच गयो। थारे खेत मांय भी ट्यूबवेल है त तुरंत अर्जी लगाओ!',
    upvotes: 312,
    verifiedBeneficiary: true,
  },
  {
    id: 'story-3',
    authorName: 'Dattatray Patil',
    villageDistrict: 'Nashik',
    state: 'Maharashtra',
    schemeTag: 'KCC Loan',
    schemeTagHi: 'किसान क्रेडिट कार्ड',
    amountReceivedInr: 300000,
    timeframe: 'Approved in 14 Days',
    audioDuration: '0:38',
    dialectTag: 'Marathi (मराठी)',
    storyText: 'मी बँकेत जाऊन KCC ची मागणी केली, 4% दराने ₹3,00,000 मंजूर झाले. पीक विम्याचे पैसे थेट खात्यात जमा झाले. योजनासाथीने योग्य कागदपत्रे वेळेवर जोडली होती.',
    upvotes: 289,
    verifiedBeneficiary: true,
  },
];

export const PeerCommunityVoiceModal: React.FC<PeerCommunityVoiceModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  language,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [upvotesState, setUpvotesState] = useState<Record<string, number>>({});
  const [hasUpvoted, setHasUpvoted] = useState<Record<string, boolean>>({});
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isQuestionSubmitted, setIsQuestionSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePlayVoice = (story: ForumStory) => {
    if (playingId === story.id) {
      window.speechSynthesis?.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis?.cancel();
    setPlayingId(story.id);

    const utterance = new SpeechSynthesisUtterance(story.storyText);
    utterance.lang = story.dialectTag.includes('Marathi') ? 'mr-IN' : 'hi-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleUpvote = (id: string, initial: number) => {
    if (hasUpvoted[id]) return;
    setUpvotesState((prev) => ({ ...prev, [id]: (prev[id] || initial) + 1 }));
    setHasUpvoted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1B2A6B] to-[#F28C28] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Peer-to-Peer Voice Community Network (Pillar 9)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#1B2A6B]">
                  Verified Neighbor Stories
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Listen to audio testimonials in local dialects (Bhojpuri, Marwari, Marathi) &amp; ask community questions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
          {/* Ask Question Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1B2A6B]" />
              <span className="text-xs font-bold text-slate-800">
                Ask Local Community a Welfare Question:
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="e.g. How long did it take to get your KCC card approved in Nashik?"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#F28C28]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!userQuestion.trim()) return;
                  setIsQuestionSubmitted(true);
                  setUserQuestion('');
                  setTimeout(() => setIsQuestionSubmitted(false), 3000);
                }}
                className="px-5 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>

            {isQuestionSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#1E7B34] font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your question has been broadcast to verified local beneficiaries in your district!</span>
              </div>
            )}
          </div>

          {/* Verified Neighbor Voice Testimonials List */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Verified Neighbor Voice Stories:
            </span>

            {FORUM_STORIES.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#1B2A6B] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {story.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">
                          {story.authorName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Beneficiary</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {story.villageDistrict}, {story.state} | {story.dialectTag}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-black text-xs">
                      +₹{story.amountReceivedInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Dialect Story Quote */}
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  "{story.storyText}"
                </p>

                {/* Voice Player & Upvote Controls */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(story)}
                    className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
                      playingId === story.id
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-[#1B2A6B] hover:bg-[#142052] text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>
                      {playingId === story.id
                        ? 'Playing Audio (Stop)'
                        : `Listen in ${story.dialectTag.split(' ')[0]} (${story.audioDuration})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpvote(story.id, upvotesState[story.id] || story.upvotes)
                    }
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      hasUpvoted[story.id]
                        ? 'bg-emerald-50 text-[#1E7B34] border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({upvotesState[story.id] || story.upvotes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by <strong>YojanaSathi ApnaAdhikar ("Your Right")</strong> Peer Network.
          </span>
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Forum
          </button>
        </div>
      </div>
    </div>
  );
};
