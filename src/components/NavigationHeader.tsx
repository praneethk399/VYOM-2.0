import React from 'react';
import { NavigationTab, MissionDecision } from '../types/engine';
import {
  Shield,
  Activity,
  Cpu,
  Radio,
  Play,
  AlertTriangle,
  RotateCcw,
  Zap,
  Gauge,
  Sliders,
  History,
  FileCheck2,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface NavigationHeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  digitalTwinSync: boolean;
  telemetryLive: boolean;
  aiModelActive: boolean;
  warningCount: number;
  engineHealthIndex: number;
  estimatedRulHours: number;
  missionStatus: string;
  missionDecision: MissionDecision;
  isDemoRunning: boolean;
  demoStep: number;
  onStartDemo: () => void;
  onResetAll: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  setActiveTab,
  digitalTwinSync,
  telemetryLive,
  aiModelActive,
  warningCount,
  engineHealthIndex,
  estimatedRulHours,
  missionStatus,
  missionDecision,
  isDemoRunning,
  demoStep,
  onStartDemo,
  onResetAll,
}) => {
  const getDecisionBadge = (decision: MissionDecision) => {
    switch (decision) {
      case 'CONTINUE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'INSPECT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'RESTRICT':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'ABORT':
        return 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse';
    }
  };

  const navTabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: '3D_DIGITAL_TWIN', label: '3D DIGITAL TWIN', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'TELEMETRY', label: 'TELEMETRY', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'DIAGNOSTICS', label: 'DIAGNOSTICS', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'PROGNOSTICS_RUL', label: 'PROGNOSTICS / RUL', icon: <Gauge className="w-3.5 h-3.5" /> },
    { id: 'MISSION_SIMULATION', label: 'MISSION SIMULATION', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'MISSION_REPLAY', label: 'MISSION REPLAY', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'VALIDATION', label: 'VALIDATION', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'SYSTEM_ARCHITECTURE', label: 'ARCHITECTURE', icon: <Workflow className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="w-full bg-[#05070a]/95 border-b border-[#1a1f2e] select-none sticky top-0 z-30 shadow-2xl backdrop-blur-md">
      {/* Top Brand & Telemetry Status Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & UAV Ident */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-[#00f0ff]/5 border border-[#00f0ff]/20 text-[#00f0ff]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.3em] text-[#00f0ff] uppercase font-bold">
                Aero Twin Sentinel
              </span>
              <span className="text-[#1a1f2e] font-mono text-xs">|</span>
              <span className="text-xs font-bold tracking-tight text-[#e0e6ed]">
                VYOM UAV <span className="font-light text-[#8b949e]">| PROPULSION DIGITAL TWIN</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#8b949e] mt-0.5">
              Supercharged 4-Cylinder Boxer Aero-Engine Prognostics // MALE UAV
            </p>
          </div>
        </div>

        {/* Center: System Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 bg-[#0d1117]/80 px-3.5 py-1.5 rounded-lg border border-[#1a1f2e] font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${digitalTwinSync ? 'bg-[#00f0ff] animate-pulse' : 'bg-[#ff9000] animate-ping'}`} />
            <span className="text-[#8b949e] text-[9px] uppercase">DIGITAL TWIN:</span>
            <span className={digitalTwinSync ? 'text-[#00f0ff] font-bold text-[10px]' : 'text-[#ff9000] font-bold text-[10px]'}>
              {digitalTwinSync ? 'SYNCED' : 'RESIDUAL DELTA'}
            </span>
          </div>

          <span className="text-[#1a1f2e]">|</span>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${telemetryLive ? 'bg-[#00ff41]' : 'bg-[#ff4b2b]'}`} />
            <span className="text-[#8b949e] text-[9px] uppercase">TELEMETRY:</span>
            <span className="text-[#00ff41] font-bold text-[10px]">LIVE</span>
          </div>

          <span className="text-[#1a1f2e]">|</span>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${aiModelActive ? 'bg-[#00f0ff]' : 'bg-[#8b949e]'}`} />
            <span className="text-[#8b949e] text-[9px] uppercase">AI MODEL:</span>
            <span className="text-[#00f0ff] font-bold text-[10px]">AI ACTIVE (IF+RF)</span>
          </div>

          <span className="text-[#1a1f2e]">|</span>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            <span className="text-[#8b949e] text-[9px] uppercase">STATUS:</span>
            <span className="text-[#e0e6ed] font-bold text-[10px]">{missionStatus}</span>
          </div>
        </div>

        {/* Right: Quick KPIs & Demo Scenario Trigger */}
        <div className="flex items-center gap-2.5 font-mono">
          {/* Warnings Counter */}
          <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#1a1f2e] text-xs">
            <AlertTriangle className={`w-3.5 h-3.5 ${warningCount > 0 ? 'text-[#ff9000] animate-bounce' : 'text-[#8b949e]'}`} />
            <span className="text-[#8b949e] text-[9px] uppercase">ALERTS:</span>
            <span className={`font-bold ${warningCount > 0 ? 'text-[#ff9000]' : 'text-white'}`}>
              {warningCount}
            </span>
          </div>

          {/* Engine Health Index Pill */}
          <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#1a1f2e] text-xs">
            <span className="text-[#8b949e] text-[9px] uppercase">EHI:</span>
            <span
              className={`font-bold ${
                engineHealthIndex >= 80
                  ? 'text-[#00ff41]'
                  : engineHealthIndex >= 60
                  ? 'text-[#ff9000]'
                  : 'text-[#ff4b2b]'
              }`}
            >
              {engineHealthIndex.toFixed(0)}%
            </span>
          </div>

          {/* RUL Pill */}
          <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#1a1f2e] text-xs">
            <span className="text-[#8b949e] text-[9px] uppercase">RUL:</span>
            <span className="text-[#00f0ff] font-bold">{estimatedRulHours}h</span>
          </div>

          {/* Mission Decision Status */}
          <div
            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getDecisionBadge(
              missionDecision
            )}`}
          >
            {missionDecision}
          </div>

          {/* Demo Scenario Button */}
          <button
            id="btn-run-demo-scenario"
            onClick={onStartDemo}
            disabled={isDemoRunning}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isDemoRunning
                ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/40 animate-pulse'
                : 'bg-[#00f0ff] hover:bg-[#00f0ff]/90 text-black font-bold border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
            }`}
            title="Execute automated 11-step end-to-end digital twin scenario"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDemoRunning ? `DEMO: STEP ${demoStep}/11` : 'DEMO SCENARIO'}</span>
          </button>

          {/* Reset button */}
          <button
            id="btn-reset-system"
            onClick={onResetAll}
            className="p-1 rounded bg-[#0d1117] hover:bg-white/10 text-[#8b949e] hover:text-white border border-[#1a1f2e]"
            title="Reset system to nominal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-t border-[#1a1f2e] bg-[#05070a]/90 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-mono font-medium tracking-wide flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5 font-bold'
                  : 'border-transparent text-[#8b949e] hover:text-[#e0e6ed] hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
