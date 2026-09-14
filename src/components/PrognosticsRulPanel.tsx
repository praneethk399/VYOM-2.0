import React from 'react';
import { EngineComponent } from '../types/engine';
import { Gauge } from 'lucide-react';

interface PrognosticsRulPanelProps {
  engineHealthIndex: number;
  engineRulHours: number;
  selectedComponent: EngineComponent;
  degradationRate: number; // % / 100h
}

export const PrognosticsRulPanel: React.FC<PrognosticsRulPanelProps> = ({
  engineHealthIndex,
  engineRulHours,
  selectedComponent,
  degradationRate,
}) => {
  const timeSteps = [0, 50, 100, 150, 200, 250, 300, 350];
  const maintenanceThreshold = 40;
  const criticalLimit = 20;

  const trajectory = timeSteps.map((h) => {
    const drop = (h / 100) * degradationRate * (1 + (h / 400) * 0.4);
    const projectedHealth = Math.max(0, engineHealthIndex - drop);
    const conservativeHealth = Math.max(0, engineHealthIndex - drop * 1.3);
    const optimisticHealth = Math.max(0, engineHealthIndex - drop * 0.75);
    return {
      hours: h,
      projected: projectedHealth,
      conservative: conservativeHealth,
      optimistic: optimisticHealth,
    };
  });

  const conservativeRulHours = Math.round(engineRulHours * 0.75);
  const estimatedTtfHours = Math.round(engineRulHours * 1.25);

  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const scaleX = (h: number) => padLeft + (h / 350) * chartW;
  const scaleY = (health: number) => padTop + chartH - (health / 100) * chartH;

  const projectedPath = trajectory.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${scaleX(pt.hours)} ${scaleY(pt.projected)}`,
    ''
  );
  const conservativePath = trajectory.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${scaleX(pt.hours)} ${scaleY(pt.conservative)}`,
    ''
  );

  const envelopeArea =
    trajectory.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${scaleX(pt.hours)} ${scaleY(pt.optimistic)}`, '') +
    trajectory
      .slice()
      .reverse()
      .reduce((acc, pt) => `${acc} L ${scaleX(pt.hours)} ${scaleY(pt.conservative)}`, '') +
    ' Z';

  return (
    <div className="w-full bg-[#0d1117]/90 border border-[#1a1f2e] backdrop-blur-md rounded-lg p-4 font-mono shadow-2xl flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-xs font-bold tracking-wider text-[#e0e6ed] uppercase">
            PREDICTIVE HEALTH & REMAINDER USEFUL LIFE (RUL)
          </h2>
        </div>
        <span className="text-[9px] text-[#00f0ff] bg-[#00f0ff]/5 px-2 py-0.5 rounded border border-[#00f0ff]/20 uppercase">
          WEIBULL + BAYESIAN PROGNOSTIC MODEL
        </span>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">ENGINE RUL</span>
          <span className="text-xl font-bold text-[#00f0ff] mt-1 block">
            {engineRulHours} <span className="text-xs text-[#8b949e] font-normal">hrs</span>
          </span>
          <span className="text-[8px] text-[#8b949e] mt-0.5 block">PROJECTED TBO</span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block truncate">COMPONENT RUL</span>
          <span className="text-xl font-bold text-white mt-1 block truncate">
            {selectedComponent.rulHours} <span className="text-xs text-[#8b949e] font-normal">hrs</span>
          </span>
          <span className="text-[8px] text-[#8b949e] mt-0.5 block truncate">
            {selectedComponent.name}
          </span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">WEAR RATE</span>
          <span className="text-xl font-bold text-[#ff9000] mt-1 block">
            {selectedComponent.wearPercent}%
          </span>
          <span className="text-[8px] text-[#8b949e] mt-0.5 block">Cumulative Tribology</span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">DEGRADATION</span>
          <span className="text-xl font-bold text-[#ff4b2b] mt-1 block">
            +{degradationRate.toFixed(2)}%
          </span>
          <span className="text-[8px] text-[#8b949e] mt-0.5 block">Per 100 Flight Hours</span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">ESTIMATED TTF</span>
          <span className="text-xl font-bold text-[#ff4b2b] mt-1 block">
            {estimatedTtfHours} <span className="text-xs text-[#8b949e] font-normal">hrs</span>
          </span>
          <span className="text-[8px] text-[#8b949e] mt-0.5 block">Time to Failure</span>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-[#1a1f2e]">
          <span className="text-[9px] text-[#8b949e] uppercase block">CONFIDENCE (95% CI)</span>
          <span className="text-xl font-bold text-[#00ff41] mt-1 block">
            ±42 <span className="text-xs text-[#8b949e] font-normal">hrs</span>
          </span>
          <span className="text-[8px] text-[#8b949e] mt-0.5 block">Credible Bound</span>
        </div>
      </div>

      {/* Graph 1: FORWARD DEGRADATION TRAJECTORY */}
      <div className="bg-black/40 p-3 rounded-lg border border-[#1a1f2e] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#e0e6ed]">
              FORWARD DEGRADATION TRAJECTORY (350h HORIZON)
            </span>
            <span className="text-[9px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
              PHYSICS DRIFT MODEL
            </span>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#00f0ff] inline-block" />
              <span className="text-[#00f0ff]">PROJECTED RUL</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#ff9000] inline-block stroke-dasharray" />
              <span className="text-[#ff9000]">CONSERVATIVE RUL</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#ff4b2b] inline-block" />
              <span className="text-[#ff4b2b]">CRITICAL LIMIT</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 select-none font-mono text-[10px]"
          >
            {/* Grid horizontal lines */}
            {[20, 40, 60, 80, 100].map((val) => (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={scaleY(val)}
                  x2={svgWidth - padRight}
                  y2={scaleY(val)}
                  stroke="#1a1f2e"
                  strokeDasharray={val === 40 || val === 20 ? '4 4' : undefined}
                />
                <text
                  x={padLeft - 6}
                  y={scaleY(val) + 3}
                  textAnchor="end"
                  fill="#8b949e"
                >
                  {val}%
                </text>
              </g>
            ))}

            {/* Grid vertical lines & X labels */}
            {timeSteps.map((h) => (
              <g key={h}>
                <line
                  x1={scaleX(h)}
                  y1={padTop}
                  x2={scaleX(h)}
                  y2={svgHeight - padBottom}
                  stroke="#1a1f2e"
                />
                <text
                  x={scaleX(h)}
                  y={svgHeight - padBottom + 16}
                  textAnchor="middle"
                  fill="#8b949e"
                >
                  {h === 0 ? 'NOW' : `+${h}h`}
                </text>
              </g>
            ))}

            {/* Maintenance Threshold Line (40%) */}
            <line
              x1={padLeft}
              y1={scaleY(maintenanceThreshold)}
              x2={svgWidth - padRight}
              y2={scaleY(maintenanceThreshold)}
              stroke="#ff9000"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
            <text
              x={svgWidth - padRight - 6}
              y={scaleY(maintenanceThreshold) - 5}
              textAnchor="end"
              fill="#ff9000"
              fontWeight="bold"
            >
              MAINTENANCE THRESHOLD (40%)
            </text>

            {/* Critical Limit Line (20%) */}
            <line
              x1={padLeft}
              y1={scaleY(criticalLimit)}
              x2={svgWidth - padRight}
              y2={scaleY(criticalLimit)}
              stroke="#ff4b2b"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text
              x={svgWidth - padRight - 6}
              y={scaleY(criticalLimit) - 5}
              textAnchor="end"
              fill="#ff4b2b"
              fontWeight="bold"
            >
              CRITICAL LIMIT (20%)
            </text>

            {/* Confidence Bound Area */}
            <path d={envelopeArea} fill="rgba(0, 240, 255, 0.08)" />

            {/* Conservative Trajectory Line */}
            <path
              d={conservativePath}
              fill="none"
              stroke="#ff9000"
              strokeWidth="2"
              strokeDasharray="5 3"
            />

            {/* Projected RUL Line */}
            <path
              d={projectedPath}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2.5"
            />

            {/* Data point dots on projected line */}
            {trajectory.map((pt, i) => (
              <circle
                key={i}
                cx={scaleX(pt.hours)}
                cy={scaleY(pt.projected)}
                r="3.5"
                fill="#00f0ff"
                stroke="#05070a"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* RUL Prognostic Summary Breakdown Bar */}
      <div className="bg-black/30 p-3 rounded border border-[#1a1f2e] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-[9px] text-[#00f0ff] font-bold uppercase block">
            PROJECTED RUL HORIZON
          </span>
          <p className="text-[#8b949e] mt-1 text-[11px]">
            Reaches 40% maintenance limit at approximately <strong className="text-white">{engineRulHours} flight hours</strong> under current operating profile.
          </p>
        </div>

        <div>
          <span className="text-[9px] text-[#ff9000] font-bold uppercase block">
            CONSERVATIVE (WORST-CASE) RUL
          </span>
          <p className="text-[#8b949e] mt-1 text-[11px]">
            Under maximum thermal load and high boost condition, safe threshold reached in <strong className="text-white">{conservativeRulHours} hours</strong>.
          </p>
        </div>

        <div>
          <span className="text-[9px] text-[#ff4b2b] font-bold uppercase block">
            CRITICAL OVERHAUL LIMIT
          </span>
          <p className="text-[#8b949e] mt-1 text-[11px]">
            Risk of bearing hydrodynamic film collapse and valvetrain failure projected beyond <strong className="text-white">{estimatedTtfHours} hours</strong> without servicing.
          </p>
        </div>
      </div>
    </div>
  );
};
