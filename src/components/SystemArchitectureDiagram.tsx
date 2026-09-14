import React, { useState } from 'react';
import { Layers, ArrowDown, ChevronRight, ChevronDown, Cpu, Network, Radio, Server, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SystemArchitectureDiagram: React.FC = () => {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(0);

  const architectureLayers = [
    {
      id: 0,
      title: 'VYOM UAV PROPULSION ENGINE',
      sub: 'Physical Asset Layer (4-Cylinder Boxer 1.8L)',
      desc: '132 kW (180 HP) mechanical assembly with forced-induction single-stage centrifugal supercharger, dual spark electronic ignition, OHV valvetrain, mechanical reduction gearbox (2.20:1 ratio), and external alternator pulley drive.',
      specs: ['Configuration: 4-cylinder Boxer', 'Displacement: 1,800 cc', 'Max Continuous: 97 kW @ 5,000 RPM', 'Dry Weight: 78 kg'],
    },
    {
      id: 1,
      title: 'ENGINE SENSORS & ECU HARDWARE',
      sub: 'Sensor Interface & Electronic Control Unit',
      desc: 'ECU engine management unit processing crankshaft angular position, manifold air pressure (MAP), lambda exhaust O2 ratio, manifold air temperature, throttle position (TPS), cylinder head CHT thermocouples, and dual ignition coil control switches.',
      specs: ['ECU: Dual-channel Electronic Engine Controller', 'Telemetry Datalogger: 5-channel high-rate acquisition', 'EGT: 4x K-Type probes (0–1000°C)', 'Fuel Regulator: 3.0–3.8 bar mechanical'],
    },
    {
      id: 2,
      title: 'CAN BUS 2.0B & TELEMETRY PROTOCOL',
      sub: 'Deterministic Avionic Bus',
      desc: 'High-reliability CAN 2.0B serial bus transmitting sensor frames at 100 Hz to the onboard flight management computer and SATCOM/line-of-sight ground data link.',
      specs: ['Baud Rate: 1 Mbps CAN 2.0B', 'Telemetry Link: Encrypted UAV Datalink', 'Sampling: Synchronous 100 Hz', 'Packet Loss Immunity: ARQ buffer'],
    },
    {
      id: 3,
      title: 'EDGE DATA PREPROCESSING & NORMALIZATION',
      sub: 'Signal Conditioning & State Filtering',
      desc: 'Edge processor running Kalman state estimation, dynamic atmospheric pressure correction (density altitude correction), sensor noise reduction, and baseline drift compensation.',
      specs: ['Filter: Extended Kalman Filter (EKF)', 'Latency: <15 ms compute', 'Outlier Rejection: 3-Sigma thresholding', 'Density Normalization: ISA model'],
    },
    {
      id: 4,
      title: 'PHYSICS-BASED DIGITAL TWIN MODEL',
      sub: 'Thermodynamic & Mechanical First-Principles',
      desc: 'Dynamic simulation of the 4-stroke Otto cycle, polytropic supercharger compression, manifold pressure dynamics, convective cylinder cooling, and hydrodynamic bearing lubrication.',
      specs: ['Cycle: 4-Stroke Otto P-V modeling', 'Supercharger: Centrifugal pressure ratio curve', 'Heat Dissipation: Fluid cooling matrix', 'Load Map: Dyno room baseline lookup'],
    },
    {
      id: 5,
      title: 'RESIDUAL GENERATION ENGINE',
      sub: 'Discrepancy Vector Calculation',
      desc: 'Computes continuous residuals: Residual(t) = Sensor_Actual(t) − Physics_Twin_Expected(t). Abnormal deviations pinpoint anomalous physical degradation prior to threshold breaches.',
      specs: ['Residual Channels: 11 active telemetry parameters', 'Drift Sensitivity: 0.5% deviation flag', 'Windowing: 5-sec moving mean', 'Noise Floor: Adaptive baseline'],
    },
    {
      id: 6,
      title: 'AI / ML PROGNOSTIC MODELS',
      sub: 'Anomaly Detection & Fault Classifier',
      desc: 'Hybrid machine learning inference stack combining Isolation Forest for unsupervised anomaly detection and Random Forest multi-class ensemble for root-cause fault classification.',
      specs: ['Anomaly Model: Isolation Forest (100 estimators)', 'Classifier: Random Forest (150 trees)', 'Training: 50,000 synthetic + dyno cycles', 'Inference: 1.2 ms execution'],
    },
    {
      id: 7,
      title: 'EHI, WEAR ACCUMULATION & RUL PROGNOSTICS',
      sub: 'Weibull & Bayesian Life Estimation',
      desc: 'Generates the unified Engine Health Index (EHI 0–100%), updates forward degradation trajectories across 350-hour horizons, and calculates remaining useful life with 95% Bayesian confidence intervals.',
      specs: ['Metric: Unified EHI (0–100%)', 'Life Model: Physics-informed Weibull degradation', 'Horizon: +350 flight-hours', 'Credible Bounds: 95% Confidence Envelope'],
    },
    {
      id: 8,
      title: 'MISSION DECISION SUPPORT & FLIGHT GOVERNOR',
      sub: 'Operational Action Generation',
      desc: 'Autonomous rule engine that converts prognostic state into actionable directives: CONTINUE (nominal flight), INSPECT (post-sortie service), RESTRICT (throttle limit), or ABORT (immediate RTB).',
      specs: ['Directives: Continue / Inspect / Restrict / Abort', 'Integration: GCS HUD & Pilot Advisory', 'Failsafe: Auto-throttle override', 'Log: Immutable Flight Audit Trail'],
    },
  ];

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            SYSTEM ARCHITECTURE & DIGITAL TWIN DATA PIPELINE
          </h2>
        </div>
        <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
          END-TO-END PIPELINE
        </span>
      </div>

      {/* Interactive Expandable Architecture Stack */}
      <div className="flex flex-col gap-2">
        {architectureLayers.map((layer, index) => {
          const isExpanded = expandedLayer === layer.id;
          return (
            <div
              key={layer.id}
              className={`rounded-lg border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-[#05070a] border-[#00f0ff]/60 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'bg-[#05070a]/60 hover:bg-[#05070a]/90 border-[#1a1f2e]'
              }`}
            >
              <button
                onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#00f0ff]">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white font-heading">{layer.title}</span>
                    <span className="text-[10px] text-[#8b949e] ml-2 block sm:inline">[{layer.sub}]</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8b949e] hidden sm:inline">
                    {isExpanded ? 'Collapse' : 'Details'}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#00f0ff]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Expandable Specification Details */}
              {isExpanded && (
                <div className="p-3.5 pt-0 border-t border-[#1a1f2e] text-xs flex flex-col gap-2.5 bg-[#05070a]/90">
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-2">
                    {layer.desc}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                    {layer.specs.map((s, i) => (
                      <div key={i} className="p-1.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#8b949e]">
                        <span className="text-white font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
