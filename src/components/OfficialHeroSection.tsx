import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  Landmark,
  Languages,
  Check,
  FileCheck2,
  Award,
} from 'lucide-react';

interface OfficialHeroSectionProps {
  onGetStarted: () => void;
  onOpenProactive?: () => void;
}

export const OfficialHeroSection: React.FC<OfficialHeroSectionProps> = ({
  onGetStarted,
  onOpenProactive,
}) => {
  return (
    <section className="w-full bg-gradient-to-r from-white via-[#F0F6FF] to-[#E6F0FA] border-b border-slate-200/90 relative overflow-hidden">
      {/* Subtle Sovereign Pattern Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #CBD5E1 1px, transparent 1px), linear-gradient(to bottom, #CBD5E1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Subtle Ambient Light Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Edge-to-Edge Inner Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Bold, Modern, Left-Aligned Typography */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Government Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs text-xs font-bold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-[#1E7B34]" />
              <span className="text-[11px] uppercase tracking-wider text-gray-800 font-extrabold">
                Government of India • National Citizen Welfare Portal
              </span>
            </div>

            {/* Primary Left-Aligned Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.12]">
                Apni Yojana, <span className="text-[#F28C28]">Apna Haq.</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mt-2.5">
                  Discover Every Welfare Scheme <span className="text-[#1E7B34]">You Deserve.</span>
                </span>
              </h1>
            </div>

            {/* Sub-headline Paragraph in Dark Grey */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal max-w-xl text-left">
              An autonomous, 100% deterministic welfare benefits co-pilot for Indian citizens and Jan Seva Kendras. Enter demographic details or speak in your language to evaluate statutory entitlements instantly.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onGetStarted}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm rounded-xl shadow-md shadow-[#1E7B34]/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Find Schemes For You</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenProactive && (
                <button
                  type="button"
                  onClick={onOpenProactive}
                  className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-gray-800 font-bold text-sm rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F28C28]"></span>
                  </span>
                  <span className="text-[#F28C28]">⚡</span>
                  <span>Proactive Radar</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    Live
                  </span>
                </button>
              )}
            </div>

            {/* Official Statutory Trust Badges */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-600">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#1E7B34] shrink-0" />
                <span>100% Deterministic Rules</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#1E7B34] shrink-0" />
                <span>Direct Benefit Transfer (DBT)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#1E7B34] shrink-0" />
                <span>Hindi • Marathi • English</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Real-Life High-Resolution Photograph Layout */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 relative">
            {/* Photographic Card Showcase Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 bg-white group">
              {/* High-Resolution Real-Life Citizen Photograph */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src="/dashboard/slide-1.png"
                  alt="Real Indian citizens accessing government welfare services and DBT benefits"
                  className="w-full h-full object-cover select-none transform group-hover:scale-102 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />

                {/* Subtle Photographic Contrast Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Top-Right Floating Trust Chip */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-[#1E7B34]" />
                    <span>PFMS &amp; DBT Gateway Active</span>
                  </div>
                </div>

                {/* Bottom Left Floating Benefit Highlight Card */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
                  <div className="bg-white/95 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-lg max-w-[210px]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Max Statutory Cover
                    </span>
                    <div className="text-xl font-black text-[#1E7B34] leading-tight">
                      ₹5,00,000 / Yr
                    </div>
                    <span className="text-[10px] text-gray-600 block mt-0.5">
                      Cashless Health &amp; Farm Credit
                    </span>
                  </div>

                  <div className="bg-black/65 backdrop-blur-md border border-white/20 rounded-xl p-2.5 shadow-lg text-right text-white">
                    <div className="text-base font-black text-amber-300">
                      766 Districts
                    </div>
                    <span className="text-[10px] text-slate-200 block">
                      Pan-India Coverage
                    </span>
                  </div>
                </div>
              </div>

              {/* Lower Photographic Metadata Bar */}
              <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#1B2A6B]" />
                  <span className="font-bold text-gray-800">Direct Citizen Delivery</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  Aadhaar • 7/12 Land • Ration
                </span>
              </div>
            </div>

            {/* Quick Civic Metric Badges Below Image */}
            <div className="grid grid-cols-3 gap-2.5 mt-3 text-center">
              <div className="bg-white/90 border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
                <div className="text-sm font-black text-gray-900">10 Schemes</div>
                <div className="text-[10px] text-gray-500 font-medium">Flagship Portals</div>
              </div>
              <div className="bg-white/90 border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
                <div className="text-sm font-black text-[#F28C28]">₹14,500+ Cr</div>
                <div className="text-[10px] text-gray-500 font-medium">Benefits Mapped</div>
              </div>
              <div className="bg-white/90 border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
                <div className="text-sm font-black text-[#1E7B34]">Instant</div>
                <div className="text-[10px] text-gray-500 font-medium">DigiLocker e-KYC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
