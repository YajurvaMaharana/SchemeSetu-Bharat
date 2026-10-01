import React from 'react';
import {
  Bell,
  Sparkles,
  MapPin,
  Users,
  Mic,
  Layers,
  ShieldAlert,
  Trophy,
  MessageSquare,
  Calculator,
} from 'lucide-react';

interface PillarsHubBarProps {
  onOpenProactive: () => void;
  onOpenPortalRPA: () => void;
  onScrollToCSC: () => void;
  onOpenFamilyOptimizer: () => void;
  onOpenVoiceCopilot: () => void;
  onOpenSmartVault: () => void;
  onOpenStatusTracker: () => void;
  onOpenEducation: () => void;
  onOpenPeerCommunity: () => void;
  onOpenWhatIfCalculator: () => void;
}

export const PillarsHubBar: React.FC<PillarsHubBarProps> = ({
  onOpenProactive,
  onOpenPortalRPA,
  onScrollToCSC,
  onOpenFamilyOptimizer,
  onOpenVoiceCopilot,
  onOpenSmartVault,
  onOpenStatusTracker,
  onOpenEducation,
  onOpenPeerCommunity,
  onOpenWhatIfCalculator,
}) => {
  const pillars = [
    {
      id: 'p1',
      number: '1',
      title: 'Proactive Radar',
      subtitle: 'Life-Event WhatsApp',
      icon: Bell,
      color: 'bg-amber-500',
      action: onOpenProactive,
    },
    {
      id: 'p2',
      number: '2',
      title: 'Application Autopilot',
      subtitle: '25+ Field Portal RPA',
      icon: Sparkles,
      color: 'bg-emerald-600',
      action: onOpenPortalRPA,
    },
    {
      id: 'p3',
      number: '3',
      title: 'Offline CSC Radar',
      subtitle: '5 Centers & Queues',
      icon: MapPin,
      color: 'bg-blue-600',
      action: onScrollToCSC,
    },
    {
      id: 'p4',
      number: '4',
      title: 'Family 5-Yr Optimizer',
      subtitle: 'Combinatorial Engine',
      icon: Users,
      color: 'bg-indigo-600',
      action: onOpenFamilyOptimizer,
    },
    {
      id: 'p5',
      number: '5',
      title: 'Vernacular Voice',
      subtitle: 'Bhojpuri & Marwari',
      icon: Mic,
      color: 'bg-purple-600',
      action: onOpenVoiceCopilot,
    },
    {
      id: 'p6',
      number: '6',
      title: 'Smart Pre-Flight Vault',
      subtitle: '<10% Rejection Defense',
      icon: Layers,
      color: 'bg-teal-600',
      action: onOpenSmartVault,
    },
    {
      id: 'p7',
      number: '7',
      title: 'Status & Escalation',
      subtitle: 'RTI & Collector Mail',
      icon: ShieldAlert,
      color: 'bg-rose-600',
      action: onOpenStatusTracker,
    },
    {
      id: 'p8',
      number: '8',
      title: 'Gamified Education',
      subtitle: '2-Min Micro Courses',
      icon: Trophy,
      color: 'bg-amber-600',
      action: onOpenEducation,
    },
    {
      id: 'p9',
      number: '9',
      title: 'Peer Voice Network',
      subtitle: 'Local Neighbor Forum',
      icon: MessageSquare,
      color: 'bg-blue-700',
      action: onOpenPeerCommunity,
    },
    {
      id: 'p10',
      number: '10',
      title: 'What-If ROI Calculator',
      subtitle: 'Tractor / FPO Grants',
      icon: Calculator,
      color: 'bg-emerald-700',
      action: onOpenWhatIfCalculator,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1B2A6B] text-white flex items-center justify-center font-black text-xs">
            10
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-slate-900">
              YojanaSathi ApnaAdhikar — Core 10 Pillars Hub
            </h4>
            <span className="text-[11px] text-slate-500">
              Autonomous civic welfare discovery, execution &amp; defense co-pilot.
            </span>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-[#1E7B34] border border-emerald-200 self-start sm:self-auto">
          All 10 Pillars Active
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
        {pillars.map((p) => {
          const IconComponent = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={p.action}
              className="p-2.5 bg-slate-50 hover:bg-white hover:border-[#1B2A6B] hover:shadow-md border border-slate-200 rounded-2xl text-left transition flex flex-col justify-between gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-xl ${p.color} text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{p.number}
                </span>
              </div>

              <div>
                <span className="font-extrabold text-[11px] text-slate-800 leading-tight block truncate">
                  {p.title}
                </span>
                <span className="text-[9px] text-slate-500 leading-tight block truncate mt-0.5">
                  {p.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
