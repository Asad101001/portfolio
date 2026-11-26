/**
 * js/modules/matrix-hero.js
 * Sculptural 3D Geometric Space & Fluid Swirl Engine (Three.js WebGL)
 *
 * Design & Visual Features:
 * - Seamless open stage directly over the warm paper canvas (#F7F6F3)
 * - 32 Floating sculptural 3D low-poly geometries & pebbles (Matte Obsidian, Warm Terracotta, Radiant Gold)
 * - Dynamic kinetic fluid ribbon & particle vortex spiraling in a continuous 3D loop
 * - Synchronized Name Chromatic Loop: Colors and recolors "Muhammad Asad Khan" as the 3D animation loops
 * - Inertial touch/mouse drag-to-rotate with smooth momentum damping
 */

import * as THREE from 'three';

export function initHeroMatrix() {
  const canvas = document.getElementById('hero-matrix-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  if (!container) return;

  let width = container.clientWidth || 550;
  let height = container.clientHeight || 460;

  // ── 1. Setup Three.js WebGL Scene, Camera & Renderer ──────────────────────
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0); // Pure transparent for paper canvas integration

  // ── 2. Natural Ambient & Directional Lighting for Sculptural Depth ─────────
  const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(4, 5, 4);
  scene.add(keyLight);

  const warmPointLight = new THREE.PointLight(0xf59e0b, 3.2, 14);
  warmPointLight.position.set(0, 0.5, 2.5);
  scene.add(warmPointLight);

  const rimLight = new THREE.DirectionalLight(0xfde68a, 1.4);
  rimLight.position.set(-4, -3, -2);
  scene.add(rimLight);

  // ── 3. Floating 3D Geometric Shapes & Sculptural Pebbles ───────────────────
  const shapesGroup = new THREE.Group();
  scene.add(shapesGroup);

  // Palette of materials matching the video aesthetic
  const materialObsidian = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.38,
    metalness: 0.18,
    flatShading: true
  });

  const materialAmber = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.42,
    metalness: 0.22,
    flatShading: true
  });

  const materialGold = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.28,
    metalness: 0.55,
    flatShading: true
  });

  const materialCharcoal = new THREE.MeshStandardMaterial({
    color: 0x292524,
    roughness: 0.48,
    metalness: 0.12,
    flatShading: true
  });

  const materialList = [materialObsidian, materialAmber, materialGold, materialCharcoal];

  // Geometries: Dodecahedrons, Icosahedrons, Octahedrons, Tetrahedrons, Rounded Chunks
  const geometryList = [
    new THREE.DodecahedronGeometry(0.38, 0),
    new THREE.IcosahedronGeometry(0.34, 0),
    new THREE.OctahedronGeometry(0.32, 0),
    new THREE.TetrahedronGeometry(0.35, 0),
    new THREE.DodecahedronGeometry(0.24, 1),
    new THREE.BoxGeometry(0.28, 0.28, 0.28)
  ];

  const SHAPE_COUNT = 34;
  const shapeData = [];

  for (let i = 0; i < SHAPE_COUNT; i++) {
    const geom = geometryList[i % geometryList.length];
    const mat = materialList[i % materialList.length];
    const mesh = new THREE.Mesh(geom, mat);

    // Distribution in a dynamic orbital shell around the center
    const u = i / SHAPE_COUNT;
    const angle = u * Math.PI * 2 * 3.5;
    const radius = 0.8 + Math.pow(Math.random(), 0.7) * 2.1;
    const elevation = (Math.random() - 0.5) * 2.6;

    const basePos = new THREE.Vector3(
      Math.cos(angle) * radius,
      elevation,
      Math.sin(angle) * radius * 0.85
    );

    const scale = 0.45 + Math.random() * 0.75;
    mesh.scale.set(scale, scale, scale);
    mesh.position.copy(basePos);

    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    shapesGroup.add(mesh);

    shapeData.push({
      mesh,
      basePos,
      scale,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.015
      ),
      floatFreq: 0.8 + Math.random() * 1.4,
      floatAmp: 0.12 + Math.random() * 0.18,
      orbitSpeed: (0.12 + Math.random() * 0.25) * (i % 2 === 0 ? 1 : -1),
      phase: Math.random() * Math.PI * 2
    });
  }

  // ── 4. Dynamic Kinetic Fluid Swirl (Particle Vortex & Silk Ribbon) ─────────
  // High-Definition Circular Sprite Texture for Smooth Blended Particles
  function createParticleTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');

    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(254, 240, 138, 0.9)');
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(pCanvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }
  const particleTexture = createParticleTexture();

  const VORTEX_PARTICLE_COUNT = 900;
  const vortexPositions = new Float32Array(VORTEX_PARTICLE_COUNT * 3);
  const vortexColors = new Float32Array(VORTEX_PARTICLE_COUNT * 3);
  const vortexSizes = new Float32Array(VORTEX_PARTICLE_COUNT);
  const vortexOffsets = new Float32Array(VORTEX_PARTICLE_COUNT);

  for (let i = 0; i < VORTEX_PARTICLE_COUNT; i++) {
    vortexOffsets[i] = (i / VORTEX_PARTICLE_COUNT) * Math.PI * 2 * 4; // Multiple spiral loops
    vortexSizes[i] = 0.08 + Math.random() * 0.14;

    // Palette: 60% Warm Golden Amber, 25% Terracotta, 15% Deep Charcoal specks
    const rType = i % 10;
    if (rType < 6) {
      // Warm Amber / Golden
      vortexColors[i * 3] = 0.96;
      vortexColors[i * 3 + 1] = 0.65 + Math.random() * 0.25;
      vortexColors[i * 3 + 2] = 0.08;
    } else if (rType < 8) {
      // Rich Terracotta / Sunset Coral
      vortexColors[i * 3] = 0.88;
      vortexColors[i * 3 + 1] = 0.28;
      vortexColors[i * 3 + 2] = 0.15;
    } else {
      // Obsidian Charcoal specks (contrast accents)
      vortexColors[i * 3] = 0.12;
      vortexColors[i * 3 + 1] = 0.11;
      vortexColors[i * 3 + 2] = 0.10;
    }
  }

  const vortexGeometry = new THREE.BufferGeometry();
  vortexGeometry.setAttribute('position', new THREE.BufferAttribute(vortexPositions, 3));
  vortexGeometry.setAttribute('color', new THREE.BufferAttribute(vortexColors, 3));

  const vortexMaterial = new THREE.PointsMaterial({
    size: 0.14,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  });

  const vortexSystem = new THREE.Points(vortexGeometry, vortexMaterial);
  scene.add(vortexSystem);

  // Kinetic Swirling Silk Ribbon Tube
  const RIBBON_SEGMENTS = 120;
  const ribbonCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 24 }, (_, k) => new THREE.Vector3(0, 0, 0)),
    true
  );

  const ribbonGeometry = new THREE.TubeGeometry(ribbonCurve, RIBBON_SEGMENTS, 0.038, 8, true);
  const ribbonMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.65,
    transparent: true,
    opacity: 0.88
  });
  const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
  scene.add(ribbonMesh);

  // ── 5. Name Chromatic Loop Engine ──────────────────────────────────────────
  // Colors and recolors the user's name in sync with the 3D vortex loop
  const heroNameEl = document.getElementById('hero-name-primary');
  const hnpFullName = heroNameEl ? heroNameEl.querySelector('.hnp-full-name') : null;

  const COLOR_PALETTES = [
    { first: '#121212', accent: '#D97706', glow: 'rgba(245, 158, 11, 0.35)' }, // 1. Warm Amber & Obsidian
    { first: '#1C1917', accent: '#E11D48', glow: 'rgba(225, 29, 72, 0.32)' },   // 2. Terracotta Coral
    { first: '#18181B', accent: '#D97706', glow: 'rgba(217, 119, 6, 0.35)' },   // 3. Golden Ochre
    { first: '#121212', accent: '#059669', glow: 'rgba(16, 185, 129, 0.32)' },  // 4. Emerald Mint
    { first: '#1E1B4B', accent: '#7C3AED', glow: 'rgba(124, 58, 237, 0.32)' }   // 5. Electric Violet
  ];

  const LOOP_PERIOD = 7.5; // Seconds per complete continuous cycle
  let lastPaletteIndex = -1;

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function lerpColor(hexA, hexB, t) {
    const [r1, g1, b1] = hexToRgb(hexA);
    const [r2, g2, b2] = hexToRgb(hexB);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function updateNameChromaticLoop(elapsedTime) {
    if (!heroNameEl) return;

    const totalPalettes = COLOR_PALETTES.length;
    const progress = (elapsedTime % LOOP_PERIOD) / LOOP_PERIOD; // 0 to 1
    const scaled = progress * totalPalettes;
    const currentIndex = Math.floor(scaled) % totalPalettes;
    const nextIndex = (currentIndex + 1) % totalPalettes;
    const t = scaled - Math.floor(scaled);

    const curr = COLOR_PALETTES[currentIndex];
    const next = COLOR_PALETTES[nextIndex];

    const currentFirstColor = lerpColor(curr.first, next.first, t);
    const currentAccentColor = lerpColor(curr.accent, next.accent, t);

    heroNameEl.style.setProperty('--name-first-color', currentFirstColor);
    heroNameEl.style.setProperty('--name-accent-color', currentAccentColor);
    heroNameEl.style.setProperty('--name-glow-color', curr.glow);

    // Subtle breath pulse when the loop resets to palette 0
    if (currentIndex !== lastPaletteIndex) {
      lastPaletteIndex = currentIndex;
      if (hnpFullName) {
        hnpFullName.classList.remove('loop-pulse');
        void hnpFullName.offsetWidth; // Force reflow
        hnpFullName.classList.add('loop-pulse');
      }
    }
  }

  // ── 6. Interactive Drag-to-Rotate & Inertia ────────────────────────────────
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let rotVelocityX = 0;
  let rotVelocityY = 0;
  const DAMPING = 0.94;

  function onPointerDown(e) {
    isDragging = true;
    prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    prevMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const curX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const curY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const deltaX = curX - prevMouseX;
    const deltaY = curY - prevMouseY;
    prevMouseX = curX;
    prevMouseY = curY;

    rotVelocityY = deltaX * 0.0035;
    rotVelocityX = deltaY * 0.0035;

    shapesGroup.rotation.y += rotVelocityY;
    shapesGroup.rotation.x += rotVelocityX;
    vortexSystem.rotation.y += rotVelocityY;
    ribbonMesh.rotation.y += rotVelocityY;
  }

  function onPointerUp() {
    isDragging = false;
  }

  canvas.addEventListener('mousedown', onPointerDown, { passive: true });
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('mouseup', onPointerUp, { passive: true });

  canvas.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp, { passive: true });

  // ── 7. Animation Loop (60 FPS Fluid Motion) ───────────────────────────────
  const clock = new THREE.Clock();
  let animationFrameId = null;

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // 1. Update Name Chromatic Coloring Loop
    updateNameChromaticLoop(elapsed);

    // 2. Animate Floating 3D Shapes
    const timeT = elapsed;
    for (let i = 0; i < shapeData.length; i++) {
      const d = shapeData[i];
      d.mesh.rotation.x += d.rotSpeed.x;
      d.mesh.rotation.y += d.rotSpeed.y;
      d.mesh.rotation.z += d.rotSpeed.z;

      // Harmonic 3D bobbing
      const bob = Math.sin(timeT * d.floatFreq + d.phase) * d.floatAmp;
      d.mesh.position.y = d.basePos.y + bob;

      // Gentle orbital micro-drift
      const driftAngle = timeT * d.orbitSpeed * 0.2 + d.phase;
      const driftRad = 0.12 * Math.sin(timeT * 0.4 + d.phase);
      d.mesh.position.x = d.basePos.x + Math.cos(driftAngle) * driftRad;
      d.mesh.position.z = d.basePos.z + Math.sin(driftAngle) * driftRad;
    }

    // 3. Animate Kinetic Fluid Vortex Particles
    const posArr = vortexGeometry.attributes.position.array;
    const flowSpeed = elapsed * 1.8;

    for (let i = 0; i < VORTEX_PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const t = vortexOffsets[i] + flowSpeed;

      // 3D Logarithmic Swirl Ribbon
      const spiralRadius = 0.75 + Math.sin(t * 0.35) * 0.35 + (i / VORTEX_PARTICLE_COUNT) * 1.6;
      const x = Math.cos(t) * spiralRadius;
      const z = Math.sin(t) * spiralRadius * 0.85;
      const y = Math.sin(t * 1.4) * 0.85 + Math.cos(t * 0.6) * 0.55;

      posArr[idx] = x;
      posArr[idx + 1] = y;
      posArr[idx + 2] = z;
    }
    vortexGeometry.attributes.position.needsUpdate = true;

    // 4. Animate Silk Ribbon Spine
    const ribbonPoints = [];
    const ribbonNodes = 24;
    for (let k = 0; k < ribbonNodes; k++) {
      const rT = (k / ribbonNodes) * Math.PI * 2 * 2 + flowSpeed * 0.8;
      const rRad = 1.25 + Math.sin(rT * 0.5) * 0.6;
      ribbonPoints.push(
        new THREE.Vector3(
          Math.cos(rT) * rRad,
          Math.sin(rT * 1.5) * 0.75,
          Math.sin(rT) * rRad * 0.9
        )
      );
    }
    ribbonCurve.points = ribbonPoints;
    ribbonMesh.geometry.dispose();
    ribbonMesh.geometry = new THREE.TubeGeometry(ribbonCurve, RIBBON_SEGMENTS, 0.038, 8, true);

    // 5. Apply Inertial Rotation & Ambient Drift
    if (!isDragging) {
      rotVelocityX *= DAMPING;
      rotVelocityY *= DAMPING;
      shapesGroup.rotation.y += 0.0025 + rotVelocityY;
      shapesGroup.rotation.x += rotVelocityX;
      vortexSystem.rotation.y += 0.0045 + rotVelocityY;
      ribbonMesh.rotation.y += 0.0035 + rotVelocityY;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ── 8. Responsive Viewport Handler ────────────────────────────────────────
  function onResize() {
    if (!container) return;
    width = container.clientWidth || 550;
    height = container.clientHeight || 460;

    camera.aspect = width / height;
    // Scale camera position for mobile screens so 3D shapes stay centered & perfectly framed
    if (width < 600) {
      camera.position.z = 8.5;
    } else if (width < 900) {
      camera.position.z = 7.6;
    } else {
      camera.position.z = 7.2;
    }
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  window.addEventListener('resize', onResize, { passive: true });
  onResize();
}
