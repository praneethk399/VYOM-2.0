import React from 'react';
import { FaultId, FaultScenario } from '../types/engine';
import { FAULT_SCENARIOS } from '../data/engineData';
import { AlertTriangle, Wrench, CheckCircle, Zap, Flame, ShieldAlert, Cpu, Activity } from 'lucide-react';

interface FaultInjectionLabProps {
  activeFaultId: FaultId;
  onSelectFault: (faultId: FaultId) => void;
  faultSeverityScale: number;
  setFaultSeverityScale: (val: number) => void;
}

export const FaultInjectionLab: React.FC<FaultInjectionLabProps> = ({
  activeFaultId,
  onSelectFault,
  faultSeverityScale,
  setFaultSeverityScale,
}) => {
  const currentScenario = FAULT_SCENARIOS.find((f) => f.id === activeFaultId) || FAULT_SCENARIOS[0];

  const getFaultIcon = (id: FaultId) => {
    switch (id) {
      case 'NORMAL':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'MISFIRE':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'INJECTOR_ABNORMALITY':
        return <Wrench className="w-3.5 h-3.5 text-cyan-400" />;
      case 'LUBRICATION_ISSUE':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'SENSOR_DRIFT':
        return <Activity className="w-3.5 h-3.5 text-blue-400" />;
      case 'COMBUSTION_INSTABILITY':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'OVERHEATING':
        return <Flame className="w-3.5 h-3.5 text-red-400" />;
      case 'ABNORMAL_VIBRATION':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            FAULT INJECTION LAB
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          CONTROLLED ANOMALY STIMULATION
        </span>
      </div>

      {/* Interactive Fault Injection Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FAULT_SCENARIOS.map((fault) => {
          const isActive = activeFaultId === fault.id;
          return (
            <button
              key={fault.id}
              id={`btn-fault-${fault.id.toLowerCase()}`}
              onClick={() => onSelectFault(fault.id)}
              className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? fault.id === 'NORMAL'
                    ? 'bg-emerald-950/50 border-emerald-400/80 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-red-950/60 border-red-500 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse'
                  : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                {getFaultIcon(fault.id)}
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                    fault.severity === 'CRITICAL'
                      ? 'text-red-400 bg-red-950'
                      : fault.severity === 'HIGH'
                      ? 'text-orange-400 bg-orange-950'
                      : fault.severity === 'MODERATE'
                      ? 'text-amber-400 bg-amber-950'
                      : 'text-emerald-400 bg-emerald-950'
                  }`}
                >
                  {fault.severity}
                </span>
              </div>
              <span className="text-xs font-bold font-heading line-clamp-1">{fault.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Fault Feedback Details Banner */}
      <div className="bg-slate-950/80 p-3 rounded border border-slate-800 text-xs flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">ACTIVE SCENARIO:</span>
            <span className="font-bold text-cyan-300">{currentScenario.label}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            AFFECTED SUBSYSTEM: <strong className="text-white uppercase">{currentScenario.affectedComponent.replace('_', ' ')}</strong>
          </span>
        </div>

        <p className="text-slate-300 text-[11px] leading-relaxed">
          {currentScenario.description}
        </p>

        {/* Severity adjustment slider */}
        {activeFaultId !== 'NORMAL' && (
          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase">INJECTION INTENSITY:</span>
              <span className="text-xs font-bold text-amber-400">{Math.round(faultSeverityScale * 100)}%</span>
            </div>
            <input
              id="slider-fault-severity"
              type="range"
              min="0.2"
              max="1.5"
              step="0.1"
              value={faultSeverityScale}
              onChange={(e) => setFaultSeverityScale(parseFloat(e.target.value))}
              className="w-48 h-1.5 bg-slate-800 rounded accent-amber-400 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
