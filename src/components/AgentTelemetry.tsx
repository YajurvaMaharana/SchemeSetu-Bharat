import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Activity, ChevronDown, ChevronRight, Cpu } from 'lucide-react';
import { AgentEvent } from '../types/agent';

interface AgentTelemetryProps {
  events: AgentEvent[];
  isLoading: boolean;
}

export const AgentTelemetry: React.FC<AgentTelemetryProps> = ({ events, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getEventClass = (event: AgentEvent) => {
    const step = (event.step || '').toUpperCase();
    const status = (event.status || '').toUpperCase();

    if (status === 'ERROR') return 'text-rose-400 border-l-2 border-rose-500 bg-rose-950/20';
    if (step === 'DELIVER' || status === 'COMPLETED') {
      if (step === 'DELIVER') return 'text-amber-300 font-bold border-l-2 border-amber-400 bg-amber-950/20';
      return 'text-emerald-300 border-l-2 border-emerald-500 bg-emerald-950/15';
    }
    if (step.includes('TOOL') || step.includes('CSC') || step.includes('MOCK')) {
      if (['STARTING', 'IN_PROGRESS'].includes(status)) {
        return 'text-orange-300 border-l-2 border-orange-500 bg-orange-950/20';
      }
      return 'text-emerald-400 border-l-2 border-emerald-500 bg-emerald-950/20';
    }
    return 'text-sky-300 border-l-2 border-sky-500 bg-sky-950/15';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[420px] max-h-[540px]">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B2A6B]/10 text-[#1B2A6B] flex items-center justify-center font-bold text-sm border border-[#1B2A6B]/20">
            <Terminal className="w-5 h-5 text-[#1B2A6B]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2A6B] flex items-center gap-2">
              <span>Live Agent Telemetry Stream</span>
              {isLoading && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#1E7B34] bg-[#1E7B34]/10 px-2.5 py-0.5 rounded-full border border-[#1E7B34]/20 animate-pulse">
                  <Activity className="w-3 h-3" />
                  Processing
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">6-Stage Autonomous Execution Logs</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          {events.length} Events
        </span>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 font-mono text-xs telemetry-scroll bg-[#0B1329] border border-slate-800 rounded-xl p-3.5 shadow-inner"
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16 space-y-2">
            <Cpu className="w-9 h-9 opacity-30 animate-pulse-subtle text-slate-400" />
            <p className="text-xs text-slate-400 font-mono">Agent idle. Ready for citizen intake.</p>
            <p className="text-[10px] text-slate-500 text-center max-w-xs">
              Live deterministic verification, edge case reviews, and CSC locator calls will stream here.
            </p>
          </div>
        ) : (
          events.map((ev, idx) => {
            const hasData = ev.data && Object.keys(ev.data).length > 0;
            const isExpanded = Boolean(expandedIndices[idx]);
            const isTool =
              ev.step.includes('TOOL') ||
              ev.step.includes('CSC') ||
              ev.step.includes('MOCK');

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg transition-all ${getEventClass(ev)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="text-slate-500 text-[10px] whitespace-nowrap pt-0.5">
                      [{ev.timestamp}]
                    </span>
                    <span className="font-bold text-[10px] tracking-wide whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300">
                      {ev.step}
                    </span>
                    {ev.simulated && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1E7B34]/20 text-[#4ADE80] border border-[#1E7B34]/40 whitespace-nowrap">
                        SIMULATED
                      </span>
                    )}
                    <span className="text-slate-200 leading-relaxed font-normal break-words">
                      {isTool && ['STARTING', 'IN_PROGRESS'].includes(ev.status) && 'Calling Tool: '}
                      {isTool && ev.status === 'COMPLETED' && 'Tool Result: '}
                      {ev.message}
                    </span>
                  </div>

                  {hasData && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(idx)}
                      className="text-slate-400 hover:text-white p-0.5 transition cursor-pointer"
                      title="Inspect payload"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {hasData && isExpanded && (
                  <div className="mt-2 pt-2 border-t border-slate-700/60 bg-slate-950/80 p-2.5 rounded text-[11px] overflow-x-auto text-amber-200">
                    <pre>{JSON.stringify(ev.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
