/* VOXELIZE ROCKY
 *
 * Turns a reference STL into a small blocky Rocky.
 *
 * The source model is 821,616 triangles and 41MB. You cannot ship that to a
 * browser, and it is somebody else's mesh — so nothing in this repository is
 * derived FROM it at runtime. We rasterise it, once, at low resolution, and what
 * we keep is a few thousand cubes: his silhouette, in the only shape this game
 * knows how to draw. That is a much better Rocky than the one I guessed at, and
 * it is still made of blocks.
 *
 *   node scripts/voxelize.js [res]        (res = voxels along the longest axis)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', process.argv[3] || 'statue_unsupported.stl');
const OUT = path.join(ROOT, 'js', 'model.js');
const RES = +(process.argv[2] || 30);

/* ---------- read the binary STL ---------- */
const buf = fs.readFileSync(SRC);
const nTri = buf.readUInt32LE(80);
console.log(`  ${nTri.toLocaleString()} triangles, ${(buf.length / 1e6).toFixed(1)}MB`);

const tri = new Float32Array(nTri * 9);
for (let t = 0; t < nTri; t++) {
  const o = 84 + t * 50 + 12;            // skip the normal
  for (let v = 0; v < 9; v++) tri[t * 9 + v] = buf.readFloatLE(o + v * 4);
}

/* ---------- bounds ---------- */
const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < tri.length; i += 3) {
  for (let a = 0; a < 3; a++) {
    const v = tri[i + a];
    if (v < lo[a]) lo[a] = v;
    if (v > hi[a]) hi[a] = v;
  }
}
const size = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
console.log(`  bounds  ${size.map((s) => s.toFixed(1)).join(' x ')}`);

const scale = RES / Math.max(size[0], size[1], size[2]);
const dim = size.map((s) => Math.max(1, Math.ceil(s * scale)));
console.log(`  grid    ${dim.join(' x ')}  (${RES} along the longest axis)`);

/* ---------- surface voxelisation ----------
 * Sample each triangle densely enough that no voxel it crosses is missed. A shell
 * is all we want: Rocky is hollow and nobody will ever be inside him. */
const [W, H, D] = dim;
const grid = new Uint8Array(W * H * D);
const at = (x, y, z) => (y * D + z) * W + x;
const mark = (x, y, z) => {
  x = Math.min(W - 1, Math.max(0, Math.floor(x)));
  y = Math.min(H - 1, Math.max(0, Math.floor(y)));
  z = Math.min(D - 1, Math.max(0, Math.floor(z)));
  grid[at(x, y, z)] = 1;
};

for (let t = 0; t < nTri; t++) {
  const o = t * 9;
  const ax = (tri[o] - lo[0]) * scale, ay = (tri[o + 1] - lo[1]) * scale, az = (tri[o + 2] - lo[2]) * scale;
  const bx = (tri[o + 3] - lo[0]) * scale, by = (tri[o + 4] - lo[1]) * scale, bz = (tri[o + 5] - lo[2]) * scale;
  const cx = (tri[o + 6] - lo[0]) * scale, cy = (tri[o + 7] - lo[1]) * scale, cz = (tri[o + 8] - lo[2]) * scale;

  const eAB = Math.max(Math.abs(bx - ax), Math.abs(by - ay), Math.abs(bz - az));
  const eAC = Math.max(Math.abs(cx - ax), Math.abs(cy - ay), Math.abs(cz - az));
  const n = Math.max(1, Math.ceil(Math.max(eAB, eAC) * 2));
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n - i; j++) {
      const u = i / n, v = j / n, w = 1 - u - v;
      mark(ax * w + bx * u + cx * v, ay * w + by * u + cy * v, az * w + bz * u + cz * v);
    }
  }
}

let shell = 0;
for (let i = 0; i < grid.length; i++) if (grid[i]) shell++;
console.log(`  ${shell.toLocaleString()} voxels in the shell`);

/* ---------- FILL HIM IN ----------
 * A shell is one voxel thick, so his legs come out as FINS: from half the angles
 * you are looking straight through him. Flood the outside air, and everything the
 * flood never reached is inside him — that is a solid Rocky, and a solid Rocky has
 * a silhouette. */
{
  const out = new Uint8Array(W * H * D);
  const q = [0];
  out[0] = 1;
  const nb = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  while (q.length) {
    const i = q.pop();
    const x = i % W, z = ((i / W) | 0) % D, y = (i / (W * D)) | 0;
    for (const [dx, dy, dz] of nb) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < 0 || ny < 0 || nz < 0 || nx >= W || ny >= H || nz >= D) continue;
      const j = at(nx, ny, nz);
      if (out[j] || grid[j]) continue;    // the shell stops the flood
      out[j] = 1;
      q.push(j);
    }
  }
  let added = 0;
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i] && !out[i]) { grid[i] = 1; added++; }   // never reached from outside: he is in there
  }
  console.log(`  ${added.toLocaleString()} voxels filled in — he is solid now, not a crust`);
}

/* ================================================================
 * TAKE HIM APART
 *
 * A statue does not walk. To move his appendages I have to know which cubes ARE
 * his appendages — and nobody labelled them, so we work it out.
 *
 * The trick is that a carapace is THICK and a limb is THIN. Measure how deep every
 * voxel sits inside him (distance to the nearest air), keep only the deep ones, and
 * what survives is his body with the limbs melted off. Everything else, split into
 * connected lumps, IS the limbs — and where each lump touches the body is its
 * shoulder. That is the whole rig: no bones, no weights, no Blender. Cubes that
 * know which limb they belong to, and a point to turn about.
 * ============================================================== */
const NB6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

// how deep is every voxel? (BFS out from the air)
const depth = new Int16Array(W * H * D).fill(-1);
{
  const q = [];
  for (let i = 0; i < grid.length; i++) if (!grid[i]) { depth[i] = 0; q.push(i); }
  for (let h = 0; h < q.length; h++) {
    const i = q[h];
    const x = i % W, z = ((i / W) | 0) % D, y = (i / (W * D)) | 0;
    for (const [dx, dy, dz] of NB6) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < 0 || ny < 0 || nz < 0 || nx >= W || ny >= H || nz >= D) continue;
      const j = at(nx, ny, nz);
      if (depth[j] !== -1) continue;
      depth[j] = depth[i] + 1;
      q.push(j);
    }
  }
}
let maxDepth = 0;
for (let i = 0; i < depth.length; i++) if (grid[i]) maxDepth = Math.max(maxDepth, depth[i]);

const components = (mask) => {
  const lab = new Int32Array(W * H * D).fill(-1);
  const parts = [];
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || lab[s] !== -1) continue;
    const id = parts.length;
    const cells = [s];
    lab[s] = id;
    for (let h = 0; h < cells.length; h++) {
      const i = cells[h];
      const x = i % W, z = ((i / W) | 0) % D, y = (i / (W * D)) | 0;
      for (const [dx, dy, dz] of NB6) {
        const nx = x + dx, ny = y + dy, nz = z + dz;
        if (nx < 0 || ny < 0 || nz < 0 || nx >= W || ny >= H || nz >= D) continue;
        const j = at(nx, ny, nz);
        if (!mask[j] || lab[j] !== -1) continue;
        lab[j] = id;
        cells.push(j);
      }
    }
    parts.push(cells);
  }
  return { lab, parts };
};

/* Melt the limbs off.
 *
 * I tried it by THICKNESS first — a carapace is thick, a limb is thin — and it does
 * not work on this animal, for two reasons that are both interesting. His skin is
 * one voxel deep, so it is as "thin" as a limb, and being a continuous shell it
 * welded all five limbs into one lump of 1,011 cubes wrapped round the whole
 * creature. And when I grew the core back out to swallow its own skin, it swallowed
 * the legs too — because Rocky's legs are CHUNKY, and a chunky leg has a deep
 * inside just like a carapace does.
 *
 * So: not thickness. TOPOLOGY. He is a dome with five limbs radiating out of it, so
 * the carapace is what lies within some radius of his central axis, and a limb is
 * anything that reaches out past that. Cut at the right radius and the limbs fall
 * apart from each other on their own, because that is genuinely how he is built.
 *
 * (The STL is Z-up, so his axis is z and his ground plane is x,y. The swap to a
 * Y-up game happens later, at export.) */
let cx = 0, cy = 0, cz = 0, nSolid = 0;
for (let i = 0; i < grid.length; i++) {
  if (!grid[i]) continue;
  cx += i % W; cz += ((i / W) | 0) % D; cy += (i / (W * D)) | 0;
  nSolid++;
}
cx /= nSolid; cy /= nSolid; cz /= nSolid;

let best = null;
const maxR = Math.max(W, H) / 2;
for (let R0 = 3; R0 <= maxR; R0 += 0.5) {
  const core = new Uint8Array(W * H * D);
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i]) continue;
    const x = i % W, y = (i / (W * D)) | 0;
    if (Math.hypot(x - cx, y - cy) < R0) core[i] = 1;
  }
  const c = components(core);
  const bodies = c.parts.filter((p) => p.length >= 40);
  if (bodies.length !== 1) continue;

  const rest = new Uint8Array(W * H * D);
  for (let i = 0; i < grid.length; i++) if (grid[i] && !core[i]) rest[i] = 1;
  const limbs = components(rest).parts.filter((p) => p.length >= 30);
  if (limbs.length < 4) continue;

  /* Five limbs, and as MUCH limb as we can get: every voxel the carapace keeps is a
   * voxel that will not move when he walks, and a creature that twitches its
   * fingertips is not a creature that is walking. */
  const limbMass = limbs.reduce((a, p) => a + p.length, 0);
  const score = Math.abs(limbs.length - 5) * 100000 - limbMass;
  if (!best || score < best.score) best = { R0, score, body: bodies[0], core, limbs };
}
if (!best) throw new Error('could not take him apart');
const limbMass = best.limbs.reduce((a, p) => a + p.length, 0);
console.log(`  cut at radius ${best.R0} from his axis: a carapace of ${best.body.length} voxels and ${best.limbs.length} limbs (${limbMass} voxels of him move)`);

/* Every voxel belongs to exactly one part. Anything that is not in a limb — the
 * shell of the body, the little crumbs, the bits between — is the body. */
const partOf = new Int16Array(W * H * D).fill(0);   // 0 = body
best.limbs.forEach((cells, k) => { for (const i of cells) partOf[i] = k + 1; });

/* WHERE A LIMB TURNS. Its shoulder is the middle of the ring of voxels where it
 * meets the body — that, and nowhere else, is the point it must rotate about, or
 * it will swing from its own middle and detach from him as it goes. */
const pivots = best.limbs.map((cells, k) => {
  let sx = 0, sy = 0, sz = 0, n = 0;
  for (const i of cells) {
    const x = i % W, z = ((i / W) | 0) % D, y = (i / (W * D)) | 0;
    let touches = false;
    for (const [dx, dy, dz] of NB6) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < 0 || ny < 0 || nz < 0 || nx >= W || ny >= H || nz >= D) continue;
      const j = at(nx, ny, nz);
      if (grid[j] && partOf[j] === 0) { touches = true; break; }
    }
    if (touches) { sx += x; sy += y; sz += z; n++; }
  }
  if (!n) {                                  // never touches the body: turn about its own root
    for (const i of cells) { sx += i % W; sy += (i / (W * D)) | 0; sz += ((i / W) | 0) % D; }
    n = cells.length;
  }
  return [sx / n, sy / n, sz / n];
});

/* ...and then keep only what can be SEEN. The inside of Rocky is not a place. */
{
  const surf = new Uint8Array(W * H * D);
  let kept = 0;
  for (let y = 0; y < H; y++)
    for (let z = 0; z < D; z++)
      for (let x = 0; x < W; x++) {
        const i = at(x, y, z);
        if (!grid[i]) continue;
        const open =
          x === 0 || x === W - 1 || y === 0 || y === H - 1 || z === 0 || z === D - 1 ||
          !grid[at(x + 1, y, z)] || !grid[at(x - 1, y, z)] ||
          !grid[at(x, y + 1, z)] || !grid[at(x, y - 1, z)] ||
          !grid[at(x, y, z + 1)] || !grid[at(x, y, z - 1)];
        if (open) { surf[i] = 1; kept++; }
      }
  grid.set(surf);
  console.log(`  ${kept.toLocaleString()} voxels on the surface — the rest of him nobody will ever see`);
}

/* ---------- WHICH WAY IS UP ----------
 * A sculpt meant for a printer is Z-up, and this game is Y-up, so straight out of
 * the STL Rocky lies flat on his back on the floor like something you have run
 * over. Swap the axes HERE, at bake time, rather than compensating for it in the
 * renderer every frame forever. */
const UP = (process.argv[4] || 'z').toLowerCase();
let OW = W, OH = H, OD = D;
if (UP === 'z') { OW = W; OH = D; OD = H; }
const spin = (x, y, z) => (UP === 'z' ? [x, z, H - 1 - y] : [x, y, z]);

const parts = [];
for (let k = 0; k <= best.limbs.length; k++) parts.push([]);
for (let y = 0; y < H; y++)
  for (let z = 0; z < D; z++)
    for (let x = 0; x < W; x++) {
      const i = at(x, y, z);
      if (!grid[i]) continue;
      const [ux, uy, uz] = spin(x, y, z);
      parts[partOf[i]].push(ux, uy, uz);
    }
const upPivots = pivots.map((p) => {
  const [ux, uy, uz] = spin(p[0], p[1], p[2]);
  return [+ux.toFixed(2), +uy.toFixed(2), +uz.toFixed(2)];
});

/* ================================================================
 * PUT HIS ARMS DOWN.
 *
 * The sculpt is a STATUE: he is reared up with two arms flung in the air, which is
 * a wonderful thing to have on a shelf and a terrible thing to walk around in. No
 * amount of clever swinging fixes it — animating a statue just wiggles the statue,
 * and he looked like he was being dragged along by a rope.
 *
 * But we know where his shoulders are, so we can simply PUT HIM IN A STANCE: for
 * every limb, work out where it currently points, work out where a limb standing on
 * the ground OUGHT to point (outward from his axis, and down), and store the turn
 * that gets it from one to the other. The renderer applies that first and then
 * walks him on top of it.
 *
 * A limb that is already pointing down and out is left exactly where it is. Only
 * the ones in the air get put away.
 * ============================================================== */
const v3 = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = v3.len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
};

// his centre, in the Y-up frame the game will see
let bx = 0, by = 0, bz = 0, bn = 0;
for (const p of parts) for (let i = 0; i < p.length; i += 3) { bx += p[i]; by += p[i + 1]; bz += p[i + 2]; bn++; }
bx /= bn; by /= bn; bz /= bn;

const rests = [];
for (let k = 0; k < best.limbs.length; k++) {
  const pv = upPivots[k];
  const cells = parts[k + 1];
  let sx = 0, sy = 0, sz = 0;
  for (let i = 0; i < cells.length; i += 3) { sx += cells[i]; sy += cells[i + 1]; sz += cells[i + 2]; }
  const n = cells.length / 3;
  const centroid = [sx / n, sy / n, sz / n];

  const reach = v3.norm(v3.sub(centroid, pv));

  // where a limb he is STANDING on ought to point: out from his spine, and down
  let out = v3.norm([pv[0] - bx, 0, pv[2] - bz]);
  if (v3.len(out) < 0.2) out = v3.norm([reach[0], 0, reach[2]]);
  if (v3.len(out) < 0.2) out = [1, 0, 0];
  const want = v3.norm(v3.add(v3.mul(out, 0.72), [0, -0.70, 0]));

  const d = Math.max(-1, Math.min(1, v3.dot(reach, want)));
  let axis = v3.cross(reach, want);
  let angle = Math.acos(d);
  if (v3.len(axis) < 1e-4) { axis = [0, 1, 0]; angle = 0; }
  else axis = v3.norm(axis);

  // already standing on it? leave it alone.
  const posed = angle < 0.35 ? reach : want;
  if (angle < 0.35) angle = 0;

  const h = Math.sin(angle / 2);
  rests.push({
    q: [+(axis[0] * h).toFixed(4), +(axis[1] * h).toFixed(4), +(axis[2] * h).toFixed(4), +Math.cos(angle / 2).toFixed(4)],
    dir: posed.map((v) => +v.toFixed(3)),
    turned: +(angle * 180 / Math.PI).toFixed(0)
  });
}
console.log(`  up axis: ${UP.toUpperCase()}  ->  grid ${OW} x ${OH} x ${OD}`);
const cells = parts.flat();

const out = `/* ROCKY — the model, IN PIECES.
 * Baked by scripts/voxelize.js from a reference sculpt (${nTri.toLocaleString()} triangles). That mesh
 * is not in this repository and nothing here touches it at runtime: what is here is
 * ${(cells.length / 3).toLocaleString()} cubes — his silhouette, in the only shape this game knows how to draw.
 *
 * And he is TAKEN APART, because a statue does not walk. A carapace is thick and a
 * limb is thin, so we measured how deep every voxel sits inside him, kept the deep
 * ones (that is the body, with its limbs melted off), and split the rest into lumps.
 * The lumps are the limbs. Where each lump meets the body is its SHOULDER, and that
 * is the point it turns about — swing a limb from its own middle instead and it
 * detaches from him as it goes.
 *
 * And he is PUT IN A STANCE. The sculpt is a statue, reared up with two arms flung
 * in the air — wonderful on a shelf, useless to walk around in, and no amount of
 * clever swinging fixes it, because animating a statue only wiggles the statue. So
 * every limb carries the turn that takes it from where the sculptor left it to where
 * a limb standing on the ground ought to be: out from his spine, and down.
 *
 *   dim     the grid he was rasterised into
 *   parts   [0] is the carapace; the rest are limbs
 *   pivot   a limb's shoulder, in grid coordinates. The carapace has none.
 *   rest    the quaternion that puts that limb into its stance (x,y,z,w)
 *   dir     which way it points once it is standing on it
 *   cells   x,y,z triples, one per cube
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ROCKY_MODEL = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    dim: [${OW}, ${OH}, ${OD}],
    parts: [
${parts.map((p, k) => k === 0
    ? `      { name: 'carapace', pivot: null, rest: null, dir: null, cells: [${p.join(',')}] }`
    : `      { name: 'limb${k}', pivot: ${JSON.stringify(upPivots[k - 1])}, rest: ${JSON.stringify(rests[k - 1].q)}, dir: ${JSON.stringify(rests[k - 1].dir)}, cells: [${p.join(',')}] }`
  ).join(',\n')}
    ]
  };
});
`;
parts.forEach((p, k) => console.log(
  `     part ${k}: ${(p.length / 3).toString().padStart(4)} cubes` +
  (k ? `   shoulder ${upPivots[k - 1].map((v) => v.toFixed(0)).join(',')}   put down by ${rests[k - 1].turned}°`
     : '   (the carapace)')));
fs.writeFileSync(OUT, out);
console.log(`  wrote js/model.js  (${(out.length / 1024).toFixed(0)}KB)`);
