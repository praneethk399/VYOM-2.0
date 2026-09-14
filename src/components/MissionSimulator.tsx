import React from 'react';
import { MissionProfile, MissionProfileId } from '../types/engine';
import { MISSION_PROFILES } from '../data/engineData';
import { PlaneTakeoff, TrendingUp, Compass, Mountain, BatteryCharging, Sun, Zap, PlaneLanding, Sliders, AlertCircle } from 'lucide-react';

interface MissionSimulatorProps {
  currentProfileId: MissionProfileId;
  onSelectProfile: (profileId: MissionProfileId) => void;
  altitudeFt: number;
  setAltitudeFt: (alt: number) => void;
  throttlePct: number;
  setThrottlePct: (thr: number) => void;
  ambientTempC: number;
  setAmbientTempC: (temp: number) => void;
  engineLoadPct: number;
  setEngineLoadPct: (load: number) => void;
  engineRpm: number;
}

export const MissionSimulator: React.FC<MissionSimulatorProps> = ({
  currentProfileId,
  onSelectProfile,
  altitudeFt,
  setAltitudeFt,
  throttlePct,
  setThrottlePct,
  ambientTempC,
  setAmbientTempC,
  engineLoadPct,
  setEngineLoadPct,
  engineRpm,
}) => {
  const activeProfile = MISSION_PROFILES.find((p) => p.id === currentProfileId) || MISSION_PROFILES[2];

  const getProfileIcon = (id: MissionProfileId) => {
    switch (id) {
      case 'TAKE_OFF':
        return <PlaneTakeoff className="w-4 h-4 text-cyan-400" />;
      case 'CLIMB':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'CRUISE':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'HIGH_ALTITUDE':
        return <Mountain className="w-4 h-4 text-indigo-400" />;
      case 'LONG_ENDURANCE':
        return <BatteryCharging className="w-4 h-4 text-teal-400" />;
      case 'HOT_WEATHER':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'RAPID_THROTTLE':
        return <Zap className="w-4 h-4 text-orange-400" />;
      case 'DESCENT':
        return <PlaneLanding className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            MISSION PROFILE SIMULATOR & FLIGHT REGIME CONTROLS
          </h2>
        </div>
        <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
          UAV FLIGHT DYNAMICS
        </span>
      </div>

      {/* Preset Mission Profiles Grid */}
      <div>
        <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider block mb-2">
          SELECT OPERATIONAL MISSION PROFILE:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MISSION_PROFILES.map((p) => {
            const isSelected = p.id === currentProfileId;
            return (
              <button
                key={p.id}
                id={`btn-profile-${p.id.toLowerCase()}`}
                onClick={() => {
                  onSelectProfile(p.id);
                  setAltitudeFt(p.altitudeFt);
                  setThrottlePct(p.throttlePct);
                  setAmbientTempC(p.ambientTempC);
                  setEngineLoadPct(p.loadPct);
                }}
                className={`p-2.5 rounded-lg text-left border transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-[#05070a]/70 hover:bg-[#1a1f2e]/50 border-[#1a1f2e] text-[#8b949e] hover:text-white'
                }`}
              >
                <div className="p-1.5 rounded bg-white/5">{getProfileIcon(p.id)}</div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold font-heading truncate">{p.name}</span>
                  <span className="text-[9px] text-[#8b949e] truncate">
                    {p.altitudeFt.toLocaleString()} ft | {p.throttlePct}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Profile Context Banner */}
      <div className="bg-[#05070a]/90 p-3 rounded-lg border border-[#1a1f2e] text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold">CURRENT REGIME:</span>
            <span className="text-xs font-bold text-[#00f0ff]">{activeProfile.name}</span>
            <span className="text-[10px] text-[#8b949e]">({activeProfile.description})</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#8b949e]">
          <div>
            <span>SUPERCHARGER BOOST: </span>
            <strong className="text-white">
              {(1.0 + (throttlePct / 100) * 0.45 * Math.exp(-altitudeFt / 30000)).toFixed(2)} bar
            </strong>
          </div>
          <div>
            <span>DENSITY RATIO: </span>
            <strong className="text-[#00f0ff]">
              {(Math.exp(-altitudeFt / 29000) * (288 / (ambientTempC + 273))).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Manual Flight Condition Sliders */}
      <div className="bg-[#05070a]/80 p-3.5 rounded-lg border border-[#1a1f2e] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-slate-200">
            MANUAL TELEMETRY STIMULATION CONTROLS
          </span>
          <span className="text-[10px] text-[#8b949e]">Real-time physics recalculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Altitude Slider */}
          <div>
            <div className="flex justify-between text-[#8b949e] mb-1">
              <span>FLIGHT ALTITUDE:</span>
              <span className="text-[#00f0ff] font-bold">{altitudeFt.toLocaleString()} ft</span>
            </div>
            <input
              id="slider-altitude"
              type="range"
              min="0"
              max="28000"
              step="500"
              value={altitudeFt}
              onChange={(e) => setAltitudeFt(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1a1f2e] rounded accent-[#00f0ff] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
              <span>Sea Level (0 ft)</span>
              <span>Ceiling (28,000 ft)</span>
            </div>
          </div>

          {/* Throttle Slider */}
          <div>
            <div className="flex justify-between text-[#8b949e] mb-1">
              <span>THROTTLE POSITION:</span>
              <span className="text-[#00f0ff] font-bold">{throttlePct}%</span>
            </div>
            <input
              id="slider-throttle"
              type="range"
              min="15"
              max="100"
              step="1"
              value={throttlePct}
              onChange={(e) => setThrottlePct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1a1f2e] rounded accent-[#00f0ff] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
              <span>Flight Idle (15%)</span>
              <span>Full Power (100%)</span>
            </div>
          </div>

          {/* Ambient Temperature Slider */}
          <div>
            <div className="flex justify-between text-[#8b949e] mb-1">
              <span>AMBIENT TEMPERATURE:</span>
              <span className="text-[#00f0ff] font-bold">{ambientTempC}°C</span>
            </div>
            <input
              id="slider-ambient-temp"
              type="range"
              min="-25"
              max="50"
              step="1"
              value={ambientTempC}
              onChange={(e) => setAmbientTempC(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1a1f2e] rounded accent-[#00f0ff] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
              <span>Sub-zero (-25°C)</span>
              <span>Hot Desert (+50°C)</span>
            </div>
          </div>

          {/* Engine Load Slider */}
          <div>
            <div className="flex justify-between text-[#8b949e] mb-1">
              <span>ENGINE DYNAMIC LOAD:</span>
              <span className="text-[#00f0ff] font-bold">{engineLoadPct}%</span>
            </div>
            <input
              id="slider-engine-load"
              type="range"
              min="20"
              max="100"
              step="1"
              value={engineLoadPct}
              onChange={(e) => setEngineLoadPct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1a1f2e] rounded accent-[#00f0ff] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
              <span>Light Loiter (20%)</span>
              <span>Maximum Continuous (100%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
