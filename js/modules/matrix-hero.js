/**
 * js/modules/matrix-hero.js
 * Sculptural 3D Stipple & Polyhedral Mesh Engine with Calligraphic Fluid Swirl
 *
 * Design & Visual Features (Refined v2 on Neo-Brutalist Paper #F7F6F3):
 * - Open seamless paper stage (no boxed terminal card); sweeps leftward across desktop hero on swirl
 * - Restores all 16 pre-existing mathematical 3D formations (Tesseract, Quantum Singularity,
 *   Cyber Hand, Cyber Skull, Cyber Hypercar, Soaring Eagle, Robotic Cheetah, DNA Double Helix,
 *   Orbital Satellite, Neural Cortex, Planetary Network, Mobius Strip, Quantum Processor,
 *   Cyber Dragon, Fibonacci Galaxy, Hexacopter Drone) with per-shape optimal viewing angles
 * - High-contrast Stippled Obsidian (#121212) + Warm Amber/Gold (#D97706 / #F59E0B) particle cloud
 *   plus 72 lit low-poly 3D geometric shards (InstancedMesh Dodecahedra/Octahedra/Tetrahedra)
 * - Zero-GC Multi-Layer Calligraphic Liquid-Gold Fluid Ribbons sweeping across the hero during morphs
 * - Synchronized Name Chromatic Wave Loop: illuminates and recolors "Muhammad Asad Khan" in sync
 *   with the swirl loop
 * - Interactive drag-to-rotate with inertia, click-to-morph, and off-screen IntersectionObserver pause
 */

import * as THREE from 'three';

export function initHeroMatrix() {
  const canvas = document.getElementById('hero-matrix-canvas');
  const stageWrap = document.getElementById('hmc-canvas-wrap');
  const anchorEl = document.getElementById('hero-matrix-card');
  const heroSection = document.getElementById('hero');
  if (!canvas || !stageWrap || !anchorEl) return;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = stageWrap.clientWidth || 560;
  let height = stageWrap.clientHeight || 480;

  // ── 1. Scene, Camera & Renderer Setup ───────────────────────────────────
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
  camera.position.set(0, 0, 6.8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  // ── 2. Natural Editorial Studio Lighting for 3D Shards ──────────────────
  const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.9);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const warmPointLight = new THREE.PointLight(0xf59e0b, 3.6, 18);
  warmPointLight.position.set(0.6, 0.8, 3.2);
  scene.add(warmPointLight);

  const rimLight = new THREE.DirectionalLight(0xfde68a, 1.6);
  rimLight.position.set(-5, -3, 2);
  scene.add(rimLight);

  // Main sculpture root group (rotates cleanly with user drag / hover)
  const sculptureGroup = new THREE.Group();
  scene.add(sculptureGroup);

  // ── 3. Seeded Deterministic PRNG ────────────────────────────────────────
  function makeRng(seed) {
    let s = seed >>> 0;
    return function rand() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // ── 4. Pre-existing 16 Mathematical 3D Formation Generators ───────────────
  const BASE_COUNT = 1920;
  const AURA_COUNT = 120;
  const PARTICLE_COUNT = BASE_COUNT + AURA_COUNT;

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
  function buildTesseract(arr, rand) {
    const sOut = 1.42;
    const sIn = 0.70;
    const vOut = [];
    const vIn = [];
    for (let i = 0; i < 8; i++) {
      const sx = (i & 1) ? 1 : -1;
      const sy = (i & 2) ? 1 : -1;
      const sz = (i & 4) ? 1 : -1;
      vOut.push([sx * sOut, sy * sOut, sz * sOut]);
      vIn.push([sx * sIn, sy * sIn, sz * sIn]);
    }
    const edges = [];
    for (let i = 0; i < 8; i++) {
      for (let bit = 1; bit <= 4; bit <<= 1) {
        if ((i & bit) === 0) {
          const j = i | bit;
          edges.push([vOut[i], vOut[j]]);
          edges.push([vIn[i], vIn[j]]);
        }
      }
      edges.push([vOut[i], vIn[i]]);
    }
    const ptsPerEdge = Math.floor(BASE_COUNT / edges.length);
    let pIdx = 0;
    for (const [p1, p2] of edges) {
      putLine(arr, pIdx, ptsPerEdge, p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
      pIdx += ptsPerEdge;
    }
    while (pIdx < BASE_COUNT) {
      arr[pIdx * 3] = (rand() - 0.5) * 0.45;
      arr[pIdx * 3 + 1] = (rand() - 0.5) * 0.45;
      arr[pIdx * 3 + 2] = (rand() - 0.5) * 0.45;
      pIdx++;
    }
  }

  // 1: Quantum Singularity (Black Hole Accretion Disk & Relativistic Polar Jets)
  function buildSingularity(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 400) {
        const sign = i % 2 === 0 ? 1 : -1;
        const prog = i / 400;
        const jetY = sign * (0.35 + prog * 1.80);
        const radius = 0.05 + prog * 0.28;
        const ang = prog * Math.PI * 18;
        x = Math.cos(ang) * radius;
        y = jetY;
        z = Math.sin(ang) * radius;
      } else if (i < 1300) {
        const u = (i - 400) / 900;
        const ang = u * Math.PI * 14;
        const r = 0.65 + u * 1.60;
        x = Math.cos(ang) * r;
        y = (rand() - 0.5) * 0.12 * (1 + u);
        z = Math.sin(ang) * r;
      } else {
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

  // 2: Bionic Cyber Hand
  function buildCyberHand(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 450) {
        const u = i / 450;
        const palmY = -1.2 + u * 1.0;
        const palmW = 0.65 + Math.sin(u * Math.PI) * 0.25;
        x = (rand() - 0.5) * palmW * 2;
        y = palmY;
        z = (rand() - 0.5) * 0.22;
      } else {
        const fingerIdx = (i - 450) % 5;
        const fProg = Math.floor((i - 450) / 5) / 270;
        const fLength = [0.85, 1.25, 1.45, 1.30, 0.95][fingerIdx];
        const fOffsetX = [-0.65, -0.35, 0.0, 0.35, 0.65][fingerIdx];
        const fSpreadAngle = [-0.45, -0.15, 0.0, 0.15, 0.35][fingerIdx];
        const curlY = fProg * fLength;
        const curlZ = Math.pow(fProg, 1.8) * 0.45;
        x = fOffsetX + Math.sin(fSpreadAngle) * curlY + (rand() - 0.5) * 0.06;
        y = -0.2 + Math.cos(fSpreadAngle) * curlY;
        z = -curlZ + (rand() - 0.5) * 0.06;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y + 0.15;
      arr[i * 3 + 2] = z;
    }
  }

  // 3: Cyber Skull Humanoid
  function buildCyberSkull(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 650) {
        const u = i / 650;
        const phi = Math.acos(1 - u * 1.6);
        const theta = u * Math.PI * 22;
        const r = 0.98;
        x = r * Math.sin(phi) * Math.cos(theta) * 0.88;
        y = 0.45 + r * Math.cos(phi) * 0.95;
        z = r * Math.sin(phi) * Math.sin(theta) * 0.85;
      } else if (i < 1050) {
        const side = i % 2 === 0 ? -1 : 1;
        const ang = rand() * Math.PI * 2;
        const eyeRad = 0.28 + rand() * 0.06;
        x = side * 0.42 + Math.cos(ang) * eyeRad;
        y = 0.25 + Math.sin(ang) * eyeRad;
        z = 0.65 + (rand() - 0.5) * 0.08;
      } else if (i < 1350) {
        const v = (i - 1050) / 300;
        x = (rand() - 0.5) * 0.22 * (1 - v);
        y = 0.05 - v * 0.35;
        z = 0.72 - v * 0.15;
      } else {
        const w = (i - 1350) / 450;
        const jawAng = -Math.PI * 0.35 + w * Math.PI * 0.70;
        x = Math.sin(jawAng) * 0.58;
        y = -0.45 - Math.cos(jawAng) * 0.22;
        z = Math.cos(jawAng) * 0.65;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y - 0.12;
      arr[i * 3 + 2] = z;
    }
  }

  // 4: Cyber Hypercar
  function buildHypercar(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
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
        x = side * bodyWidth * rand();
        y = bodyHeight + (rand() - 0.5) * 0.06;
        z = progZ;
      } else if (i < 1550) {
        const wheelIdx = (i - 1050) % 4;
        const ang = rand() * Math.PI * 2;
        const radius = 0.33 + (rand() < 0.3 ? -0.15 * rand() : 0);
        const sideX = wheelIdx % 2 === 0 ? -0.88 : 0.88;
        const posZ = wheelIdx < 2 ? 1.15 : -1.15;
        x = sideX + (rand() - 0.5) * 0.06;
        y = -0.28 + Math.sin(ang) * radius;
        z = posZ + Math.cos(ang) * radius;
      } else if (i < 1700) {
        const t = (i - 1550) / 150;
        x = -0.92 + t * 1.84;
        y = 0.48 + (rand() - 0.5) * 0.04;
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
  function buildCyberEagle(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1250) {
        const t = (i / 1250) * 2 - 1;
        const spanX = t * 2.15;
        const absT = Math.abs(t);
        const wingHeight = 0.18 + (1 - absT * absT) * 0.45 - Math.sin(absT * Math.PI) * 0.15;
        const chordDepth = (rand() - 0.5) * (1 - absT * 0.85) * 0.65;
        x = spanX;
        y = wingHeight + (rand() - 0.5) * 0.08;
        z = -0.15 * spanX * spanX + chordDepth;
        if (absT > 0.82) z -= (absT - 0.82) * 1.5 * rand();
      } else if (i < 1550) {
        const u = (i - 1250) / 300;
        const bodyZ = -0.45 + u * 1.1;
        const r = 0.22 * Math.sqrt(Math.max(0, 1 - Math.abs(bodyZ / 0.65)));
        const ang = rand() * Math.PI * 2;
        x = Math.cos(ang) * r;
        y = 0.15 + Math.sin(ang) * r;
        z = bodyZ;
      } else if (i < 1680) {
        const v = (i - 1550) / 130;
        x = (rand() - 0.5) * 0.14 * (1 - v);
        y = 0.32 - Math.pow(v, 1.8) * 0.22;
        z = 0.65 + v * 0.38;
      } else {
        const w = (i - 1680) / 120;
        x = (rand() - 0.5) * w * 1.1;
        y = 0.08 + (rand() - 0.5) * 0.06;
        z = -0.45 - w * 0.85;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y - 0.1;
      arr[i * 3 + 2] = z;
    }
  }

  // 6: Quadruped Robotic Cheetah
  function buildCyberCheetah(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 700) {
        const t = i / 700;
        x = (rand() - 0.5) * 0.26;
        y = 0.35 + Math.sin(t * Math.PI) * 0.42 + (rand() - 0.5) * 0.12;
        z = -1.15 + t * 2.15;
      } else if (i < 1300) {
        const legIdx = (i - 700) % 4;
        const legProg = Math.floor((i - 700) / 4) / 150;
        if (legIdx === 0) { x = 0.28; y = 0.45 - legProg * 0.95; z = 0.85 + legProg * 0.65; }
        else if (legIdx === 1) { x = -0.28; y = 0.45 - legProg * 0.85; z = 0.70 + Math.sin(legProg * Math.PI) * 0.3; }
        else if (legIdx === 2) { x = 0.28; y = 0.48 - legProg * 0.98; z = -0.95 - legProg * 0.75; }
        else { x = -0.28; y = 0.48 - legProg * 0.92; z = -0.80 - legProg * 0.55; }
        x += (rand() - 0.5) * 0.06;
      } else if (i < 1550) {
        const u = (i - 1300) / 250;
        x = (rand() - 0.5) * 0.28 * (1 - u * 0.4);
        y = 0.55 + (rand() - 0.5) * 0.22;
        z = 1.0 + u * 0.38;
      } else {
        const v = (i - 1550) / 250;
        x = (rand() - 0.5) * 0.08;
        y = 0.45 + Math.sin(v * Math.PI * 0.85) * 0.48;
        z = -1.15 - v * 0.95;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y - 0.15;
      arr[i * 3 + 2] = z;
    }
  }

  // 7: DNA Double Helix
  function buildDNAHelix(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1100) {
        const strand = i % 2;
        const t = Math.floor(i / 2) / 550;
        const heightY = -1.75 + t * 3.5;
        const angle = heightY * 2.6 + (strand === 1 ? Math.PI : 0);
        x = Math.cos(angle) * 1.02 + (rand() - 0.5) * 0.08;
        y = heightY;
        z = Math.sin(angle) * 1.02 + (rand() - 0.5) * 0.08;
      } else {
        const rungIdx = (i - 1100) % 24;
        const rungY = -1.55 + (rungIdx / 23) * 3.1;
        const angle = rungY * 2.6;
        const x1 = Math.cos(angle) * 1.02, z1 = Math.sin(angle) * 1.02;
        const x2 = Math.cos(angle + Math.PI) * 1.02, z2 = Math.sin(angle + Math.PI) * 1.02;
        const span = (i % 29) / 28;
        x = x1 + (x2 - x1) * span;
        y = rungY + (rand() - 0.5) * 0.04;
        z = z1 + (z2 - z1) * span;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 8: Orbital Telecom Satellite
  function buildOrbitalSatellite(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 450) {
        const ang = ((i % 6) / 6) * Math.PI * 2;
        const h = ((i / 450) - 0.5) * 0.95;
        x = Math.cos(ang) * 0.42 + (rand() - 0.5) * 0.08;
        y = h;
        z = Math.sin(ang) * 0.42 + (rand() - 0.5) * 0.08;
      } else if (i < 850) {
        const u = (i - 450) / 400;
        const dishRad = Math.sqrt(u) * 0.58;
        const dishAng = rand() * Math.PI * 2;
        x = Math.cos(dishAng) * dishRad;
        y = Math.sin(dishAng) * dishRad;
        z = 0.45 + Math.pow(dishRad / 0.58, 2) * 0.35 + (u < 0.08 ? 0.38 : 0);
      } else if (i < 1700) {
        const side = i % 2 === 0 ? -1 : 1;
        const wingProg = Math.floor((i - 850) / 2) / 425;
        x = side * (0.55 + wingProg * 1.75);
        y = ((i % 11) / 10 - 0.5) * 0.72;
        z = (rand() - 0.5) * 0.05;
      } else {
        const v = (i - 1700) / 100;
        x = 0;
        y = 0.48 + v * 1.05;
        z = 0;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 9: 3D Neural Cortex
  function buildNeuralCortex(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1350) {
        const side = i % 2 === 0 ? -1 : 1;
        const u = Math.floor(i / 2) / 675;
        const theta = Math.acos(Math.max(-1, Math.min(1, 2 * u - 1)));
        const phi = rand() * Math.PI * 2;
        const fold = 0.13 * Math.sin(theta * 8) * Math.cos(phi * 7);
        const r = 0.92 + fold;
        x = side * (0.16 + Math.abs(Math.sin(theta) * Math.cos(phi) * r * 0.85));
        y = 0.12 + Math.cos(theta) * r * 0.95;
        z = Math.sin(theta) * Math.sin(phi) * r * 0.85;
      } else {
        const theta = rand() * Math.PI * 2;
        const r = Math.pow(rand(), 0.6) * 0.45;
        x = (rand() - 0.5) * 0.45;
        y = 0.10 + Math.sin(theta) * r * 0.65;
        z = Math.cos(theta) * r;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 10: Planetary Data Network
  function buildPlanetaryNetwork(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1050) {
        const isLat = i < 550;
        const radius = 1.16;
        if (isLat) {
          const latAngle = (((i % 7) - 3) / 3.5) * (Math.PI * 0.42);
          const longAng = rand() * Math.PI * 2;
          x = radius * Math.cos(latAngle) * Math.cos(longAng);
          y = radius * Math.sin(latAngle);
          z = radius * Math.cos(latAngle) * Math.sin(longAng);
        } else {
          const merAngle = (((i - 550) % 8) / 8) * Math.PI;
          const theta = rand() * Math.PI * 2;
          x = Math.cos(theta) * radius * Math.cos(merAngle);
          y = Math.sin(theta) * radius;
          z = Math.cos(theta) * radius * Math.sin(merAngle);
        }
      } else if (i < 1600) {
        const orbitIdx = (i - 1050) % 2;
        const orbitRadius = 1.66 + (rand() - 0.5) * 0.08;
        const ang = rand() * Math.PI * 2;
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
        const rx = Math.cos(nodeAngle) * 1.66;
        const rz = Math.sin(nodeAngle) * 1.66;
        x = rx * Math.cos(tilt) + (rand() - 0.5) * 0.15;
        y = rx * Math.sin(tilt) + (rand() - 0.5) * 0.15;
        z = rz + (rand() - 0.5) * 0.15;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 11: Mobius Strip Infinity Loop
  function buildMobiusStrip(arr) {
    for (let i = 0; i < BASE_COUNT; i++) {
      const u = (i / BASE_COUNT) * Math.PI * 2;
      const v = ((i % 15) / 14 - 0.5) * 0.65;
      const x = (1.42 + (v / 2) * Math.cos(u / 2)) * Math.cos(u);
      const y = (1.42 + (v / 2) * Math.cos(u / 2)) * Math.sin(u);
      const z = (v / 2) * Math.sin(u / 2);
      arr[i * 3] = x;
      arr[i * 3 + 1] = y * 0.65;
      arr[i * 3 + 2] = z * 2.2;
    }
  }

  // 12: Quantum Processor Core
  function buildQuantumProcessor(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 600) {
        const ringIdx = i % 4;
        const r = 0.35 + ringIdx * 0.25;
        const ang = rand() * Math.PI * 2;
        x = Math.cos(ang) * r;
        y = Math.sin(ang) * r;
        z = (rand() - 0.5) * 0.08;
      } else if (i < 1300) {
        const traceIdx = (i - 600) % 8;
        const tAngle = (traceIdx / 8) * Math.PI * 2;
        const prog = ((i - 600) / 700) * 1.25;
        x = Math.cos(tAngle) * (0.45 + prog);
        y = Math.sin(tAngle) * (0.45 + prog);
        z = (rand() - 0.5) * 0.04;
      } else {
        const pinIdx = (i - 1300) % 4;
        const sideProg = ((i - 1300) / 500) * 2 - 1;
        const s = 1.62;
        if (pinIdx === 0) { x = sideProg * s; y = s; }
        else if (pinIdx === 1) { x = s; y = sideProg * s; }
        else if (pinIdx === 2) { x = sideProg * s; y = -s; }
        else { x = -s; y = sideProg * s; }
        z = (rand() - 0.5) * 0.06;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 13: Cyber Dragon
  function buildCyberDragon(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 1300) {
        const t = i / 1300;
        const spineZ = -1.75 + t * 3.5;
        const spineX = Math.sin(t * Math.PI * 4) * 0.85;
        const spineY = Math.cos(t * Math.PI * 3) * 0.65;
        const girth = (1 - Math.abs(t - 0.5) * 1.4) * 0.28 + 0.08;
        const ang = rand() * Math.PI * 2;
        x = spineX + Math.cos(ang) * girth;
        y = spineY + Math.sin(ang) * girth;
        z = spineZ;
        if (i % 6 === 0) y += girth * 1.5;
      } else if (i < 1600) {
        const u = (i - 1300) / 300;
        x = (rand() - 0.5) * 0.35 * (1 - u * 0.5);
        y = 0.45 + (rand() - 0.5) * 0.32;
        z = 1.72 + u * 0.62;
        if (u < 0.25) {
          x = (i % 2 === 0 ? -1 : 1) * (0.35 + u * 1.5);
          y += 0.35 + u * 1.2;
          z -= u * 1.8;
        }
      } else {
        const legIdx = (i - 1600) % 4;
        const lProg = (i - 1600) / 200;
        const side = legIdx % 2 === 0 ? -1 : 1;
        const zPos = legIdx < 2 ? 0.65 : -0.65;
        x = side * (0.55 + lProg * 0.45);
        y = -0.45 - lProg * 0.45;
        z = zPos + (rand() - 0.5) * 0.15;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 14: Fibonacci Galaxy
  function buildFibonacciGalaxy(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 400) {
        const theta = rand() * Math.PI * 2;
        const r = Math.pow(rand(), 0.6) * 0.52;
        x = Math.cos(theta) * r;
        y = (rand() - 0.5) * 0.35 * (1 - r / 0.52);
        z = Math.sin(theta) * r;
      } else {
        const arm = i % 2;
        const u = (i - 400) / 1400;
        const theta = u * Math.PI * 5 + (arm === 1 ? Math.PI : 0);
        const r = 0.45 + Math.pow(u, 0.85) * 1.75;
        const jitter = (rand() - 0.5) * 0.24 * (0.3 + u);
        x = Math.cos(theta) * r + jitter;
        y = (rand() - 0.5) * 0.16 * (1 - u * 0.5);
        z = Math.sin(theta) * r + jitter;
      }
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
  }

  // 15: Hexacopter Drone
  function buildHexacopter(arr, rand) {
    for (let i = 0; i < BASE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      if (i < 400) {
        const theta = rand() * Math.PI * 2;
        const r = 0.38 * Math.sqrt(rand());
        x = Math.cos(theta) * r;
        y = (rand() - 0.5) * 0.18;
        z = Math.sin(theta) * r;
      } else if (i < 1600) {
        const armIdx = (i - 400) % 6;
        const armAng = (armIdx / 6) * Math.PI * 2;
        const armProg = Math.floor((i - 400) / 6) / 200;
        if (armProg < 0.4) {
          const dist = 0.35 + (armProg / 0.4) * 1.35;
          x = Math.cos(armAng) * dist;
          y = 0.05;
          z = Math.sin(armAng) * dist;
        } else {
          const motorX = Math.cos(armAng) * 1.70;
          const motorZ = Math.sin(armAng) * 1.70;
          const discAng = rand() * Math.PI * 2;
          const discR = 0.42 * Math.sqrt(rand());
          x = motorX + Math.cos(discAng) * discR;
          y = 0.12 + (rand() - 0.5) * 0.04;
          z = motorZ + Math.sin(discAng) * discR;
        }
      } else {
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

  // Optimal default tilt per formation so flat shapes (Galaxy, Singularity, Hexacopter)
  // always showcase rich 3D depth instead of collapsing edge-on
  const FORMATIONS = [
    { name: '4D Tesseract', gen: buildTesseract, tiltX: 0.34, tiltY: 0.48 },
    { name: 'Singularity', gen: buildSingularity, tiltX: 0.52, tiltY: 0.25 },
    { name: 'Cyber Hand', gen: buildCyberHand, tiltX: 0.18, tiltY: -0.32 },
    { name: 'Cyber Skull', gen: buildCyberSkull, tiltX: 0.14, tiltY: -0.28 },
    { name: 'Hypercar', gen: buildHypercar, tiltX: 0.36, tiltY: -0.75 },
    { name: 'Soaring Eagle', gen: buildCyberEagle, tiltX: 0.44, tiltY: -0.42 },
    { name: 'Cheetah', gen: buildCyberCheetah, tiltX: 0.22, tiltY: -0.85 },
    { name: 'DNA Double Helix', gen: buildDNAHelix, tiltX: 0.20, tiltY: 0.30 },
    { name: 'Orbital Satellite', gen: buildOrbitalSatellite, tiltX: 0.38, tiltY: -0.48 },
    { name: 'Neural Cortex', gen: buildNeuralCortex, tiltX: 0.24, tiltY: 0.40 },
    { name: 'Planetary Network', gen: buildPlanetaryNetwork, tiltX: 0.30, tiltY: 0.25 },
    { name: 'Mobius Strip', gen: buildMobiusStrip, tiltX: 0.46, tiltY: 0.32 },
    { name: 'Quantum Processor', gen: buildQuantumProcessor, tiltX: 0.48, tiltY: 0.28 },
    { name: 'Cyber Dragon', gen: buildCyberDragon, tiltX: 0.30, tiltY: -0.62 },
    { name: 'Fibonacci Galaxy', gen: buildFibonacciGalaxy, tiltX: 0.68, tiltY: 0.22 },
    { name: 'Hexacopter Drone', gen: buildHexacopter, tiltX: 0.58, tiltY: 0.25 }
  ];

  const targetArraysCache = new Array(FORMATIONS.length);
  function getTargetArray(idx) {
    if (!targetArraysCache[idx]) {
      const arr = new Float32Array(PARTICLE_COUNT * 3);
      const rand = makeRng(4201 + idx * 97);
      FORMATIONS[idx].gen(arr, rand);

      // Keep subtle tight aura dots close to the sculpture edges so silhouettes stay crisp
      for (let i = BASE_COUNT; i < PARTICLE_COUNT; i++) {
        const srcIdx = Math.floor(rand() * BASE_COUNT) * 3;
        const spread = 0.03 + rand() * 0.09;
        const ang1 = rand() * Math.PI * 2;
        const ang2 = (rand() - 0.5) * Math.PI;
        arr[i * 3] = arr[srcIdx] + Math.cos(ang1) * Math.cos(ang2) * spread;
        arr[i * 3 + 1] = arr[srcIdx + 1] + Math.sin(ang2) * spread;
        arr[i * 3 + 2] = arr[srcIdx + 2] + Math.sin(ang1) * Math.cos(ang2) * spread;
      }
      targetArraysCache[idx] = arr;
    }
    return targetArraysCache[idx];
  }

  // ── 5. Stipple Ink & Gold Particle Cloud (Custom ShaderMaterial) ────────
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const energies = new Float32Array(PARTICLE_COUNT);
  const particleStreamIndex = new Float32Array(PARTICLE_COUNT);
  const particleRadialBias = new Float32Array(PARTICLE_COUNT);

  const stippleRand = makeRng(9001);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    phases[i] = stippleRand() * Math.PI * 2;
    particleStreamIndex[i] = i / PARTICLE_COUNT;
    particleRadialBias[i] = (stippleRand() - 0.5) * 2.0;

    // 72% Obsidian / Charcoal Ink · 20% Warm Amber / Gold · 8% Burnt Terracotta
    const roll = stippleRand();
    if (roll < 0.72) {
      const shade = 0.06 + stippleRand() * 0.12;
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade * 0.96;
      colors[i * 3 + 2] = shade * 0.92;
      sizes[i] = 0.58 + stippleRand() * 0.48;
    } else if (roll < 0.92) {
      // Warm Amber / Radiant Gold
      const goldMix = stippleRand();
      colors[i * 3] = 0.85 + goldMix * 0.13;
      colors[i * 3 + 1] = 0.47 + goldMix * 0.24;
      colors[i * 3 + 2] = 0.03 + goldMix * 0.08;
      sizes[i] = 0.65 + stippleRand() * 0.55;
    } else {
      // Terracotta / Rust Copper
      colors[i * 3] = 0.76;
      colors[i * 3 + 1] = 0.26;
      colors[i * 3 + 2] = 0.06;
      sizes[i] = 0.60 + stippleRand() * 0.50;
    }
  }

  let currentIdx = 0; // Start on the iconic 4D Tesseract silhouette
  const sourcePositions = new Float32Array(getTargetArray(currentIdx));
  const targetPositions = new Float32Array(getTargetArray(currentIdx));
  positions.set(targetPositions);

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  particleGeometry.setAttribute('aEnergy', new THREE.BufferAttribute(energies, 1));

  const particleUniforms = {
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uPointScale: { value: 26.0 },
    uTextFadeX: { value: -1.6 }
  };

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aEnergy;
      uniform float uPixelRatio;
      uniform float uPointScale;
      uniform float uTextFadeX;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        // Warm particles subtly toward radiant amber-gold when surging in the fluid swirl
        vec3 moltenGold = vec3(0.95, 0.61, 0.05);
        vColor = mix(aColor, moltenGold, clamp(aEnergy * 0.58, 0.0, 0.65));

        // Gently keep left-bleeding particles delicate over typography
        float leftSoft = smoothstep(-5.8, uTextFadeX, position.x);
        vAlpha = mix(0.68, 0.96, leftSoft);

        float dist = max(1.5, -mvPosition.z);
        gl_PointSize = aSize * uPixelRatio * uPointScale * (1.0 + aEnergy * 0.35) / dist;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float circle = 1.0 - smoothstep(0.32, 0.50, d);
        if (circle < 0.02) discard;
        gl_FragColor = vec4(vColor, circle * vAlpha);
      }
    `
  });

  const stippleCloud = new THREE.Points(particleGeometry, particleMaterial);
  sculptureGroup.add(stippleCloud);

  // ── 6. 3D Low-Poly Geometric Shards / Pebbles (InstancedMesh, 3 Draw Calls) ──
  const SHARD_TYPES = [
    new THREE.DodecahedronGeometry(0.115, 0),
    new THREE.OctahedronGeometry(0.11, 0),
    new THREE.TetrahedronGeometry(0.125, 0)
  ];
  const SHARDS_PER_TYPE = 24;
  const TOTAL_SHARDS = SHARDS_PER_TYPE * SHARD_TYPES.length; // 72 faceted shards

  const shardMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.34,
    metalness: 0.28,
    flatShading: true
  });

  const shardMeshes = SHARD_TYPES.map((geom) => {
    const inst = new THREE.InstancedMesh(geom, shardMaterial, SHARDS_PER_TYPE);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sculptureGroup.add(inst);
    return inst;
  });

  const shardPalette = [
    new THREE.Color(0x18181b), // Matte Obsidian
    new THREE.Color(0x1c1917), // Warm Obsidian
    new THREE.Color(0x292524), // Charcoal
    new THREE.Color(0xd97706), // Warm Amber
    new THREE.Color(0xf59e0b)  // Radiant Gold
  ];

  const shardMeta = [];
  const shardRand = makeRng(7711);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < TOTAL_SHARDS; i++) {
    const typeIdx = Math.floor(i / SHARDS_PER_TYPE);
    const localIdx = i % SHARDS_PER_TYPE;

    // Bias ~62% Matte Obsidian/Charcoal and ~38% Warm Amber/Gold
    const cPick = shardRand();
    const color =
      cPick < 0.62
        ? shardPalette[Math.floor(shardRand() * 3)]
        : shardPalette[3 + Math.floor(shardRand() * 2)];
    shardMeshes[typeIdx].setColorAt(localIdx, color);

    const isHaloOrbiter = i % 6 === 0; // ~12 delicate outer orbiters at rest; all 72 erupt on swirl
    shardMeta.push({
      typeIdx,
      localIdx,
      anchorParticle: Math.floor((i / TOTAL_SHARDS) * BASE_COUNT),
      restScale: isHaloOrbiter ? 0.09 + shardRand() * 0.05 : 0.001,
      swirlScale: 0.60 + shardRand() * 0.55,
      isHaloOrbiter,
      orbitRadius: 1.50 + shardRand() * 0.65,
      orbitSpeed: (0.28 + shardRand() * 0.35) * (i % 2 === 0 ? 1 : -1),
      orbitTilt: (shardRand() - 0.5) * 1.1,
      phase: shardRand() * Math.PI * 2,
      streamT: i / TOTAL_SHARDS,
      radialSpread: (shardRand() - 0.5) * 1.1,
      spinRate: new THREE.Vector3(
        (shardRand() - 0.5) * 0.04,
        (shardRand() - 0.5) * 0.05,
        (shardRand() - 0.5) * 0.04
      ),
      rot: new THREE.Euler(shardRand() * 6, shardRand() * 6, shardRand() * 6)
    });
  }
  shardMeshes.forEach((m) => {
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  // ── 7. Calligraphic Liquid-Gold Fluid Swirl Ribbons (World-Space Sweep) ──
  // Placed directly in `scene` so they sweep smoothly from right shape across left hero text
  const ribbonGroup = new THREE.Group();
  scene.add(ribbonGroup);

  const RIBBON_SEGMENTS = 96;
  const RIBBON_CONFIGS = [
    { width: 0.28, colorA: 0xd97706, colorB: 0xfde68a, opacity: 0.68, speed: 1.0, phase: 0.0, arcOffset: 0.0 },
    { width: 0.16, colorA: 0x92400e, colorB: 0xf59e0b, opacity: 0.78, speed: 1.12, phase: 0.55, arcOffset: 0.24 },
    { width: 0.08, colorA: 0xf59e0b, colorB: 0xfffbeb, opacity: 0.85, speed: 1.24, phase: 1.15, arcOffset: -0.18 },
    { width: 0.12, colorA: 0x451a03, colorB: 0xb45309, opacity: 0.58, speed: 0.92, phase: 2.10, arcOffset: 0.36 }
  ];

  const ribbons = RIBBON_CONFIGS.map((cfg) => {
    const vertCount = (RIBBON_SEGMENTS + 1) * 2;
    const pos = new Float32Array(vertCount * 3);
    const uvs = new Float32Array(vertCount * 2);
    const indices = [];

    for (let i = 0; i <= RIBBON_SEGMENTS; i++) {
      const u = i / RIBBON_SEGMENTS;
      uvs[i * 4] = u;
      uvs[i * 4 + 1] = 0;
      uvs[i * 4 + 2] = u;
      uvs[i * 4 + 3] = 1;
      if (i < RIBBON_SEGMENTS) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(indices);

    const uniforms = {
      uColorA: { value: new THREE.Color(cfg.colorA) },
      uColorB: { value: new THREE.Color(cfg.colorB) },
      uOpacity: { value: cfg.opacity },
      uEnvelope: { value: 0.0 },
      uTime: { value: 0.0 }
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uOpacity;
        uniform float uEnvelope;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          // Silky cross-section & tapered ends
          float across = sin(vUv.y * 3.14159265);
          float along = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.80, vUv.x);
          float shimmer = 0.5 + 0.5 * sin(vUv.x * 16.0 - uTime * 4.5);
          float coreHighlight = pow(across, 2.2) * (0.45 + 0.55 * shimmer);

          vec3 col = mix(uColorA, uColorB, clamp(coreHighlight, 0.0, 1.0));
          float alpha = pow(across, 0.85) * along * uOpacity * uEnvelope;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.frustumCulled = false;
    ribbonGroup.add(mesh);
    return { cfg, geom, pos, mat, uniforms, mesh };
  });

  // Scratch vectors to avoid any per-frame heap allocations
  const _p0 = new THREE.Vector3();
  const _p1 = new THREE.Vector3();
  const _tangent = new THREE.Vector3();
  const _forward = new THREE.Vector3(0, 0, 1);
  const _side = new THREE.Vector3();

  let isDesktopStage = window.innerWidth > 960;

  /**
   * Evaluates a 3D calligraphic vortex curve:
   * - On Desktop: gracefully arcs leftward behind the hero headline crest (without dumping heavy elements low over CTAs)
   * - On Mobile (`compactMode`): stays strictly symmetrical around (0, 0, 0) in a concentric 3D spiral
   */
  function evalSwirlCurve(u, swirlProg, phaseAdvance, offsetAngle, spread, compactMode, maxLeftShift, outVec) {
    const clampedProg = Math.min(1, Math.max(0, swirlProg));
    const sweepBell = Math.sin(clampedProg * Math.PI);
    const sAngle = u * Math.PI * 2.2 + phaseAdvance * Math.PI * 2.6 + offsetAngle;

    if (compactMode) {
      // Strictly centered symmetrical 3D orbital vortex for mobile portrait viewport
      const rad = (0.75 + 0.85 * Math.sin(u * Math.PI) + spread * 0.22) * (0.45 + 0.65 * sweepBell);
      const x = Math.cos(sAngle) * rad;
      const y = Math.sin(sAngle) * rad * 0.78 + Math.cos(u * Math.PI * 3.0 + offsetAngle) * 0.24 * sweepBell;
      const z = Math.sin(sAngle * 0.85 + u * Math.PI) * (0.82 + Math.abs(spread) * 0.18);
      outVec.set(x, y, z);
      return outVec;
    }

    const reachLeft = maxLeftShift;
    const arcFactor = Math.sin(u * Math.PI);
    const sweepX = -reachLeft * sweepBell * Math.pow(arcFactor, 0.85);
    const curlX = Math.cos(sAngle) * (0.78 + spread * 0.18) * (0.52 + 0.48 * sweepBell);

    const x = sweepX + curlX;
    // Gently elevate left-reaching arcs into clean airspace above lower subheadlines
    const archY = Math.pow(arcFactor, 0.9) * sweepBell * 0.72;
    const y =
      archY +
      Math.sin(sAngle * 1.05) * (0.64 + spread * 0.16) +
      Math.sin(u * Math.PI * 2.0 + offsetAngle) * 0.24;
    const z = Math.sin(sAngle * 0.9) * (0.85 + Math.abs(spread) * 0.16);

    outVec.set(x, y, z);
    return outVec;
  }

  // ── 8. Synchronized Name Chromatic Loop Engine ───────────────────────────
  const heroNameEl = document.getElementById('hero-name-primary');
  const hnpFullName = heroNameEl ? heroNameEl.querySelector('.hnp-full-name') : null;

  const NAME_PALETTES = [
    { first: '#121212', wave: '#F59E0B', accent: '#D97706', peak: '#FBBF24', glow: 'rgba(245, 158, 11, 0.28)' },
    { first: '#1E1B4B', wave: '#EA580C', accent: '#C2410C', peak: '#F59E0B', glow: 'rgba(194, 65, 12, 0.28)' },
    { first: '#1C1917', wave: '#D97706', accent: '#B45309', peak: '#FDE047', glow: 'rgba(217, 119, 6, 0.32)' },
    { first: '#0F172A', wave: '#F59E0B', accent: '#EA580C', peak: '#FCD34D', glow: 'rgba(234, 88, 12, 0.28)' },
    { first: '#292524', wave: '#FBBF24', accent: '#D97706', peak: '#EA580C', glow: 'rgba(245, 158, 11, 0.34)' }
  ];

  let paletteIdx = 0;

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function lerpHex(hexA, hexB, t) {
    const [r1, g1, b1] = hexToRgb(hexA);
    const [r2, g2, b2] = hexToRgb(hexB);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  let lastChromaticKey = '';
  function updateNameChromaticSync(loopMix, waveProgress, isSwirlingNow) {
    if (!heroNameEl) return;
    const key = isSwirlingNow ? `swirl_${waveProgress.toFixed(2)}` : `hold_${paletteIdx}`;
    if (key === lastChromaticKey) return;
    lastChromaticKey = key;

    const curr = NAME_PALETTES[paletteIdx % NAME_PALETTES.length];
    const next = NAME_PALETTES[(paletteIdx + 1) % NAME_PALETTES.length];

    // Smoothly recolor base first/accent colors as loop finishes transitioning
    const recolorT = Math.min(1, Math.max(0, loopMix));
    const heat = isSwirlingNow ? Math.sin(waveProgress * Math.PI) : 0;

    // During peak swirl sweep, warm "Muhammad Asad" into rich bronze-amber so it visibly catches the wave
    const blendedFirstBase = lerpHex(curr.first, next.first, recolorT);
    const firstDuringHeat = lerpHex(curr.first, '#92400E', heat * 0.72);
    const finalFirst = heat > 0.02 && recolorT < 0.7 ? firstDuringHeat : blendedFirstBase;

    const finalAccent = lerpHex(curr.accent, next.accent, recolorT);
    const finalWave = lerpHex(curr.wave, next.wave, recolorT);
    const finalPeak = lerpHex(curr.peak, next.peak, recolorT);

    // Wave sweeps from right (135%) -> across letters (50%) -> left (-45%)
    const wavePos = isSwirlingNow ? 135 - waveProgress * 180 : 135;

    heroNameEl.style.setProperty('--name-first-color', finalFirst);
    heroNameEl.style.setProperty('--name-accent-color', finalAccent);
    heroNameEl.style.setProperty('--name-wave-color', finalWave);
    heroNameEl.style.setProperty('--name-accent-peak', finalPeak);
    heroNameEl.style.setProperty('--name-glow-color', next.glow);
    heroNameEl.style.setProperty('--name-wave-pos', `${wavePos.toFixed(1)}%`);
  }

  // ── 9. Morph & Loop State Machine ───────────────────────────────────────
  // Phase timeline (7.4s total per formation -> swirl -> next formation):
  //   'HOLD'     (3.5s) -> crisp shape rotating gently
  //   'SWIRL'    (3.2s) -> dissolve + golden vortex sweep across hero + converge into next shape
  const HOLD_DURATION = prefersReducedMotion ? 7000 : 5200;
  const MORPH_DURATION = prefersReducedMotion ? 1400 : 3200;

  let phaseState = 'HOLD';
  let stateStartTime = performance.now();
  let lastFrameTime = performance.now();
  let targetTilt = {
    x: FORMATIONS[currentIdx].tiltX,
    y: FORMATIONS[currentIdx].tiltY
  };
  let currentTilt = { ...targetTilt };

  function smoothStep(t) {
    const c = Math.min(1, Math.max(0, t));
    return c * c * (3 - 2 * c);
  }

  function triggerSwirlMorph() {
    if (phaseState === 'SWIRL') return;

    let nextIdx = (currentIdx + 1 + Math.floor(Math.random() * (FORMATIONS.length - 1))) % FORMATIONS.length;
    if (nextIdx === currentIdx) nextIdx = (currentIdx + 1) % FORMATIONS.length;

    const posArr = particleGeometry.attributes.position.array;
    sourcePositions.set(posArr);
    currentIdx = nextIdx;
    targetPositions.set(getTargetArray(currentIdx));

    targetTilt.x = FORMATIONS[currentIdx].tiltX;
    targetTilt.y = FORMATIONS[currentIdx].tiltY;

    phaseState = 'SWIRL';
    stateStartTime = performance.now();

    if (hnpFullName) {
      hnpFullName.classList.remove('loop-pulse');
      void hnpFullName.offsetWidth;
      hnpFullName.classList.add('loop-pulse');
    }
  }

  // ── 10. Interactive Drag-to-Rotate + Click-to-Morph (Desktop Fine Pointer Only) ─
  // Disabled on mobile/touch viewports so vertical scrolling over the graphic never locks or shifts axis.
  let isDragging = false;
  let dragDistance = 0;
  let prevPointer = { x: 0, y: 0 };
  let hoverOffset = { x: 0, y: 0 };
  let userSpin = { x: 0, y: 0 };

  function isMobileAxisLocked(e) {
    if (window.innerWidth <= 960) return true;
    if (e && e.pointerType === 'touch') return true;
    return Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }

  anchorEl.addEventListener('pointerdown', (e) => {
    if (isMobileAxisLocked(e)) return;
    isDragging = true;
    dragDistance = 0;
    prevPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener(
    'pointermove',
    (e) => {
      if (isMobileAxisLocked(e)) {
        isDragging = false;
        hoverOffset.x = 0;
        hoverOffset.y = 0;
        return;
      }
      if (isDragging) {
        const dx = e.clientX - prevPointer.x;
        const dy = e.clientY - prevPointer.y;
        dragDistance += Math.abs(dx) + Math.abs(dy);
        userSpin.y += dx * 0.0065;
        userSpin.x += dy * 0.0065;
        prevPointer = { x: e.clientX, y: e.clientY };
      } else {
        const rect = anchorEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          hoverOffset.y = Math.max(-1, Math.min(1, mx)) * 0.28;
          hoverOffset.x = Math.max(-1, Math.min(1, -my)) * 0.18;
        }
      }
    },
    { passive: true }
  );

  window.addEventListener('pointerup', (e) => {
    if (isMobileAxisLocked(e)) {
      isDragging = false;
      return;
    }
    if (isDragging && dragDistance < 8) {
      // Short click on desktop triggers the golden swirl morph
      triggerSwirlMorph();
    }
    isDragging = false;
  });

  // ── 11. Optical Projection Offset & Responsive Viewport Calibration ──────
  function updateViewportCalibration() {
    width = stageWrap.clientWidth || anchorEl.clientWidth || 560;
    height = stageWrap.clientHeight || anchorEl.clientHeight || 480;
    isDesktopStage = window.innerWidth > 960;

    if (width < 480) {
      camera.position.z = 6.0;
      particleUniforms.uPointScale.value = 14.5;
    } else if (width < 960) {
      camera.position.z = 6.25;
      particleUniforms.uPointScale.value = 15.5;
    } else {
      camera.position.z = 6.45;
      particleUniforms.uPointScale.value = 16.5;
    }

    // Center camera frustum optically on #hero-matrix-card (right column)
    // while allowing desktop canvas to extend freely leftward over the name!
    const anchorRect = anchorEl.getBoundingClientRect();
    const stageRect = stageWrap.getBoundingClientRect();

    if (isDesktopStage && stageRect.width > anchorRect.width + 20) {
      const dx =
        anchorRect.left + anchorRect.width * 0.5 - (stageRect.left + stageRect.width * 0.5);
      const dy =
        anchorRect.top + anchorRect.height * 0.5 - (stageRect.top + stageRect.height * 0.5);
      camera.setViewOffset(width, height, -dx, -dy, width, height);
    } else {
      camera.clearViewOffset();
      camera.aspect = width / height;
    }

    camera.updateProjectionMatrix();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    particleUniforms.uPixelRatio.value = dpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    cachedHeroHeight = (heroSection && heroSection.offsetHeight) || 720;
    if (window.innerWidth <= 960) {
      isDragging = false;
      hoverOffset.x = 0;
      hoverOffset.y = 0;
      userSpin.x = 0;
    }
  }

  let cachedHeroHeight = (heroSection && heroSection.offsetHeight) || 720;

  window.addEventListener('resize', updateViewportCalibration, { passive: true });
  // Run once synchronously + once next frame after fonts/grid settle
  updateViewportCalibration();
  requestAnimationFrame(updateViewportCalibration);

  // ── 12. Off-Screen Visibility Pause (IntersectionObserver) & Scroll Morph ─
  let isVisible = true;
  let animationFrameId = null;
  const engineStartTime = performance.now();
  let scrollMorphProgress = 0; // 0 inside hero top -> 1 leaving hero bottom
  let scrollDirection = 1;
  let lastHeroScrollY = window.scrollY || 0;
  let wasBelowHero = false;

  // Zero-reflow direction-aware scroll link (uses cachedHeroHeight, no layout reads on scroll)
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY || window.pageYOffset || 0;
      scrollDirection = y >= lastHeroScrollY ? 1 : -1;
      lastHeroScrollY = y;
      scrollMorphProgress = Math.max(0, Math.min(1, y / Math.max(360, cachedHeroHeight * 0.85)));

      if (scrollMorphProgress > 0.72) {
        wasBelowHero = true;
      } else if (wasBelowHero && scrollDirection < 0 && scrollMorphProgress < 0.42) {
        wasBelowHero = false;
        triggerSwirlMorph();
      }
    },
    { passive: true }
  );

  if ('IntersectionObserver' in window && heroSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        const wasVisible = isVisible;
        isVisible = entries[0].isIntersecting;
        if (isVisible && (!animationFrameId || !wasVisible)) {
          lastFrameTime = performance.now();
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
          }
        }
      },
      { threshold: 0, rootMargin: '250px 0px 250px 0px' }
    );
    observer.observe(heroSection);
  }

  // ── 13. 60 FPS Render Loop ─────────────────────────────────────────────
  function animate(now) {
    if (!isVisible || document.hidden) {
      animationFrameId = null;
      return;
    }
    animationFrameId = requestAnimationFrame(animate);

    const elapsed = (now - engineStartTime) * 0.001;
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    // Gentle autonomous rotation & smooth tilt interpolation toward active shape
    if (!isDragging && !prefersReducedMotion) {
      userSpin.y += dt * (0.22 + scrollMorphProgress * 0.35 * scrollDirection);
      userSpin.x *= 0.96;
    }

    currentTilt.x += (targetTilt.x + userSpin.x + hoverOffset.x - currentTilt.x) * 0.06;
    currentTilt.y += (targetTilt.y + userSpin.y + hoverOffset.y - currentTilt.y) * 0.06;

    sculptureGroup.rotation.x = currentTilt.x;
    sculptureGroup.rotation.y = currentTilt.y;
    const scaleScroll = 1.0 - scrollMorphProgress * 0.14;
    sculptureGroup.scale.setScalar(scaleScroll);
    sculptureGroup.position.y = Math.sin(elapsed * 1.35) * 0.045 - scrollMorphProgress * 0.35;
    sculptureGroup.updateMatrixWorld(true);

    const posArr = particleGeometry.attributes.position.array;
    const energyArr = particleGeometry.attributes.aEnergy.array;
    const stateElapsed = now - stateStartTime;

    let swirlEnvelope = 0.0;
    let swirlProg = 0.0;

    if (phaseState === 'HOLD') {
      // Gentle living stipple breathe around the active mathematical formation
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const p = phases[i] + elapsed * 1.9;
        const amp = i < BASE_COUNT ? 0.009 : 0.022;
        posArr[idx] = targetPositions[idx] + Math.sin(p) * amp;
        posArr[idx + 1] = targetPositions[idx + 1] + Math.cos(p * 1.13) * amp;
        posArr[idx + 2] = targetPositions[idx + 2] + Math.sin(p * 0.87) * amp;
        energyArr[i] = Math.max(0, energyArr[i] - dt * 2.5);
      }

      // Shards nestle delicately along formation vertices + halo orbiters
      for (let k = 0; k < TOTAL_SHARDS; k++) {
        const m = shardMeta[k];
        if (m.isHaloOrbiter) {
          const ang = elapsed * m.orbitSpeed + m.phase;
          dummy.position.set(
            Math.cos(ang) * m.orbitRadius,
            Math.sin(ang * 0.8) * 0.7 + m.orbitTilt * 0.4,
            Math.sin(ang) * m.orbitRadius * 0.78
          );
        } else {
          const aIdx = m.anchorParticle * 3;
          dummy.position.set(
            posArr[aIdx] + Math.cos(m.phase) * 0.06,
            posArr[aIdx + 1] + Math.sin(m.phase) * 0.06,
            posArr[aIdx + 2] + Math.sin(m.phase * 1.3) * 0.06
          );
        }
        m.rot.x += m.spinRate.x * 0.6;
        m.rot.y += m.spinRate.y * 0.6;
        dummy.rotation.copy(m.rot);
        dummy.scale.setScalar(m.restScale);
        dummy.updateMatrix();
        shardMeshes[m.typeIdx].setMatrixAt(m.localIdx, dummy.matrix);
      }

      updateNameChromaticSync(0.0, 0.0, false);

      if (stateElapsed >= HOLD_DURATION) {
        triggerSwirlMorph();
      }
    } else {
      // PHASE: 'SWIRL' (dissolve -> calligraphic vortex sweep -> converge into next shape)
      swirlProg = Math.min(1.0, stateElapsed / MORPH_DURATION);
      const compactMode = !isDesktopStage;

      // Smooth bell-curve influence: 0 at edges, peaks during middle sweep across hero
      swirlEnvelope = Math.sin(swirlProg * Math.PI);
      const vortexPull = Math.pow(swirlEnvelope, 0.82);

      // Update world-space transform inverse approximation: swirl coordinates live in local sculptural space
      // biased toward desktop left sweep by rotating counter-y back subtly during peak swirl
      const shapeBlend = smoothStep((swirlProg - 0.35) / 0.65);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const baseBlendX =
          sourcePositions[idx] + (targetPositions[idx] - sourcePositions[idx]) * shapeBlend;
        const baseBlendY =
          sourcePositions[idx + 1] +
          (targetPositions[idx + 1] - sourcePositions[idx + 1]) * shapeBlend;
        const baseBlendZ =
          sourcePositions[idx + 2] +
          (targetPositions[idx + 2] - sourcePositions[idx + 2]) * shapeBlend;

        // Compute sweeping calligraphic stream coordinate in camera-aligned world space
        const streamU = (particleStreamIndex[i] + swirlProg * 0.9) % 1.0;
        evalSwirlCurve(
          streamU,
          swirlProg,
          swirlProg,
          phases[i] * 0.16,
          particleRadialBias[i],
          compactMode,
          1.45,
          _p0
        );

        // Convert world sweep into local sculptureGroup space cleanly so leftward sweep frames the gap without muddying left text
        sculptureGroup.worldToLocal(_p0);

        const localPull = Math.min(
          1,
          vortexPull * (0.72 + 0.28 * Math.sin(phases[i] + swirlProg * 6.0))
        );

        posArr[idx] = baseBlendX + (_p0.x - baseBlendX) * localPull;
        posArr[idx + 1] = baseBlendY + (_p0.y - baseBlendY) * localPull;
        posArr[idx + 2] = baseBlendZ + (_p0.z - baseBlendZ) * localPull;
        energyArr[i] = localPull;
      }

      // Shards burst larger and surf along the liquid gold fluid wave
      for (let k = 0; k < TOTAL_SHARDS; k++) {
        const m = shardMeta[k];
        const aIdx = m.anchorParticle * 3;
        const anchorX =
          sourcePositions[aIdx] + (targetPositions[aIdx] - sourcePositions[aIdx]) * shapeBlend;
        const anchorY =
          sourcePositions[aIdx + 1] +
          (targetPositions[aIdx + 1] - sourcePositions[aIdx + 1]) * shapeBlend;
        const anchorZ =
          sourcePositions[aIdx + 2] +
          (targetPositions[aIdx + 2] - sourcePositions[aIdx + 2]) * shapeBlend;

        const streamU = (m.streamT + swirlProg * 1.1) % 1.0;
        evalSwirlCurve(
          streamU,
          swirlProg,
          swirlProg,
          m.phase * 0.22,
          m.radialSpread,
          compactMode,
          1.20,
          _p1
        );
        sculptureGroup.worldToLocal(_p1);

        const shardPull = Math.min(1, vortexPull * 1.05);
        dummy.position.set(
          anchorX + (_p1.x - anchorX) * shardPull,
          anchorY + (_p1.y - anchorY) * shardPull,
          anchorZ + (_p1.z - anchorZ) * shardPull
        );

        m.rot.x += m.spinRate.x * (1.0 + swirlEnvelope * 3.2);
        m.rot.y += m.spinRate.y * (1.0 + swirlEnvelope * 3.2);
        m.rot.z += m.spinRate.z * (1.0 + swirlEnvelope * 2.5);
        dummy.rotation.copy(m.rot);

        const sScale = m.restScale + (m.swirlScale - m.restScale) * swirlEnvelope;
        dummy.scale.setScalar(sScale);
        dummy.updateMatrix();
        shardMeshes[m.typeIdx].setMatrixAt(m.localIdx, dummy.matrix);
      }

      // Synchronized chromatic wave sweeping through "Muhammad Asad Khan"
      updateNameChromaticSync(shapeBlend, swirlProg, true);

      if (swirlProg >= 1.0) {
        paletteIdx = (paletteIdx + 1) % NAME_PALETTES.length;
        updateNameChromaticSync(0.0, 0.0, false);
        phaseState = 'HOLD';
        stateStartTime = now;
      }
    }

    // Only upload buffer geometry to GPU when particles or shards are actually transitioning
    if (phaseState === 'SWIRL') {
      particleGeometry.attributes.position.needsUpdate = true;
      particleGeometry.attributes.aEnergy.needsUpdate = true;
      shardMeshes.forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
      });
    }

    // ── 14. Update Calligraphic Liquid-Gold Fluid Ribbons (Zero GC) ───────
    const compactMode = !isDesktopStage;
    for (let r = 0; r < ribbons.length; r++) {
      const rb = ribbons[r];
      rb.uniforms.uEnvelope.value = swirlEnvelope;
      rb.uniforms.uTime.value = elapsed;

      if (swirlEnvelope > 0.01) {
        rb.mesh.visible = true;
        const pos = rb.pos;
        const baseW = rb.cfg.width * (0.45 + 0.75 * swirlEnvelope);

        for (let i = 0; i <= RIBBON_SEGMENTS; i++) {
          const u = i / RIBBON_SEGMENTS;
          const uNext = Math.min(1, u + 0.012);

          evalSwirlCurve(
            u,
            swirlProg,
            swirlProg * rb.cfg.speed,
            rb.cfg.phase + Math.sin(u * 4.0) * 0.25,
            rb.cfg.arcOffset,
            compactMode,
            1.85,
            _p0
          );
          evalSwirlCurve(
            uNext,
            swirlProg,
            swirlProg * rb.cfg.speed,
            rb.cfg.phase + Math.sin(uNext * 4.0) * 0.25,
            rb.cfg.arcOffset,
            compactMode,
            1.85,
            _p1
          );

          _tangent.subVectors(_p1, _p0).normalize();
          // Smooth screen-space perpendicular avoids Frenet twisting pinches along 3D loops
          _side.set(-_tangent.y, _tangent.x, 0.18 * _tangent.z);
          if (_side.lengthSq() < 0.0005) _side.set(0, 1, 0);
          _side.normalize();

          // Organic calligraphic thickness modulation along ribbon length
          const taper = Math.sin(u * Math.PI) * (0.65 + 0.35 * Math.sin(u * 9.0 + elapsed * 3.0));
          const halfW = baseW * Math.max(0.02, taper);

          const vIdx = i * 6;
          pos[vIdx] = _p0.x - _side.x * halfW;
          pos[vIdx + 1] = _p0.y - _side.y * halfW;
          pos[vIdx + 2] = _p0.z - _side.z * halfW;

          pos[vIdx + 3] = _p0.x + _side.x * halfW;
          pos[vIdx + 4] = _p0.y + _side.y * halfW;
          pos[vIdx + 5] = _p0.z + _side.z * halfW;
        }
        rb.geom.attributes.position.needsUpdate = true;
      } else {
        rb.mesh.visible = false;
      }
    }

    renderer.render(scene, camera);
  }

  // Paint initial frame immediately
  animationFrameId = requestAnimationFrame(animate);

  return function cleanup() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', updateViewportCalibration);
    renderer.dispose();
  };
}
