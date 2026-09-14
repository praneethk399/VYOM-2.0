import React from 'react';
import { EngineComponent } from '../types/engine';
import { X, Wrench, Thermometer, Activity, Gauge, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ComponentInspectionDrawerProps {
  component: EngineComponent;
  onClose: () => void;
}

export const ComponentInspectionDrawer: React.FC<ComponentInspectionDrawerProps> = ({
  component,
  onClose,
}) => {
  return (
    <div className="bg-[#0d1117]/95 border border-[#1a1f2e] backdrop-blur-xl rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-3 text-xs">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1a1f2e] pb-2">
        <div>
          <span className="text-[9px] text-[#00f0ff] uppercase tracking-widest font-bold block">
            SUBSYSTEM TELEMETRY INSPECTION
          </span>
          <h3 className="text-sm font-bold text-white font-heading mt-0.5">
            {component.name}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#8b949e] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-[#8b949e] text-[11px] leading-relaxed">
        {component.description}
      </p>

      {/* Grid of Key Subsystem Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-[#ff4b2b]" /> OPERATING TEMP
          </span>
          <span className="text-sm font-bold text-white mt-1 block">
            {component.temperatureC.toFixed(1)}°C
          </span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#00f0ff]" /> VIBRATION LEVEL
          </span>
          <span className="text-sm font-bold text-white mt-1 block">
            {component.vibrationMmS.toFixed(2)} mm/s RMS
          </span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[#ff9000]" /> SURFACE WEAR
          </span>
          <span className="text-sm font-bold text-[#ff9000] mt-1 block">
            {component.wearPercent}%
          </span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#00f0ff]" /> COMPONENT RUL
          </span>
          <span className="text-sm font-bold text-[#00f0ff] mt-1 block">
            {component.rulHours} hrs
          </span>
        </div>
      </div>

      {/* Health Status & Maintenance */}
      <div className="p-2.5 rounded bg-black/30 border border-[#1a1f2e] space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#8b949e]">COMPONENT HEALTH:</span>
          <span className={`font-bold ${
            component.healthPercent < 70 ? 'text-[#ff4b2b]' : component.healthPercent < 85 ? 'text-[#ff9000]' : 'text-[#00ff41]'
          }`}>
            {component.healthPercent}% ({component.status})
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#8b949e]">DEGRADATION RATE:</span>
          <span className="text-white font-bold">{component.degradationRate}</span>
        </div>

        <div className="pt-1.5 border-t border-[#1a1f2e] text-[11px]">
          <span className="text-[#8b949e] block font-semibold mb-0.5">MAINTENANCE DIRECTIVE:</span>
          <p className="text-[#00f0ff] font-bold text-[10px]">
            {component.maintenanceAction}
          </p>
        </div>
      </div>
    </div>
  );
};
