/**
 * js/modules/matrix-hero.js
 * Generative 3D Holographic Mesh Engine (Three.js WebGL)
 *
 * Visual Features:
 * - 1,800 Synchronized Luminous Plasma Drone Points
 * - 16 Diverse, Challenging, Innovative 3D Formations:
 *     0:  HYPERDIMENSIONAL TESSERACT (4D Hypercube Wireframe Projection)
 *     1:  QUANTUM SINGULARITY (Black Hole Accretion Disk & Bipolar Relativistic Jets)
 *     2:  BIONIC CYBER HAND (Articulated Robotic Hand with Metacarpals & Phalanges)
 *     3:  CYBER SKULL HUMANOID (Biomechanical Skull, Orbits & Craniometry)
 *     4:  CYBER HYPERCAR (Aerodynamic Le Mans Chassis, Wheels & Spoiler Wing)
 *     5:  SOARING CYBER EAGLE (Expansive Arched Wingspan, Feather Tips & Tail)
 *     6:  QUADRUPED ROBOTIC CHEETAH (Athletic Spine, Running Limbs & Tail)
 *     7:  DNA DOUBLE HELIX (Intertwined Helical Strands & Base-Pair Rungs)
 *     8:  ORBITAL TELECOM SATELLITE (Spacecraft Bus, Parabolic Dish & Solar Arrays)
 *     9:  3D NEURAL BRAIN (Bilateral Hemispheres, Cortical Folds & Synaptic Core)
 *     10: PLANETARY DATA NETWORK (Globe Coordinate Rings & Orbital Satellite Tracks)
 *     11: MOBIUS STRIP INFINITY (Topological Non-Orientable 3D Ribbon Loop)
 *     12: QUANTUM PROCESSOR CORE (Microchip Die, Radiating Bus Traces & I/O Pins)
 *     13: CYBER DRAGON (Serpentine Coiling Mecha Dragon, Horns & Dorsal Fins)
 *     14: FIBONACCI GALAXY (Logarithmic Golden-Spiral Galaxy & Luminous Nucleus)
 *     15: HEXACOPTER DRONE (Autonomous Airframe, 6 Radial Struts & Rotor Discs)
 * - Autonomous Random Morphing without text clutter
 * - Inertial 3D Drag-to-Rotate & Responsive Viewport
 */

import * as THREE from 'three';

export function initHeroMatrix() {
  const canvas = document.getElementById('hero-matrix-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  if (!container) return;

  let width = container.clientWidth || 550;
  let height = container.clientHeight || 420;

  // ── 1. Setup Three.js WebGL Scene, Camera & Renderer ──────────────────────
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Generate High-Definition Drone Beacon Texture (Gaussian Center + Luminous Halo)
  function createDroneBeaconTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');

    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.18, 'rgba(254, 240, 138, 0.95)');
    grad.addColorStop(0.42, 'rgba(245, 158, 11, 0.75)');
    grad.addColorStop(0.72, 'rgba(217, 119, 6, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(pCanvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }
  const droneTexture = createDroneBeaconTexture();

  // ── 2. Particle Geometry Setup (1,800 Autonomous Drones) ──────────────────
  const PARTICLE_COUNT = 1800;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sourcePositions = new Float32Array(PARTICLE_COUNT * 3);
  const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
  const phases = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    phases[i] = Math.random() * Math.PI * 2;

    // Warm amber drone palette with subtle cyan & violet accents
    const isViolet = i % 12 === 0;
    const isCyan = i % 7 === 0;
    if (isViolet) {
      colors[i * 3] = 0.75;
      colors[i * 3 + 1] = 0.45;
      colors[i * 3 + 2] = 0.98;
    } else if (isCyan) {
      colors[i * 3] = 0.22;
      colors[i * 3 + 1] = 0.85;
      colors[i * 3 + 2] = 0.98;
    } else {
      const isBright = i % 5 === 0;
      colors[i * 3] = isBright ? 1.0 : 0.96;
      colors[i * 3 + 1] = isBright ? 0.88 : 0.62;
      colors[i * 3 + 2] = isBright ? 0.35 : 0.04;
    }
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.125,
    map: droneTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.94,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const droneSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(droneSystem);

  // ── 3. Mathematical Coordinate Generators for 16 Formations ───────────────

  // Helper: line points generator
  function putLine(arr, startIdx, count, x1, y1, z1, x2, y2, z2) {
    for (let j = 0; j < count; j++) {
      const t = count <= 1 ? 0.5 : j / (count - 1);
      const idx = (startIdx + j) * 3;
      arr[idx] = x1 + (x2 - x1) * t;
      arr[idx + 1] = y1 + (y2 - y1) * t;
      arr[idx + 2] = z1 + (z2 - z1) * t;
    }
  }

  // 0: Hyperdimensional Tesseract (4D Hypercube Projection)
  function buildTesseract(arr) {
    // 16 4D vertices projected to 3D: outer cube (scale 1.45) & inner cube (scale 0.72)
    const sOut = 1.45, sIn = 0.72;
    const vOut = [], vIn = [];
    for (let i = 0; i < 8; i++) {
      const sx = (i & 1) ? 1 : -1;
      const sy = (i & 2) ? 1 : -1;
      const sz = (i & 4) ? 1 : -1;
      vOut.push([sx * sOut, sy * sOut, sz * sOut]);
      vIn.push([sx * sIn, sy * sIn, sz * sIn]);
    }
    // Edges: 12 outer, 12 inner, 8 cross = 32 edges. ~56 points per edge
    const edges = [];
    // cube edges
    for (let i = 0; i < 8; i++) {
      for (let bit = 1; bit <= 4; bit <<= 1) {
        if ((i & bit) === 0) {
          const j = i | bit;
          edges.push([vOut[i], vOut[j]]);
          edges.push([vIn[i], vIn[j]]);
        }
      }
    }
    // cross edges connecting outer to inner
    for (let i = 0; i < 8; i++) {
      edges.push([vOut[i], vIn[i]]);
    }
    const ptsPerEdge = Math.floor(PARTICLE_COUNT / edges.length);
    let pIdx = 0;
    for (const [p1, p2] of edges) {
      putLine(arr, pIdx, ptsPerEdge, p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
      pIdx += ptsPerEdge;
    }
    // fill remainder
    while (pIdx < PARTICLE_COUNT) {
      arr[pIdx * 3] = (Math.random() - 0.5) * 0.4;
      arr[pIdx * 3 + 1] = (Math.random() - 0.5) * 0.4;
      arr[pIdx * 3 + 2] = (Math.random() - 0.5) * 0.4;
      pIdx++;
    }
  }

  // 1: Quantum Singularity (Black Hole Accretion Disk & Relativistic Jets)
  function buildSingularity(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 400) {
        // Relativistic Polar Jets (shooting along +Y and -Y)
        const sign = i % 2 === 0 ? 1 : -1;
        const prog = (i / 400);
        const jetY = sign * (0.35 + prog * 1.85);
        const radius = 0.05 + prog * 0.28;
        const ang = prog * Math.PI * 18;
        x = Math.cos(ang) * radius;
        y = jetY;
        z = Math.sin(ang) * radius;
      } else if (i < 1300) {
        // Logarithmic Spiral Accretion Disk in X-Z Plane
        const u = (i - 400) / 900;
        const ang = u * Math.PI * 14;
        const r = 0.65 + u * 1.65;
        x = Math.cos(ang) * r;
        y = (Math.random() - 0.5) * 0.12 * (1 + u);
        z = Math.sin(ang) * r;
      } else {
        // Photon Sphere Event Horizon (Luminous Core Sphere)
        const v = (i - 1300) / 500;
        const phi = Math.acos(1 - 2 * v);
        const theta = v * Math.PI * 18;
        const r = 0.52;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi);
        z = r * Math.sin(phi) * Math.sin(theta);
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 2: Bionic Cyber Hand (Metacarpals, Knuckles & 5 Articulated Fingers)
  function buildCyberHand(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 450) {
        // Palm Metacarpal Frame & Wrist
        const u = i / 450;
        const palmY = -1.2 + u * 1.0;
        const palmW = 0.65 + Math.sin(u * Math.PI) * 0.25;
        x = (Math.random() - 0.5) * palmW * 2;
        y = palmY;
        z = (Math.random() - 0.5) * 0.22;
      } else {
        // 5 Fingers (Thumb, Index, Middle, Ring, Pinky)
        const fingerIdx = (i - 450) % 5;
        const fProg = Math.floor((i - 450) / 5) / 270; // 0 to 1
        const fLength = [0.85, 1.25, 1.45, 1.30, 0.95][fingerIdx];
        const fOffsetX = [-0.65, -0.35, 0.0, 0.35, 0.65][fingerIdx];
        const fSpreadAngle = [-0.45, -0.15, 0.0, 0.15, 0.35][fingerIdx];

        // Slight natural curling of fingers
        const curlY = fProg * fLength;
        const curlZ = Math.pow(fProg, 1.8) * 0.45;

        x = fOffsetX + Math.sin(fSpreadAngle) * curlY + (Math.random() - 0.5) * 0.06;
        y = -0.2 + Math.cos(fSpreadAngle) * curlY;
        z = -curlZ + (Math.random() - 0.5) * 0.06;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 3: Cyber Skull Humanoid (Cyborg Cranium, Orbits & Jaw)
  function buildCyberSkull(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 650) {
        // Cranial Dome
        const u = i / 650;
        const phi = Math.acos(1 - u * 1.6);
        const theta = u * Math.PI * 22;
        const r = 0.95;
        x = r * Math.sin(phi) * Math.cos(theta) * 0.88;
        y = 0.45 + r * Math.cos(phi) * 0.95;
        z = r * Math.sin(phi) * Math.sin(theta) * 0.85;
      } else if (i < 1050) {
        // Orbital Eye Sockets & Zygomatic Arches
        const side = i % 2 === 0 ? -1 : 1;
        const ang = Math.random() * Math.PI * 2;
        const eyeRad = 0.28 + Math.random() * 0.06;
        x = side * 0.42 + Math.cos(ang) * eyeRad;
        y = 0.25 + Math.sin(ang) * eyeRad;
        z = 0.65 + (Math.random() - 0.5) * 0.08;
      } else if (i < 1350) {
        // Nasal Aperture & Maxilla
        const v = (i - 1050) / 300;
        x = (Math.random() - 0.5) * 0.22 * (1 - v);
        y = 0.05 - v * 0.35;
        z = 0.72 - v * 0.15;
      } else {
        // Mandible Jaw & Teeth Row
        const w = (i - 1350) / 450;
        const jawAng = -Math.PI * 0.35 + w * Math.PI * 0.70;
        x = Math.sin(jawAng) * 0.58;
        y = -0.45 - Math.cos(jawAng) * 0.22;
        z = Math.cos(jawAng) * 0.65;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y - 0.1;
      arr[i * 3 + 2] = z;
    }
  }

  // 4: Cyber Hypercar
  function buildHypercar(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1050) {
        const t = i / 1050;
        const progZ = -1.85 + t * 3.7;
        const normZ = (progZ + 1.85) / 3.7;
        let bodyWidth = 0.84, bodyHeight = -0.18;
        if (normZ > 0.75) {
          const s = (normZ - 0.75) / 0.25;
          bodyWidth = 0.84 - s * 0.22;
          bodyHeight = -0.12 - s * 0.16;
        } else if (normZ > 0.35) {
          const s = (normZ - 0.35) / 0.40;
          bodyWidth = 0.62 * Math.sin(s * Math.PI);
          bodyHeight = 0.08 + Math.sin(s * Math.PI) * 0.48;
        } else {
          const s = normZ / 0.35;
          bodyWidth = 0.88 - (1 - s) * 0.12;
          bodyHeight = 0.08 - (1 - s) * 0.18;
        }
        const side = i % 2 === 0 ? 1 : -1;
        x = side * bodyWidth * Math.random();
        y = bodyHeight + (Math.random() - 0.5) * 0.06;
        z = progZ;
      } else if (i < 1550) {
        const wheelIdx = (i - 1050) % 4;
        const ang = Math.random() * Math.PI * 2;
        const radius = 0.33 + (Math.random() < 0.3 ? -0.15 * Math.random() : 0);
        const sideX = wheelIdx % 2 === 0 ? -0.88 : 0.88;
        const posZ = wheelIdx < 2 ? 1.15 : -1.15;
        x = sideX + (Math.random() - 0.5) * 0.06;
        y = -0.28 + Math.sin(ang) * radius;
        z = posZ + Math.cos(ang) * radius;
      } else if (i < 1700) {
        const t = (i - 1550) / 150;
        x = -0.92 + t * 1.84;
        y = 0.48 + (Math.random() - 0.5) * 0.04;
        z = -1.82;
      } else {
        const t = (i - 1700) / 100;
        const side = t < 0.5 ? -1 : 1;
        const s = (t % 0.5) / 0.5;
        x = side * (0.35 + s * 0.32);
        y = -0.18 + s * 0.05;
        z = 1.84 - s * 0.15;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y + 0.1;
      arr[i * 3 + 2] = z;
    }
  }

  // 5: Soaring Cyber Eagle
  function buildCyberEagle(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1250) {
        const t = (i / 1250) * 2 - 1;
        const spanX = t * 2.35;
        const absT = Math.abs(t);
        const wingHeight = 0.18 + (1 - absT * absT) * 0.45 - Math.sin(absT * Math.PI) * 0.15;
        const chordDepth = (Math.random() - 0.5) * (1 - absT * 0.85) * 0.65;
        x = spanX;
        y = wingHeight + (Math.random() - 0.5) * 0.08;
        z = -0.15 * spanX * spanX + chordDepth;
        if (absT > 0.82) z -= (absT - 0.82) * 1.5 * Math.random();
      } else if (i < 1550) {
        const u = (i - 1250) / 300;
        const bodyZ = -0.45 + u * 1.1;
        const r = 0.22 * Math.sqrt(Math.max(0, 1 - Math.abs(bodyZ / 0.65)));
        const ang = Math.random() * Math.PI * 2;
        x = Math.cos(ang) * r;
        y = 0.15 + Math.sin(ang) * r;
        z = bodyZ;
      } else if (i < 1680) {
        const v = (i - 1550) / 130;
        x = (Math.random() - 0.5) * 0.14 * (1 - v);
        y = 0.32 - Math.pow(v, 1.8) * 0.22;
        z = 0.65 + v * 0.38;
      } else {
        const w = (i - 1680) / 120;
        x = (Math.random() - 0.5) * w * 1.1;
        y = 0.08 + (Math.random() - 0.5) * 0.06;
        z = -0.45 - w * 0.85;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y - 0.1;
      arr[i * 3 + 2] = z;
    }
  }

  // 6: Quadruped Robotic Cheetah
  function buildCyberCheetah(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 700) {
        const t = i / 700;
        x = (Math.random() - 0.5) * 0.26;
        y = 0.35 + Math.sin(t * Math.PI) * 0.42 + (Math.random() - 0.5) * 0.12;
        z = -1.15 + t * 2.15;
      } else if (i < 1300) {
        const legIdx = (i - 700) % 4;
        const legProg = Math.floor((i - 700) / 4) / 150;
        if (legIdx === 0) { x = 0.28; y = 0.45 - legProg * 0.95; z = 0.85 + legProg * 0.65; }
        else if (legIdx === 1) { x = -0.28; y = 0.45 - legProg * 0.85; z = 0.70 + Math.sin(legProg * Math.PI) * 0.3; }
        else if (legIdx === 2) { x = 0.28; y = 0.48 - legProg * 0.98; z = -0.95 - legProg * 0.75; }
        else { x = -0.28; y = 0.48 - legProg * 0.92; z = -0.80 - legProg * 0.55; }
        x += (Math.random() - 0.5) * 0.06;
      } else if (i < 1550) {
        const u = (i - 1300) / 250;
        x = (Math.random() - 0.5) * 0.28 * (1 - u * 0.4);
        y = 0.55 + (Math.random() - 0.5) * 0.22;
        z = 1.0 + u * 0.38;
      } else {
        const v = (i - 1550) / 250;
        x = (Math.random() - 0.5) * 0.08;
        y = 0.45 + Math.sin(v * Math.PI * 0.85) * 0.48;
        z = -1.15 - v * 0.95;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y - 0.15;
      arr[i * 3 + 2] = z;
    }
  }

  // 7: DNA Double Helix
  function buildDNAHelix(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1100) {
        const strand = i % 2;
        const t = Math.floor(i / 2) / 550;
        const heightY = -1.85 + t * 3.7;
        const angle = heightY * 2.6 + (strand === 1 ? Math.PI : 0);
        x = Math.cos(angle) * 1.05 + (Math.random() - 0.5) * 0.08;
        y = heightY;
        z = Math.sin(angle) * 1.05 + (Math.random() - 0.5) * 0.08;
      } else {
        const rungIdx = (i - 1100) % 24;
        const rungY = -1.65 + (rungIdx / 23) * 3.3;
        const angle = rungY * 2.6;
        const x1 = Math.cos(angle) * 1.05, z1 = Math.sin(angle) * 1.05;
        const x2 = Math.cos(angle + Math.PI) * 1.05, z2 = Math.sin(angle + Math.PI) * 1.05;
        const span = (i % 29) / 28;
        x = x1 + (x2 - x1) * span;
        y = rungY + (Math.random() - 0.5) * 0.04;
        z = z1 + (z2 - z1) * span;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 8: Orbital Telecom Satellite
  function buildOrbitalSatellite(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 450) {
        const ang = ((i % 6) / 6) * Math.PI * 2;
        const h = ((i / 450) - 0.5) * 0.95;
        x = Math.cos(ang) * 0.42 + (Math.random() - 0.5) * 0.08;
        y = h;
        z = Math.sin(ang) * 0.42 + (Math.random() - 0.5) * 0.08;
      } else if (i < 850) {
        const u = (i - 450) / 400;
        const dishRad = Math.sqrt(u) * 0.58;
        const dishAng = Math.random() * Math.PI * 2;
        x = Math.cos(dishAng) * dishRad;
        y = Math.sin(dishAng) * dishRad;
        z = 0.45 + Math.pow(dishRad / 0.58, 2) * 0.35 + (u < 0.08 ? 0.38 : 0);
      } else if (i < 1700) {
        const side = i % 2 === 0 ? -1 : 1;
        const wingProg = Math.floor((i - 850) / 2) / 425;
        x = side * (0.55 + wingProg * 1.95);
        y = ((i % 11) / 10 - 0.5) * 0.72;
        z = (Math.random() - 0.5) * 0.05;
      } else {
        const v = (i - 1700) / 100;
        x = 0;
        y = 0.48 + v * 1.15;
        z = 0;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 9: 3D Neural Cortex
  function buildNeuralCortex(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1350) {
        const side = i % 2 === 0 ? -1 : 1;
        const u = Math.floor(i / 2) / 675;
        const theta = Math.acos(Math.max(-1, Math.min(1, 2 * u - 1)));
        const phi = Math.random() * Math.PI * 2;
        const fold = 0.12 * Math.sin(theta * 8) * Math.cos(phi * 7);
        const r = 0.88 + fold;
        x = side * (0.16 + Math.abs(Math.sin(theta) * Math.cos(phi) * r * 0.85));
        y = 0.12 + Math.cos(theta) * r * 0.95;
        z = Math.sin(theta) * Math.sin(phi) * r * 0.85;
      } else {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.6) * 0.45;
        x = (Math.random() - 0.5) * 0.45;
        y = 0.10 + Math.sin(theta) * r * 0.65;
        z = Math.cos(theta) * r;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 10: Planetary Data Network
  function buildPlanetaryNetwork(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1050) {
        const isLat = i < 550;
        const radius = 1.18;
        if (isLat) {
          const latAngle = (((i % 7) - 3) / 3.5) * (Math.PI * 0.42);
          const longAng = Math.random() * Math.PI * 2;
          x = radius * Math.cos(latAngle) * Math.cos(longAng);
          y = radius * Math.sin(latAngle);
          z = radius * Math.cos(latAngle) * Math.sin(longAng);
        } else {
          const merAngle = (((i - 550) % 8) / 8) * Math.PI;
          const theta = Math.random() * Math.PI * 2;
          x = Math.cos(theta) * radius * Math.cos(merAngle);
          y = Math.sin(theta) * radius;
          z = Math.cos(theta) * radius * Math.sin(merAngle);
        }
      } else if (i < 1600) {
        const orbitIdx = (i - 1050) % 2;
        const orbitRadius = 1.68 + (Math.random() - 0.5) * 0.08;
        const ang = Math.random() * Math.PI * 2;
        const tilt = orbitIdx === 0 ? 0.65 : -0.65;
        const rx = Math.cos(ang) * orbitRadius;
        const rz = Math.sin(ang) * orbitRadius;
        x = rx * Math.cos(tilt) - rz * Math.sin(tilt) * 0.3;
        y = rx * Math.sin(tilt);
        z = rz;
      } else {
        const nodeIdx = (i - 1600) % 16;
        const nodeAngle = (nodeIdx / 16) * Math.PI * 2;
        const tilt = nodeIdx % 2 === 0 ? 0.65 : -0.65;
        const rx = Math.cos(nodeAngle) * 1.68;
        const rz = Math.sin(nodeAngle) * 1.68;
        x = rx * Math.cos(tilt) + (Math.random() - 0.5) * 0.15;
        y = rx * Math.sin(tilt) + (Math.random() - 0.5) * 0.15;
        z = rz + (Math.random() - 0.5) * 0.15;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 11: Mobius Strip Infinity Loop
  function buildMobiusStrip(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = (i / PARTICLE_COUNT) * Math.PI * 2;
      const v = ((i % 15) / 14 - 0.5) * 0.65; // width across strip
      // Parametric Mobius Strip formula
      const x = (1.45 + (v / 2) * Math.cos(u / 2)) * Math.cos(u);
      const y = (1.45 + (v / 2) * Math.cos(u / 2)) * Math.sin(u);
      const z = (v / 2) * Math.sin(u / 2);
      arr[i * 3] = x;
      arr[i * 3 + 1] = y * 0.65; // Flatten slightly for 3D viewing
      arr[i * 3 + 2] = z * 2.2;
    }
  }

  // 12: Quantum Processor Core (Die, Bus Traces & Pin Arrays)
  function buildQuantumProcessor(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 600) {
        // Central Concentric Silicon Die Rings
        const ringIdx = i % 4;
        const r = 0.35 + ringIdx * 0.25;
        const ang = Math.random() * Math.PI * 2;
        x = Math.cos(ang) * r;
        y = Math.sin(ang) * r;
        z = (Math.random() - 0.5) * 0.08;
      } else if (i < 1300) {
        // Orthogonal Radiating Bus Traces (8 cardinal & diagonal pathways)
        const traceIdx = (i - 600) % 8;
        const tAngle = (traceIdx / 8) * Math.PI * 2;
        const prog = ((i - 600) / 700) * 1.25;
        x = Math.cos(tAngle) * (0.45 + prog);
        y = Math.sin(tAngle) * (0.45 + prog);
        z = (Math.random() - 0.5) * 0.04;
      } else {
        // Outer Square Contact Pin Array
        const pinIdx = (i - 1300) % 4; // 4 sides of square
        const sideProg = ((i - 1300) / 500) * 2 - 1; // -1 to 1
        const s = 1.65;
        if (pinIdx === 0) { x = sideProg * s; y = s; }
        else if (pinIdx === 1) { x = s; y = sideProg * s; }
        else if (pinIdx === 2) { x = sideProg * s; y = -s; }
        else { x = -s; y = sideProg * s; }
        z = (Math.random() - 0.5) * 0.06;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 13: Cyber Dragon (Serpentine Undulating Mecha Beast)
  function buildCyberDragon(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1300) {
        // Sinuous Coiling Spine (Helical Sine Wave)
        const t = (i / 1300);
        const spineZ = -1.8 + t * 3.6; // tail (-1.8) to head (+1.8)
        const spineX = Math.sin(t * Math.PI * 4) * 0.85;
        const spineY = Math.cos(t * Math.PI * 3) * 0.65;
        const girth = (1 - Math.abs(t - 0.5) * 1.4) * 0.28 + 0.08;
        const ang = Math.random() * Math.PI * 2;

        x = spineX + Math.cos(ang) * girth;
        y = spineY + Math.sin(ang) * girth;
        z = spineZ;

        // Dorsal Spine Fin Crests
        if (i % 6 === 0) {
          y += girth * 1.5;
        }
      } else if (i < 1600) {
        // Horned Draconic Head & Snout
        const u = (i - 1300) / 300;
        x = (Math.random() - 0.5) * 0.35 * (1 - u * 0.5);
        y = 0.45 + (Math.random() - 0.5) * 0.32;
        z = 1.75 + u * 0.65;

        // Backward Horns
        if (u < 0.25) {
          x = (i % 2 === 0 ? -1 : 1) * (0.35 + u * 1.5);
          y += 0.35 + u * 1.2;
          z -= u * 1.8;
        }
      } else {
        // 4 Clawed Raptor Limbs
        const legIdx = (i - 1600) % 4;
        const lProg = ((i - 1600) / 200);
        const side = legIdx % 2 === 0 ? -1 : 1;
        const zPos = legIdx < 2 ? 0.65 : -0.65;
        x = side * (0.55 + lProg * 0.45);
        y = -0.45 - lProg * 0.45;
        z = zPos + (Math.random() - 0.5) * 0.15;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 14: Fibonacci Galaxy (Logarithmic Spiral Arms & Galactic Core)
  function buildFibonacciGalaxy(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 400) {
        // Dense Luminous Galactic Nucleus
        const theta = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.6) * 0.52;
        x = Math.cos(theta) * r;
        y = (Math.random() - 0.5) * 0.35 * (1 - r / 0.52);
        z = Math.sin(theta) * r;
      } else {
        // 2 Sweeping Logarithmic Golden Spiral Arms
        const arm = i % 2; // 0 or 1
        const u = (i - 400) / 1400; // 0 to 1
        const theta = u * Math.PI * 5 + (arm === 1 ? Math.PI : 0);
        const r = 0.45 + Math.pow(u, 0.85) * 1.85;
        const jitter = (Math.random() - 0.5) * 0.25 * (0.3 + u);

        x = Math.cos(theta) * r + jitter;
        y = (Math.random() - 0.5) * 0.15 * (1 - u * 0.5);
        z = Math.sin(theta) * r + jitter;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 15: Hexacopter Drone (Airframe, 6 Radial Struts & Rotor Discs)
  function buildHexacopter(arr) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 400) {
        // Central Avionics Flight Controller Core
        const theta = Math.random() * Math.PI * 2;
        const r = 0.38 * Math.sqrt(Math.random());
        x = Math.cos(theta) * r;
        y = (Math.random() - 0.5) * 0.18;
        z = Math.sin(theta) * r;
      } else if (i < 1600) {
        // 6 Radial Motor Arms & Spinning Rotor Discs (spaced 60 deg apart)
        const armIdx = (i - 400) % 6;
        const armAng = (armIdx / 6) * Math.PI * 2;
        const armProg = Math.floor((i - 400) / 6) / 200; // 0 to 1

        if (armProg < 0.4) {
          // Motor strut beam
          const dist = 0.35 + (armProg / 0.4) * 1.35;
          x = Math.cos(armAng) * dist;
          y = 0.05;
          z = Math.sin(armAng) * dist;
        } else {
          // Circular Rotor Disc
          const motorX = Math.cos(armAng) * 1.70;
          const motorZ = Math.sin(armAng) * 1.70;
          const discAng = Math.random() * Math.PI * 2;
          const discR = 0.42 * Math.sqrt(Math.random());
          x = motorX + Math.cos(discAng) * discR;
          y = 0.12 + (Math.random() - 0.5) * 0.04;
          z = motorZ + Math.sin(discAng) * discR;
        }
      } else {
        // Landing Gear Skids
        const skidIdx = (i - 1600) % 2;
        const sideX = skidIdx === 0 ? -0.85 : 0.85;
        const sProg = ((i - 1600) / 200) * 2 - 1;
        x = sideX;
        y = -0.42;
        z = sProg * 1.25;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // ── 4. Catalog of 16 Formations ───────────────────────────────────────────
  const generators = [
    buildTesseract,
    buildSingularity,
    buildCyberHand,
    buildCyberSkull,
    buildHypercar,
    buildCyberEagle,
    buildCyberCheetah,
    buildDNAHelix,
    buildOrbitalSatellite,
    buildNeuralCortex,
    buildPlanetaryNetwork,
    buildMobiusStrip,
    buildQuantumProcessor,
    buildCyberDragon,
    buildFibonacciGalaxy,
    buildHexacopter
  ];

  const targetArrays = generators.map(() => new Float32Array(PARTICLE_COUNT * 3));
  generators.forEach((gen, idx) => gen(targetArrays[idx]));

  // Start with a random formation
  let currentIdx = Math.floor(Math.random() * generators.length);
  for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
    positions[i] = targetArrays[currentIdx][i];
    sourcePositions[i] = targetArrays[currentIdx][i];
    targetPositions[i] = targetArrays[currentIdx][i];
  }

  // ── 5. Autonomous Random Morphing Controller ──────────────────────────────
  const HOLD_DURATION = 5000;  // 5 seconds hold per formation
  const MORPH_DURATION = 1200; // 1.2 seconds smooth flight transition

  let lastCycleTime = performance.now();
  let isMorphing = false;
  let morphStartTime = 0;

  function triggerNextRandomFormation() {
    let nextIdx = currentIdx;
    while (nextIdx === currentIdx) {
      nextIdx = Math.floor(Math.random() * generators.length);
    }
    currentIdx = nextIdx;

    const targetSrc = targetArrays[currentIdx];
    const posArr = particleGeometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      sourcePositions[i] = posArr[i];
      targetPositions[i] = targetSrc[i];
    }

    isMorphing = true;
    morphStartTime = performance.now();
    lastCycleTime = performance.now();
  }

  function smoothStep(t) {
    return t * t * (3 - 2 * t);
  }

  // ── 6. Interactive Inertia Drag-to-Rotate & Ambient Parallax ──────────────
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotation = { x: 0.12, y: 0.25 };
  let currentRotation = { x: 0.12, y: 0.25 };

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / width) * 2 - 1;
    const my = -((e.clientY - rect.top) / height) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      targetRotation.y += deltaX * 0.007;
      targetRotation.x += deltaY * 0.007;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    } else {
      targetRotation.y = 0.25 + mx * 0.35;
      targetRotation.x = 0.12 - my * 0.22;
    }
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // ── 7. Responsive Resize Handler ─────────────────────────────────────────
  function onResize() {
    width = container.clientWidth || 550;
    height = container.clientHeight || 420;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  // ── 8. Render Loop ───────────────────────────────────────────────────────
  let isVisible = true;
  let animationFrameId = null;
  const clock = new THREE.Clock();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const wasVisible = isVisible;
        isVisible = entries[0].isIntersecting;
        if (isVisible && (!animationFrameId || !wasVisible)) {
          lastCycleTime = performance.now();
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
          }
        }
      },
      { threshold: 0, rootMargin: '350px 0px 350px 0px' }
    );
    observer.observe(container);
  }

  function animate(now) {
    if (!isVisible || document.hidden) {
      animationFrameId = null;
      return;
    }
    animationFrameId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;

    droneSystem.rotation.x = currentRotation.x;
    droneSystem.rotation.y = currentRotation.y;

    // Gentle global hover float
    droneSystem.position.y = Math.sin(elapsedTime * 1.4) * 0.05;

    const posArr = particleGeometry.attributes.position.array;

    if (isMorphing) {
      const morphElapsed = now - morphStartTime;
      const morphProgress = Math.min(1, morphElapsed / MORPH_DURATION);
      const easedT = smoothStep(morphProgress);

      for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        posArr[i] = sourcePositions[i] + (targetPositions[i] - sourcePositions[i]) * easedT;
      }

      if (morphProgress >= 1) {
        isMorphing = false;
        lastCycleTime = now;
      }
    } else {
      const holdElapsed = now - lastCycleTime;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const tx = targetPositions[idx];
        const ty = targetPositions[idx + 1];
        const tz = targetPositions[idx + 2];

        // Atmospheric GPS station hover drift
        const pPhase = phases[i] + elapsedTime * 2.2;
        const driftX = Math.sin(pPhase) * 0.012;
        const driftY = Math.cos(pPhase * 1.1) * 0.014;
        const driftZ = Math.sin(pPhase * 0.9) * 0.012;

        posArr[idx] = tx + driftX;
        posArr[idx + 1] = ty + driftY;
        posArr[idx + 2] = tz + driftZ;
      }

      if (holdElapsed >= HOLD_DURATION) {
        triggerNextRandomFormation();
      }
    }

    particleGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  animationFrameId = requestAnimationFrame(animate);

  return function cleanup() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };
}
