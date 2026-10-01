import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  CheckCircle,
  Star,
  Users,
  Calendar,
  Zap,
  ChevronRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { CscCenter, UserProfile } from '../types/agent';
import { find5NearestCscs } from '../services/cscLocator';

interface CscCenterCardProps {
  csc?: CscCenter | null;
  nearbyCscs?: CscCenter[] | null;
  userProfile?: UserProfile | null;
  onBookAppointment?: (center: CscCenter) => void;
}

export const CscCenterCard: React.FC<CscCenterCardProps> = ({
  csc,
  nearbyCscs,
  userProfile,
  onBookAppointment,
}) => {
  // If nearbyCscs not passed, calculate the 5 nearest based on user profile or csc location
  const centers: CscCenter[] =
    nearbyCscs && nearbyCscs.length > 0
      ? nearbyCscs
      : find5NearestCscs(
          userProfile?.district || csc?.district,
          userProfile?.pincode || csc?.pin_code,
          userProfile?.state || csc?.state
        );

  const [selectedCenterIndex, setSelectedCenterIndex] = useState<number>(0);

  const activeCenter: CscCenter = centers[selectedCenterIndex] || centers[0] || csc;
  if (!activeCenter) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 text-slate-800" id="csc-card-section">
      {/* Header with Title & Badge */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B2A6B] to-[#1E7B34] text-white flex items-center justify-center shadow-xs shrink-0">
            <Building2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#1B2A6B]">
                5 Nearest CSC Helpdesks
              </h3>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                LIVE QUEUE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Real-time wait prediction &amp; VLE ratings in {activeCenter.district}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          Simulated
        </span>
      </div>

      {/* 5-Center Mini Tab Switcher */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
          <span>Select Center:</span>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Nearest: {centers[0]?.distance_km} km
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
          {centers.map((c, idx) => {
            const isSelected = selectedCenterIndex === idx;
            return (
              <button
                key={c.id || idx}
                type="button"
                onClick={() => setSelectedCenterIndex(idx)}
                className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-white text-[#1B2A6B] font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className="text-[11px] font-bold">#{idx + 1}</span>
                <span className="text-[9px] font-mono text-emerald-700 font-extrabold">
                  {c.distance_km}km
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Selected Center Details Card */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-3.5">
        {/* Center Name & Distance */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-extrabold text-sm text-[#1B2A6B]">
              {activeCenter.name}
            </h4>
            <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#F28C28] shrink-0 mt-0.5" />
              <span className="leading-snug text-[11px]">{activeCenter.address}</span>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-[#1E7B34] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0">
            {activeCenter.distance_km} km away
          </span>
        </div>

        {/* Real-Time Live Queue & VLE Rating Strip */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
          {/* VLE Rating */}
          <div className="space-y-0.5 border-r border-slate-100 pr-1">
            <span className="text-[10px] text-slate-400 block font-medium">VLE Rating</span>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <strong className="text-xs text-slate-900 font-extrabold">
                {activeCenter.vle_rating || 4.9}
              </strong>
            </div>
            <span className="text-[9px] text-slate-400 block">
              ({activeCenter.vle_rating_count || 184} rev)
            </span>
          </div>

          {/* Real-Time Queue Length */}
          <div className="space-y-0.5 border-r border-slate-100 px-1">
            <span className="text-[10px] text-slate-400 block font-medium">Queue</span>
            <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-blue-700">
              <Users className="w-3.5 h-3.5" />
              <span>{activeCenter.current_queue_length} citizens</span>
            </div>
            <span className="text-[9px] text-slate-500 block">
              {activeCenter.active_counters || 2} active desks
            </span>
          </div>

          {/* Predicted Wait Time */}
          <div className="space-y-0.5 pl-1">
            <span className="text-[10px] text-slate-400 block font-medium">Wait Time</span>
            <div
              className={`flex items-center justify-center gap-1 text-xs font-black ${
                (activeCenter.predicted_wait_time_minutes || 6) <= 8
                  ? 'text-[#1E7B34]'
                  : (activeCenter.predicted_wait_time_minutes || 6) <= 18
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>~{activeCenter.predicted_wait_time_minutes} mins</span>
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider block ${
                activeCenter.crowd_level === 'LOW'
                  ? 'text-[#1E7B34]'
                  : activeCenter.crowd_level === 'MODERATE'
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {activeCenter.crowd_level || 'LOW'} CROWD
            </span>
          </div>
        </div>

        {/* VLE Contact & Hours */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#1E7B34] shrink-0" />
            <span className="text-[11px]">
              <strong>VLE:</strong> {activeCenter.vle_name} ({activeCenter.phone})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#1B2A6B] shrink-0" />
            <span className="text-[11px]">{activeCenter.hours}</span>
          </div>
        </div>

        {/* Facilities Chips */}
        {activeCenter.facilities && activeCenter.facilities.length > 0 && (
          <div className="pt-2 border-t border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Available Biometric &amp; Verification Facilities:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeCenter.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 shadow-2xs"
                >
                  <CheckCircle className="w-3 h-3 text-[#1E7B34] shrink-0" />
                  <span>{fac}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Book Priority Appointment & Map Directions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            if (onBookAppointment) {
              onBookAppointment(activeCenter);
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1E7B34] hover:bg-[#18682B] text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Priority Appointment</span>
        </button>

        <a
          href={
            activeCenter.maps_url ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              activeCenter.name + ' ' + activeCenter.address
            )}`
          }
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition shadow-2xs"
        >
          <span>Directions on Map</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>
    </div>
  );
};
