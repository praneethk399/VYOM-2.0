import React from 'react';
import { MissionDecision } from '../types/engine';
import { GitFork, ArrowDown, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface MissionDecisionEngineProps {
  engineHealthIndex: number;
  anomalyDetected: boolean;
  classifiedFault: string;
  estimatedRulHours: number;
  missionDecision: MissionDecision;
}

export const MissionDecisionEngine: React.FC<MissionDecisionEngineProps> = ({
  engineHealthIndex,
  anomalyDetected,
  classifiedFault,
  estimatedRulHours,
  missionDecision,
}) => {
  const isBelowThreshold = engineHealthIndex < 80;

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] backdrop-blur-md rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-[#e0e6ed] uppercase">
            AUTONOMOUS MISSION DECISION LOGIC
          </h2>
        </div>
        <span className="text-[9px] text-[#00f0ff] bg-[#00f0ff]/5 px-2 py-0.5 rounded border border-[#00f0ff]/20 uppercase">
          STANAG 4671 COMPLIANT AIRWORTHINESS RULE TREE
        </span>
      </div>

      {/* Visual Flowchart following exact prompt specification */}
      <div className="bg-black/40 p-4 rounded-lg border border-[#1a1f2e] flex flex-col items-center gap-3 text-xs">
        {/* Step 1: ENGINE HEALTH */}
        <div className="p-2.5 rounded bg-[#161b22] border border-[#00f0ff]/40 text-center w-56 shadow-md">
          <span className="text-[9px] text-[#8b949e] uppercase block">ROOT TELEMETRY</span>
          <span className="text-xs font-extrabold text-white">ENGINE HEALTH ({engineHealthIndex.toFixed(0)}%)</span>
        </div>

        <ArrowDown className="w-4 h-4 text-[#8b949e]" />

        {/* Step 2: ANOMALY DETECTED? */}
        <div className={`p-2.5 rounded border text-center w-56 transition-all ${
          anomalyDetected
            ? 'bg-[#ff9000]/10 border-[#ff9000] text-[#ff9000] font-bold shadow-[0_0_12px_rgba(255,144,0,0.3)]'
            : 'bg-[#161b22] border-[#1a1f2e] text-white'
        }`}>
          <span className="text-[9px] text-[#8b949e] uppercase block">ISOLATION FOREST CHECK</span>
          <span className="text-xs font-bold">ANOMALY DETECTED?</span>
        </div>

        {/* Branch: NO -> CONTINUE / YES -> CLASSIFY */}
        <div className="w-full max-w-lg grid grid-cols-2 gap-6 relative">
          {/* Left Branch (NO) */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] text-[#00ff41] font-bold flex items-center gap-1">
              <span>↙ [NO]</span>
            </div>
            <div className={`p-2.5 rounded border text-center w-full ${
              !anomalyDetected
                ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41] font-bold'
                : 'bg-black/20 border-[#1a1f2e] text-[#8b949e]'
            }`}>
              <span className="text-[9px] block">NOMINAL STATUS</span>
              <span className="text-xs font-bold">CONTINUE MISSION</span>
            </div>
          </div>

          {/* Right Branch (YES) */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] text-[#ff9000] font-bold flex items-center gap-1">
              <span>[YES] ↘</span>
            </div>
            <div className={`p-2.5 rounded border text-center w-full ${
              anomalyDetected
                ? 'bg-[#ff9000]/10 border-[#ff9000] text-[#ff9000] font-bold'
                : 'bg-black/20 border-[#1a1f2e] text-[#8b949e]'
            }`}>
              <span className="text-[9px] block">RANDOM FOREST</span>
              <span className="text-xs font-bold">CLASSIFY FAULT: {classifiedFault}</span>
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-[#8b949e]" />

            <div className="p-2.5 rounded bg-[#161b22] border border-[#1a1f2e] text-center w-full">
              <span className="text-[9px] text-[#8b949e] block">PROGNOSTIC ESTIMATE</span>
              <span className="text-xs font-bold text-[#00f0ff]">ESTIMATE RUL ({estimatedRulHours}h)</span>
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-[#8b949e]" />

            <div className={`p-2 rounded border text-center w-full ${
              isBelowThreshold ? 'border-[#ff4b2b] text-[#ff4b2b]' : 'border-[#1a1f2e] text-white'
            }`}>
              <span className="text-[9px] text-[#8b949e] block">LIMIT EVALUATION</span>
              <span className="text-xs font-bold">HEALTH THRESHOLD (&lt;80%)?</span>
            </div>

            {/* Sub-branch: NO (MONITOR) vs YES (ALERT/MAINTENANCE) */}
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <div className={`p-1.5 rounded border text-center ${
                !isBelowThreshold && anomalyDetected
                  ? 'bg-[#ff9000]/20 border-[#ff9000] text-[#ff9000]'
                  : 'border-[#1a1f2e] text-[#8b949e]'
              }`}>
                <span className="text-[8px] block">[NO]</span>
                <span className="text-[9px] font-bold">MONITOR CLOSELY</span>
              </div>

              <div className={`p-1.5 rounded border text-center ${
                isBelowThreshold && anomalyDetected
                  ? 'bg-[#ff4b2b]/20 border-[#ff4b2b] text-[#ff4b2b] font-bold'
                  : 'border-[#1a1f2e] text-[#8b949e]'
              }`}>
                <span className="text-[8px] block">[YES]</span>
                <span className="text-[9px] font-bold">ALERT / SERVICE</span>
              </div>
            </div>
          </div>
        </div>

        <ArrowDown className="w-4 h-4 text-[#8b949e] mt-2" />

        {/* Final Decision Output Banner */}
        <div className="w-full max-w-md p-3 rounded-lg border bg-black/60 flex items-center justify-between gap-4">
          <div>
            <span className="text-[9px] text-[#8b949e] uppercase block">FINAL AIRWORTHINESS ACTION</span>
            <span className="text-base font-extrabold text-white uppercase">
              MISSION DECISION: <span className={
                missionDecision === 'CONTINUE'
                  ? 'text-[#00ff41]'
                  : missionDecision === 'INSPECT'
                  ? 'text-[#ff9000]'
                  : missionDecision === 'RESTRICT'
                  ? 'text-[#ff9000]'
                  : 'text-[#ff4b2b]'
              }>{missionDecision}</span>
            </span>
          </div>

          <div className={`px-3 py-1.5 rounded font-extrabold text-xs border ${
            missionDecision === 'CONTINUE'
              ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30'
              : missionDecision === 'INSPECT'
              ? 'bg-[#ff9000]/10 text-[#ff9000] border-[#ff9000]/30'
              : missionDecision === 'RESTRICT'
              ? 'bg-[#ff9000]/20 text-[#ff9000] border-[#ff9000]/50 animate-pulse'
              : 'bg-[#ff4b2b]/20 text-[#ff4b2b] border-[#ff4b2b]/50 animate-ping'
          }`}>
            {missionDecision}
          </div>
        </div>
      </div>
    </div>
  );
};
