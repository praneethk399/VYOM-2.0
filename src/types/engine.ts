/**
 * Types for AERO TWIN SENTINEL - VYOM UAV Digital Twin
 */

export type EngineComponentId =
  | 'cylinder_assembly'
  | 'piston_assembly'
  | 'cylinder_head'
  | 'main_bearings'
  | 'fuel_injector'
  | 'supercharger_intake'
  | 'oil_system'
  | 'ignition_system'
  | 'exhaust_system'
  | 'sensors';

export interface EngineComponent {
  id: EngineComponentId;
  name: string;
  subsystem: string;
  health: number; // 0 - 100%
  rulHours: number;
  wearPercent: number;
  temperatureC: number;
  vibrationG: number;
  faultStatus: 'NOMINAL' | 'DEGRADED' | 'WARNING' | 'CRITICAL';
  degradationRate: number; // % per 100 hrs
  maintenanceStatus: 'GOOD' | 'INSPECTION_DUE' | 'SERVICING_REQUIRED' | 'REPLACEMENT_URGENT';
  description: string;
  inspectionIntervalHours: number;
  timeSinceLastInspectionHours: number;
  materialSpec: string;
  diagnosticNotes: string;
}

export interface TelemetryItem {
  id: string;
  name: string;
  shortName: string;
  value: number;
  twinExpected: number;
  unit: string;
  minNormal: number;
  maxNormal: number;
  minRange: number;
  maxRange: number;
  trend: 'up' | 'down' | 'stable';
  status: 'NORMAL' | 'CAUTION' | 'CRITICAL';
  category: 'THERMAL' | 'PRESSURE' | 'KINEMATICS' | 'ELECTRICAL' | 'COMBUSTION';
  history: number[];
}

export interface SensorHotspot {
  id: string;
  name: string;
  telemetryKey: string;
  unit: string;
  subsystem: string;
  position: [number, number, number];
  description: string;
  calibrationDate: string;
}

export type FaultId =
  | 'NORMAL'
  | 'MISFIRE'
  | 'INJECTOR_ABNORMALITY'
  | 'LUBRICATION_ISSUE'
  | 'SENSOR_DRIFT'
  | 'COMBUSTION_INSTABILITY'
  | 'OVERHEATING'
  | 'ABNORMAL_VIBRATION';

export interface FaultScenario {
  id: FaultId;
  label: string;
  description: string;
  affectedComponent: EngineComponentId;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  likelyCause: string;
  effect: string;
  recommendation: string;
  ehiImpact: number; // drop in EHI
  anomalyScore: number;
}

export type MissionProfileId =
  | 'TAKE_OFF'
  | 'CLIMB'
  | 'CRUISE'
  | 'HIGH_ALTITUDE'
  | 'LONG_ENDURANCE'
  | 'HOT_WEATHER'
  | 'RAPID_THROTTLE'
  | 'DESCENT';

export interface MissionProfile {
  id: MissionProfileId;
  name: string;
  altitudeFt: number;
  throttlePct: number;
  rpm: number;
  ambientTempC: number;
  loadPct: number;
  fuelFlowLph: number;
  description: string;
}

export interface AiDiagnosticReport {
  anomalyDetected: boolean;
  faultName: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'NONE';
  confidencePct: number;
  likelyCause: string;
  effect: string;
  recommendation: string;
  anomalyScore: number;
  isolationForestScore: number;
  randomForestConfidence: number;
}

export type MissionDecision = 'CONTINUE' | 'INSPECT' | 'RESTRICT' | 'ABORT';

export interface ValidationMetrics {
  datasetSize: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  detectionLatencyMs: number;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'ACTION';
}

export type NavigationTab =
  | '3D_DIGITAL_TWIN'
  | 'TELEMETRY'
  | 'DIAGNOSTICS'
  | 'PROGNOSTICS_RUL'
  | 'MISSION_SIMULATION'
  | 'MISSION_REPLAY'
  | 'VALIDATION'
  | 'SYSTEM_ARCHITECTURE';
