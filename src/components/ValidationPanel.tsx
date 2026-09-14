import React, { useState } from 'react';
import { Shield, CheckCircle, Database, Layers, BarChart3, Users, Zap, ShieldAlert, Cpu } from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  // Editable evaluation metrics in prototype
  const [accuracy, setAccuracy] = useState<number>(97.4);
  const [precision, setPrecision] = useState<number>(96.2);
  const [recall, setRecall] = useState<number>(98.1);
  const [f1Score, setF1Score] = useState<number>(97.1);
  const [latencySec, setLatencySec] = useState<number>(1.2);
  const [datasetSize, setDatasetSize] = useState<number>(360);

  const steps = [
    { title: 'DATA ACQUISITION', desc: 'ECU 2.0B CAN Bus & Sensor Telemetry (100 Hz)' },
    { title: 'PREPROCESSING', desc: 'Kalman filtering, ambient normalization & outlier suppression' },
    { title: 'SCENARIO INJECTION', desc: 'Normal cruise + 7 validated aerodynamic/thermal fault modes' },
    { title: 'DIGITAL TWIN RESPONSE', desc: 'Physics-based Brayton/Otto thermodynamic expected state' },
    { title: 'AI/ML PREDICTION', desc: 'Isolation Forest anomaly detection + Random Forest classification' },
    { title: 'REFERENCE COMPARISON', desc: 'Residual variance calculation against baseline dyno curves' },
    { title: 'PERFORMANCE EVALUATION', desc: 'F1, precision, recall & Bayesian TTF confidence verification' },
    { title: 'MISSION DECISION', desc: 'Safety governor recommendation (Continue / Inspect / Restrict / Abort)' },
  ];

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            TECHNICAL VALIDATION PROCESS & EVALUATION METRICS
          </h2>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
          PENDING EXPERIMENTAL VALIDATION
        </span>
      </div>

      {/* Validation Pipeline Flow */}
      <div>
        <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider block mb-2">
          AEROSPACE VALIDATION PIPELINE ARCHITECTURE:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="p-2.5 rounded bg-[#05070a]/90 border border-[#1a1f2e] flex flex-col justify-between text-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#00f0ff] font-bold">STEP 0{idx + 1}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]/60" />
              </div>
              <span className="text-xs font-bold text-slate-200 font-heading">{step.title}</span>
              <p className="text-[10px] text-[#8b949e] mt-1 leading-tight">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Metrics Cards (With Prototype Controls) */}
      <div className="bg-[#05070a]/80 p-4 rounded-lg border border-[#1a1f2e] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div>
            <span className="text-xs font-bold text-slate-200">
              BENCHMARK EVALUATION METRICS
            </span>
            <span className="text-[10px] text-amber-400/90 ml-2">
              (SIMULATED PROTOTYPE RESULT)
            </span>
          </div>
          <span className="text-[10px] text-[#8b949e]">Editable prototype parameters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[10px] text-[#8b949e] uppercase block">DATASET SIZE</span>
            <span className="text-xl font-bold text-white mt-1 block">{datasetSize}</span>
            <span className="text-[9px] text-slate-500">Flight-sec samples</span>
          </div>

          <div className="p-2.5 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[10px] text-[#8b949e] uppercase block">MODEL ACCURACY</span>
            <span className="text-xl font-bold text-[#00ff41] mt-1 block">{accuracy}%</span>
            <span className="text-[9px] text-slate-500">*Simulated baseline</span>
          </div>

          <div className="p-2.5 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[10px] text-[#8b949e] uppercase block">PRECISION</span>
            <span className="text-xl font-bold text-[#00f0ff] mt-1 block">{precision}%</span>
            <span className="text-[9px] text-slate-500">Fault classification</span>
          </div>

          <div className="p-2.5 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[10px] text-[#8b949e] uppercase block">RECALL RATE</span>
            <span className="text-xl font-bold text-cyan-300 mt-1 block">{recall}%</span>
            <span className="text-[9px] text-slate-500">Anomaly sensitivity</span>
          </div>

          <div className="p-2.5 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[10px] text-[#8b949e] uppercase block">F1 SCORE</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">{f1Score}%</span>
            <span className="text-[9px] text-slate-500">Harmonic mean</span>
          </div>

          <div className="p-2.5 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[10px] text-[#8b949e] uppercase block">DETECTION LATENCY</span>
            <span className="text-xl font-bold text-amber-300 mt-1 block">{latencySec} s</span>
            <span className="text-[9px] text-slate-500">Edge compute lag</span>
          </div>
        </div>
      </div>

      {/* Target Users & Strategic Impact Section */}
      <div className="bg-[#05070a]/90 p-4 rounded-lg border border-[#1a1f2e] flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Users className="w-4 h-4 text-[#00f0ff]" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            TARGET STAKEHOLDERS & STRATEGIC MISSION IMPACT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[11px] font-bold text-[#00f0ff] uppercase block mb-1">
              VYOM UAV OPERATORS
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              → Real-time engine health visibility during flight.<br />
              → Early fault warnings with actionable guidance.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[11px] font-bold text-[#00ff41] uppercase block mb-1">
              MAINTENANCE TEAMS
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              → RUL-based predictive servicing schedule.<br />
              → Greatly reduced unexpected AOG downtime.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[11px] font-bold text-amber-400 uppercase block mb-1">
              DEFENCE / ISR MISSIONS
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              → Drastically reduced in-flight propulsion risk.<br />
              → Improved long-endurance sortie mission reliability.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0d1117] border border-[#1a1f2e]">
            <span className="text-[11px] font-bold text-purple-400 uppercase block mb-1">
              UAV DEVELOPERS / OEMS
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              → Engine-specific high-frequency health analytics.<br />
              → Closed-loop data-driven engineering improvements.
            </p>
          </div>
        </div>

        {/* Bottom Impact Chain */}
        <div className="mt-2 p-2.5 rounded bg-[#00f0ff]/5 border border-[#00f0ff]/20 flex flex-col sm:flex-row items-center justify-around gap-2 text-center text-[11px] font-bold">
          <span className="text-[#00f0ff]">EARLY DETECTION</span>
          <span className="text-slate-500">→</span>
          <span className="text-emerald-400">PREDICTIVE MAINTENANCE</span>
          <span className="text-slate-500">→</span>
          <span className="text-amber-400">LOWER FAILURE RISK</span>
          <span className="text-slate-500">→</span>
          <span className="text-[#00ff41]">HIGHER MISSION RELIABILITY</span>
        </div>
      </div>
    </div>
  );
};
