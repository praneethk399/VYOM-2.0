import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Bell, AlertOctagon, Check } from 'lucide-react';

export type WarningSeverity = 'NORMAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';

export interface EngineWarningData {
  id: string;
  title: string;
  subtitle: string;
  severity: WarningSeverity;
  affectedSubsystem: string;
  action: string;
  ehi: number;
  rulHours: number;
  anomalyScore: number;
  timestamp: string;
}

interface AviationWarningOverlayProps {
  warning: EngineWarningData | null;
  isAcknowledged: boolean;
  onAcknowledge: () => void;
  onClearIfNormalized: () => void;
  isEngineNormal: boolean;
}

export const AviationWarningOverlay: React.FC<AviationWarningOverlayProps> = ({
  warning,
  isAcknowledged,
  onAcknowledge,
  onClearIfNormalized,
  isEngineNormal,
}) => {
  if (!warning || warning.severity === 'NORMAL') {
    return null;
  }

  // Restrained professional aerospace colors
  const getSeverityStyle = (sev: WarningSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          border: 'border-red-600',
          bg: 'bg-red-950/90',
          badgeBg: 'bg-red-600 text-white',
          textColor: 'text-red-400',
          titleColor: 'text-red-200',
          glow: isAcknowledged ? '' : 'shadow-[0_0_30px_rgba(220,38,38,0.45)]',
          pulse: isAcknowledged ? '' : 'animate-pulse',
        };
      case 'WARNING':
        return {
          border: 'border-amber-600',
          bg: 'bg-[#1a1103]/95',
          badgeBg: 'bg-amber-600 text-white',
          textColor: 'text-amber-400',
          titleColor: 'text-amber-200',
          glow: isAcknowledged ? '' : 'shadow-[0_0_25px_rgba(217,119,6,0.35)]',
          pulse: isAcknowledged ? '' : 'animate-pulse',
        };
      case 'CAUTION':
        return {
          border: 'border-yellow-600/80',
          bg: 'bg-[#171405]/95',
          badgeBg: 'bg-yellow-600 text-black',
          textColor: 'text-yellow-400',
          titleColor: 'text-yellow-200',
          glow: '',
          pulse: '',
        };
      default:
        return {
          border: 'border-emerald-600',
          bg: 'bg-emerald-950/90',
          badgeBg: 'bg-emerald-600 text-white',
          textColor: 'text-emerald-400',
          titleColor: 'text-emerald-200',
          glow: '',
          pulse: '',
        };
    }
  };

  const style = getSeverityStyle(warning.severity);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-xl w-[92vw] sm:w-[540px]">
      <div
        className={`rounded-lg border-2 ${style.border} ${style.bg} ${style.glow} backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-300 font-sans`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            {warning.severity === 'CRITICAL' ? (
              <AlertOctagon className={`w-5 h-5 text-red-500 shrink-0 ${style.pulse}`} />
            ) : (
              <AlertTriangle className={`w-5 h-5 text-amber-500 shrink-0 ${style.pulse}`} />
            )}
            <span className="font-bold text-xs tracking-wider uppercase text-white font-heading">
              ⚠ ENGINE WARNING
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${style.badgeBg}`}
            >
              Severity: {warning.severity}
            </span>
            {isAcknowledged && (
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-700/80 text-slate-300 font-mono flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> ACK'D
              </span>
            )}
          </div>
        </div>

        {/* Warning Body */}
        <div className="py-2.5">
          <div className="flex items-baseline justify-between">
            <h4 className={`text-base font-bold tracking-wide uppercase ${style.titleColor}`}>
              {warning.title}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{warning.timestamp}</span>
          </div>

          <p className="text-xs text-slate-300 mt-0.5 font-normal">
            Affected Subsystem: <span className="text-white font-medium">{warning.affectedSubsystem}</span>
          </p>

          {/* Telemetry Impact Metrics */}
          <div className="grid grid-cols-3 gap-2 my-2.5 p-2 rounded bg-black/40 border border-white/10 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono">Engine Health (EHI)</span>
              <span
                className={`font-bold text-sm ${
                  warning.ehi < 70 ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {warning.ehi}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono">Projected RUL</span>
              <span className="font-bold text-sm text-white font-mono">
                {warning.rulHours} h
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono">Anomaly Residual</span>
              <span className="font-bold text-sm text-amber-300 font-mono">
                {warning.anomalyScore.toFixed(3)}
              </span>
            </div>
          </div>

          <div className="text-xs flex items-center gap-1.5 text-slate-200">
            <span className="text-slate-400 font-mono text-[11px]">Recommended Action:</span>
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10 tracking-wide uppercase">
              {warning.action}
            </span>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-1">
          <div className="text-[10px] text-slate-400 font-mono">
            {isAcknowledged
              ? 'Warning acknowledged. Active until nominal telemetry confirmed.'
              : 'Action required: Acknowledge alert and execute technical procedure.'}
          </div>

          <div className="flex items-center gap-2">
            {!isAcknowledged && (
              <button
                onClick={onAcknowledge}
                className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ACKNOWLEDGE</span>
              </button>
            )}

            {isEngineNormal && (
              <button
                onClick={onClearIfNormalized}
                className="px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CLEAR AFTER NORMALIZATION</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
