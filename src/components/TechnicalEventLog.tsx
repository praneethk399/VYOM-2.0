import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ShieldAlert } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
}

interface TechnicalEventLogProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
}

export const TechnicalEventLog: React.FC<TechnicalEventLogProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/30';
      case 'WARN':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'CRITICAL':
        return 'text-[#ff4b2b] bg-[#ff4b2b]/15 border-[#ff4b2b]/40 font-bold';
      default:
        return 'text-[#00f0ff] bg-[#00f0ff]/5 border-[#00f0ff]/20';
    }
  };

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] rounded-lg p-3 font-mono shadow-xl flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-1.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
          <h3 className="text-xs font-bold text-slate-200 tracking-wider">
            TECHNICAL EVENT CONSOLE & DIAGNOSTIC AUDIT LOG
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#8b949e]">
            {logs.length} EVENTS RECORDED
          </span>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-[#8b949e] hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
              title="Clear event log"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Output Window */}
      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto bg-[#05070a] border border-[#1a1f2e] rounded p-2 text-[10px] space-y-1.5"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-4">No events logged yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 font-mono">[{log.timestamp}]</span>
              <span
                className={`px-1 py-0.2 rounded text-[8px] uppercase tracking-wider shrink-0 border ${getTypeStyle(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
