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

  /* ---------- world building: a level is DATA, not a hand-placed array ---------- */
  function applyOp(S, op) {
    if (op.op === 'set') {
      setBlock(S, op.at[0], op.at[1], op.at[2], op.block);
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
  function heapPush(h, dist, i) {
    if (h.n >= h.dist.length) h.grow();
    h.push(dist, i);
    let c = h.n++;
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (h.dist[p] <= h.dist[c]) break;
      h.swap(p, c); c = p;
    }
  }
  function heapPop(h) {
    const top = h.i[0];
    h.n--;
    if (h.n > 0) {
      h.dist[0] = h.dist[h.n]; h.i[0] = h.i[h.n];
      let p = 0;
      for (;;) {
        const l = p * 2 + 1, r = l + 1;
        let m = p;
        if (l < h.n && h.dist[l] < h.dist[m]) m = l;
        if (r < h.n && h.dist[r] < h.dist[m]) m = r;
        if (m === p) break;
        h.swap(p, m); p = m;
      }
    }
    return top;
  }
  function makeHeap(cap) {
    const h = {
      n: 0,
      dist: new Float32Array(cap),
      i: new Int32Array(cap),
      push(d, i) { h.dist[h.n] = d; h.i[h.n] = i; },
      grow() {
        const nd = new Float32Array(h.dist.length * 2);
        const ni = new Int32Array(h.i.length * 2);
        nd.set(h.dist); ni.set(h.i);
        h.dist = nd; h.i = ni;
      },
      swap(a, b) {
        const td = h.dist[a]; h.dist[a] = h.dist[b]; h.dist[b] = td;
        const ti = h.i[a]; h.i[a] = h.i[b]; h.i[b] = ti;
      }
    };
    return h;
  }

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
  function emit(S, wx, wy, wz, amp0, srcId, range) {
    if (S.dirty) rebuildSurface(S);
    const son = S.cfg.sonar;
    const reach = range || son.maxDist;
    const x0 = Math.floor(wx), y0 = Math.floor(wy), z0 = Math.floor(wz);
    if (!inside(S, x0, y0, z0)) return 0;

    const stamp = ++S.stamp;
    const h = S.heap;
    h.n = 0;
    const start = idx(S, x0, y0, z0);
    S.seen[start] = stamp;
    S.cost[start] = 0;
    heapPush(h, 0, start);

    const maxD = reach;
    const solidCost = son.solidCost;
    let touched = 0;

    while (h.n > 0) {
      const i = heapPop(h);
      const d = S.cost[i];
      if (d > maxD) break;

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
          const ear = S.earAt[j];
          if (ear !== undefined && a > (S.heard[ear] || 0)) S.heard[ear] = a;

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
          heapPush(h, nd, j);
        }
      }
    }
    S.emits++;
    settleEars(S);
    return touched;
  }

  /* Did anything the wave just did satisfy a listener? Asked once per emission,
   * against the loudest thing that reached each ear. */
  function settleEars(S) {
    for (const e of S.ears) {
      const got = S.heard[e.id] || 0;
      e.loudest = Math.max(e.loudest, got);
      e.lit = got;
      if (!e.open && got >= e.needs) {
        e.open = true;
        cue(S, 'ear');
        openDoor(S, e.opens);
      }
      S.heard[e.id] = 0;
    }
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

  function takeBlock(S) {
    if (S.held) return { ok: false, why: 'hands full' };
    const p = S.player;
    const dx = -Math.sin(p.yaw), dz = -Math.cos(p.yaw);
    for (let t = 0.6; t <= 2.4; t += 0.2) {
      for (const dy of [0, -1, 1]) {
        const x = Math.floor(p.x + dx * t), y = Math.floor(p.y) + dy, z = Math.floor(p.z + dz * t);
        const b = blockAt(S, x, y, z);
        if (!S.carryOf[b]) continue;
        setBlock(S, x, y, z, 0);
        rebuildSurface(S);
        S.held = b;
        cue(S, 'take');
        return { ok: true, block: b, at: [x, y, z] };
      }
    }
    return { ok: false, why: 'nothing to lift' };
  }

  function placeBlock(S) {
    if (!S.held) return { ok: false, why: 'empty handed' };
    const p = S.player;
    const dx = -Math.sin(p.yaw), dz = -Math.cos(p.yaw);
    for (let t = 0.8; t <= 2.6; t += 0.2) {
      for (const dy of [0, -1, 1]) {
        const x = Math.floor(p.x + dx * t), y = Math.floor(p.y) + dy, z = Math.floor(p.z + dz * t);
        if (!inside(S, x, y, z) || isSolid(S, x, y, z)) continue;
        // never brick yourself into the wall
        const pb = [Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)];
        if (x === pb[0] && z === pb[2] && (y === pb[1] || y === pb[1] - 1)) continue;
        const b = S.held;
        setBlock(S, x, y, z, b);
        rebuildSurface(S);
        S.held = 0;
        cue(S, 'place');
        // it lands with a bang, and the bang is a sound like any other
        emit(S, x + 0.5, y + 0.5, z + 0.5, S.cfg.sonar.placeAmp, 0, S.cfg.sonar.placeRange);
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

  /* Rocky pulses. Costs a cooldown, so you cannot simply hold the world lit. */
  function pulse(S) {
    if (S.pulseCd > 0) return { ok: false, why: 'cooling' };
    const p = S.player;
    S.pulseCd = S.cfg.sonar.cooldown;
    const n = emit(S, p.x, p.y, p.z, S.cfg.sonar.pulseAmp, 0);
    S.pulses++;
    cue(S, 'pulse');
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

  /* ---------- ambient sources: the warren breathes ---------- */
  function stepSources(S, dt) {
    for (let i = 0; i < S.sources.length; i++) {
      const s = S.sources[i];
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
  function nearWall(S) {
    const p = S.player, hw = S.cfg.physics.halfWidth, e = 0.07;
    return collides(S, p.x + hw + e, p.y, p.z) || collides(S, p.x - hw - e, p.y, p.z) ||
           collides(S, p.x, p.y, p.z + hw + e) || collides(S, p.x, p.y, p.z - hw - e);
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
    const hitY = moveAxis(S, 'y', p.vy * dt);
    if (hitY) {
      if (p.vy < 0) {
        if (!p.onGround && p.vy < -8) {
          cue(S, 'land');
          emit(S, p.x, p.y, p.z, son.landAmp, 0, son.landRange);  // a landing is a LOUD footfall
        }
        p.onGround = true;
      }
      p.vy = 0;
    } else if (!wall) {
      p.onGround = false;
    }

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
      emit(S, p.x, p.y, p.z, son.footAmp, 0, son.footRange);
      cue(S, 'step');
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
      active: new Int32Array(N),
      nActive: 0,
      stamp: 0,
      heap: makeHeap(N + 8),
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
        dist: 0, strideAcc: 0
      },
      pulseCd: 0,
      pulses: 0,
      emits: 0,
      readCount: 0,
      sources: (chapter.sources || []).map((s) => ({ at: s.at, kind: s.kind, cd: cfg.sourceKinds[s.kind].period * 0.3 })),
      gauges: (chapter.gauges || []).map((g) => Object.assign({ read: false }, g)),
      ears: (chapter.ears || []).map((e) => Object.assign({ open: false, lit: 0, loudest: 0 }, e)),
      doors: (chapter.doors || []).map((d) => Object.assign({ open: false }, d)),
      earAt: {},
      heard: {},
      held: 0,
      carryOf: cfg.blocks.map((b) => !!b.carry),
      flags: {},
      cueQ: [],
      lines: []
    };

    for (const op of chapter.build) applyOp(S, op);
    for (const g of S.gauges) setBlock(S, g.at[0], g.at[1], g.at[2], 6);
    for (const e of S.ears) {
      setBlock(S, e.at[0], e.at[1], e.at[2], 10);
      S.earAt[idx(S, e.at[0], e.at[1], e.at[2])] = e.id;
    }
    for (const d of S.doors) for (const c of d.cells) setBlock(S, c[0], c[1], c[2], 8);
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
      updateHeat(S, FIXED);
    }
    return S;
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
    takeBlock, placeBlock, facing, openDoor, settleEars,
    FIXED
  };
  return api;
});
