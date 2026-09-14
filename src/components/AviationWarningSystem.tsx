import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, AlertOctagon, Clock, Activity, Wrench, VolumeX, Eye } from 'lucide-react';
import { DatasetFaultMode } from '../data/fadecDataset';

export interface AviationWarningInfo {
  title: string;
  condition: string;
  severity: 'NORMAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';
  severityLabel: 'NOMINAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedSubsystem: string;
  recommendedAction: string;
  ehi: number;
  rul: number;
  anomalyScore: number;
}

interface AviationWarningSystemProps {
  activeFault: DatasetFaultMode;
  ehi: number;
  rulHours: number;
  anomalyScore: number;
  isAcknowledged: boolean;
  onAcknowledge: () => void;
  isPlaying: boolean;
  isAnimationPaused: boolean;
  onToggleAnimationPause: () => void;
  onInspectSubsystem?: (subsystemId: string) => void;
}

export function getAviationWarning(
  fault: DatasetFaultMode,
  ehi: number,
  rul: number,
  anomalyScore: number
): AviationWarningInfo {
  switch (fault.id) {
    case 'CYLINDER_MISFIRE':
      return {
        title: '⚠ ENGINE CRITICAL',
        condition: 'CYLINDER MISFIRE DETECTED',
        severity: 'CRITICAL',
        severityLabel: 'CRITICAL',
        affectedSubsystem: 'Cylinder / Combustion (Cylinder 4)',
        recommendedAction: 'INSPECT SPARK & IGNITION LEADS / RTB CORRIDOR',
        ehi: Math.min(ehi, 62),
        rul: Math.min(rul, 145),
        anomalyScore: Math.max(anomalyScore, 0.88),
      };
    case 'FUEL_INJECTOR_FAULT':
      return {
        title: '⚠ ENGINE WARNING',
        condition: 'FUEL INJECTION DEVIATION',
        severity: 'WARNING',
        severityLabel: 'HIGH',
        affectedSubsystem: 'Fuel System (Injector Rail & Nozzle)',
        recommendedAction: 'INSPECT INJECTOR / SWITCH SECONDARY MAP',
        ehi: Math.min(ehi, 74),
        rul: Math.min(rul, 240),
        anomalyScore: Math.max(anomalyScore, 0.65),
      };
    case 'LOW_OIL_PRESSURE':
      return {
        title: '⚠ ENGINE CRITICAL',
        condition: 'LOW OIL PRESSURE',
        severity: 'CRITICAL',
        severityLabel: 'CRITICAL',
        affectedSubsystem: 'Lubrication (Main Oil Gallery & Filter)',
        recommendedAction: 'REDUCE LOAD / IMMEDIATE INSPECTION',
        ehi: Math.min(ehi, 58),
        rul: Math.min(rul, 92),
        anomalyScore: Math.max(anomalyScore, 0.94),
      };
    case 'OVERHEATING':
      return {
        title: '⚠ ENGINE WARNING',
        condition: 'OVERHEATING TREND DETECTED',
        severity: 'WARNING',
        severityLabel: 'HIGH',
        affectedSubsystem: 'CHT / EGT (Power Cell Bank B)',
        recommendedAction: 'REDUCE LOAD / ENRICH MIXTURE (THROTTLE < 70%)',
        ehi: Math.min(ehi, 70),
        rul: Math.min(rul, 210),
        anomalyScore: Math.max(anomalyScore, 0.72),
      };
    case 'HIGH_VIBRATION':
      return {
        title: '⚠ ENGINE WARNING',
        condition: 'ABNORMAL VIBRATION DETECTED',
        severity: 'CRITICAL',
        severityLabel: 'HIGH',
        affectedSubsystem: 'Rotating Assembly (Propeller Hub & Crankshaft)',
        recommendedAction: 'INSPECT / LASER DYNAMIC PROPELLER BALANCING',
        ehi: Math.min(ehi, 64),
        rul: Math.min(rul, 218),
        anomalyScore: Math.max(anomalyScore, 0.85),
      };
    case 'SUPERCHARGER_BOOST_DROP':
      return {
        title: '⚠ SENSOR WARNING',
        condition: 'BOOST PRESSURE DEVIATION DETECTED',
        severity: 'CAUTION',
        severityLabel: 'MEDIUM',
        affectedSubsystem: 'Forced Induction / Boost Coupler Hoses',
        recommendedAction: 'VERIFY SENSOR & SILICONE HOSE COUPLERS',
        ehi: Math.min(ehi, 82),
        rul: Math.min(rul, 420),
        anomalyScore: Math.max(anomalyScore, 0.46),
      };
    case 'BEARING_WEAR_FRICTION':
      return {
        title: '⚠ ENGINE CAUTION',
        condition: 'BEARING FRICTION DEVIATION DETECTED',
        severity: 'CAUTION',
        severityLabel: 'MEDIUM',
        affectedSubsystem: 'Reduction Gearbox / Nose Bearings',
        recommendedAction: 'OIL SPECTROGRAPHIC METAL WEAR ANALYSIS',
        ehi: Math.min(ehi, 79),
        rul: Math.min(rul, 360),
        anomalyScore: Math.max(anomalyScore, 0.42),
      };
    default:
      return {
        title: 'ENGINE NORMAL',
        condition: 'ALL SUBSYSTEMS NOMINAL',
        severity: 'NORMAL',
        severityLabel: 'NOMINAL',
        affectedSubsystem: 'None - Standard Operations',
        recommendedAction: 'CONTINUE NOMINAL MISSION PROFILE',
        ehi,
        rul,
        anomalyScore,
      };
  }
}

export const AviationWarningSystem: React.FC<AviationWarningSystemProps> = ({
  activeFault,
  ehi,
  rulHours,
  anomalyScore,
  isAcknowledged,
  onAcknowledge,
  isPlaying,
  isAnimationPaused,
  onToggleAnimationPause,
  onInspectSubsystem,
}) => {
  const warning = getAviationWarning(activeFault, ehi, rulHours, anomalyScore);
  const isAbnormal = activeFault.id !== 'NORMAL_OPERATION';

  // Severity color styles
  const getSeverityBadgeClass = () => {
    switch (warning.severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-400';
      case 'WARNING':
        return 'bg-amber-600 text-white border-amber-300';
      case 'CAUTION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getContainerBorderClass = () => {
    if (!isAbnormal) return 'border-[#1e2d4d] bg-[#070e1e]/90';
    switch (warning.severity) {
      case 'CRITICAL':
        return isAcknowledged
          ? 'border-red-600/60 bg-[#160608]/95 shadow-[0_0_30px_rgba(220,38,38,0.25)]'
          : 'border-red-500 bg-[#1e0709]/95 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse';
      case 'WARNING':
        return isAcknowledged
          ? 'border-amber-600/60 bg-[#170e04]/95 shadow-[0_0_25px_rgba(217,119,6,0.25)]'
          : 'border-amber-500 bg-[#1f1204]/95 shadow-[0_0_35px_rgba(245,158,11,0.35)] animate-pulse';
      case 'CAUTION':
        return 'border-amber-500/60 bg-[#140e06]/95 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      default:
        return 'border-emerald-600/40 bg-[#06140e]/90';
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. PERSISTENT ENGINE HEALTH STATUS BAR (Requirement 13 & 16)               */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#050b18] border-b border-[#1e2d4d] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono select-none z-20">
        {/* Left: Engine Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              ENGINE STATUS:
            </span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border tracking-wider uppercase ${
                warning.severity === 'CRITICAL'
                  ? 'bg-red-950/80 border-red-500 text-red-300'
                  : warning.severity === 'WARNING'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : warning.severity === 'CAUTION'
                  ? 'bg-amber-900/40 border-amber-500/60 text-amber-200'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  warning.severity === 'CRITICAL'
                    ? 'bg-red-500 animate-ping'
                    : warning.severity === 'WARNING'
                    ? 'bg-amber-400 animate-pulse'
                    : warning.severity === 'CAUTION'
                    ? 'bg-amber-300'
                    : 'bg-emerald-400'
                }`}
              />
              <span>{warning.severity === 'NORMAL' ? 'NORMAL' : warning.severity}</span>
            </div>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* EHI */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">EHI:</span>
            <span
              className={`font-bold ${
                warning.ehi < 70
                  ? 'text-red-400'
                  : warning.ehi < 85
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {warning.ehi.toFixed(1)}%
            </span>
          </div>

          {/* Anomaly Score */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">ANOMALY SCORE:</span>
            <span
              className={`font-bold ${
                warning.anomalyScore > 0.6
                  ? 'text-red-400'
                  : warning.anomalyScore > 0.3
                  ? 'text-amber-400'
                  : 'text-[#00f0ff]'
              }`}
            >
              {warning.anomalyScore.toFixed(2)}
            </span>
          </div>

          {/* RUL */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">RUL:</span>
            <span className="font-bold text-[#00f0ff]">{warning.rul.toFixed(0)} h</span>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Current Fault */}
          <div className="hidden md:flex items-center gap-1">
            <span className="text-[10px] text-slate-400">CURRENT FAULT:</span>
            <span
              className={`font-bold uppercase ${
                isAbnormal ? 'text-amber-300' : 'text-slate-300'
              }`}
            >
              {activeFault.id === 'NORMAL_OPERATION' ? 'NOMINAL' : activeFault.name}
            </span>
          </div>
        </div>

        {/* Right: Digital Twin Synchronization Status (Requirement 16) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0a1428] border border-[#1e2d4d] text-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            <span className="text-slate-300">DIGITAL TWIN:</span>
            <span className="text-[#00f0ff] font-bold">SYNCHRONIZED</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0a1428] border border-[#1e2d4d] text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              {isPlaying ? 'LIVE TELEMETRY:' : 'TELEMETRY:'}
            </span>
            <span
              className={`font-bold ${
                isPlaying ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isPlaying ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>

          {/* Pause 3D Animation Button (Requirement 15) */}
          <button
            onClick={onToggleAnimationPause}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
              isAnimationPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-[#0a1428] text-slate-300 border-[#1e2d4d] hover:bg-[#0f1f3d] hover:text-white'
            }`}
            title="Toggle 3D Digital Twin physical animation"
          >
            {isAnimationPaused ? 'RESUME ANIMATION' : 'PAUSE ANIMATION'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP-CENTER REAL-TIME AVIATION WARNING OVERLAY (Requirements 6, 7, 8, 12)*/}
      {/* ========================================================================= */}
      {isAbnormal && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg pointer-events-auto select-none transition-all duration-300 animate-fade-in">
          <div
            className={`rounded-xl border backdrop-blur-xl p-3.5 flex flex-col gap-2 font-mono text-xs ${getContainerBorderClass()}`}
          >
            {/* Header row: Aviation annunciator title & severity badge */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`w-4 h-4 ${
                    warning.severity === 'CRITICAL'
                      ? 'text-red-400 animate-bounce'
                      : 'text-amber-400 animate-pulse'
                  }`}
                />
                <span className="text-sm font-bold text-white tracking-wide">
                  {warning.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadgeClass()}`}
                >
                  Severity: {warning.severityLabel}
                </span>
                {isAcknowledged && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-600">
                    ACKNOWLEDGED
                  </span>
                )}
              </div>
            </div>

            {/* Condition Announcement */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                ANOMALOUS CONDITION:
              </span>
              <p
                className={`text-sm font-bold uppercase mt-0.5 ${
                  warning.severity === 'CRITICAL'
                    ? 'text-red-300'
                    : 'text-amber-300'
                }`}
              >
                {warning.condition}
              </p>
            </div>

            {/* Metrics: EHI, RUL, Subsystem */}
            <div className="grid grid-cols-3 gap-2 py-1.5 px-2 rounded bg-black/40 border border-white/5 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 block">ENGINE HEALTH (EHI)</span>
                <span
                  className={`font-bold text-xs ${
                    warning.ehi < 70 ? 'text-red-400' : 'text-amber-400'
                  }`}
                >
                  {warning.ehi.toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">REMAINING LIFE (RUL)</span>
                <span className="font-bold text-xs text-[#00f0ff]">
                  {warning.rul.toFixed(0)} h
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">ANOMALY SCORE</span>
                <span className="font-bold text-xs text-amber-300">
                  {warning.anomalyScore.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Affected Subsystem */}
            <div className="text-[11px]">
              <span className="text-slate-400">Affected Subsystem: </span>
              <span className="text-white font-bold">{warning.affectedSubsystem}</span>
            </div>

            {/* Recommended Action */}
            <div className="text-[11px] bg-black/30 p-2 rounded border border-white/5 flex items-start gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#00f0ff] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 text-[10px] block">RECOMMENDED ACTION:</span>
                <span className="text-[#00f0ff] font-bold uppercase">
                  {warning.recommendedAction}
                </span>
              </div>
            </div>

            {/* Actions: Acknowledge & Subsystem Inspect */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-0.5">
              <span className="text-[10px] text-slate-400">
                {isAcknowledged
                  ? 'Alert acknowledged. Monitoring continues.'
                  : 'Action required by flight engineer.'}
              </span>

              <div className="flex items-center gap-2">
                {onInspectSubsystem && activeFault.affectedNode && (
                  <button
                    onClick={() => onInspectSubsystem(activeFault.affectedNode)}
                    className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1 transition-all"
                  >
                    <Eye className="w-3 h-3 text-[#00f0ff]" />
                    <span>INSPECT 3D PART</span>
                  </button>
                )}

                <button
                  onClick={onAcknowledge}
                  className={`px-3 py-1 text-[11px] font-bold rounded transition-all flex items-center gap-1.5 ${
                    isAcknowledged
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 active:scale-95'
                  }`}
                  disabled={isAcknowledged}
                >
                  <VolumeX className="w-3 h-3" />
                  <span>{isAcknowledged ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
