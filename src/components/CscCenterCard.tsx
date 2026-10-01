import React from 'react';
import { Building2, MapPin, Phone, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import { CscCenter } from '../types/agent';

interface CscCenterCardProps {
  csc?: CscCenter | null;
}

export const CscCenterCard: React.FC<CscCenterCardProps> = ({ csc }) => {
  if (!csc) return null;

  return (
    <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-start justify-between gap-2 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Nearest CSC Center</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SIMULATED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Digital Seva Kendra & e-KYC Desk</p>
          </div>
        </div>

        {csc.distance_km && (
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 whitespace-nowrap">
            {csc.distance_km} km away
          </span>
        )}
      </div>

      <div className="space-y-2.5 text-xs text-slate-300">
        <div className="font-semibold text-slate-100 text-sm">{csc.name}</div>

        <div className="flex items-start gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{csc.address}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>VLE: {csc.vle_name || 'Kendra Operator'} ({csc.phone || '+91 98721 04512'})</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{csc.hours || 'Mon-Sat 9:30 AM - 5:30 PM'}</span>
        </div>
      </div>

      {csc.facilities && csc.facilities.length > 0 && (
        <div className="pt-2 border-t border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Available Biometric & Govt Facilities:</div>
          <div className="space-y-1">
            {csc.facilities.map((fac, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
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
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold transition"
        >
          <span>Get Directions on Map</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </div>
  );
};
