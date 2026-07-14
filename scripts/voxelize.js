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
const cells = [];
let OW = W, OH = H, OD = D;
if (UP === 'z') { OW = W; OH = D; OD = H; }
for (let y = 0; y < H; y++)
  for (let z = 0; z < D; z++)
    for (let x = 0; x < W; x++) {
      if (!grid[at(x, y, z)]) continue;
      if (UP === 'z') cells.push(x, z, H - 1 - y);   // model Z is up; model Y becomes depth
      else cells.push(x, y, z);
    }
console.log(`  up axis: ${UP.toUpperCase()}  ->  grid ${OW} x ${OH} x ${OD}`);

const out = `/* ROCKY — the model.
 * Baked by scripts/voxelize.js from a reference STL (821,616 triangles, 41MB).
 * Nothing here is derived from that mesh at runtime and the mesh itself is not in
 * this repository: what is here is ${(cells.length / 3).toLocaleString()} cubes — his silhouette, in the
 * only shape this game knows how to draw.
 *
 *   dim   the grid he was rasterised into
 *   cells x,y,z triples, one per solid cube
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ROCKY_MODEL = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    dim: [${OW}, ${OH}, ${OD}],
    cells: [${cells.join(',')}]
  };
});
`;
fs.writeFileSync(OUT, out);
console.log(`  wrote js/model.js  (${(out.length / 1024).toFixed(0)}KB)`);
