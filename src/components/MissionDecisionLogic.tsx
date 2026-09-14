import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, ArrowDown, GitFork, Ban, RefreshCw } from 'lucide-react';

interface MissionDecisionLogicProps {
  engineHealthPct: number;
  anomalyDetected: boolean;
  classifiedFault: string;
  rulHours: number;
}

export const MissionDecisionLogic: React.FC<MissionDecisionLogicProps> = ({
  engineHealthPct,
  anomalyDetected,
  classifiedFault,
  rulHours,
}) => {
  // Decision logic calculation
  let decision: 'CONTINUE' | 'INSPECT' | 'RESTRICT' | 'ABORT' = 'CONTINUE';
  let restrictionDetail = 'Full flight envelope authorized. All parameters within nominal range.';
  let decisionColor = 'text-[#00ff41] border-[#00ff41] bg-[#00ff41]/10';

  if (!anomalyDetected && engineHealthPct >= 80) {
    decision = 'CONTINUE';
    restrictionDetail = 'Nominal mission profile. Engine health optimal for standard endurance ISR.';
    decisionColor = 'text-[#00ff41] border-[#00ff41]/50 bg-[#00ff41]/10';
  } else if (engineHealthPct < 45 || rulHours < 50) {
    decision = 'ABORT';
    restrictionDetail = 'CRITICAL ENGINE OVERHAUL TRIGGERED. Immediate Return to Base (RTB) or precautionary landing.';
    decisionColor = 'text-[#ff4b2b] border-[#ff4b2b] bg-[#ff4b2b]/20 animate-pulse';
  } else if (engineHealthPct < 65 || rulHours < 250) {
    decision = 'RESTRICT';
    restrictionDetail = 'Operating with restricted flight envelope. Max continuous throttle capped at 75%. Avoid aggressive climb.';
    decisionColor = 'text-[#ff9000] border-[#ff9000] bg-[#ff9000]/20';
  } else {
    decision = 'INSPECT';
    restrictionDetail = 'Post-mission pre-flight boroscope and fuel delivery inspection required before next sortie.';
    decisionColor = 'text-amber-400 border-amber-400/60 bg-amber-400/10';
  }

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            MISSION DECISION LOGIC & FLIGHT READINESS EVALUATION
          </h2>
        </div>
        <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
          AUTONOMOUS SAFETY GOVERNOR
        </span>
      </div>

      {/* Visual Flowchart based on specification */}
      <div className="bg-[#05070a]/90 p-4 rounded-lg border border-[#1a1f2e] flex flex-col items-center text-xs">
        {/* Step 1: Engine Health */}
        <div className="px-4 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-bold">
          ENGINE HEALTH (EHI: {engineHealthPct.toFixed(0)}%)
        </div>

        <ArrowDown className="w-4 h-4 text-slate-500 my-1" />

        {/* Step 2: Anomaly Detected */}
        <div className="px-4 py-1.5 rounded bg-cyan-950/60 border border-cyan-700 text-[#00f0ff] font-bold">
          ANOMALY DETECTED?
        </div>

        {/* Branching */}
        <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-2">
          {/* Left Branch: No */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">NO</span>
            <ArrowDown className="w-3 h-3 text-slate-500" />
            <div className={`mt-1 px-3 py-1 rounded text-[11px] font-bold border ${
              !anomalyDetected ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              CONTINUE MISSION
            </div>
          </div>

          {/* Right Branch: Yes */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-400">YES</span>
            <ArrowDown className="w-3 h-3 text-slate-500" />
            <div className={`mt-1 px-3 py-1 rounded text-[11px] font-bold border ${
              anomalyDetected ? 'bg-amber-950/40 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              CLASSIFY FAULT: {classifiedFault}
            </div>

            <ArrowDown className="w-3 h-3 text-slate-500 my-1" />

            <div className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
              ESTIMATE RUL: {rulHours} hrs
            </div>

            <ArrowDown className="w-3 h-3 text-slate-500 my-1" />

            <div className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
              CRITICAL HEALTH THRESHOLD?
            </div>
          </div>
        </div>
      </div>

      {/* Decision Output Banner */}
      <div className={`p-4 rounded-lg border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${decisionColor}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/40">
            {decision === 'CONTINUE' && <CheckCircle2 className="w-6 h-6 text-[#00ff41]" />}
            {decision === 'INSPECT' && <ShieldCheck className="w-6 h-6 text-amber-400" />}
            {decision === 'RESTRICT' && <AlertTriangle className="w-6 h-6 text-[#ff9000]" />}
            {decision === 'ABORT' && <AlertOctagon className="w-6 h-6 text-[#ff4b2b]" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">
              MISSION READINESS DIRECTIVE
            </div>
            <div className="text-xl font-black tracking-wider">{decision}</div>
          </div>
        </div>

        <div className="text-xs max-w-md text-slate-200">
          <p className="leading-relaxed">{restrictionDetail}</p>
        </div>
      </div>

      {/* 4 Decision Categories Key */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
          <span className="text-[#00ff41] font-bold block">1. CONTINUE</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Health ≥80%, No anomaly</span>
        </div>

        <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
          <span className="text-amber-400 font-bold block">2. INSPECT</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Minor deviation, non-critical</span>
        </div>

        <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
          <span className="text-[#ff9000] font-bold block">3. RESTRICT</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Degraded EHI, throttle cap</span>
        </div>

        <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
          <span className="text-[#ff4b2b] font-bold block">4. ABORT</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Critical failure risk, RTB</span>
        </div>
      </div>
    </div>
  );
};
