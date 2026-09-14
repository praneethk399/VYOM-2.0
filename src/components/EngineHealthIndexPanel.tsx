import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingDown, TrendingUp, Cpu, Gauge } from 'lucide-react';

interface EngineHealthIndexPanelProps {
  healthIndex: number; // 0 - 100
  anomalyScore: number; // 0.0 - 1.0
  degradationRate: number; // % / 100h
  operatingCondition: string;
  healthTrend: 'STABLE' | 'DEGRADING' | 'CRITICAL_DROP' | 'RECOVERING';
}

export const EngineHealthIndexPanel: React.FC<EngineHealthIndexPanelProps> = ({
  healthIndex,
  anomalyScore,
  degradationRate,
  operatingCondition,
  healthTrend,
}) => {
  // Determine Health State
  let state: 'HEALTHY' | 'CAUTION' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
  let stateColor = 'text-emerald-400';
  let strokeColor = '#10b981';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  if (healthIndex < 45) {
    state = 'CRITICAL';
    stateColor = 'text-red-400';
    strokeColor = '#ef4444';
    badgeBg = 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse';
  } else if (healthIndex < 65) {
    state = 'DEGRADED';
    stateColor = 'text-orange-400';
    strokeColor = '#f97316';
    badgeBg = 'bg-orange-500/20 border-orange-500/50 text-orange-400';
  } else if (healthIndex < 80) {
    state = 'CAUTION';
    stateColor = 'text-amber-400';
    strokeColor = '#f59e0b';
    badgeBg = 'bg-amber-500/20 border-amber-500/50 text-amber-400';
  }

  // Radial Gauge Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthIndex / 100) * circumference;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono shadow-xl relative overflow-hidden flex flex-col gap-4">
      {/* Top Title & Prototype Tag */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            ENGINE HEALTH INDEX (EHI)
          </h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700/50">
          SIMULATED / PROTOTYPE DATA
        </span>
      </div>

      {/* Main EHI Radial Gauge & Status Block */}
      <div className="flex items-center justify-around gap-4 py-2">
        {/* Radial SVG Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#1e293b"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Active Gauge Arc */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={strokeColor}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Value Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-extrabold font-mono tracking-tighter ${stateColor}`}>
              {healthIndex.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
              HEALTH
            </span>
          </div>
        </div>

        {/* State Information */}
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase">SYSTEM STATUS</span>
            <div className={`mt-0.5 px-3 py-1 rounded text-xs font-extrabold tracking-wider border ${badgeBg}`}>
              {state}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase">HEALTH TREND</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {healthTrend === 'DEGRADING' || healthTrend === 'CRITICAL_DROP' ? (
                <TrendingDown className="w-4 h-4 text-amber-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              )}
              <span className={`text-xs font-semibold ${
                healthTrend === 'CRITICAL_DROP'
                  ? 'text-red-400'
                  : healthTrend === 'DEGRADING'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {healthTrend.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary Prognostic Diagnostics Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/70">
          <span className="text-[10px] text-slate-400 uppercase block">ANOMALY SCORE</span>
          <span className={`text-sm font-bold ${
            anomalyScore > 0.6 ? 'text-red-400' : anomalyScore > 0.3 ? 'text-amber-400' : 'text-cyan-300'
          }`}>
            {(anomalyScore * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Threshold: 45.0%</span>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/70">
          <span className="text-[10px] text-slate-400 uppercase block">DEGRADATION RATE</span>
          <span className="text-sm font-bold text-slate-200">
            {degradationRate.toFixed(2)}% / 100h
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Baseline: 0.12%/100h</span>
        </div>

        <div className="col-span-2 p-2 rounded bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase">OPERATING CONDITION</span>
          <span className="text-xs font-bold text-slate-200">
            {operatingCondition}
          </span>
        </div>
      </div>
    </div>
  );
};
