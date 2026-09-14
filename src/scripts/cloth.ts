/**
 * Live XPBD cloth for the home viewer.
 *
 * A small, self-contained position-based cloth: distance constraints solved
 * with the XPBD compliance formulation over several substeps, projected with a
 * fixed perspective camera onto a 2D canvas. The same simulation can be drawn
 * through four techniques that echo the case studies (constraint strain,
 * orientation-based snow, a bright-pass bloom and per-joint positional error).
 * These are illustrations of each technique on this cloth, not project output.
 */

export type ClothMode = 'xpbd' | 'snow' | 'bloom' | 'ik';

export interface ClothStats {
  mode: ClothMode;
  /** Primary live reading for the mode, already scaled to its display unit. */
  value: number;
  /** Secondary reading (max joint error in ik mode, max strain otherwise). */
  secondary: number;
}

export interface ClothOptions {
  reducedMotion: boolean;
  onStats?: (stats: ClothStats) => void;
}

export interface ClothHandle {
  setMode(mode: ClothMode): void;
  destroy(): void;
}

const COLS = 22;
const ROWS = 16;
const SPACING = 1 / (COLS - 1);
const N = COLS * ROWS;
const FRAME_DT = 1 / 60;
const SUBSTEPS = 20;
const GRAVITY = -9.81;

/** Solver settings, exposed so the viewer can print what it actually runs. */
export const SOLVER = { substeps: SUBSTEPS, iterations: 1, dtMs: FRAME_DT * 1000 } as const;
// Two top corners, pulled inward after rest lengths are measured so the cloth
// hangs with slack and folds instead of a flat curtain.
const PINS = [0, COLS - 1];
const PIN_X = 0.36;

// Compliance in m/N. Structural edges are near-inextensible, bending is soft.
const COMPLIANCE = [1e-8, 1e-7, 2e-5];

const IK_JOINTS = [3, 10, 18].flatMap((i) => [3, 8, 14].map((j) => j * COLS + i));

// Camera: target, yaw/pitch around it, distance along the view axis.
const TARGET = [0, 0.12, 0.05];
const YAW = -0.5;
const PITCH = 0.16;
const DISTANCE = 2.15;
const LIGHT = normalize([-0.45, 0.75, 0.55]);

function normalize(v: number[]): number[] {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function mountCloth(canvas: HTMLCanvasElement, options: ClothOptions): ClothHandle {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setMode() {}, destroy() {} };
  const context: CanvasRenderingContext2D = ctx;

  const style = getComputedStyle(canvas);
  const ground = style.getPropertyValue('--viewer-ground').trim() || '#101214';
  const accent = style.getPropertyValue('--accent').trim() || '#c6f432';

  // --- Simulation state -----------------------------------------------------

  const pos = new Float32Array(N * 3);
  const prev = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3);
  const invMass = new Float32Array(N);
  const rest0 = new Float32Array(N * 3);

  const pairs: number[] = [];
  const kinds: number[] = [];

  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const k = j * COLS + i;
      // Start horizontal, reaching toward the camera, so the first frames drop
      // and swing. A tiny offset breaks the symmetry.
      pos[k * 3] = -0.5 + i * SPACING;
      pos[k * 3 + 1] = 0.45 + Math.sin(i * 1.7) * 0.002;
      pos[k * 3 + 2] = j * SPACING;
      invMass[k] = 1;

      if (i < COLS - 1) pairs.push(k, k + 1), kinds.push(0);
      if (j < ROWS - 1) pairs.push(k, k + COLS), kinds.push(0);
      if (i < COLS - 1 && j < ROWS - 1) {
        pairs.push(k, k + COLS + 1), kinds.push(1);
        pairs.push(k + 1, k + COLS), kinds.push(1);
      }
      if (i < COLS - 2) pairs.push(k, k + 2), kinds.push(2);
      if (j < ROWS - 2) pairs.push(k, k + COLS * 2), kinds.push(2);
    }
  }
  for (const p of PINS) invMass[p] = 0;

  const constraintCount = kinds.length;
  const restLength = new Float32Array(constraintCount);
  for (let c = 0; c < constraintCount; c++) {
    const a = pairs[c * 2] * 3;
    const b = pairs[c * 2 + 1] * 3;
    restLength[c] = Math.hypot(pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]);
  }
  pos[PINS[0] * 3] = -PIN_X;
  pos[PINS[1] * 3] = PIN_X;

  let time = 0;
  let hasReference = false;
  let grabbed = -1;
  let grabMass = 1;
  const grabTarget = [0, 0, 0];
  let grabDepth = 0;

  function substep(h: number) {
    const windOn = !options.reducedMotion;
    const gust = windOn ? 0.9 * Math.sin(time * 0.8) + 0.45 * Math.sin(time * 2.1) : 0;

    for (let k = 0; k < N; k++) {
      const o = k * 3;
      prev[o] = pos[o];
      prev[o + 1] = pos[o + 1];
      prev[o + 2] = pos[o + 2];
      if (invMass[k] === 0) continue;
      vel[o + 1] += GRAVITY * h;
      if (windOn) vel[o + 2] += (gust + 0.35 * Math.sin(time * 3 + pos[o] * 5)) * 0.9 * h;
      pos[o] += vel[o] * h;
      pos[o + 1] += vel[o + 1] * h;
      pos[o + 2] += vel[o + 2] * h;
    }

    if (grabbed >= 0) {
      const o = grabbed * 3;
      pos[o] = grabTarget[0];
      pos[o + 1] = grabTarget[1];
      pos[o + 2] = grabTarget[2];
    }

    // XPBD distance projection. One iteration per substep, so the Lagrange
    // multiplier starts at zero: delta lambda = -C / (w_a + w_b + alpha / h^2).
    const h2 = h * h;
    for (let c = 0; c < constraintCount; c++) {
      const ia = pairs[c * 2];
      const ib = pairs[c * 2 + 1];
      const wa = invMass[ia];
      const wb = invMass[ib];
      const w = wa + wb;
      if (w === 0) continue;
      const a = ia * 3;
      const b = ib * 3;
      const dx = pos[b] - pos[a];
      const dy = pos[b + 1] - pos[a + 1];
      const dz = pos[b + 2] - pos[a + 2];
      const len = Math.hypot(dx, dy, dz);
      if (len < 1e-9) continue;
      const C = len - restLength[c];
      const dLambda = -C / (w + COMPLIANCE[kinds[c]] / h2);
      const s = dLambda / len;
      pos[a] -= wa * s * dx;
      pos[a + 1] -= wa * s * dy;
      pos[a + 2] -= wa * s * dz;
      pos[b] += wb * s * dx;
      pos[b + 1] += wb * s * dy;
      pos[b + 2] += wb * s * dz;
    }

    const damping = 1 - 0.8 * h;
    for (let k = 0; k < N; k++) {
      const o = k * 3;
      vel[o] = ((pos[o] - prev[o]) / h) * damping;
      vel[o + 1] = ((pos[o + 1] - prev[o + 1]) / h) * damping;
      vel[o + 2] = ((pos[o + 2] - prev[o + 2]) / h) * damping;
    }
    time += h;
  }

  function simulateFrame() {
    const h = FRAME_DT / SUBSTEPS;
    for (let s = 0; s < SUBSTEPS; s++) substep(h);
    if (!hasReference && time > 3) captureReference();
    frameCount++;
  }

  function captureReference() {
    rest0.set(pos);
    hasReference = true;
  }

  function kineticEnergy(): number {
    let e = 0;
    for (let k = 0; k < N * 3; k++) e += vel[k] * vel[k];
    return e / N;
  }

  // --- Camera ---------------------------------------------------------------

  const cy = Math.cos(YAW);
  const sy = Math.sin(YAW);
  const cp = Math.cos(PITCH);
  const sp = Math.sin(PITCH);

  // Camera position in world space: inverse-rotate (0, 0, DISTANCE).
  const camPos = (() => {
    const qz = DISTANCE;
    const y1 = sp * qz;
    const z1 = cp * qz;
    return [TARGET[0] - sy * z1, TARGET[1] + y1, TARGET[2] + cy * z1];
  })();

  let width = 0;
  let height = 0;
  let dpr = 1;
  let focal = 1;

  const sx = new Float32Array(N);
  const sy2 = new Float32Array(N);
  const depth = new Float32Array(N);

  function project() {
    for (let k = 0; k < N; k++) {
      const o = k * 3;
      const x = pos[o] - TARGET[0];
      const y = pos[o + 1] - TARGET[1];
      const z = pos[o + 2] - TARGET[2];
      const x1 = cy * x + sy * z;
      const z1 = -sy * x + cy * z;
      const y2 = cp * y - sp * z1;
      const z2 = sp * y + cp * z1;
      const d = DISTANCE - z2;
      depth[k] = d;
      sx[k] = width / 2 + (x1 * focal) / d;
      sy2[k] = height / 2 - (y2 * focal) / d;
    }
  }

  function unproject(px: number, py: number, d: number): number[] {
    const x1 = ((px - width / 2) * d) / focal;
    const y2 = (-(py - height / 2) * d) / focal;
    const z2 = DISTANCE - d;
    const y = cp * y2 + sp * z2;
    const z1 = -sp * y2 + cp * z2;
    const x = cy * x1 - sy * z1;
    const z = sy * x1 + cy * z1;
    return [x + TARGET[0], y + TARGET[1], z + TARGET[2]];
  }

  // --- Rendering ------------------------------------------------------------

  const QUADS = (COLS - 1) * (ROWS - 1);
  const quadDepth = new Float32Array(QUADS);
  const order: number[] = Array.from({ length: QUADS }, (_, i) => i);
  const snow = new Float32Array(QUADS);

  const bright = document.createElement('canvas');
  const brightCtx = bright.getContext('2d');
  const blur = document.createElement('canvas');
  const blurCtx = blur.getContext('2d');

  let mode: ClothMode = 'xpbd';
  let frameCount = 0;
  let lastStats = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = width;
    canvas.height = height;
    focal = 1.6 * Math.min(width, height * 1.35);
    bright.width = Math.max(1, Math.round(width / 6));
    bright.height = Math.max(1, Math.round(height / 6));
    blur.width = Math.max(1, Math.round(width / 18));
    blur.height = Math.max(1, Math.round(height / 18));
    requestFrame();
  }

  function render() {
    project();
    const g = context;
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.fillStyle = ground;
    g.fillRect(0, 0, width, height);

    for (let q = 0; q < QUADS; q++) {
      const i = q % (COLS - 1);
      const j = (q / (COLS - 1)) | 0;
      const a = j * COLS + i;
      quadDepth[q] = depth[a] + depth[a + 1] + depth[a + COLS] + depth[a + COLS + 1];
    }
    order.sort((x, y) => quadDepth[y] - quadDepth[x]);

    const doBloom = mode === 'bloom' && brightCtx && blurCtx;
    if (doBloom) {
      brightCtx.globalCompositeOperation = 'source-over';
      brightCtx.fillStyle = '#000';
      brightCtx.fillRect(0, 0, bright.width, bright.height);
    }

    let brightCount = 0;
    let coverage = 0;
    const bs = bright.width / width;

    for (let n = 0; n < QUADS; n++) {
      const q = order[n];
      const i = q % (COLS - 1);
      const j = (q / (COLS - 1)) | 0;
      const a = j * COLS + i;
      const b = a + 1;
      const c = a + COLS + 1;
      const d = a + COLS;

      const ao = a * 3;
      const ux = pos[b * 3] - pos[ao];
      const uy = pos[b * 3 + 1] - pos[ao + 1];
      const uz = pos[b * 3 + 2] - pos[ao + 2];
      const vx = pos[d * 3] - pos[ao];
      const vy = pos[d * 3 + 1] - pos[ao + 1];
      const vz = pos[d * 3 + 2] - pos[ao + 2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl;
      ny /= nl;
      nz /= nl;

      const cxw = (pos[ao] + pos[c * 3]) / 2;
      const cyw = (pos[ao + 1] + pos[c * 3 + 1]) / 2;
      const czw = (pos[ao + 2] + pos[c * 3 + 2]) / 2;
      let vdx = camPos[0] - cxw;
      let vdy = camPos[1] - cyw;
      let vdz = camPos[2] - czw;
      const vl = Math.hypot(vdx, vdy, vdz) || 1;
      vdx /= vl;
      vdy /= vl;
      vdz /= vl;

      const front = nx * vdx + ny * vdy + nz * vdz >= 0;
      if (!front) {
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }

      const lambert = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const shade = 0.34 + 0.66 * lambert;
      let r = (front ? 236 : 150) * shade;
      let gr = (front ? 240 : 158) * shade;
      let bl = (front ? 244 : 168) * shade;

      if (mode === 'snow') {
        // Accumulates on faces pointing up, is shaken off by fast motion.
        const up = Math.abs(ny);
        const speed =
          (Math.hypot(vel[ao], vel[ao + 1], vel[ao + 2]) +
            Math.hypot(vel[c * 3], vel[c * 3 + 1], vel[c * 3 + 2])) /
          2;
        let s = snow[q];
        s += FRAME_DT * 0.45 * smoothstep(0.3, 0.85, up);
        if (up < 0.2) s -= FRAME_DT * 0.08;
        if (speed > 0.8) s -= FRAME_DT * 2.5 * (speed - 0.8);
        s = Math.min(1, Math.max(0, s));
        snow[q] = s;
        coverage += s;
        const visible = s * smoothstep(0, 0.35, ny);
        const white = 0.72 + 0.28 * lambert;
        r += (250 * white - r) * visible;
        gr += (252 * white - gr) * visible;
        bl += (253 * white - bl) * visible;
      }

      let spec = 0;
      if (mode === 'bloom') {
        let hx = LIGHT[0] + vdx;
        let hy = LIGHT[1] + vdy;
        let hz = LIGHT[2] + vdz;
        const hl = Math.hypot(hx, hy, hz) || 1;
        hx /= hl;
        hy /= hl;
        hz /= hl;
        spec = Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), 48);
        r = r * 0.62 + spec * 255;
        gr = gr * 0.62 + spec * 255;
        bl = bl * 0.62 + spec * 255;
      }

      context.fillStyle = `rgb(${r | 0},${gr | 0},${bl | 0})`;
      context.beginPath();
      context.moveTo(sx[a], sy2[a]);
      context.lineTo(sx[b], sy2[b]);
      context.lineTo(sx[c], sy2[c]);
      context.lineTo(sx[d], sy2[d]);
      context.closePath();
      context.fill();
      // Hairline in the fill colour hides anti-aliasing seams between quads.
      context.strokeStyle = context.fillStyle;
      context.lineWidth = 1;
      context.stroke();

      if (doBloom && spec > 0.3) {
        brightCount++;
        const k = Math.min(1, (spec - 0.3) / 0.7);
        brightCtx.fillStyle = `rgba(244,247,238,${k})`;
        brightCtx.beginPath();
        brightCtx.moveTo(sx[a] * bs, sy2[a] * bs);
        brightCtx.lineTo(sx[b] * bs, sy2[b] * bs);
        brightCtx.lineTo(sx[c] * bs, sy2[c] * bs);
        brightCtx.lineTo(sx[d] * bs, sy2[d] * bs);
        brightCtx.closePath();
        brightCtx.fill();
      }
    }

    let maxStrain = 0;
    for (let cIdx = 0; cIdx < constraintCount; cIdx++) {
      if (kinds[cIdx] !== 0) continue;
      const a = pairs[cIdx * 2] * 3;
      const b = pairs[cIdx * 2 + 1] * 3;
      const len = Math.hypot(pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]);
      // Cloth only resists stretching; compression is slack, not strain.
      const strain = Math.max(0, len - restLength[cIdx]) / restLength[cIdx];
      if (strain > maxStrain) maxStrain = strain;
      if (mode === 'xpbd' && strain > 0.004) {
        const ia = pairs[cIdx * 2];
        const ib = pairs[cIdx * 2 + 1];
        context.strokeStyle = `rgba(255,255,255,${Math.min(0.95, strain * 60)})`;
        context.lineWidth = dpr;
        context.beginPath();
        context.moveTo(sx[ia], sy2[ia]);
        context.lineTo(sx[ib], sy2[ib]);
        context.stroke();
      }
    }

    if (doBloom) {
      // Downsample twice and back up: a cheap separable-ish blur at reduced
      // resolution, then additive composition over the scene.
      blurCtx.imageSmoothingEnabled = true;
      blurCtx.clearRect(0, 0, blur.width, blur.height);
      blurCtx.drawImage(bright, 0, 0, blur.width, blur.height);
      brightCtx.globalCompositeOperation = 'lighter';
      brightCtx.drawImage(blur, 0, 0, bright.width, bright.height);
      context.imageSmoothingEnabled = true;
      context.globalCompositeOperation = 'lighter';
      context.globalAlpha = 0.85;
      context.drawImage(bright, 0, 0, width, height);
      context.globalAlpha = 0.6;
      context.drawImage(blur, 0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
    }

    let meanError = 0;
    let maxError = 0;
    if (mode === 'ik' && hasReference) {
      const ref = new Float32Array(3);
      for (const k of IK_JOINTS) {
        const o = k * 3;
        ref[0] = rest0[o];
        ref[1] = rest0[o + 1];
        ref[2] = rest0[o + 2];
        const err = Math.hypot(pos[o] - ref[0], pos[o + 1] - ref[1], pos[o + 2] - ref[2]);
        meanError += err;
        if (err > maxError) maxError = err;

        const [rx, ry] = projectPoint(ref[0], ref[1], ref[2]);
        context.strokeStyle = 'rgba(255,255,255,0.55)';
        context.lineWidth = 1.5 * dpr;
        context.beginPath();
        context.arc(rx, ry, 5 * dpr, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.moveTo(rx, ry);
        context.lineTo(sx[k], sy2[k]);
        context.stroke();
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(sx[k], sy2[k], 3 * dpr, 0, Math.PI * 2);
        context.fill();
      }
      meanError /= IK_JOINTS.length;
    }

    // Pins and the grabbed particle.
    context.fillStyle = 'rgba(255,255,255,0.8)';
    for (const p of PINS) context.fillRect(sx[p] - 3 * dpr, sy2[p] - 3 * dpr, 6 * dpr, 6 * dpr);
    if (grabbed >= 0) {
      context.fillStyle = accent;
      context.beginPath();
      context.arc(sx[grabbed], sy2[grabbed], 6 * dpr, 0, Math.PI * 2);
      context.fill();
    }

    const now = performance.now();
    if (options.onStats && now - lastStats > 200) {
      lastStats = now;
      let value = 0;
      let secondary = maxStrain * 100;
      if (mode === 'xpbd') value = maxStrain * 100;
      if (mode === 'snow') value = (coverage / QUADS) * 100;
      if (mode === 'bloom') value = (brightCount / QUADS) * 100;
      if (mode === 'ik') {
        value = meanError * 1000;
        secondary = maxError * 1000;
      }
      options.onStats({ mode, value, secondary });
    }
  }

  function projectPoint(x0: number, y0: number, z0: number): [number, number] {
    const x = x0 - TARGET[0];
    const y = y0 - TARGET[1];
    const z = z0 - TARGET[2];
    const x1 = cy * x + sy * z;
    const z1 = -sy * x + cy * z;
    const y2 = cp * y - sp * z1;
    const z2 = sp * y + cp * z1;
    const d = DISTANCE - z2;
    return [width / 2 + (x1 * focal) / d, height / 2 - (y2 * focal) / d];
  }

  // --- Loop -----------------------------------------------------------------

  let raf = 0;
  let visible = true;
  let last = performance.now();
  let accumulator = 0;
  let destroyed = false;

  function awake(): boolean {
    if (!options.reducedMotion) return true;
    return grabbed >= 0 || kineticEnergy() > 1e-5;
  }

  function frame(now: number) {
    raf = 0;
    if (destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const simulate = awake();
    if (simulate) {
      accumulator += dt;
      let steps = 0;
      while (accumulator >= FRAME_DT && steps < 3) {
        simulateFrame();
        accumulator -= FRAME_DT;
        steps++;
      }
      if (steps === 3) accumulator = 0;
    }
    render();
    if (simulate || mode === 'snow') requestFrame();
  }

  function requestFrame() {
    if (raf || !visible || destroyed || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  if (options.reducedMotion) {
    // Settle offline so the first frame is already at rest.
    for (let f = 0; f < 420; f++) simulateFrame();
    for (let k = 0; k < N * 3; k++) vel[k] = 0;
    captureReference();
  }

  // --- Input ----------------------------------------------------------------

  function pointerPosition(e: PointerEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [(e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr];
  }

  function onDown(e: PointerEvent) {
    project();
    const [px, py] = pointerPosition(e);
    let best = -1;
    let bestDist = (e.pointerType === 'mouse' ? 36 : 56) * dpr;
    for (let k = 0; k < N; k++) {
      if (invMass[k] === 0) continue;
      const dd = Math.hypot(sx[k] - px, sy2[k] - py);
      if (dd < bestDist) {
        bestDist = dd;
        best = k;
      }
    }
    if (best < 0) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    grabbed = best;
    grabMass = invMass[best];
    invMass[best] = 0;
    grabDepth = depth[best];
    const o = best * 3;
    grabTarget[0] = pos[o];
    grabTarget[1] = pos[o + 1];
    grabTarget[2] = pos[o + 2];
    canvas.dataset.dragging = '';
    requestFrame();
  }

  function onMove(e: PointerEvent) {
    if (grabbed < 0) return;
    const [px, py] = pointerPosition(e);
    const w = unproject(px, py, grabDepth);
    grabTarget[0] = w[0];
    grabTarget[1] = w[1];
    grabTarget[2] = w[2];
    requestFrame();
  }

  function onUp() {
    if (grabbed < 0) return;
    invMass[grabbed] = grabMass;
    grabbed = -1;
    delete canvas.dataset.dragging;
    requestFrame();
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) requestFrame();
  });
  intersection.observe(canvas);

  function onVisibility() {
    if (!document.hidden) requestFrame();
  }
  document.addEventListener('visibilitychange', onVisibility);

  resize();

  return {
    setMode(next) {
      if (next === mode) return;
      mode = next;
      if (mode === 'snow') snow.fill(0);
      requestFrame();
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    },
  };
}
