import React, { useState, useEffect, useRef } from 'react';
import {
  FADEC_50_STEP_DATASET,
  ENGINE_18_SUBSYSTEMS,
  DATASET_FAULT_MODES,
  EngineSubsystemNode,
  DatasetFaultMode,
  FadecTelemetryStep,
  VYOM_ENGINE_FULL_SPECS,
} from './data/fadecDataset';
import {
  REFERENCE_ENGINE_SPEC,
  INITIAL_COMPONENTS,
  INITIAL_TELEMETRY,
  SENSOR_HOTSPOTS,
  FAULT_SCENARIOS,
  MISSION_PROFILES,
} from './data/engineData';
import {
  NavigationTab,
  EngineComponent,
  TelemetryItem,
  SensorHotspot,
  FaultId,
  MissionProfileId,
} from './types/engine';

// Components
import { ThreeEngineCanvas } from './components/ThreeEngineCanvas';
import { SpecsModal } from './components/SpecsModal';
import { CsvDatasetModal } from './components/CsvDatasetModal';
import { ModelStatsModal } from './components/ModelStatsModal';

// Deep Analytics components for extended tab mode
import { TelemetryPanel } from './components/TelemetryPanel';
import { EngineHealthIndexPanel } from './components/EngineHealthIndexPanel';
import { DigitalTwinComparison } from './components/DigitalTwinComparison';
import { HybridAiPrognostics } from './components/HybridAiPrognostics';
import { FaultInjectionLab } from './components/FaultInjectionLab';
import { PrognosticsRulPanel } from './components/PrognosticsRulPanel';
import { MissionSimulator } from './components/MissionSimulator';
import { MissionReplay } from './components/MissionReplay';
import { MissionDecisionLogic } from './components/MissionDecisionLogic';
import { ValidationPanel } from './components/ValidationPanel';
import { SystemArchitectureDiagram } from './components/SystemArchitectureDiagram';
import { TechnicalEventLog, LogEntry } from './components/TechnicalEventLog';

// Icons
import {
  Plane,
  Radio,
  Box,
  Download,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Thermometer,
  Zap,
  Activity,
  Layers,
  Eye,
  Sliders,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  Info,
  ShieldAlert,
  Flame,
  Wrench,
  BarChart3,
  Search,
} from 'lucide-react';

export default function App() {
  // Main view mode: 'DASHBOARD' (primary screenshot layout) or 'ANALYTICS_SUITE' (deep analytical views)
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'ANALYTICS_SUITE'>('DASHBOARD');
  const [suiteTab, setSuiteTab] = useState<NavigationTab>('TELEMETRY');

  // Modals
  const [showSpecsModal, setShowSpecsModal] = useState<boolean>(false);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Active Telemetry Step (1 to 50)
  const [currentStep, setCurrentStep] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x

  // Subsystems & Selection
  const [subsystems, setSubsystems] = useState<EngineSubsystemNode[]>(ENGINE_18_SUBSYSTEMS);
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string>('crankcase');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('');

  // Fault Simulation Mode
  const [activeFaultId, setActiveFaultId] = useState<string>('NORMAL_OPERATION');
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  // 3D Canvas Controls
  const [explodedProgress, setExplodedProgress] = useState<number>(0);
  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);
  const [renderMode, setRenderMode] = useState<'METALLIC' | 'THERMAL' | 'STRESS' | 'WIREFRAME'>('METALLIC');
  const [cameraPreset, setCameraPreset] = useState<'OVERVIEW' | 'FRONT' | 'CYLINDERS' | 'TURBO' | 'ECU' | null>(null);

  // Center Bottom Tab
  const [centerBottomTab, setCenterBottomTab] = useState<'AI_PREDICTIVE' | 'BASELINE_COMPARISON'>('BASELINE_COMPARISON');

  // Micro-fluctuation for continuous live movement (numbers keep changing)
  const [noiseSeed, setNoiseSeed] = useState<number>(0);

  // Event Log
  const [eventLogs, setEventLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: '14:28:12.400',
      message: 'DRDO VYOM FADEC 100 Hz Avionics Stream synchronized (50-Step Buffer Initialized)',
      type: 'INFO',
    },
    {
      id: 'log-2',
      timestamp: '14:28:13.150',
      message: 'VYOM 4-Cylinder Boxer 3D Digital Twin model initialized (18 Nodes active)',
      type: 'INFO',
    },
  ]);

  const addEventLog = (message: string, type: 'INFO' | 'WARNING' | 'CRITICAL' | 'ACTION') => {
    const now = new Date();
    const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setEventLogs((prev) => [{ id: `log-${Date.now()}`, timestamp: ts, message, type }, ...prev.slice(0, 49)]);
  };

  // Live 50-Step Telemetry Loop with Micro-fluctuations
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(300, 1000 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev >= 50 ? 1 : prev + 1));
      setNoiseSeed((prev) => (prev + 1) % 1000);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Fast micro-jitter timer for authentic high-frequency telemetry (numbers constantly alive!)
  useEffect(() => {
    const jitterTimer = setInterval(() => {
      setNoiseSeed((s) => (s + 0.1) % 1000);
    }, 120);
    return () => clearInterval(jitterTimer);
  }, []);

  // Compute Current Telemetry Values with Fault Injections
  const stepData: FadecTelemetryStep = FADEC_50_STEP_DATASET[currentStep - 1] || FADEC_50_STEP_DATASET[0];
  const activeFault = DATASET_FAULT_MODES.find((f) => f.id === activeFaultId) || DATASET_FAULT_MODES[0];
  const isFaultActive = activeFault.id !== 'NORMAL_OPERATION';

  // Micro jitter calculations
  const jitterVal = Math.sin(noiseSeed * 2.5) * 0.4;
  const jitterSmall = Math.cos(noiseSeed * 3.8) * 0.08;

  // Live Parameters combining dataset step + fault deltas + live micro jitter
  const liveRpm = Math.max(0, stepData.propellerRpm + activeFault.telemetryDeltas.rpmDelta + jitterVal * 1.5);
  const liveAltitude = stepData.altitudeFt + Math.sin(noiseSeed * 0.8) * 1.2;
  const livePowerHp = Math.max(0, stepData.enginePowerHp + (activeFault.telemetryDeltas.rpmDelta / 30) + jitterSmall);
  const livePowerPct = (livePowerHp / 180) * 100;
  const liveChtAvg = Math.max(60, stepData.chtAvgC + activeFault.telemetryDeltas.chtDelta + jitterSmall);
  const liveEgt = Math.max(200, stepData.egtC + activeFault.telemetryDeltas.egtDelta + jitterVal * 2.5);
  const liveOilPressure = Math.max(0.5, stepData.oilPressureBar + activeFault.telemetryDeltas.oilPressDelta + jitterSmall * 0.05);
  const liveOilTemp = stepData.oilTempC + (isFaultActive ? 6.5 : 0) + jitterSmall;
  const liveVibration = Math.max(0.4, stepData.vibrationMmS + activeFault.telemetryDeltas.vibeDelta + Math.abs(jitterVal * 0.15));
  const liveFuelFlow = Math.max(5, stepData.fuelFlowLph + activeFault.telemetryDeltas.fuelFlowDelta + jitterSmall * 0.3);
  const liveBoost = Math.max(0.8, stepData.manifoldBoostBar + activeFault.telemetryDeltas.boostDelta + jitterSmall * 0.01);
  const liveEhi = isFaultActive ? Math.max(35, stepData.healthIndexPct - 18) : stepData.healthIndexPct;
  const liveRul = isFaultActive ? Math.max(120, Math.round(stepData.rulHours * 0.65)) : stepData.rulHours;
  const liveAnomalyScore = isFaultActive ? Math.min(0.96, Math.max(0.68, stepData.anomalyScore + 0.55)) : stepData.anomalyScore;

  // Live individual cylinder temperatures
  const liveChtCylinders: [number, number, number, number] = [
    stepData.chtCylinders[0] + (activeFault.affectedNode === 'cylinder_1' ? activeFault.telemetryDeltas.chtDelta : 0) + jitterSmall,
    stepData.chtCylinders[1] + (activeFault.affectedNode === 'cylinder_2' ? activeFault.telemetryDeltas.chtDelta : 0) + jitterSmall,
    stepData.chtCylinders[2] + (activeFault.affectedNode === 'cylinder_3' ? activeFault.telemetryDeltas.chtDelta : 0) + jitterSmall,
    stepData.chtCylinders[3] + (activeFault.affectedNode === 'cylinder_4' ? activeFault.telemetryDeltas.chtDelta : 0) + jitterSmall,
  ];

  // Baseline Nominal comparison targets
  const baselineRpm = 3045.1;
  const baselineCht = 111.06;
  const baselineEgt = 591.69;
  const baselineOilPress = 4.33;
  const baselineBoost = 1.20;
  const baselineVibe = 1.42;

  // Calculate percentage deltas
  const calcDelta = (current: number, baseline: number) => {
    const diff = ((current - baseline) / baseline) * 100;
    return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
  };

  // Switch Fault Mode
  const handleSelectFault = (fault: DatasetFaultMode) => {
    setActiveFaultId(fault.id);
    if (fault.id === 'NORMAL_OPERATION') {
      addEventLog('Fault cleared: Engine operating in nominal airworthy baseline.', 'INFO');
    } else {
      addEventLog(`Fault Injected: ${fault.name}. Anomaly triggered on node [${fault.affectedNode.toUpperCase()}].`, 'WARNING');
      setSelectedSubsystemId(fault.affectedNode);
    }
  };

  // Automated Fault Demo Loop
  const toggleDemoMode = () => {
    if (isDemoRunning) {
      setIsDemoRunning(false);
      setActiveFaultId('NORMAL_OPERATION');
      addEventLog('Automated Fault Demonstration halted.', 'INFO');
    } else {
      setIsDemoRunning(true);
      addEventLog('Automated Fault Demonstration initiated (Cycling 8 scenarios).', 'ACTION');
      let idx = 1;
      const demoTimer = setInterval(() => {
        if (idx >= DATASET_FAULT_MODES.length) idx = 0;
        const fault = DATASET_FAULT_MODES[idx];
        setActiveFaultId(fault.id);
        setSelectedSubsystemId(fault.affectedNode);
        idx++;
      }, 5000);
      // store in window for cleanup
      (window as any).__demoTimer = demoTimer;
    }
  };

  useEffect(() => {
    return () => {
      if ((window as any).__demoTimer) clearInterval((window as any).__demoTimer);
    };
  }, []);

  // Update subsystem statuses based on active fault
  useEffect(() => {
    setSubsystems((prev) =>
      prev.map((sub) => {
        if (activeFault.id !== 'NORMAL_OPERATION' && sub.id === activeFault.affectedNode) {
          return {
            ...sub,
            status: activeFault.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            healthPct: Math.max(38, sub.healthPct - 24),
          };
        }
        return {
          ...sub,
          status: 'NOMINAL',
          healthPct: ENGINE_18_SUBSYSTEMS.find((s) => s.id === sub.id)?.healthPct || 95,
        };
      })
    );
  }, [activeFault]);

  // Export Diagnostics Handler
  const handleExportDiagnostics = () => {
    const report = {
      title: 'VYOM UAV Aero-Twin Propulsion Diagnostic Report',
      timestamp: new Date().toISOString(),
      platform: 'VYOM Tactical MALE UAV',
      engine: '180 HP Supercharged Boxer 4-Stroke Aero-Piston',
      activeStep: currentStep,
      activeFault: activeFault.name,
      anomalyScore: liveAnomalyScore,
      ehiIndex: liveEhi,
      rulHours: liveRul,
      telemetrySnapshot: {
        rpm: liveRpm.toFixed(1),
        altitudeFt: liveAltitude.toFixed(1),
        powerHp: livePowerHp.toFixed(1),
        chtAvgC: liveChtAvg.toFixed(2),
        egtC: liveEgt.toFixed(2),
        oilPressureBar: liveOilPressure.toFixed(3),
        vibrationMmS: liveVibration.toFixed(3),
        fuelFlowLph: liveFuelFlow.toFixed(2),
        manifoldBoostBar: liveBoost.toFixed(2),
      },
      recommendation: activeFault.recommendation,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VYOM_Diagnostics_Step${currentStep}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addEventLog('Diagnostics report JSON exported successfully.', 'ACTION');
  };

  // Filtered subsystems list
  const filteredSubsystems = subsystems.filter(
    (s) =>
      s.name.toLowerCase().includes(subsystemFilter.toLowerCase()) ||
      s.nodeCode.toLowerCase().includes(subsystemFilter.toLowerCase()) ||
      s.subsystem.toLowerCase().includes(subsystemFilter.toLowerCase())
  );

  return (
    <div className="w-screen h-screen bg-[#030712] text-[#e0e6ed] font-sans overflow-hidden flex flex-col select-none">
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION & HEADER BAR (Matching Reference Screenshot)            */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#070d1c] border-b border-[#1e2d4d] px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        {/* Left: Brand & Badges */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Plane className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm tracking-wide text-white">
                DRDO VYOM AERO TWIN SENTINEL
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40">
                180 HP Supercharged Aero Piston
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight">
              AI-Powered Predictive Maintenance & CSV Telemetry Dashboard
            </span>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="hidden lg:flex items-center gap-1 bg-[#040814] p-1 rounded-lg border border-[#1e2d4d]">
          <button
            onClick={() => setViewMode('DASHBOARD')}
            className={`px-3 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'DASHBOARD'
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>3D Flight Deck</span>
          </button>
          <button
            onClick={() => setViewMode('ANALYTICS_SUITE')}
            className={`px-3 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'ANALYTICS_SUITE'
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Mission Suite</span>
          </button>
        </div>

        {/* Right: Modals & Actions (Matching Screenshot) */}
        <div className="flex items-center gap-2">
          {/* 1. UAV & Engine Specs */}
          <button
            onClick={() => setShowSpecsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0a1428] hover:bg-[#0f2042] border border-[#1e2d4d] text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="View UAV and Aero Engine technical specifications"
          >
            <Info className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden sm:inline">UAV & Engine Specs</span>
          </button>

          {/* 2. CSV Dataset Stream */}
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0a1428] hover:bg-[#0f2042] border border-[#1e2d4d] text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="Inspect 50-step flight dataset stream table"
          >
            <Radio className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
            <span className="hidden sm:inline">CSV DATASET STREAM</span>
          </button>

          {/* 3. 3D GLB / Nodes Stats */}
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0a1428] hover:bg-[#0f2042] border border-[#1e2d4d] text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="Inspect 3D scene graph and mesh hierarchy"
          >
            <Box className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden md:inline">3D GLB: 2.18 MB / 18 Nodes</span>
          </button>

          {/* 4. Export Diagnostics */}
          <button
            onClick={handleExportDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Diagnostics</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE VIEW                                                   */}
      {/* ========================================================================= */}
      {viewMode === 'DASHBOARD' ? (
        <div className="flex-1 flex overflow-hidden p-3 gap-3 bg-[#030712]">
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: FAILURE SIMULATION MODE & 3D ENGINE SUBSYSTEMS (~300px) */}
          {/* --------------------------------------------------------------------- */}
          <aside className="w-[310px] shrink-0 flex flex-col gap-3 overflow-hidden">
            {/* CARD 1: FAILURE SIMULATION MODE (8 DATASET FAULTS) */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shrink-0 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e2d4d]">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#ff4b2b]" />
                  <span className="text-xs font-bold font-heading text-white tracking-wider">
                    FAILURE SIMULATION MODE
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  8 DATASET FAULTS
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-1 mb-2">
                Select a fault to inject real-time telemetry anomalies into the 3D twin:
              </p>

              {/* Fault Button Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[170px] overflow-y-auto pr-0.5">
                {DATASET_FAULT_MODES.map((f) => {
                  const isActive = activeFaultId === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFault(f)}
                      className={`px-2 py-1.5 rounded-lg border text-left text-[10px] font-mono transition-all flex items-center justify-between ${
                        isActive
                          ? f.id === 'NORMAL_OPERATION'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'bg-[#ff4b2b]/20 border-[#ff4b2b] text-[#ff4b2b] font-bold shadow-[0_0_10px_rgba(255,75,43,0.25)] animate-pulse'
                          : 'bg-[#0a1428] border-[#1e2d4d] text-slate-300 hover:bg-[#0f1f3d] hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-1">{f.name}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'TEST'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 2: 3D ENGINE SUBSYSTEMS (18 NODES) */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex-1 flex flex-col overflow-hidden shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e2d4d]">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#00f0ff]" />
                  <span className="text-xs font-bold font-heading text-white tracking-wider">
                    3D ENGINE SUBSYSTEMS
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">
                  18 Nodes
                </span>
              </div>

              {/* Subsystem Search */}
              <div className="relative my-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter 18 subsystems..."
                  value={subsystemFilter}
                  onChange={(e) => setSubsystemFilter(e.target.value)}
                  className="w-full bg-[#0a1428] border border-[#1e2d4d] rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] font-mono"
                />
              </div>

              {/* Subsystems List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                {filteredSubsystems.map((sub, idx) => {
                  const isSelected = selectedSubsystemId === sub.id;
                  const isFaulted = activeFault.id !== 'NORMAL_OPERATION' && activeFault.affectedNode === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubsystemId(sub.id);
                        setCameraPreset(sub.cameraPreset);
                      }}
                      className={`p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-md'
                          : isFaulted
                          ? 'bg-[#ff4b2b]/15 border-[#ff4b2b]/60 text-[#ff4b2b]'
                          : 'bg-[#0a1428] border-[#1e2d4d] text-slate-300 hover:bg-[#0f1f3d] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 text-[10px]">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-[11px] truncate">{sub.name}</span>
                          <span className="text-[9px] text-slate-400">{sub.nodeCode}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isFaulted
                              ? 'bg-[#ff4b2b]/20 text-[#ff4b2b] border border-[#ff4b2b]/40 animate-pulse'
                              : sub.status === 'NOMINAL'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isFaulted ? 'FAULT' : sub.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* --------------------------------------------------------------------- */}
          {/* CENTER COLUMN: 3D DIGITAL TWIN + COMPARISON DOCK                       */}
          {/* --------------------------------------------------------------------- */}
          <main className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
            {/* 3D ENGINE CANVAS CONTAINER (Takes primary space) */}
            <div className="flex-1 relative min-h-[360px] rounded-xl overflow-hidden shadow-2xl">
              <ThreeEngineCanvas
                selectedComponentId={selectedSubsystemId}
                onSelectComponent={(id) => {
                  setSelectedSubsystemId(id);
                  const node = ENGINE_18_SUBSYSTEMS.find((n) => n.id === id);
                  if (node) setCameraPreset(node.cameraPreset);
                }}
                selectedSensorId={null}
                onSelectSensor={(sensor) => addEventLog(`Sensor Selected: ${sensor.name}`, 'INFO')}
                renderMode={renderMode}
                setRenderMode={setRenderMode}
                explodedProgress={explodedProgress}
                setExplodedProgress={setExplodedProgress}
                engineRpm={liveRpm}
                engineHealth={liveEhi}
                isXRayMode={isXRayMode}
                setIsXRayMode={setIsXRayMode}
                activeFaultId={activeFaultId}
                vibrationMmS={liveVibration}
                liveChtC={liveChtAvg}
                liveEgtC={liveEgt}
                liveFuelFlowLph={liveFuelFlow}
                liveOilPressureBar={liveOilPressure}
                cameraPreset={cameraPreset}
                onClearCameraPreset={() => setCameraPreset(null)}
              />
            </div>

            {/* CENTER BOTTOM: TABS & COMPARISON METRICS (Matching Reference Screenshot) */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 shrink-0 shadow-lg">
              {/* Tab Selector Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1e2d4d]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCenterBottomTab('BASELINE_COMPARISON')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                      centerBottomTab === 'BASELINE_COMPARISON'
                        ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Baseline vs Failure Mode Comparison</span>
                  </button>

                  <button
                    onClick={() => setCenterBottomTab('AI_PREDICTIVE')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                      centerBottomTab === 'AI_PREDICTIVE'
                        ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI Predictive Maintenance</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  Ref Baseline: 3,045 RPM Nominal Cruise Profile
                </span>
              </div>

              {/* Tab Content 1: Baseline vs Failure Mode Comparison (6 Real-time Cards) */}
              {centerBottomTab === 'BASELINE_COMPARISON' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2.5">
                  {/* 1. Propeller RPM */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">RPM (Propeller)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-mono font-bold text-white">
                        {liveRpm.toFixed(1)}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          liveRpm < 2850 ? 'bg-[#ff4b2b]/20 text-[#ff4b2b]' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {calcDelta(liveRpm, baselineRpm)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                      Base: {baselineRpm} RPM
                    </span>
                  </div>

                  {/* 2. Cylinder Head Temp */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">CHT Avg (°C)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-mono font-bold text-[#38bdf8]">
                        {liveChtAvg.toFixed(2)}°C
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          liveChtAvg > 140 ? 'bg-[#ff4b2b]/20 text-[#ff4b2b]' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {calcDelta(liveChtAvg, baselineCht)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                      Base: {baselineCht}°C
                    </span>
                  </div>

                  {/* 3. Exhaust Gas Temp */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">EGT Temp (°C)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-mono font-bold text-amber-400">
                        {liveEgt.toFixed(2)}°C
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          liveEgt > 660 ? 'bg-[#ff4b2b]/20 text-[#ff4b2b]' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {calcDelta(liveEgt, baselineEgt)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                      Base: {baselineEgt}°C
                    </span>
                  </div>

                  {/* 4. Oil Pressure */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">Oil Pressure (bar)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {liveOilPressure.toFixed(3)}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          liveOilPressure < 3.2 ? 'bg-[#ff4b2b]/20 text-[#ff4b2b]' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {calcDelta(liveOilPressure, baselineOilPress)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                      Base: {baselineOilPress} bar
                    </span>
                  </div>

                  {/* 5. Manifold Boost Pressure */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">Boost (bar)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-mono font-bold text-sky-400">
                        {liveBoost.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          liveBoost < 1.05 ? 'bg-[#ff4b2b]/20 text-[#ff4b2b]' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {calcDelta(liveBoost, baselineBoost)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                      Base: {baselineBoost} bar
                    </span>
                  </div>

                  {/* 6. Harmonic Vibration RMS */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">Vibration (mm/s)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span
                        className={`text-sm font-mono font-bold ${
                          liveVibration > 3.0 ? 'text-[#ff4b2b]' : 'text-slate-200'
                        }`}
                      >
                        {liveVibration.toFixed(3)}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          liveVibration > 3.0 ? 'bg-[#ff4b2b]/20 text-[#ff4b2b] font-bold' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {calcDelta(liveVibration, baselineVibe)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                      Base: {baselineVibe} mm/s
                    </span>
                  </div>
                </div>
              )}

              {/* Tab Content 2: AI Predictive Maintenance */}
              {centerBottomTab === 'AI_PREDICTIVE' && (
                <div className="grid grid-cols-3 gap-3 pt-2.5 text-xs font-mono">
                  {/* Isolation Forest Anomaly Score */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2.5 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[10px]">Isolation Forest Anomaly</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          liveAnomalyScore > 0.5 ? 'bg-[#ff4b2b]/20 text-[#ff4b2b]' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {liveAnomalyScore > 0.5 ? 'ANOMALOUS' : 'NOMINAL'}
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white">{liveAnomalyScore.toFixed(3)}</span>
                      <span className="text-[10px] text-slate-400">Threshold: 0.450</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          liveAnomalyScore > 0.5 ? 'bg-[#ff4b2b]' : 'bg-[#00f0ff]'
                        }`}
                        style={{ width: `${liveAnomalyScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Random Forest Fault Classifier */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2.5 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[10px]">Random Forest Classification</span>
                      <span className="text-emerald-400 text-[10px] font-bold">96.4% Conf</span>
                    </div>
                    <div className="my-1">
                      <span className="text-xs font-bold text-amber-300 block truncate">
                        {activeFault.name}
                      </span>
                      <span className="text-[9px] text-slate-400 block truncate">
                        Affecting: {activeFault.affectedNode}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500">
                      Trained on 10,000 STANAG 4671 flight cycles
                    </span>
                  </div>

                  {/* Airworthiness Advisory */}
                  <div className="bg-[#0a1428] border border-[#1e2d4d] rounded-lg p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400">FADEC Action Recommendation</span>
                    <p className="text-[10px] text-slate-200 leading-tight my-1">
                      {activeFault.recommendation}
                    </p>
                    <span className="text-[9px] text-[#00f0ff] font-bold">
                      RUL Impact: -{Math.round(1180 - liveRul)} Flight Hours
                    </span>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: LIVE FADEC STREAM & CHANGING NUMBERS (~330px)           */}
          {/* --------------------------------------------------------------------- */}
          <aside className="w-[330px] shrink-0 flex flex-col gap-2.5 overflow-y-auto">
            {/* STREAM HEADER & CURRENT STEP */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00f0ff] animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-heading text-white tracking-wider">
                    LIVE FADEC STREAM
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    50-STEP CAN-BUS TELEMETRY
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-xs font-bold">
                <span>STEP {currentStep} / 50</span>
              </div>
            </div>

            {/* ALERT BANNER (WARNING TELEMETRY ANOMALY OR NOMINAL) */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-mono font-bold transition-all shadow-md ${
                isFaultActive || liveAnomalyScore > 0.45
                  ? 'bg-[#ff4b2b]/20 border-[#ff4b2b] text-[#ff4b2b] shadow-[0_0_20px_rgba(255,75,43,0.3)] animate-pulse'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isFaultActive || liveAnomalyScore > 0.45 ? (
                <>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="flex flex-col">
                    <span>⚠ WARNING: TELEMETRY ANOMALY</span>
                    <span className="text-[9px] font-normal opacity-90">
                      Fault condition active: {activeFault.name}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div className="flex flex-col">
                    <span>✓ AIRWORTHY: ALL SYSTEMS NOMINAL</span>
                    <span className="text-[9px] font-normal opacity-90">
                      Engine within STANAG 4671 certified bounds
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 1. ALTITUDE (VYOM Ceil: 28k ft) */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Altitude (Archer-NG / VYOM Ceil: 28k ft)
                </span>
                <span className="text-[9px] font-mono text-[#00f0ff]">LIVE GPS/BARO</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-mono font-bold text-white tracking-tight">
                  {liveAltitude.toFixed(1)} <span className="text-xs font-normal text-slate-400">ft</span>
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Phase: <strong className="text-white">{stepData.phase}</strong>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1 pt-1 border-t border-white/5">
                <span>Amb Temp: <strong className="text-amber-400">{stepData.ambientTempC}°C</strong></span>
                <span>Baro QNH: <strong>1013.2 hPa</strong></span>
              </div>
            </div>

            {/* 2. ENGINE POWER (180 HP MAX) */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Engine Power (VYOM 180 HP)
                </span>
                <span className="text-[9px] font-mono text-emerald-400">FADEC TORQUE</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-mono font-bold text-white tracking-tight">
                  {livePowerHp.toFixed(1)} <span className="text-xs font-normal text-slate-400">HP</span>
                </span>
                <span className="text-xs font-mono text-[#00f0ff] font-bold">
                  {livePowerPct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-[#00f0ff] transition-all duration-300"
                  style={{ width: `${Math.min(100, livePowerPct)}%` }}
                />
              </div>
            </div>

            {/* 3. PROPELLER RPM */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">Propeller Shaft RPM</span>
                <span className="text-[9px] font-mono text-[#00f0ff]">HALL SENSOR</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-mono font-bold text-[#00f0ff] tracking-tight">
                  {liveRpm.toFixed(1)} <span className="text-xs font-normal text-slate-400">RPM</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Crank: {(liveRpm * 1.95).toFixed(0)} RPM
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (liveRpm / 3200) * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. CYLINDER HEAD TEMPERATURE (CHT 1-4) LIMIT: 220°C */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Cylinder Head Temp (CHT 1-4) Limit: 220°C
                </span>
                <span className="text-[9px] font-mono text-amber-400">THERMOCOUPLES</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {liveChtCylinders.map((cht, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-1.5 rounded bg-[#0a1428] border border-[#1e2d4d] flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-400 text-[10px]">CYL #{cIdx + 1}</span>
                    <span
                      className={`font-bold ${
                        cht > 180 ? 'text-[#ff4b2b]' : cht > 165 ? 'text-amber-300' : 'text-[#38bdf8]'
                      }`}
                    >
                      {cht.toFixed(1)}°C
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SPARK TIMING & LAMBDA RATIO */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shadow-md text-xs font-mono">
              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                <span className="text-[10px] text-slate-400">Spark Timing & Lambda</span>
                <span className="text-[9px] text-sky-400">COMBUSTION</span>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-slate-400 text-[10px]">Ignition Advance:</span>
                <span className="font-bold text-white">{stepData.sparkAdvanceDeg}° BTDC</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-[10px]">Exhaust Lambda (O2):</span>
                <span className="font-bold text-emerald-400">{stepData.lambdaO2} λ</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-[10px]">Fuel Pressure:</span>
                <span className="font-bold text-white">{stepData.fuelPressureBar} bar</span>
              </div>
            </div>

            {/* 6. SUPERCHARGER BOOST & INTERCOOLER */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shadow-md text-xs font-mono">
              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                <span className="text-[10px] text-slate-400">Supercharger Boost</span>
                <span className="text-[9px] text-[#00f0ff]">FORCED INDUCTION</span>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-slate-400 text-[10px]">Absolute Boost:</span>
                <span className="font-bold text-[#00f0ff]">{liveBoost.toFixed(2)} bar</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-[10px]">Intercooler Out Temp:</span>
                <span className="font-bold text-amber-300">{stepData.intercoolerTempC}°C</span>
              </div>
            </div>

            {/* 7. ENGINE HEALTH & RUL */}
            <div className="bg-[#070e1e] border border-[#1e2d4d] rounded-xl p-3 flex flex-col shadow-md text-xs font-mono">
              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                <span className="text-[10px] text-slate-400">Health Index & RUL</span>
                <span className="text-[9px] text-emerald-400">PROGNOSTICS</span>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-slate-400 text-[10px]">Engine Health (EHI):</span>
                <span
                  className={`font-bold text-sm ${
                    liveEhi < 65 ? 'text-[#ff4b2b]' : liveEhi < 80 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {liveEhi}%
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-[10px]">Remaining Useful Life:</span>
                <span className="font-bold text-white">{liveRul} Flight Hours</span>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* ======================================================================= */
        /* SECONDARY VIEW: DEEP ANALYTICS & MISSION SIMULATION SUITE               */
        /* ======================================================================= */
        <div className="flex-1 flex flex-col overflow-hidden bg-[#030712] p-4 gap-3">
          {/* Secondary Tab Strip */}
          <div className="flex items-center justify-between bg-[#070e1e] p-2 rounded-xl border border-[#1e2d4d]">
            <div className="flex items-center gap-1">
              {[
                { id: 'TELEMETRY', label: 'Telemetry Channels' },
                { id: 'DIAGNOSTICS', label: 'Fault Diagnostics' },
                { id: 'PROGNOSTICS_RUL', label: 'Prognostics & RUL' },
                { id: 'MISSION_SIMULATION', label: 'Mission Flight Sim' },
                { id: 'MISSION_REPLAY', label: 'Flight Data Replay' },
                { id: 'VALIDATION', label: 'Model Validation' },
                { id: 'SYSTEM_ARCHITECTURE', label: 'System Architecture' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSuiteTab(tab.id as NavigationTab)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    suiteTab === tab.id
                      ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setViewMode('DASHBOARD')}
              className="px-3 py-1.5 rounded-lg bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-mono font-bold"
            >
              ← Back to 3D Flight Deck
            </button>
          </div>

          {/* Sub-view Rendering */}
          <div className="flex-1 overflow-y-auto">
            {suiteTab === 'TELEMETRY' && <TelemetryPanel telemetry={INITIAL_TELEMETRY} onInspectItem={() => {}} />}
            {suiteTab === 'DIAGNOSTICS' && (
              <div className="grid grid-cols-2 gap-4">
                <DigitalTwinComparison
                  components={INITIAL_COMPONENTS}
                  selectedComponent={INITIAL_COMPONENTS[0]}
                  telemetry={INITIAL_TELEMETRY}
                />
                <HybridAiPrognostics
                  selectedComponent={INITIAL_COMPONENTS[0]}
                  aiReport={{
                    anomalyDetected: isFaultActive,
                    faultName: activeFault.name,
                    severity: activeFault.severity as any,
                    confidencePct: 94.8,
                    likelyCause: activeFault.description,
                    effect: 'Telemetry signature shift detected across FADEC CAN Bus',
                    recommendation: activeFault.recommendation,
                    anomalyScore: liveAnomalyScore,
                    isolationForestScore: liveAnomalyScore,
                    randomForestConfidence: 0.948,
                  }}
                  onRunDiagnostic={() => addEventLog('Running deep diagnostic scan...', 'ACTION')}
                />
              </div>
            )}
            {suiteTab === 'PROGNOSTICS_RUL' && (
              <PrognosticsRulPanel
                components={INITIAL_COMPONENTS}
                selectedComponent={INITIAL_COMPONENTS[0]}
                onScheduleMaintenance={() => addEventLog('Maintenance scheduled', 'ACTION')}
              />
            )}
            {suiteTab === 'MISSION_SIMULATION' && (
              <MissionSimulator
                profiles={MISSION_PROFILES}
                currentProfileId={'CRUISE'}
                onSelectProfile={() => {}}
                altitudeFt={liveAltitude}
                setAltitudeFt={() => {}}
                throttlePct={livePowerPct}
                setThrottlePct={() => {}}
                ambientTempC={stepData.ambientTempC}
                setAmbientTempC={() => {}}
                engineLoadPct={68}
                estimatedEnduranceHours={14.5}
                rangeKm={1850}
              />
            )}
            {suiteTab === 'MISSION_REPLAY' && <MissionReplay onSeek={() => {}} />}
            {suiteTab === 'VALIDATION' && <ValidationPanel />}
            {suiteTab === 'SYSTEM_ARCHITECTURE' && <SystemArchitectureDiagram />}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BOTTOM FLIGHT CONTROLS DOCK (Matching Reference Screenshot)            */}
      {/* ========================================================================= */}
      <footer className="bg-[#070e1e] border-t border-[#1e2d4d] px-4 py-2.5 flex flex-col gap-2 shrink-0 z-30 shadow-2xl">
        {/* ROW 1: Flight Stream Playback & Fault Demo Trigger */}
        <div className="flex items-center justify-between text-xs font-mono">
          {/* Left: Play/Pause/Reset & Speed */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isPlaying
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Flight Stream' : 'Play Flight Stream'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentStep(1);
                addEventLog('Flight stream reset to Step #1', 'INFO');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0a1428] hover:bg-[#0f1f3d] border border-[#1e2d4d] text-slate-300 hover:text-white transition-all"
              title="Reset Stream to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-[#0a1428] rounded-lg border border-[#1e2d4d] p-0.5 ml-1">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-all ${
                    playbackSpeed === speed
                      ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Demonstrate Fault Simulation Button (from screenshot!) */}
            <button
              onClick={toggleDemoMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ml-2 ${
                isDemoRunning
                  ? 'bg-[#ff4b2b]/25 border-[#ff4b2b] text-[#ff4b2b] shadow-[0_0_15px_rgba(255,75,43,0.3)] animate-pulse'
                  : 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/50 text-indigo-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isDemoRunning ? 'Stop Fault Demo' : 'Demonstrate Fault Simulation'}</span>
            </button>
          </div>

          {/* Center: 50-Step Scrubber Slider */}
          <div className="flex-1 max-w-md mx-4 flex items-center gap-3">
            <span className="text-[10px] text-slate-400 shrink-0">
              Telemetry Step: <strong className="text-white">#{currentStep}</strong> / 50
            </span>
            <input
              type="range"
              min="1"
              max="50"
              value={currentStep}
              onChange={(e) => setCurrentStep(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f0ff]"
            />
          </div>

          {/* Right: Status badge */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>FADEC 100 Hz Stream Synchronized</span>
          </div>
        </div>

        {/* ROW 2: 3D Visualization Controls (X-Ray, Exploded View, Camera Presets, Export) */}
        <div className="flex items-center justify-between pt-1.5 border-t border-[#1e2d4d]/60 text-xs font-mono">
          {/* Left: X-Ray / Digital Twin Mode */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsXRayMode(!isXRayMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs transition-all ${
                isXRayMode
                  ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-[#0a1428] border-[#1e2d4d] text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>X-Ray / Digital Twin Mode</span>
            </button>

            {/* Exploded View Slider */}
            <div className="flex items-center gap-2 bg-[#0a1428] px-3 py-1 rounded-lg border border-[#1e2d4d]">
              <span className="text-[10px] text-slate-400">Exploded View:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedProgress}
                onChange={(e) => setExplodedProgress(Number(e.target.value))}
                className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00f0ff]"
              />
              <span className="text-[10px] text-[#00f0ff] w-7">
                {Math.round(explodedProgress * 100)}%
              </span>
            </div>
          </div>

          {/* Center: Camera Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 hidden sm:inline">Camera:</span>
            {(['OVERVIEW', 'FRONT', 'CYLINDERS', 'TURBO', 'ECU'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setCameraPreset(preset)}
                className="px-2.5 py-1 rounded bg-[#0a1428] hover:bg-[#0f1f3d] border border-[#1e2d4d] text-[10px] text-slate-300 hover:text-white transition-all"
              >
                {preset.charAt(0) + preset.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Right: Export .GLB / CSV Button */}
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Export .GLB / CSV</span>
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 4. MODALS                                                                 */}
      {/* ========================================================================= */}
      <SpecsModal isOpen={showSpecsModal} onClose={() => setShowSpecsModal(false)} />
      <CsvDatasetModal isOpen={showCsvModal} onClose={() => setShowCsvModal(false)} currentStep={currentStep} />
      <ModelStatsModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} />
    </div>
  );
}
