/* ROCKY SAVES THE UNIVERSE — app.js
 *
 * The renderer. It draws what sim.js heard. It does not decide what Rocky can
 * hear, how far sound carries, or what a wall does to it — if you find yourself
 * about to write that here, it belongs in sim.js and the answer is already
 * there. This file is a window, not a witness.
 */
import * as THREE from '../vendor/three.module.min.js';

const CFG = window.ROCKY_CFG;
const Sim = window.Rocky;

/* ---------- boot ---------- */
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);
scene.fog = new THREE.Fog(0x02040a, 6, 34);

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 200);

let S = Sim.create(CFG, { seed: 1 });

/* ---------- the block mesh ----------
 * No lights. There is no light on Erid and there are no eyes to catch it.
 * A cube's faces are shaded by baked vertex colours, and the ECHO supplies the
 * brightness through instanceColor. What you see is loudness. */
function bakedBox(size) {
  const g = new THREE.BoxGeometry(size, size, size);
  const face = [0.74, 0.74, 1.0, 0.32, 0.56, 0.56]; // +x -x +y -y +z -z
  const col = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < g.attributes.position.count; i++) {
    const f = face[Math.floor(i / 4)];
    col[i * 3] = f; col[i * 3 + 1] = f; col[i * 3 + 2] = f;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

/* ---------- the grain of a material ----------
 * Drawn, not downloaded: every texture in this game is a few lines of canvas, so
 * the whole thing still installs offline in under a megabyte. Rocky is not
 * SEEING these — he is resolving a surface. Coarse basalt scatters the wave, a
 * machined plate returns a hard grid, grit returns almost nothing at all.
 * The pattern to draw comes from config (`block.tex`), like everything else. */
function tile(kind) {
  const N = 32;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, N, N);
  const ink = (a) => `rgba(0,0,0,${a})`;
  const lit = (a) => `rgba(255,255,255,${a})`;
  // deterministic speckle, so the world does not shimmer between reloads
  let s = 1337;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  if (kind === 'mottle') {                       // basalt: coarse, scattering
    for (let i = 0; i < 300; i++) {
      g.fillStyle = ink(0.05 + rnd() * 0.22);
      g.fillRect(rnd() * N | 0, rnd() * N | 0, 1 + (rnd() * 2 | 0), 1 + (rnd() * 2 | 0));
    }
  } else if (kind === 'plate') {                 // machined: a hard grid and rivets
    g.fillStyle = ink(0.34);
    g.fillRect(0, 0, N, 2); g.fillRect(0, 0, 2, N);
    g.fillRect(0, N / 2 - 1, N, 1); g.fillRect(N / 2 - 1, 0, 1, N);
    for (const [x, y] of [[5, 5], [26, 5], [5, 26], [26, 26]]) {
      g.fillStyle = lit(0.55); g.fillRect(x, y, 2, 2);
      g.fillStyle = ink(0.4); g.fillRect(x + 1, y + 1, 2, 2);
    }
  } else if (kind === 'stripe') {                // girder: hazard diagonals
    g.save(); g.translate(N / 2, N / 2); g.rotate(Math.PI / 4); g.translate(-N, -N);
    for (let i = 0; i < 8; i++) {
      g.fillStyle = ink(i % 2 ? 0.36 : 0.06);
      g.fillRect(0, i * 8, N * 2, 8);
    }
    g.restore();
    g.fillStyle = ink(0.45); g.fillRect(0, 0, N, 2); g.fillRect(0, N - 2, N, 2);
  } else if (kind === 'rings') {                 // pipe: welded bands
    for (let y = 0; y < N; y += 8) {
      g.fillStyle = ink(0.32); g.fillRect(0, y, N, 2);
      g.fillStyle = lit(0.4); g.fillRect(0, y + 2, N, 1);
    }
  } else if (kind === 'grille') {                // vent: slots the heat comes through
    g.fillStyle = ink(0.5);
    for (let x = 3; x < N - 2; x += 6) g.fillRect(x, 4, 3, N - 8);
    g.fillStyle = ink(0.3); g.fillRect(0, 0, N, 3); g.fillRect(0, N - 3, N, 3);
  } else if (kind === 'dial') {                  // gauge: a face and a needle
    g.strokeStyle = ink(0.55); g.lineWidth = 2;
    g.beginPath(); g.arc(N / 2, N / 2, 11, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(N / 2, N / 2); g.lineTo(N / 2 + 7, N / 2 - 7); g.stroke();
    g.fillStyle = ink(0.5);
    for (let a = 0; a < 6; a++) {                // six ticks. Eridians count in six.
      const th = (a / 6) * Math.PI * 2;
      g.fillRect(N / 2 + Math.cos(th) * 13 - 1, N / 2 + Math.sin(th) * 13 - 1, 2, 2);
    }
  } else if (kind === 'facet') {                 // xenonite: it does not scatter, it SINGS
    g.strokeStyle = lit(0.5); g.lineWidth = 1;
    for (let i = -2; i < 5; i++) {
      g.beginPath(); g.moveTo(i * 10, 0); g.lineTo(i * 10 + N, N); g.stroke();
      g.beginPath(); g.moveTo(i * 10, N); g.lineTo(i * 10 + N, 0); g.stroke();
    }
    g.fillStyle = ink(0.18); g.fillRect(0, 0, N, N);
  } else if (kind === 'panel') {                 // door
    g.fillStyle = ink(0.4); g.fillRect(2, 2, N - 4, N - 4);
    g.fillStyle = lit(0.35); g.fillRect(5, 5, N - 10, N - 10);
    g.fillStyle = ink(0.45); g.fillRect(N / 2 - 1, 5, 2, N - 10);
  } else if (kind === 'ear') {                   // resonator: a listening membrane
    g.strokeStyle = ink(0.5); g.lineWidth = 2;
    for (let r = 4; r <= 14; r += 5) { g.beginPath(); g.arc(N / 2, N / 2, r, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = ink(0.6); g.fillRect(N / 2 - 2, N / 2 - 2, 4, 4);
  } else if (kind === 'bell') {                  // a resonator that shouts back
    g.strokeStyle = ink(0.45); g.lineWidth = 2;
    g.beginPath(); g.arc(N / 2, N / 2, 12, 0, Math.PI * 2); g.stroke();
    for (let a = 0; a < 8; a++) {                // struck, and ringing outward
      const th = (a / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(N / 2 + Math.cos(th) * 4, N / 2 + Math.sin(th) * 4);
      g.lineTo(N / 2 + Math.cos(th) * 15, N / 2 + Math.sin(th) * 15);
      g.stroke();
    }
    g.fillStyle = ink(0.55); g.beginPath(); g.arc(N / 2, N / 2, 3, 0, Math.PI * 2); g.fill();
  } else if (kind === 'forge') {                 // the bench: a hopper and a throat of fire
    g.fillStyle = ink(0.42); g.fillRect(0, 0, N, 8);
    g.fillStyle = ink(0.3); g.fillRect(4, 10, N - 8, N - 14);
    g.fillStyle = lit(0.5);
    for (let x = 7; x < N - 6; x += 6) g.fillRect(x, 13, 3, N - 20);
    g.fillStyle = ink(0.5); g.fillRect(0, N - 4, N, 4);
  } else if (kind === 'pane') {                  // cast xenonite: poured, and staying put
    g.fillStyle = ink(0.12); g.fillRect(0, 0, N, N);
    g.strokeStyle = lit(0.45); g.lineWidth = 2;
    g.strokeRect(3, 3, N - 6, N - 6);
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(3, 3); g.lineTo(N - 3, N - 3); g.stroke();
    g.beginPath(); g.moveTo(N - 3, 3); g.lineTo(3, N - 3); g.stroke();
  } else if (kind === 'grain') {                 // grit: dense, dead, swallows the wave
    for (let i = 0; i < 700; i++) {
      g.fillStyle = ink(0.1 + rnd() * 0.5);
      g.fillRect(rnd() * N | 0, rnd() * N | 0, 1, 1);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;             // blocky. crisp. Minecraft.
  t.minFilter = THREE.NearestMipmapLinearFilter;
  return t;
}

/* One InstancedMesh per material: nine draw calls, each with its own grain, and
 * the echo brightness rides in on instanceColor. */
const CAP = CFG.sonar.lit;
const blockGeo = bakedBox(0.97);
const MESH = {};
for (const b of CFG.blocks) {
  if (!b.solid) continue;
  const mat = new THREE.MeshBasicMaterial({ map: tile(b.tex), vertexColors: true, fog: true });
  const m = new THREE.InstancedMesh(blockGeo, mat, CAP);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.count = 0;
  m.frustumCulled = false;
  scene.add(m);
  MESH[b.id] = m;
}

const BLOCK_COL = CFG.blocks.map((b) => new THREE.Color(b.color));

/* ---------- Rocky ----------
 * Five legs, a carapace like a rock, and no face at all. He is the one thing
 * you always know the position of, so he is the one thing always drawn. */
const rocky = new THREE.Group();
{
  const shellMat = new THREE.MeshBasicMaterial({ color: 0xd8734a, vertexColors: true, fog: false });
  const legMat = new THREE.MeshBasicMaterial({ color: 0x8a4a30, vertexColors: true, fog: false });
  const body = new THREE.Mesh(bakedBox(1), shellMat);
  body.scale.set(0.62, 0.34, 0.62);
  body.position.y = 0.04;
  rocky.add(body);
  const hump = new THREE.Mesh(bakedBox(1), shellMat);
  hump.scale.set(0.38, 0.2, 0.38);
  hump.position.y = 0.24;
  rocky.add(hump);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(bakedBox(1), legMat);
    leg.scale.set(0.12, 0.3, 0.12);
    leg.position.set(Math.cos(a) * 0.34, -0.18, Math.sin(a) * 0.34);
    leg.userData.a = a;
    rocky.add(leg);
  }
}
scene.add(rocky);

/* ---------- the outgoing wave ----------
 * NOT a sphere. A sphere around Rocky is one the camera stands INSIDE: it draws
 * a spiderweb over the entire screen. This is a flat ring lying on the ground at
 * his feet, and its radius is (age * CFG.sonar.speed) — the engine's own speed of
 * sound, so it passes a wall at exactly the moment the engine says the wave
 * touched it.
 *
 * Then the wall lights when the echo gets BACK to him. Out, and back: you watch
 * the ring leave, and a moment later the room answers. That gap is the distance,
 * and it is the sense the whole game is played with. */
const ringMesh = new THREE.Mesh(
  new THREE.RingGeometry(0.97, 1, 64),
  new THREE.MeshBasicMaterial({
    color: 0xbdf3ff, transparent: true, opacity: 0, side: THREE.DoubleSide,
    fog: false, depthWrite: false, blending: THREE.AdditiveBlending
  })
);
ringMesh.rotation.x = -Math.PI / 2;
ringMesh.visible = false;
scene.add(ringMesh);
let ringT0 = -99, ringY = 0, ringX = 0, ringZ = 0;
function ringFrom(p) {
  ringT0 = S.t;
  ringX = p.x; ringY = p.y - 0.3; ringZ = p.z;
  ringMesh.visible = true;
}

/* ---------- input ---------- */
const keys = Object.create(null);
let yaw = 0, pitch = 0.22, locked = false;
const input = { fwd: 0, right: 0, jump: false, down: false, yaw: 0 };

/* The arrows do exactly what WASD does — they do not TURN, they strafe, because
 * the mouse is what steers and a key that means one thing on one hand and another
 * thing on the other hand is just a bug you have to remember. */
const MOVE = {
  fwd:   ['KeyW', 'ArrowUp'],
  back:  ['KeyS', 'ArrowDown'],
  left:  ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight']
};
const held = (list) => list.some((k) => keys[k]);
const EATEN = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  .concat(MOVE.fwd, MOVE.back, MOVE.left, MOVE.right);

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyE') doPulse();
  if (e.code === 'KeyF') doUse();
  if (e.code === 'KeyQ') doTake();
  if (e.code === 'KeyR') doPlace();
  if (e.code === 'Escape') document.exitPointerLock();
  if (EATEN.includes(e.code)) e.preventDefault();   // arrows must not scroll the page
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
canvas.addEventListener('click', () => { if (!locked) canvas.requestPointerLock(); else doPulse(); });
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
addEventListener('mousemove', (e) => {
  if (!locked) return;
  yaw -= e.movementX * 0.0026;
  pitch = Math.max(-0.9, Math.min(1.1, pitch + e.movementY * 0.0022));
});

function doPulse() {
  const r = Sim.pulse(S);
  if (!r.ok) { flash('cooling…'); return; }
  ringFrom(S.player);
  flare = 1;                        // Rocky himself flashes: HE is the one shouting
}

/* F is "use the thing in front of you". A gauge is read. A forge is FED. */
function doUse() {
  if (Sim.nearestForge(S)) { doFeed(); return; }
  doRead();
}

function doFeed() {
  const r = Sim.feedForge(S);
  if (!r.ok) { flash(r.why); return; }
  if (!r.made) return;
  const rec = CFG.recipes.find((x) => x.id === r.made);
  say('♪♪♩', `${rec.name}. ${rec.note}`);
  banner('MADE · ' + rec.name.toUpperCase());
}

function doRead() {
  const r = Sim.readGauge(S);
  if (!r.ok) { flash(r.why === 'already read' ? 'already read' : 'nothing in reach'); return; }
  const sign = r.drift < 0 ? '' : '+';
  say('♪♪♩', `${r.name}: ${r.six} (base six). It should read ${r.sixNominal}. Drift ${sign}${r.drift}.`);
  refreshGauges();
  if (r.done) {
    const line = S.chapter.lines.find((l) => l.at === 'all_gauges');
    setTimeout(() => say(line.chord, line.text), 2200);
    setTimeout(() => banner('IT IS NOT MY VENTS THAT ARE FAILING. IT IS THE SKY.'), 4600);
  }
}

function doTake() {
  const r = Sim.takeBlock(S);
  if (!r.ok) { flash(r.why); return; }
  const b = CFG.blocks[r.block];
  say('♪♩', `${b.name}. ${b.key === 'xenonite' ? 'It carries sound almost for free.' : 'It kills sound stone dead.'}`);
}

function doPlace() {
  const r = Sim.placeBlock(S);
  if (!r.ok) { flash(r.why); return; }
  ringFrom({ x: r.at[0] + 0.5, y: r.at[1] + 0.5, z: r.at[2] + 0.5 });   // the bang is a sound like any other
}

/* ---------- HUD ---------- */
const el = (id) => document.getElementById(id);
function flash(msg) {
  const n = el('flash');
  n.textContent = msg;
  n.classList.remove('go');
  void n.offsetWidth;
  n.classList.add('go');
}
function say(chord, text) {
  el('chord').textContent = chord;
  el('speech').textContent = text;
  const box = el('talk');
  box.classList.remove('go');
  void box.offsetWidth;
  box.classList.add('go');
}
function banner(text) {
  const b = el('banner');
  b.textContent = text;
  b.classList.remove('go');
  void b.offsetWidth;
  b.classList.add('go');
}
function refreshGauges() {
  el('gcount').textContent = `${S.readCount} / ${S.gauges.length}`;
}

/* ---------- the loop ---------- */
const buf = [];
const dummy = new THREE.Object3D();
const tmpCol = new THREE.Color();
let last = performance.now();
let fps = 0, frames = 0, fpsT = 0;
let camDist = 5.4;
let flare = 0;
let drawn = 0;

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  input.fwd = (held(MOVE.fwd) ? 1 : 0) - (held(MOVE.back) ? 1 : 0);
  input.right = (held(MOVE.right) ? 1 : 0) - (held(MOVE.left) ? 1 : 0);
  input.jump = !!keys.Space;
  input.down = !!(keys.ShiftLeft || keys.ShiftRight);
  input.yaw = yaw;

  Sim.step(S, dt, input);

  for (const id of Sim.takeCues(S)) {
    if (window.RockyAudio) window.RockyAudio.cue(id);
    if (id === 'ear') {
      const line = S.chapter.lines.find((l) => l.at === 'ear');
      if (line) say(line.chord, line.text);
      banner('IT HEARD ME');
    }
    if (id === 'chapter' && S.flags.all_doors) {
      const line = S.chapter.lines.find((l) => l.at === 'all_doors');
      if (line) setTimeout(() => say(line.chord, line.text), 1800);
    }
  }

  /* THE ECHO FIELD. This is the whole render. */
  Sim.litCells(S, buf);
  for (const id in MESH) MESH[id].count = 0;
  let n = 0;
  drawn = 0;
  for (let k = 0; k < buf.length; k++) {
    const c = buf[k];
    const m = MESH[c.b];
    if (!m || m.count >= CAP) continue;
    dummy.position.set(c.x + 0.5, c.y + 0.5, c.z + 0.5);
    dummy.updateMatrix();
    m.setMatrixAt(m.count, dummy.matrix);
    const base = BLOCK_COL[c.b] || BLOCK_COL[1];
    const v = Math.min(1, c.v * 1.25);
    tmpCol.copy(base).multiplyScalar(v * v * 0.85 + v * 0.25);
    m.setColorAt(m.count, tmpCol);
    m.count++;
    n++;
    drawn++;
  }
  for (const id in MESH) {
    const m = MESH[id];
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }

  // the outgoing ring, leaving him at the engine's speed of sound
  if (ringMesh.visible) {
    const age = S.t - ringT0;
    const rad = age * CFG.sonar.speed;
    if (rad > CFG.sonar.maxDist) ringMesh.visible = false;
    else {
      ringMesh.position.set(ringX, ringY, ringZ);
      ringMesh.scale.setScalar(Math.max(0.001, rad));
      ringMesh.material.opacity = 0.5 * Math.pow(1 - rad / CFG.sonar.maxDist, 1.6);
    }
  }

  // Rocky, and the camera that trails him
  const p = S.player;
  rocky.position.set(p.x, p.y, p.z);
  rocky.rotation.y = p.yaw;
  const gait = p.dist * 3.4;
  for (const c of rocky.children) {
    if (c.userData.a == null) continue;
    c.position.y = -0.18 + Math.sin(gait + c.userData.a * 2) * 0.06;
  }
  // he flashes when he shouts. you are never in any doubt about who made the sound.
  flare = Math.max(0, flare - dt * 4.2);
  const glow = 1 + flare * 1.5;
  rocky.children[0].material.color.setRGB(0.85 * glow, 0.45 * glow, 0.29 * glow);

  /* NOTHING MAY COME BETWEEN THE CAMERA AND ROCKY.
   * Back into a wall and the camera would otherwise slide out through the stone
   * and show you the warren from the OUTSIDE — the back face of the world. So we
   * ask the engine how far back we may sit before rock gets in the way, and sit
   * exactly there. The engine owns the walls; app.js only asks. */
  const WANT = 5.4;
  const dx = Math.sin(yaw) * Math.cos(pitch);
  const dy = Math.sin(pitch) + 0.16;
  const dz = Math.cos(yaw) * Math.cos(pitch);
  const len = Math.hypot(dx, dy, dz);
  const free = Sim.cameraFit(S, p.x, p.y + 0.3, p.z, dx / len, dy / len, dz / len, WANT);
  camDist += (free - camDist) * (free < camDist ? 0.6 : 0.12);   // snap in fast, ease out slow
  camera.position.set(
    p.x + (dx / len) * camDist,
    p.y + 0.3 + (dy / len) * camDist,
    p.z + (dz / len) * camDist
  );
  camera.lookAt(p.x, p.y + 0.3, p.z);
  rocky.visible = camDist > 1.5;   // if we are jammed right up against him, get out of his way

  renderer.render(scene, camera);

  frames++; fpsT += dt;
  if (fpsT > 0.5) { fps = Math.round(frames / fpsT); frames = 0; fpsT = 0; }
  el('hud2').textContent =
    `echoes ${n}  ·  ${fps} fps  ·  pulse ${S.pulseCd > 0 ? 'recharging' : 'READY'}`;

  // what is in his arms
  const hb = S.held ? CFG.blocks[S.held] : null;
  el('held').textContent = hb ? `CARRYING · ${hb.name.toUpperCase()}` : '';
  el('held').style.opacity = hb ? '1' : '0';

  /* EVERY EAR'S OWN OPINION, shown honestly: the loudest thing it has ever heard,
   * against what it needs. Not a hint — it is the engine's own number, the same
   * one that decides. The player is told the truth and trusted with it. */
  if (S.ears.length) {
    el('ear').style.opacity = '1';
    el('ear').innerHTML = S.ears.map((e) => {
      const name = e.name || 'RESONATOR';
      const pct = Math.round(e.loudest * 100);
      const need = Math.round(e.needs * 100);
      if (e.rings) {
        // a bell that has just answered is RINGING — that is the chain, running
        return e.cd > 0
          ? `<span class="ring">${name} · ♪ RANG</span>`
          : `<span>${name} · ${e.rang ? 'rang ×' + e.rang : pct + '% of ' + need + '%'}</span>`;
      }
      return e.open
        ? `<span class="on">${name} · HEARD YOU</span>`
        : `<span>${name} · ${pct}% of ${need}%</span>`;
    }).join('<br>');
  } else {
    el('ear').style.opacity = '0';
  }

  /* THE FORGE PANEL. What is in the hopper, and what the recipes want. The
   * "can this be made" question goes to the ENGINE (Sim.canMake) — work it out
   * here and the bench on screen starts disagreeing with the bench in the rules. */
  const f = Sim.nearestForge(S, 5);
  if (f) {
    const ready = Sim.canMake(S, f);
    el('forge').style.opacity = '1';
    el('forge').innerHTML =
      '<b>THE FORGE</b>' +
      CFG.recipes.map((r) => {
        const parts = r.needs.map((n) => {
          const have = f.hopper[n.block] || 0;
          const cls = have >= n.n ? 'got' : '';
          return `<span class="${cls}">${CFG.blocks[n.block].name} ${have}/${n.n}</span>`;
        }).join(' + ');
        const hot = ready && ready.id === r.id ? ' class="hot"' : '';
        return `<div${hot}>${parts} → ${r.name}</div>`;
      }).join('') +
      '<i>F — feed it the block in your arms</i>';
  } else {
    el('forge').style.opacity = '0';
  }

  const g = Sim.nearestGauge(S);
  el('prompt').style.opacity = (g && !g.read) ? '1' : '0';
  if (g && !g.read) el('prompt').textContent = 'F — READ GAUGE';

  requestAnimationFrame(frame);
}

/* ---------- open ---------- */
function load(id) {
  S = Sim.create(CFG, { seed: 1, chapter: id });
  camDist = 5.4;
  const n = CFG.chapters.findIndex((c) => c.id === S.chapter.id) + 1;
  el('chapname').textContent = `Chapter ${n} — ${S.chapter.name}`;
  el('objective').textContent = S.chapter.objective;
  // the box holds the gauge count AND the resonator readout: hide it only when a
  // chapter has neither, or the ear goes invisible in every chapter without gauges.
  el('gbox').style.display = (S.gauges.length || S.ears.length) ? '' : 'none';
  el('glabel').style.display = S.gauges.length ? '' : 'none';
  el('gcount').style.display = S.gauges.length ? '' : 'none';
  refreshGauges();
  const open = S.chapter.lines.filter((l) => l.at === 'start');
  if (open[0]) say(open[0].chord, open[0].text);
  if (open[1]) setTimeout(() => say(open[1].chord, open[1].text), 5600);
}
load(CFG.chapters[0].id);
requestAnimationFrame(frame);

/* ---------- test hooks (the browser must be able to answer questions) ---------- */
window.__rocky = {
  S: () => S,
  load,
  take: doTake,
  place: doPlace,
  ears: () => S.ears.map((e) => ({ id: e.id, open: e.open, loudest: +e.loudest.toFixed(3), needs: e.needs })),
  state: () => ({
    t: +S.t.toFixed(2),
    pos: [+S.player.x.toFixed(2), +S.player.y.toFixed(2), +S.player.z.toFixed(2)],
    lit: drawn,
    active: S.nActive,
    pulses: S.pulses,
    emits: S.emits,
    read: S.readCount,
    fps: fps
  }),
  pulse: doPulse,
  read: doRead,
  tp: (x, y, z) => { S.player.x = x; S.player.y = y; S.player.z = z; S.player.vy = 0; },
  cam: () => ({
    dist: +camDist.toFixed(2),
    inRock: Sim.isSolid(S, Math.floor(camera.position.x), Math.floor(camera.position.y), Math.floor(camera.position.z)),
    rockyVisible: rocky.visible
  }),
  look: (y, p) => { yaw = y; if (p != null) pitch = p; },
  press: (code, on) => { keys[code] = !!on; }
};
