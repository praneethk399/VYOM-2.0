import React from 'react';
import { ENGINE_18_SUBSYSTEMS } from '../data/fadecDataset';
import { X, Box, Layers, Cpu, CheckCircle2, Download } from 'lucide-react';

interface ModelStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelStatsModal: React.FC<ModelStatsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#080d1a] border border-[#1e2d4d] rounded-xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0a1224] border-b border-[#1e2d4d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading tracking-wider flex items-center gap-2">
                <span>3D MODEL MESH & HIERARCHY ARCHITECTURE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  18 ACTIVE NODES
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Aero-grade Boxer Engine 3D Digital Twin Geometry Representation
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
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[9px] text-[#8b949e]">ESTIMATED SIZE</span>
              <span className="text-sm font-bold text-[#00f0ff]">2.18 MB</span>
              <span className="text-[9px] text-slate-400">Binary GLB</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[9px] text-[#8b949e]">TRIANGLE COUNT</span>
              <span className="text-sm font-bold text-emerald-400">68,420</span>
              <span className="text-[9px] text-slate-400">LOD Optimized</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[9px] text-[#8b949e]">PHYSICS FPS</span>
              <span className="text-sm font-bold text-amber-400">60.0 FPS</span>
              <span className="text-[9px] text-slate-400">WebGL Hardware Accel</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[9px] text-[#8b949e]">SHADER PIPELINE</span>
              <span className="text-sm font-bold text-sky-400">ACES Filmic</span>
              <span className="text-[9px] text-slate-400">PBR + Thermal Emissive</span>
            </div>
          </div>

          {/* Node Hierarchy Listing */}
          <div className="border border-[#1e2d4d] rounded-lg overflow-hidden bg-[#060a14]">
            <div className="px-3.5 py-2 bg-[#0c162c] text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Scene Graph Subsystem Nodes (18)</span>
              </div>
              <span className="text-[9px] text-slate-400 font-normal">
                Disassembly vectors mapped
              </span>
            </div>
            <div className="divide-y divide-white/5 max-h-56 overflow-y-auto">
              {ENGINE_18_SUBSYSTEMS.map((node, idx) => (
                <div key={node.id} className="px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-mono">#{String(idx + 1).padStart(2, '0')}</span>
                    <span className="font-bold text-white text-[11px]">{node.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#8b949e] font-mono">
                      {node.nodeCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">{node.subsystem}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{node.healthPct}% Health</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Kinematics & Shaders */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[10px] space-y-1.5 text-slate-300">
            <span className="font-bold text-white block uppercase">Active Kinematics & Dynamic Shaders:</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>3-Blade Scimitar Carbon Propeller & Machined Aluminium Spinner rotation synchronized to live Propeller RPM</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>Reciprocating Boxer pistons & forged connecting rods cycling with horizontal trigonometric kinematics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>Front serpentine drive pulley with brass hub rotating in lockstep</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>Engine crankcase harmonic vibration feedback simulation dynamically linked to anomaly triggers</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0a1224] border-t border-[#1e2d4d] flex items-center justify-between">
          <div className="text-[10px] text-slate-400">
            Export ready for glTF 2.0 / USDZ / CAD STEP translation
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-xs"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
