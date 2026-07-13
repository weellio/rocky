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

const CAP = CFG.sonar.lit;
const blockGeo = bakedBox(0.97);
const blockMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });
const blocks = new THREE.InstancedMesh(blockGeo, blockMat, CAP);
blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
blocks.count = 0;
blocks.frustumCulled = false;
scene.add(blocks);

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

/* ---------- the wavefront ----------
 * There is no wavefront object. There must not be one: a wireframe sphere drawn
 * around Rocky is a sphere the CAMERA IS STANDING INSIDE, so it renders as a
 * spiderweb across the entire screen, and worse, it is a second opinion about
 * where the sound has got to. The wave shows itself the only honest way — by
 * STRIKING the walls, bright, in the order the engine says they were struck.
 * Watch a pulse cross the workshop floor. That sweep is the engine talking. */

/* ---------- input ---------- */
const keys = Object.create(null);
let yaw = 0, pitch = 0.22, locked = false;
const input = { fwd: 0, right: 0, jump: false, down: false, yaw: 0 };

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyE') doPulse();
  if (e.code === 'KeyF') doRead();
  if (e.code === 'Escape') document.exitPointerLock();
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) e.preventDefault();
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
  if (!r.ok) flash('cooling…');
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

  input.fwd = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  input.right = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  input.jump = !!keys.Space;
  input.down = !!(keys.ShiftLeft || keys.ShiftRight);
  input.yaw = yaw;

  Sim.step(S, dt, input);

  for (const id of Sim.takeCues(S)) {
    if (window.RockyAudio) window.RockyAudio.cue(id);
  }

  /* THE ECHO FIELD. This is the whole render. */
  Sim.litCells(S, buf);
  let n = 0;
  for (let k = 0; k < buf.length && n < CAP; k++) {
    const c = buf[k];
    dummy.position.set(c.x + 0.5, c.y + 0.5, c.z + 0.5);
    dummy.updateMatrix();
    blocks.setMatrixAt(n, dummy.matrix);
    const base = BLOCK_COL[c.b] || BLOCK_COL[1];
    const v = Math.min(1, c.v * 1.25);
    tmpCol.copy(base).multiplyScalar(v * v * 0.85 + v * 0.25);
    blocks.setColorAt(n, tmpCol);
    n++;
  }
  blocks.count = n;
  blocks.instanceMatrix.needsUpdate = true;
  if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;

  // Rocky, and the camera that trails him
  const p = S.player;
  rocky.position.set(p.x, p.y, p.z);
  rocky.rotation.y = p.yaw;
  const gait = p.dist * 3.4;
  for (const c of rocky.children) {
    if (c.userData.a == null) continue;
    c.position.y = -0.18 + Math.sin(gait + c.userData.a * 2) * 0.06;
  }

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
  const g = Sim.nearestGauge(S);
  el('prompt').style.opacity = g && !g.read ? '1' : '0';

  requestAnimationFrame(frame);
}

/* ---------- open ---------- */
el('chapname').textContent = CFG.story.subtitle;
el('objective').textContent = S.chapter.objective;
refreshGauges();
const open = S.chapter.lines.filter((l) => l.at === 'start');
say(open[0].chord, open[0].text);
setTimeout(() => say(open[1].chord, open[1].text), 5200);
requestAnimationFrame(frame);

/* ---------- test hooks (the browser must be able to answer questions) ---------- */
window.__rocky = {
  S: () => S,
  state: () => ({
    t: +S.t.toFixed(2),
    pos: [+S.player.x.toFixed(2), +S.player.y.toFixed(2), +S.player.z.toFixed(2)],
    lit: blocks.count,
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
