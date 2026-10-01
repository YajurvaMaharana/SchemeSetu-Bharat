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
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-blue-950/30 border border-amber-300 dark:border-amber-700/60 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F28C28] to-[#1E7B34] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              ⚡
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  Weather Alert
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#1E7B34] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Direct Support
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">• Hailstorm &amp; Rain Advisory</span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Quick Help for Recent Events: WhatsApp Message Ready
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                We checked recent weather updates and created a simple WhatsApp message to help you get crop insurance and support.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProactive}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1E7B34] hover:bg-[#18682B] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Open WhatsApp Alert</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Auto-Scrolling Image Carousel */}
      <div
        className="relative group rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-900"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Viewport */}
        <div className="relative w-full aspect-16/9 sm:aspect-21/9 max-h-[440px] overflow-hidden">
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

        {/* Carousel Arrow Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1E7B34] hover:bg-[#18682B] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1E7B34] hover:bg-[#18682B] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
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

      {/* 3. Top Schemes Grid (Filtered by header search box) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-black text-[#002d61] dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F28C28]" />
              <span>Top Government Schemes</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Explore government money and support programs for you and your family
            </p>
          </div>

          {searchFilter && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing matches for: <strong className="text-[#002d61] dark:text-slate-100">"{searchFilter}"</strong>
            </span>
          )}
        </div>

        {filteredSchemes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
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
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-md rounded-3xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                      {SCHEME_ICONS[scheme.id] || <Layers className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {scheme.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {scheme.name}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {scheme.benefit_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-3 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                    ₹ {scheme.benefit_amount_inr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 group-hover:text-[#002d61] dark:group-hover:text-slate-100 flex items-center gap-1 font-semibold">
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
