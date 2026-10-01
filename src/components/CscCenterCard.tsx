import React from 'react';
import { Building2, MapPin, Phone, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import { CscCenter } from '../types/agent';

interface CscCenterCardProps {
  csc?: CscCenter | null;
}

export const CscCenterCard: React.FC<CscCenterCardProps> = ({ csc }) => {
  if (!csc) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#F28C28]/10 text-[#F28C28] flex items-center justify-center border border-[#F28C28]/25">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1B2A6B]">Nearest CSC Center</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1E7B34]/15 text-[#1E7B34] border border-[#1E7B34]/30">
                SIMULATED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Digital Seva Kendra &amp; e-KYC Desk</p>
          </div>
        </div>

        {csc.distance_km && (
          <span className="text-xs font-mono font-bold text-[#1E7B34] bg-[#1E7B34]/10 px-2.5 py-1 rounded-lg border border-[#1E7B34]/20 whitespace-nowrap">
            {csc.distance_km} km away
          </span>
        )}
      </div>

      <div className="space-y-2.5 text-xs text-slate-600">
        <div className="font-bold text-slate-900 text-sm">{csc.name}</div>

        <div className="flex items-start gap-2 text-slate-600">
          <MapPin className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
          <span className="leading-relaxed">{csc.address}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-4 h-4 text-[#1E7B34] shrink-0" />
          <span>VLE: {csc.vle_name || 'Kendra Operator'} ({csc.phone || '+91 98721 04512'})</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-[#1B2A6B] shrink-0" />
          <span>{csc.hours || 'Mon-Sat 9:30 AM - 5:30 PM'}</span>
        </div>
      </div>

      {csc.facilities && csc.facilities.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-[#1B2A6B] mb-2">Available Biometric &amp; Govt Facilities:</div>
          <div className="space-y-1.5">
            {csc.facilities.map((fac, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-[#1E7B34] shrink-0" />
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <a
          href={csc.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(csc.name + ' ' + csc.address)}`}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition shadow-2xs"
        >
          <span>Get Directions on Map</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>
    </div>
  );
};
