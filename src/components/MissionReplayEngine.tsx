import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface MissionReplayEngineProps {
  onReplayUpdate: (frame: ReplayFrame) => void;
  isReplaying: boolean;
  setIsReplaying: (val: boolean) => void;
}

export interface ReplayFrame {
  timeMin: number;
  phase: string;
  rpm: number;
  cht: number;
  egt: number;
  oilPress: number;
  fuelFlow: number;
  vibration: number;
  ehi: number;
  rul: number;
  faultEvent: string | null;
  severity: 'NORMAL' | 'CAUTION' | 'CRITICAL';
}

// 60-Minute Recorded Flight Mission Time Series
export const REPLAY_DATA: ReplayFrame[] = [
  { timeMin: 0, phase: 'Engine Start & Taxi', rpm: 2200, cht: 95, egt: 520, oilPress: 4.8, fuelFlow: 14.2, vibration: 0.9, ehi: 94, rul: 1200, faultEvent: null, severity: 'NORMAL' },
  { timeMin: 5, phase: 'Take-off Run', rpm: 5750, cht: 165, egt: 780, oilPress: 5.2, fuelFlow: 39.5, vibration: 1.8, ehi: 94, rul: 1200, faultEvent: null, severity: 'NORMAL' },
  { timeMin: 12, phase: 'Climb through 8,000 ft', rpm: 5400, cht: 178, egt: 760, oilPress: 4.9, fuelFlow: 34.0, vibration: 1.5, ehi: 92, rul: 1180, faultEvent: null, severity: 'NORMAL' },
  { timeMin: 22, phase: 'Level Off at 14,000 ft', rpm: 4950, cht: 170, egt: 742, oilPress: 4.6, fuelFlow: 26.5, vibration: 1.4, ehi: 91, rul: 1150, faultEvent: null, severity: 'NORMAL' },
  { timeMin: 32, phase: 'Surveillance Cruise Loiter', rpm: 4900, cht: 171, egt: 745, oilPress: 4.6, fuelFlow: 26.2, vibration: 1.4, ehi: 90, rul: 1140, faultEvent: null, severity: 'NORMAL' },
  { timeMin: 38, phase: 'Fuel Delivery Pulse Drift', rpm: 4880, cht: 184, egt: 812, oilPress: 4.5, fuelFlow: 29.8, vibration: 1.7, ehi: 78, rul: 890, faultEvent: 'Fuel Injector #2 Orifice Partial Fouling', severity: 'CAUTION' },
  { timeMin: 44, phase: 'Thermal Residual Divergence', rpm: 4820, cht: 198, egt: 848, oilPress: 4.3, fuelFlow: 31.2, vibration: 2.1, ehi: 68, rul: 640, faultEvent: 'AI Anomaly Detected: Injector Abnormality Classified', severity: 'CAUTION' },
  { timeMin: 50, phase: 'Throttle Derating Protocol', rpm: 4200, cht: 178, egt: 720, oilPress: 4.5, fuelFlow: 21.0, vibration: 1.5, ehi: 72, rul: 710, faultEvent: 'Autopilot Applied 75% Power Restriction', severity: 'CAUTION' },
  { timeMin: 55, phase: 'Controlled Descent', rpm: 3400, cht: 145, egt: 620, oilPress: 4.6, fuelFlow: 15.2, vibration: 1.1, ehi: 72, rul: 710, faultEvent: 'Inbound RTB Trajectory', severity: 'NORMAL' },
  { timeMin: 60, phase: 'Safe Touchdown & Recovery', rpm: 2100, cht: 115, egt: 510, oilPress: 4.8, fuelFlow: 12.0, vibration: 0.8, ehi: 71, rul: 710, faultEvent: 'Post-flight Service Work Order Dispatched', severity: 'NORMAL' },
];

export const MissionReplayEngine: React.FC<MissionReplayEngineProps> = ({
  onReplayUpdate,
  isReplaying,
  setIsReplaying,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(3);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Playback timer
  useEffect(() => {
    let timer: any;
    if (isReplaying) {
      timer = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev >= REPLAY_DATA.length - 1) {
            setIsReplaying(false);
            return prev;
          }
          const next = prev + 1;
          onReplayUpdate(REPLAY_DATA[next]);
          return next;
        });
      }, 2000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isReplaying, playbackSpeed]);

  const currentFrame = REPLAY_DATA[currentIdx];

  const handleSeek = (index: number) => {
    setCurrentIdx(index);
    onReplayUpdate(REPLAY_DATA[index]);
  };

  const handleReset = () => {
    setIsReplaying(false);
    setCurrentIdx(0);
    onReplayUpdate(REPLAY_DATA[0]);
  };

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] backdrop-blur-md rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-[#e0e6ed] uppercase">
            MISSION REPLAY ENGINE & FLIGHT DATA RECORDER
          </h2>
        </div>
        <span className="text-[9px] text-[#00f0ff] bg-[#00f0ff]/5 px-2 py-0.5 rounded border border-[#00f0ff]/20 uppercase">
          SORTIE LOG: ISR_B4_ALPHA (60 MIN FLIGHT)
        </span>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded border border-[#1a1f2e]">
        {/* Play/Pause/Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-replay-play-pause"
            onClick={() => setIsReplaying(!isReplaying)}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
              isReplaying
                ? 'bg-[#ff9000] text-black hover:bg-[#ff9000]/90'
                : 'bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90'
            }`}
          >
            {isReplaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isReplaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            id="btn-replay-reset"
            onClick={handleReset}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8b949e] hover:text-white border border-white/10"
            title="Reset Timeline to T+00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed toggles */}
          <div className="flex items-center bg-white/5 rounded border border-white/10 p-0.5 ml-2 text-[10px]">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                id={`btn-speed-${spd}x`}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded font-bold ${
                  playbackSpeed === spd ? 'bg-[#00f0ff] text-black' : 'text-[#8b949e] hover:text-white'
                }`}
              >
                {spd}X
              </button>
            ))}
          </div>
        </div>

        {/* Current Time Display */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[9px] text-[#8b949e] uppercase block">TIME ELAPSED</span>
            <span className="text-white font-bold text-sm">
              T+{currentFrame.timeMin.toString().padStart(2, '0')}:00 min
            </span>
          </div>

          <div>
            <span className="text-[9px] text-[#8b949e] uppercase block">MISSION PHASE</span>
            <span className="text-[#00f0ff] font-bold text-sm">
              {currentFrame.phase}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] text-[#8b949e]">
          <span>START (0m)</span>
          <span>ANOMALY ONSET (38m)</span>
          <span>RECOVERY (60m)</span>
        </div>

        <input
          id="scrubber-mission-timeline"
          type="range"
          min="0"
          max={REPLAY_DATA.length - 1}
          value={currentIdx}
          onChange={(e) => handleSeek(parseInt(e.target.value))}
          className="w-full h-2 bg-[#1a1f2e] rounded-lg accent-[#00f0ff] cursor-pointer"
        />

        {/* Timeline Key Milestone Markers */}
        <div className="flex justify-between px-1">
          {REPLAY_DATA.map((frame, idx) => (
            <div
              key={idx}
              onClick={() => handleSeek(idx)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-2 h-2 rounded-full border transition-all ${
                  idx === currentIdx
                    ? 'bg-[#00f0ff] border-white scale-125'
                    : frame.faultEvent
                    ? 'bg-[#ff4b2b] border-[#ff4b2b]'
                    : 'bg-white/20 border-transparent group-hover:bg-white/50'
                }`}
              />
              <span className="text-[8px] text-[#8b949e] mt-1 hidden sm:block">
                {frame.timeMin}m
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Synchronized Telemetry Snapshot at this Time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-black/40 p-3 rounded border border-[#1a1f2e] text-xs">
        <div>
          <span className="text-[9px] text-[#8b949e] uppercase block">RPM</span>
          <span className="text-sm font-bold text-white">{currentFrame.rpm}</span>
        </div>
        <div>
          <span className="text-[9px] text-[#8b949e] uppercase block">CHT</span>
          <span className="text-sm font-bold text-[#00f0ff]">{currentFrame.cht}°C</span>
        </div>
        <div>
          <span className="text-[9px] text-[#8b949e] uppercase block">EGT</span>
          <span className={`text-sm font-bold ${currentFrame.egt > 800 ? 'text-[#ff4b2b]' : 'text-white'}`}>
            {currentFrame.egt}°C
          </span>
        </div>
        <div>
          <span className="text-[9px] text-[#8b949e] uppercase block">OIL PRESS</span>
          <span className="text-sm font-bold text-white">{currentFrame.oilPress} bar</span>
        </div>
        <div>
          <span className="text-[9px] text-[#8b949e] uppercase block">FUEL FLOW</span>
          <span className="text-sm font-bold text-[#00f0ff]">{currentFrame.fuelFlow} L/h</span>
        </div>
        <div>
          <span className="text-[9px] text-[#8b949e] uppercase block">EHI HEALTH</span>
          <span className={`text-sm font-bold ${
            currentFrame.ehi < 75 ? 'text-[#ff9000]' : 'text-[#00ff41]'
          }`}>
            {currentFrame.ehi}%
          </span>
        </div>
        <div>
          <span className="text-[9px] text-[#8b949e] uppercase block">RUL</span>
          <span className="text-sm font-bold text-[#00f0ff]">{currentFrame.rul} hrs</span>
        </div>
      </div>

      {/* Event at this timestamp */}
      {currentFrame.faultEvent && (
        <div className="p-2.5 rounded bg-[#ff4b2b]/10 border border-[#ff4b2b]/40 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#ff4b2b] shrink-0" />
          <span className="text-[#e0e6ed] text-[11px]">
            <strong>TELEMETRY EVENT:</strong> {currentFrame.faultEvent}
          </span>
        </div>
      )}
    </div>
  );
};
