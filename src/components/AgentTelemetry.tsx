import React, { useRef, useEffect, useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronRight, Activity, Cpu } from 'lucide-react';
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
      if (step === 'DELIVER') return 'text-amber-300 font-semibold border-l-2 border-amber-400 bg-amber-950/10';
      return 'text-emerald-300 border-l-2 border-emerald-500 bg-emerald-950/10';
    }
    if (step.includes('TOOL') || step.includes('CSC') || step.includes('MOCK')) {
      if (['STARTING', 'IN_PROGRESS'].includes(status)) {
        return 'text-orange-300 border-l-2 border-orange-500 bg-orange-950/10';
      }
      return 'text-emerald-400 border-l-2 border-emerald-500 bg-emerald-950/10';
    }
    return 'text-sky-300 border-l-2 border-sky-500 bg-sky-950/10';
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col h-full min-h-[380px] max-h-[500px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Live Agent Telemetry Stream</span>
              {isLoading && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                  <Activity className="w-3 h-3" />
                  Running
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">Structured event lifecycle & intermediate payloads</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {events.length} Events
          </span>
        </div>
      </div>

      {/* Terminal log window */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 font-mono text-xs telemetry-scroll pr-1"
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 space-y-2">
            <Cpu className="w-8 h-8 opacity-40 animate-pulse-subtle" />
            <p className="text-xs">Waiting for citizen query execution...</p>
            <p className="text-[10px] text-slate-600">Events from all 6 lifecycle stages will stream here in real time</p>
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
                    <span className="font-bold text-[11px] tracking-wide whitespace-nowrap px-1 py-0.2 rounded bg-slate-800/60 border border-slate-700/50">
                      {ev.step}
                    </span>
                    {ev.simulated && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
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
                  <div className="mt-2 pt-2 border-t border-slate-700/60 bg-slate-950/60 p-2 rounded text-[11px] overflow-x-auto text-amber-200/90">
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
