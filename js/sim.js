/* ROCKY SAVES THE UNIVERSE — sim.js
 *
 * The engine. It runs with no screen, no canvas, no browser. Everything that
 * is TRUE about the game is true in here: the world, Rocky's body, and — the
 * whole point — how sound moves through rock.
 *
 * THE HONESTY RULE (carried from EMBERFALL): the renderer may not re-implement
 * anything in this file. It reads the echo field. It does not invent one.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Rocky = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const FIXED = 1 / 60;

  /* ---------- deterministic rng (seeded; replay must be exact) ---------- */
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /* ---------- grid ---------- */
  const idx = (S, x, y, z) => (y * S.d + z) * S.w + x;
  const inside = (S, x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < S.w && y < S.h && z < S.d;

  function blockAt(S, x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if (!inside(S, x, y, z)) return 1; // outside the world is solid rock, always
    return S.vox[idx(S, x, y, z)];
  }
  const isSolid = (S, x, y, z) => !!S.solidOf[blockAt(S, x, y, z)];

  function setBlock(S, x, y, z, b) {
    if (!inside(S, x, y, z)) return false;
    S.vox[idx(S, x, y, z)] = b;
    S.dirty = true;
    return true;
  }

  /* ---------- world building: a level is DATA, not a hand-placed array ----------
   *
   * PLAYTEST: "all the rooms are square. can we have more of a WORLD?"
   *
   * Erid is a warren. It was not built, it was WORN — hot ammonia through basalt for
   * a billion years — and it should not look like a corridor in an office. So the
   * builder grew some ops that eat rock the way water does:
   *
   *   roughen   gnaw at every wall that already faces air, so nothing is flat
   *   rubble    lumps on the floor, where the ceiling came down once
   *   spikes    and things hanging off it that have not come down yet
   *   cave      a lumpy ball of nothing, for a chamber that was never a room
   *   tunnel    a wandering worm of nothing, for a passage nobody surveyed
   *
   * They are seeded off the run's own RNG, so a level is the same warren every time
   * you walk into it. And they only ever eat ROCK, never anything a puzzle is made of
   * — so a resonator's alcove stays exactly as thick as it was measured to be.
   *
   * The SHIP does not get any of this. A ship is machined. That contrast is the point:
   * Erid is a place that happened, and the Blip-A is a place somebody decided.
   */
  /* PROTECTED STONE.
   *
   * The first time I let the cave ops loose they ate the puzzles. Of course they did:
   * a resonator's alcove is walled in ROCK, and "eat any rock that faces air" eats
   * exactly that. Voth, who is supposed to be stone deaf behind two cells of grit and
   * five of basalt, could suddenly hear Rocky shouting from the assembly floor at 60%
   * of the 42% he needs. The level was still beautiful. It was just no longer a level.
   *
   * So the geometry a puzzle is MEASURED on is off the menu: nothing may gnaw within
   * reach of an ear, a door, or anything the chapter names. Everywhere else, chew away.
   */
  function protectedAt(S, x, y, z) {
    const c = S.chapter;
    const near = (p, r) => Math.hypot(x - p[0], y - p[1], z - p[2]) <= r;
    for (const e of c.ears || []) if (near(e.at, e.keepOut == null ? 7 : e.keepOut)) return true;
    for (const d of c.doors || []) for (const cell of d.cells) if (near(cell, 3)) return true;
    if (c.exit && near(c.exit, 3)) return true;
    for (const f of c.forges || []) if (near(f.at, 3)) return true;
    for (const g of c.gauges || []) if (near(g.at, 3)) return true;
    for (const b of c.protect || []) {
      if (x >= b[0][0] && x <= b[1][0] && y >= b[0][1] && y <= b[1][1] && z >= b[0][2] && z <= b[1][2]) return true;
    }
    return false;
  }

  function applyOp(S, op) {
    const rnd = S.rnd;
    const free = (x, y, z) => !protectedAt(S, x, y, z);

    if (op.op === 'set') {
      setBlock(S, op.at[0], op.at[1], op.at[2], op.block);
      return;
    }

    if (op.op === 'roughen') {
      /* Gnaw at the walls. Only ROCK, and only where it already faces air, so it can
       * open a room out but can never seal one, never bury a block, and never punch
       * into an alcove that the far side of a puzzle depends on. */
      const [x0, y0, z0] = op.from, [x1, y1, z1] = op.to;
      const passes = op.passes || 2;
      const amount = op.amount == null ? 0.34 : op.amount;
      for (let pass = 0; pass < passes; pass++) {
        const eat = [];
        for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
          for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
            for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
              if (blockAt(S, x, y, z) !== 1) continue;                 // rock only
              const open =
                blockAt(S, x + 1, y, z) === 0 || blockAt(S, x - 1, y, z) === 0 ||
                blockAt(S, x, y + 1, z) === 0 || blockAt(S, x, y - 1, z) === 0 ||
                blockAt(S, x, y, z + 1) === 0 || blockAt(S, x, y, z - 1) === 0;
              if (!open) continue;
              if (!free(x, y, z)) continue;          // the stone a puzzle is measured on is not food
              if (rnd() < amount) eat.push([x, y, z]);
            }
        for (const c of eat) setBlock(S, c[0], c[1], c[2], 0);
      }
      return;
    }

    if (op.op === 'rubble' || op.op === 'spikes') {
      /* Lumps on the floor and teeth on the ceiling — but ONLY where there is headroom
       * to spare, because a boulder in a one-block crawl is not atmosphere, it is a
       * wall, and the flood-fill guard would (rightly) fail the level for it. */
      const [x0, y0, z0] = op.from, [x1, y1, z1] = op.to;
      const amount = op.amount == null ? 0.10 : op.amount;
      const drop = op.op === 'spikes';
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
          for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
            if (blockAt(S, x, y, z) !== 0) continue;
            const anchored = drop ? isSolid(S, x, y + 1, z) : isSolid(S, x, y - 1, z);
            if (!anchored) continue;
            // three clear cells the other way, or he cannot get past it
            const clear = drop
              ? (!isSolid(S, x, y - 1, z) && !isSolid(S, x, y - 2, z) && !isSolid(S, x, y - 3, z))
              : (!isSolid(S, x, y + 1, z) && !isSolid(S, x, y + 2, z) && !isSolid(S, x, y + 3, z));
            if (!clear) continue;
            if (!free(x, y, z)) continue;
            if (rnd() < amount) setBlock(S, x, y, z, op.block == null ? 1 : op.block);
          }
      return;
    }

    if (op.op === 'cave') {
      // a lumpy ball of nothing: a chamber that was never a room
      const [cx, cy, cz] = op.at;
      const r = op.r || 5;
      const ry = op.ry == null ? r * 0.7 : op.ry;
      const wob = op.wobble == null ? 0.35 : op.wobble;
      const phase = [rnd() * 9, rnd() * 9, rnd() * 9];
      for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++)
        for (let z = Math.floor(cz - r - 2); z <= cz + r + 2; z++)
          for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++) {
            if (!inside(S, x, y, z)) continue;
            if (blockAt(S, x, y, z) !== 1) continue;
            const dx = (x - cx) / r, dy = (y - cy) / ry, dz = (z - cz) / r;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            // a cheap deterministic wobble, so the ball is not a ball
            const n = Math.sin(x * 0.7 + phase[0]) * Math.sin(y * 0.9 + phase[1]) * Math.sin(z * 0.6 + phase[2]);
            if (d < 1 + n * wob && free(x, y, z)) setBlock(S, x, y, z, 0);
          }
      return;
    }

    if (op.op === 'smooth') {
      /* ROUNDER. Noise makes a lumpy wall; it does not make a CAVE. A cave is smooth
       * because it was worn smooth — so run the old cellular-automaton trick over it:
       * a cell becomes whatever most of its neighbours are. Spikes and single blocks
       * dissolve, and what is left has shoulders on it. */
      const [x0, y0, z0] = op.from, [x1, y1, z1] = op.to;
      const passes = op.passes || 2;
      for (let pass = 0; pass < passes; pass++) {
        const flip = [];
        for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
          for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
            for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
              const here = blockAt(S, x, y, z);
              if (here !== 0 && here !== 1) continue;         // only rock and air
              if (!free(x, y, z)) continue;
              let rock = 0, n = 0;
              for (let dy = -1; dy <= 1; dy++)
                for (let dz = -1; dz <= 1; dz++)
                  for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dy && !dz) continue;
                    n++;
                    if (isSolid(S, x + dx, y + dy, z + dz)) rock++;
                  }
              if (here === 0 && rock >= 17) flip.push([x, y, z, 1]);        // a pocket fills in
              else if (here === 1 && rock <= 9) flip.push([x, y, z, 0]);    // a spur wears away
            }
        for (const f of flip) setBlock(S, f[0], f[1], f[2], f[3]);
      }
      return;
    }

    if (op.op === 'warren') {
      /* ================================================================
       * A WARREN NOBODY HAS MAPPED.
       *
       * The old games all had map generators, and this is what one is FOR here: a
       * cave you have never seen, which you can only know by shouting at it. Random
       * rock, then a cellular automaton wears it into caverns and throats, then we
       * keep the biggest single connected space and throw the rest away — because a
       * cave you cannot walk to is not part of the cave.
       *
       * Then the two most distant points in what is left become where you START and
       * where you GET OUT. Not "far apart" by eye: the actual graph diameter, found by
       * flooding twice. So every seed is a real journey, and every seed is solvable,
       * and the suite proves both across forty of them.
       * ============================================================== */
      const [x0, y0, z0] = op.from, [x1, y1, z1] = op.to;
      const lo = [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)];
      const hi = [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)];
      const density = op.density == null ? 0.47 : op.density;
      const passes = op.passes == null ? 5 : op.passes;

      const at3 = (x, y, z) => idx(S, x, y, z);
      const inBox = (x, y, z) => x >= lo[0] && x <= hi[0] && y >= lo[1] && y <= hi[1] && z >= lo[2] && z <= hi[2];

      // 1. static
      for (let y = lo[1]; y <= hi[1]; y++)
        for (let z = lo[2]; z <= hi[2]; z++)
          for (let x = lo[0]; x <= hi[0]; x++) {
            const edge = x === lo[0] || x === hi[0] || y === lo[1] || y === hi[1] || z === lo[2] || z === hi[2];
            setBlock(S, x, y, z, edge || rnd() < density ? 1 : 0);
          }

      // 2. wear it into caverns
      for (let pass = 0; pass < passes; pass++) {
        const next = [];
        for (let y = lo[1] + 1; y < hi[1]; y++)
          for (let z = lo[2] + 1; z < hi[2]; z++)
            for (let x = lo[0] + 1; x < hi[0]; x++) {
              let rock = 0;
              for (let dy = -1; dy <= 1; dy++)
                for (let dz = -1; dz <= 1; dz++)
                  for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dy && !dz) continue;
                    if (isSolid(S, x + dx, y + dy, z + dz)) rock++;
                  }
              // gravity in the rule: the roof stays up, the floor stays down
              const high = (y - lo[1]) / (hi[1] - lo[1]);
              const bias = high > 0.72 ? -2 : (high < 0.16 ? -3 : 0);
              next.push([x, y, z, rock + bias >= 14 ? 1 : 0]);
            }
        for (const c of next) setBlock(S, c[0], c[1], c[2], c[3]);
      }

      /* 2b. WEAR THE EDGES OFF, and do it BEFORE anything is decided.
       * Smoothing fills pockets and dissolves spurs — which means it can seal a throat,
       * bury the arch, or wall the player into a cupboard. Run it after we have chosen
       * where the exit goes and seventeen warrens out of forty are unwinnable, which is
       * exactly what happened. Shape the cave first. Choose the journey second. */
      for (let pass = 0; pass < (op.smooth == null ? 1 : op.smooth); pass++) {
        const flip = [];
        for (let y = lo[1] + 1; y < hi[1]; y++)
          for (let z = lo[2] + 1; z < hi[2]; z++)
            for (let x = lo[0] + 1; x < hi[0]; x++) {
              const here = blockAt(S, x, y, z);
              let rock = 0;
              for (let dy = -1; dy <= 1; dy++)
                for (let dz = -1; dz <= 1; dz++)
                  for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dy && !dz) continue;
                    if (isSolid(S, x + dx, y + dy, z + dz)) rock++;
                  }
              if (here === 0 && rock >= 20) flip.push([x, y, z, 1]);
              else if (here === 1 && rock <= 8) flip.push([x, y, z, 0]);
            }
        for (const f of flip) setBlock(S, f[0], f[1], f[2], f[3]);
      }

      // 3. keep only the biggest connected space. A cave you cannot walk to is not cave.
      const seen = new Uint8Array(S.w * S.h * S.d);
      let best = null;
      for (let y = lo[1]; y <= hi[1]; y++)
        for (let z = lo[2]; z <= hi[2]; z++)
          for (let x = lo[0]; x <= hi[0]; x++) {
            const i0 = at3(x, y, z);
            if (seen[i0] || isSolid(S, x, y, z)) continue;
            const cells = [[x, y, z]];
            seen[i0] = 1;
            for (let h = 0; h < cells.length; h++) {
              const [cx, cy, cz] = cells[h];
              for (let n = 0; n < FACES; n++) {
                const nx = cx + NB[n][0], ny = cy + NB[n][1], nz = cz + NB[n][2];
                if (!inBox(nx, ny, nz) || isSolid(S, nx, ny, nz)) continue;
                const j = at3(nx, ny, nz);
                if (seen[j]) continue;
                seen[j] = 1;
                cells.push([nx, ny, nz]);
              }
            }
            if (!best || cells.length > best.length) best = cells;
          }
      if (!best) return;

      const keep = new Uint8Array(S.w * S.h * S.d);
      for (const c of best) keep[at3(c[0], c[1], c[2])] = 1;
      for (let y = lo[1]; y <= hi[1]; y++)
        for (let z = lo[2]; z <= hi[2]; z++)
          for (let x = lo[0]; x <= hi[0]; x++)
            if (!isSolid(S, x, y, z) && !keep[at3(x, y, z)]) setBlock(S, x, y, z, 1);

      // 4. the two ends of the longest walk in it: where you start, and where you get out
      const farthestFrom = (start) => {
        const dist = new Int32Array(S.w * S.h * S.d).fill(-1);
        const q = [start];
        dist[at3(start[0], start[1], start[2])] = 0;
        let far = start, fd = 0;
        for (let h = 0; h < q.length; h++) {
          const [cx, cy, cz] = q[h];
          const d = dist[at3(cx, cy, cz)];
          if (d > fd) { fd = d; far = [cx, cy, cz]; }
          for (let n = 0; n < FACES; n++) {
            const nx = cx + NB[n][0], ny = cy + NB[n][1], nz = cz + NB[n][2];
            if (!inBox(nx, ny, nz) || isSolid(S, nx, ny, nz)) continue;
            const j = at3(nx, ny, nz);
            if (dist[j] !== -1) continue;
            dist[j] = d + 1;
            q.push([nx, ny, nz]);
          }
        }
        return { at: far, d: fd };
      };
      const a = farthestFrom(best[0]).at;
      const b = farthestFrom(a);

      // stand him on something, and put the arch on something
      const ground = (c) => {
        let y = c[1];
        while (y > lo[1] + 1 && !isSolid(S, c[0], y - 1, c[2])) y--;
        return [c[0], y, c[2]];
      };
      const sp = ground(a), ex = ground(b.at);
      S.player.x = sp[0] + 0.5; S.player.y = sp[1] + 0.5; S.player.z = sp[2] + 0.5;
      S.exit = ex;
      S.warrenWalk = b.d;      // how long the journey actually is, in cells

      /* AND PUT PEOPLE IN IT.
       * A warren with nobody in it is not a warren, it is a hole. Space them along the
       * ACTUAL walk out — a quarter, a half, three quarters of the way — so you meet
       * somebody roughly when you have started to wonder whether you are lost. */
      if (op.folk) {
        const dist = new Int32Array(S.w * S.h * S.d).fill(-1);
        const q = [sp];
        dist[at3(sp[0], sp[1], sp[2])] = 0;
        const byDist = [];
        for (let h = 0; h < q.length; h++) {
          const [cx, cy, cz] = q[h];
          const d = dist[at3(cx, cy, cz)];
          if (isSolid(S, cx, cy - 1, cz)) byDist.push({ at: [cx, cy, cz], d });   // standing on something
          for (let n = 0; n < FACES; n++) {
            const nx = cx + NB[n][0], ny = cy + NB[n][1], nz = cz + NB[n][2];
            if (!inBox(nx, ny, nz) || isSolid(S, nx, ny, nz)) continue;
            const j = at3(nx, ny, nz);
            if (dist[j] !== -1) continue;
            dist[j] = d + 1;
            q.push([nx, ny, nz]);
          }
        }
        const far = b.d;
        S.folkSpots = [];
        for (let k = 1; k <= op.folk; k++) {
          const want = far * (k / (op.folk + 1));
          let best2 = null;
          for (const c of byDist) {
            const err = Math.abs(c.d - want);
            if (!best2 || err < best2.err) best2 = { at: c.at, err, d: c.d };
          }
          if (best2) S.folkSpots.push(best2.at);
        }
      }
      return;
    }

    if (op.op === 'tunnel') {
      // a wandering worm of nothing: a passage nobody surveyed
      const a = op.from, b = op.to;
      const r = op.r == null ? 1.6 : op.r;
      const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * 1.5) + 1;
      let wx = 0, wy = 0, wz = 0;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        wx += (rnd() - 0.5) * (op.wander == null ? 0.5 : op.wander);
        wy += (rnd() - 0.5) * 0.25;
        wz += (rnd() - 0.5) * (op.wander == null ? 0.5 : op.wander);
        const cx = a[0] + (b[0] - a[0]) * t + wx;
        const cy = a[1] + (b[1] - a[1]) * t + wy;
        const cz = a[2] + (b[2] - a[2]) * t + wz;
        const rr = r * (0.8 + rnd() * 0.5);
        for (let y = Math.floor(cy - rr); y <= cy + rr; y++)
          for (let z = Math.floor(cz - rr); z <= cz + rr; z++)
            for (let x = Math.floor(cx - rr); x <= cx + rr; x++) {
              if (!inside(S, x, y, z) || blockAt(S, x, y, z) !== 1) continue;
              if (Math.hypot(x - cx, y - cy, z - cz) <= rr && free(x, y, z)) setBlock(S, x, y, z, 0);
            }
      }
      return;
    }

    if (op.op === 'fill' || op.op === 'room') {
      const [x0, y0, z0] = op.from, [x1, y1, z1] = op.to;
      const lo = [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)];
      const hi = [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)];
      for (let y = lo[1]; y <= hi[1]; y++)
        for (let z = lo[2]; z <= hi[2]; z++)
          for (let x = lo[0]; x <= hi[0]; x++) {
            if (op.op === 'fill') setBlock(S, x, y, z, op.block);
            else {
              // a room is a hollow: air inside, a floor beneath it
              const floorY = lo[1];
              if (y === floorY) setBlock(S, x, y, z, op.floor == null ? 2 : op.floor);
              else setBlock(S, x, y, z, 0);
            }
          }
    }
  }

  function rebuildSurface(S) {
    const N = S.w * S.h * S.d;
    for (let i = 0; i < N; i++) S.surf[i] = 0;
    for (let y = 0; y < S.h; y++)
      for (let z = 0; z < S.d; z++)
        for (let x = 0; x < S.w; x++) {
          if (!isSolid(S, x, y, z)) continue;
          // a surface cell is a solid with at least one face onto air.
          const open =
            !isSolid(S, x + 1, y, z) || !isSolid(S, x - 1, y, z) ||
            !isSolid(S, x, y + 1, z) || !isSolid(S, x, y - 1, z) ||
            !isSolid(S, x, y, z + 1) || !isSolid(S, x, y, z - 1);
          if (open) S.surf[idx(S, x, y, z)] = 1;
        }
    S.dirty = false;
  }

  /* ================================================================
   * THE PULSE
   *
   * A wavefront leaves a point and spreads through the world by Dijkstra.
   * Crossing air costs 1. Crossing rock costs `solidCost` — expensive, but
   * FINITE, which is the entire reason Rocky can hear a machine humming on the
   * far side of a wall. Cost buys two things at once:
   *    amplitude  (how loud the echo comes back)
   *    arrival    (when it comes back — far things arrive late)
   * so the wavefront you watch expand is the same number the puzzle logic asks.
   * ONE FIELD. Everything reads it.
   * ============================================================== */
  /* Sound is SPHERICAL. A wavefront on a 6-neighbour grid is a diamond — the
   * cell straight ahead arrives on time and the cell diagonally ahead arrives
   * 41% late, which the eye reads instantly as a lie. So we cross the 26
   * neighbours, weighted 1 / root-2 / root-3. The wavefront is then a sphere to
   * within a few percent, and the ring app.js draws is telling the truth.
   * The suite checks that (see: THE RING DOES NOT LIE). */
  const NB = (function () {
    const faces = [], rest = [];
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          if (!dx && !dy && !dz) continue;
          const n = dx * dx + dy * dy + dz * dz;
          (n === 1 ? faces : rest).push([dx, dy, dz, Math.sqrt(n)]);
        }
    return faces.concat(rest);   // the SIX faces first — see the rock shortcut in emit()
  })();
  const FACES = 6;

  /* Emit a wavefront from a world position. `srcId` tints the echo (0 = Rocky). */
  /* `note` is WHAT THE SOUND IS MADE OF. A block dropped on the deck bangs in its own
   * voice — a girder rings at 311, xenonite at 659, astrophage at a 55Hz thud you feel
   * in your legs. Rocky's own pulse is a CLICK: broadband, no note, note = 0.
   *
   * Which matters because a TUNED resonator is deaf to everything except one pitch. You
   * cannot shout one of those open. You have to go and fetch the right material. */
  function emit(S, wx, wy, wz, amp0, srcId, range, from, note) {
    if (S.dirty) rebuildSurface(S);
    const son = S.cfg.sonar;
    const reach = range || son.maxDist;
    const x0 = Math.floor(wx), y0 = Math.floor(wy), z0 = Math.floor(wz);
    if (!inside(S, x0, y0, z0)) return 0;

    /* A BUCKET QUEUE, not a heap.
     *
     * Dijkstra with non-negative weights visits cells in non-decreasing order of cost,
     * and our costs are bounded (nothing beyond `reach`) — so we do not need a heap at
     * all. Drop each cell into a bucket by its cost and walk the buckets forward: O(1)
     * to push, O(1) to pop, and the cache likes it far better than sifting a binary
     * heap of forty thousand entries.
     *
     * Bought back the frame that the caves cost. (The warren got rougher, the wavefront
     * got more air to cross, and the pulse went over one frame — which is the sort of
     * thing you only find out because there is a test that measures it.) */
    const stamp = ++S.stamp;
    const maxD = reach;
    const BW = 0.25;                                    // bucket width
    const nB = Math.ceil(maxD / BW) + 2;
    const buckets = S.buckets;
    if (buckets.length < nB) { while (buckets.length < nB) buckets.push([]); }
    for (let bk = 0; bk < nB; bk++) buckets[bk].length = 0;

    const start = idx(S, x0, y0, z0);
    S.seen[start] = stamp;
    S.cost[start] = 0;
    buckets[0].push(start);

    const solidCost = son.solidCost;
    let touched = 0;

    for (let bk = 0; bk < nB; bk++) {
      const bucket = buckets[bk];
      for (let bi = 0; bi < bucket.length; bi++) {
        const i = bucket[bi];
        /* FIRST POP WINS, and that is not a heuristic — it is Dijkstra's guarantee: with
         * non-negative weights, the first time a cell comes out of the queue its cost is
         * final. Mark it done and never look at it again.
         *
         * I first wrote this guard as "recompute which bucket this cell belongs in, and
         * skip it if it does not match" — which is WRONG, because S.cost is a Float32Array
         * and the recomputed bucket can land one off. Cells were then silently discarded
         * FOREVER, the wavefront quietly found longer paths, and a bell that should have
         * reached the vault at 66% reached it at 17%. The suite caught it. Nothing else
         * would have: the game still looked completely fine. */
        if (S.done[i] === stamp) continue;
        S.done[i] = stamp;
        const d = S.cost[i];
        if (d > maxD) continue;

      const x = i % S.w;
      const z = ((i / S.w) | 0) % S.d;
      const y = (i / (S.w * S.d)) | 0;

      const b = S.vox[i];
      const solid = S.solidOf[b];

      /* THE REFLECTION.
       * Sound travelling through AIR strikes the surfaces it touches. It does
       * not have to get INSIDE a wall to bounce off it — record the echo when
       * the wave pops the air cell beside the wall, and charge it only the one
       * step across the gap.
       *
       * (Record it on the solid's own pop instead, as I first did, and every
       * reflection is billed the full cost of penetrating the surface it is
       * bouncing off: the near wall of a room comes back at distance 18 instead
       * of 14, a quarter-second late and a third too quiet. It still LOOKS like
       * sonar. It is just wrong.) */
      if (!solid) {
        /* Only the SIX faces need scanning: a surface cell is DEFINED as a solid
         * with an air cell against one of its faces, so every reflector in the
         * world is reachable by a face step from some air cell. Scanning all 26
         * finds the same walls at the same distances and costs four times as
         * much to do it. */
        for (let n = 0; n < FACES; n++) {
          const sx = x + NB[n][0], sy = y + NB[n][1], sz = z + NB[n][2];
          if (!inside(S, sx, sy, sz)) continue;
          const j = idx(S, sx, sy, sz);
          if (!S.surf[j]) continue;                  // surf implies solid
          const dd = d + NB[n][3];
          if (dd > reach) continue;
          const k = Math.max(0, 1 - dd / reach);
          const a = Math.pow(k, son.falloff) * (1 - S.absorbOf[S.vox[j]]) * amp0;
          if (a <= son.minHeat) continue;

          /* The loudest echo claiming this cell wins — and an echo still IN
           * FLIGHT counts at its full loudness, not at zero. Compare against
           * heat alone and every faint vent tick steals the wall out from under
           * the loud pulse still racing toward it, and resets its arrival clock.
           * The room stays dark and you cannot think why.
           * (Compare against the STEADY value, not the displayed one: a cell
           * mid-strike is briefly inflated, and that is a lighting effect, not a
           * claim about how loud it is.) */
          /* A RESONATOR IS A LISTENER.
           * It opens a door when enough sound REACHES it — and "enough sound" is
           * the very same number the screen is about to draw on that block. The
           * rule and the picture are one object. Route a noise to it any way you
           * can find: walk over and shout, bridge the gap with xenonite (which
           * conducts), clear the grit (which does not), drop something heavy,
           * open a vent and let the machine do it for you. All legal. */
          /* A LISTENER HEARS WHEN THE SOUND GETS THERE.
           * Not when the wavefront is COMPUTED — the whole flood is worked out in
           * one tick, so settling the ears inside it makes sound teleport: a chain
           * of bells strung across ninety cells of warren fires in a twentieth of
           * a second, all at once, and the best thing about the mechanic (hearing
           * the chain RUN, bell after bell, into the dark) never happens.
           * Queue it at its arrival time — one way, because an ear is a listener,
           * not an echo coming home to Rocky. */
          const ear = S.earAt[j];
          if (ear !== undefined && ear !== from) {
            S.pending.push({ id: ear, amp: a, at: S.t + dd / son.speed, note: note || 0 });
          }

          const age = S.t - S.arrive[j];
          const cur = S.amp[j] <= 0 ? 0
            : (age < 0 ? S.amp[j] : S.amp[j] * Math.exp(-age / son.tau));
          if (a > cur) {
            if (S.amp[j] <= 0) { S.active[S.nActive++] = j; }
            S.amp[j] = a;

            /* THE ROUND TRIP.
             * A wall does not appear when the sound TOUCHES it. It appears when
             * the echo gets BACK TO ROCKY, because Rocky is the one listening —
             * he is not a camera hanging in the room watching sound arrive at
             * other objects. So the time is out AND back: `dd` to the surface,
             * then the flight home to his ears.
             * (For his own pulse that is simply 2*dd. For a vent across the
             * warren it is the vent's throw plus the walk home, which is why a
             * far machine's echo lands on you late and from nowhere.) */
            const home = Math.hypot(sx + 0.5 - S.player.x, sy + 0.5 - S.player.y, sz + 0.5 - S.player.z);
            S.arrive[j] = S.t + (dd + home) / son.speed;
            S.src[j] = srcId;
            touched++;
          }
        }
      }

      /* In AIR we cross all 26 neighbours, because that is where the wavefront
       * has to be a true sphere — it is the shape the player watches expand.
       * INSIDE rock we cross only the 6 faces: the through-wall ghost is a dim
       * smear at the best of times, its exact shape is unobservable, and the
       * rock is 85% of the world. That one line is the difference between a
       * 31ms pulse and a 6ms one. */
      const nbn = solid ? FACES : NB.length;
      for (let n = 0; n < nbn; n++) {
        const nx = x + NB[n][0], ny = y + NB[n][1], nz = z + NB[n][2];
        if (!inside(S, nx, ny, nz)) continue;
        const j = idx(S, nx, ny, nz);
        const enter = S.costOf[S.vox[j]] * NB[n][3];   // <- the material decides, not "is it solid"
        const nd = d + enter;
        if (nd > maxD) continue;
        if (S.seen[j] !== stamp || nd < S.cost[j]) {
          S.seen[j] = stamp;
          S.cost[j] = nd;
          const nb = Math.floor(nd / BW);
          if (nb < nB) buckets[nb].push(j);
        }
      }
      }
    }
    S.emits++;
    return touched;
  }

  /* Which listeners has the sound actually REACHED by now? Sounds that landed
   * this tick are settled; sounds still in flight are left alone. */
  function settleEars(S) {
    if (!S.pending.length) return;
    const heard = {};
    const still = [];
    for (const p of S.pending) {
      if (p.at > S.t) { still.push(p); continue; }
      /* A TUNED EAR IS DEAF TO EVERYTHING BUT ONE NOTE.
       * Not quieter — DEAF. It does not matter how loud you shout at it, because your
       * voice is a click and a click is not a pitch. Bring it the material it wants and
       * drop that on the floor beside it. */
      const e = S.ears.find((x) => x.id === p.id);
      if (e && e.tuned) {
        if (!p.note) continue;                                  // a click is not a note
        if (Math.abs(p.note - e.tuned) > e.tuned * 0.02) continue;   // and it is not THAT note
      }
      /* A QUESTION ONLY TAKES AN ANSWER WHILE IT IS WAITING FOR ONE.
       * A statement listens forever; a question rings, then holds open a moment, expecting.
       * Answer inside that window and it counts; answer when nothing was asked — a reply to
       * a statement — and it falls on a closed socket. That window is the whole difference
       * between a question and a statement. (openUntil starts at -1, so before she has ever
       * asked, an asking-socket takes nothing.) */
      if (e && e.asks && S.t > e.openUntil) continue;
      if (p.amp > (heard[p.id] || 0)) heard[p.id] = p.amp;
    }
    S.pending = still;

    for (const e of S.ears) {
      const got = heard[e.id];
      if (got === undefined) continue;
      e.loudest = Math.max(e.loudest, got);
      e.lit = got;
      if (got < e.needs) continue;

      /* A BELL SHOUTS BACK.
       * It answers from where it stands, so a chain of them carries a sound clean
       * across a warren far too big for one voice — and when a chain dies, the
       * bell it died at is the one that tells you where the blockage is.
       *
       * The ring is QUEUED, never emitted from inside the wave that triggered it:
       * emit() -> settleEars() -> emit() is an infinite recursion, and a pair of
       * bells within earshot of each other would ring the game to death. It goes
       * on a queue, and each bell has a cooldown, so the chain runs forward and
       * cannot ring itself back up its own path. */
      if (e.rings) {
        if (e.cd > 0) continue;
        e.cd = e.rearm == null ? 2.5 : e.rearm;
        e.rang++;
        S.ringQ.push(e);
        continue;
      }

      if (!e.open) {
        e.open = true;
        cue(S, 'ear');
        tryOpen(S, e.opens);
      }
    }
  }

  /* ================================================================
   * A QUESTION IS A STATEMENT THAT WAITS.
   *
   * Every ear until now has been a STATEMENT: it listens, always, and opens if the right
   * sound ever reaches it. Grace's sockets ASK. On her own timing a socket rings out — once,
   * in her question-note — and then holds itself OPEN for a moment, expecting a reply. And
   * she takes turns (`after`): she will not ask the next thing until you have answered the
   * last. A conversation, not a checklist. The answer itself is settled by the ordinary
   * tuned-ear path; this only decides WHEN she is listening for one.
   * ================================================================ */
  function stepQuestions(S, dt) {
    if (S.flags.done) return;
    for (const e of S.ears) {
      if (!e.asks || e.open) continue;
      if (e.after) {                                     // turn-taking: her earlier question first
        const prev = S.ears.find((x) => x.id === e.after);
        if (!prev || !prev.open) continue;
      }
      e.askCd -= dt;
      if (e.askCd <= 0) {
        e.askCd += e.asks.period == null ? 5 : e.asks.period;
        e.openUntil = S.t + (e.asks.window == null ? 4 : e.asks.window);
        e.asked++;
        emit(S, e.at[0] + 0.5, e.at[1] + 0.5, e.at[2] + 0.5,
          e.asks.amp == null ? 0.9 : e.asks.amp, 90,
          e.asks.range == null ? 24 : e.asks.range, e.id, e.asks.note);
        cue(S, 'ask');
      }
    }
  }

  function stepBells(S, dt) {
    for (const e of S.ears) if (e.cd > 0) e.cd -= dt;
    settleEars(S);
    if (!S.ringQ.length) return;
    const q = S.ringQ;
    S.ringQ = [];
    for (const e of q) {
      cue(S, 'bell');
      // `e.id` last: a bell does not ring itself up by hearing its own voice.
      emit(S, e.at[0] + 0.5, e.at[1] + 0.5, e.at[2] + 0.5, e.rings.amp, 0, e.rings.range, e.id, S.cfg.blocks[11].note);
    }
  }

  /* CONSENSUS.
   * Eridians have no government and no war. To act, the engineers must AGREE —
   * so a door opens only when EVERY resonator wired to it has heard you, not
   * merely the first. One ear is a lock. Three ears is an argument you have to
   * make three times, from three places, and that is the story of Act I.
   * (No new data: the ears already say which door they answer to.) */
  function tryOpen(S, doorId) {
    const panel = S.ears.filter((e) => e.opens === doorId);
    if (panel.length && !panel.every((e) => e.open)) return false;
    return openDoor(S, doorId);
  }

  function openDoor(S, doorId) {
    const d = S.doors.find((x) => x.id === doorId);
    if (!d || d.open) return false;
    d.open = true;
    for (const c of d.cells) setBlock(S, c[0], c[1], c[2], 0);
    rebuildSurface(S);
    cue(S, 'door');
    if (S.doors.every((x) => x.open)) { S.flags.all_doors = true; cue(S, 'chapter'); }
    return true;
  }

  /* ---------- carrying ----------
   * Rocky has five arms and a species-wide contempt for the idea that a wall has
   * to stay where somebody left it. He can lift the blocks config says he can
   * lift: xenonite, which conducts sound, and grit, which kills it. That is the
   * entire inventory, and it is enough to solve everything. */
  function facing(S, reach) {
    const p = S.player;
    const R = reach == null ? 2.4 : reach;
    const dx = -Math.sin(p.yaw), dz = -Math.cos(p.yaw);
    for (let t = 0.6; t <= R; t += 0.2) {
      const x = Math.floor(p.x + dx * t), y = Math.floor(p.y), z = Math.floor(p.z + dz * t);
      if (isSolid(S, x, y, z)) return [x, y, z];
    }
    // nothing at eye level? try the block he is about to trip over
    for (let t = 0.6; t <= R; t += 0.2) {
      const x = Math.floor(p.x + dx * t), y = Math.floor(p.y) - 1, z = Math.floor(p.z + dz * t);
      if (isSolid(S, x, y, z) && !isSolid(S, x, y + 1, z)) return [x, y + 1, z];
    }
    return null;
  }

  /* A BELL ROCKY BUILT IS A BELL LIKE ANY OTHER.
   * When he sets one down it becomes a real listener, in the same list, obeying
   * the same rules, wired into the same field — and when he picks it up again it
   * stops being one. There is no such thing as a "player bell" anywhere in this
   * engine, because the moment there were two kinds of bell they would start to
   * disagree, and the one on screen would not be the one in the rules. */
  function addBell(S, x, y, z) {
    const spec = S.cfg.bell;
    const e = {
      id: 'built' + (++S.builtN), at: [x, y, z], name: 'YOUR BELL',
      needs: spec.needs, rings: spec.rings, rearm: spec.rearm,
      open: false, lit: 0, loudest: 0, cd: 0, rang: 0, built: true
    };
    S.ears.push(e);
    S.earAt[idx(S, x, y, z)] = e.id;
    return e;
  }
  function removeBell(S, x, y, z) {
    const i = idx(S, x, y, z);
    const id = S.earAt[i];
    if (id === undefined) return;
    delete S.earAt[i];
    S.ears = S.ears.filter((e) => e.id !== id);
    S.pending = S.pending.filter((p) => p.id !== id);
  }

  /* ---------- THE VEST ----------
   * WHAT IS IN HIS HANDS IS THE SELECTED POCKET. There is no second field holding
   * "the block he is carrying": keep it as two facts about one thing and they WILL
   * drift, and then the block on the screen stops being the block in the rules.
   *
   * It is a FUNCTION, not a property. An accessor anywhere on the state object —
   * even declared in the literal, even one the hot loop never touches — puts V8
   * off its fast path for the whole object, and every property read in the
   * Dijkstra loop goes slow with it. Measured, on the same warren:
   *
   *      no accessor .................  9.5 ms a pulse
   *      get held() in the literal ... 32.4 ms a pulse
   *
   * Three dropped frames every time he opens his mouth, for a getter. The speed
   * test caught it, which is the entire reason the speed test exists. */
  const held = (S) => S.belt[S.slot] || 0;
  const setHeld = (S, b) => { S.belt[S.slot] = b || 0; };

  /* Which pocket does a thing go in? The one he has selected, if it is empty;
   * otherwise the first free one — and it becomes the selected one, because that
   * is what a hand does. */
  function freeSlot(S) {
    if (!S.belt[S.slot]) return S.slot;
    for (let i = 0; i < S.belt.length; i++) if (!S.belt[i]) return i;
    return -1;
  }
  function selectSlot(S, i) {
    if (i < 0 || i >= S.belt.length) return false;
    S.slot = i;
    return true;
  }

  function takeBlock(S) {
    const slot = freeSlot(S);
    if (slot < 0) return { ok: false, why: 'every pocket is full' };
    const p = S.player;
    const dx = -Math.sin(p.yaw), dz = -Math.cos(p.yaw);
    for (let t = 0.6; t <= 2.4; t += 0.2) {
      for (const dy of [0, -1, 1]) {
        const x = Math.floor(p.x + dx * t), y = Math.floor(p.y) + dy, z = Math.floor(p.z + dz * t);
        const b = blockAt(S, x, y, z);
        if (!S.carryOf[b]) continue;
        // a bell the LEVEL placed is part of the level. only your own come up again.
        if (b === 11) {
          const id = S.earAt[idx(S, x, y, z)];
          const e = S.ears.find((q) => q.id === id);
          if (!e || !e.built) continue;
          removeBell(S, x, y, z);
        }
        setBlock(S, x, y, z, 0);
        repressurize(S);            // pull a block out of a hull and the air goes with it
        rebuildSurface(S);
        S.slot = slot;
        S.belt[slot] = b;
        cue(S, 'take');
        return { ok: true, block: b, at: [x, y, z], slot: slot };
      }
    }
    return { ok: false, why: 'nothing to lift' };
  }

  function placeBlock(S) {
    if (!held(S)) return { ok: false, why: 'that pocket is empty' };
    const p = S.player;
    const dx = -Math.sin(p.yaw), dz = -Math.cos(p.yaw);
    for (let t = 0.8; t <= 2.6; t += 0.2) {
      for (const dy of [0, -1, 1]) {
        const x = Math.floor(p.x + dx * t), y = Math.floor(p.y) + dy, z = Math.floor(p.z + dz * t);
        if (!inside(S, x, y, z) || isSolid(S, x, y, z)) continue;
        // never brick yourself into the wall
        const pb = [Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)];
        if (x === pb[0] && z === pb[2] && (y === pb[1] || y === pb[1] - 1)) continue;
        const b = held(S);
        setBlock(S, x, y, z, b);
        repressurize(S);            // ...and seal a breach and it comes straight back
        rebuildSurface(S);
        setHeld(S, 0);
        if (b === 11) addBell(S, x, y, z);      // set a bell down and it starts listening
        cue(S, 'place');
        // it lands with a bang, and the bang is a sound like any other
        // the block bangs on its own, IN ITS OWN VOICE — and the astrophage in his vest
        // cannot muffle a noise he did not make with his mouth
        emit(S, x + 0.5, y + 0.5, z + 0.5, S.cfg.sonar.placeAmp, 0, S.cfg.sonar.placeRange, null, S.cfg.blocks[b].note);
        return { ok: true, block: b, at: [x, y, z] };
      }
    }
    return { ok: false, why: 'no room' };
  }

  /* What did the last wavefront cost to get here?
   * S.cost is a scratch array: a cell not reached by the LAST emission still
   * holds whatever some earlier one left there, and an untouched cell holds a
   * flat 0 — which reads as "no distance at all", the most dangerous wrong
   * answer available. Ask through this door, and unreached means INFINITY. */
  function costAt(S, x, y, z) {
    if (!inside(S, x, y, z)) return Infinity;
    if (S.stamp === 0) return Infinity;      // nothing has ever made a sound here
    const i = idx(S, x | 0, y | 0, z | 0);
    return S.seen[i] === S.stamp ? S.cost[i] : Infinity;
  }

  /* THE CAMERA IS A WORLD QUESTION, SO THE WORLD ANSWERS IT.
   * How far back can the camera sit behind Rocky before rock gets between them?
   * app.js must not answer this by feeling around the voxel grid itself — it
   * would be a second opinion about where the walls are. March the ray here. */
  function cameraFit(S, ox, oy, oz, dx, dy, dz, want, pad) {
    const p = pad == null ? 0.3 : pad;
    const stepN = Math.ceil(want / 0.12);
    for (let i = 1; i <= stepN; i++) {
      const t = (i / stepN) * want;
      if (isSolid(S, Math.floor(ox + dx * t), Math.floor(oy + dy * t), Math.floor(oz + dz * t))) {
        return Math.max(0.6, (i - 1) / stepN * want - p);
      }
    }
    return want;
  }

  /* HOW LOUD IS HE, RIGHT NOW?
   * Astrophage eats everything that reaches it, and a pocketful of the stuff eats
   * his own voice on the way out. Every sample in the vest muffles him. Carry three
   * and he is down to a sixth of himself — whispering in the dark, holding the thing
   * that is killing his star, and needing another way to be heard.
   *
   * ONE DOOR: everything he emits — his pulse, his feet, his landings — asks this,
   * so there is no way to be quietly loud. */
  function voice(S, amp) {
    let n = 0;
    for (const b of S.belt) if (b === 14) n++;
    return amp * Math.pow(S.cfg.astro.muffle, n);
  }

  /* Rocky pulses. Costs a cooldown, so you cannot simply hold the world lit. */
  /* PLOTTING A COURSE. The Blip does not answer — you cannot open it like a door or ring it
   * like a bell. All you can do is catch WHERE it is, again and again, and join the dots
   * into a heading. A fix is logged when you pulse with the contact inside range AND it is
   * far enough from every fix you already have — so standing still and pulsing at the same
   * passing point gets you nowhere; you have to CHASE it down the dark and catch it at a
   * spread of places. That is tracking, and it is the whole chapter. */
  function recordFix(S) {
    const t = S.chapter.track;
    if (!t) return;
    const src = S.sources.find((s) => s.kind === t.kind);
    if (!src) return;
    const p = S.player, a = src.at;
    const d = Math.hypot(p.x - (a[0] + 0.5), p.y - (a[1] + 0.5), p.z - (a[2] + 0.5));
    if (d > (t.range || 16)) return;                    // too far out to get a clean fix
    const sep = t.minSep || 8;
    for (const f of S.fixes) if (Math.hypot(f[0] - a[0], f[1] - a[1], f[2] - a[2]) < sep) return;  // that stretch of its course is already plotted
    S.fixes.push([a[0], a[1], a[2]]);
    cue(S, 'fix');
    if (S.fixes.length === t.need) cue(S, 'plotted');   // enough points: the course is a line now
  }

  function pulse(S) {
    if (S.pulseCd > 0) return { ok: false, why: 'cooling' };
    const p = S.player;
    /* A chapter may make you WAIT longer between shouts. Alone does: on a ship with nobody
     * left to make a sound, your own pulse is the only event there is, and the seconds you
     * spend waiting for the next one — in a dark you cannot fill any other way — are the
     * loudest thing in the game. The cooldown IS the grief. */
    S.pulseCd = S.chapter.cooldown || S.cfg.sonar.cooldown;
    const n = emit(S, p.x, p.y, p.z, voice(S, S.cfg.sonar.pulseAmp), 0);
    S.pulses++;
    cue(S, 'pulse');
    if (S.chapter.track) recordFix(S);   // a shout is also a sensor sweep, if there is a blip to catch
    return { ok: true, cells: n };
  }

  /* ---------- the decaying memory ---------- */
  function updateHeat(S, dt) {
    const son = S.cfg.sonar;
    const persist = !!S.opts.persist;
    let w = 0;
    for (let k = 0; k < S.nActive; k++) {
      const i = S.active[k];
      if (S.amp[i] <= 0) continue;
      if (S.t < S.arrive[i]) { // the wavefront has not reached it yet
        S.heat[i] = 0;
        S.active[w++] = i;
        continue;
      }
      const age = S.t - S.arrive[i];
      /* THE STRIKE: brightest at the instant of landing, then it settles. This
       * is why you SEE the wave cross a wall rather than the wall simply
       * switching on. It is a property of the echo, so it lives here, in the
       * engine, where the suite can hold it to account. */
      const steady = persist ? S.amp[i] : S.amp[i] * Math.exp(-age / son.tau);
      const v = steady * (1 + son.flash * Math.exp(-age / son.flashTau));
      if (steady < son.minHeat) {
        S.amp[i] = 0; S.heat[i] = 0; S.arrive[i] = 0;
        continue; // dropped from the active list
      }
      S.heat[i] = v;
      S.active[w++] = i;
    }
    S.nActive = w;
  }

  /* A SOURCE THAT MOVES. Everything that has ever made a sound in this game has stood
   * still — a vent in a wall, a person at a bench, a door. A moving source is the first
   * thing in the whole game that is NOT WHERE YOU LEFT IT: you pulse, you hear it over
   * there; you pulse again a moment later and it has crossed the dark. It travels a path at
   * a steady speed and ping-pongs along it forever, and its cell is recomputed from a
   * single scalar (distance travelled), so it is perfectly deterministic — no clock, no
   * random, the same at frame ten thousand as at frame one. This is what arrives at Tau
   * Ceti, and it is the whole of Act IV. */
  function moveSource(s, dt) {
    const path = s.path;
    if (!path || path.length < 2) return;
    const segs = [];
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const L = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1], path[i + 1][2] - path[i][2]);
      segs.push(L); total += L;
    }
    if (total <= 0) return;
    s.travel += s.speed * dt;
    const period = 2 * total;
    let ph = s.travel % period; if (ph < 0) ph += period;
    const d = ph <= total ? ph : (period - ph);       // ping-pong: out along the path, then back
    let acc = 0, pos = path[0];
    for (let i = 0; i < segs.length; i++) {
      if (d <= acc + segs[i] || i === segs.length - 1) {
        const t = segs[i] > 0 ? (d - acc) / segs[i] : 0;
        const a = path[i], b = path[i + 1];
        pos = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        break;
      }
      acc += segs[i];
    }
    s.at = [Math.floor(pos[0]), Math.floor(pos[1]), Math.floor(pos[2])];
  }

  /* LIFE SPREADS. The one thing in this game that GROWS.
   *
   * Taumoeba (17) is the living answer: it eats astrophage and it sings. Given a chapter
   * `life` field it advances one generation every `period` seconds — a scan of a bounded
   * region, double-buffered (collect the claims, then apply them), so a cell that turns
   * green this tick does not itself spread until the next. Deterministic to the frame: no
   * clock, no dice, the same at generation ten thousand as at one. It claims a face-neighbour
   * if that neighbour is the thing it `eats` (astrophage — it multiplies INTO the murder), or,
   * in the one chapter where it betrays you, anything in `through` (it leaks through xenonite,
   * the material the whole game trusted). Region-bounded so it never costs the pulse its frame.
   */
  function stepLife(S, dt) {
    const L = S.chapter.life;
    if (!L) return;
    S.lifeCd -= dt;
    if (S.lifeCd > 0) return;
    S.lifeCd += (L.period == null ? 0.5 : L.period);
    const lo = L.region[0], hi = L.region[1];
    const grow = [];
    for (let y = lo[1]; y <= hi[1]; y++)
      for (let z = lo[2]; z <= hi[2]; z++)
        for (let x = lo[0]; x <= hi[0]; x++) {
          if (blockAt(S, x, y, z) !== 17) continue;          // only the living spread
          for (let n = 0; n < FACES; n++) {
            const nx = x + NB[n][0], ny = y + NB[n][1], nz = z + NB[n][2];
            if (!inside(S, nx, ny, nz)) continue;
            const nb = blockAt(S, nx, ny, nz);
            if (nb === L.eats) grow.push(nx, ny, nz);                        // eats the red, multiplies
            else if (L.through && L.through.indexOf(nb) >= 0) grow.push(nx, ny, nz);   // leaks through
          }
        }
    for (let i = 0; i < grow.length; i += 3) setBlock(S, grow[i], grow[i + 1], grow[i + 2], 17);
    if (grow.length) { S.dirty = true; cue(S, 'life'); }
  }

  /* ---------- ambient sources: the warren breathes ---------- */
  function stepSources(S, dt) {
    /* ONCE YOU ARE THROUGH, THE ROOM GOES QUIET. A chapter you have finished stops making
     * sound — the machines, the beacon, everybody. In most chapters you never notice,
     * because the next room loads a breath later. In LAUNCH it is the whole point: the
     * drive was lighting the entire ship, and the instant you strap into the couch it
     * cuts, nothing relights the chambers, and they fall dark on their own. That black is
     * the forty-two years of quiet, arriving on cue, with no darkness faked in the
     * renderer — the ship simply stops making the sound. */
    if (S.flags.done) return;
    for (let i = 0; i < S.sources.length; i++) {
      const s = S.sources[i];
      if (s.path) moveSource(s, dt);   // the contact crosses the dark whether or not it is speaking
      s.cd -= dt;
      if (s.cd <= 0) {
        const k = S.cfg.sourceKinds[s.kind];
        s.cd += k.period;
        emit(S, s.at[0] + 0.5, s.at[1] + 0.5, s.at[2] + 0.5, k.amp, i + 1, k.range);
        cue(S, 'source:' + s.kind);
      }
    }
  }

  /* ---------- Rocky's body ----------
   * Five legs. Twice Earth's gravity. He jumps badly and climbs perfectly.
   */
  function collides(S, x, y, z) {
    const ph = S.cfg.physics;
    const hx = ph.halfWidth, hy = ph.halfHeight;
    const x0 = Math.floor(x - hx), x1 = Math.floor(x + hx);
    const y0 = Math.floor(y - hy), y1 = Math.floor(y + hy);
    const z0 = Math.floor(z - hx), z1 = Math.floor(z + hx);
    for (let yy = y0; yy <= y1; yy++)
      for (let zz = z0; zz <= z1; zz++)
        for (let xx = x0; xx <= x1; xx++)
          if (isSolid(S, xx, yy, zz)) return true;
    return false;
  }

  function moveAxis(S, ax, amt) {
    const p = S.player;
    if (amt === 0) return false;
    const steps = Math.max(1, Math.ceil(Math.abs(amt) / 0.2));
    const inc = amt / steps;
    let hit = false;
    for (let i = 0; i < steps; i++) {
      const old = p[ax];
      p[ax] = old + inc;
      if (collides(S, p.x, p.y, p.z)) { p[ax] = old; hit = true; break; }
    }
    return hit;
  }

  /* Is there a wall within reach of one of his legs? This asks the world, not
   * the last frame's collision — an Eridian holding still on a cliff face is
   * still holding on. */
  /* WHICH WALL, AND WHICH WAY IS IT FACING?
   * Not just "is there one" — an Eridian on a cliff face has his feet ON the cliff,
   * and to draw him that way the renderer has to know which way the rock is. So the
   * engine reports the NORMAL: the direction from the wall out toward him. That is a
   * fact about the world, so it comes from here.
   */
  const WALLS = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
  function nearWall(S) {
    const p = S.player, hw = S.cfg.physics.halfWidth, e = 0.07;
    let nx = 0, nz = 0, found = false;
    for (const [dx, , dz] of WALLS) {
      if (!collides(S, p.x + dx * (hw + e), p.y, p.z + dz * (hw + e))) continue;
      nx -= dx; nz -= dz;                 // the normal points AWAY from the stone
      found = true;
    }
    if (!found) { p.wallN = null; return false; }
    const len = Math.hypot(nx, nz);
    p.wallN = len > 0.01 ? [nx / len, 0, nz / len] : null;   // wedged in a corner: no one normal
    return true;
  }

  function stepPlayer(S, dt, input) {
    const ph = S.cfg.physics;
    const p = S.player;
    const yaw = input.yaw != null ? input.yaw : p.yaw;
    p.yaw = yaw;

    // desired horizontal move, in the camera's frame
    const f = input.fwd || 0, r = input.right || 0;
    const len = Math.hypot(f, r) || 1;
    const nf = f / Math.max(1, len), nr = r / Math.max(1, len);
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const wantX = (nf * -sin + nr * cos) * ph.moveSpeed;
    const wantZ = (nf * -cos - nr * sin) * ph.moveSpeed;

    const a = ph.accel * dt;
    p.vx += Math.max(-a, Math.min(a, wantX - p.vx));
    p.vz += Math.max(-a, Math.min(a, wantZ - p.vz));
    if (!f && !r) {
      const fr = ph.friction * dt;
      const sp = Math.hypot(p.vx, p.vz);
      if (sp > 0) {
        const k = Math.max(0, sp - fr) / sp;
        p.vx *= k; p.vz *= k;
      }
    }

    const hitX = moveAxis(S, 'x', p.vx * dt);
    const hitZ = moveAxis(S, 'z', p.vz * dt);
    if (hitX) p.vx = 0;
    if (hitZ) p.vz = 0;

    /* CLIMBING.
     * There are no ladders on Erid because nobody ever needed one. Five legs and
     * a claw on each: press into a wall and Rocky simply goes up it; let go of
     * the stick and he HOLDS — he does not fall off a cliff for want of an input.
     * To come down, hold the descend key and walk down it like a stair. */
    const pressing = (f !== 0 || r !== 0);
    const blocked = hitX || hitZ;
    const wall = nearWall(S);
    p.onWall = !!wall;

    if (wall && input.down) {
      p.vy = -ph.climbSpeed;                 // walking down the wall, deliberately
      p.climbing = true;
    } else if (wall && pressing && blocked) {
      p.vy = ph.climbSpeed;                  // pushing into stone: go up it
      p.climbing = true;
    } else if (wall && !pressing) {
      p.vy = 0;                              // five legs. he just holds on.
      p.climbing = false;
    } else {
      p.climbing = false;
      p.vy -= ph.gravity * dt;
      if (p.vy < -ph.terminal) p.vy = -ph.terminal;
    }

    // he can push off a wall, too. badly, like everything else he does in the air.
    if (input.jump && (p.onGround || wall)) {
      p.vy = ph.jump;
      p.onGround = false;
      cue(S, 'jump');
    }

    const son = S.cfg.sonar;
    const wasGround = p.onGround;
    const hitY = moveAxis(S, 'y', p.vy * dt);
    if (hitY) {
      if (p.vy < 0 && !wasGround && p.vy < -8) {
        cue(S, 'land');
        emit(S, p.x, p.y, p.z, voice(S, son.landAmp), 0, son.landRange);  // a landing is a LOUD footfall
      }
      p.vy = 0;
    }

    /* IS HE ON THE GROUND? ASK THE GROUND.
     * This used to be a flag: set when he landed, cleared when he stepped off a wall.
     * Which meant that a creature who walked to a wall and CLIMBED it was still, as
     * far as the engine was concerned, standing on the floor — thirty feet below him.
     * (The renderer believed it, and refused to lay him onto the wall.)
     * A fact you can check is not a flag you should remember. */
    p.onGround = collides(S, p.x, p.y - 0.04, p.z);

    /* FIVE LEGS ON STONE ARE FIVE SMALL SOUNDS.
     * Every stride, Rocky's own feet pulse the floor beneath him. He cannot help
     * it and he would not want to: it means he always knows the ground he is
     * standing on. Walk and the floor answers. Stand still in a dead corridor
     * and it does not, and you are as blind as he ever gets. */
    const moved = Math.hypot(p.vx, p.vz) * dt + (p.climbing ? Math.abs(p.vy) * dt : 0);
    p.dist += moved;
    p.strideAcc += moved;
    if (p.strideAcc >= son.stride) {
      p.strideAcc = 0;
      emit(S, p.x, p.y, p.z, voice(S, son.footAmp), 0, son.footRange);
      cue(S, 'step');
    }
  }

  /* ---------- THE FORGE ----------
   * He carries ONE block. Five arms and no pockets. So he does not carry a recipe
   * around with him — he FEEDS the forge, one trip at a time, and the forge
   * remembers. When the hopper holds what a recipe wants, it makes the thing and
   * puts it in his arms.
   */
  function nearestForge(S, radius) {
    const p = S.player;
    const R = radius == null ? 2.6 : radius;
    let best = null, bd = R * R;
    for (const f of S.forges) {
      const dx = f.at[0] + 0.5 - p.x, dy = f.at[1] + 0.5 - p.y, dz = f.at[2] + 0.5 - p.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bd) { bd = d2; best = f; }
    }
    return best;
  }

  /* What could this hopper make, right now? The renderer asks this to show it —
   * it does not work it out for itself, or the forge on screen would start to
   * disagree with the forge in the rules. */
  function canMake(S, f) {
    for (const r of S.cfg.recipes) {
      if (r.needs.every((n) => (f.hopper[n.block] || 0) >= n.n)) return r;
    }
    return null;
  }

  function feedForge(S) {
    const f = nearestForge(S);
    if (!f) return { ok: false, why: 'no forge in reach' };
    const has = held(S);
    if (!has) return { ok: false, why: 'that pocket is empty' };

    f.hopper[has] = (f.hopper[has] || 0) + 1;
    const fed = has;
    setHeld(S, 0);
    S.fed++;
    cue(S, 'feed');

    const r = canMake(S, f);
    if (!r) return { ok: true, fed: fed, made: null };

    for (const n of r.needs) f.hopper[n.block] -= n.n;
    // what it makes goes into a free pocket — his hands are full of the forge
    const slot = freeSlot(S);
    if (slot >= 0) S.slot = slot;
    setHeld(S, r.gives);
    f.made.push(r.id);
    /* A RECIPE CAN FAIL ON PURPOSE. The breeding forge hands you back either a live strain
     * or a CORPSE — a dead strain whose note tells you which sky killed it. A corpse is not
     * a win (no S.made++, its own cue), but it is not nothing: it is the instrument talking,
     * and the failures are what teach you. */
    if (r.fail) {
      cue(S, 'craft:fail');
      return { ok: true, fed: fed, made: r.id, gives: r.gives, fail: true };
    }
    S.made++;
    cue(S, 'craft');
    return { ok: true, fed: fed, made: r.id, gives: r.gives, live: !!r.live };
  }

  /* ================================================================
   * THE WALKTHROUGH
   *
   * PLAYTEST: "I find myself just going in and out of rooms, not sure what I'm
   * supposed to do."  Which is the worst thing a player can say, and it was fair.
   *
   * So a chapter can carry a list of STEPS, and the ENGINE decides when a step is
   * done — not a script, not a timer, not a trigger volume somebody remembered to
   * put in the right place. Each step names a thing that must become TRUE about the
   * world, and the engine checks whether it is true. That means the walkthrough is
   * testable: the suite plays it and finishes it, so a step can never quietly
   * become impossible.
   * ============================================================== */
  function stepNow(S) {
    const t = S.chapter.walk;
    if (!t || S.stepI >= t.length) return null;
    return t[S.stepI];
  }

  function stepDone(S, w) {
    const d = w.done;
    const p = S.player;
    if (d.pulse) return S.pulses >= d.pulse;
    if (d.move) return p.dist >= d.move;
    if (d.climbTo) return p.y >= d.climbTo;
    if (d.reach) return Math.hypot(p.x - d.reach[0], p.y - d.reach[1], p.z - d.reach[2]) <= (d.within || 2.5);
    if (d.lift) return S.belt.indexOf(d.lift) >= 0;
    if (d.gone) return !isSolid(S, d.gone[0], d.gone[1], d.gone[2]);
    if (d.placed) return blockAt(S, d.placed[0], d.placed[1], d.placed[2]) === d.block;
    if (d.gauges) return S.readCount >= d.gauges;
    if (d.forged) return S.forges.some((f) => f.made.indexOf(d.forged) >= 0);
    if (d.ear) { const e = S.ears.find((x) => x.id === d.ear); return !!(e && e.open); }
    if (d.rang) return S.ears.some((e) => e.built && e.rang > 0);
    if (d.exit) return !!S.flags.done;
    return false;
  }

  function stepWalk(S) {
    const w = stepNow(S);
    if (!w) return;
    if (!stepDone(S, w)) return;
    S.stepI++;
    S.stepDoneN++;
    cue(S, 'step:done');
    if (!stepNow(S)) { S.flags.walkthrough = true; cue(S, 'chapter'); }
  }

  /* ================================================================
   * PRESSURE
   *
   * PRESSURE IS NOT A FLAG. It is a fact about what is connected to what.
   *
   * If a space can reach OUT — to the hole in the hull, to the sky, to the vacuum —
   * then its air has already gone, and it is vacuum too. If it cannot, it is holding
   * twenty-nine atmospheres of hot ammonia and it rings like a bell. So we do not
   * "set a room to vacuum" anywhere: we flood from SPACE, through everything that is
   * not solid, and whatever the flood touches has no air in it.
   *
   * Which means sealing a breach with a single block re-pressurises the whole
   * compartment, instantly, with no code that knows anything about compartments. Put
   * the block back and the air goes out again. Nobody wrote that. It is just true.
   * ============================================================== */
  function repressurize(S) {
    if (!S.space || !S.space.length) return;
    const N = S.w * S.h * S.d;
    const out = new Uint8Array(N);
    const q = [];
    for (const c of S.space) {
      if (!inside(S, c[0], c[1], c[2])) continue;
      const i = idx(S, c[0], c[1], c[2]);
      if (S.solidOf[S.vox[i]]) continue;
      out[i] = 1;
      q.push(i);
    }
    while (q.length) {
      const i = q.pop();
      const x = i % S.w, z = ((i / S.w) | 0) % S.d, y = (i / (S.w * S.d)) | 0;
      for (let n = 0; n < FACES; n++) {
        const nx = x + NB[n][0], ny = y + NB[n][1], nz = z + NB[n][2];
        if (!inside(S, nx, ny, nz)) continue;
        const j = idx(S, nx, ny, nz);
        if (out[j] || S.solidOf[S.vox[j]]) continue;   // solid holds the air in
        out[j] = 1;
        q.push(j);
      }
    }

    let vac = 0, air = 0;
    for (let i = 0; i < N; i++) {
      const b = S.vox[i];
      if (b !== 0 && b !== 16) continue;               // only air and vacuum change
      if (out[i]) { if (b !== 16) S.vox[i] = 16; vac++; }
      else { if (b !== 0) S.vox[i] = 0; air++; }
    }
    const was = S.vacN;
    S.vacN = vac;
    S.airN = air;
    S.dirty = true;
    if (was != null && was > 0 && vac === 0) cue(S, 'pressure');   // the air comes back
    return vac;
  }

  /* Is he standing in it? He is deaf if he is. */
  function inVacuum(S) {
    const p = S.player;
    return blockAt(S, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) === 16;
  }

  /* ================================================================
   * THE OTHERS
   *
   * PLAYTEST: "it would be cool to have other Eridians to talk to on the maps. maybe
   * to give clues? maybe they have their own rooms in the cave spaces?"
   *
   * Eridians cannot do anything alone. They have no government and no war and no way to
   * make anybody do anything, so the entire species runs on turning up and TALKING to
   * each other. A warren with nobody in it is not a warren, it is a hole.
   *
   * And they are found the way everything in this game is found: BY SOUND. An Eridian is
   * always working — tapping, filing, shifting things about — so an Eridian is a NOISE,
   * and a pulse shows you a person exactly the way it shows you a wall. You do not see
   * them across the room. You hear somebody working, and you go and find out who.
   *
   * What they give you is what an engineer gives you: they tell you the truth about
   * where you are. In a generated warren, that is a bearing and a distance to the way
   * out — computed, not guessed, by walking the cave themselves.
   * ============================================================== */
  function stepFolk(S, dt) {
    if (!S.folk.length) return;
    if (S.flags.done) return;   // through the door, and the crew have gone quiet too
    const p = S.player;
    for (const f of S.folk) {
      /* THE DEAD MAKE NO SOUND. A crew member who has gone silent stays silent — no hum,
       * no work, nothing to walk toward. This is the whole of The Failure: you have known
       * where everybody is, all game, by the noise they make, and one by one the noises
       * stop, and the engine tells you nothing. You just notice a voice is not there. */
      if (f.alive === false) continue;   // === false: only the KILLED are silent; a generated warren's folk have no `alive` set and must still hum
      // they are always working, and work makes noise
      f.cd -= dt;
      if (f.cd <= 0) {
        const k = S.cfg.sourceKinds.folk;
        f.cd += k.period * (0.7 + S.rnd() * 0.6);
        emit(S, f.at[0] + 0.5, f.at[1] + 0.5, f.at[2] + 0.5, k.amp, 90, k.range, null, S.cfg.blocks[11].note);
        cue(S, 'source:folk');
      }
      const d = Math.hypot(p.x - (f.at[0] + 0.5), p.y - (f.at[1] + 0.5), p.z - (f.at[2] + 0.5));
      f.near = d < 5.5;
      if (f.near && !f.met) {
        f.met = true;
        S.metN++;
        cue(S, 'meet');
      }
    }
  }

  /* WHAT DOES SOMEBODY WHO LIVES HERE KNOW? Where the way out is — and not vaguely:
   * they have walked it. So we walk it too, from them, through the actual cave, and hand
   * them the real number. An Eridian would be insulted to give you an estimate. */
  function folkClue(S, f) {
    if (!S.exit) return null;
    const dist = new Int32Array(S.w * S.h * S.d).fill(-1);
    const start = idx(S, f.at[0], f.at[1], f.at[2]);
    const q = [[f.at[0], f.at[1], f.at[2]]];
    dist[start] = 0;
    let hit = -1;
    while (q.length) {
      const [x, y, z] = q.shift();
      const d = dist[idx(S, x, y, z)];
      for (let n = 0; n < FACES; n++) {
        const nx = x + NB[n][0], ny = y + NB[n][1], nz = z + NB[n][2];
        if (!inside(S, nx, ny, nz)) continue;
        if (nx === S.exit[0] && ny === S.exit[1] && nz === S.exit[2]) { hit = d + 1; q.length = 0; break; }
        if (isSolid(S, nx, ny, nz)) continue;
        const j = idx(S, nx, ny, nz);
        if (dist[j] !== -1) continue;
        dist[j] = d + 1;
        q.push([nx, ny, nz]);
      }
      if (hit >= 0) break;
    }
    if (hit < 0) return null;
    const dx = S.exit[0] - f.at[0], dz = S.exit[2] - f.at[2], dy = S.exit[1] - f.at[1];
    const dirs = [];
    if (Math.abs(dz) > 4) dirs.push(dz < 0 ? 'sunward' : 'deepward');
    if (Math.abs(dx) > 4) dirs.push(dx < 0 ? 'left of that' : 'right of that');
    const climb = dy > 3 ? ' and it is ABOVE you' : (dy < -3 ? ' and it is BELOW you' : '');
    return { steps: hit, six: toBase6(hit), where: dirs.join(', ') || 'close, very close', climb };
  }

  /* ================================================================
   * THE WAY OUT
   *
   * PLAYTEST: "there is not a clear exit to the room... each level needs a distinct
   * similar finishing spot, or door, or portal." Fair — and in the tutorial it was
   * worse than that: the only exit WAS the way in.
   *
   * So every chapter ends at the same thing, in the same way, and it is findable the
   * way this game finds everything else: it HUMS. Solve the room and the arch starts
   * calling, loud and far, so a pulse from anywhere will show you where to go. Before
   * the room is solved it is a dead arch and it says nothing — you cannot leave a job
   * half done by wandering into the door.
   * ============================================================== */
  function solved(S) {
    const c = S.chapter;
    if (c.walk && c.walk.length) {
      /* A walkthrough whose LAST step is "walk into the way out" cannot wait for
       * itself to finish before the way out will open. The room is solved when every
       * step that is not about leaving is done. */
      const leaveAt = c.walk.findIndex((w) => w.done && w.done.exit);
      const need = leaveAt < 0 ? c.walk.length : leaveAt;
      return S.stepI >= need;
    }
    /* A TRACKING chapter is won by plotting the contact's course — enough fixes, spread
     * along its path — not by a door or a gauge. The Blip does not answer to anything else. */
    if (c.track) return S.fixes.length >= c.track.need;

    /* A SEAL chapter turns on WHAT you plug the breach with. Any solid stops your air going;
     * only XENONITE also lets your voice through. So sealing with grit leaves you alive and
     * deaf — safe, and alone — and the chapter is not done until the hole is filled with the
     * one material that is airtight AND sings. The wall is not the obstacle. The wall is the
     * whole reason the two of you can talk at all. */
    if (c.seal) {
      const b = blockAt(S, c.seal[0], c.seal[1], c.seal[2]);
      return b === 7 || b === 13;   // loose or cast xenonite
    }

    /* A COUNTING chapter is answered in BASE SIX. She shows a quantity; you say it back the
     * only way you know how — in sixes and ones, the dot-numerals the game has been putting
     * in front of you since the first gauge in Chapter One. You lay blocks on two shelves:
     * one is worth six each, one is worth one each. The number is right when six-times-the-
     * sixes plus the ones equals hers — AND the ones shelf holds fewer than six, because
     * six ones is a six, and knowing that is the whole of what base six IS. */
    if (c.count) {
      const tally = (cells) => cells.reduce((n, p) => n + (blockAt(S, p[0], p[1], p[2]) !== 0 ? 1 : 0), 0);
      const sixes = tally(c.count.sixes), ones = tally(c.count.ones);
      return sixes * 6 + ones === c.count.value && ones < 6;
    }

    /* A BUILD chapter is won by CONSTRUCTION — the engineer finally gets to do the thing he
     * is FOR. He rebuilds a breached hull, cell by cell, out of the one material that is
     * airtight AND sings: every target cell must become XENONITE (loose 7 or cast 13). Grit
     * would seal the air and go deaf, and a wall you cannot talk through is not this wall.
     * Half-built is not built: the same cells vent his chamber (see `space`), so one open
     * cell is still a vacuum and still silent — you cannot leave a hole in it and call it a
     * wall. */
    if (c.build_target) {
      return c.build_target.every((p) => {
        const b = blockAt(S, p[0], p[1], p[2]);
        return b === 7 || b === 13;
      });
    }

    /* A BRED chapter is won when the forge has made the ONE strain that does all three
     * impossible things — eats the red, survives his air, survives hers. Everything before
     * it is corpses, and the corpses were the lesson. `c.bred` names the winning recipe. */
    if (c.bred) return S.forges.some((f) => f.made.indexOf(c.bred) >= 0);

    /* A CONTAIN chapter turns on whether the living thing STAYS PUT. Flood outward from the
     * sample through everything it can cross (air, and — the betrayal — xenonite); if that
     * flood can reach the world outside the box, it has leaked and you have failed. Wall it
     * in the one thing it cannot cross (grit, the deaf dead stuff) and the flood is bounded,
     * and it is held. A pure function of the walls you built, computed like repressurize. */
    if (c.contain) {
      const cross = c.contain.cross || [0, 7, 13, 17];   // air + loose/cast xenonite + taumoeba
      const outside = {};
      for (const o of c.contain.outside) outside[idx(S, o[0], o[1], o[2])] = 1;
      const seen = {};
      const q = [];
      for (const s of c.contain.sample) { const i = idx(S, s[0], s[1], s[2]); if (!seen[i]) { seen[i] = 1; q.push(i); } }
      while (q.length) {
        const i = q.pop();
        if (outside[i]) return false;                    // it got out
        const x = i % S.w, z = ((i / S.w) | 0) % S.d, y = (i / (S.w * S.d)) | 0;
        for (let n = 0; n < FACES; n++) {
          const nx = x + NB[n][0], ny = y + NB[n][1], nz = z + NB[n][2];
          if (!inside(S, nx, ny, nz)) continue;
          const j = idx(S, nx, ny, nz);
          if (seen[j]) continue;
          if (cross.indexOf(blockAt(S, nx, ny, nz)) < 0) continue;
          seen[j] = 1; q.push(j);
        }
      }
      return true;                                       // never reached the outside — held
    }

    /* A CLEAR chapter is won when the red is GONE. You set the living green against the
     * astrophage and let it eat: the hole closes, cell by cell, and the room behind the
     * murder opens up and rings. Solved when no `of`-block is left anywhere in the region. */
    if (c.clear) {
      const lo = c.clear.region[0], hi = c.clear.region[1];
      for (let y = lo[1]; y <= hi[1]; y++)
        for (let z = lo[2]; z <= hi[2]; z++)
          for (let x = lo[0]; x <= hi[0]; x++)
            if (blockAt(S, x, y, z) === c.clear.of) return false;
      return true;
    }
    /* In a SHIFT chapter the doors are not the win — they are the shifts themselves, opened
     * one at a time by sleeping. Opening the last of them is not finishing the voyage; it
     * only gets you into the hall where the last gauge is. So a shift chapter is solved by
     * its GAUGES, and the doors are just the road. (Without this, opening the third
     * bulkhead "solved" Sleep with the worst gauge still unread — the whole point of the
     * chapter, skipped by a technicality.) */
    if (S.doors.length && !c.shifts) return S.doors.every((d) => d.open);
    if (S.gauges.length) return S.gauges.every((g) => g.read);
    if (S.doors.length) return S.doors.every((d) => d.open);
    return true;
  }

  function stepExit(S, dt) {
    if (!S.exit) return;
    const open = solved(S);
    if (open && !S.flags.exitOpen) {
      S.flags.exitOpen = true;
      cue(S, 'exitopen');
    }
    if (!open) return;

    // it calls, so you can always find it — until you have walked through it, and then
    // there is nothing left to call you anywhere, which in Launch is the point
    if (!S.flags.done) {
      S.exitCd -= dt;
      if (S.exitCd <= 0) {
        const k = S.cfg.sourceKinds.exit;
        S.exitCd += k.period;
        emit(S, S.exit[0] + 0.5, S.exit[1] + 0.5, S.exit[2] + 0.5, k.amp, 99, k.range);
        cue(S, 'source:exit');
      }
    }

    if (S.flags.done) return;
    const p = S.player;
    const d = Math.hypot(p.x - (S.exit[0] + 0.5), p.y - (S.exit[1] + 0.5), p.z - (S.exit[2] + 0.5));
    if (d <= 1.6) {
      S.flags.done = true;
      cue(S, 'done');
    }
  }

  /* ---------- cues: the engine says what happened; app.js decides how it sounds ---------- */
  function cue(S, id) { S.cueQ.push(id); if (S.cueQ.length > 64) S.cueQ.shift(); }
  function takeCues(S) { const q = S.cueQ; S.cueQ = []; return q; }

  /* ---------- gauges: the plot, in base six ---------- */
  function toBase6(n) {
    n = Math.max(0, Math.round(n));
    if (n === 0) return '0';
    let s = '';
    while (n > 0) { s = (n % 6) + s; n = Math.floor(n / 6); }
    return s;
  }

  function nearestGauge(S, radius) {
    const p = S.player;
    const R = radius == null ? 2.2 : radius;
    let best = null, bd = R * R;
    for (const g of S.gauges) {
      const dx = g.at[0] + 0.5 - p.x, dy = g.at[1] + 0.5 - p.y, dz = g.at[2] + 0.5 - p.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bd) { bd = d2; best = g; }
    }
    return best;
  }

  function readGauge(S) {
    const g = nearestGauge(S);
    if (!g) return { ok: false, why: 'nothing in reach' };
    if (g.read) return { ok: false, why: 'already read' };
    g.read = true;
    S.readCount++;
    cue(S, 'gauge');
    /* AND CHECKING A SYSTEM IS HOW YOU FIND OUT. In The Failure, each gauge is a section of
     * the ship, and reading it — learning the radiation there is past saving — is the
     * moment the crew member working that section goes quiet. You do not cause it and the
     * game does not announce it: you are standing at the gauge, and a hum you have heard
     * all game simply stops. `dies` names whose sound ends when this gauge is read. */
    for (const f of S.folk) {
      if (f.alive && f.dies === g.id) { f.alive = false; S.lostN++; cue(S, 'lost'); }
    }
    const done = S.gauges.every((x) => x.read);
    if (done) { S.flags.all_gauges = true; cue(S, 'chapter'); }
    return {
      ok: true, id: g.id, name: g.name,
      reading: g.reading, nominal: g.nominal,
      drift: g.reading - g.nominal,
      six: toBase6(g.reading), sixNominal: toBase6(g.nominal),
      done: done
    };
  }

  /* ---------- SLEEP: and the ship changes while you are out ----------
   *
   * You cannot see relativity and you cannot see forty-two light years. What you CAN do is
   * lie down in the dark, and get up, and find that the room you knew is not quite the room
   * any more — a wall where a way used to be, a machine gone quiet, a passage that has
   * opened somewhere behind you. Nobody narrates it. You pulse into it and something is
   * different, and you have to work out what.
   *
   * The rule is the honest one: you do not sleep until your rounds are done. Each shift has
   * a gauge that is your job to read; read it, come back to the bunk, and the next shift
   * begins — the chapter's own op-list mutates the ship, and one more door of the voyage
   * opens ahead of you.
   */
  function nearBunk(S) {
    if (!S.bunk) return false;
    const p = S.player;
    return Math.hypot(p.x - (S.bunk[0] + 0.5), p.y - (S.bunk[1] + 0.5), p.z - (S.bunk[2] + 0.5)) <= 2.4;
  }

  function sleep(S) {
    const shifts = S.chapter.shifts || [];
    if (!S.bunk || !shifts.length) return { ok: false, why: 'nowhere to sleep here' };
    if (!nearBunk(S)) return { ok: false, why: 'not at the bunk' };
    if (S.shift >= shifts.length) return { ok: false, why: 'the voyage is over' };
    const sh = shifts[S.shift];
    /* YOU DO NOT SLEEP THROUGH YOUR ROUNDS. The shift names the gauge you owe it; leave it
     * unread and the bunk will not have you. */
    if (sh.check) {
      const g = S.gauges.find((x) => x.id === sh.check);
      if (g && !g.read) return { ok: false, why: 'finish your rounds first' };
    }
    for (const op of (sh.ops || [])) applyOp(S, op);
    if (sh.opens) openDoor(S, sh.opens);
    S.shift++;
    S.dirty = true;
    cue(S, 'sleep');
    return { ok: true, shift: S.shift, line: sh.line || null };
  }

  /* ---------- the 12 commands go through ONE door, so the tape is honest ---------- */
  function create(cfg, opts) {
    opts = opts || {};
    const chapter = cfg.chapters.find((c) => c.id === (opts.chapter || cfg.chapters[0].id));
    const W = chapter.world;
    const N = W.w * W.h * W.d;

    const S = {
      cfg: cfg,
      opts: opts,
      chapter: chapter,
      rnd: rng(opts.seed || 1),
      w: W.w, h: W.h, d: W.d,
      t: 0,
      acc: 0,
      vox: new Uint8Array(N),
      surf: new Uint8Array(N),
      heat: new Float32Array(N),
      amp: new Float32Array(N),
      arrive: new Float32Array(N),
      src: new Uint8Array(N),
      cost: new Float32Array(N),
      seen: new Int32Array(N),
      done: new Int32Array(N),
      active: new Int32Array(N),
      nActive: 0,
      stamp: 0,
      buckets: [],
      dirty: true,
      solidOf: cfg.blocks.map((b) => b.solid),
      absorbOf: cfg.blocks.map((b) => b.absorb),
      /* WHAT EACH MATERIAL CHARGES SOUND TO CROSS IT.
       * The single most important table in the game. Grit costs 22 and is a wall
       * to sound; xenonite costs 1.4 and is very nearly a wire. Every locked door
       * in this game is a routing problem posed against this column. */
      costOf: cfg.blocks.map((b) => (b.cost == null ? (b.solid ? cfg.sonar.solidCost : 1) : b.cost)),
      player: {
        x: chapter.spawn[0] + 0.5, y: chapter.spawn[1] + 0.5, z: chapter.spawn[2] + 0.5,
        vx: 0, vy: 0, vz: 0, yaw: 0, onGround: false, onWall: false, climbing: false,
        dist: 0, strideAcc: 0, wallN: null
      },
      pulseCd: 0,
      pulses: 0,
      emits: 0,
      readCount: 0,
      sources: (chapter.sources || []).map((s) => ({
        at: (s.at || s.path[0]).slice(), kind: s.kind, cd: cfg.sourceKinds[s.kind].period * 0.3,
        path: s.path || null, speed: s.speed || 0, travel: 0
      })),
      gauges: (chapter.gauges || []).map((g) => Object.assign({ read: false }, g)),
      ears: (chapter.ears || []).map((e) => Object.assign({ open: false, lit: 0, loudest: 0, cd: 0, rang: 0, askCd: 0, openUntil: -1, asked: 0 }, e)),
      ringQ: [],
      doors: (chapter.doors || []).map((d) => Object.assign({ open: false }, d)),
      earAt: {},
      pending: [],
      forges: (chapter.forges || []).map((f) => ({ at: f.at, hopper: {}, made: [] })),
      /* THE VEST.
       * Rocky wears a tool belt and is never not pulling something out of it, so
       * he is not limited to what fits in his arms. SIX pockets, because Eridians
       * count in six and it would not occur to him to build five or seven.
       * `held` is not a variable — it is a VIEW of the selected pocket (see below).
       * A second field holding "what is in his hands" is a second opinion about
       * the same fact, and second opinions are how the screen ends up showing a
       * block the rules do not think he has. */
      belt: new Array(cfg.belt.pockets).fill(0),
      slot: 0,
      fed: 0,
      made: 0,
      builtN: 0,
      stepI: 0,
      stepDoneN: 0,
      exit: chapter.exit || null,
      exitCd: 0,
      folk: (chapter.folk || []).map((f) => Object.assign({ met: false, near: false, cd: 0, alive: true }, f)),
      lostN: 0,
      metN: 0,
      space: chapter.space || null,
      vacN: null,
      airN: 0,
      /* THE VOYAGE IS PLAYED IN SHIFTS. A chapter can hand you a bunk and a list of
       * shifts; you do your rounds, you sleep, and while you are out the ship CHANGES —
       * and nobody tells you what. `shift` is which one you are on; the ops that mutate
       * the ship live in the chapter's data, so the engine just applies them and the
       * renderer, which only ever draws what the last pulse lit, shows you the difference
       * the next time you shout. */
      shift: 0,
      bunk: chapter.bunk || null,
      fixes: [],   // plotted positions of a moving contact — see recordFix / The Blip
      lifeCd: 0,   // the taumoeba's growth clock — see stepLife / Act VI
      carryOf: cfg.blocks.map((b) => !!b.carry),
      flags: {},
      cueQ: [],
      lines: []
    };

    for (const op of chapter.build) applyOp(S, op);
    for (const g of S.gauges) setBlock(S, g.at[0], g.at[1], g.at[2], 6);
    for (const e of S.ears) {
      setBlock(S, e.at[0], e.at[1], e.at[2], e.rings ? 11 : 10);
      S.earAt[idx(S, e.at[0], e.at[1], e.at[2])] = e.id;
      // an asking socket does not ask the instant the room loads — she waits a beat first
      if (e.asks) e.askCd = (e.asks.period == null ? 5 : e.asks.period) * 0.4;
    }
    for (const d of S.doors) for (const c of d.cells) setBlock(S, c[0], c[1], c[2], 8);
    for (const f of S.forges) setBlock(S, f.at[0], f.at[1], f.at[2], 12);
    if (S.exit) setBlock(S, S.exit[0], S.exit[1], S.exit[2], 15);

    /* THE PEOPLE A GENERATOR PUTS IN A CAVE.
     * They are not decoration and they do not read from a script: each of them WALKS the
     * cave, from where they are standing to the way out, and tells you the real number.
     * An Eridian would be insulted to give you an estimate. */
    if (S.folkSpots && S.folkSpots.length) {
      const names = cfg.folkNames;
      S.folkSpots.forEach((at, i) => {
        const f = { at, name: names[i % names.length], met: false, near: false, cd: i * 0.4, generated: true };
        S.folk.push(f);
      });
      for (const f of S.folk) {
        if (!f.generated) continue;
        const c = folkClue(S, f);
        f.chord = ['♪♩♪', '♩♪♩♩', '♪♪♩', '♩♩♪♪'][S.folk.indexOf(f) % 4];
        f.line = c
          ? `The way out? ${c.six} paces, in sixes — ${c.steps} of yours. ${c.where}${c.climb}. I have walked it. I am not guessing.`
          : 'There is no way out of here that I have ever found, and I have looked.';
      }
    }
    repressurize(S);
    rebuildSurface(S);
    return S;
  }

  function step(S, dt, input) {
    input = input || {};
    dt = Math.min(0.1, Math.max(0, dt));
    S.acc += dt;
    let guard = 0;
    while (S.acc >= FIXED && guard++ < 8) {
      S.acc -= FIXED;
      S.t += FIXED;
      if (S.pulseCd > 0) S.pulseCd -= FIXED;
      stepPlayer(S, FIXED, input);
      stepSources(S, FIXED);
      stepLife(S, FIXED);
      stepQuestions(S, FIXED);
      stepBells(S, FIXED);
      stepFolk(S, FIXED);
      stepWalk(S);
      stepExit(S, FIXED);
      updateHeat(S, FIXED);
    }
    return S;
  }

  /* WHAT DID THE ROOM SOUND LIKE?
   * A mix of every material currently answering, and the share of the echo each one
   * accounts for. The renderer plays this back as a CHORD — so a basalt corridor is
   * a low dull hum, a gallery of xenonite and bells is bright and ringing, and a room
   * with grit in it has a hole in the chord.
   *
   * It lives HERE, in the engine, because "how much of what I am hearing is xenonite"
   * is a fact about the world, not a decision about audio. app.js asks. It does not
   * work it out. */
  function chordOf(S) {
    const by = {};
    let total = 0;
    for (let k = 0; k < S.nActive; k++) {
      const i = S.active[k];
      const v = S.heat[i];
      if (v <= 0) continue;
      const b = S.vox[i];
      by[b] = (by[b] || 0) + v;
      total += v;
    }
    if (!total) return [];
    return Object.keys(by).map((b) => ({
      block: +b,
      note: S.cfg.blocks[+b].note,
      share: by[b] / total
    })).sort((a, c) => c.share - a.share);
  }

  /* what the renderer is allowed to ask for. it may ask. it may not invent. */
  function litCells(S, out) {
    out = out || [];
    out.length = 0;
    const cap = S.cfg.sonar.lit;
    for (let k = 0; k < S.nActive && out.length < cap; k++) {
      const i = S.active[k];
      const v = S.heat[i];
      if (v <= 0) continue;
      out.push({
        i: i,
        x: i % S.w,
        z: ((i / S.w) | 0) % S.d,
        y: (i / (S.w * S.d)) | 0,
        b: S.vox[i],
        v: v,
        src: S.src[i]
      });
    }
    return out;
  }

  const api = {
    create, step, pulse, emit, litCells, takeCues, cue, costAt, cameraFit,
    blockAt, setBlock, isSolid, idx, inside, collides, rebuildSurface,
    readGauge, nearestGauge, toBase6, updateHeat, stepPlayer, applyOp,
    takeBlock, placeBlock, facing, openDoor, tryOpen, settleEars, stepBells,
    stepNow, stepDone, stepWalk, chordOf, solved, stepExit, repressurize, inVacuum,
    stepFolk, folkClue, sleep, nearBunk, stepQuestions, stepLife,
    feedForge, nearestForge, canMake, addBell, removeBell, selectSlot, freeSlot, held, setHeld, voice,
    FIXED
  };
  return api;
});
