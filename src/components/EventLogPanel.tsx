import React from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'DANGER' | 'CYAN';
}

interface EventLogPanelProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="w-full h-full bg-[#0d1117]/90 border border-[#1a1f2e] backdrop-blur-md rounded-lg p-3 font-mono shadow-2xl flex flex-col overflow-hidden text-xs">
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">
            SYSTEM EVENT LOG
          </span>
        </div>
        <span className="text-[8px] text-[#00f0ff] bg-[#00f0ff]/10 px-1.5 py-0.5 rounded border border-[#00f0ff]/20">
          REAL-TIME TELEMETRY STREAM
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[10px]">
        {logs.slice(-15).map((log) => {
          let colorClass = 'text-[#8b949e]';
          if (log.type === 'CYAN') colorClass = 'text-[#00f0ff]';
          if (log.type === 'SUCCESS') colorClass = 'text-[#00ff41]';
          if (log.type === 'WARN') colorClass = 'text-[#ff9000]';
          if (log.type === 'DANGER') colorClass = 'text-[#ff4b2b] font-bold';

          return (
            <div key={log.id} className="flex items-start gap-2 font-mono leading-tight">
              <span className="text-white/40 shrink-0">[{log.time}]</span>
              <span className={colorClass}>— {log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
