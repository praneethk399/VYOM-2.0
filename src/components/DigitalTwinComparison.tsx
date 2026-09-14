import React, { useState } from 'react';
import { TelemetryItem } from '../types/engine';
import { GitCompare, ArrowDown, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DigitalTwinComparisonProps {
  telemetry: TelemetryItem[];
  altitudeFt: number;
  throttlePct: number;
  engineRpm: number;
  ambientTempC: number;
  engineLoadPct: number;
}

export const DigitalTwinComparison: React.FC<DigitalTwinComparisonProps> = ({
  telemetry,
  altitudeFt,
  throttlePct,
  engineRpm,
  ambientTempC,
  engineLoadPct,
}) => {
  const [selectedParamId, setSelectedParamId] = useState<string>('fuel_flow');

  const activeItem = telemetry.find((t) => t.id === selectedParamId) || telemetry[0];
  const residual = activeItem.value - activeItem.twinExpected;
  const absResidual = Math.abs(residual);
  const normalTolerance = (activeItem.maxNormal - activeItem.minNormal) * 0.08;
  const isAbnormal = absResidual > normalTolerance;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono shadow-xl flex flex-col gap-4">
      {/* Title & Architecture Flow Pipeline */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
              DIGITAL TWIN COMPARISON & RESIDUAL ANALYSIS
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            PHYSICS-BASED EXPECTED TWIN
          </span>
        </div>

        {/* Linear Technical Comparison Pipeline from Prompt */}
        <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 flex items-center justify-between text-[11px] text-center gap-1 overflow-x-auto">
          <div className="flex-1 min-w-[100px] p-1.5 rounded bg-slate-900 border border-slate-700/60">
            <span className="text-[9px] text-slate-400 uppercase block">INPUT</span>
            <span className="text-cyan-300 font-bold">ACTUAL TELEMETRY</span>
          </div>

          <div className="text-slate-500 font-bold">→</div>

          <div className="flex-1 min-w-[130px] p-1.5 rounded bg-slate-900 border border-slate-700/60">
            <span className="text-[9px] text-slate-400 uppercase block">TWIN MODEL</span>
            <span className="text-blue-300 font-bold">PHYSICS EXPECTED</span>
          </div>

          <div className="text-slate-500 font-bold">→</div>

          <div className={`flex-1 min-w-[110px] p-1.5 rounded border ${
            isAbnormal
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-slate-900 border-slate-700/60 text-slate-300'
          }`}>
            <span className="text-[9px] text-slate-400 uppercase block">EQUATION</span>
            <span className="font-bold">RESIDUAL</span>
          </div>

          <div className="text-slate-500 font-bold">→</div>

          <div className="flex-1 min-w-[110px] p-1.5 rounded bg-slate-900 border border-slate-700/60">
            <span className="text-[9px] text-slate-400 uppercase block">DECISION</span>
            <span className="text-emerald-400 font-bold">AI/ML ANALYSIS</span>
          </div>
        </div>
      </div>

      {/* Physics Operating Conditions Context Bar */}
      <div className="bg-slate-950/40 p-2 rounded border border-slate-800/60 text-[10px] grid grid-cols-3 sm:grid-cols-6 gap-2 text-slate-300">
        <div>
          <span className="text-slate-500 block">ALTITUDE</span>
          <span className="font-bold text-white">{altitudeFt.toLocaleString()} ft</span>
        </div>
        <div>
          <span className="text-slate-500 block">THROTTLE</span>
          <span className="font-bold text-cyan-300">{throttlePct}%</span>
        </div>
        <div>
          <span className="text-slate-500 block">ENGINE RPM</span>
          <span className="font-bold text-white">{engineRpm}</span>
        </div>
        <div>
          <span className="text-slate-500 block">AMB TEMP</span>
          <span className="font-bold text-white">{ambientTempC}°C</span>
        </div>
        <div>
          <span className="text-slate-500 block">ENGINE LOAD</span>
          <span className="font-bold text-cyan-300">{engineLoadPct}%</span>
        </div>
        <div>
          <span className="text-slate-500 block">ATM PRESSURE</span>
          <span className="font-bold text-white">{(101.3 * Math.exp(-altitudeFt / 27000)).toFixed(1)} kPa</span>
        </div>
      </div>

      {/* Parameter Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {telemetry.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedParamId(t.id)}
            className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-all ${
              selectedParamId === t.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            {t.shortName}
          </button>
        ))}
      </div>

      {/* Actual vs Expected Detailed Comparison Card */}
      <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-200">{activeItem.name}</span>
            <span className="text-[10px] text-slate-500 ml-2 font-mono">
              [CATEGORY: {activeItem.category}]
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAbnormal ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                ABNORMAL RESIDUAL
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                NOMINAL RESIDUAL
              </span>
            )}
          </div>
        </div>

        {/* Visual Graph: Actual vs Digital Twin Expected Bar Meter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Actual Telemetry */}
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">ACTUAL SENSOR TELEMETRY</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-white">
                {activeItem.value.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">{activeItem.unit}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    ((activeItem.value - activeItem.minRange) / (activeItem.maxRange - activeItem.minRange)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Digital Twin Expected */}
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">PHYSICS DIGITAL TWIN EXPECTED</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-cyan-300">
                {activeItem.twinExpected.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">{activeItem.unit}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    ((activeItem.twinExpected - activeItem.minRange) / (activeItem.maxRange - activeItem.minRange)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Residual Calculation Box */}
        <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-400">RESIDUAL CALCULATION FORMULA:</span>
            <p className="text-slate-300 font-mono mt-0.5">
              Residual = Actual ({activeItem.value.toFixed(1)}) − Twin Expected ({activeItem.twinExpected.toFixed(1)})
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">CURRENT RESIDUAL</span>
            <span className={`text-base font-extrabold font-mono ${
              isAbnormal ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {residual > 0 ? `+${residual.toFixed(2)}` : residual.toFixed(2)} {activeItem.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
