import React, { useState } from 'react';
import { FADEC_50_STEP_DATASET, FadecTelemetryStep } from '../data/fadecDataset';
import { X, Download, Radio, CheckCircle, Search } from 'lucide-react';

interface CsvDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
}

export const CsvDatasetModal: React.FC<CsvDatasetModalProps> = ({
  isOpen,
  onClose,
  currentStep,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  // Filter dataset based on step or search
  const filtered = FADEC_50_STEP_DATASET.filter((row) => {
    if (!searchTerm) return true;
    return (
      row.step.toString().includes(searchTerm) ||
      row.phase.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportCsv = () => {
    const headers = [
      'Step',
      'TimeSec',
      'Phase',
      'AltitudeFt',
      'AmbTempC',
      'PropellerRpm',
      'EnginePowerHp',
      'ChtAvgC',
      'ChtCyl1',
      'ChtCyl2',
      'ChtCyl3',
      'ChtCyl4',
      'EgtC',
      'OilPressureBar',
      'OilTempC',
      'VibrationMmS',
      'FuelFlowLph',
      'BoostBar',
      'HealthIndexPct',
      'RulHours',
      'AnomalyScore',
    ].join(',');

    const rows = FADEC_50_STEP_DATASET.map((r) =>
      [
        r.step,
        r.timeSec,
        `"${r.phase}"`,
        r.altitudeFt,
        r.ambientTempC,
        r.propellerRpm,
        r.enginePowerHp,
        r.chtAvgC,
        r.chtCylinders[0],
        r.chtCylinders[1],
        r.chtCylinders[2],
        r.chtCylinders[3],
        r.egtC,
        r.oilPressureBar,
        r.oilTempC,
        r.vibrationMmS,
        r.fuelFlowLph,
        r.manifoldBoostBar,
        r.healthIndexPct,
        r.rulHours,
        r.anomalyScore,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VYOM_FADEC_50_Step_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#080d1a] border border-[#1e2d4d] rounded-xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0a1224] border-b border-[#1e2d4d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading tracking-wider flex items-center gap-2">
                <span>FADEC 50-STEP CSV TELEMETRY STREAM</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                  CURRENT: STEP {currentStep}/50
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Synchronized 100 Hz Avionics CAN Bus Serial Datalink Buffer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/50 text-[11px] font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-[#070b16] border-b border-[#1e2d4d] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by step or phase (e.g. Cruise, Climb)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/30 border border-white/10 rounded px-2.5 py-1 text-white text-xs w-64 focus:outline-none focus:border-[#00f0ff]"
            />
          </div>
          <div className="text-[10px] text-slate-400">
            Showing {filtered.length} of 50 packets
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-auto p-3">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-[#0e172a] text-[#8b949e] uppercase border-b border-white/10">
                <th className="p-2">Step</th>
                <th className="p-2">Phase</th>
                <th className="p-2">Altitude (ft)</th>
                <th className="p-2">RPM</th>
                <th className="p-2">Power (HP)</th>
                <th className="p-2">CHT Avg (°C)</th>
                <th className="p-2">Cyl 1/2/3/4</th>
                <th className="p-2">EGT (°C)</th>
                <th className="p-2">Oil (bar)</th>
                <th className="p-2">Vibe (mm/s)</th>
                <th className="p-2">Fuel (L/h)</th>
                <th className="p-2">Boost</th>
                <th className="p-2">EHI %</th>
                <th className="p-2">RUL (h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((row) => {
                const isCurrent = row.step === currentStep;
                return (
                  <tr
                    key={row.step}
                    className={`transition-colors font-mono ${
                      isCurrent
                        ? 'bg-[#00f0ff]/15 font-bold text-white border-l-2 border-[#00f0ff]'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <td className="p-2">
                      <span className={isCurrent ? 'text-[#00f0ff]' : 'text-slate-400'}>
                        #{row.step}
                      </span>
                    </td>
                    <td className="p-2 text-slate-200">{row.phase}</td>
                    <td className="p-2">{row.altitudeFt.toFixed(1)}</td>
                    <td className="p-2 text-[#00f0ff]">{row.propellerRpm.toFixed(1)}</td>
                    <td className="p-2">{row.enginePowerHp.toFixed(1)}</td>
                    <td className="p-2">{row.chtAvgC.toFixed(1)}</td>
                    <td className="p-2 text-[9px] text-slate-400">
                      {row.chtCylinders.map((c) => c.toFixed(0)).join(' / ')}
                    </td>
                    <td className="p-2 text-amber-300">{row.egtC.toFixed(1)}</td>
                    <td className="p-2 text-emerald-400">{row.oilPressureBar.toFixed(3)}</td>
                    <td className="p-2">
                      <span className={row.vibrationMmS > 3.0 ? 'text-[#ff4b2b] font-bold' : ''}>
                        {row.vibrationMmS.toFixed(3)}
                      </span>
                    </td>
                    <td className="p-2">{row.fuelFlowLph.toFixed(1)}</td>
                    <td className="p-2 text-sky-300">{row.manifoldBoostBar.toFixed(2)}</td>
                    <td className="p-2">
                      <span className={row.healthIndexPct < 70 ? 'text-amber-400' : 'text-emerald-400'}>
                        {row.healthIndexPct}%
                      </span>
                    </td>
                    <td className="p-2 text-white">{row.rulHours}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0a1224] border-t border-[#1e2d4d] flex items-center justify-between text-[11px] text-slate-400">
          <div>
            Format: High-precision IEEE-754 floating point telemetry stream
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-xs"
          >
            CLOSE STREAM
          </button>
        </div>
      </div>
    </div>
  );
};
