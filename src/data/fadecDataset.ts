/**
 * FADEC 50-Step Live Flight Telemetry Dataset & Engine Subsystems
 * Inspired by DRDO / VYOM UAV & Flygas Boxer Aero Engine
 */

export interface FadecTelemetryStep {
  step: number;
  timeSec: number;
  altitudeFt: number;
  ambientTempC: number;
  propellerRpm: number;
  enginePowerHp: number;
  enginePowerPct: number;
  chtAvgC: number;
  chtCylinders: [number, number, number, number]; // Cyl 1, 2, 3, 4
  egtC: number;
  oilPressureBar: number;
  oilTempC: number;
  vibrationMmS: number;
  fuelFlowLph: number;
  fuelPressureBar: number;
  manifoldBoostBar: number;
  intercoolerTempC: number;
  sparkAdvanceDeg: number;
  lambdaO2: number;
  healthIndexPct: number;
  rulHours: number;
  anomalyScore: number;
  phase: string;
}

// Generate realistic 50-step flight profile data (Takeoff -> Climb -> Hot Weather Cruise -> Thermal rise)
export const FADEC_50_STEP_DATASET: FadecTelemetryStep[] = Array.from({ length: 50 }, (_, i) => {
  const step = i + 1;
  const t = i / 49;

  // Altitude profile: climbing from 1200 ft to 14,200 ft cruise
  let altitude = 1200;
  let phase = 'Ground Run / Taxi';
  if (step < 6) {
    altitude = 1200 + step * 150;
    phase = 'Takeoff Roll';
  } else if (step < 18) {
    altitude = 2000 + (step - 6) * 750;
    phase = 'Climb (Max Rate)';
  } else if (step < 38) {
    altitude = 8900 + Math.sin(step * 0.4) * 140;
    phase = 'Hot Weather Cruise';
  } else {
    altitude = 11500 + Math.sin(step * 0.25) * 80;
    phase = 'High-Altitude ISR Patrol';
  }

  // Base RPM: 2800 to 3050 RPM at prop shaft
  const baseRpm = 2920 + Math.sin(step * 0.8) * 45 + (Math.random() - 0.5) * 12;
  const powerHp = 120 + Math.sin(step * 0.6) * 8;
  const powerPct = (powerHp / 180) * 100;

  // Cylinder temperatures (Cyl #1, #2, #3, #4)
  const baseCht = 114.0 + Math.sin(step * 0.5) * 4.5;
  const cht1 = 158.0 + (step > 25 ? (step - 25) * 0.6 : 0) + (Math.random() - 0.5) * 1.5;
  const cht2 = 160.0 + (step > 25 ? (step - 25) * 1.2 : 0) + (Math.random() - 0.5) * 1.5; // Cyl 2 hotter
  const cht3 = 157.0 + (Math.random() - 0.5) * 1.5;
  const cht4 = 159.0 + (Math.random() - 0.5) * 1.5;

  const egt = 620.0 + Math.sin(step * 0.7) * 25 + (step > 28 ? (step - 28) * 2.8 : 0);
  const oilPress = 4.42 + Math.sin(step * 0.3) * 0.12 - (step > 30 ? (step - 30) * 0.02 : 0);
  const vibration = 1.42 + (step > 32 ? (step - 32) * 0.18 : 0.05 * Math.sin(step));
  const fuelFlow = 31.8 + Math.sin(step * 0.5) * 1.8 + (step > 26 ? (step - 26) * 0.35 : 0);

  const anomaly = step < 24 ? 0.05 + step * 0.003 : Math.min(0.88, 0.12 + (step - 24) * 0.035);
  const health = step < 24 ? 96 - step * 0.1 : Math.max(58, 94 - (step - 24) * 1.6);
  const rul = Math.max(220, Math.round(1180 * (health / 100)));

  return {
    step,
    timeSec: step * 12,
    altitudeFt: Number(altitude.toFixed(1)),
    ambientTempC: Number((40.5 - (altitude / 1000) * 1.98).toFixed(1)),
    propellerRpm: Number(baseRpm.toFixed(1)),
    enginePowerHp: Number(powerHp.toFixed(1)),
    enginePowerPct: Number(powerPct.toFixed(1)),
    chtAvgC: Number(baseCht.toFixed(2)),
    chtCylinders: [Number(cht1.toFixed(1)), Number(cht2.toFixed(1)), Number(cht3.toFixed(1)), Number(cht4.toFixed(1))],
    egtC: Number(egt.toFixed(2)),
    oilPressureBar: Number(oilPress.toFixed(3)),
    oilTempC: Number((82.4 + (step > 25 ? (step - 25) * 0.8 : 0)).toFixed(1)),
    vibrationMmS: Number(vibration.toFixed(3)),
    fuelFlowLph: Number(fuelFlow.toFixed(2)),
    fuelPressureBar: Number((3.42 + (Math.random() - 0.5) * 0.04).toFixed(2)),
    manifoldBoostBar: Number((1.24 + Math.sin(step * 0.4) * 0.03).toFixed(2)),
    intercoolerTempC: Number((46.2 + Math.sin(step * 0.3) * 3.5).toFixed(1)),
    sparkAdvanceDeg: Number((24.2 + (Math.random() - 0.5) * 0.4).toFixed(1)),
    lambdaO2: Number((0.985 + (Math.random() - 0.5) * 0.015).toFixed(3)),
    healthIndexPct: Math.round(health),
    rulHours: rul,
    anomalyScore: Number(anomaly.toFixed(3)),
    phase,
  };
});

// 18 Engine Subsystems (matching screenshot nodes)
export interface EngineSubsystemNode {
  id: string;
  name: string;
  nodeCode: string;
  subsystem: string;
  status: 'NOMINAL' | 'VIBRATION' | 'CAUTION' | 'WARNING' | 'CRITICAL';
  healthPct: number;
  tempC: number;
  vibeG: number;
  description: string;
  cameraPreset: 'OVERVIEW' | 'FRONT' | 'CYLINDERS' | 'TURBO' | 'ECU';
}

export const ENGINE_18_SUBSYSTEMS: EngineSubsystemNode[] = [
  {
    id: 'propeller',
    name: 'Propeller & Blades',
    nodeCode: 'PROPELLER',
    subsystem: 'Thrust Generation',
    status: 'NOMINAL',
    healthPct: 94,
    tempC: 38,
    vibeG: 1.6,
    description: '3-blade carbon composite scimitar propeller with aerodynamically optimized 120° pitch spacing and high-visibility yellow tip warning bands.',
    cameraPreset: 'FRONT',
  },
  {
    id: 'spinner',
    name: 'Propeller Spinner Cone',
    nodeCode: 'SPINNER',
    subsystem: 'Aerodynamics',
    status: 'NOMINAL',
    healthPct: 98,
    tempC: 34,
    vibeG: 1.2,
    description: 'Aerodynamic machined aluminum nose cone spinner reducing front parasite drag.',
    cameraPreset: 'FRONT',
  },
  {
    id: 'crankcase',
    name: 'Engine Crankcase',
    nodeCode: 'CRANKCASE',
    subsystem: 'Core Structure',
    status: 'NOMINAL',
    healthPct: 92,
    tempC: 84,
    vibeG: 1.4,
    description: 'Split-case cast aluminum housing with longitudinal stiffening ribs and internal oil galleries.',
    cameraPreset: 'OVERVIEW',
  },
  {
    id: 'cylinder_1',
    name: 'Cylinder #1 (Right Front)',
    nodeCode: 'CYLINDER_HEAD_01',
    subsystem: 'Power Cell Bank A',
    status: 'NOMINAL',
    healthPct: 90,
    tempC: 158,
    vibeG: 1.8,
    description: 'Nikasil coated aluminum alloy cylinder barrel with high-efficiency cooling fins and dual spark plugs.',
    cameraPreset: 'CYLINDERS',
  },
  {
    id: 'cylinder_2',
    name: 'Cylinder #2 (Left Front)',
    nodeCode: 'CYLINDER_HEAD_02',
    subsystem: 'Power Cell Bank B',
    status: 'NOMINAL',
    healthPct: 88,
    tempC: 160,
    vibeG: 2.1,
    description: 'Opposed boxer cylinder with direct port fuel injection and integrated exhaust valve guide.',
    cameraPreset: 'CYLINDERS',
  },
  {
    id: 'cylinder_3',
    name: 'Cylinder #3 (Right Rear)',
    nodeCode: 'CYLINDER_HEAD_03',
    subsystem: 'Power Cell Bank A',
    status: 'NOMINAL',
    healthPct: 91,
    tempC: 157,
    vibeG: 1.7,
    description: 'Rear cylinder cooled via ram-air baffle ducting and liquid-cooled head passages.',
    cameraPreset: 'CYLINDERS',
  },
  {
    id: 'cylinder_4',
    name: 'Cylinder #4 (Left Rear)',
    nodeCode: 'CYLINDER_HEAD_04',
    subsystem: 'Power Cell Bank B',
    status: 'NOMINAL',
    healthPct: 89,
    tempC: 159,
    vibeG: 1.9,
    description: 'Staggered horizontal cylinder with high-strength forged connecting rod and floating wrist pin.',
    cameraPreset: 'CYLINDERS',
  },
  {
    id: 'intake_pipes',
    name: 'Curved Intake Manifolds',
    nodeCode: 'INTAKE_PIPES',
    subsystem: 'Induction Circuit',
    status: 'NOMINAL',
    healthPct: 96,
    tempC: 52,
    vibeG: 1.1,
    description: 'Dual black powder-coated curved intake runners distributing equal airflow from plenum to cylinder heads.',
    cameraPreset: 'TURBO',
  },
  {
    id: 'silicone_couplers',
    name: 'Blue Silicone Hose Couplers',
    nodeCode: 'SILICONE_COUPLERS',
    subsystem: 'Fluid Ducting',
    status: 'NOMINAL',
    healthPct: 95,
    tempC: 58,
    vibeG: 0.9,
    description: '4-ply reinforced high-temperature silicone couplers with stainless steel constant-torque hose clamps.',
    cameraPreset: 'TURBO',
  },
  {
    id: 'supercharger',
    name: 'Centrifugal Supercharger',
    nodeCode: 'SUPERCHARGER',
    subsystem: 'Forced Induction',
    status: 'NOMINAL',
    healthPct: 93,
    tempC: 98,
    vibeG: 1.5,
    description: 'Billet CNC compressor wheel providing up to 1.35 bar absolute boost pressure for high-altitude ceiling.',
    cameraPreset: 'TURBO',
  },
  {
    id: 'fuel_system',
    name: 'Fuel Rails & AN Fittings',
    nodeCode: 'FUEL_SYSTEM',
    subsystem: 'Fuel Injection',
    status: 'NOMINAL',
    healthPct: 92,
    tempC: 45,
    vibeG: 1.3,
    description: 'Dual high-pressure anodized fuel rails with -6AN aircraft fittings and sequential multi-hole injectors.',
    cameraPreset: 'OVERVIEW',
  },
  {
    id: 'ignition_system',
    name: 'Ignition Leads & Coils',
    nodeCode: 'IGNITION_LEADS',
    subsystem: 'Electrical Ignition',
    status: 'NOMINAL',
    healthPct: 95,
    tempC: 62,
    vibeG: 1.0,
    description: 'High-voltage silicone ignition cables with shielded suppressors and redundant dual electronic coils.',
    cameraPreset: 'OVERVIEW',
  },
  {
    id: 'front_pulley',
    name: 'Machined Front Pulley',
    nodeCode: 'FRONT_PULLEY',
    subsystem: 'Auxiliary Drive',
    status: 'NOMINAL',
    healthPct: 97,
    tempC: 54,
    vibeG: 1.2,
    description: 'Multi-ribbed serpentine aluminum drive pulley with central brass hub and high-torque perimeter fasteners.',
    cameraPreset: 'FRONT',
  },
  {
    id: 'oil_filter',
    name: 'Spin-on Oil Filter',
    nodeCode: 'OIL_FILTER',
    subsystem: 'Lubrication',
    status: 'NOMINAL',
    healthPct: 91,
    tempC: 78,
    vibeG: 1.1,
    description: 'Full-flow 15-micron synthetic micro-glass filter canister with internal pressure bypass valve.',
    cameraPreset: 'FRONT',
  },
  {
    id: 'oil_sump',
    name: 'Lower Engine Oil Pan',
    nodeCode: 'OIL_SUMP',
    subsystem: 'Lubrication',
    status: 'NOMINAL',
    healthPct: 96,
    tempC: 82,
    vibeG: 0.8,
    description: 'Cast sump with integrated horizontal cooling fins and scavenge pickup screen for semi-dry lubrication.',
    cameraPreset: 'OVERVIEW',
  },
  {
    id: 'exhaust_system',
    name: 'Inconel Exhaust Headers',
    nodeCode: 'EXHAUST_SYSTEM',
    subsystem: 'Exhaust Scavenge',
    status: 'NOMINAL',
    healthPct: 89,
    tempC: 630,
    vibeG: 2.3,
    description: '4-into-1 tuned equal-length Inconel 625 header tubes designed for minimum backpressure and high thermal endurance.',
    cameraPreset: 'OVERVIEW',
  },
  {
    id: 'ecu_avionics',
    name: 'ECU & Engine Harness',
    nodeCode: 'ECU_AVIONICS',
    subsystem: 'FADEC Electronics',
    status: 'NOMINAL',
    healthPct: 99,
    tempC: 42,
    vibeG: 0.5,
    description: 'Dual-channel FADEC engine management unit with redundant CAN-bus 2.0B datalink to UAV flight computer.',
    cameraPreset: 'ECU',
  },
  {
    id: 'sensor_array',
    name: 'Telemetry Sensor Array',
    nodeCode: 'SENSORS',
    subsystem: 'Health Monitoring',
    status: 'NOMINAL',
    healthPct: 97,
    tempC: 55,
    vibeG: 0.9,
    description: 'High-frequency vibration accelerometers, CHT thermocouples, oil pressure transducers, and boost map sensors.',
    cameraPreset: 'OVERVIEW',
  },
];

// 8 Failure Simulation Modes (matching screenshot)
export interface DatasetFaultMode {
  id: string;
  name: string;
  statusTag: 'TEST' | 'ACTIVE';
  severity: 'NOMINAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';
  affectedNode: string;
  description: string;
  telemetryDeltas: {
    rpmDelta: number;
    chtDelta: number;
    egtDelta: number;
    oilPressDelta: number;
    vibeDelta: number;
    fuelFlowDelta: number;
    boostDelta: number;
  };
  recommendation: string;
}

export const DATASET_FAULT_MODES: DatasetFaultMode[] = [
  {
    id: 'NORMAL_OPERATION',
    name: 'NORMAL OPERATION',
    statusTag: 'TEST',
    severity: 'NOMINAL',
    affectedNode: 'crankcase',
    description: 'All 4 opposing cylinders balanced. Lubrication and forced induction boost operating within design limits.',
    telemetryDeltas: { rpmDelta: 0, chtDelta: 0, egtDelta: 0, oilPressDelta: 0, vibeDelta: 0, fuelFlowDelta: 0, boostDelta: 0 },
    recommendation: 'Continue nominal mission profile. Routine 1500h TBO schedule.',
  },
  {
    id: 'OVERHEATING',
    name: 'OVERHEATING',
    statusTag: 'TEST',
    severity: 'WARNING',
    affectedNode: 'cylinder_2',
    description: 'Cylinder head temperature exceeds 185°C due to cooling airflow duct restriction or lean burn condition.',
    telemetryDeltas: { rpmDelta: -65, chtDelta: +48, egtDelta: +62, oilPressDelta: -0.35, vibeDelta: +0.8, fuelFlowDelta: -2.5, boostDelta: -0.05 },
    recommendation: 'Enrich mixture, increase airspeed to improve ram-air cooling. Limit continuous throttle to 70%.',
  },
  {
    id: 'LOW_OIL_PRESSURE',
    name: 'LOW OIL PRESSURE',
    statusTag: 'TEST',
    severity: 'CRITICAL',
    affectedNode: 'oil_filter',
    description: 'Oil gallery pressure dropping below 2.8 bar. Risk of hydrodynamic bearing boundary friction and seizure.',
    telemetryDeltas: { rpmDelta: -120, chtDelta: +18, egtDelta: +12, oilPressDelta: -1.95, vibeDelta: +1.6, fuelFlowDelta: 0, boostDelta: 0 },
    recommendation: 'Precautionary landing immediately. Boroscope inspect main crank journal bearings.',
  },
  {
    id: 'HIGH_VIBRATION',
    name: 'HIGH VIBRATION',
    statusTag: 'TEST',
    severity: 'CRITICAL',
    affectedNode: 'propeller',
    description: 'Harmonic vibration RMS exceeding 5.0 mm/s. Propeller blade dynamic imbalance or reduction gear wear.',
    telemetryDeltas: { rpmDelta: -85, chtDelta: +8, egtDelta: -15, oilPressDelta: -0.15, vibeDelta: +3.85, fuelFlowDelta: +1.2, boostDelta: -0.04 },
    recommendation: 'Reduce RPM to minimum level flight speed. Perform laser dynamic propeller balancing on ground.',
  },
  {
    id: 'FUEL_INJECTOR_FAULT',
    name: 'FUEL / INJECTOR FAULT',
    statusTag: 'TEST',
    severity: 'WARNING',
    affectedNode: 'fuel_system',
    description: 'Injector 2 nozzle partially clogged. Asymmetric EGT spread and localized fuel delivery deviation.',
    telemetryDeltas: { rpmDelta: -115, chtDelta: +28, egtDelta: +74, oilPressDelta: 0, vibeDelta: +1.4, fuelFlowDelta: +4.8, boostDelta: 0 },
    recommendation: 'Switch to redundant secondary fuel injection map. Inspect and ultrasonic clean injector nozzles.',
  },
  {
    id: 'CYLINDER_MISFIRE',
    name: 'CYLINDER MISFIRE',
    statusTag: 'TEST',
    severity: 'CRITICAL',
    affectedNode: 'cylinder_4',
    description: 'Intermittent spark ignition collapse on Cylinder 4. Severe engine roughness and power drop.',
    telemetryDeltas: { rpmDelta: -380, chtDelta: -35, egtDelta: -110, oilPressDelta: -0.2, vibeDelta: +3.2, fuelFlowDelta: -4.2, boostDelta: -0.12 },
    recommendation: 'Verify dual spark plug leads. Restrict flight to return-to-base (RTB) corridor.',
  },
  {
    id: 'SUPERCHARGER_BOOST_DROP',
    name: 'SUPERCHARGER BOOST DROP',
    statusTag: 'TEST',
    severity: 'WARNING',
    affectedNode: 'supercharger',
    description: 'Centrifugal compressor pressure drop from 1.25 bar to 0.94 bar due to silicone coupler leak or belt slip.',
    telemetryDeltas: { rpmDelta: -210, chtDelta: -12, egtDelta: +38, oilPressDelta: 0, vibeDelta: +0.6, fuelFlowDelta: -5.1, boostDelta: -0.32 },
    recommendation: 'Inspect silicone hose jubilee clamps. Verify supercharger step-up drive geartrain.',
  },
  {
    id: 'BEARING_WEAR_FRICTION',
    name: 'BEARING WEAR & FRICTION',
    statusTag: 'TEST',
    severity: 'WARNING',
    affectedNode: 'front_pulley',
    description: 'Elevated friction torque detected in propeller reduction gearbox and front nose bearing assembly.',
    telemetryDeltas: { rpmDelta: -90, chtDelta: +14, egtDelta: +10, oilPressDelta: -0.65, vibeDelta: +2.1, fuelFlowDelta: +2.4, boostDelta: 0 },
    recommendation: 'Sample engine oil for spectrographic metal wear analysis (Fe, Cu, Pb particulate count).',
  },
];

// Technical specifications for modal
export const VYOM_ENGINE_FULL_SPECS = {
  aircraftName: 'VYOM Tactical Medium Altitude Long Endurance (MALE) UAV',
  propulsionName: 'VYOM Aero Twin Sentinel 180 HP Supercharged Aero-Piston',
  designInspiration: 'Horizontally Opposed 4-Cylinder Supercharged Aviation Propulsion',
  engineType: '4-Stroke, Horizontally Opposed 4-Cylinder Boxer',
  boreMm: 84.0,
  strokeMm: 61.0,
  displacementCc: 1352,
  compressionRatio: '9.0:1 (Boost Optimized)',
  maxTakeoffPower: '180 HP (132 kW) @ 5800 RPM (Crankshaft)',
  propellerShaftSpeed: '2974 RPM (via 1.95:1 Helical Reduction Gearbox)',
  maxContinuousPower: '155 HP (114 kW) @ 5400 RPM',
  cruiseSpecificFuelConsumption: '228 g/kWh (AvGas 100LL or Mogas 98 RON)',
  forcedInduction: 'Centrifugal Compressor Supercharger with Air-to-Air Intercooler',
  maxBoostPressure: '1.35 bar (abs) at 18,000 ft operational altitude',
  fuelInjection: 'Multipoint Sequential Port Electronic Fuel Injection (EFI)',
  ignition: 'Dual-redundant Capacitor Discharge Ignition (CDI) with 2 plugs per cylinder',
  cooling: 'Liquid-cooled cylinder heads with ram-air cooled finned cylinder barrels',
  lubrication: 'Semi-dry sump with thermostatic oil cooler & spin-on filter',
  dryWeightKg: 68.5,
  installedWeightKg: 79.2,
  tboHours: 1500,
};
