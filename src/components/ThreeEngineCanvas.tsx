import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SensorHotspot } from '../types/engine';
import { SENSOR_HOTSPOTS } from '../data/engineData';
import {
  RotateCw,
  Eye,
  Flame,
  Activity,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  X,
  Gauge,
  Thermometer,
} from 'lucide-react';

export interface ThreeEngineCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  selectedSensorId: string | null;
  onSelectSensor: (sensor: SensorHotspot) => void;
  renderMode: 'METALLIC' | 'THERMAL' | 'STRESS' | 'WIREFRAME';
  setRenderMode: (mode: 'METALLIC' | 'THERMAL' | 'STRESS' | 'WIREFRAME') => void;
  explodedProgress: number; // 0 to 1
  setExplodedProgress: (val: number) => void;
  engineRpm: number;
  engineHealth: number;
  highlightedComponentId?: string | null;
  isXRayMode?: boolean;
  setIsXRayMode?: (xray: boolean) => void;
  activeFaultId?: string;
  vibrationMmS?: number;
  liveChtC?: number;
  liveEgtC?: number;
  liveFuelFlowLph?: number;
  liveOilPressureBar?: number;
  cameraPreset?: 'OVERVIEW' | 'FRONT' | 'CYLINDERS' | 'TURBO' | 'ECU' | null;
  onClearCameraPreset?: () => void;
}

export const ThreeEngineCanvas: React.FC<ThreeEngineCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  onSelectSensor,
  renderMode,
  setRenderMode,
  explodedProgress,
  engineRpm,
  engineHealth: _engineHealth,
  isXRayMode = false,
  activeFaultId,
  vibrationMmS = 1.42,
  liveChtC = 114.07,
  liveEgtC = 628.68,
  liveFuelFlowLph = 32.22,
  liveOilPressureBar = 4.433,
  cameraPreset,
  onClearCameraPreset,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Moving parts refs
  const masterEngineGroupRef = useRef<THREE.Group | null>(null);
  const propellerGroupRef = useRef<THREE.Group | null>(null);
  const frontPulleyRef = useRef<THREE.Group | null>(null);
  const accessoryPulleyRef = useRef<THREE.Group | null>(null);
  const pistonsRef = useRef<{ mesh: THREE.Mesh; rod: THREE.Mesh; side: number; zPos: number; crankAngleOffset: number }[]>([]);

  // Exploded view groups
  const componentGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const initialPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const explodedOffsetsRef = useRef<Map<string, THREE.Vector3>>(new Map());

  // Material registry for dynamic modes
  const materialsMapRef = useRef<
    Map<
      THREE.Mesh,
      {
        metallic: THREE.Material;
        thermal: THREE.Material;
        stress: THREE.Material;
        wireframe: THREE.Material;
        xray: THREE.Material;
        baseEmissiveColor: number;
      }
    >
  >(new Map());

  // Camera preset transition
  const applyCameraPreset = useCallback((preset: 'OVERVIEW' | 'FRONT' | 'CYLINDERS' | 'TURBO' | 'ECU') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (preset) {
      case 'OVERVIEW':
        cam.position.set(3.8, 2.4, 4.2);
        ctrl.target.set(0, 0.05, 0.1);
        break;
      case 'FRONT':
        cam.position.set(0, 0.3, 5.0);
        ctrl.target.set(0, 0.12, 1.2);
        break;
      case 'CYLINDERS':
        cam.position.set(3.8, 0.8, 0.2);
        ctrl.target.set(0.85, 0.05, 0.0);
        break;
      case 'TURBO':
        cam.position.set(-2.2, 2.6, -3.2);
        ctrl.target.set(0, 0.52, -0.75);
        break;
      case 'ECU':
        cam.position.set(0, 4.2, 0.2);
        ctrl.target.set(0, 0.55, -0.2);
        break;
    }
    ctrl.update();
  }, []);

  useEffect(() => {
    if (cameraPreset) {
      applyCameraPreset(cameraPreset);
      onClearCameraPreset?.();
    }
  }, [cameraPreset, applyCameraPreset, onClearCameraPreset]);

  // Initialize Scene, Lighting, Camera, Materials, and CAD Geometry
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040813);
    scene.fog = new THREE.FogExp2(0x040813, 0.032);

    // Stable camera: near 0.1, far 100 to prevent clipping or disappearing geometry
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(3.8, 2.4, 4.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Smooth Orbit Controls with damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.8; // Prevents clipping through engine interior
    controls.maxDistance = 12.0; // Prevents extreme zoom out
    controls.target.set(0, 0.05, 0.1); // Maintains engine centered in viewport

    // Studio Environment Map for Authentic Non-Excessive PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext('2d');
    if (envCtx) {
      const grad = envCtx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#1c2638');
      grad.addColorStop(0.4, '#0f172a');
      grad.addColorStop(0.8, '#060a14');
      grad.addColorStop(1, '#03050a');
      envCtx.fillStyle = grad;
      envCtx.fillRect(0, 0, 512, 256);

      // Studio overhead diffused light boxes
      envCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      envCtx.fillRect(180, 20, 160, 40);
      envCtx.fillStyle = 'rgba(186, 230, 253, 0.45)';
      envCtx.fillRect(30, 60, 90, 45);
      envCtx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      envCtx.fillRect(390, 70, 80, 45);

      const envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
      scene.environment = envMap;
      envTexture.dispose();
      pmremGenerator.dispose();
    }

    // -----------------------------------------------------------
    // STABLE 3-POINT AEROSPACE VISUALIZATION LIGHTING SETUP
    // -----------------------------------------------------------
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.88);
    scene.add(ambientLight);

    // 1. KEY LIGHT (Upper Front Right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5.5, 7.5, 5.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -3.5;
    keyLight.shadow.camera.right = 3.5;
    keyLight.shadow.camera.top = 3.5;
    keyLight.shadow.camera.bottom = -3.5;
    keyLight.shadow.bias = -0.00015;
    scene.add(keyLight);

    // 2. FILL LIGHT (Left Front)
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.1);
    fillLight.position.set(-5.0, 2.2, 4.5);
    scene.add(fillLight);

    // 3. RIM LIGHT (Rear Left for Edge Definition)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-5.0, 4.0, -4.5);
    scene.add(rimLight);

    // Subtle Ground Reflection Fill
    const groundFillLight = new THREE.DirectionalLight(0x0f172a, 0.6);
    groundFillLight.position.set(0, -6, 2);
    scene.add(groundFillLight);

    // Aerospace Engineering Ground Grid
    const gridHelper = new THREE.GridHelper(14, 42, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -1.55;
    scene.add(gridHelper);

    // Ground Contact Shadow Disc (Soft ambient occlusion beneath engine)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const radGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 128);
      radGrad.addColorStop(0, 'rgba(0,0,0,0.72)');
      radGrad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = radGrad;
      sCtx.fillRect(0, 0, 256, 256);
      const sTexture = new THREE.CanvasTexture(shadowCanvas);
      const shadowPlaneGeo = new THREE.PlaneGeometry(5.4, 5.4);
      const shadowPlaneMat = new THREE.MeshBasicMaterial({
        map: sTexture,
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
      });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.53;
      scene.add(shadowPlane);
    }

    // Build the authentic CAD-Grade 4-Cylinder Boxer Engine Model
    buildAeroEngineModel(scene);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let crankAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // RPM Kinematic Rotation
      if (engineRpm > 0) {
        const radPerSec = (engineRpm / 60) * Math.PI * 2 * 0.04;
        crankAngle += radPerSec;

        // 1. Rotate 3-Blade Propeller & Machined Aluminium Spinner
        if (propellerGroupRef.current) {
          propellerGroupRef.current.rotation.z -= radPerSec;
        }

        // 2. Rotate Front Serpentine Pulleys in sync
        if (frontPulleyRef.current) {
          frontPulleyRef.current.rotation.z -= radPerSec;
        }
        if (accessoryPulleyRef.current) {
          accessoryPulleyRef.current.rotation.z -= radPerSec * 1.35;
        }

        // 3. Move Boxer Reciprocating Pistons & Connecting Rods
        pistonsRef.current.forEach((piston) => {
          const strokeAmp = 0.14;
          const angle = crankAngle + piston.crankAngleOffset;
          const disp = Math.sin(angle) * strokeAmp;
          piston.mesh.position.x = piston.side * (0.86 + disp);
          piston.rod.position.x = piston.side * (0.43 + disp * 0.5);
          piston.rod.rotation.z = Math.sin(angle) * 0.12 * piston.side;
        });
      }

      // 4. Engine Harmonic Vibration
      if (masterEngineGroupRef.current) {
        const isHighVibe = activeFaultId === 'HIGH_VIBRATION' || vibrationMmS > 3.0;
        const vibeMagnitude = isHighVibe ? 0.018 : 0.0025;
        masterEngineGroupRef.current.position.x = Math.sin(crankAngle * 3.5) * vibeMagnitude;
        masterEngineGroupRef.current.position.y = Math.cos(crankAngle * 4.2) * vibeMagnitude * 0.7;
        masterEngineGroupRef.current.position.z = Math.sin(crankAngle * 2.8) * vibeMagnitude * 0.5;
      }

      // Auto rotation if toggled
      if (controls && isAutoRotating) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.4;
      } else if (controls) {
        controls.autoRotate = false;
      }

      controls?.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  // Build the High-Fidelity Professional Aerospace Digital Twin Model
  const buildAeroEngineModel = (scene: THREE.Scene) => {
    const masterGroup = new THREE.Group();
    masterGroup.name = 'MASTER_ENGINE';
    scene.add(masterGroup);
    masterEngineGroupRef.current = masterGroup;

    // 18 Subsystem Groups matching FADEC dataset
    const nodeIds = [
      'propeller',
      'spinner',
      'crankcase',
      'cylinder_1',
      'cylinder_2',
      'cylinder_3',
      'cylinder_4',
      'intake_pipes',
      'silicone_couplers',
      'supercharger',
      'fuel_system',
      'ignition_system',
      'front_pulley',
      'oil_filter',
      'oil_sump',
      'exhaust_system',
      'ecu_avionics',
      'sensor_array',
    ];

    const groups = new Map<string, THREE.Group>();
    nodeIds.forEach((id) => {
      const g = new THREE.Group();
      g.name = id;
      masterGroup.add(g);
      groups.set(id, g);
      initialPositionsRef.current.set(id, new THREE.Vector3(0, 0, 0));
    });
    componentGroupsRef.current = groups;

    // Exploded Disassembly Vectors
    explodedOffsetsRef.current.set('propeller', new THREE.Vector3(0, 0, 1.8));
    explodedOffsetsRef.current.set('spinner', new THREE.Vector3(0, 0, 2.2));
    explodedOffsetsRef.current.set('front_pulley', new THREE.Vector3(0, 0, 1.15));
    explodedOffsetsRef.current.set('crankcase', new THREE.Vector3(0, 0, 0));
    explodedOffsetsRef.current.set('cylinder_1', new THREE.Vector3(1.3, 0, 0.35));
    explodedOffsetsRef.current.set('cylinder_2', new THREE.Vector3(-1.3, 0, 0.25));
    explodedOffsetsRef.current.set('cylinder_3', new THREE.Vector3(1.3, 0, -0.35));
    explodedOffsetsRef.current.set('cylinder_4', new THREE.Vector3(-1.3, 0, -0.45));
    explodedOffsetsRef.current.set('intake_pipes', new THREE.Vector3(0, 1.1, 0));
    explodedOffsetsRef.current.set('silicone_couplers', new THREE.Vector3(0, 1.2, 0));
    explodedOffsetsRef.current.set('supercharger', new THREE.Vector3(0, 1.25, -0.9));
    explodedOffsetsRef.current.set('fuel_system', new THREE.Vector3(0, 0.9, 0.2));
    explodedOffsetsRef.current.set('ignition_system', new THREE.Vector3(0, 1.0, 0.45));
    explodedOffsetsRef.current.set('oil_filter', new THREE.Vector3(0.6, -0.65, 0.9));
    explodedOffsetsRef.current.set('oil_sump', new THREE.Vector3(0, -1.25, 0));
    explodedOffsetsRef.current.set('exhaust_system', new THREE.Vector3(0, -1.1, -0.35));
    explodedOffsetsRef.current.set('ecu_avionics', new THREE.Vector3(0, 1.35, 0.7));
    explodedOffsetsRef.current.set('sensor_array', new THREE.Vector3(0, 0.4, 0.4));

    // -----------------------------------------------------------
    // CLEAN PBR MATERIALS (Engineered per Aerospace Specifications)
    // -----------------------------------------------------------
    // Engine casing: Brushed aluminium / machined metal
    const casingBrushedPbr = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.85,
      roughness: 0.32,
      envMapIntensity: 1.1,
    });
    const polishedMachinedPbr = new THREE.MeshStandardMaterial({
      color: 0xd8e0ea,
      metalness: 0.92,
      roughness: 0.22,
      envMapIntensity: 1.25,
    });
    // Cylinder fins: Dark metallic
    const darkMetallicFinsPbr = new THREE.MeshStandardMaterial({
      color: 0x222834,
      metalness: 0.82,
      roughness: 0.40,
      envMapIntensity: 0.95,
    });
    const darkAlloyPbr = new THREE.MeshStandardMaterial({
      color: 0x1e2634,
      metalness: 0.76,
      roughness: 0.42,
      envMapIntensity: 0.9,
    });
    // Spinner: Metallic aluminium (Machined, clean satin reflection)
    const machinedAlumSpinnerPbr = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.90,
      roughness: 0.24,
      envMapIntensity: 1.2,
    });
    // Propeller: Dark composite material
    const compositePropPbr = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.28,
      roughness: 0.46,
      envMapIntensity: 0.7,
    });
    const yellowSafetyTipPbr = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.15,
      roughness: 0.35,
    });
    // Hoses: Matte rubber
    const matteRubberPbr = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.05,
      roughness: 0.88,
      envMapIntensity: 0.2,
    });
    // Electrical wiring: Rubber/polymer
    const polymerWiringPbr = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      metalness: 0.08,
      roughness: 0.78,
      envMapIntensity: 0.25,
    });
    // Couplers: Blue anodized metal
    const blueAnodizedCouplerPbr = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.3,
    });
    const redAnodizedFittingPbr = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.3,
    });
    // Fasteners: Metallic steel
    const steelFastenerPbr = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.96,
      roughness: 0.15,
      envMapIntensity: 1.3,
    });
    const brassFittingPbr = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.88,
      roughness: 0.28,
      envMapIntensity: 1.2,
    });
    const inconelExhaustPbr = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.86,
      roughness: 0.34,
      envMapIntensity: 1.2,
    });
    const redSiliconeSparkWirePbr = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.12,
      roughness: 0.32,
    });

    // Helper to register mesh for smooth shader mode transitions
    const registerMesh = (mesh: THREE.Mesh, defaultMat: THREE.Material, thermalColor: number, stressColor: number) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const thermalMat = new THREE.MeshStandardMaterial({
        color: thermalColor,
        emissive: thermalColor,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.2,
      });
      const stressMat = new THREE.MeshStandardMaterial({
        color: stressColor,
        emissive: stressColor,
        emissiveIntensity: 0.25,
        roughness: 0.35,
      });
      const wireframeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        wireframe: true,
      });
      const xrayMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });

      materialsMapRef.current.set(mesh, {
        metallic: defaultMat,
        thermal: thermalMat,
        stress: stressMat,
        wireframe: wireframeMat,
        xray: xrayMat,
        baseEmissiveColor: 0x000000,
      });
      mesh.material = defaultMat;
    };

    // Fastener helper (Hex Allen Socket Head Bolts)
    const addBolt = (parent: THREE.Object3D, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, scale = 1) => {
      const boltGeo = new THREE.CylinderGeometry(0.022 * scale, 0.022 * scale, 0.028 * scale, 16);
      boltGeo.computeVertexNormals();
      const boltMesh = new THREE.Mesh(boltGeo, steelFastenerPbr);
      boltMesh.position.set(x, y, z);
      boltMesh.rotation.set(rx, ry, rz);
      parent.add(boltMesh);
      return boltMesh;
    };

    // -----------------------------------------------------------
    // 1. ENGINE CRANKCASE (Sculpted Split-Case Aerospace Casting)
    // -----------------------------------------------------------
    const crankcaseGroup = groups.get('crankcase')!;

    // Main central casting body (High-resolution chamfered profile)
    const crankcaseGeo = new THREE.BoxGeometry(1.24, 0.94, 1.48);
    crankcaseGeo.computeVertexNormals();
    const crankcaseMesh = new THREE.Mesh(crankcaseGeo, casingBrushedPbr);
    crankcaseMesh.position.set(0, 0, 0);
    crankcaseGroup.add(crankcaseMesh);
    registerMesh(crankcaseMesh, casingBrushedPbr, 0x3b82f6, 0x10b981);

    // Center split-line flange seam with high-tensile torque bolts
    const seamGeo = new THREE.BoxGeometry(1.28, 0.98, 0.04);
    seamGeo.computeVertexNormals();
    const seamMesh = new THREE.Mesh(seamGeo, darkAlloyPbr);
    seamMesh.position.set(0, 0, 0);
    crankcaseGroup.add(seamMesh);
    registerMesh(seamMesh, darkAlloyPbr, 0x2563eb, 0x10b981);

    // Front crankshaft bearing snout (Supports main propeller thrust bearing)
    const frontSnoutGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.34, 48);
    frontSnoutGeo.rotateX(Math.PI / 2);
    frontSnoutGeo.computeVertexNormals();
    const frontSnoutMesh = new THREE.Mesh(frontSnoutGeo, polishedMachinedPbr);
    frontSnoutMesh.position.set(0, 0.12, 0.9);
    crankcaseGroup.add(frontSnoutMesh);
    registerMesh(frontSnoutMesh, polishedMachinedPbr, 0x38bdf8, 0x10b981);

    // Front snout perimeter Allen bolts
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      addBolt(crankcaseGroup, Math.cos(angle) * 0.32, 0.12 + Math.sin(angle) * 0.32, 1.05, Math.PI / 2);
    }

    // Continuous Propeller Drive Shaft (Seamless physical connection from engine to propeller hub)
    const mainShaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.58, 36);
    mainShaftGeo.rotateX(Math.PI / 2);
    mainShaftGeo.computeVertexNormals();
    const mainShaftMesh = new THREE.Mesh(mainShaftGeo, steelFastenerPbr);
    mainShaftMesh.position.set(0, 0.12, 1.28);
    crankcaseGroup.add(mainShaftMesh);
    registerMesh(mainShaftMesh, steelFastenerPbr, 0x38bdf8, 0x10b981);

    // Reduction Gearbox Extension Housing
    const rGearGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.22, 48);
    rGearGeo.rotateX(Math.PI / 2);
    rGearGeo.computeVertexNormals();
    const rGearMesh = new THREE.Mesh(rGearGeo, casingBrushedPbr);
    rGearMesh.position.set(0, 0.12, 1.18);
    crankcaseGroup.add(rGearMesh);
    registerMesh(rGearMesh, casingBrushedPbr, 0x38bdf8, 0x10b981);

    // Longitudinal structural reinforcing webs
    for (let z = -0.55; z <= 0.55; z += 0.36) {
      const ribGeo = new THREE.BoxGeometry(1.29, 0.99, 0.04);
      ribGeo.computeVertexNormals();
      const ribMesh = new THREE.Mesh(ribGeo, darkAlloyPbr);
      ribMesh.position.set(0, 0, z);
      crankcaseGroup.add(ribMesh);
      registerMesh(ribMesh, darkAlloyPbr, 0x1d4ed8, 0x10b981);
    }

    // Heavy-duty lateral engine mount lugs (Rubber isolation bushings)
    [
      { x: -0.68, y: -0.22, z: 0.45 },
      { x: 0.68, y: -0.22, z: 0.45 },
      { x: -0.68, y: -0.22, z: -0.45 },
      { x: 0.68, y: -0.22, z: -0.45 },
    ].forEach((mountPos) => {
      const mountLugGeo = new THREE.BoxGeometry(0.18, 0.14, 0.22);
      mountLugGeo.computeVertexNormals();
      const mountLugMesh = new THREE.Mesh(mountLugGeo, polishedMachinedPbr);
      mountLugMesh.position.set(mountPos.x, mountPos.y, mountPos.z);
      crankcaseGroup.add(mountLugMesh);

      const bushingGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.16, 24);
      bushingGeo.computeVertexNormals();
      const bushingMesh = new THREE.Mesh(bushingGeo, matteRubberPbr);
      bushingMesh.position.set(mountPos.x, mountPos.y, mountPos.z);
      crankcaseGroup.add(bushingMesh);
    });

    // -----------------------------------------------------------
    // 2. 4 BOXER CYLINDERS & FINNED HEADS
    // -----------------------------------------------------------
    const cylinderDefs = [
      { id: 'cylinder_1', side: 1, z: 0.36, name: 'Cylinder #1 (Right Front)', crankAngleOffset: 0 },
      { id: 'cylinder_2', side: -1, z: 0.22, name: 'Cylinder #2 (Left Front)', crankAngleOffset: Math.PI },
      { id: 'cylinder_3', side: 1, z: -0.32, name: 'Cylinder #3 (Right Rear)', crankAngleOffset: Math.PI },
      { id: 'cylinder_4', side: -1, z: -0.46, name: 'Cylinder #4 (Left Rear)', crankAngleOffset: 0 },
    ];

    cylinderDefs.forEach((cyl) => {
      const cylGroup = groups.get(cyl.id)!;

      // Bolted Circular Mounting Base Flange (Seamless junction to crankcase)
      const baseFlangeGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 48);
      baseFlangeGeo.rotateZ(Math.PI / 2);
      baseFlangeGeo.computeVertexNormals();
      const baseFlangeMesh = new THREE.Mesh(baseFlangeGeo, polishedMachinedPbr);
      baseFlangeMesh.position.set(cyl.side * 0.62, 0, cyl.z);
      cylGroup.add(baseFlangeMesh);

      // Base flange perimeter mounting studs
      for (let s = 0; s < 6; s++) {
        const sAngle = (s / 6) * Math.PI * 2;
        addBolt(
          cylGroup,
          cyl.side * 0.65,
          Math.cos(sAngle) * 0.34,
          cyl.z + Math.sin(sAngle) * 0.34,
          0,
          0,
          (Math.PI / 2) * cyl.side,
          0.7
        );
      }

      // Precision cylinder barrel (64 radial segments for ultra-smooth cylindrical profile)
      const barrelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.72, 64);
      barrelGeo.rotateZ(Math.PI / 2);
      barrelGeo.computeVertexNormals();
      const barrelMesh = new THREE.Mesh(barrelGeo, casingBrushedPbr);
      barrelMesh.position.set(cyl.side * 0.86, 0, cyl.z);
      cylGroup.add(barrelMesh);
      registerMesh(barrelMesh, casingBrushedPbr, 0x06b6d4, 0x34d399);

      // Precision aerodynamic cooling fins in dark metallic material
      for (let fin = -0.26; fin <= 0.26; fin += 0.048) {
        const isMajorFin = Math.round(fin * 100) % 2 === 0;
        const finRadius = isMajorFin ? 0.44 : 0.41;
        const finGeo = new THREE.CylinderGeometry(finRadius, finRadius, 0.015, 64);
        finGeo.rotateZ(Math.PI / 2);
        finGeo.computeVertexNormals();
        const finMesh = new THREE.Mesh(finGeo, darkMetallicFinsPbr);
        finMesh.position.set(cyl.side * (0.86 + fin), 0, cyl.z);
        cylGroup.add(finMesh);
        registerMesh(finMesh, darkMetallicFinsPbr, 0x0284c7, 0x10b981);
      }

      // Cylinder Head with valve chambers
      const headGeo = new THREE.BoxGeometry(0.42, 0.72, 0.62);
      headGeo.computeVertexNormals();
      const headMesh = new THREE.Mesh(headGeo, casingBrushedPbr);
      headMesh.position.set(cyl.side * 1.36, 0, cyl.z);
      cylGroup.add(headMesh);
      registerMesh(headMesh, casingBrushedPbr, 0xf59e0b, 0xf97316);

      // CNC-Machined Valve Cover with dual cam bulges
      const coverGeo = new THREE.BoxGeometry(0.14, 0.58, 0.54);
      coverGeo.computeVertexNormals();
      const coverMesh = new THREE.Mesh(coverGeo, polishedMachinedPbr);
      coverMesh.position.set(cyl.side * 1.58, 0, cyl.z);
      cylGroup.add(coverMesh);
      registerMesh(coverMesh, polishedMachinedPbr, 0xf59e0b, 0xf97316);

      // Dual cam bulges on valve cover
      [-0.14, 0.14].forEach((zOffset) => {
        const bulgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.56, 32);
        bulgeGeo.computeVertexNormals();
        const bulgeMesh = new THREE.Mesh(bulgeGeo, polishedMachinedPbr);
        bulgeMesh.position.set(cyl.side * 1.64, 0, cyl.z + zOffset);
        cylGroup.add(bulgeMesh);
      });

      // Valve cover perimeter fasteners (8 socket head bolts)
      [
        { dy: 0.25, dz: 0.23 },
        { dy: 0.25, dz: -0.23 },
        { dy: -0.25, dz: 0.23 },
        { dy: -0.25, dz: -0.23 },
        { dy: 0.25, dz: 0 },
        { dy: -0.25, dz: 0 },
        { dy: 0, dz: 0.23 },
        { dy: 0, dz: -0.23 },
      ].forEach((boltCoord) => {
        addBolt(cylGroup, cyl.side * 1.66, boltCoord.dy, cyl.z + boltCoord.dz, 0, 0, (Math.PI / 2) * cyl.side, 0.75);
      });

      // Reciprocating Boxer Piston & Connecting Rod
      const pistonGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.24, 48);
      pistonGeo.rotateZ(Math.PI / 2);
      pistonGeo.computeVertexNormals();
      const pistonMesh = new THREE.Mesh(pistonGeo, polishedMachinedPbr);
      pistonMesh.position.set(cyl.side * 0.86, 0, cyl.z);
      cylGroup.add(pistonMesh);
      registerMesh(pistonMesh, polishedMachinedPbr, 0xf97316, 0xef4444);

      // Connecting Rod
      const rodGeo = new THREE.BoxGeometry(0.46, 0.08, 0.06);
      rodGeo.computeVertexNormals();
      const rodMesh = new THREE.Mesh(rodGeo, polishedMachinedPbr);
      rodMesh.position.set(cyl.side * 0.43, 0, cyl.z);
      cylGroup.add(rodMesh);
      registerMesh(rodMesh, polishedMachinedPbr, 0x06b6d4, 0x10b981);

      pistonsRef.current.push({
        mesh: pistonMesh,
        rod: rodMesh,
        side: cyl.side,
        zPos: cyl.z,
        crankAngleOffset: cyl.crankAngleOffset,
      });
    });

    // -----------------------------------------------------------
    // 3. PROPELLER WITH EXACTLY 3 BLADES (120° Spacing) & MACHINED SPINNER
    // -----------------------------------------------------------
    const propGroup = groups.get('propeller')!;
    const spinnerGroup = groups.get('spinner')!;

    // Complete Rotating Propeller Shaft Assembly
    const propShaftAssembly = new THREE.Group();
    propShaftAssembly.position.set(0, 0.12, 1.48);
    propellerGroupRef.current = propShaftAssembly;
    propGroup.add(propShaftAssembly);

    // Central Billet Machined Propeller Hub Clamp
    const hubClampGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.16, 48);
    hubClampGeo.rotateX(Math.PI / 2);
    hubClampGeo.computeVertexNormals();
    const hubClampMesh = new THREE.Mesh(hubClampGeo, polishedMachinedPbr);
    propShaftAssembly.add(hubClampMesh);
    registerMesh(hubClampMesh, polishedMachinedPbr, 0x38bdf8, 0x10b981);

    // Propeller Flange Drive Retaining Bolts (6 Steel Bolts)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      addBolt(propShaftAssembly, Math.cos(angle) * 0.24, Math.sin(angle) * 0.24, 0.08, Math.PI / 2);
    }

    // EXACTLY 3 PROPELLER BLADES:
    // Config:
    //             BLADE (Straight UP: 90°)
    //               |
    //               |
    // BLADE (210°) —— HUB —— BLADE (330°)
    const bladeAngles = [
      Math.PI / 2,                  // 90°  (Pointing straight UP)
      Math.PI / 2 + (2 * Math.PI) / 3, // 210° (Pointing bottom-left)
      Math.PI / 2 + (4 * Math.PI) / 3, // 330° (Pointing bottom-right)
    ];

    bladeAngles.forEach((angle) => {
      const bladeHolder = new THREE.Group();
      bladeHolder.rotation.z = angle;
      propShaftAssembly.add(bladeHolder);

      // Cylindrical Root Shank / Cuff Collar (Smooth junction emerging from hub)
      const shankGeo = new THREE.CylinderGeometry(0.065, 0.058, 0.26, 32);
      shankGeo.computeVertexNormals();
      const shankMesh = new THREE.Mesh(shankGeo, polishedMachinedPbr);
      shankMesh.position.set(0, 0.24, 0);
      bladeHolder.add(shankMesh);

      // Aerodynamic Airfoil Blade (Realistic scimitar curve, tapered thickness, pitch twist)
      const bladeLength = 1.35;
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-0.065, 0);
      bladeShape.bezierCurveTo(-0.095, 0.35, -0.115, 0.85, -0.045, bladeLength);
      bladeShape.lineTo(0.045, bladeLength);
      bladeShape.bezierCurveTo(0.095, 0.85, 0.085, 0.35, 0.065, 0);
      bladeShape.closePath();

      const extrudeSettings = {
        steps: 2,
        depth: 0.024,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.015,
        bevelSegments: 6,
      };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      bladeGeo.center();
      bladeGeo.computeVertexNormals();

      const bladeMesh = new THREE.Mesh(bladeGeo, compositePropPbr);
      bladeMesh.position.set(0, 0.84, 0);
      bladeMesh.rotation.y = 0.22; // Aerodynamic angle of attack / pitch twist
      bladeHolder.add(bladeMesh);
      registerMesh(bladeMesh, compositePropPbr, 0x38bdf8, 0x10b981);

      // High-Visibility Aviation Yellow Safety Warning Tip Band
      const tipGeo = new THREE.BoxGeometry(0.14, 0.2, 0.038);
      tipGeo.computeVertexNormals();
      const tipMesh = new THREE.Mesh(tipGeo, yellowSafetyTipPbr);
      tipMesh.position.set(0, 0.84 + bladeLength * 0.44, 0);
      tipMesh.rotation.y = 0.22;
      bladeHolder.add(tipMesh);
      registerMesh(tipMesh, yellowSafetyTipPbr, 0xeab308, 0x10b981);
    });

    // Aerodynamic Parabolic Nose Cone Spinner in Machined Metallic Aluminium
    const spinnerPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const radius = 0.36 * (1 - Math.pow(t, 1.4));
      const z = t * 0.90;
      spinnerPoints.push(new THREE.Vector2(radius, z));
    }
    const spinnerGeo = new THREE.LatheGeometry(spinnerPoints, 64);
    spinnerGeo.rotateX(Math.PI / 2);
    spinnerGeo.computeVertexNormals();
    const spinnerMesh = new THREE.Mesh(spinnerGeo, machinedAlumSpinnerPbr);
    spinnerMesh.position.set(0, 0, 0.09);
    propShaftAssembly.add(spinnerMesh);
    registerMesh(spinnerMesh, machinedAlumSpinnerPbr, 0xd1d5db, 0x10b981);

    // Spinner Backplate with perimeter locking screws
    const backplateGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.03, 64);
    backplateGeo.rotateX(Math.PI / 2);
    backplateGeo.computeVertexNormals();
    const backplateMesh = new THREE.Mesh(backplateGeo, polishedMachinedPbr);
    backplateMesh.position.set(0, 0, 0.075);
    spinnerGroup.add(backplateMesh);
    registerMesh(backplateMesh, polishedMachinedPbr, 0xd1d5db, 0x10b981);

    // -----------------------------------------------------------
    // 4. MACHINED FRONT SERPENTINE PULLEY & BELT DRIVE
    // -----------------------------------------------------------
    const pulleyGroup = groups.get('front_pulley')!;
    const frontPulleyAssembly = new THREE.Group();
    frontPulleyAssembly.position.set(0, 0.12, 1.08);
    frontPulleyRef.current = frontPulleyAssembly;
    pulleyGroup.add(frontPulleyAssembly);

    // Main multi-groove serpentine belt pulley
    const pulleyDiscGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.14, 64);
    pulleyDiscGeo.rotateX(Math.PI / 2);
    pulleyDiscGeo.computeVertexNormals();
    const pulleyDiscMesh = new THREE.Mesh(pulleyDiscGeo, polishedMachinedPbr);
    frontPulleyAssembly.add(pulleyDiscMesh);
    registerMesh(pulleyDiscMesh, polishedMachinedPbr, 0x38bdf8, 0x10b981);

    // Machined pulley V-grooves
    [-0.03, 0.03].forEach((vOffset) => {
      const grooveGeo = new THREE.TorusGeometry(0.482, 0.012, 12, 64);
      grooveGeo.computeVertexNormals();
      const grooveMesh = new THREE.Mesh(grooveGeo, darkAlloyPbr);
      grooveMesh.position.set(0, 0, vOffset);
      frontPulleyAssembly.add(grooveMesh);
    });

    // Center Hub with central pilot recess
    const brassHubGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.2, 48);
    brassHubGeo.rotateX(Math.PI / 2);
    brassHubGeo.computeVertexNormals();
    const brassHubMesh = new THREE.Mesh(brassHubGeo, polishedMachinedPbr);
    brassHubMesh.position.set(0, 0, 0.08);
    frontPulleyAssembly.add(brassHubMesh);
    registerMesh(brassHubMesh, polishedMachinedPbr, 0xd97706, 0x10b981);

    // 6 Perimeter Allen bolt studs on pulley flange
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      addBolt(frontPulleyAssembly, Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, 0.08, Math.PI / 2);
    }

    // Lower accessory alternator pulley
    const accessoryAssembly = new THREE.Group();
    accessoryAssembly.position.set(0.38, -0.32, 1.06);
    accessoryPulleyRef.current = accessoryAssembly;
    pulleyGroup.add(accessoryAssembly);

    const altPulleyGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 48);
    altPulleyGeo.rotateX(Math.PI / 2);
    altPulleyGeo.computeVertexNormals();
    const altPulleyMesh = new THREE.Mesh(altPulleyGeo, polishedMachinedPbr);
    accessoryAssembly.add(altPulleyMesh);

    // Serpentine ribbed drive belt wrapping between pulleys
    const beltCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.58, 1.07),
      new THREE.Vector3(-0.46, 0.12, 1.07),
      new THREE.Vector3(-0.25, -0.22, 1.07),
      new THREE.Vector3(0.38, -0.52, 1.07),
      new THREE.Vector3(0.58, -0.28, 1.07),
      new THREE.Vector3(0.44, 0.18, 1.07),
    ], true);
    const beltGeo = new THREE.TubeGeometry(beltCurve, 48, 0.024, 16, true);
    beltGeo.computeVertexNormals();
    const beltMesh = new THREE.Mesh(beltGeo, matteRubberPbr);
    pulleyGroup.add(beltMesh);

    // -----------------------------------------------------------
    // 5. INTAKE MANIFOLD, PLENUM & BLUE ANODIZED COUPLERS
    // -----------------------------------------------------------
    const intakeGroup = groups.get('intake_pipes')!;
    const couplerGroup = groups.get('silicone_couplers')!;

    // Top Intake Plenum Chamber Box with filleted edges
    const plenumGeo = new THREE.BoxGeometry(0.74, 0.28, 0.92);
    plenumGeo.computeVertexNormals();
    const plenumMesh = new THREE.Mesh(plenumGeo, darkAlloyPbr);
    plenumMesh.position.set(0, 0.9, -0.15);
    intakeGroup.add(plenumMesh);
    registerMesh(plenumMesh, darkAlloyPbr, 0x06b6d4, 0x10b981);

    // Front CNC Throttle Body with intake air temp sensor and throttle spindle
    const throttleGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.32, 48);
    throttleGeo.rotateX(Math.PI / 2);
    throttleGeo.computeVertexNormals();
    const throttleMesh = new THREE.Mesh(throttleGeo, polishedMachinedPbr);
    throttleMesh.position.set(0, 0.9, 0.42);
    intakeGroup.add(throttleMesh);
    registerMesh(throttleMesh, polishedMachinedPbr, 0x06b6d4, 0x10b981);

    // Throttle actuator linkage flange
    const linkageGeo = new THREE.BoxGeometry(0.12, 0.18, 0.12);
    linkageGeo.computeVertexNormals();
    const linkageMesh = new THREE.Mesh(linkageGeo, blueAnodizedCouplerPbr);
    linkageMesh.position.set(0.26, 0.9, 0.42);
    intakeGroup.add(linkageMesh);

    // Two Smooth Curved Intake Runners (Left & Right arches down to heads)
    [-1, 1].forEach((side) => {
      const runnerCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.22, 0.92, -0.15),
        new THREE.Vector3(side * 0.68, 1.02, -0.05),
        new THREE.Vector3(side * 1.02, 0.72, 0.0),
        new THREE.Vector3(side * 1.18, 0.34, 0.0),
      ]);
      const runnerGeo = new THREE.TubeGeometry(runnerCurve, 48, 0.092, 32, false);
      runnerGeo.computeVertexNormals();
      const runnerMesh = new THREE.Mesh(runnerGeo, darkAlloyPbr);
      intakeGroup.add(runnerMesh);
      registerMesh(runnerMesh, darkAlloyPbr, 0x06b6d4, 0x10b981);

      // Blue Silicone Hose Couplers with Dual Stainless Jubilee Clamps
      [
        { pos: new THREE.Vector3(side * 0.34, 0.96, -0.12), rotZ: side * 0.35 },
        { pos: new THREE.Vector3(side * 1.14, 0.42, 0.0), rotZ: side * 0.45 },
      ].forEach((couplerItem) => {
        const couplerGeo = new THREE.CylinderGeometry(0.116, 0.116, 0.15, 36);
        couplerGeo.rotateZ(couplerItem.rotZ);
        couplerGeo.computeVertexNormals();
        const couplerMesh = new THREE.Mesh(couplerGeo, blueAnodizedCouplerPbr);
        couplerMesh.position.copy(couplerItem.pos);
        couplerGroup.add(couplerMesh);
        registerMesh(couplerMesh, blueAnodizedCouplerPbr, 0x0284c7, 0x10b981);

        // Stainless steel jubilee hose clamps
        [-0.045, 0.045].forEach((offsetY) => {
          const clampGeo = new THREE.TorusGeometry(0.122, 0.012, 12, 36);
          clampGeo.rotateX(Math.PI / 2);
          clampGeo.computeVertexNormals();
          const clampMesh = new THREE.Mesh(clampGeo, steelFastenerPbr);
          clampMesh.position.set(couplerItem.pos.x, couplerItem.pos.y + offsetY, couplerItem.pos.z);
          couplerGroup.add(clampMesh);
        });
      });
    });

    // -----------------------------------------------------------
    // 6. IGNITION SYSTEM & HIGH-TENSION SPARK PLUG LEADS
    // -----------------------------------------------------------
    const ignGroup = groups.get('ignition_system')!;

    // Dual Electronic Ignition Coil Modules
    [-0.28, 0.28].forEach((xPos) => {
      const coilGeo = new THREE.BoxGeometry(0.24, 0.2, 0.34);
      coilGeo.computeVertexNormals();
      const coilMesh = new THREE.Mesh(coilGeo, darkAlloyPbr);
      coilMesh.position.set(xPos, 0.65, 0.26);
      ignGroup.add(coilMesh);
      registerMesh(coilMesh, darkAlloyPbr, 0x2563eb, 0x10b981);
    });

    // Red High-Tension Spark Plug Leads routing cleanly to heads
    cylinderDefs.forEach((cyl) => {
      const wireCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(cyl.side * 0.26, 0.68, 0.26),
        new THREE.Vector3(cyl.side * 0.78, 0.58, cyl.z * 0.6),
        new THREE.Vector3(cyl.side * 1.38, 0.28, cyl.z),
      ]);
      const wireGeo = new THREE.TubeGeometry(wireCurve, 32, 0.024, 16, false);
      wireGeo.computeVertexNormals();
      const wireMesh = new THREE.Mesh(wireGeo, redSiliconeSparkWirePbr);
      ignGroup.add(wireMesh);

      // 90° Spark Plug Boot on head
      const bootGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 24);
      bootGeo.rotateZ(cyl.side * (Math.PI / 3));
      bootGeo.computeVertexNormals();
      const bootMesh = new THREE.Mesh(bootGeo, matteRubberPbr);
      bootMesh.position.set(cyl.side * 1.4, 0.26, cyl.z);
      ignGroup.add(bootMesh);

      // Spark plug brass terminal nut
      const terminalGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 16);
      terminalGeo.computeVertexNormals();
      const terminalMesh = new THREE.Mesh(terminalGeo, brassFittingPbr);
      terminalMesh.position.set(cyl.side * 1.44, 0.28, cyl.z);
      ignGroup.add(terminalMesh);
    });

    // -----------------------------------------------------------
    // 7. FUEL RAILS & -6AN AVIATION FITTINGS
    // -----------------------------------------------------------
    const fuelGroup = groups.get('fuel_system')!;
    [-0.94, 0.94].forEach((xPos) => {
      // Extruded aluminum fuel distribution rail
      const railGeo = new THREE.CylinderGeometry(0.038, 0.038, 1.12, 32);
      railGeo.rotateX(Math.PI / 2);
      railGeo.computeVertexNormals();
      const railMesh = new THREE.Mesh(railGeo, polishedMachinedPbr);
      railMesh.position.set(xPos, 0.48, 0.0);
      fuelGroup.add(railMesh);
      registerMesh(railMesh, polishedMachinedPbr, 0x38bdf8, 0x10b981);

      // Electronic fuel injectors seated into heads
      cylinderDefs.filter(c => (c.side > 0 ? xPos > 0 : xPos < 0)).forEach((cyl) => {
        const injectorGeo = new THREE.CylinderGeometry(0.032, 0.024, 0.16, 24);
        injectorGeo.computeVertexNormals();
        const injectorMesh = new THREE.Mesh(injectorGeo, darkAlloyPbr);
        injectorMesh.position.set(xPos, 0.4, cyl.z);
        fuelGroup.add(injectorMesh);

        // Injector electrical harness clip
        const clipGeo = new THREE.BoxGeometry(0.04, 0.04, 0.05);
        clipGeo.computeVertexNormals();
        const clipMesh = new THREE.Mesh(clipGeo, redAnodizedFittingPbr);
        clipMesh.position.set(xPos + (xPos > 0 ? 0.04 : -0.04), 0.44, cyl.z);
        fuelGroup.add(clipMesh);
      });

      // Anodized Blue & Red -6AN Hex Fittings on rail ends
      [0.58, -0.58].forEach((zPos, fIdx) => {
        const anFittingGeo = new THREE.CylinderGeometry(0.054, 0.054, 0.14, 6);
        anFittingGeo.rotateX(Math.PI / 2);
        anFittingGeo.computeVertexNormals();
        const anFittingMesh = new THREE.Mesh(anFittingGeo, fIdx === 0 ? blueAnodizedCouplerPbr : redAnodizedFittingPbr);
        anFittingMesh.position.set(xPos, 0.48, zPos);
        fuelGroup.add(anFittingMesh);

        // Stainless braided feed line
        const lineCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(xPos, 0.48, zPos),
          new THREE.Vector3(xPos * 0.7, 0.35, zPos * 1.2),
          new THREE.Vector3(xPos * 0.4, 0.2, zPos * 1.1),
        ]);
        const lineGeo = new THREE.TubeGeometry(lineCurve, 20, 0.024, 16, false);
        lineGeo.computeVertexNormals();
        const lineMesh = new THREE.Mesh(lineGeo, steelFastenerPbr);
        fuelGroup.add(lineMesh);
      });
    });

    // -----------------------------------------------------------
    // 8. OIL FILTER & LOWER FINNED OIL SUMP
    // -----------------------------------------------------------
    const filterGroup = groups.get('oil_filter')!;

    // Spin-on black oil filter canister with knurled ring
    const filterGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.42, 48);
    filterGeo.computeVertexNormals();
    const filterMesh = new THREE.Mesh(filterGeo, darkAlloyPbr);
    filterMesh.position.set(0.48, -0.48, 0.68);
    filterGroup.add(filterMesh);
    registerMesh(filterMesh, darkAlloyPbr, 0xf59e0b, 0x10b981);

    // Filter knurled grip ring
    const gripGeo = new THREE.CylinderGeometry(0.196, 0.196, 0.06, 48);
    gripGeo.computeVertexNormals();
    const gripMesh = new THREE.Mesh(gripGeo, polishedMachinedPbr);
    gripMesh.position.set(0.48, -0.38, 0.68);
    filterGroup.add(gripMesh);

    // Sandwich adapter plate with sensor ports
    const sandwichGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.08, 48);
    sandwichGeo.computeVertexNormals();
    const sandwichMesh = new THREE.Mesh(sandwichGeo, blueAnodizedCouplerPbr);
    sandwichMesh.position.set(0.48, -0.25, 0.68);
    filterGroup.add(sandwichMesh);

    // Finned Oil Sump Pan at bottom
    const sumpGroup = groups.get('oil_sump')!;
    const sumpGeo = new THREE.BoxGeometry(1.02, 0.4, 1.28);
    sumpGeo.computeVertexNormals();
    const sumpMesh = new THREE.Mesh(sumpGeo, casingBrushedPbr);
    sumpMesh.position.set(0, -0.68, 0);
    sumpGroup.add(sumpMesh);
    registerMesh(sumpMesh, casingBrushedPbr, 0xf59e0b, 0x10b981);

    // Deep cooling fins on oil pan bottom
    for (let z = -0.52; z <= 0.52; z += 0.16) {
      const finGeo = new THREE.BoxGeometry(1.06, 0.08, 0.035);
      finGeo.computeVertexNormals();
      const finMesh = new THREE.Mesh(finGeo, darkMetallicFinsPbr);
      finMesh.position.set(0, -0.88, z);
      sumpGroup.add(finMesh);
    }

    // Brass magnetic drain plug
    const drainPlugGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6);
    drainPlugGeo.computeVertexNormals();
    const drainPlugMesh = new THREE.Mesh(drainPlugGeo, brassFittingPbr);
    drainPlugMesh.position.set(0.35, -0.92, -0.35);
    sumpGroup.add(drainPlugMesh);

    // -----------------------------------------------------------
    // 9. SUPERCHARGER (Centrifugal Forced Induction Compressor)
    // -----------------------------------------------------------
    const scGroup = groups.get('supercharger')!;

    // Centrifugal compressor snail housing / volute
    const scScrollGeo = new THREE.TorusGeometry(0.45, 0.2, 32, 64, Math.PI * 1.85);
    scScrollGeo.rotateY(Math.PI / 2);
    scScrollGeo.computeVertexNormals();
    const scScrollMesh = new THREE.Mesh(scScrollGeo, polishedMachinedPbr);
    scScrollMesh.position.set(0, 0.54, -0.86);
    scGroup.add(scScrollMesh);
    registerMesh(scScrollMesh, polishedMachinedPbr, 0x06b6d4, 0x10b981);

    // Compressor Inlet Bellmouth with protective wire mesh
    const bellGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.22, 48);
    bellGeo.rotateX(Math.PI / 2);
    bellGeo.computeVertexNormals();
    const bellMesh = new THREE.Mesh(bellGeo, casingBrushedPbr);
    bellMesh.position.set(0, 0.54, -1.18);
    scGroup.add(bellMesh);

    // Boost discharge tube connecting to top intake plenum
    const boostPipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, 0.74, -0.86),
      new THREE.Vector3(0.18, 0.90, -0.65),
      new THREE.Vector3(0.0, 0.90, -0.42),
    ]);
    const boostPipeGeo = new THREE.TubeGeometry(boostPipeCurve, 24, 0.08, 24, false);
    boostPipeGeo.computeVertexNormals();
    const boostPipeMesh = new THREE.Mesh(boostPipeGeo, casingBrushedPbr);
    scGroup.add(boostPipeMesh);

    // -----------------------------------------------------------
    // 10. INCONEL EXHAUST HEADERS & 4-INTO-1 COLLECTOR
    // -----------------------------------------------------------
    const exGroup = groups.get('exhaust_system')!;

    cylinderDefs.forEach((cyl) => {
      const exCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(cyl.side * 1.22, -0.22, cyl.z),
        new THREE.Vector3(cyl.side * 0.85, -0.55, cyl.z * 0.8),
        new THREE.Vector3(cyl.side * 0.42, -0.75, -0.45),
        new THREE.Vector3(0, -0.85, -0.75),
      ]);
      const exGeo = new THREE.TubeGeometry(exCurve, 36, 0.075, 24, false);
      exGeo.computeVertexNormals();
      const exMesh = new THREE.Mesh(exGeo, inconelExhaustPbr);
      exGroup.add(exMesh);
      registerMesh(exMesh, inconelExhaustPbr, 0xef4444, 0xf97316);

      // Exhaust port flange collar
      const collarGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24);
      collarGeo.rotateZ(cyl.side * (Math.PI / 2));
      collarGeo.computeVertexNormals();
      const collarMesh = new THREE.Mesh(collarGeo, polishedMachinedPbr);
      collarMesh.position.set(cyl.side * 1.28, -0.22, cyl.z);
      exGroup.add(collarMesh);
    });

    // Merged 4-into-1 Exhaust Collector Cone & Tailpipe
    const collectorGeo = new THREE.ConeGeometry(0.24, 0.55, 36);
    collectorGeo.rotateX(Math.PI / 2);
    collectorGeo.computeVertexNormals();
    const collectorMesh = new THREE.Mesh(collectorGeo, inconelExhaustPbr);
    collectorMesh.position.set(0, -0.85, -0.85);
    exGroup.add(collectorMesh);
    registerMesh(collectorMesh, inconelExhaustPbr, 0xef4444, 0xf97316);

    const tailpipeGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.45, 36);
    tailpipeGeo.rotateX(Math.PI / 2);
    tailpipeGeo.computeVertexNormals();
    const tailpipeMesh = new THREE.Mesh(tailpipeGeo, darkAlloyPbr);
    tailpipeMesh.position.set(0, -0.85, -1.25);
    exGroup.add(tailpipeMesh);

    // -----------------------------------------------------------
    // 11. ECU & AVIONICS HOUSING
    // -----------------------------------------------------------
    const ecuGroup = groups.get('ecu_avionics')!;
    const ecuGeo = new THREE.BoxGeometry(0.38, 0.16, 0.48);
    ecuGeo.computeVertexNormals();
    const ecuMesh = new THREE.Mesh(ecuGeo, darkAlloyPbr);
    ecuMesh.position.set(0, 0.58, -0.38);
    ecuGroup.add(ecuMesh);
    registerMesh(ecuMesh, darkAlloyPbr, 0x2563eb, 0x10b981);

    // Mil-Spec circular locking wire harness connectors
    [-0.1, 0.1].forEach((xPos) => {
      const connGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.08, 24);
      connGeo.rotateX(Math.PI / 2);
      connGeo.computeVertexNormals();
      const connMesh = new THREE.Mesh(connGeo, blueAnodizedCouplerPbr);
      connMesh.position.set(xPos, 0.58, -0.12);
      ecuGroup.add(connMesh);
    });

    // -----------------------------------------------------------
    // 12. SENSOR PINS & HUD HOTSPOTS (PHYSICALLY ATTACHED TO HOST NODES)
    // -----------------------------------------------------------
    // Map each sensor marker to its host component so it stays solidly attached
    const sensorHostMapping: Record<string, { group: THREE.Group; pos: [number, number, number] }> = {
      s_rpm: { group: groups.get('crankcase')!, pos: [0, 0.42, 1.05] },
      s_cht: { group: groups.get('cylinder_1')!, pos: [1.38, 0.32, 0.36] },
      s_egt: { group: groups.get('exhaust_system')!, pos: [0, -0.85, -0.85] },
      s_oil_press: { group: groups.get('oil_filter')!, pos: [0.48, -0.22, 0.68] },
      s_oil_temp: { group: groups.get('oil_sump')!, pos: [0, -0.88, -0.1] },
      s_fuel_flow: { group: groups.get('fuel_system')!, pos: [0.94, 0.52, 0.1] },
      s_map: { group: groups.get('supercharger')!, pos: [0, 0.95, -0.45] },
      s_vibration: { group: groups.get('crankcase')!, pos: [0, 0.50, 0.0] },
      s_battery: { group: groups.get('front_pulley')!, pos: [0.38, -0.32, 1.12] },
      s_injection_timing: { group: groups.get('fuel_system')!, pos: [-0.94, 0.52, 0.22] },
    };

    SENSOR_HOTSPOTS.forEach((sensor) => {
      const host = sensorHostMapping[sensor.id] || { group: groups.get('sensor_array')!, pos: sensor.position };
      const [hx, hy, hz] = host.pos;

      // Hexagonal Sensor transducer probe body
      const sBodyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 6);
      sBodyGeo.computeVertexNormals();
      const sBodyMesh = new THREE.Mesh(sBodyGeo, brassFittingPbr);
      sBodyMesh.position.set(hx, hy, hz);
      host.group.add(sBodyMesh);
      registerMesh(sBodyMesh, brassFittingPbr, 0x00f0ff, 0x10b981);

      // Interactive glowing hotspot sphere
      const pinSphereGeo = new THREE.SphereGeometry(0.05, 24, 24);
      pinSphereGeo.computeVertexNormals();
      const pinSphereMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.95,
        roughness: 0.1,
      });
      const pinSphereMesh = new THREE.Mesh(pinSphereGeo, pinSphereMat);
      pinSphereMesh.position.set(hx, hy + 0.1, hz);
      pinSphereMesh.userData = { isSensorPin: true, sensorData: sensor };
      host.group.add(pinSphereMesh);
    });
  };

  // Update Exploded Disassembly
  useEffect(() => {
    componentGroupsRef.current.forEach((group, compId) => {
      const offset = explodedOffsetsRef.current.get(compId);
      const initial = initialPositionsRef.current.get(compId);
      if (offset && initial) {
        group.position.x = initial.x + offset.x * explodedProgress;
        group.position.y = initial.y + offset.y * explodedProgress;
        group.position.z = initial.z + offset.z * explodedProgress;
      }
    });
  }, [explodedProgress]);

  // Update Render Mode or X-Ray with Smooth Material Switching
  useEffect(() => {
    materialsMapRef.current.forEach((mats, mesh) => {
      if (isXRayMode) {
        mesh.material = mats.xray;
      } else if (renderMode === 'METALLIC') {
        mesh.material = mats.metallic;
      } else if (renderMode === 'THERMAL') {
        mesh.material = mats.thermal;
      } else if (renderMode === 'STRESS') {
        mesh.material = mats.stress;
      } else if (renderMode === 'WIREFRAME') {
        mesh.material = mats.wireframe;
      }

      // Check if this mesh belongs to the selected or faulted component for subtle diagnostic highlight
      let isSelected = false;
      let parentObj: THREE.Object3D | null = mesh.parent;
      while (parentObj && parentObj !== masterEngineGroupRef.current) {
        if (parentObj.name === selectedComponentId) {
          isSelected = true;
          break;
        }
        parentObj = parentObj.parent;
      }

      // Apply subtle diagnostic highlight without neon saturation
      if (renderMode === 'METALLIC' && !isXRayMode && mesh.material instanceof THREE.MeshStandardMaterial) {
        if (isSelected) {
          const isFault = activeFaultId && activeFaultId !== 'NORMAL_OPERATION';
          mesh.material.emissive.setHex(isFault ? 0xef4444 : 0x00f0ff);
          mesh.material.emissiveIntensity = isFault ? 0.4 : 0.25;
        } else {
          mesh.material.emissive.setHex(0x000000);
          mesh.material.emissiveIntensity = 0;
        }
      }
    });
  }, [renderMode, isXRayMode, selectedComponentId, activeFaultId]);

  // Click Handler for 3D Mesh Picking
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData && hit.userData.isSensorPin && hit.userData.sensorData) {
        onSelectSensor(hit.userData.sensorData as SensorHotspot);
        return;
      }

      // Trace up to find recognized subsystem group
      let curr: THREE.Object3D | null = hit;
      while (curr && curr.parent && curr.parent !== masterEngineGroupRef.current && curr.parent !== sceneRef.current) {
        curr = curr.parent;
      }
      if (curr && componentGroupsRef.current.has(curr.name)) {
        onSelectComponent(curr.name);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-[#1e293b] bg-[#040813] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] select-none"
    >
      {/* 1. FLOATING OVERLAY TOP-LEFT: THERMAL & COMBUSTION */}
      <div className="absolute top-3.5 left-3.5 z-20 pointer-events-auto bg-[#070e1e]/85 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#1e2d4d] shadow-xl flex flex-col gap-1 min-w-[210px]">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#38bdf8] font-heading tracking-wider">
          <Thermometer className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>THERMAL & COMBUSTION</span>
        </div>
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-[10px] text-slate-400 font-mono">CHT Cylinder Head</span>
          <span className="text-xs font-mono font-bold text-[#38bdf8]">
            {liveChtC.toFixed(2)}°C
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 py-0.5 border-y border-white/5">
          <span>CHT: <strong className="text-[#38bdf8]">{liveChtC.toFixed(2)}°C</strong></span>
          <span className="text-slate-500">|</span>
          <span>EGT: <strong className="text-amber-400">{liveEgtC.toFixed(2)}°C</strong></span>
        </div>
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-[10px] text-slate-400 font-mono">Fuel Flow Rate</span>
          <span className="text-xs font-mono font-bold text-white">
            {liveFuelFlowLph.toFixed(2)} L/h
          </span>
        </div>
      </div>

      {/* 2. FLOATING OVERLAY TOP-CENTER: CONTROLS & SELECTION BADGE */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => applyCameraPreset('OVERVIEW')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#070e1e]/90 hover:bg-[#0c1833] text-slate-300 hover:text-white border border-[#1e2d4d] text-xs font-mono backdrop-blur-md transition-all shadow-lg"
          title="Reset Camera Target"
        >
          <RefreshCw className="w-3 h-3 text-[#00f0ff]" />
          <span>Reset View</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#070e1e]/90 hover:bg-[#0c1833] text-slate-300 hover:text-white border border-[#1e2d4d] text-xs font-mono backdrop-blur-md transition-all shadow-lg"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3 h-3 text-[#00f0ff]" /> : <Maximize2 className="w-3 h-3 text-[#00f0ff]" />}
          <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>

        {selectedComponentId && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0284c7]/20 border border-[#00f0ff]/60 text-[#00f0ff] text-xs font-mono font-bold backdrop-blur-md shadow-lg animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
            <span>SELECTED: {selectedComponentId.toUpperCase().replace(/_/g, ' ')}</span>
            <button
              onClick={() => onSelectComponent('crankcase')}
              className="ml-1 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3. FLOATING OVERLAY TOP-RIGHT: MECHANICAL & AVIONICS */}
      <div className="absolute top-3.5 right-3.5 z-20 pointer-events-auto bg-[#070e1e]/85 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#1e2d4d] shadow-xl flex flex-col gap-1 min-w-[220px]">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#38bdf8] font-heading tracking-wider">
          <Gauge className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>MECHANICAL & AVIONICS</span>
        </div>
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-[10px] text-slate-400 font-mono">Propeller Speed</span>
          <span className="text-xs font-mono font-bold text-[#00f0ff]">
            {engineRpm.toFixed(1)} RPM
          </span>
        </div>
        {/* Animated Propeller Speed Level Gauge Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden my-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-[#00f0ff] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, (engineRpm / 3400) * 100))}%` }}
          />
        </div>
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-[10px] text-slate-400 font-mono">Oil Pressure</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {liveOilPressureBar.toFixed(3)} bar
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-[10px] text-slate-400 font-mono">Vibration</span>
          <span
            className={`text-xs font-mono font-bold ${
              vibrationMmS > 3.0 ? 'text-[#ff4b2b] animate-pulse' : 'text-slate-200'
            }`}
          >
            {vibrationMmS.toFixed(3)} mm/s
          </span>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing"
      />

      {/* Quick Controls Bottom Floating Strip */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex items-center justify-between">
        {/* Left: Render Mode Toggles */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#070e1e]/90 backdrop-blur-md p-1 rounded-lg border border-[#1e2d4d] shadow-lg">
          <button
            onClick={() => setRenderMode('METALLIC')}
            className={`px-2 py-1 text-[10px] font-mono rounded flex items-center gap-1 transition-all ${
              renderMode === 'METALLIC' && !isXRayMode
                ? 'bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>PBR</span>
          </button>
          <button
            onClick={() => setRenderMode('THERMAL')}
            className={`px-2 py-1 text-[10px] font-mono rounded flex items-center gap-1 transition-all ${
              renderMode === 'THERMAL' && !isXRayMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>THERMAL</span>
          </button>
          <button
            onClick={() => setRenderMode('STRESS')}
            className={`px-2 py-1 text-[10px] font-mono rounded flex items-center gap-1 transition-all ${
              renderMode === 'STRESS' && !isXRayMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>STRESS</span>
          </button>
          <button
            onClick={() => setRenderMode('WIREFRAME')}
            className={`px-2 py-1 text-[10px] font-mono rounded flex items-center gap-1 transition-all ${
              renderMode === 'WIREFRAME' && !isXRayMode
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>WIRE</span>
          </button>
        </div>

        {/* Center: Interactive Hint */}
        <div className="hidden md:block pointer-events-none text-[10px] font-mono text-slate-400/80 bg-black/40 px-3 py-1 rounded border border-white/5">
          Left-drag to rotate • Right-drag to pan • Scroll to zoom • Click part to inspect
        </div>

        {/* Right: Auto-rotate button */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#070e1e]/90 backdrop-blur-md p-1 rounded-lg border border-[#1e2d4d] shadow-lg">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded transition-all ${
              isAutoRotating
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Auto Rotate Scene"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
