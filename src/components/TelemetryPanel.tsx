import React, { useState } from 'react';
import { TelemetryItem } from '../types/engine';
import { REFERENCE_ENGINE_SPEC } from '../data/engineData';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Gauge,
  Zap,
} from 'lucide-react';

interface TelemetryPanelProps {
  telemetry: TelemetryItem[];
  onSelectTelemetryKey?: (key: string) => void;
  selectedTelemetryKey?: string | null;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetry,
  onSelectTelemetryKey,
  selectedTelemetryKey,
}) => {
  const [showSpecs, setShowSpecs] = useState<boolean>(false);

  const getStatusBadge = (status: 'NORMAL' | 'CAUTION' | 'CRITICAL') => {
    switch (status) {
      case 'NORMAL':
        return 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/30';
      case 'CAUTION':
        return 'text-[#ff9000] bg-[#ff9000]/10 border-[#ff9000]/30 animate-pulse';
      case 'CRITICAL':
        return 'text-[#ff4b2b] bg-[#ff4b2b]/10 border-[#ff4b2b]/30 animate-ping';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 text-[#00f0ff]" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 text-[#ff9000]" />;
      case 'stable':
        return <Minus className="w-3.5 h-3.5 text-[#8b949e]" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 font-mono">
      {/* Reference Engine Specifications Accordion / Banner */}
      <div className="bg-[#0d1117]/80 border border-[#1a1f2e] rounded-lg p-3 shadow-md backdrop-blur-md">
        <div
          onClick={() => setShowSpecs(!showSpecs)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-xs font-bold tracking-wider text-[#e0e6ed] font-heading">
              REFERENCE ENGINE PARAMETERS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8b949e] uppercase hidden sm:inline">
              REF: 4-CYL BOXER
            </span>
            {showSpecs ? (
              <ChevronUp className="w-4 h-4 text-[#8b949e] group-hover:text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8b949e] group-hover:text-white" />
            )}
          </div>
        </div>

        {showSpecs && (
          <div className="mt-3 pt-3 border-t border-[#1a1f2e] text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#e0e6ed]">
            <div>
              <span className="text-[#8b949e]">ENGINE:</span>{' '}
              <span className="text-white font-semibold">{REFERENCE_ENGINE_SPEC.engineType}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">CONFIGURATION:</span>{' '}
              <span className="text-white font-semibold">{REFERENCE_ENGINE_SPEC.configuration}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">DISPLACEMENT:</span>{' '}
              <span className="text-[#00f0ff] font-semibold">{REFERENCE_ENGINE_SPEC.displacement}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">STROKE:</span>{' '}
              <span className="text-[#00f0ff] font-semibold">{REFERENCE_ENGINE_SPEC.boreStroke}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">MAXIMUM POWER:</span>{' '}
              <span className="text-[#00ff41] font-semibold">{REFERENCE_ENGINE_SPEC.maxPower}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">MAXIMUM TORQUE:</span>{' '}
              <span className="text-[#00ff41] font-semibold">{REFERENCE_ENGINE_SPEC.maxTorque}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#8b949e]">INDUCTION:</span>{' '}
              <span className="text-[#00f0ff] font-semibold">{REFERENCE_ENGINE_SPEC.induction}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#8b949e]">APPLICATION:</span>{' '}
              <span className="text-white font-semibold">{REFERENCE_ENGINE_SPEC.application}</span>
            </div>
            <div className="sm:col-span-2 mt-1 text-[10px] text-[#ff9000] italic bg-[#ff9000]/10 p-2 rounded border border-[#ff9000]/30">
              * REFERENCE ENGINE PARAMETERS: Baseline design values. Do not imply every spec is measured live.
            </div>
          </div>
        )}
      </div>

      {/* Live Telemetry Title & Status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00f0ff]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#e0e6ed] font-heading">
            LIVE ENGINE TELEMETRY
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8b949e]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
          <span>REAL-TIME STREAM</span>
        </div>
      </div>

      {/* Telemetry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
        {telemetry.map((item) => {
          const isSelected = selectedTelemetryKey === item.id;
          const residual = Math.abs(item.value - item.twinExpected);
          const pct = Math.min(
            100,
            Math.max(0, ((item.value - item.minRange) / (item.maxRange - item.minRange)) * 100)
          );

          return (
            <div
              key={item.id}
              id={`telemetry-card-${item.id}`}
              onClick={() => onSelectTelemetryKey && onSelectTelemetryKey(item.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#00f0ff]/10 border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-[#0d1117]/80 hover:bg-[#161b22] border-[#1a1f2e] hover:border-slate-700'
              }`}
            >
              {/* Top row: Name, Trend, Status */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300 truncate" title={item.name}>
                  {item.shortName}
                </span>
                <div className="flex items-center gap-1.5">
                  {getTrendIcon(item.trend)}
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Middle row: Live value & unit */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-white font-mono tracking-tight">
                    {item.value.toFixed(item.unit === 'g RMS' || item.unit === 'bar' ? 2 : 1)}
                  </span>
                  <span className="text-xs text-slate-400">{item.unit}</span>
                </div>

                {/* Digital Twin Expected Comparison */}
                <div className="text-[10px] text-right">
                  <span className="text-slate-400">TWIN: </span>
                  <span className="text-cyan-300 font-semibold">
                    {item.twinExpected.toFixed(item.unit === 'g RMS' || item.unit === 'bar' ? 2 : 1)}
                  </span>
                </div>
              </div>

              {/* Progress Bar with Normal Range Marker */}
              <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.status === 'CRITICAL'
                      ? 'bg-red-500'
                      : item.status === 'CAUTION'
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Bottom row: Normal range & Residual */}
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  NORMAL: {item.minNormal} - {item.maxNormal} {item.unit}
                </span>
                <span className={residual > (item.maxNormal - item.minNormal) * 0.15 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  Δ {residual.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
