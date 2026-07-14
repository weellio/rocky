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
  } else if (kind === 'arch') {                  // the way out
    g.fillStyle = ink(0.18); g.fillRect(0, 0, N, N);
    g.strokeStyle = lit(0.75); g.lineWidth = 3;
    g.beginPath(); g.arc(N / 2, N - 4, 11, Math.PI, 0); g.stroke();
    g.beginPath(); g.moveTo(N / 2 - 11, N - 4); g.lineTo(N / 2 - 11, N);
    g.moveTo(N / 2 + 11, N - 4); g.lineTo(N / 2 + 11, N); g.stroke();
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(N / 2, 6); g.lineTo(N / 2, 17);        // an arrow, going through
    g.moveTo(N / 2 - 4, 12); g.lineTo(N / 2, 17); g.lineTo(N / 2 + 4, 12); g.stroke();
  } else if (kind === 'void') {                  // astrophage: it gives back nothing at all
    g.fillStyle = ink(0.86); g.fillRect(0, 0, N, N);
    for (let i = 0; i < 40; i++) {                // a few grains of something, and then nothing
      g.fillStyle = lit(0.05 + rnd() * 0.10);
      g.fillRect(rnd() * N | 0, rnd() * N | 0, 1, 1);
    }
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
 * Five legs, a carapace like a rock, and no face at all — he has nothing to look
 * at you with. He is the one thing you always know the position of, so he is the
 * one thing always drawn.
 *
 * And he is WEARING something: a leather harness across the carapace, buckled, a
 * satchel slung under it, and strap-bands on two of the arms. He is never not
 * pulling something out of it. That is not decoration — it is where the six
 * pockets are, and the pouch on his flank fills up as you fill them. */
const rocky = new THREE.Group();
const pouches = [];
const limbs = [];
{
  const bagMat = new THREE.MeshBasicMaterial({ color: 0x6b4726, vertexColors: true, fog: false });

  /* HIS BODY IS A VOXEL MODEL, baked from a reference sculpt.
   * scripts/voxelize.js rasterises the STL once, offline, and what ships is a few
   * thousand cubes — his silhouette, in the only shape this game knows how to
   * draw. The mesh itself (821k triangles, 41MB) is not in the repository and is
   * never touched at runtime. */
  /* ...and he comes APART. The bake hands us a carapace and five limbs, each with
   * the shoulder it turns about, so he is not a statue being slid along the floor:
   * he WALKS, on five legs, and there is never a moment when he is not touching the
   * ground with something. */
  const M = window.ROCKY_MODEL;
  if (M) {
    const [MW, MH, MD] = M.dim;
    const span = Math.max(MW, MH, MD);
    const s = 1.15 / span;                      // he stands about a block and a bit wide
    let minY = Infinity;
    for (const p of M.parts) for (let i = 1; i < p.cells.length; i += 3) minY = Math.min(minY, p.cells[i]);

    // grid coordinates -> his own body's frame
    const put = (x, y, z) => new THREE.Vector3((x - MW / 2) * s, (y - minY) * s - 0.36, (z - MD / 2) * s);
    const col = new THREE.Color();
    const d = new THREE.Object3D();

    /* WHERE THE HARNESS GOES.
     * It used to be a plank and a crate bolted onto him — hard-coded boxes that knew
     * nothing about the shape they were sitting on, so they floated over his back
     * like luggage on a roof rack. Measure the carapace, and put the leather ON it. */
    const cara = M.parts[0];
    const cmin = new THREE.Vector3(Infinity, Infinity, Infinity);
    const cmax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < cara.cells.length; i += 3) {
      const v = put(cara.cells[i], cara.cells[i + 1], cara.cells[i + 2]);
      cmin.min(v); cmax.max(v);
    }
    const cmid = cmin.clone().add(cmax).multiplyScalar(0.5);
    const csize = cmax.clone().sub(cmin);

    M.parts.forEach((part, pi) => {
      const n = part.cells.length / 3;
      if (!n) return;
      const mat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
      const mesh = new THREE.InstancedMesh(bakedBox(0.96), mat, n);
      mesh.frustumCulled = false;

      // a limb hangs in a group pinned at its SHOULDER, so it turns about the joint
      // and not about its own middle — swing it from the middle and it comes off him.
      const g = new THREE.Group();
      const pivot = part.pivot ? put(part.pivot[0], part.pivot[1], part.pivot[2]) : new THREE.Vector3();
      g.position.copy(pivot);
      rocky.add(g);
      g.add(mesh);

      const centroid = new THREE.Vector3();
      for (let i = 0, k = 0; i < part.cells.length; i += 3, k++) {
        const x = part.cells[i], y = part.cells[i + 1], z = part.cells[i + 2];
        const v = put(x, y, z);
        centroid.add(v);
        d.position.copy(v).sub(pivot);
        d.scale.setScalar(s);
        d.updateMatrix();
        mesh.setMatrixAt(k, d.matrix);
        // a carapace: burnt orange on top, dark underneath, mottled like something
        // that grew rather than something that was made
        const up = (y - minY) / MH;
        const grain = ((x * 7 + y * 13 + z * 5) % 5) / 5;
        col.setRGB(
          0.34 + up * 0.34 + grain * 0.06,
          0.14 + up * 0.15 + grain * 0.03,
          0.09 + up * 0.08 + grain * 0.02
        );

        /* THE HARNESS IS PAINTED INTO HIM, not bolted on. A strap runs over the top
         * of the carapace and a girth goes round it, and both are just cubes of his
         * own body wearing a different colour — so they follow every lump of the
         * shell instead of hovering above it. */
        if (pi === 0) {
          const overTheBack = Math.abs(v.z - cmid.z) < csize.z * 0.10 && v.y > cmid.y - csize.y * 0.15;
          const roundTheGirth = Math.abs(v.x - cmid.x) < csize.x * 0.09 && v.y > cmid.y - csize.y * 0.35;
          if (overTheBack || roundTheGirth) {
            col.setRGB(0.30 + grain * 0.05, 0.19 + grain * 0.03, 0.10);          // worn leather
            if (overTheBack && roundTheGirth) col.setRGB(0.72, 0.60, 0.28);      // the buckle, where they cross
          }
        }
        mesh.setColorAt(k, col);
      }
      centroid.divideScalar(n);

      /* THE SATCHEL. One small pouch, slung against the shell where the straps meet
       * — sized and placed from the carapace we just measured, so it sits ON him
       * rather than hovering beside him. It swells as the pockets fill. */
      if (pi === 0) {
        const bag = new THREE.Mesh(bakedBox(1), bagMat);
        bag.userData.base = Math.min(csize.x, csize.z) * 0.30;
        bag.position.set(cmid.x + csize.x * 0.30, cmid.y - csize.y * 0.12, cmid.z - csize.z * 0.16);
        rocky.add(bag);
        pouches.push(bag);
      }

      if (part.pivot) {
        /* HIS STANCE comes with the model: the sculpt is a statue with two arms in
         * the air, and `rest` is the turn that puts each limb where a limb standing
         * on the ground belongs. It is applied FIRST, and he walks on top of it.
         *
         * `dir` is where the limb points once it is standing on it — which is what
         * decides how it must move. Lifting it is a turn about the axis across it;
         * stepping it is a turn about his spine. Its phase comes from where it sits
         * AROUND him, so the five of them ripple instead of stamping in unison. */
        const rest = new THREE.Quaternion(part.rest[0], part.rest[1], part.rest[2], part.rest[3]);
        const dir = new THREE.Vector3(part.dir[0], part.dir[1], part.dir[2]).normalize();
        const lift = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
        if (lift.lengthSq() < 0.01) lift.set(1, 0, 0);
        const around = Math.atan2(pivot.z, pivot.x);
        g.quaternion.copy(rest);
        limbs.push({ g, rest, dir, lift, phase: around * 1.6 });
      } else {
        rocky.userData.model = mesh;          // the carapace: it is what flares when he shouts
      }
    });
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
  const n = e.code.match(/^Digit([1-9])$/);         // 1..6 — a pocket each
  if (n) Sim.selectSlot(S, +n[1] - 1);
  if (EATEN.includes(e.code)) e.preventDefault();   // arrows must not scroll the page
});
addEventListener('wheel', (e) => {
  if (!locked) return;
  const n = S.belt.length;
  Sim.selectSlot(S, (S.slot + (e.deltaY > 0 ? 1 : n - 1)) % n);
}, { passive: true });
addEventListener('keyup', (e) => { keys[e.code] = false; });
/* On a mouse, clicking the canvas grabs the pointer and clicking again pulses. On a
 * phone there is no pointer to lock and there never will be, so the whole mouse path
 * is optional rather than assumed. */
canvas.addEventListener('click', () => {
  if (TOUCH) return;
  if (!locked) canvas.requestPointerLock(); else doPulse();
});
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; });

/* GIVE THE MOUSE BACK.
 * Pointer lock is how mouse-look works, and on Windows it is the same OS call that
 * pins the cursor to a rectangle. If a tab holding the lock gets hidden, minimised,
 * or shoved onto another virtual desktop, the browser does not always hand the
 * cursor back — and the player finds their mouse trapped in a corner of a monitor by
 * a game they are not even looking at. (Reported. Believed.)
 *
 * So we let go of it ourselves the moment we stop being the thing on screen. Nothing
 * this game does is worth somebody's mouse. */
const letGo = () => { if (document.pointerLockElement) document.exitPointerLock(); };
addEventListener('blur', letGo);
addEventListener('pagehide', letGo);
document.addEventListener('visibilitychange', () => { if (document.hidden) letGo(); });
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

  /* AND THE ROOM ANSWERS IN ITS OWN VOICE.
   * Wait for the near echoes to actually get home, then ask the ENGINE what came
   * back — which materials, and how much of each — and play that as a chord. A
   * basalt corridor hums low and dull. A gallery of xenonite and bells rings.
   * A room with grit in it has a hole in the chord where the grit is. */
  setTimeout(() => {
    if (window.RockyAudio) window.RockyAudio.chord(Sim.chordOf(S));
  }, 620);
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

/* ================= TOUCH =================
 * He has to be playable on a phone, and a thumb is not a mouse. The LEFT half of
 * the screen is a stick you drag; the RIGHT half is where you look; the verbs are
 * buttons big enough to hit while the other thumb is busy steering.
 *
 * Note there is no pointer lock on a phone and there never will be, so the whole
 * mouse path has to be optional rather than assumed. */
const TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const stickV = { x: 0, y: 0 };
if (TOUCH) {
  document.body.classList.add('touch');
  const stick = document.getElementById('stick');
  const knob = document.getElementById('knob');
  // the stick shrinks on a short screen, so its throw is measured, not assumed
  const throwOf = () => stick.getBoundingClientRect().width * 0.4;
  let stickId = null, lookId = null, lookX = 0, lookY = 0;

  const setKnob = (dx, dy) => {
    const R = throwOf();
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    stickV.x = dx / R;
    stickV.y = dy / R;
  };

  stick.addEventListener('pointerdown', (e) => {
    stickId = e.pointerId;
    stick.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  stick.addEventListener('pointermove', (e) => {
    if (e.pointerId !== stickId) return;
    const r = stick.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const R = throwOf();
    const len = Math.hypot(dx, dy);
    if (len > R) { dx = dx / len * R; dy = dy / len * R; }
    setKnob(dx, dy);
  });
  const dropStick = (e) => {
    if (e.pointerId !== stickId) return;
    stickId = null;
    setKnob(0, 0);
  };
  stick.addEventListener('pointerup', dropStick);
  stick.addEventListener('pointercancel', dropStick);

  // the right half of the screen is where you look
  canvas.addEventListener('pointerdown', (e) => {
    if (e.clientX < innerWidth * 0.42) return;
    lookId = e.pointerId; lookX = e.clientX; lookY = e.clientY;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== lookId) return;
    yaw -= (e.clientX - lookX) * 0.006;
    pitch = Math.max(-0.9, Math.min(1.1, pitch + (e.clientY - lookY) * 0.005));
    lookX = e.clientX; lookY = e.clientY;
  });
  const dropLook = (e) => { if (e.pointerId === lookId) lookId = null; };
  canvas.addEventListener('pointerup', dropLook);
  canvas.addEventListener('pointercancel', dropLook);

  const VERB = {
    pulse: () => doPulse(),
    use: () => doUse(),
    take: () => doTake(),
    place: () => doPlace(),
    codex: () => window.ROCKY_CODEX && window.ROCKY_CODEX(true)
  };
  for (const b of document.querySelectorAll('.vb')) {
    const what = b.dataset.do;
    if (what === 'jump' || what === 'down') {   // these are HELD, not tapped
      const key = what === 'jump' ? 'Space' : 'ShiftLeft';
      b.addEventListener('pointerdown', (e) => { keys[key] = true; e.preventDefault(); });
      b.addEventListener('pointerup', () => { keys[key] = false; });
      b.addEventListener('pointercancel', () => { keys[key] = false; });
    } else {
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); VERB[what](); });
    }
  }
  // and a pocket is a thing you tap
  document.getElementById('belt').style.pointerEvents = 'auto';
  document.getElementById('belt').addEventListener('pointerdown', (e) => {
    const cell = e.target.closest('.p');
    if (!cell) return;
    Sim.selectSlot(S, [].indexOf.call(cell.parentNode.children, cell));
  });
}

function doTake() {
  const r = Sim.takeBlock(S);
  if (!r.ok) { flash(r.why); return; }
  const b = CFG.blocks[r.block];
  const note = b.key === 'xenonite' ? 'It carries sound almost for free.'
    : b.key === 'sand' ? 'It kills sound stone dead.'
    : b.key === 'bell' ? 'It will answer when it hears you. Stand it somewhere useful.'
    : 'Into the vest with it.';
  say('♪♩', `${b.name}. ${note}`);
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
let gaitT = 0;
let faceYaw = 0;
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const qStep = new THREE.Quaternion();
const qLift = new THREE.Quaternion();
const qTarget = new THREE.Quaternion();
const qRoll = new THREE.Quaternion();
const bodyUp = new THREE.Vector3();
const bodyFwd = new THREE.Vector3();
const bodySide = new THREE.Vector3();
const basis = new THREE.Matrix4();
const FWD_AXIS = new THREE.Vector3(1, 0, 0);

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

  // keys and thumb are the same input: whichever is pushing hardest wins
  const kf = (held(MOVE.fwd) ? 1 : 0) - (held(MOVE.back) ? 1 : 0);
  const kr = (held(MOVE.right) ? 1 : 0) - (held(MOVE.left) ? 1 : 0);
  input.fwd = Math.abs(stickV.y) > Math.abs(kf) ? -stickV.y : kf;
  input.right = Math.abs(stickV.x) > Math.abs(kr) ? stickV.x : kr;
  input.jump = !!keys.Space;
  input.down = !!(keys.ShiftLeft || keys.ShiftRight);
  input.yaw = yaw;

  Sim.step(S, dt, input);

  for (const id of Sim.takeCues(S)) {
    if (window.RockyAudio) window.RockyAudio.cue(id);
    if (id === 'pressure') {
      banner('THE AIR CAME BACK');
      const line = S.chapter.lines.find((l) => l.at === 'pressure');
      if (line) setTimeout(() => say(line.chord, line.text), 1200);
    }
    if (id === 'exitopen') {
      banner('THE WAY OUT IS CALLING');
      flash('pulse — you will hear it');
    }
    if (id === 'done') {
      const n = CFG.chapters.findIndex((c) => c.id === S.chapter.id);
      const next = CFG.chapters[n + 1];
      banner(next ? 'CHAPTER COMPLETE' : 'THAT IS ALL OF IT — SO FAR');
      if (next) setTimeout(() => load(next.id), 3400);
    }
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
  /* HE WALKS.
   * Five legs, and no hurry. They ripple rather than pair off, because five does not
   * divide into two — and there is never a moment when he is not touching the ground
   * with something, so his body rides ALONG rather than bobbing like a biped's.
   *
   * Each leg lifts by turning about the axis across it, and steps by turning about
   * his spine. Both of those are rotations about the SHOULDER, which is why the bake
   * went to the trouble of finding where the shoulders are. */
  const speed = Math.hypot(p.vx, p.vz);
  const moving = speed > 0.35 || p.climbing;
  gaitT += (p.climbing ? speed * 0.7 + 1.2 : speed) * dt * 2.6;

  for (let i = 0; i < limbs.length; i++) {
    const L = limbs[i];
    const ph = gaitT + L.phase;
    // stepping: forward on the swing, back on the stance
    const stride = moving ? Math.sin(ph) * 0.26 : 0;
    // lifting: only while it is SWINGING. A leg does not rise while it is carrying him.
    const up = moving ? Math.max(0, Math.sin(ph)) * 0.30 : 0;

    qStep.setFromAxisAngle(UP_AXIS, stride);
    qLift.setFromAxisAngle(L.lift, -up);
    // stance first, then walk on top of it. Get this order wrong and he swings his
    // legs in the sculptor's pose instead of his own.
    L.g.quaternion.copy(qStep).multiply(qLift).multiply(L.rest);
  }

  /* HE FACES THE WAY HE IS GOING.
   * Pointing him wherever the CAMERA is looking is what made him look like he was
   * being towed along on a rope: strafe, and he slides sideways while still staring
   * straight ahead. A creature turns to walk. He turns toward his own velocity, and
   * only holds the camera's heading when he is standing still. */
  if (speed > 0.4) {
    const want = Math.atan2(-p.vx, -p.vz);
    let dyaw = want - faceYaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    faceYaw += dyaw * Math.min(1, dt * 9);
  }
  /* ON A WALL, THE WALL IS THE FLOOR.
   * An Eridian on a cliff face has his feet ON the cliff. The ENGINE reports which
   * way the rock faces (p.wallN — a fact about the world, not a drawing decision) and
   * we build him an entire new set of axes out of it: his UP is the wall's normal,
   * and his FORWARD is straight up the wall, because that is the way he is going.
   *
   * BUILT FRESH EVERY FRAME, from nothing. My first attempt slerped his CURRENT
   * orientation toward the wall and then multiplied his heading into it — so the
   * heading compounded, frame after frame, and he span like a top. An orientation is
   * a fact about where he is now, not a thing you accumulate. Work out where he
   * should be, and ease toward THAT. */
  const onWall = (p.onWall || p.climbing) && p.wallN && !p.onGround;
  if (onWall) {
    bodyUp.set(p.wallN[0], p.wallN[1], p.wallN[2]).normalize();
    // straight up the wall: world-up with the wall's normal taken out of it
    bodyFwd.set(0, 1, 0).addScaledVector(bodyUp, -bodyUp.y);
    if (bodyFwd.lengthSq() < 1e-4) bodyFwd.set(1, 0, 0);   // a ceiling: any direction will do
    bodyFwd.normalize();
  } else {
    bodyUp.set(0, 1, 0);
    // the sculpt faces down its +x axis, and he walks the way he is going
    bodyFwd.set(Math.sin(faceYaw + Math.PI / 2), 0, Math.cos(faceYaw + Math.PI / 2)).normalize();
  }
  bodySide.crossVectors(bodyFwd, bodyUp);
  basis.makeBasis(bodyFwd, bodyUp, bodySide);
  qTarget.setFromRotationMatrix(basis);

  // roll on the stride — a five-legged creature sways, it does not bounce
  if (moving && !onWall) {
    qRoll.setFromAxisAngle(UP_AXIS, 0);
    qTarget.multiply(qRoll.setFromAxisAngle(FWD_AXIS, Math.sin(gaitT * 0.5) * 0.03));
  }

  // ease toward it. A creature turns onto a wall; it does not snap onto one.
  rocky.quaternion.slerp(qTarget, Math.min(1, dt * (onWall ? 9 : 12)));
  rocky.position.y = p.y - (moving && !onWall ? Math.abs(Math.sin(gaitT * 1.25)) * 0.012 : 0);

  /* the labels: they fade in when you are close enough for them to be your business.
   * THE WAY OUT is the exception — once the room is solved it is visible from right
   * across the level, because a player who cannot find the door is not playing. */
  const wayOpen = !!S.flags.exitOpen;
  for (const sp of labels.children) {
    const d = sp.position.distanceTo(camera.position);
    if (sp.userData.exit) {
      sp.material.opacity = wayOpen ? Math.max(0.35, Math.min(1, (60 - d) / 20)) : 0;
    } else {
      sp.material.opacity = Math.max(0, Math.min(1, (16 - d) / 5));
    }
    sp.visible = sp.material.opacity > 0.02;
  }

  // the satchel swells as the pockets fill: you can see how loaded he is
  if (pouches[0]) {
    const carried = S.belt.filter(Boolean).length;
    const b = pouches[0].userData.base;
    const fill = b * (0.6 + 0.4 * (carried / S.belt.length));
    pouches[0].scale.set(fill * 0.8, fill, fill * 1.15);
  }
  // he flashes when he shouts. you are never in any doubt about who made the sound.
  /* He flashes when he shouts: you are never in any doubt about who made the sound.
   * The carapace colours live in instanceColor, so the material's colour is a plain
   * MULTIPLIER over the whole body — white is his own colour, brighter is him
   * shouting. Set an actual colour here and you would be repainting him. */
  flare = Math.max(0, flare - dt * 4.2);
  const glow = 1 + flare * 1.6;
  const body = rocky.userData.model;
  if (body) body.material.color.setRGB(glow, glow, glow);

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

  /* THE TOOL BELT. Six pockets, because Eridians count in six. The one he has
   * selected is the one his hands are on — and there is no separate "held" value
   * anywhere, in here or in the engine: it IS the selected pocket. */
  const belt = el('belt');
  if (!belt.dataset.n || +belt.dataset.n !== S.belt.length) {
    belt.dataset.n = S.belt.length;
    belt.innerHTML = S.belt.map((_, i) => `<div class="p"><b>${i + 1}</b><span></span></div>`).join('');
  }
  for (let i = 0; i < S.belt.length; i++) {
    const cell = belt.children[i];
    const b = S.belt[i];
    cell.classList.toggle('sel', i === S.slot);
    cell.classList.toggle('full', !!b);
    const span = cell.lastChild;
    const want = b ? CFG.blocks[b].name : '';
    if (span.textContent !== want) {
      span.textContent = want;
      span.style.color = b ? CFG.blocks[b].color : '';
    }
  }

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

  /* THE WALKTHROUGH PANEL. One thing to do, in words, all the time — and the
   * ENGINE decides when it is done, so this can never tell you to do something the
   * game has stopped caring about. */
  const w = Sim.stepNow(S);
  const wp = el('walk');
  if (w) {
    if (wp.dataset.i !== String(S.stepI)) {
      wp.dataset.i = String(S.stepI);
      wp.innerHTML = '<b>' + (S.stepI + 1) + ' / ' + S.chapter.walk.length + '</b>' + w.say;
      wp.classList.remove('go');
      void wp.offsetWidth;
      wp.classList.add('go');
    }
    wp.style.opacity = '1';
  } else if (S.chapter.walk) {
    if (wp.dataset.i !== 'done') {
      wp.dataset.i = 'done';
      wp.innerHTML = '<b>DONE</b>That is everything Erid can teach you. Press C at any time for the codex.';
    }
  } else {
    wp.style.opacity = '0';
  }

  /* VACUUM. He is not quiet in here. He is DEAF, and he should be told so, because a
   * player whose game has stopped answering needs to know it is the game and not a
   * bug. The engine decides whether he is standing in it. */
  const vac = Sim.inVacuum(S);
  const vp = el('vac');
  vp.style.opacity = vac ? '1' : '0';
  if (vac && !vp.dataset.on) {
    vp.dataset.on = '1';
    vp.textContent = 'VACUUM — there is no air here. You can only hear what you are touching.';
  } else if (!vac) { delete vp.dataset.on; }

  const g = Sim.nearestGauge(S);
  el('prompt').style.opacity = (g && !g.read) ? '1' : '0';
  if (g && !g.read) el('prompt').textContent = 'F — READ GAUGE';

  requestAnimationFrame(frame);
}

/* ---------- LABELS ----------
 * PLAYTEST: "can we have text blocks above the materials, so we can correlate the
 * word in the quest to a block?"  Yes, and it is the obvious thing: a name in a
 * sentence and a lump of colour in a room are only the same thing if somebody says
 * so. They come from the chapter's own data, and they fade in only when you are
 * close enough to read them.
 */
const labels = new THREE.Group();
scene.add(labels);

function makeLabel(text, color, seeThrough) {
  const pad = 12, fs = 30;
  const c = document.createElement('canvas');
  const g0 = c.getContext('2d');
  g0.font = `${fs}px ui-monospace, monospace`;
  const w = Math.ceil(g0.measureText(text).width) + pad * 2;
  c.width = w; c.height = fs + pad * 2;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(4,10,18,0.82)';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = color; g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, c.width - 3, c.height - 3);
  g.font = `${fs}px ui-monospace, monospace`;
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.fillText(text, pad, c.height / 2 + 1);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  /* sizeAttenuation OFF: a label is a piece of WRITING, and writing does not get
   * bigger when you walk toward it. Leave it on and the label two metres in front of
   * you fills the entire screen while the one across the room is unreadable — which
   * is exactly what happened. It stays the same size and simply fades in when you
   * are near enough for it to be any of your business. */
  /* A LABEL IS OCCLUDED BY THE ROCK, like everything else.
   * With depthTest off, the label on the forge in the NEXT ROOM hangs in the air in
   * front of the wall you are looking at, and the player reads it as being right
   * there. (It did. It is why the tutorial's geometry looked like nonsense.)
   * The ONE exception is the way out, which is a beacon and is meant to be seen
   * through the whole level — that is its entire job. */
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthTest: !seeThrough, depthWrite: false, fog: false,
    sizeAttenuation: false
  }));
  sp.scale.set(c.width / c.height * 0.05, 0.05, 1);
  sp.renderOrder = 10;
  return sp;
}

function buildLabels() {
  labels.clear();
  // the way out labels itself, in every chapter, without anybody remembering to
  if (S.exit) {
    const sp = makeLabel('THE WAY OUT', '#7cffb0', true);   // a beacon: seen through the rock
    sp.position.set(S.exit[0] + 0.5, S.exit[1] + 1.5, S.exit[2] + 0.5);
    sp.userData.exit = true;
    labels.add(sp);
  }
  const list = S.chapter.labels || [];
  for (const L of list) {
    const b = L.block != null ? CFG.blocks[L.block] : null;
    const sp = makeLabel(L.text || (b ? b.name : '?'), L.color || (b ? b.color : '#8fe8ff'), false);
    sp.position.set(L.at[0] + 0.5, L.at[1] + 1.35, L.at[2] + 0.5);
    labels.add(sp);
  }
}

/* ---------- open ---------- */
function load(id) {
  /* A GENERATED chapter gets a NEW SEED every time you walk into it — that is the
   * entire point of it — and the seed goes on the screen, because a warren nobody has
   * ever seen is a better story if you can hand it to somebody else. */
  const chap = CFG.chapters.find((c) => c.id === id);
  const seed = chap && chap.reseed ? (Math.random() * 1e9) | 0 : 1;
  S = Sim.create(CFG, { seed, chapter: id });
  S.seedShown = seed;
  camDist = 5.4;
  const n = CFG.chapters.findIndex((c) => c.id === S.chapter.id) + 1;
  el('chapname').textContent = chap && chap.reseed
    ? `${S.chapter.name.split('  ')[0]} · warren #${seed}`
    : `Chapter ${n} — ${S.chapter.name}`;
  el('objective').textContent = S.chapter.objective;
  // the box holds the gauge count AND the resonator readout: hide it only when a
  // chapter has neither, or the ear goes invisible in every chapter without gauges.
  el('gbox').style.display = (S.gauges.length || S.ears.length) ? '' : 'none';
  el('glabel').style.display = S.gauges.length ? '' : 'none';
  el('gcount').style.display = S.gauges.length ? '' : 'none';
  refreshGauges();
  buildLabels();
  const open = S.chapter.lines.filter((l) => l.at === 'start');
  if (open[0]) say(open[0].chord, open[0].text);
  if (open[1]) setTimeout(() => say(open[1].chord, open[1].text), 5600);
}
load(CFG.chapters[0].id);
requestAnimationFrame(frame);

/* ---------- test hooks (the browser must be able to answer questions) ---------- */
/* the suite cannot see a spinning creature, so the browser is asked directly:
 * which way is he standing, and is his heading actually settling? */
window.__rockyBody = () => {
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rocky.quaternion);
  const e = new THREE.Euler().setFromQuaternion(rocky.quaternion, 'YXZ');
  return { up: [+up.x.toFixed(2), +up.y.toFixed(2), +up.z.toFixed(2)], yaw: +e.y.toFixed(3) };
};

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
