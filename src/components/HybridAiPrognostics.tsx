import React, { useState } from 'react';
import { AiDiagnosticReport } from '../types/engine';
import { Cpu, Brain, Network, Sliders, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface HybridAiPrognosticsProps {
  diagnosticReport: AiDiagnosticReport;
  onUpdateAiSettings?: (settings: any) => void;
}

export const HybridAiPrognostics: React.FC<HybridAiPrognosticsProps> = ({
  diagnosticReport,
  onUpdateAiSettings,
}) => {
  // Editable AI Hyperparameters in the prototype
  const [isolationForestContamination, setIsolationForestContamination] = useState<number>(0.05);
  const [isolationForestEstimators, setIsolationForestEstimators] = useState<number>(100);
  const [randomForestTrees, setRandomForestTrees] = useState<number>(150);
  const [decisionThreshold, setDecisionThreshold] = useState<number>(0.45);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'LOW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono shadow-xl flex flex-col gap-4">
      {/* Title & Concept Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 font-heading">
            HYBRID DIGITAL TWIN & AI DIAGNOSTIC REPORT
          </h2>
        </div>
        <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
          PHYSICS + AI HYBRID
        </span>
      </div>

      {/* Concept Formula Banner */}
      <div className="bg-slate-950/70 p-3 rounded border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-blue-950/80 border border-blue-600/40 text-blue-300">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">FIRST-PRINCIPLES</span>
            <span className="text-xs font-bold text-blue-300">PHYSICS MODEL</span>
          </div>
        </div>

        <span className="text-sm font-bold text-slate-500">+</span>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-cyan-950/80 border border-cyan-600/40 text-cyan-300">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">DATA-DRIVEN</span>
            <span className="text-xs font-bold text-cyan-300">AI / ML MODELS</span>
          </div>
        </div>

        <span className="text-sm font-bold text-slate-500">=</span>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">OUTCOME</span>
            <span className="text-xs font-bold text-emerald-300">PREDICTIVE HEALTH & RUL</span>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Report Card */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span className="text-xs font-bold text-slate-200">AI DIAGNOSTIC REPORT</span>
          <span className="text-[10px] text-amber-400/90 italic">
            * Simulated prototype confidence values
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">ANOMALY STATUS</span>
            <span className={`text-base font-extrabold mt-0.5 block ${
              diagnosticReport.anomalyDetected ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
            }`}>
              {diagnosticReport.anomalyDetected ? 'DETECTED' : 'NOMINAL (NONE)'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">CLASSIFIED FAULT</span>
            <span className="text-base font-extrabold text-cyan-300 mt-0.5 block">
              {diagnosticReport.faultName}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">SEVERITY LEVEL</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-block mt-1 ${getSeverityBadge(
                diagnosticReport.severity
              )}`}>
                {diagnosticReport.severity}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block">CONFIDENCE</span>
              <span className="text-base font-extrabold text-slate-100">
                {diagnosticReport.confidencePct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">ISOLATION FOREST SCORE</span>
            <span className="text-base font-extrabold text-cyan-400 mt-0.5 block">
              {diagnosticReport.isolationForestScore.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Detailed Cause, Effect & Recommendation */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">LIKELY CAUSE:</span>
            <p className="text-slate-200 mt-0.5 pl-2 border-l-2 border-amber-500/60">
              {diagnosticReport.likelyCause}
            </p>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">PHYSICAL EFFECT:</span>
            <p className="text-slate-200 mt-0.5 pl-2 border-l-2 border-cyan-500/60">
              {diagnosticReport.effect}
            </p>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">MAINTENANCE RECOMMENDATION:</span>
            <p className="text-emerald-300 mt-0.5 pl-2 border-l-2 border-emerald-500/60 font-semibold">
              {diagnosticReport.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Editable AI Model Hyperparameters */}
      <div className="bg-slate-950/60 p-3 rounded border border-slate-800 text-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            AI MODEL TUNING (ISOLATION FOREST & RANDOM FOREST)
          </span>
          <span className="text-[10px] text-slate-400">PROTOTYPE CONFIG</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Isolation Forest Contamination:</span>
              <span className="text-cyan-300 font-bold">{isolationForestContamination}</span>
            </div>
            <input
              id="slider-if-contamination"
              type="range"
              min="0.01"
              max="0.20"
              step="0.01"
              value={isolationForestContamination}
              onChange={(e) => setIsolationForestContamination(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Anomaly Decision Threshold:</span>
              <span className="text-cyan-300 font-bold">{decisionThreshold}</span>
            </div>
            <input
              id="slider-decision-threshold"
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={decisionThreshold}
              onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Random Forest Trees:</span>
              <span className="text-cyan-300 font-bold">{randomForestTrees}</span>
            </div>
            <input
              id="slider-rf-trees"
              type="range"
              min="50"
              max="300"
              step="10"
              value={randomForestTrees}
              onChange={(e) => setRandomForestTrees(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Isolation Forest Estimators:</span>
              <span className="text-cyan-300 font-bold">{isolationForestEstimators}</span>
            </div>
            <input
              id="slider-if-estimators"
              type="range"
              min="50"
              max="200"
              step="10"
              value={isolationForestEstimators}
              onChange={(e) => setIsolationForestEstimators(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
