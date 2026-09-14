import React from 'react';
import { VYOM_ENGINE_FULL_SPECS } from '../data/fadecDataset';
import { X, Plane, Cpu, ShieldCheck, Wrench, Zap } from 'lucide-react';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#080d1a] border border-[#1e2d4d] rounded-xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0a1224] border-b border-[#1e2d4d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading tracking-wider">
                UAV & FLYGAS ENGINE TECHNICAL SPECIFICATIONS
              </h2>
              <p className="text-[10px] text-slate-400">
                DRDO / VYOM Propulsion System Engineering Reference Baseline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-slate-300 text-[11px]">
          {/* Highlight Badge Card */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] text-[#8b949e]">RATED POWER</span>
              <span className="text-base font-bold text-[#00f0ff]">180 HP</span>
              <span className="text-[9px] text-slate-400">@ 5,800 RPM (Crank)</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] text-[#8b949e]">PROP SPEED</span>
              <span className="text-base font-bold text-emerald-400">2,974 RPM</span>
              <span className="text-[9px] text-slate-400">1.95:1 Reduction Gearbox</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] text-[#8b949e]">MAX CEILING</span>
              <span className="text-base font-bold text-amber-400">28,000 FT</span>
              <span className="text-[9px] text-slate-400">1.35 Bar Supercharged Boost</span>
            </div>
          </div>

          {/* Engine Parameters Table */}
          <div className="border border-[#1e2d4d] rounded-lg overflow-hidden bg-[#060a14]">
            <div className="px-3.5 py-2 bg-[#0c162c] text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Propulsion Architectural Specifications</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-white/5 text-[11px]">
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Configuration:</span>
                <span className="font-bold text-white">4-Cyl Horizontally Opposed Boxer</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Displacement:</span>
                <span className="font-bold text-white">{VYOM_ENGINE_FULL_SPECS.displacementCc} cc</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Bore × Stroke:</span>
                <span className="font-bold text-white">{VYOM_ENGINE_FULL_SPECS.boreMm} × {VYOM_ENGINE_FULL_SPECS.strokeMm} mm</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Compression:</span>
                <span className="font-bold text-white">{VYOM_ENGINE_FULL_SPECS.compressionRatio}</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Forced Induction:</span>
                <span className="font-bold text-[#00f0ff]">Centrifugal Compressor Supercharger</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Max Boost:</span>
                <span className="font-bold text-[#00f0ff]">{VYOM_ENGINE_FULL_SPECS.maxBoostPressure}</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Fuel Injection:</span>
                <span className="font-bold text-white">Sequential Electronic Port EFI</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Fuel Compatibility:</span>
                <span className="font-bold text-white">AvGas 100LL / Mogas 98 RON</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Ignition System:</span>
                <span className="font-bold text-white">Dual-Redundant CDI (2 Plugs/Cyl)</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Lubrication:</span>
                <span className="font-bold text-white">Semi-Dry Sump + Full-flow Filter</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Installed Dry Weight:</span>
                <span className="font-bold text-white">{VYOM_ENGINE_FULL_SPECS.dryWeightKg} kg</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-slate-400">Certified TBO:</span>
                <span className="font-bold text-emerald-400">{VYOM_ENGINE_FULL_SPECS.tboHours} Flight Hours</span>
              </div>
            </div>
          </div>

          {/* Design Heritage Note */}
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-[10px] text-cyan-200/90 leading-relaxed">
            <span className="font-bold text-[#00f0ff] uppercase block mb-1">
              FLYGAS Engineering Heritage:
            </span>
            Features the distinctive high-flow black curved intake runner geometry with 4-ply blue silicone couplers, 
            front serpentine multi-ribbed pulley wheel with brass core hub, and custom CNC-machined Boxer cylinder head valve covers 
            providing optimal volumetric efficiency across critical UAV tactical envelopes.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0a1224] border-t border-[#1e2d4d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff] hover:bg-[#00f0ff]/30 border border-[#00f0ff]/50 font-bold transition-all text-xs"
          >
            CLOSE SPECIFICATIONS
          </button>
        </div>
      </div>
    </div>
  );
};
