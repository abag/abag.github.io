/*
 * Hero animations for the home page.
 *
 *  1. Point vortices in a disc (quantum fluids). Each vortex of circulation Γ at z_k has an image of
 *     circulation -Γ at R² z_k / |z_k|², which makes the wall a streamline. Optional mutual friction
 *     (normal fluid at rest, α' = 0) gives dz/dt = V - α s ẑ × V, so dipoles shrink and annihilate and
 *     lone vortices spiral out to the wall. Passive tracers show the flow.
 *
 *  2. Stochastic SIR model of tree disease on a planted lattice (maths biology). Each site is planted
 *     with probability ρ; infected trees infect susceptible trees within ~2 sites with a probability
 *     that decays with distance, and are removed after a fixed infectious period. Above a critical
 *     density (ρ ≈ 0.6 for these parameters) a local outbreak percolates into an epidemic.
 */
(() => {
  "use strict";
  const root = document.querySelector("[data-sim-root]");
  if (!root) return;
  const canvas = root.querySelector("#sim");
  const ctx = canvas.getContext("2d");
  const statusEl = root.querySelector("#sim-status");
  const pauseBtn = root.querySelector("#sim-pause");
  const restartBtn = root.querySelector("#sim-restart");
  const alphaIn = root.querySelector("#alpha"), alphaOut = root.querySelector("#alpha-out");
  const densIn = root.querySelector("#density"), densOut = root.querySelector("#density-out");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = getComputedStyle(document.documentElement);
  const C = (n) => css.getPropertyValue(n).trim();
  const col = {
    ink: C("--ink"), rule: C("--rule"), muted: C("--muted"),
    pos: C("--qf"), neg: C("--qf-neg"), S: C("--bio-s"), I: C("--bio-i"), R: C("--bio-r"), wash: C("--wash"),
  };
  const TAU = Math.PI * 2;

  let W = 0, H = 0, dpr = 1;
  let mode = ["vortices", "forest", "diffusion", "gyro"][Math.floor(Math.random() * 4)];
  let paused = reduceMotion, visible = true, last = 0, raf = 0;

  /* ------------------------------------------------------------------ vortices */
  const Vort = {
    xs: [], ys: [], gs: [], trails: [], flashes: [],
    tracers: null, NT: 700, alpha: 0, nextSign: 1, emptySince: 0,
    delta2: 0.03 * 0.03, rate: 0.32, cx: 0, cy: 0, R: 1,

    reset() {
      const n = 24;
      this.xs = []; this.ys = []; this.gs = []; this.trails = []; this.flashes = [];
      for (let k = 0; k < n; k++) {
        let x, y, ok;
        do { // keep initial vortices apart so nothing starts inside the softening core
          const r = 0.82 * Math.sqrt(Math.random()), th = TAU * Math.random();
          x = r * Math.cos(th); y = r * Math.sin(th); ok = true;
          for (let j = 0; j < this.xs.length; j++)
            if ((x - this.xs[j]) ** 2 + (y - this.ys[j]) ** 2 < 0.012) { ok = false; break; }
        } while (!ok);
        this.add(x, y, k % 2 ? -1 : 1);
      }
      this.tracers = new Float64Array(2 * this.NT);
      for (let i = 0; i < this.NT; i++) this.spawnTracer(i);
      this.emptySince = 0;
    },
    add(x, y, s) { this.xs.push(x); this.ys.push(y); this.gs.push(s); this.trails.push([]); },
    remove(k) { for (const a of [this.xs, this.ys, this.gs, this.trails]) a.splice(k, 1); },
    spawnTracer(i) {
      const r = 0.985 * Math.sqrt(Math.random()), th = TAU * Math.random();
      this.tracers[2 * i] = r * Math.cos(th); this.tracers[2 * i + 1] = r * Math.sin(th);
    },
    // Velocity at (x, y) from all vortices except `skip`, and from every image vortex.
    vel(x, y, X, Y, skip, d2) {
      let u = 0, v = 0;
      const G = this.gs, n = G.length;
      for (let k = 0; k < n; k++) {
        const xk = X[k], yk = Y[k], g = G[k] / TAU;
        if (k !== skip) {
          const dx = x - xk, dy = y - yk, f = g / (dx * dx + dy * dy + d2);
          u -= f * dy; v += f * dx;
        }
        const r2 = xk * xk + yk * yk;
        if (r2 > 1e-8) {
          const xi = xk / r2, yi = yk / r2, dx = x - xi, dy = y - yi, f = -g / (dx * dx + dy * dy + d2);
          u -= f * dy; v += f * dx;
        }
      }
      return [u, v];
    },
    deriv(X, Y, outU, outV) {
      const a = this.alpha;
      for (let j = 0; j < X.length; j++) {
        const [u, v] = this.vel(X[j], Y[j], X, Y, j, this.delta2);
        const s = this.gs[j];
        outU[j] = u + a * s * v;  // V - α s ẑ×V, with ẑ×(u,v) = (-v,u)
        outV[j] = v - a * s * u;
      }
    },
    rk4(h) {
      const n = this.xs.length; if (!n) return;
      const X = Float64Array.from(this.xs), Y = Float64Array.from(this.ys);
      const k = Array.from({ length: 8 }, () => new Float64Array(n));
      const tX = new Float64Array(n), tY = new Float64Array(n);
      this.deriv(X, Y, k[0], k[1]);
      for (let j = 0; j < n; j++) { tX[j] = X[j] + 0.5 * h * k[0][j]; tY[j] = Y[j] + 0.5 * h * k[1][j]; }
      this.deriv(tX, tY, k[2], k[3]);
      for (let j = 0; j < n; j++) { tX[j] = X[j] + 0.5 * h * k[2][j]; tY[j] = Y[j] + 0.5 * h * k[3][j]; }
      this.deriv(tX, tY, k[4], k[5]);
      for (let j = 0; j < n; j++) { tX[j] = X[j] + h * k[4][j]; tY[j] = Y[j] + h * k[5][j]; }
      this.deriv(tX, tY, k[6], k[7]);
      for (let j = 0; j < n; j++) {
        this.xs[j] = X[j] + (h / 6) * (k[0][j] + 2 * k[2][j] + 2 * k[4][j] + k[6][j]);
        this.ys[j] = Y[j] + (h / 6) * (k[1][j] + 2 * k[3][j] + 2 * k[5][j] + k[7][j]);
      }
    },
    advectTracers(h) {
      const T = this.tracers, X = this.xs, Y = this.ys, d2 = 0.0025;
      for (let i = 0; i < this.NT; i++) {
        let x = T[2 * i], y = T[2 * i + 1];
        const [u1, v1] = this.vel(x, y, X, Y, -1, d2);
        const [u2, v2] = this.vel(x + 0.5 * h * u1, y + 0.5 * h * v1, X, Y, -1, d2);
        x += h * u2; y += h * v2;
        const r = Math.hypot(x, y);
        if (r > 0.992) { x *= 0.992 / r; y *= 0.992 / r; }
        T[2 * i] = x; T[2 * i + 1] = y;
      }
      for (let m = 0; m < 2; m++) this.spawnTracer((Math.random() * this.NT) | 0);  // slow refresh avoids clumping
    },
    events() {
      // annihilate close opposite-sign pairs; vortices that reach the wall leave the fluid
      for (let j = this.xs.length - 1; j >= 0; j--) {
        if (Math.hypot(this.xs[j], this.ys[j]) > 0.975) {
          this.flashes.push({ x: this.xs[j], y: this.ys[j], t: 0 }); this.remove(j); continue;
        }
      }
      outer: for (let j = 0; j < this.xs.length; j++)
        for (let k = j + 1; k < this.xs.length; k++)
          if (this.gs[j] !== this.gs[k] && Math.hypot(this.xs[j] - this.xs[k], this.ys[j] - this.ys[k]) < 0.022) {
            this.flashes.push({ x: (this.xs[j] + this.xs[k]) / 2, y: (this.ys[j] + this.ys[k]) / 2, t: 0 });
            this.remove(k); this.remove(j); j--; continue outer;
          }
    },
    step(dt, now) {
      const T = dt * this.rate, sub = Math.max(2, Math.ceil(T / 0.0012)), h = T / sub;
      for (let s = 0; s < sub; s++) { this.rk4(h); this.events(); }
      this.advectTracers(T);
      for (let j = 0; j < this.xs.length; j++) {
        const tr = this.trails[j]; tr.push(this.xs[j], this.ys[j]);
        if (tr.length > 180) tr.splice(0, tr.length - 180);
      }
      for (const f of this.flashes) f.t += dt;
      this.flashes = this.flashes.filter((f) => f.t < 0.8);
      if (!this.xs.length) {
        if (!this.emptySince) this.emptySince = now;
        else if (now - this.emptySince > 2500) this.reset();
      } else this.emptySince = 0;
    },
    layout() {
      this.R = Math.min(W, H) * 0.47; this.cx = W / 2; this.cy = H / 2;
    },
    toPx(x, y) { return [this.cx + this.R * x, this.cy - this.R * y]; },
    draw() {
      ctx.clearRect(0, 0, W, H);
      const R = this.R;
      ctx.lineWidth = 1.25; ctx.strokeStyle = col.ink;
      ctx.beginPath(); ctx.arc(this.cx, this.cy, R, 0, TAU); ctx.stroke();
      // tracers
      ctx.fillStyle = "rgba(34,48,60,0.30)";
      const T = this.tracers, sz = R > 150 ? 1.6 : 1.2;
      for (let i = 0; i < this.NT; i++) {
        const [px, py] = this.toPx(T[2 * i], T[2 * i + 1]);
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }
      // trails, fading towards the tail
      ctx.lineWidth = 1.4; ctx.lineCap = "round";
      for (let j = 0; j < this.xs.length; j++) {
        const tr = this.trails[j], n = tr.length / 2; if (n < 2) continue;
        ctx.strokeStyle = this.gs[j] > 0 ? col.pos : col.neg;
        const seg = 6;
        for (let a = 0; a < n - 1; a += seg) {
          ctx.globalAlpha = 0.45 * (a / n);
          ctx.beginPath();
          let [px, py] = this.toPx(tr[2 * a], tr[2 * a + 1]); ctx.moveTo(px, py);
          for (let b = a + 1; b <= Math.min(a + seg, n - 1); b++) { [px, py] = this.toPx(tr[2 * b], tr[2 * b + 1]); ctx.lineTo(px, py); }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      // annihilation / exit flashes
      for (const f of this.flashes) {
        const [px, py] = this.toPx(f.x, f.y), k = f.t / 0.8;
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = col.ink; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, 4 + 22 * k, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // vortices: filled disc plus a short arc arrow showing the sense of rotation
      const rv = R > 150 ? 5.5 : 4.5;
      for (let j = 0; j < this.xs.length; j++) {
        const [px, py] = this.toPx(this.xs[j], this.ys[j]), s = this.gs[j];
        const c = s > 0 ? col.pos : col.neg;
        ctx.fillStyle = c; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, rv, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = c; ctx.lineWidth = 1.2;
        const a0 = s > 0 ? 0.3 : -0.3, a1 = s > 0 ? 2.4 : -2.4, rr = rv + 4;
        ctx.beginPath(); ctx.arc(px, py, rr, -a0, -a1, s > 0); ctx.stroke();
        const ax = px + rr * Math.cos(-a1), ay = py + rr * Math.sin(-a1), tang = -a1 + (s > 0 ? -Math.PI / 2 : Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 4 * Math.cos(tang - 0.5), ay - 4 * Math.sin(tang - 0.5));
        ctx.moveTo(ax, ay); ctx.lineTo(ax - 4 * Math.cos(tang + 0.5), ay - 4 * Math.sin(tang + 0.5));
        ctx.stroke();
      }
    },
    click(px, py) {
      const x = (px - this.cx) / this.R, y = -(py - this.cy) / this.R;
      if (x * x + y * y > 0.92 * 0.92 || this.xs.length >= 60) return;
      this.add(x, y, this.nextSign); this.nextSign *= -1; this.draw();
    },
    status() {
      const n = this.xs.length, p = this.gs.filter((g) => g > 0).length;
      if (!n) return "All vortices gone; restarting";
      return `${n} vortices: ${p} anticlockwise, ${n - p} clockwise`;
    },
  };

  /* ------------------------------------------------------------------ forest */
  const Forest = {
    p0: 0.08, lam: 0.5, reach: 2.3, TI: 8, stepsPerSec: 30,
    cols: 0, rows: 0, cs: 10, st: null, age: null, jit: null, offs: [],
    planted: 0, hist: [], acc: 0, doneAt: 0, density: 0.7, ox: 0, oy: 0, plotTop: 0,

    layout() {
      const plotH = Math.max(64, Math.min(120, H * 0.22));
      const forestH = H - plotH - 18;
      this.cs = Math.max(7, Math.min(11, Math.sqrt((W * forestH) / 5200)));
      const cols = Math.floor(W / this.cs), rows = Math.floor(forestH / this.cs);
      if (cols !== this.cols || rows !== this.rows) { this.cols = cols; this.rows = rows; this.reset(); }
      this.ox = (W - cols * this.cs) / 2 + this.cs / 2; this.oy = this.cs / 2;
      this.plotTop = rows * this.cs + 18;
    },
    reset() {
      const N = this.cols * this.rows; if (!N) return;
      this.st = new Uint8Array(N); this.age = new Uint8Array(N); this.jit = new Float32Array(2 * N);
      this.planted = 0;
      for (let i = 0; i < N; i++) {
        this.jit[2 * i] = (Math.random() - 0.5) * 0.36; this.jit[2 * i + 1] = (Math.random() - 0.5) * 0.36;
        if (Math.random() < this.density) { this.st[i] = 1; this.planted++; }
      }
      this.offs = [];
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const d = Math.hypot(dx, dy); if (!d || d > this.reach) continue;
        this.offs.push([dx, dy, this.p0 * Math.exp(-(d - 1) / this.lam)]);
      }
      const c0 = Math.floor(this.cols * (0.15 + 0.2 * Math.random())), r0 = Math.floor(this.rows * (0.3 + 0.4 * Math.random()));
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) this.infect((r0 + dy) * this.cols + c0 + dx);
      this.hist = []; this.record(); this.doneAt = 0; this.acc = 0;
    },
    infect(i) { if (this.st[i] === 1) { this.st[i] = 2; this.age[i] = 0; return true; } return false; },
    counts() {
      let s = 0, i = 0, r = 0;
      for (const v of this.st) { if (v === 1) s++; else if (v === 2) i++; else if (v === 3) r++; }
      return [s, i, r];
    },
    record() { this.hist.push(this.counts()); },
    tick() {
      const { st, age, cols, rows } = this, fresh = [];
      for (let i = 0; i < st.length; i++) {
        if (st[i] !== 2) continue;
        const x = i % cols, y = (i / cols) | 0;
        for (const [dx, dy, p] of this.offs) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          const j = yy * cols + xx;
          if (st[j] === 1 && Math.random() < p) { st[j] = 4; fresh.push(j); }
        }
        if (++age[i] >= this.TI) st[i] = 3;
      }
      for (const j of fresh) { st[j] = 2; age[j] = 0; }
      this.record();
    },
    step(dt, now) {
      const I = this.hist[this.hist.length - 1][1];
      if (I === 0) {
        if (!this.doneAt) this.doneAt = now;
        else if (now - this.doneAt > 3500) this.reset();
        return;
      }
      this.acc += dt * this.stepsPerSec;
      while (this.acc >= 1) { this.tick(); this.acc -= 1; }
    },
    draw() {
      ctx.clearRect(0, 0, W, H);
      const { st, jit, cols, cs, ox, oy } = this;
      const rS = cs * 0.38, rI = cs * 0.42, rR = cs * 0.2;
      for (const [state, colour, r] of [[1, col.S, rS], [3, col.R, rR], [2, col.I, rI]]) {
        ctx.fillStyle = colour; ctx.beginPath();
        for (let i = 0; i < st.length; i++) {
          if (st[i] !== state) continue;
          const x = ox + ((i % cols) + jit[2 * i]) * cs, y = oy + (((i / cols) | 0) + jit[2 * i + 1]) * cs;
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
        }
        ctx.fill();
      }
      this.drawCurve();
    },
    drawCurve() {
      const top = this.plotTop, h = H - top - 4, left = Math.max(this.ox - this.cs / 2, 8), labelW = 118;
      const w = Math.max(60, W - left * 2 - labelW);
      const n = this.hist.length, span = Math.max(240, n), P = this.planted || 1;
      ctx.strokeStyle = col.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, top + h + 0.5); ctx.lineTo(left + w, top + h + 0.5); ctx.stroke();
      const series = [[0, col.S, "susceptible"], [1, col.I, "infected"], [2, col.R, "removed"]];
      ctx.lineWidth = 1.75; ctx.lineJoin = "round";
      for (const [k, colour] of series) {
        ctx.strokeStyle = colour; ctx.beginPath();
        const stride = Math.max(1, Math.floor(n / w));
        for (let t = 0; t < n; t += stride) {
          const x = left + (t / span) * w, y = top + h - (this.hist[t][k] / P) * h;
          t ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      const lastC = this.hist[n - 1];
      ctx.font = `${Math.max(12, Math.min(14, h / 5))}px Newsreader, Georgia, serif`;
      ctx.textBaseline = "middle";
      const xEnd = left + ((n - 1) / span) * w + 8;
      const ys = series.map(([k]) => top + h - (lastC[k] / P) * h);
      // nudge labels apart so they never overlap
      // stack labels upwards from the axis so they never overlap or fall below it
      const order = [0, 1, 2].sort((a, b) => ys[b] - ys[a]), gap = 15;
      ys[order[0]] = Math.min(ys[order[0]], top + h - 6);
      for (let m = 1; m < 3; m++) ys[order[m]] = Math.min(ys[order[m]], ys[order[m - 1]] - gap);
      series.forEach(([k, colour, name], m) => {
        ctx.fillStyle = colour;
        ctx.fillText(`${name} ${Math.round((100 * lastC[k]) / P)}%`, xEnd, ys[m]);
      });
    },
    click(px, py) {
      const cx = Math.round((px - this.ox) / this.cs), cy = Math.round((py - this.oy) / this.cs);
      if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return;
      let hit = false;
      for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1 && !hit; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && y >= 0 && x < this.cols && y < this.rows) hit = this.infect(y * this.cols + x);
      }
      if (hit) { this.doneAt = 0; this.hist[this.hist.length - 1] = this.counts(); this.draw(); }
    },
    status() {
      const [s, i, r] = this.hist[this.hist.length - 1], P = this.planted || 1;
      if (i === 0) return `Outbreak over after ${this.hist.length - 1} steps: ${Math.round((100 * r) / P)}% of trees lost`;
      return `Step ${this.hist.length - 1}`;
    },
  };

  /* ------------------------------------------------------------------ diffusion model */
  /*
   * Schematic of learning a spatially varying transmission field with a generative diffusion model.
   *  - A hidden transmission field β(x) (smooth random field) drives a stochastic SI outbreak on a grid.
   *  - Only a sparse survey of sites (infected or not at the snapshot time) is observed.
   *  - A reverse diffusion process (DDIM-style, cosine schedule) turns pure noise into a sample of β.
   * The trained network is replaced by a simple stand-in: its prediction of the clean field is a kernel
   * posterior built from the surveyed sites, informative only where the outbreak has been, plus
   * smooth sample-specific variation scaled by the posterior uncertainty. Early in the reverse process
   * the prediction is the posterior mean; late in the process it commits to one sample.
   */
  const PURD = ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"]
    .map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  function purd(v) {
    const t = Math.min(1, Math.max(0, v)) * (PURD.length - 1), i = Math.min(PURD.length - 2, Math.floor(t)), f = t - i;
    const a = PURD[i], b = PURD[i + 1];
    return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1]), a[2] + f * (b[2] - a[2])];
  }
  function gauss() { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random()); }

  const Diff = {
    N: 48, M: 160, steps: 80, stepsPerSec: 16, kRate: 0.25, mu: 0.45, scale: 0.3,
    truth: null, infT: null, snap: 0, sites: [], zMean: null, zSd: null, xi: null, x: null,
    k: 0, phase: "outbreak", t: 0, sampleNo: 0, corr: 0, panels: null,
    off: null, offCtx: null,

    reset() {
      const N = this.N, NN = N * N;
      // hidden transmission field: a few random Gaussian bumps, rescaled to [0.05, 1]
      const f = new Float32Array(NN), bumps = [];
      for (let b = 0; b < 7; b++) bumps.push([Math.random() * N, Math.random() * N, 4 + 7 * Math.random(), Math.random() * 2.2 - 1]);
      for (let i = 0; i < NN; i++) {
        const x = i % N, y = (i / N) | 0;
        for (const [cx, cy, w, a] of bumps) f[i] += a * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * w * w));
      }
      let lo = Infinity, hi = -Infinity;
      for (const v of f) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      for (let i = 0; i < NN; i++) f[i] = 0.05 + 0.95 * (f[i] - lo) / (hi - lo || 1);
      this.truth = f;
      this.runOutbreak();
      // sparse survey at the snapshot time
      const pick = new Set();
      while (pick.size < this.M) pick.add((Math.random() * NN) | 0);
      this.sites = [...pick].map((i) => ({ i, x: i % N, y: (i / N) | 0, inf: this.infT[i] >= 0 }));
      this.posterior();
      this.sampleNo = 0; this.newSample();
      this.phase = "outbreak"; this.t = 0;
    },
    runOutbreak() {
      const N = this.N, NN = N * N, T = this.truth, inf = new Int16Array(NN).fill(-1);
      let seed;
      do seed = (Math.random() * NN) | 0; while (T[seed] < 0.55);
      inf[seed] = 0;
      let count = 1, step = 0;
      while (count < 0.5 * NN && step < 400) {
        step++;
        const fresh = [];
        for (let i = 0; i < NN; i++) {
          if (inf[i] >= 0) continue;
          const x = i % N, y = (i / N) | 0;
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx, yy = y + dy;
            if ((dx || dy) && xx >= 0 && yy >= 0 && xx < N && yy < N && inf[yy * N + xx] >= 0) n++;
          }
          if (n && Math.random() < 1 - Math.exp(-this.kRate * T[i] * n)) fresh.push(i);
        }
        for (const i of fresh) inf[i] = step;
        count += fresh.length;
      }
      this.infT = inf; this.snap = step;
    },
    posterior() {
      // stand-in for the trained denoiser: kernel posterior from the survey, in standardised units
      const N = this.N, NN = N * N, ell2 = 2 * 4.5 * 4.5, lam = 0.5;
      const obs = this.sites.map((s) => {
        let w = 1;
        if (!s.inf) { // healthy sites only inform transmission if they sit near the outbreak front
          w = 0.02;
          for (let dy = -3; dy <= 3 && w < 0.8; dy++) for (let dx = -3; dx <= 3; dx++) {
            const xx = s.x + dx, yy = s.y + dy;
            if (xx >= 0 && yy >= 0 && xx < N && yy < N && this.infT[yy * N + xx] >= 0) { w = 0.8; break; }
          }
        }
        return [s.x, s.y, w, (this.truth[s.i] + 0.04 * gauss() - this.mu) / this.scale];
      });
      this.zMean = new Float32Array(NN); this.zSd = new Float32Array(NN);
      for (let i = 0; i < NN; i++) {
        const x = i % N, y = (i / N) | 0;
        let S = 0, num = 0;
        for (const [ox, oy, w, v] of obs) { const k = w * Math.exp(-((x - ox) ** 2 + (y - oy) ** 2) / ell2); S += k; num += k * v; }
        this.zMean[i] = num / (S + lam);
        this.zSd[i] = 1.1 * lam / (S + lam) + 0.1;
      }
    },
    smoothNoise() {
      // white noise blurred by three box passes, rescaled to unit variance
      const N = this.N, NN = N * N, r = 4;
      let a = Float32Array.from({ length: NN }, gauss), b = new Float32Array(NN);
      for (let pass = 0; pass < 3; pass++) for (const horiz of [true, false]) {
        for (let i = 0; i < NN; i++) {
          const x = i % N, y = (i / N) | 0;
          let s = 0, c = 0;
          for (let d = -r; d <= r; d++) {
            const xx = horiz ? x + d : x, yy = horiz ? y : y + d;
            if (xx >= 0 && yy >= 0 && xx < N && yy < N) { s += a[yy * N + xx]; c++; }
          }
          b[i] = s / c;
        }
        [a, b] = [b, a];
      }
      let m = 0, v = 0;
      for (const q of a) m += q; m /= NN;
      for (const q of a) v += (q - m) ** 2; v = Math.sqrt(v / NN) || 1;
      for (let i = 0; i < NN; i++) a[i] = (a[i] - m) / v;
      return a;
    },
    newSample() {
      this.xi = this.smoothNoise();
      this.x = Float32Array.from({ length: this.N * this.N }, gauss);
      this.k = this.steps; this.sampleNo++;
    },
    abar(s) { return Math.cos(((s + 0.008) / 1.008) * Math.PI / 2) ** 2; },
    reverseStep() {
      const T = this.steps, k = this.k, ac = this.abar(k / T), an = this.abar((k - 1) / T);
      const g = Math.sqrt(ac), eta = 0.6;
      const sig = eta * Math.sqrt((1 - an) / (1 - ac)) * Math.sqrt(Math.max(0, 1 - ac / an));
      const c = Math.sqrt(Math.max(0, 1 - an - sig * sig));
      const { x, zMean, zSd, xi } = this;
      for (let i = 0; i < x.length; i++) {
        const x0 = zMean[i] + g * zSd[i] * xi[i];            // predicted clean field
        const e = (x[i] - Math.sqrt(ac) * x0) / Math.sqrt(1 - ac); // implied noise
        x[i] = Math.sqrt(an) * x0 + c * e + sig * gauss();
      }
      this.k--;
      if (this.k === 0) this.corr = this.correlation();
    },
    field(i) { return this.mu + this.scale * this.x[i]; },
    correlation() {
      const n = this.x.length; let ma = 0, mb = 0;
      for (let i = 0; i < n; i++) { ma += this.field(i); mb += this.truth[i]; }
      ma /= n; mb /= n;
      let sab = 0, saa = 0, sbb = 0;
      for (let i = 0; i < n; i++) { const a = this.field(i) - ma, b = this.truth[i] - mb; sab += a * b; saa += a * a; sbb += b * b; }
      return sab / Math.sqrt(saa * sbb);
    },
    step(dt) {
      this.t += dt;
      if (this.phase === "outbreak" && this.t > 3.5) { this.phase = "survey"; this.t = 0; }
      else if (this.phase === "survey" && this.t > 1.4) { this.phase = "diffusion"; this.t = 0; }
      else if (this.phase === "diffusion") {
        const target = this.steps - Math.min(this.steps, Math.floor(this.t * this.stepsPerSec));
        while (this.k > target) this.reverseStep();
        if (this.k === 0) { this.phase = this.sampleNo === 1 ? "reveal" : "hold"; this.t = 0; }
      } else if (this.phase === "reveal" && this.t > 1.2) { this.phase = "hold"; this.t = 0; }
      else if (this.phase === "hold" && this.t > 4.5) {
        if (this.sampleNo < 2) { this.newSample(); this.phase = "diffusion"; this.t = 0; }
        else this.reset();
      }
    },
    finish() { // jump to a finished first sample (used when motion is reduced)
      this.phase = "diffusion";
      while (this.k > 0) this.reverseStep();
      this.phase = "hold"; this.t = 0;
    },
    layout() {
      const gap = Math.max(14, W * 0.025), labelH = 50;
      let p, boxes;
      if (W / H > 1.3) {
        p = Math.min((W - 2 * gap) / 3, H - labelH - 6);
        const x0 = (W - 3 * p - 2 * gap) / 2;
        const y0 = Math.max(4, (H - p - labelH) / 2);
        boxes = [[x0, y0], [x0 + p + gap, y0], [x0 + 2 * (p + gap), y0]];
        this.narrow = false;
      } else {
        p = Math.min((W - gap) / 2, (H - 2 * labelH - 10) / 2);
        const x0 = (W - 2 * p - gap) / 2, y0 = Math.max(4, (H - 2 * (p + labelH)) / 2);
        boxes = [[x0, y0], [(W - p) / 2, y0 + p + labelH], [x0 + p + gap, y0]];
        this.narrow = true;
      }
      this.panels = { p, snap: boxes[0], gen: boxes[1], truth: boxes[2] };
      if (!this.truth) this.reset();
    },
    heat(values, alpha) {
      const N = this.N;
      if (!this.off) { this.off = document.createElement("canvas"); this.off.width = this.off.height = N; this.offCtx = this.off.getContext("2d"); }
      const img = this.offCtx.createImageData(N, N);
      for (let i = 0; i < N * N; i++) {
        const [r, g, b] = purd(values(i));
        img.data[4 * i] = r; img.data[4 * i + 1] = g; img.data[4 * i + 2] = b; img.data[4 * i + 3] = 255 * (alpha ? alpha(i) : 1);
      }
      this.offCtx.putImageData(img, 0, 0);
      return this.off;
    },
    panel(box, smooth, src, alpha = 1) {
      const [x, y] = box, p = this.panels.p;
      ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = smooth; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(src, x, y, p, p); ctx.restore();
    },
    frameBox(box) { const [x, y] = box, p = this.panels.p; ctx.strokeStyle = col.rule; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, p - 1, p - 1); },
    label(box, text, sub) {
      const [x, y] = box, p = this.panels.p;
      ctx.fillStyle = col.ink; ctx.font = `${this.narrow ? 13 : 15}px Newsreader, Georgia, serif`; ctx.textBaseline = "alphabetic"; ctx.textAlign = "center";
      ctx.fillText(text, x + p / 2, y + p + 20);
      if (sub) { ctx.fillStyle = col.muted; ctx.font = `italic ${this.narrow ? 12 : 13}px Newsreader, Georgia, serif`; ctx.fillText(sub, x + p / 2, y + p + 37); }
      ctx.textAlign = "left";
    },
    legend(box) {
      const [x, y] = box, p = this.panels.p, w = Math.min(110, p * 0.4), lx = x + p / 2 - w / 2, ly = y + p + 31;
      const g = ctx.createLinearGradient(lx, 0, lx + w, 0);
      PURD.forEach((c, i) => g.addColorStop(i / (PURD.length - 1), `rgb(${c})`));
      ctx.fillStyle = g; ctx.fillRect(lx, ly, w, 7);
      ctx.fillStyle = col.muted; ctx.font = "italic 13px Newsreader, Georgia, serif"; ctx.textBaseline = "middle";
      ctx.textAlign = "right"; ctx.fillText("low", lx - 6, ly + 4);
      ctx.textAlign = "left"; ctx.fillText("high transmission", lx + w + 6, ly + 4);
    },
    draw() {
      ctx.clearRect(0, 0, W, H);
      const { snap, gen, truth, p } = this.panels, N = this.N, ph = this.phase;
      // left: the outbreak, then the sparse survey that is all the model sees
      ctx.fillStyle = col.wash; ctx.fillRect(snap[0], snap[1], p, p);
      const now = ph === "outbreak" ? (this.t / 3.5) * this.snap : this.snap;
      const fade = ph === "outbreak" ? 1 : ph === "survey" ? Math.max(0, 1 - this.t / 1.2) : 0;
      if (fade > 0) {
        this.heat(() => 0); // make sure the offscreen canvas exists
        const im = this.offCtx.createImageData(N, N);
        for (let i = 0; i < N * N; i++) {
          const on = this.infT[i] >= 0 && this.infT[i] <= now;
          im.data[4 * i] = 224; im.data[4 * i + 1] = 130; im.data[4 * i + 2] = 20; im.data[4 * i + 3] = on ? 150 : 0;
        }
        this.offCtx.putImageData(im, 0, 0);
        this.panel(snap, false, this.off, fade);
      }
      if (ph !== "outbreak") {
        const a = ph === "survey" ? Math.min(1, this.t / 0.8) : 1, r = Math.max(2.4, p / 95);
        ctx.globalAlpha = a; ctx.lineWidth = 1.6;
        for (const s of this.sites) {
          const cx = snap[0] + (s.x + 0.5) * p / N, cy = snap[1] + (s.y + 0.5) * p / N;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
          if (s.inf) { ctx.fillStyle = col.I; ctx.fill(); } else { ctx.strokeStyle = col.S; ctx.stroke(); }
        }
        ctx.globalAlpha = 1;
      }
      this.frameBox(snap);
      const nar = this.narrow;
      this.label(snap, ph === "outbreak" ? (nar ? "Outbreak" : "An outbreak spreads") : (nar ? "Survey data" : "Survey: what the model sees"),
        ph === "outbreak" ? (nar ? "" : "across a hidden landscape") : nar ? `${this.M} sites` : `${this.M} sites, infected or healthy`);
      // centre: reverse diffusion from noise to a transmission map
      this.panel(gen, true, this.heat((i) => this.field(i)));
      this.frameBox(gen);
      const t = Math.round((1000 * this.k) / this.steps);
      this.label(gen, ph === "diffusion" ? `Reverse diffusion, t = ${t}` : (ph === "outbreak" || ph === "survey") ? "Diffusion model, t = 1000" : (nar ? `Model sample ${this.sampleNo}` : `Sample ${this.sampleNo} from the model`));
      this.legend(gen);
      // right: the hidden truth, revealed once the first sample is drawn
      const shown = ph === "reveal" ? Math.min(1, this.t / 1.2) : (ph === "hold" || this.sampleNo > 1) ? 1 : 0;
      ctx.fillStyle = col.wash; ctx.fillRect(truth[0], truth[1], p, p);
      if (shown < 1) {
        ctx.fillStyle = col.muted; ctx.font = "italic 15px Newsreader, Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("hidden", truth[0] + p / 2, truth[1] + p / 2); ctx.textAlign = "left";
      }
      if (shown > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(truth[0], truth[1], p * shown, p); ctx.clip();
        ctx.fillStyle = "#fff"; ctx.fillRect(truth[0], truth[1], p, p);
        this.panel(truth, true, this.heat((i) => this.truth[i]));
        ctx.restore();
      }
      this.frameBox(truth);
      this.label(truth, nar ? "True field" : "True transmission field",
        shown > 0 && this.k === 0 ? (nar ? `correlation ${this.corr.toFixed(2)}` : `correlation with sample: ${this.corr.toFixed(2)}`) : "");
    },
    click() { if (this.phase === "hold" || this.phase === "reveal") { if (this.sampleNo >= 2) this.sampleNo = 1; this.newSample(); this.phase = "diffusion"; this.t = 0; } },
    status() {
      switch (this.phase) {
        case "outbreak": return "An outbreak spreads through a landscape of varying transmission";
        case "survey": return `Surveying ${this.M} sites`;
        case "diffusion": return `Denoising sample ${this.sampleNo}: step ${this.steps - this.k} of ${this.steps}`;
        default: return `Sample ${this.sampleNo}: correlation with the true field ${this.corr.toFixed(2)}`;
      }
    },
  };

  /* ------------------------------------------------------------------ gyrotactic swimmers */
  /*
   * Bottom-heavy (gyrotactic) swimming cells in the ABC flow u = (sin z + cos y, sin x + cos z, sin y + cos x),
   * after Heath-Richardson, Baggaley & Hill, Phys. Rev. Fluids 3, 023102 (2018). Spherical cells obey
   *     dx/dt = u + Φ p,     dp/dt = [k − (k·p) p] / (2B) + ½ ω × p,
   * where p is the swimming direction, k points up, Φ is swimming speed relative to the flow speed and B is the
   * gyrotactic reorientation time. The ABC flow is Beltrami, so the vorticity ω equals u.
   * LYAP is the largest Lyapunov exponent of this model for B = 0.25, computed offline (16 cells, t = 250 each).
   */
  const LYAP = [[0, 0.0248], [0.15, 0.0137], [0.3, 0.0045], [0.45, -0.0026], [0.6, -0.0035], [0.75, -0.0003],
    [0.9, -0.0021], [1.05, -0.0043], [1.2, -0.0036], [1.35, 0.0039], [1.5, 0.0059], [1.65, 0.0044], [1.8, 0.0049],
    [1.95, 0.0044], [2.1, 0.0058], [2.25, 0.0011], [2.4, -0.0039], [2.55, -0.0028], [2.7, -0.0056], [2.85, -0.0023], [3, -0.0044]];

  const Gyro = {
    N: 800, Bg: 0.25, Phi: 1.0, rate: 4, h: 0.04, trailLen: 9,
    S: null, trails: null, head: 0, yaw: 0.6, pitch: 0.38, spin: 0.12, dragging: false,
    occ: 1, occT: 0, view: null,

    reset() {
      const N = this.N;
      this.S = new Float64Array(6 * N);
      for (let k = 0; k < N; k++) {
        const th = Math.acos(2 * Math.random() - 1), ph = TAU * Math.random(), o = 6 * k;
        this.S[o] = TAU * Math.random(); this.S[o + 1] = TAU * Math.random(); this.S[o + 2] = TAU * Math.random();
        this.S[o + 3] = Math.sin(th) * Math.cos(ph); this.S[o + 4] = Math.sin(th) * Math.sin(ph); this.S[o + 5] = Math.cos(th);
      }
      this.trails = new Float32Array(3 * N * this.trailLen).fill(NaN); this.head = 0;
      this.measure();
    },
    rhs(s, o, out) {
      const x = s[o], y = s[o + 1], z = s[o + 2], px = s[o + 3], py = s[o + 4], pz = s[o + 5];
      const u = Math.sin(z) + Math.cos(y), v = Math.sin(x) + Math.cos(z), w = Math.sin(y) + Math.cos(x);
      const g = 1 / (2 * this.Bg), F = this.Phi;
      out[0] = u + F * px; out[1] = v + F * py; out[2] = w + F * pz;
      out[3] = -g * pz * px + 0.5 * (v * pz - w * py);
      out[4] = -g * pz * py + 0.5 * (w * px - u * pz);
      out[5] = g * (1 - pz * pz) + 0.5 * (u * py - v * px);
    },
    advance(T) {
      const steps = Math.max(1, Math.round(T / this.h)), h = T / steps, S = this.S;
      const k1 = new Float64Array(6), k2 = new Float64Array(6), k3 = new Float64Array(6), k4 = new Float64Array(6), t = new Float64Array(6);
      for (let n = 0; n < steps; n++) for (let c = 0; c < this.N; c++) {
        const o = 6 * c;
        this.rhs(S, o, k1); for (let i = 0; i < 6; i++) t[i] = S[o + i] + 0.5 * h * k1[i];
        this.rhs(t, 0, k2); for (let i = 0; i < 6; i++) t[i] = S[o + i] + 0.5 * h * k2[i];
        this.rhs(t, 0, k3); for (let i = 0; i < 6; i++) t[i] = S[o + i] + h * k3[i];
        this.rhs(t, 0, k4);
        for (let i = 0; i < 6; i++) S[o + i] += (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
        const m = Math.hypot(S[o + 3], S[o + 4], S[o + 5]); S[o + 3] /= m; S[o + 4] /= m; S[o + 5] /= m;
        for (let i = 0; i < 3; i++) S[o + i] = ((S[o + i] % TAU) + TAU) % TAU;  // periodic cell
      }
    },
    measure() {  // fraction of a 24 × 24 horizontal grid that contains at least one cell
      const G = 24, seen = new Uint8Array(G * G);
      for (let c = 0; c < this.N; c++) seen[Math.floor(this.S[6 * c] / TAU * G) % G + G * (Math.floor(this.S[6 * c + 1] / TAU * G) % G)] = 1;
      let n = 0; for (const v of seen) n += v;
      this.occ = n / (G * G);
    },
    step(dt) {
      this.advance(dt * this.rate);
      if (!this.dragging) this.yaw += this.spin * dt;
      const L = this.trailLen, base = 3 * this.N * this.head;
      for (let c = 0; c < this.N; c++) for (let i = 0; i < 3; i++) this.trails[base + 3 * c + i] = this.S[6 * c + i];
      this.head = (this.head + 1) % L;
      this.occT += dt;
      if (this.occT > 0.4) { this.occT = 0; this.measure(); }
    },
    layout() {
      const wide = W / H > 1.3;
      const chart = wide ? { w: Math.min(250, W * 0.26), h: 132 } : { w: Math.min(W - 24, 300), h: 104 };
      chart.x = wide ? W - chart.w - 6 : (W - chart.w) / 2;
      chart.y = wide ? H - chart.h - 18 : H - chart.h - 14;
      const boxW = wide ? W - chart.w - 24 : W, boxH = wide ? H : H - chart.h - 30;
      this.view = { cx: boxW / 2, cy: boxH / 2 + 4, k: Math.min(boxW, boxH) / (2 * Math.PI * 1.75), chart };
      if (!this.S) this.reset();
    },
    project(x, y, z) {  // centred periodic cell -> screen, with a gentle perspective
      const X = x - Math.PI, Y = y - Math.PI, Z = z - Math.PI, cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
      const x1 = X * cy - Y * sy, y1 = X * sy + Y * cy, cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      const depth = y1 * cp + Z * sp, up = Z * cp - y1 * sp, s = 1 / (1 + depth / (4 * Math.PI)), v = this.view;
      return [v.cx + x1 * s * v.k, v.cy - up * s * v.k, depth];
    },
    draw() {
      ctx.clearRect(0, 0, W, H);
      const T = TAU, v = this.view;
      // the periodic cell
      const corners = [];
      for (let i = 0; i < 8; i++) corners.push(this.project(i & 1 ? T : 0, i & 2 ? T : 0, i & 4 ? T : 0));
      ctx.strokeStyle = col.rule; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 8; i++) for (const b of [1, 2, 4]) if (!(i & b)) {
        const a = corners[i], c = corners[i | b]; ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]);
      }
      ctx.stroke();
      // gravity arrow beside the cell
      let right = -Infinity, top = Infinity, bottom = -Infinity;
      for (const c of corners) { right = Math.max(right, c[0]); top = Math.min(top, c[1]); bottom = Math.max(bottom, c[1]); }
      const gx = Math.min(right + 22, W - 10), g0 = top + (bottom - top) * 0.3, g1 = top + (bottom - top) * 0.62;
      ctx.strokeStyle = col.muted; ctx.fillStyle = col.muted; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(gx, g0); ctx.lineTo(gx, g1); ctx.lineTo(gx - 4, g1 - 6); ctx.moveTo(gx, g1); ctx.lineTo(gx + 4, g1 - 6); ctx.stroke();
      ctx.font = "italic 14px Newsreader, Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("g", gx, g1 + 4); ctx.textAlign = "left";
      // short trails, skipping segments that wrap around the periodic cell
      const L = this.trailLen, N = this.N, P = new Array(L);
      ctx.strokeStyle = col.S; ctx.globalAlpha = 0.22; ctx.lineWidth = 1; ctx.beginPath();
      for (let c = 0; c < N; c++) {
        let prev = null, prevW = null;
        for (let j = 0; j < L; j++) {
          const idx = (this.head + j) % L, b = 3 * N * idx + 3 * c;
          const x = this.trails[b], y = this.trails[b + 1], z = this.trails[b + 2];
          if (x !== x) { prev = null; continue; }  // NaN: not filled yet
          const p = this.project(x, y, z);
          if (prev && Math.abs(x - prevW[0]) < 1 && Math.abs(y - prevW[1]) < 1 && Math.abs(z - prevW[2]) < 1) {
            ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]);
          }
          prev = p; prevW = [x, y, z];
        }
      }
      ctx.stroke();
      // cells, nearer ones larger and stronger
      ctx.fillStyle = col.S;
      for (const [lo, hi, a, r] of [[0.7, 9, 0.45, 1.4], [-0.7, 0.7, 0.75, 1.8], [-9, -0.7, 1, 2.3]]) {
        ctx.globalAlpha = a; ctx.beginPath();
        for (let c = 0; c < N; c++) {
          const p = this.project(this.S[6 * c], this.S[6 * c + 1], this.S[6 * c + 2]), d = p[2] / Math.PI;
          if (d < lo || d >= hi) continue;
          ctx.moveTo(p[0] + r, p[1]); ctx.arc(p[0], p[1], r, 0, TAU);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      this.drawChart(v.chart);
    },
    drawChart(c) {
      const { x, y, w, h } = c, top = y + 28, bot = y + h - 32, lam = LYAP.map((q) => q[1]);
      const ymin = Math.min(...lam) * 1.15, ymax = Math.max(...lam) * 1.1;
      const X = (f) => x + 4 + (f / 3) * (w - 8), Y = (l) => bot - ((l - ymin) / (ymax - ymin)) * (bot - top);
      ctx.fillStyle = col.ink; ctx.font = "13px Newsreader, Georgia, serif"; ctx.textBaseline = "alphabetic";
      ctx.fillText("Lyapunov exponent of this model", x, y + 12);
      // positive (chaotic) part shaded
      ctx.fillStyle = "rgba(224,130,20,0.18)"; ctx.beginPath(); ctx.moveTo(X(0), Y(0));
      for (const [f, l] of LYAP) ctx.lineTo(X(f), Y(Math.max(0, l)));
      ctx.lineTo(X(3), Y(0)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = col.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Y(0) + 0.5); ctx.lineTo(X(3), Y(0) + 0.5); ctx.stroke();
      ctx.strokeStyle = col.ink; ctx.lineWidth = 1.4; ctx.beginPath();
      LYAP.forEach(([f, l], i) => (i ? ctx.lineTo(X(f), Y(l)) : ctx.moveTo(X(f), Y(l)))); ctx.stroke();
      // marker at the current swimming speed
      let j = 0; while (j < LYAP.length - 2 && LYAP[j + 1][0] < this.Phi) j++;
      const [f0, l0] = LYAP[j], [f1, l1] = LYAP[j + 1], t = Math.min(1, Math.max(0, (this.Phi - f0) / (f1 - f0)));
      ctx.fillStyle = col.S; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(X(this.Phi), Y(l0 + t * (l1 - l0)), 4.5, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = col.muted; ctx.font = "italic 12px Newsreader, Georgia, serif"; ctx.textAlign = "center";
      for (const f of [0, 1, 2, 3]) ctx.fillText(String(f), X(f), bot + 13);
      ctx.fillText("swimming speed Φ", x + w / 2, bot + 28);
      ctx.textAlign = "left"; ctx.fillStyle = "rgb(190,105,10)"; ctx.fillText("chaotic", X(0.3), top + 10);
    },
    click() {},
    drag(dx) { this.yaw += dx * 0.01; },
    status() {
      return `${this.N} cells cover ${Math.round(100 * this.occ)}% of the horizontal plane`;
    },
  };

  const sims = { vortices: Vort, forest: Forest, diffusion: Diff, gyro: Gyro };

  /* ------------------------------------------------------------------ plumbing */
  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    Vort.layout(); Forest.layout(); Diff.layout(); Gyro.layout();
    render();
  }
  let lastStatus = "";
  function render() {
    sims[mode].draw();
    const s = sims[mode].status();
    if (s !== lastStatus) { statusEl.textContent = s; lastStatus = s; }
  }
  function frame(t) {
    raf = 0;
    const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
    if (!paused && visible) { sims[mode].step(dt, t); render(); }
    schedule();
  }
  function schedule() { if (!raf && !paused && visible) raf = requestAnimationFrame(frame); }

  function setMode(m) {
    mode = m; last = 0; root.dataset.mode = m;
    root.querySelectorAll(".sim-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    root.querySelectorAll("[data-for]").forEach((el) => { el.hidden = el.dataset.for !== m; });
    canvas.setAttribute("aria-label", {
      vortices: "Animation of point vortices moving inside a circular container",
      forest: "Animation of a disease spreading through a planted forest, with a graph of susceptible, infected and removed trees",
      diffusion: "Animation in three panels: an outbreak and a sparse survey of it; a diffusion model turning noise into a map of transmission; and the true transmission map",
      gyro: "Rotating three-dimensional view of swimming cells in a periodic flow, gathering into vertical plumes, with a small graph of the Lyapunov exponent against swimming speed",
    }[m]);
    render(); schedule();
  }
  function setPaused(p) {
    paused = p; last = 0;
    pauseBtn.textContent = p ? "Play" : "Pause";
    pauseBtn.setAttribute("aria-pressed", String(p));
    schedule();
  }

  root.querySelectorAll(".sim-tabs button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  pauseBtn.addEventListener("click", () => setPaused(!paused));
  restartBtn.addEventListener("click", () => { sims[mode].reset(); render(); });
  root.querySelector("#sim-sample").addEventListener("click", () => {
    if (Diff.phase === "outbreak" || Diff.phase === "survey") Diff.finish();
    Diff.click(); render(); schedule();
  });
  alphaIn.addEventListener("input", () => { Vort.alpha = +alphaIn.value; alphaOut.textContent = Vort.alpha.toFixed(3); });
  densIn.addEventListener("input", () => { densOut.textContent = Math.round(densIn.value * 100) + "%"; });
  densIn.addEventListener("change", () => { Forest.density = +densIn.value; Forest.reset(); render(); });
  let dragX = null;
  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    sims[mode].click(e.clientX - r.left, e.clientY - r.top);
    if (sims[mode].drag) { dragX = e.clientX; Gyro.dragging = true; canvas.setPointerCapture(e.pointerId); }
    render();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragX === null || !sims[mode].drag) return;
    sims[mode].drag(e.clientX - dragX); dragX = e.clientX; render();
  });
  const endDrag = () => { dragX = null; Gyro.dragging = false; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  const phiIn = root.querySelector("#phi"), phiOut = root.querySelector("#phi-out");
  phiIn.addEventListener("input", () => { Gyro.Phi = +phiIn.value; phiOut.textContent = Gyro.Phi.toFixed(2); render(); });

  new ResizeObserver(() => resize()).observe(canvas);
  if ("IntersectionObserver" in window)
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = 0; schedule(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; last = 0; schedule(); });

  Vort.alpha = +alphaIn.value; Forest.density = +densIn.value;
  densOut.textContent = Math.round(Forest.density * 100) + "%";
  Vort.reset();
  resize();
  if (reduceMotion) {  // static frames for visitors who prefer reduced motion
    for (let k = 0; k < 120; k++) Forest.tick();
    Diff.finish();
    Gyro.advance(50);  // plumes already formed
  }
  setMode(mode);
  setPaused(paused);
})();
