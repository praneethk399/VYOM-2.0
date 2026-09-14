import React from 'react';
import { X, Cpu, Shield, Users, Layers, Zap, Activity, CheckCircle, Network, ArrowRight } from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
      <div className="bg-[#0d1117] border border-[#1a1f2e] w-full max-w-4xl rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col max-h-[90vh] overflow-hidden text-xs text-[#e0e6ed]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1f2e] bg-[#05070a]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <h2 className="text-sm font-bold tracking-wider text-white uppercase font-heading">
                AERO TWIN SENTINEL — SYSTEM ARCHITECTURE & IMPACT
              </h2>
              <span className="text-[10px] text-[#8b949e]">
                HIGH-INTEGRITY PROPULSION DIGITAL TWIN FOR VYOM UAV (MALE CLASS)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8b949e] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 18: System Architecture Flow Diagram */}
          <div>
            <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Network className="w-4 h-4" /> 1. END-TO-END PROPULSION DIGITAL TWIN ARCHITECTURE
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-lg bg-black/40 border border-[#1a1f2e] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center mb-2">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-[#8b949e] uppercase font-bold">LAYER 1</span>
                <span className="text-xs font-bold text-white mt-1">PHYSICAL SENSORS</span>
                <p className="text-[9px] text-[#8b949e] mt-1.5 leading-tight">
                  CHT, EGT, Oil Press/Temp, MAP, Fuel Flow, 3-Axis Vibration
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#1a1f2e] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center mb-2">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-[#8b949e] uppercase font-bold">LAYER 2</span>
                <span className="text-xs font-bold text-white mt-1">PHYSICS TWIN</span>
                <p className="text-[9px] text-[#8b949e] mt-1.5 leading-tight">
                  Polytropic Supercharger, Otto P-V Cycle & Convective Cooling
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#1a1f2e] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center mb-2">
                  <Network className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-[#8b949e] uppercase font-bold">LAYER 3</span>
                <span className="text-xs font-bold text-white mt-1">AI / ML DIAGNOSTICS</span>
                <p className="text-[9px] text-[#8b949e] mt-1.5 leading-tight">
                  Isolation Forest Anomaly Filter & Random Forest Fault Classifier
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#1a1f2e] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-[#8b949e] uppercase font-bold">LAYER 4</span>
                <span className="text-xs font-bold text-white mt-1">PROGNOSTIC RUL</span>
                <p className="text-[9px] text-[#8b949e] mt-1.5 leading-tight">
                  Weibull Degradation Trajectory & TTF Bayesian Horizon
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#1a1f2e] flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#00ff41]/10 text-[#00ff41] flex items-center justify-center mb-2">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-[#8b949e] uppercase font-bold">LAYER 5</span>
                <span className="text-xs font-bold text-[#00ff41] mt-1">MISSION DECISION</span>
                <p className="text-[9px] text-[#8b949e] mt-1.5 leading-tight">
                  Autonomous Airworthiness Decision (Continue, Restrict, Abort)
                </p>
              </div>
            </div>
          </div>

          {/* Section 17: Target Users and Operational Impact */}
          <div>
            <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> 2. TARGET USERS & OPERATIONAL ADVANTAGES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-black/30 border border-[#1a1f2e]">
                <span className="text-xs font-bold text-white block mb-1">
                  UAV OPERATORS & GCS CREW
                </span>
                <p className="text-[#8b949e] text-[11px] leading-relaxed">
                  Real-time visibility into engine thermal margins, automated in-flight restriction recommendations, and instant situational awareness without cognitive overload during combat ISR sorties.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/30 border border-[#1a1f2e]">
                <span className="text-xs font-bold text-white block mb-1">
                  PROPULSION & FLEET ENGINEERS
                </span>
                <p className="text-[#8b949e] text-[11px] leading-relaxed">
                  Component-level wear tracking, precision physics-residual tracking to pinpoint root causes (e.g. injector fouling vs ring blowby), and high-resolution flight telemetry replay.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/30 border border-[#1a1f2e]">
                <span className="text-xs font-bold text-white block mb-1">
                  DEFENCE LOGISTICS & DEPOT CREW
                </span>
                <p className="text-[#8b949e] text-[11px] leading-relaxed">
                  Transition from rigid flight-hour overhauls to condition-based predictive maintenance, eliminating unscheduled in-flight engine failures while maximizing fleet uptime.
                </p>
              </div>
            </div>
          </div>

          {/* Section 24: Final Visual Message Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0a1120] to-[#05070a] border border-[#00f0ff]/40 shadow-[0_0_25px_rgba(0,240,255,0.1)]">
            <span className="text-[9px] text-[#00f0ff] uppercase font-bold tracking-widest block mb-1">
              MISSION READINESS COMMITMENT
            </span>
            <p className="text-sm font-bold text-white leading-relaxed">
              "AERO TWIN SENTINEL transforms raw aero-propulsion telemetry into predictive intelligence, safeguarding VYOM UAV missions with zero unplanned engine shutdowns."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1a1f2e] bg-[#05070a] flex items-center justify-between text-[10px] text-[#8b949e]">
          <span>CLASSIFICATION: UNCLASSIFIED // PROTOTYPE SPECIFICATION</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#00f0ff] text-black font-bold hover:bg-[#00f0ff]/90"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
