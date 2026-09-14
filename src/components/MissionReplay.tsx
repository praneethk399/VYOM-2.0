import React, { useState, useEffect, useRef } from 'react';
import { RAW_MISSION_DATASET, TelemetryDatasetRecord } from '../data/telemetryDataset';
import { Play, Pause, RotateCcw, FastForward, AlertTriangle, Clock, Activity, CheckCircle2 } from 'lucide-react';

interface MissionReplayProps {
  onReplaySampleChange?: (record: TelemetryDatasetRecord) => void;
}

export const MissionReplay: React.FC<MissionReplayProps> = ({ onReplaySampleChange }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<number | null>(null);

  const currentRecord = RAW_MISSION_DATASET[currentIndex] || RAW_MISSION_DATASET[0];

  useEffect(() => {
    if (onReplaySampleChange) {
      onReplaySampleChange(currentRecord);
    }
  }, [currentIndex, onReplaySampleChange]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= RAW_MISSION_DATASET.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentIndex >= RAW_MISSION_DATASET.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            MISSION REPLAY ENGINE (SIM-MISSION-01)
          </h2>
        </div>
        <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
          UAV ISR FLIGHT TELEMETRY ARCHIVE
        </span>
      </div>

      {/* Scrubbing & Controls Bar */}
      <div className="bg-[#05070a]/80 p-3 rounded-lg border border-[#1a1f2e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              id="btn-replay-play-pause"
              onClick={handlePlayPause}
              className={`p-2 rounded flex items-center gap-1.5 text-xs font-bold transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-[#00f0ff]/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>

            <button
              id="btn-replay-reset"
              onClick={handleReset}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>

            <div className="flex items-center gap-1 ml-2">
              <span className="text-[10px] text-[#8b949e]">SPEED:</span>
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    playbackSpeed === speed
                      ? 'bg-[#00f0ff] text-black'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#8b949e] font-bold mr-2">
              TIME: <span className="text-white font-mono">{formatTime(currentRecord.sample_sec)}</span> /{' '}
              {formatTime(RAW_MISSION_DATASET[RAW_MISSION_DATASET.length - 1].sample_sec)}
            </span>
            <span className="text-[10px] text-slate-500">
              [SAMPLE {currentIndex + 1} OF {RAW_MISSION_DATASET.length}]
            </span>
          </div>
        </div>

        {/* Timeline Range Scrubber */}
        <div className="relative flex flex-col gap-1">
          <input
            id="timeline-scrubber"
            type="range"
            min="0"
            max={RAW_MISSION_DATASET.length - 1}
            value={currentIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentIndex(parseInt(e.target.value));
            }}
            className="w-full h-2 bg-[#1a1f2e] rounded accent-[#00f0ff] cursor-pointer"
          />

          {/* Key Event Markers */}
          <div className="flex justify-between text-[9px] text-[#8b949e] pt-1">
            <button
              onClick={() => setCurrentIndex(0)}
              className="hover:text-[#00f0ff] transition-colors"
            >
              00:00 Normal Start
            </button>
            <button
              onClick={() => setCurrentIndex(3)}
              className="text-amber-400 hover:underline font-bold"
            >
              00:03 Injector Anomaly
            </button>
            <button
              onClick={() => setCurrentIndex(15)}
              className="text-red-400 hover:underline font-bold"
            >
              00:15 Injector Failure
            </button>
            <button
              onClick={() => setCurrentIndex(25)}
              className="text-[#00ff41] hover:underline"
            >
              00:25 Recovery
            </button>
            <button
              onClick={() => setCurrentIndex(180)}
              className="text-amber-400 hover:underline font-bold"
            >
              03:00 Lube Anomaly
            </button>
            <button
              onClick={() => setCurrentIndex(195)}
              className="text-red-400 hover:underline font-bold"
            >
              03:15 Lube Seizure
            </button>
            <button
              onClick={() => setCurrentIndex(210)}
              className="text-[#00ff41] hover:underline"
            >
              03:30 Nominal Loiter
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Live Telemetry Readout Grid from Real Dataset */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">ENGINE RPM</span>
          <span className="text-base font-extrabold text-white mt-0.5 block">
            {currentRecord.rpm.toFixed(0)}
          </span>
          <span className="text-[8px] text-slate-500">Normal: 2800-3000</span>
        </div>

        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">CHT TEMP</span>
          <span className="text-base font-extrabold text-[#00f0ff] mt-0.5 block">
            {currentRecord.cht_c.toFixed(1)}°C
          </span>
          <span className="text-[8px] text-slate-500">Cyl Head</span>
        </div>

        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">EGT TEMP</span>
          <span className={`text-base font-extrabold mt-0.5 block ${
            currentRecord.egt_c > 700 ? 'text-[#ff4b2b]' : 'text-white'
          }`}>
            {currentRecord.egt_c.toFixed(1)}°C
          </span>
          <span className="text-[8px] text-slate-500">Exhaust Gas</span>
        </div>

        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">OIL PRESSURE</span>
          <span className={`text-base font-extrabold mt-0.5 block ${
            currentRecord.oil_pressure_bar < 3.5 ? 'text-[#ff4b2b]' : 'text-[#00ff41]'
          }`}>
            {currentRecord.oil_pressure_bar.toFixed(2)} bar
          </span>
          <span className="text-[8px] text-slate-500">Ref: 4.8 bar</span>
        </div>

        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">FUEL FLOW</span>
          <span className={`text-base font-extrabold mt-0.5 block ${
            currentRecord.fuel_flow_lph > 33 ? 'text-amber-400' : 'text-white'
          }`}>
            {currentRecord.fuel_flow_lph.toFixed(1)} l/h
          </span>
          <span className="text-[8px] text-slate-500">Injection Rate</span>
        </div>

        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">VIBRATION</span>
          <span className={`text-base font-extrabold mt-0.5 block ${
            currentRecord.vibration_mm_s > 3.0 ? 'text-[#ff4b2b]' : 'text-white'
          }`}>
            {currentRecord.vibration_mm_s.toFixed(2)} mm/s
          </span>
          <span className="text-[8px] text-slate-500">Accelerometer</span>
        </div>

        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">HEALTH (EHI)</span>
          <span className={`text-base font-extrabold mt-0.5 block ${
            currentRecord.engine_health_pct < 50
              ? 'text-[#ff4b2b] animate-pulse'
              : currentRecord.engine_health_pct < 80
              ? 'text-amber-400'
              : 'text-[#00ff41]'
          }`}>
            {currentRecord.engine_health_pct.toFixed(0)}%
          </span>
          <span className="text-[8px] text-slate-500">Health Index</span>
        </div>

        <div className="p-2 rounded bg-[#05070a]/90 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">RUL</span>
          <span className="text-base font-extrabold text-[#00f0ff] mt-0.5 block">
            {currentRecord.rul_hours.toFixed(0)} h
          </span>
          <span className="text-[8px] text-slate-500">Remaining</span>
        </div>
      </div>

      {/* Failure Stage & Maintenance Advisory Live Ribbon */}
      <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
        currentRecord.failure_stage === 'FAILURE'
          ? 'bg-[#ff4b2b]/15 border-[#ff4b2b]/50 text-[#ff4b2b] animate-pulse'
          : currentRecord.failure_stage === 'PRE_FAILURE'
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          : 'bg-[#00ff41]/10 border-[#00ff41]/30 text-[#00ff41]'
      }`}>
        <div className="flex items-center gap-2">
          {currentRecord.failure_stage === 'NORMAL' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="font-bold">
            STAGE: {currentRecord.failure_stage} | FAULT MODE: {currentRecord.failure_mode}
          </span>
        </div>
        <div className="text-right font-semibold">
          ADVISORY: <span className="underline">{currentRecord.maintenance_advisory}</span>
        </div>
      </div>
    </div>
  );
};
