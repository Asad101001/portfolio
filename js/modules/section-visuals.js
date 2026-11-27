/**
 * js/modules/section-visuals.js
 * Dynamic, intersection-gated Three.js & interactive 2D Canvas engines.
 * Paper-blended open sculptural visuals (#projects, #about, #tech) on #F7F6F3
 * + Obsidian header engines (#credentials, #education, #contact).
 * Strict 4-color editorial palette: Paper #F7F6F3, Obsidian #121212, Amber #F59E0B/#D97706, Indigo #6366F1/#4F46E5.
 */

const PALETTE = {
  paper: '#F7F6F3',
  obsidian: '#121212',
  inkSoft: 'rgba(18, 18, 18, 0.16)',
  inkMid: 'rgba(18, 18, 18, 0.36)',
  amber: '#F59E0B',
  amberDeep: '#D97706',
  amberLt: '#FCD34D',
  indigo: '#4F46E5',
  indigoLt: '#818CF8',
  indigoSoft: 'rgba(129, 140, 248, 0.28)',
  gridLine: 'rgba(247, 246, 243, 0.10)',
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

function isReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function getDprCap() {
  const mobile = window.innerWidth <= 768 || (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024);
  return Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
}

function getScrollDirSign() {
  return document.body.getAttribute('data-scroll-dir') === 'up' ? -1 : 1;
}

function fitCanvas(canvas, state) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  const dpr = getDprCap();
  const pw = Math.round(rect.width * dpr);
  const ph = Math.round(rect.height * dpr);
  if (canvas.width !== pw || canvas.height !== ph || state.w !== rect.width || state.h !== rect.height) {
    canvas.width = pw;
    canvas.height = ph;
    state.w = rect.width;
    state.h = rect.height;
    state.dpr = dpr;
    return true;
  }
  return false;
}

function attachPointerTracker(el, pointerState) {
  if (!el) return;
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    pointerState.nx = clamp01((e.clientX - r.left) / r.width) * 2 - 1;
    pointerState.ny = clamp01((e.clientY - r.top) / r.height) * 2 - 1;
    pointerState.x = e.clientX - r.left;
    pointerState.y = e.clientY - r.top;
    pointerState.inside = true;
  };
  const onLeave = () => {
    pointerState.inside = false;
  };
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave, { passive: true });
}

/* ── 1. PROJECTS: Organic Paper-Blended Particle Constellation & Silk Streams ─ */
function createPipelineEngine(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const container = canvas.closest('.stage-visual') || canvas.closest('.section-header');
  const section = canvas.closest('section');
  const state = {
    w: 0,
    h: 0,
    dpr: 1,
    boost: 0,
    dirVel: 1,
    activeNode: -1,
    smoothNx: 0,
    smoothNy: 0,
  };
  const ptr = { nx: 0, ny: 0, x: 0, y: 0, inside: false };
  attachPointerTracker(container || canvas, ptr);

  if (section) {
    const cards = section.querySelectorAll('.case-study-card, .proj-mini-card, .cp-row');
    cards.forEach((card, idx) => {
      card.addEventListener('mouseenter', () => {
        state.boost = 1.05;
        state.activeNode = idx % 5;
      }, { passive: true });
      card.addEventListener('mouseleave', () => {
        state.activeNode = -1;
      }, { passive: true });
    });
  }

  // 5 outer architectural nodes around 1 central hub (mirrors Hero organic cluster feel)
  const anchors = [
    { angle: -2.55, dist: 0.72, color: PALETTE.amberDeep },
    { angle: -0.62, dist: 0.78, color: PALETTE.indigo },
    { angle: 0.12, dist: 0.84, color: PALETTE.obsidian },
    { angle: 1.08, dist: 0.74, color: PALETTE.amberDeep },
    { angle: 2.38, dist: 0.78, color: PALETTE.indigo },
  ];

  // Micro particle dust cloud around each node
  const clusterSeeds = Array.from({ length: 65 }, (_, i) => ({
    nodeIdx: i < 20 ? -1 : (i - 20) % anchors.length,
    rNorm: Math.pow(((i * 37) % 100) / 100, 0.58),
    ang: ((i * 137.5) * Math.PI) / 180,
    size: 0.9 + (i % 4) * 0.42,
    driftSpeed: 0.4 + (i % 5) * 0.18,
    color: i % 3 === 0 ? PALETTE.amberDeep : i % 3 === 1 ? PALETTE.indigo : PALETTE.obsidian,
  }));

  // Silky flowing signal comets along the radial filaments
  const trails = Array.from({ length: 10 }, (_, i) => ({
    anchorIdx: i % anchors.length,
    t: (i / 10 + 0.17) % 1,
    speed: 0.22 + (i % 3) * 0.06,
    color: i % 2 === 0 ? PALETTE.amberDeep : PALETTE.indigo,
  }));

  const evalQuad = (p0, cp, p1, t) => {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * cp.x + t * t * p1.x,
      y: u * u * p0.y + 2 * u * t * cp.y + t * t * p1.y,
    };
  };

  return {
    resize() { fitCanvas(canvas, state); },
    render(dt, elapsed, reduced) {
      if (!state.w) fitCanvas(canvas, state);
      const { w, h, dpr } = state;
      if (!w || !h) return;

      const isStage = w >= 220 && h >= 180;
      const targetDir = getScrollDirSign();
      state.dirVel = reduced ? 1 : damp(state.dirVel, targetDir, 4.5, dt);
      state.boost = damp(state.boost, ptr.inside ? 0.4 : 0, 4.2, dt);
      state.smoothNx = damp(state.smoothNx, ptr.inside ? ptr.nx : 0, 5.5, dt);
      state.smoothNy = damp(state.smoothNy, ptr.inside ? ptr.ny : 0, 5.5, dt);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5 + state.smoothNx * (isStage ? 10 : 3);
      const cy = h * 0.5 + state.smoothNy * (isStage ? 10 : 3);
      const radiusX = w * 0.37;
      const radiusY = h * 0.35;

      const nodePos = anchors.map((a, i) => {
        const wobble = reduced ? 0 : Math.sin(elapsed * 0.75 + i * 1.3) * 0.07;
        const ang = a.angle + wobble + state.smoothNx * 0.14;
        return {
          x: cx + Math.cos(ang) * radiusX * a.dist,
          y: cy + Math.sin(ang) * radiusY * a.dist,
          color: a.color,
        };
      });

      // Draw gentle curved silk filaments
      nodePos.forEach((np, i) => {
        const emphasized = state.activeNode === -1 || state.activeNode === i;
        const midX = (cx + np.x) * 0.5;
        const midY = (cy + np.y) * 0.5;
        const perpX = -(np.y - cy) * 0.16;
        const perpY = (np.x - cx) * 0.16;
        const sway = reduced ? 0 : Math.sin(elapsed * 0.9 + i * 1.7) * 0.45 + 0.55;
        const cp = {
          x: midX + perpX * sway + state.smoothNx * 14,
          y: midY + perpY * sway + state.smoothNy * 14,
        };

        ctx.strokeStyle = emphasized ? 'rgba(18, 18, 18, 0.24)' : 'rgba(18, 18, 18, 0.10)';
        ctx.lineWidth = emphasized ? (isStage ? 1.25 : 0.9) : 0.75;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cp.x, cp.y, np.x, np.y);
        ctx.stroke();

        np.cp = cp;
      });

      // Draw orbiting micro-particle clusters on the cream canvas
      const dustLimit = isStage ? clusterSeeds.length : 30;
      const centerSpread = isStage ? 34 : 11;
      const outerSpread = isStage ? 26 : 8;
      for (let i = 0; i < dustLimit; i++) {
        const d = clusterSeeds[i];
        const base = d.nodeIdx === -1 ? { x: cx, y: cy } : nodePos[d.nodeIdx];
        const spread = d.nodeIdx === -1 ? centerSpread : outerSpread;
        const spin = reduced ? 0 : elapsed * d.driftSpeed * 0.45 * state.dirVel;
        const px = base.x + Math.cos(d.ang + spin) * d.rNorm * spread;
        const py = base.y + Math.sin(d.ang + spin) * d.rNorm * spread * 0.78;
        const alpha = 0.28 + (1 - d.rNorm) * 0.48;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(px, py, isStage ? d.size : d.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Silky tapered signal comets streaming along curves
      const activeTrails = isStage ? trails : trails.slice(0, 5);
      const speedMult = reduced ? 0 : (1 + state.boost) * state.dirVel;
      activeTrails.forEach((tr) => {
        if (!reduced) {
          tr.t = (tr.t + tr.speed * speedMult * dt + 10) % 1;
        }
        const np = nodePos[tr.anchorIdx];
        const segs = isStage ? 7 : 4;
        for (let s = 0; s < segs; s++) {
          const st = clamp01(tr.t - (s * 0.024 * Math.sign(state.dirVel || 1)));
          const pt = evalQuad({ x: cx, y: cy }, np.cp, np, st);
          const fade = (1 - s / segs);
          ctx.globalAlpha = fade * 0.85;
          ctx.fillStyle = tr.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (isStage ? 2.6 : 1.5) * (0.4 + 0.6 * fade), 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // Clean luminous cluster cores (no hard squares or text boxes)
      const drawCore = (x, y, r, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      nodePos.forEach((np, i) => {
        const hit = state.activeNode === i;
        drawCore(np.x, np.y, isStage ? (hit ? 4.4 : 3.0) : 1.8, np.color);
      });
      drawCore(cx, cy, isStage ? 4.6 : 2.5, PALETTE.obsidian);
    },
  };
}

/* ── 2. ABOUT: Silky Blended Multi-Ribbon Wave Field on Paper ───── */
function createWaveEngine(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const container = canvas.closest('.stage-visual') || canvas.closest('.section-header');
  const state = { w: 0, h: 0, dpr: 1, cursorX: -1, cursorY: 0, hoverMix: 0, dirVel: 1 };
  const ptr = { nx: 0, ny: 0, x: 0, y: 0, inside: false };
  attachPointerTracker(container || canvas, ptr);

  const tags = ['API', 'RAG', 'SQL', 'C++', 'AWS'];
  const ribbons = [
    { ampNorm: 0.16, freq: 0.019, speed: 1.35, color: 'rgba(217, 119, 6, 0.78)', width: 2.0, phase: 0, tagIdx: 0, xNorm: 0.24 },
    { ampNorm: 0.13, freq: 0.024, speed: 1.08, color: 'rgba(79, 70, 229, 0.62)', width: 1.6, phase: 1.4, tagIdx: 2, xNorm: 0.71 },
    { ampNorm: 0.10, freq: 0.029, speed: 0.85, color: 'rgba(245, 158, 11, 0.34)', width: 1.15, phase: 2.8, tagIdx: 1, xNorm: 0.48 },
    { ampNorm: 0.08, freq: 0.015, speed: 1.18, color: 'rgba(18, 18, 18, 0.24)', width: 1.0, phase: 4.1, tagIdx: 3, xNorm: 0.85 },
    { ampNorm: 0.06, freq: 0.034, speed: 0.72, color: 'rgba(99, 102, 241, 0.24)', width: 0.9, phase: 5.3, tagIdx: 4, xNorm: 0.12 },
  ];

  return {
    resize() { fitCanvas(canvas, state); },
    render(dt, elapsed, reduced) {
      if (!state.w) fitCanvas(canvas, state);
      const { w, h, dpr } = state;
      if (!w || !h) return;

      const isStage = w >= 220 && h >= 180;
      state.dirVel = reduced ? 1 : damp(state.dirVel, getScrollDirSign(), 4.5, dt);
      state.hoverMix = damp(state.hoverMix, ptr.inside ? 1 : 0, 5.5, dt);
      if (ptr.inside) {
        const cRect = canvas.getBoundingClientRect();
        const hRect = (container || canvas).getBoundingClientRect();
        const relX = clamp01(((ptr.x + hRect.left) - cRect.left) / w) * w;
        state.cursorX = state.cursorX < 0 ? relX : damp(state.cursorX, relX, 9.0, dt);
        state.cursorY = damp(state.cursorY, ptr.ny, 9.0, dt);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const midY = h * 0.52;
      const reach = isStage ? 78 : 26;
      const step = isStage ? 3 : 2;
      const padX = isStage ? 10 : 4;
      const usableW = Math.max(1, w - padX * 2);

      ribbons.forEach((rib, wi) => {
        if (!reduced) {
          rib.xNorm = (rib.xNorm + 0.11 * state.dirVel * dt + 10) % 1;
        }
        const t = reduced ? 0.5 : elapsed * rib.speed * state.dirVel + rib.phase;
        const amp = Math.max(7, h * rib.ampNorm);
        const freq = isStage ? rib.freq * 0.88 : rib.freq * 1.55;
        const deflectMag = isStage ? 32 : 9;

        const sampleY = (x) => {
          const normX = (x - padX) / usableW;
          const envelope = Math.pow(Math.sin(clamp01(normX) * Math.PI), 1.4);
          const harmonic = Math.sin(x * freq - t) + 0.35 * Math.cos(x * freq * 1.65 + t * 0.7);
          const base = harmonic * amp * 0.78 * envelope;
          if (state.hoverMix <= 0.01 || state.cursorX < 0) return midY + base;
          const dx = x - state.cursorX;
          const deflect = Math.exp(-(dx * dx) / (2 * reach * reach)) * (state.cursorY >= 0 ? -deflectMag : deflectMag) * state.hoverMix * envelope;
          return midY + base + deflect;
        };

        ctx.strokeStyle = rib.color;
        ctx.lineWidth = isStage ? rib.width : Math.max(0.85, rib.width * 0.72);
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let x = padX; x <= w - padX; x += step) {
          const y = sampleY(x);
          if (x === padX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Silky glowing pearl + fading micro label along primary 2 strands
        if (wi < 2) {
          const hx = padX + rib.xNorm * usableW;
          const hy = sampleY(hx);
          const edgeAlpha = Math.sin(clamp01(rib.xNorm) * Math.PI);
          if (edgeAlpha > 0.08) {
            ctx.save();
            ctx.globalAlpha = clamp01(edgeAlpha * 1.35);
            ctx.fillStyle = wi === 0 ? PALETTE.amberDeep : PALETTE.indigo;
            ctx.shadowColor = wi === 0 ? PALETTE.amber : PALETTE.indigoLt;
            ctx.shadowBlur = isStage ? 8 : 4;
            ctx.beginPath();
            ctx.arc(hx, hy, isStage ? (wi === 0 ? 4.2 : 3.3) : 2.1, 0, Math.PI * 2);
            ctx.fill();

            if (!reduced && rib.xNorm < 0.015) {
              rib.tagIdx = (rib.tagIdx + 1) % tags.length;
            }
            if (isStage) {
              ctx.shadowBlur = 0;
              ctx.font = '600 9.5px "JetBrains Mono", monospace';
              ctx.fillStyle = wi === 0 ? '#92400E' : '#3730A3';
              ctx.textBaseline = 'bottom';
              const labelX = Math.min(w - 28, Math.max(10, hx - 10));
              ctx.fillText(tags[rib.tagIdx], labelX, Math.max(14, hy - 8));
            }
            ctx.restore();
          }
        }
      });
    },
  };
}

/* ── 3. TECH ARSENAL: Three.js Silky Particle Cloud + Fine Mesh on Paper ─ */
function createLatticeEngine(canvas) {
  const container = canvas.closest('.stage-visual') || canvas.closest('.section-header');
  const section = canvas.closest('section');
  const state = {
    w: 0,
    h: 0,
    dpr: 1,
    mode: 'pending',
    three: null,
    rotY: 0.4,
    rotX: 0.25,
    spinBurst: 0,
    scalePulse: 1,
    dirVel: 1,
    tiltX: 0,
    tiltY: 0,
  };
  const ptr = { nx: 0, ny: 0, x: 0, y: 0, inside: false };
  attachPointerTracker(container || canvas, ptr);

  if (section) {
    const filterBtns = section.querySelectorAll('.af-btn');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.spinBurst = 3.2;
        state.scalePulse = 1.14;
      }, { passive: true });
    });
  }

  let initStarted = false;
  function bootThree() {
    if (initStarted) return;
    initStarted = true;
    import('three')
      .then((THREE) => {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(rect.width || 168, 64);
        const h = Math.max(rect.height || 92, 54);
        const dpr = getDprCap();
        const mobile = window.innerWidth <= 768;

        try {
          const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: !mobile,
            powerPreference: 'low-power',
          });
          renderer.setPixelRatio(dpr);
          renderer.setSize(w, h, false);

          const scene = new THREE.Scene();
          const aspect = w / h;
          const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 30);
          const halfFov = (camera.fov * Math.PI) / 360;
          const baseZ = w >= 220 ? 3.55 : 3.7;
          camera.position.z = aspect < 1
            ? Math.max(baseZ, 1.55 / (Math.tan(halfFov) * Math.max(aspect, 0.35)))
            : baseZ;

          const group = new THREE.Group();
          scene.add(group);

          // Delicate translucent dark-ink icosahedron wireframe
          const outerGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.06, 0));
          const outerMat = new THREE.LineBasicMaterial({
            color: 0x18181b,
            transparent: true,
            opacity: 0.22,
          });
          const outerMesh = new THREE.LineSegments(outerGeo, outerMat);
          group.add(outerMesh);

          // Rich Indigo inner octahedron wireframe
          const innerGeo = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.66, 0));
          const innerMat = new THREE.LineBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.42,
          });
          const innerMesh = new THREE.LineSegments(innerGeo, innerMat);
          group.add(innerMesh);

          // Warm amber subtle polyhedral core
          const coreGeo = new THREE.OctahedronGeometry(0.22, 0);
          const coreMat = new THREE.MeshBasicMaterial({
            color: 0xd97706,
            transparent: true,
            opacity: 0.72,
          });
          const coreMesh = new THREE.Mesh(coreGeo, coreMat);
          group.add(coreMesh);

          // Fine silky orbit ring
          const ringPts = [];
          const segs = 64;
          for (let i = 0; i < segs; i++) {
            const a = (i / segs) * Math.PI * 2;
            ringPts.push(new THREE.Vector3(Math.cos(a) * 1.24, 0, Math.sin(a) * 1.24));
          }
          const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
          const ringMat = new THREE.LineBasicMaterial({
            color: 0xd97706,
            transparent: true,
            opacity: 0.26,
          });
          const orbitRing = new THREE.LineLoop(ringGeo, ringMat);
          orbitRing.rotation.x = 0.62;
          group.add(orbitRing);

          // Custom ShaderMaterial for crisp circular anti-aliased Hero-matched particles
          const count = mobile ? 72 : 168;
          const pos = new Float32Array(count * 3);
          const colors = new Float32Array(count * 3);
          const seeds = new Float32Array(count);
          const cInk = new THREE.Color(0x121212);
          const cAmb = new THREE.Color(0xd97706);
          const cInd = new THREE.Color(0x4f46e5);

          for (let i = 0; i < count; i++) {
            const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const r = i % 4 === 0 ? 1.32 : (0.78 + ((i * 19) % 100) / 180);
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
            seeds[i] = i * 0.43;

            const chosen = i % 5 === 0 ? cInd : (i % 2 === 0 ? cAmb : cInk);
            colors[i * 3] = chosen.r;
            colors[i * 3 + 1] = chosen.g;
            colors[i * 3 + 2] = chosen.b;
          }

          const ptsGeo = new THREE.BufferGeometry();
          ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          ptsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          ptsGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

          const ptsMat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
              uTime: { value: 0 },
              uSize: { value: (mobile ? 6.5 : 8.5) * dpr },
            },
            vertexShader: `
              attribute float aSeed;
              attribute vec3 color;
              uniform float uTime;
              uniform float uSize;
              varying vec3 vColor;
              varying float vAlpha;
              void main() {
                vColor = color;
                vec3 p = position;
                p.z += sin(uTime * 1.1 + aSeed) * 0.045;
                p.y += cos(uTime * 0.9 + aSeed) * 0.03;
                vAlpha = 0.55 + 0.35 * sin(uTime * 1.4 + aSeed);
                vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                gl_PointSize = uSize / -mvPosition.z;
                gl_Position = projectionMatrix * mvPosition;
              }
            `,
            fragmentShader: `
              varying vec3 vColor;
              varying float vAlpha;
              void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if (d > 0.5) discard;
                float soft = smoothstep(0.5, 0.12, d);
                gl_FragColor = vec4(vColor, soft * vAlpha);
              }
            `,
          });
          const pts = new THREE.Points(ptsGeo, ptsMat);
          group.add(pts);

          state.three = { renderer, scene, camera, group, outerMesh, innerMesh, coreMesh, orbitRing, pts, ptsMat };
          state.w = w;
          state.h = h;
          state.dpr = dpr;
          state.mode = 'three';
        } catch (_err) {
          state.mode = 'fallback2d';
        }
      })
      .catch(() => {
        state.mode = 'fallback2d';
      });
  }

  // Fallback projected 3D wireframe octahedron on 2D Canvas (obsidian/amber/indigo)
  const verts = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const edges = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2]];

  function renderFallback(dt, reduced) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    fitCanvas(canvas, state);
    const { w, h, dpr } = state;
    if (!w || !h) return;

    state.dirVel = reduced ? 1 : damp(state.dirVel, getScrollDirSign(), 4.5, dt);
    if (!reduced) {
      state.rotY += (0.55 * state.dirVel + state.spinBurst) * dt;
      state.rotX = damp(state.rotX, 0.35 + (ptr.inside ? ptr.ny * 0.35 : 0), 5.5, dt);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = Math.min(w, h) * 0.36 * state.scalePulse;
    const cosY = Math.cos(state.rotY);
    const sinY = Math.sin(state.rotY);
    const cosX = Math.cos(state.rotX);
    const sinX = Math.sin(state.rotX);

    const proj = verts.map(([x, y, z]) => {
      const rx = x * cosY - z * sinY;
      const rz = x * sinY + z * cosY;
      const ry = y * cosX - rz * sinX;
      return [cx + rx * r, cy + ry * r];
    });

    ctx.strokeStyle = 'rgba(18, 18, 18, 0.38)';
    ctx.lineWidth = 1.4;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(proj[a][0], proj[a][1]);
      ctx.lineTo(proj[b][0], proj[b][1]);
      ctx.stroke();
    });
    ctx.fillStyle = PALETTE.amberDeep;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    onEnter() {
      bootThree();
    },
    resize() {
      if (state.mode === 'three' && state.three) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const dpr = getDprCap();
        const mobile = window.innerWidth <= 768;
        state.three.renderer.setPixelRatio(dpr);
        state.three.renderer.setSize(rect.width, rect.height, false);
        const aspect = rect.width / rect.height;
        const halfFov = (state.three.camera.fov * Math.PI) / 360;
        const baseZ = rect.width >= 220 ? 3.55 : 3.7;
        state.three.camera.aspect = aspect;
        state.three.camera.position.z = aspect < 1
          ? Math.max(baseZ, 1.55 / (Math.tan(halfFov) * Math.max(aspect, 0.35)))
          : baseZ;
        state.three.camera.updateProjectionMatrix();
        state.three.ptsMat.uniforms.uSize.value = (mobile ? 6.5 : 8.5) * dpr;
        state.w = rect.width;
        state.h = rect.height;
      } else if (state.mode === 'fallback2d') {
        fitCanvas(canvas, state);
      }
    },
    render(dt, elapsed, reduced) {
      if (state.mode === 'pending') {
        bootThree();
        return;
      }
      state.spinBurst = damp(state.spinBurst, 0, 3.8, dt);
      state.scalePulse = damp(state.scalePulse, 1, 5.2, dt);
      state.dirVel = reduced ? 1 : damp(state.dirVel, getScrollDirSign(), 4.5, dt);

      if (state.mode === 'fallback2d') {
        renderFallback(dt, reduced);
        return;
      }

      const t = state.three;
      if (!t) return;

      if (!reduced) {
        t.ptsMat.uniforms.uTime.value = elapsed;
        const baseSpeed = 0.34 * state.dirVel + state.spinBurst;
        t.outerMesh.rotation.y += baseSpeed * dt;
        t.outerMesh.rotation.x = Math.sin(elapsed * 0.45) * 0.18;
        t.innerMesh.rotation.y -= (baseSpeed * 1.25) * dt;
        t.innerMesh.rotation.z += 0.28 * state.dirVel * dt;
        t.coreMesh.rotation.y += 0.75 * dt;
        t.orbitRing.rotation.z += 0.22 * state.dirVel * dt;
        t.pts.rotation.y -= 0.18 * state.dirVel * dt;

        state.tiltX = damp(state.tiltX, ptr.inside ? ptr.ny * 0.38 : 0, 5.0, dt);
        state.tiltY = damp(state.tiltY, ptr.inside ? ptr.nx * 0.45 : 0, 5.0, dt);
        t.group.rotation.x = state.tiltX;
        t.group.rotation.y = state.tiltY;
        t.group.scale.setScalar(state.scalePulse);
      }

      t.renderer.render(t.scene, t.camera);
    },
  };
}

/* ── 4. CREDENTIALS: Cryptographic Verification Dual-Rotor Seal ─── */
function createSealEngine(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const header = canvas.closest('.section-header');
  const section = canvas.closest('section');
  const state = { w: 0, h: 0, dpr: 1, outerAngle: 0, innerAngle: 0, lockTarget: 0, lockMix: 0, dirVel: 1 };
  const ptr = { nx: 0, ny: 0, x: 0, y: 0, inside: false };
  attachPointerTracker(header || canvas, ptr);

  if (section) {
    const rows = section.querySelectorAll('.cred-row');
    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => { state.lockTarget = 1; }, { passive: true });
      row.addEventListener('mouseleave', () => { state.lockTarget = 0; }, { passive: true });
      row.addEventListener('focus', () => { state.lockTarget = 1; }, { passive: true });
      row.addEventListener('blur', () => { state.lockTarget = 0; }, { passive: true });
    });
  }

  return {
    resize() { fitCanvas(canvas, state); },
    render(dt, elapsed, reduced) {
      if (!state.w) fitCanvas(canvas, state);
      const { w, h, dpr } = state;
      if (!w || !h) return;

      state.dirVel = reduced ? 1 : damp(state.dirVel, getScrollDirSign(), 4.5, dt);
      const locked = state.lockTarget > 0 || ptr.inside ? 1 : 0;
      state.lockMix = damp(state.lockMix, locked, 6.5, dt);

      if (!reduced) {
        const speedScale = lerp(0.5, 1.35, state.lockMix) * state.dirVel;
        state.outerAngle += 0.48 * speedScale * dt;
        state.innerAngle -= 0.78 * speedScale * dt;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxR = Math.min(w, h) * 0.42;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(state.outerAngle);
      ctx.strokeStyle = state.lockMix > 0.4 ? PALETTE.amberLt : PALETTE.amber;
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const a0 = (i * Math.PI) / 2 + 0.14;
        const a1 = ((i + 1) * Math.PI) / 2 - 0.14;
        ctx.beginPath();
        ctx.arc(0, 0, maxR, a0, a1);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(state.innerAngle);
      const innerR = maxR * lerp(0.72, 0.66, state.lockMix);
      ctx.strokeStyle = PALETTE.indigoLt;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        const r1 = innerR - 3;
        const r2 = innerR + (i % 3 === 0 ? 4 : 1.5);
        ctx.strokeStyle = i % 3 === 0 ? PALETTE.amber : PALETTE.indigoSoft;
        ctx.lineWidth = i % 3 === 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();

      const hexR = maxR * 0.4;
      ctx.strokeStyle = `rgba(247, 246, 243, ${(0.45 + 0.35 * state.lockMix).toFixed(2)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        const px = cx + Math.cos(a) * hexR;
        const py = cy + Math.sin(a) * hexR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      const checkPulse = reduced ? 1 : 0.78 + 0.22 * Math.sin(elapsed * 2.8);
      ctx.strokeStyle = PALETTE.amber;
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = clamp01(checkPulse + state.lockMix * 0.25);
      ctx.beginPath();
      ctx.moveTo(cx - hexR * 0.42, cy + 1);
      ctx.lineTo(cx - hexR * 0.1, cy + hexR * 0.36);
      ctx.lineTo(cx + hexR * 0.48, cy - hexR * 0.32);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  };
}

/* ── 5. EDUCATION: Reversible Telemetry Trajectory Spline Canvas ── */
function createCurveEngine(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const header = canvas.closest('.section-header');
  const section = canvas.closest('section');
  const state = { w: 0, h: 0, dpr: 1, drawMix: 0, probeT: 0.25, activeMilestone: 0, dirVel: 1 };
  const ptr = { nx: 0, ny: 0, x: 0, y: 0, inside: false };
  attachPointerTracker(header || canvas, ptr);

  if (section) {
    const items = section.querySelectorAll('.edu-stair-item');
    items.forEach((item, idx) => {
      item.addEventListener('mouseenter', () => { state.activeMilestone = idx; }, { passive: true });
      item.addEventListener('mouseleave', () => { state.activeMilestone = 0; }, { passive: true });
    });
  }

  return {
    resize() { fitCanvas(canvas, state); },
    render(dt, elapsed, reduced) {
      if (!state.w) fitCanvas(canvas, state);
      const { w, h, dpr } = state;
      if (!w || !h) return;

      let targetMix = 1;
      if (!reduced && section) {
        const sr = section.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        targetMix = clamp01((vh * 0.94 - sr.top) / (vh * 0.55));
      }
      state.drawMix = reduced ? 1 : damp(state.drawMix, targetMix, 7.5, dt);
      state.dirVel = reduced ? 1 : damp(state.dirVel, getScrollDirSign(), 4.5, dt);

      if (!reduced) {
        state.probeT = (state.probeT + 0.21 * state.dirVel * dt + 10) % 1;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const x0 = 18;
      const x1 = w - 18;
      const y0 = h - 14;
      const y1 = 14;

      ctx.strokeStyle = PALETTE.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y0);
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0, y1);
      ctx.stroke();

      const p0 = { x: x0 + 4, y: y0 - 4 };
      const cp = { x: w * 0.52, y: lerp(y0 - 4, y1 + 4, 0.22) + (ptr.inside ? ptr.ny * 6 : 0) };
      const pEnd = { x: x1 - 4, y: y1 + 4 };
      const sampleCurve = (t) => {
        const u = 1 - t;
        return {
          x: u * u * p0.x + 2 * u * t * cp.x + t * t * pEnd.x,
          y: u * u * p0.y + 2 * u * t * cp.y + t * t * pEnd.y,
        };
      };

      const maxSteps = 32;
      const endStep = Math.max(1, Math.round(maxSteps * state.drawMix));

      ctx.beginPath();
      ctx.moveTo(p0.x, y0);
      for (let i = 0; i <= endStep; i++) {
        const pt = sampleCurve(i / maxSteps);
        ctx.lineTo(pt.x, pt.y);
      }
      const lastPt = sampleCurve(endStep / maxSteps);
      ctx.lineTo(lastPt.x, y0);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, y1, 0, y0);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = PALETTE.amber;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= endStep; i++) {
        const pt = sampleCurve(i / maxSteps);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      const msT = [0.95, 0.52, 0.06];
      msT.forEach((tVal, idx) => {
        if (tVal > state.drawMix + 0.04) return;
        const pt = sampleCurve(tVal);
        const active = state.activeMilestone === idx;
        ctx.fillStyle = idx === 0 ? PALETTE.amber : PALETTE.indigoLt;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, active ? 4.8 : 3.4, 0, Math.PI * 2);
        ctx.fill();

        if (active) {
          const halo = 7 + (reduced ? 0 : Math.sin(elapsed * 3.6) * 1.6);
          ctx.strokeStyle = idx === 0 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(129, 140, 248, 0.5)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, halo, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      if (!reduced && state.drawMix > 0.15) {
        const pt = sampleCurve(state.probeT * state.drawMix);
        ctx.save();
        ctx.fillStyle = PALETTE.paper;
        ctx.shadowColor = PALETTE.amberLt;
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
  };
}

/* ── 6. CONTACT: Signal Radar & Gravitational Particle Orbit ──── */
function createOrbitEngine(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const header = canvas.closest('.section-header');
  const section = canvas.closest('section');
  const state = { w: 0, h: 0, dpr: 1, phase: 0, pulseBoost: 0, dirVel: 1 };
  const ptr = { nx: 0, ny: 0, x: 0, y: 0, inside: false };
  attachPointerTracker(header || canvas, ptr);

  if (section) {
    const ctas = section.querySelectorAll('.social-platform-card, .social-ping-btn');
    ctas.forEach((el) => {
      el.addEventListener('mouseenter', () => { state.pulseBoost = 1; }, { passive: true });
      el.addEventListener('mouseleave', () => { state.pulseBoost = 0; }, { passive: true });
    });
  }

  const particleCount = window.innerWidth <= 768 ? 8 : 14;
  const dots = Array.from({ length: particleCount }, (_, i) => ({
    angle: (i / particleCount) * Math.PI * 2,
    speed: (i % 2 === 0 ? 0.58 : -0.44) * (0.85 + (i % 3) * 0.14),
    ring: i % 2,
    size: 1.5 + (i % 3) * 0.5,
  }));

  return {
    resize() { fitCanvas(canvas, state); },
    render(dt, elapsed, reduced) {
      if (!state.w) fitCanvas(canvas, state);
      const { w, h, dpr } = state;
      if (!w || !h) return;

      state.dirVel = reduced ? 1 : damp(state.dirVel, getScrollDirSign(), 4.5, dt);
      const speedMult = (1 + state.pulseBoost * 0.75 + (ptr.inside ? 0.45 : 0)) * state.dirVel;
      if (!reduced) {
        state.phase += 0.85 * speedMult * dt;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const rx1 = Math.min(w * 0.4, 88);
      const ry1 = Math.min(h * 0.25, 22);
      const rx2 = rx1 * 0.84;
      const ry2 = ry1 * 0.78;
      const tilt1 = -0.32 + (ptr.inside ? ptr.ny * 0.12 : 0);
      const tilt2 = 0.42 + (ptr.inside ? ptr.nx * 0.12 : 0);

      const drawEllipse = (rx, ry, tilt, stroke) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };

      drawEllipse(rx1, ry1, tilt1, 'rgba(245, 158, 11, 0.75)');
      drawEllipse(rx2, ry2, tilt2, 'rgba(129, 140, 248, 0.65)');

      if (!reduced) {
        const pingR = ((elapsed * (0.65 + state.pulseBoost * 0.35)) % 1) * Math.min(w, h) * 0.44;
        const alpha = (1 - pingR / (Math.min(w, h) * 0.44)) * 0.36;
        ctx.strokeStyle = `rgba(245, 158, 11, ${alpha.toFixed(2)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, pingR, 0, Math.PI * 2);
        ctx.stroke();
      }

      dots.forEach((d) => {
        if (!reduced) {
          d.angle += d.speed * speedMult * dt;
        }
        const rx = d.ring === 0 ? rx1 : rx2;
        const ry = d.ring === 0 ? ry1 : ry2;
        const tilt = d.ring === 0 ? tilt1 : tilt2;
        const lx = Math.cos(d.angle) * rx;
        const ly = Math.sin(d.angle) * ry;
        let px = cx + lx * Math.cos(tilt) - ly * Math.sin(tilt);
        let py = cy + lx * Math.sin(tilt) + ly * Math.cos(tilt);

        if (ptr.inside) {
          px += ptr.nx * 4.5;
          py += ptr.ny * 3.5;
        }

        ctx.fillStyle = d.ring === 0 ? PALETTE.amberLt : PALETTE.paper;
        ctx.beginPath();
        ctx.arc(px, py, d.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.save();
      ctx.fillStyle = PALETTE.amber;
      ctx.shadowColor = PALETTE.amber;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 4.6 + state.pulseBoost * 1.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  };
}

/* ── COORDINATOR: Intersection-Gated Single Shared rAF Loop ────── */
export function initSectionVisuals() {
  const mounts = document.querySelectorAll('.sh-live-canvas[data-gfx]');
  if (!mounts.length) return;

  const factories = {
    pipeline: createPipelineEngine,
    wave: createWaveEngine,
    lattice: createLatticeEngine,
    seal: createSealEngine,
    curve: createCurveEngine,
    orbit: createOrbitEngine,
  };

  const instances = [];
  mounts.forEach((canvas) => {
    const kind = canvas.getAttribute('data-gfx');
    const factory = factories[kind];
    if (!factory) return;
    const engine = factory(canvas);
    if (!engine) return;
    instances.push({
      canvas,
      engine,
      visible: false,
      drawnOnce: false,
    });
  });

  if (!instances.length) return;

  let rafId = 0;
  let lastTime = performance.now();

  const tick = (now) => {
    rafId = 0;
    if (document.hidden) return;

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const elapsed = now * 0.001;
    const reduced = isReducedMotion();
    let anyVisible = false;

    for (let i = 0; i < instances.length; i++) {
      const item = instances[i];
      if (!item.visible) continue;
      anyVisible = true;
      item.engine.render(dt, elapsed, reduced);
      item.drawnOnce = true;
    }

    if (anyVisible && !reduced) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const ensureLoop = () => {
    if (rafId || document.hidden) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      let needStart = false;
      entries.forEach((entry) => {
        const item = instances.find((x) => x.canvas === entry.target);
        if (!item) return;
        item.visible = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (typeof item.engine.onEnter === 'function') item.engine.onEnter();
          item.engine.resize();
          needStart = true;
        }
      });
      if (needStart) ensureLoop();
    }, { rootMargin: '160px 0px', threshold: 0.01 });

    instances.forEach((item) => io.observe(item.canvas));
  } else {
    instances.forEach((item) => {
      item.visible = true;
      if (typeof item.engine.onEnter === 'function') item.engine.onEnter();
      item.engine.resize();
    });
    ensureLoop();
  }

  let resizeTimer = 0;
  const handleResizeAll = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      instances.forEach((item) => {
        item.engine.resize();
        if (item.visible && isReducedMotion()) {
          item.engine.render(0.016, performance.now() * 0.001, true);
        }
      });
    }, 80);
  };
  window.addEventListener('resize', handleResizeAll, { passive: true });
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(handleResizeAll);
    instances.forEach((item) => ro.observe(item.canvas));
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && instances.some((i) => i.visible)) {
      ensureLoop();
    } else if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSectionVisuals, { once: true });
} else {
  initSectionVisuals();
}
