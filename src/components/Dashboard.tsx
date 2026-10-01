import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  FileCheck2,
  Languages,
  Layers,
  Award,
  GraduationCap,
  HeartPulse,
  Home,
  CreditCard,
  Shield,
  Coins,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import schemesData from '../data/schemes.json';
import { Scheme } from '../types/agent';

interface DashboardProps {
  onGetStarted: () => void;
  onSelectScheme?: (scheme: Scheme) => void;
  searchFilter: string;
  onOpenProactive?: () => void;
}

const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: '/dashboard/slide-1.png',
    title: 'Connecting Millions to Opportunities',
    subtitle: 'Unified Access via myScheme & UMANG',
    tag: 'DIGITAL BHARAT',
  },
  {
    id: 2,
    image: '/dashboard/slide-2.png',
    title: 'Enabling Dreams through Achievement',
    subtitle: 'National Scholarship Portal on UMANG',
    tag: 'EDUCATION & NSP',
  },
  {
    id: 3,
    image: '/dashboard/slide-3.png',
    title: 'The Integrated Foundation',
    subtitle: 'Connected Civic Infrastructure for Every Citizen',
    tag: 'INTEROPERABLE STACK',
  },
  {
    id: 4,
    image: '/dashboard/slide-4.png',
    title: 'Your Path, Simplified.',
    subtitle: 'Guided Verification, Checkpoints & Award Confirmation',
    tag: 'ACTION ROADMAP',
  },
];

const SCHEME_ICONS: Record<string, React.ReactNode> = {
  pm_kisan: <Layers className="w-5 h-5 text-emerald-600" />,
  ayushman_bharat: <HeartPulse className="w-5 h-5 text-rose-600" />,
  pmay_g: <Home className="w-5 h-5 text-amber-600" />,
  kcc: <CreditCard className="w-5 h-5 text-blue-600" />,
  pm_kmy: <Shield className="w-5 h-5 text-indigo-600" />,
  pmjjby: <Shield className="w-5 h-5 text-teal-600" />,
  pmsby: <Shield className="w-5 h-5 text-cyan-600" />,
  nsp_post_matric: <GraduationCap className="w-5 h-5 text-purple-600" />,
  lakhpati_didi: <Coins className="w-5 h-5 text-orange-600" />,
  mudra_shishu: <Briefcase className="w-5 h-5 text-emerald-700" />,
};

export const Dashboard: React.FC<DashboardProps> = ({
  onGetStarted,
  onSelectScheme,
  searchFilter,
  onOpenProactive,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = CAROUSEL_SLIDES.length;

  // Respect prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-scroll every 4s
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Filter schemes based on search query
  const filteredSchemes = (schemesData as Scheme[]).filter((scheme) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      scheme.name.toLowerCase().includes(term) ||
      (scheme.name_hi && scheme.name_hi.toLowerCase().includes(term)) ||
      scheme.category.toLowerCase().includes(term) ||
      scheme.benefit_description.toLowerCase().includes(term)
    );
  });

  return (
    <section className="space-y-8 pt-2">
      {/* 0. Proactive Life-Event Welfare Radar Alert Bar */}
      {onOpenProactive && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-[#1B2A6B]/10 border-2 border-[#F28C28]/40 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F28C28] to-[#1E7B34] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              ⚡
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  Critical Weather Alert
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                  Pre-Search Assistance
                </span>
                <span className="text-xs text-slate-500">• IMD Nashik Hailstorm Warning</span>
              </div>
              <h3 className="font-extrabold text-[#1B2A6B] text-sm sm:text-base">
                Proactive Life-Event Detection: WhatsApp Welfare Kit Prepared
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1">
                Before you even searched, SchemeSetu analyzed recent weather &amp; Aadhaar updates and generated a proactive WhatsApp action message offering PMFBY &amp; KCC assistance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProactive}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Preview WhatsApp Alert</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Hero Row */}
      <div className="bg-gradient-to-br from-white via-slate-50/80 to-[#1B2A6B]/5 border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E7B34]/10 text-[#1E7B34] border border-[#1E7B34]/25 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Citizen Welfare Discovery</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1B2A6B] leading-[1.15]">
            Find every scheme <br />
            <span className="text-[#F28C28]">you deserve.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
            Speak or type in Hindi, Marathi, or English. Our autonomous agent performs 100% deterministic statutory eligibility verification and prepares your complete filing kit.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-sm rounded-[10px] shadow-md shadow-[#1E7B34]/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Free • Zero registration required • Instant result
            </span>
          </div>
        </div>

        {/* Stat Strip: 3 Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 shrink-0 sm:w-full lg:w-72">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 hover:border-[#1B2A6B]/30 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1B2A6B]/10 text-[#1B2A6B] flex items-center justify-center font-black text-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-[#1B2A6B]">10 Schemes</div>
              <div className="text-xs text-slate-500 font-medium">Flagship Central &amp; State</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 hover:border-[#F28C28]/30 transition">
            <div className="w-10 h-10 rounded-xl bg-[#F28C28]/10 text-[#F28C28] flex items-center justify-center font-black text-sm">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-[#F28C28]">3 Languages</div>
              <div className="text-xs text-slate-500 font-medium">Hindi • Marathi • English</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 hover:border-[#1E7B34]/30 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1E7B34]/10 text-[#1E7B34] flex items-center justify-center font-black text-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-[#1E7B34]">Action Pack</div>
              <div className="text-xs text-slate-500 font-medium">Downloadable Filing Kit (PDF)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Auto-Scrolling Image Carousel */}
      <div
        className="relative group rounded-[20px] overflow-hidden shadow-md border border-slate-200 bg-slate-900"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Viewport */}
        <div className="relative w-full aspect-16/9 sm:aspect-21/9 max-h-[460px] overflow-hidden">
          <div
            className="flex h-full transition-transform duration-600 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {CAROUSEL_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className="w-full h-full shrink-0 relative bg-slate-950 flex items-center justify-center"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Floating Caption Pill on Slide */}
                <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 z-10">
                  <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-2xl px-4 py-2.5 shadow-lg max-w-md">
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#F28C28] mb-0.5">
                      {slide.tag}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {slide.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 hidden sm:block">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Arrow Controls (Green Circular Buttons matching reference) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#1E7B34] hover:bg-[#18682B] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#1E7B34] hover:bg-[#18682B] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Clickable Dot Indicators */}
        <div className="absolute bottom-3 right-5 sm:bottom-4 sm:right-7 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
          {CAROUSEL_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-6 bg-[#1E7B34]' : 'w-2 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 3. Flagship Schemes Grid (Filtered by header search box) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-[#1B2A6B] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F28C28]" />
              <span>Flagship Citizen Welfare Schemes</span>
            </h3>
            <p className="text-xs text-slate-500">
              Explore key central &amp; state benefits available through SchemeSetu Bharat
            </p>
          </div>

          {searchFilter && (
            <span className="text-xs text-slate-500">
              Showing matches for: <strong className="text-[#1B2A6B]">"{searchFilter}"</strong>
            </span>
          )}
        </div>

        {filteredSchemes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No schemes found matching "{searchFilter}". Try searching by "Kisan", "Health", "Scholarship", or "Housing".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => {
                  if (onSelectScheme) onSelectScheme(scheme);
                  onGetStarted();
                }}
                className="bg-white border border-slate-200 hover:border-[#1E7B34] hover:shadow-md rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                      {SCHEME_ICONS[scheme.id] || <Layers className="w-5 h-5 text-slate-600" />}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {scheme.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-[#1B2A6B] line-clamp-2 leading-snug group-hover:text-[#1E7B34] transition-colors">
                    {scheme.name}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {scheme.benefit_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#1E7B34]">
                    ₹ {scheme.benefit_amount_inr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-[#1B2A6B] flex items-center gap-1 font-semibold">
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
