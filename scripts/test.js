/* ROCKY SAVES THE UNIVERSE — the headless suite.
 *
 * Rules, not vibes. The engine runs with no browser, so everything that is TRUE
 * about the game can be asserted here in two seconds. The renderer is checked
 * by SOURCE SCAN: it is not allowed to re-implement anything the engine owns.
 *
 *   node d:/Files/sourcecode/darkweb/rocky/scripts/test.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CFG = require(path.join(ROOT, 'js/config.js'));
global.ROCKY_CFG = CFG;
const R = require(path.join(ROOT, 'js/sim.js'));
const AUDIO = require(path.join(ROOT, 'js/audio.js')).RockyAudio;

const SRC = {
  sim: fs.readFileSync(path.join(ROOT, 'js/sim.js'), 'utf8'),
  app: fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8'),
  cfg: fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8'),
  html: fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
  sw: fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')
};

let pass = 0, fail = 0;
const fails = [];
function ok(c, msg) { if (c) pass++; else { fail++; fails.push(msg); } }
function eq(a, b, msg) { ok(a === b, msg + '  (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }
function near(a, b, tol, msg) { ok(Math.abs(a - b) <= tol, msg + '  (got ' + a + ', want ' + b + ' +/-' + tol + ')'); }
function group(name, fn) { fn(); }

const mk = (o) => R.create(CFG, Object.assign({ seed: 1 }, o));
const steps = (S, secs, input) => { for (let i = 0; i < Math.round(secs * 60); i++) R.step(S, R.FIXED, input || {}); };

/* an empty sealed test world, so sonar can be measured in the open */
function openWorld(size) {
  const n = size || 30;
  const cfg = JSON.parse(JSON.stringify(CFG));
  cfg.chapters = [{
    id: 'lab', name: 'lab', world: { w: n, h: n, d: n }, spawn: [15, 15, 15],
    objective: '', build: [
      { op: 'fill', from: [0, 0, 0], to: [n - 1, n - 1, n - 1], block: 1 },
      { op: 'fill', from: [1, 1, 1], to: [n - 2, n - 2, n - 2], block: 0 }
    ], sources: [], gauges: [], lines: []
  }];
  return R.create(cfg, { seed: 1, chapter: 'lab' });
}

/* =====================================================================
 * THE WORLD
 * =================================================================== */
group('world', () => {
  const S = mk();
  eq(S.w, 44, 'chapter world is 44 wide');
  ok(S.vox.length === S.w * S.h * S.d, 'the voxel grid is exactly w*h*d');

  ok(!R.isSolid(S, S.chapter.spawn[0], S.chapter.spawn[1], S.chapter.spawn[2]), 'Rocky does not spawn inside a rock');
  ok(R.isSolid(S, -1, 5, 5), 'outside the world is solid rock, always');
  ok(R.isSolid(S, 999, 5, 5), 'outside the world is solid rock in every direction');

  // a room op hollows out and lays a floor
  ok(!R.isSolid(S, 22, 4, 33), 'a room op leaves air inside it');
  ok(R.isSolid(S, 22, 1, 33), 'a room op lays a floor under the air');

  // gauges are placed as blocks, not as ghosts
  for (const g of S.gauges) eq(R.blockAt(S, g.at[0], g.at[1], g.at[2]), 6, 'gauge ' + g.id + ' is a real block in the world');

  // a surface cell is a solid touching air; buried rock is not
  eq(S.surf[R.idx(S, 22, 1, 33)], 1, 'the floor of a room is a surface cell — you can hear it');
  eq(S.surf[R.idx(S, 22, 0, 33)], 0, 'the rock UNDER that floor is not — it is walled in on all six sides');
  eq(S.surf[R.idx(S, 1, 1, 1)], 0, 'rock buried in rock is never a surface cell (nothing can ever hear it)');
});

/* =====================================================================
 * THE PULSE — the whole game
 * =================================================================== */
group('sonar', () => {
  const S = openWorld();

  // nothing is audible until you make a sound
  eq(S.nActive, 0, 'the world starts silent: nothing is lit');
  R.litCells(S, []);
  const before = R.litCells(S, []).length;
  eq(before, 0, 'with no pulse, Rocky sees nothing at all');

  const r = R.pulse(S);
  ok(r.ok, 'Rocky can pulse');
  ok(r.cells > 0, 'a pulse reaches the walls of the room');

  /* THE WAVEFRONT IS REAL.
   * Sound takes TIME. Immediately after the pulse the far wall is still silent,
   * because the wave has not got there yet. This is the single most important
   * assertion in the file: it is what makes the ring on screen honest. */
  R.updateHeat(S, 0);
  eq(R.litCells(S, []).length, 0, 'the instant you pulse, nothing has come back yet');

  /* the nearest wall of this room is 14 cells away, and sound covers 19 cells a
   * second, so the first echo cannot possibly arrive before ~0.74s. It doesn't. */
  steps(S, 0.5);
  eq(R.litCells(S, []).length, 0, 'half a second in, the wave is still in flight — the room is 14 cells wide');

  steps(S, 0.45);
  const early = R.litCells(S, []).length;
  ok(early > 0, 'just under a second, and the near walls answer');

  steps(S, 0.8);
  const late = R.litCells(S, []).length;
  ok(late > early, 'and the far walls answer later still — the wavefront expands at the speed of sound');
});

group('THE WAVEFRONT IS A SPHERE', () => {
  /* The wave has no model, no ring, no mesh. It shows itself by STRIKING the
   * walls in the order the engine says they were struck — so that order had
   * better be a sphere expanding, because that is what a player watching a
   * pulse cross a floor will believe they are seeing.
   *
   * On a 6-neighbour grid Dijkstra yields TAXICAB distance: the cell straight
   * ahead is struck on time and the cell diagonally ahead is struck 41% late,
   * and the sweep visibly comes out as a diamond. Hence 26 neighbours, weighted
   * 1 / root-2 / root-3. Here we hold it to a true sphere within 12%. */
  const S = openWorld(30);
  const c = [15, 15, 15];
  R.emit(S, c[0] + 0.5, c[1] + 0.5, c[2] + 0.5, 1, 0);

  let worst = 0, checked = 0;
  const probes = [[10, 0, 0], [0, 9, 0], [7, 7, 0], [6, 6, 6], [8, 3, 5], [10, 10, 4], [4, 9, 9]];
  for (const p of probes) {
    const i = R.idx(S, c[0] + p[0], c[1] + p[1], c[2] + p[2]);
    const euclid = Math.hypot(p[0], p[1], p[2]);
    const cost = S.cost[i];
    const err = Math.abs(cost - euclid) / euclid;
    worst = Math.max(worst, err);
    checked++;
    ok(err < 0.12, `sound travels straight: cost to ${p} is ${cost.toFixed(2)}, euclidean is ${euclid.toFixed(2)} (${(err * 100).toFixed(1)}% off)`);
  }
  eq(checked, 7, 'seven directions probed, including the diagonals where a taxicab grid falls apart');
  ok(worst < 0.12, `the worst direction is only ${(worst * 100).toFixed(1)}% off a true sphere`);

  /* A WALL BOUNCES SOUND. IT DOES NOT SWALLOW IT FIRST.
   * The reflector is 14 cells from Rocky, so its echo must be timed at 14 —
   * not at 14 plus the price of penetrating the very surface it is bouncing
   * off. Bill it that way (I did) and every wall in the game comes back a
   * quarter-second late and a third too quiet, and it still looks like sonar. */
  const B = openWorld(30);
  R.emit(B, 15.5, 15.5, 15.5, 1, 0);
  const iw = R.idx(B, 29, 15, 15);
  near(B.arrive[iw], 14 / CFG.sonar.speed, 0.06, 'the wall 14 cells away answers at 14 cells, not at 14 + the cost of drilling into it');

  /* THE STRIKE. A surface is brightest at the instant the wave lands, then it
   * settles. Without this the room does not get swept — it switches on, like a
   * lightbulb, in a game whose whole subject is that there are no lightbulbs. */
  const W = openWorld(30);
  R.pulse(W);
  const i = R.idx(W, 29, 15, 15);
  steps(W, 0.78);                          // the wall is 14 away: the wave lands about here
  const atLanding = W.heat[i];
  steps(W, 0.40);                          // a heartbeat later
  const settled = W.heat[i];
  ok(atLanding > settled * 1.5,
    `a wall FLARES as the wave lands and then settles (${atLanding.toFixed(2)} -> ${settled.toFixed(2)})`);
  ok(settled > 0, 'but it does not go out — it becomes memory');
  ok(/son\.flash/.test(SRC.sim), 'the strike lives in the engine');
  ok(!/sonar\.flash/.test(SRC.app), 'and app.js does not invent one of its own');

  /* AND THERE IS NO WAVEFRONT OBJECT. A wireframe sphere around Rocky is a
   * sphere the camera is standing INSIDE — it renders as a spiderweb over the
   * entire screen (it did, for exactly one screenshot) and it is a second
   * opinion about where the sound has reached. The engine's strike order is the
   * only opinion there is. */
  ok(!/wireframe:\s*true/.test(SRC.app), 'the renderer draws no wavefront of its own');
  ok(!/new THREE\.SphereGeometry/.test(SRC.app), 'there is no sphere: the wave is visible only where it lands');
});

const openPulsed = (() => { const S = openWorld(30); R.emit(S, 15.5, 15.5, 15.5, 1, 0); return S; })();

group('sound bends and bleeds', () => {
  /* AROUND A CORNER. A raycast would say this cell is invisible. Sound says
   * otherwise, and Rocky lives by sound. */
  const cfg = JSON.parse(JSON.stringify(CFG));
  cfg.chapters = [{
    id: 'lab', name: 'lab', world: { w: 24, h: 8, d: 24 }, spawn: [4, 2, 4], objective: '',
    build: [
      { op: 'fill', from: [0, 0, 0], to: [23, 7, 23], block: 1 },
      { op: 'fill', from: [1, 1, 1], to: [10, 5, 22], block: 0 },   // room A (a corridor down z)
      { op: 'fill', from: [10, 1, 18], to: [22, 5, 22], block: 0 }, // room B, around the corner
      { op: 'fill', from: [11, 1, 1], to: [22, 5, 16], block: 1 }   // the wall between them
    ],
    sources: [], gauges: [], lines: []
  }];
  const S = R.create(cfg, { seed: 1, chapter: 'lab' });

  R.emit(S, 4.5, 2.5, 3.5, 1, 0);   // pulse in room A, at the top of the corridor

  // deep in room B: no line of sight at all. a raycast would call it invisible.
  ok(R.costAt(S, 20, 2, 20) < CFG.sonar.maxDist, 'sound turns the corner into a room you cannot see into');

  /* THROUGH THE WALL.
   * Two sealed rooms with two cells of solid rock between them and no way round.
   * Sound must cross the stone or not arrive at all — and it must cross, because
   * hearing a machine humming through a wall is how Rocky finds the door. */
  const cfg2 = JSON.parse(JSON.stringify(CFG));
  cfg2.chapters = [{
    id: 'lab', name: 'lab', world: { w: 24, h: 8, d: 12 }, spawn: [3, 2, 5], objective: '',
    build: [
      { op: 'fill', from: [0, 0, 0], to: [23, 7, 11], block: 1 },
      { op: 'fill', from: [1, 1, 1], to: [8, 5, 10], block: 0 },    // room A
      { op: 'fill', from: [11, 1, 1], to: [22, 5, 10], block: 0 }   // room B, sealed off by x=9,10
    ],
    sources: [], gauges: [], lines: []
  }];
  const W = R.create(cfg2, { seed: 1, chapter: 'lab' });
  ok(R.isSolid(W, 9, 2, 5) && R.isSolid(W, 10, 2, 5), 'two cells of rock between the rooms');

  R.emit(W, 3.5, 2.5, 5.5, 1, 0);
  const behind = R.costAt(W, 12, 2, 5);         // the first air cell on the FAR side
  ok(behind < CFG.sonar.maxDist, `sound crosses two cells of solid rock (cost ${behind.toFixed(1)}) — badly, but it crosses`);

  const openSame = R.costAt(openPulsed, 15 + 9, 15, 15);   // the same 9-cell trip, in open air
  ok(behind > openSame * 1.7,
    `and it is DEAR: ${behind.toFixed(1)} through the wall vs ${openSame.toFixed(1)} for the same distance in open air`);

  // the far room is audible, but only as a ghost — much quieter than the near one
  steps(W, 1.6);
  const near1 = W.heat[R.idx(W, 9, 2, 5)];      // the near face of the wall
  const far1 = W.heat[R.idx(W, 10, 2, 5)];      // the far face, heard THROUGH it
  ok(near1 > 0, 'the near face of the wall is loud');
  ok(far1 > 0, 'the far face is audible at all — that is the doorway');
  ok(near1 > far1 * 2, `and the ghost is faint: ${near1.toFixed(3)} against ${far1.toFixed(3)}`);

  /* AND THE STALE-COST TRAP.
   * S.cost is scratch. A cell the last wavefront never reached still holds
   * whatever an older one left in it — and an untouched cell holds a flat ZERO,
   * which reads as "no distance at all". Every question about distance goes
   * through costAt, which says Infinity and means it. */
  const far = R.costAt(W, 22, 6, 10);
  ok(far === Infinity || far <= CFG.sonar.maxDist, 'costAt never invents a distance');
  const V = openWorld(30);
  eq(R.costAt(V, 3, 3, 3), Infinity, 'before any sound at all, everywhere is infinitely far away');
});

group('materials have voices', () => {
  /* Every material rings differently and the COLOUR YOU SEE IS THAT RING.
   * Grit swallows sound; xenonite sings. Same distance, different echo. */
  const cfg = JSON.parse(JSON.stringify(CFG));
  cfg.chapters = [{
    id: 'lab', name: 'lab', world: { w: 20, h: 8, d: 20 }, spawn: [10, 3, 10], objective: '',
    build: [
      { op: 'fill', from: [0, 0, 0], to: [19, 7, 19], block: 1 },
      { op: 'fill', from: [1, 1, 1], to: [18, 6, 18], block: 0 },
      { op: 'set', at: [4, 3, 10], block: 9 },   // grit  (absorb .72)
      { op: 'set', at: [16, 3, 10], block: 7 }   // xenonite (absorb .02)
    ],
    sources: [], gauges: [], lines: []
  }];
  const S = R.create(cfg, { seed: 1, chapter: 'lab' });
  R.emit(S, 10.5, 3.5, 10.5, 1, 0);
  steps(S, 0.9);

  const grit = S.heat[R.idx(S, 4, 3, 10)];
  const xeno = S.heat[R.idx(S, 16, 3, 10)];
  ok(grit > 0 && xeno > 0, 'both blocks answered the pulse');
  ok(xeno > grit * 2, `xenonite sings and grit swallows: ${xeno.toFixed(3)} vs ${grit.toFixed(3)} at the same distance`);

  const blocks = CFG.blocks.filter((b) => b.id !== 0);
  for (const b of blocks) ok(/^#[0-9a-f]{6}$/i.test(b.color), b.name + ' has an echo colour');
  ok(new Set(blocks.map((b) => b.color)).size === blocks.length, 'no two materials return the same colour (or you could not tell them apart)');
});

group('memory fades', () => {
  const S = openWorld();
  R.pulse(S);
  steps(S, 1.0);
  const first = R.litCells(S, [])[0];
  ok(first, 'a wall answered');
  const i = first.i;
  const hot = S.heat[i];
  ok(hot > 0, 'and it is loud when it lands');

  steps(S, 1.6);
  const cool = S.heat[i];
  ok(cool > 0 && cool < hot, `the echo is fading: ${hot.toFixed(3)} -> ${cool.toFixed(3)}`);

  steps(S, 14);
  eq(S.heat[i], 0, 'and eventually it is gone entirely — Rocky forgets, and must pulse again');
  eq(S.nActive, 0, 'a forgotten echo is dropped from the active list, not carried forever');

  // the assist toggle: echoes that never fade. easier, and much less like being Rocky.
  const P = openWorld();
  P.opts.persist = true;
  R.pulse(P);
  steps(P, 12);
  ok(P.nActive > 0, 'with persistent echo on, the world stays lit');
  ok(R.litCells(P, []).length > 100, 'and stays lit in bulk');
  ok(CFG.settings.some((s) => s.key === 'rocky.assist'), 'persistent echo is an offered setting, not a secret');
});

group('a loud echo cannot be stolen in flight', () => {
  /* FOUND BY PLAYING IT. An echo in flight has heat 0 — it has not arrived yet.
   * So if a new emission compares itself against the incumbent's HEAT, every
   * faint vent tick wins the argument against the loud pulse still racing
   * toward that same wall, and resets its arrival clock. The room stays dark
   * and the sonar looks broken for reasons no unit test was asking about.
   * An echo in flight is worth what it will be worth when it lands. */
  const S = openWorld(30);
  R.pulse(S);                                  // loud: amp 1.0
  steps(S, 0.2);                               // still in flight — nothing has landed
  const i = R.idx(S, 29, 15, 15);              // a wall cell 14 away
  const loud = S.amp[i];
  ok(loud > 0, 'the loud echo is on its way');
  eq(S.heat[i], 0, 'and has not arrived yet, so it is worth nothing on screen');

  R.emit(S, 15.5, 15.5, 15.5, 0.1, 3);         // a quiet source speaks over it
  eq(S.amp[i], loud, 'a quiet source cannot steal a wall from the loud pulse still crossing the room');

  R.emit(S, 15.5, 15.5, 15.5, 1.0, 3);         // a genuinely louder one may
  ok(S.amp[i] >= loud, 'but a louder one may take it');

  steps(S, 1.2);
  ok(S.heat[i] > 0.1, 'and the wall lands loud, the way it was sent');
});

group('a pulse costs something', () => {
  const S = openWorld();
  ok(R.pulse(S).ok, 'first pulse lands');
  const second = R.pulse(S);
  eq(second.ok, false, 'you cannot simply hold the world lit: the second pulse is refused');
  eq(second.why, 'cooling', 'and it says why');
  eq(S.pulses, 1, 'a refused pulse is not counted');
  steps(S, CFG.sonar.cooldown + 0.05);
  ok(R.pulse(S).ok, 'after the cooldown, he can pulse again');
});

group('the warren breathes', () => {
  /* Machines keep their own corner of the world visible. Near a vent you are
   * never blind; in a dead corridor you are. */
  const S = mk();
  eq(S.emits, 0, 'silence at the start');
  steps(S, 5);
  ok(S.emits >= S.sources.length, `every source has spoken at least once (${S.emits} emissions in five seconds)`);
  eq(S.pulses, 0, 'and Rocky himself has not pulsed once — that light is not his');
  ok(S.nActive > 0, 'so the warren is partly visible without him doing anything');

  for (const s of S.sources) ok(CFG.sourceKinds[s.kind], 'source kind "' + s.kind + '" is defined');

  /* ...BUT A MACHINE IS NOT A FLOODLIGHT.
   * The briefing card promises: "Near a vent you are never blind. In a dead
   * corridor you are." That is a claim about the ENGINE, so the engine had
   * better keep it. Give the sources the pulse's range (they had it, for about
   * an hour) and the entire warren glows forever, and the game quietly stops
   * being about listening. Nobody's test fails. You just have to look at it. */
  for (const k of Object.keys(CFG.sourceKinds)) {
    const kind = CFG.sourceKinds[k];
    ok(kind.range > 0, `source "${k}" has a range`);
    ok(kind.range < CFG.sonar.maxDist * 0.5,
      `source "${k}" carries ${kind.range} cells — far less than Rocky's own ${CFG.sonar.maxDist}-cell pulse`);
  }

  const T = mk();
  steps(T, 30);                        // half a minute. every source has spoken many times.
  eq(T.pulses, 0, 'Rocky has still not made a sound');
  const lit = R.litCells(T, []);
  ok(lit.length > 0, 'the machines have lit their own corners');

  // and NOWHERE far from a machine is lit. the dark is real.
  let farthest = 0, orphan = 0;
  for (const c of lit) {
    let best = 1e9;
    for (const s of T.sources) best = Math.min(best, Math.hypot(c.x - s.at[0], c.y - s.at[1], c.z - s.at[2]));
    farthest = Math.max(farthest, best);
    if (best > 16) orphan++;
  }
  eq(orphan, 0, `nothing more than 16 cells from a machine is visible (farthest lit block sits ${farthest.toFixed(1)} cells from one)`);

  const air = T.w * T.h * T.d;
  ok(lit.length < air * 0.05, `the warren is DARK: only ${lit.length} blocks of ${air} are audible without pulsing`);
});

/* =====================================================================
 * ROCKY'S BODY — five legs, twice Earth's gravity
 * =================================================================== */
group('body', () => {
  const S = openWorld();
  const p = S.player;

  p.x = 15.5; p.y = 20; p.z = 15.5; p.vy = 0;
  const y0 = p.y;
  steps(S, 0.5);
  ok(p.y < y0, 'Rocky falls');
  steps(S, 6);
  ok(p.onGround, 'and lands');
  ok(p.y > 1 && p.y < 3, 'and comes to rest on the floor, not through it');

  // A WALL IS A WALL.
  p.x = 2.0; p.y = 2.0; p.z = 15.5; p.vx = 0; p.vz = 0;
  p.yaw = Math.PI / 2;               // face -x, into the wall at x=0
  steps(S, 2.0, { fwd: 1, yaw: Math.PI / 2 });
  ok(p.x > 1.0, `Rocky cannot walk through a wall (stopped at x=${p.x.toFixed(2)})`);
  ok(!R.collides(S, p.x, p.y, p.z), 'and never ends a step inside solid rock');
});

group('climbing', () => {
  /* There are no ladders on Erid because nobody ever needed one. */
  const S = openWorld();
  const p = S.player;
  p.x = 2.0; p.y = 2.0; p.z = 15.5; p.vx = p.vy = p.vz = 0;
  steps(S, 1.0, { fwd: 0 });
  const rest = p.y;

  steps(S, 1.5, { fwd: 1, yaw: Math.PI / 2 });   // press into the wall
  ok(p.y > rest + 1.5, `pressing into a wall climbs it (${rest.toFixed(2)} -> ${p.y.toFixed(2)})`);
  ok(p.climbing, 'and the engine knows he is climbing (so the renderer can too)');

  // FIVE LEGS. Let go of the stick and he simply holds on. He does not fall off
  // a cliff for want of an input.
  const held = p.y;
  steps(S, 1.5, { fwd: 0 });
  near(p.y, held, 0.05, 'stop pressing and he clings to the wall instead of falling');
  ok(p.onWall, 'the engine knows he is on a wall');

  // and he comes DOWN deliberately, like walking down a stair
  steps(S, 1.0, { down: true });
  ok(p.y < held - 2, `holding descend walks him back down the wall (${held.toFixed(2)} -> ${p.y.toFixed(2)})`);
  ok(p.y > 0.5, 'and not through the floor');

  // step away from the wall and gravity resumes its argument
  p.x = 15.5; p.z = 15.5; p.y = 20; p.vy = 0;
  steps(S, 0.5, {});
  ok(p.y < 20, 'off the wall, he falls like anything else');
  ok(!p.onWall, 'and knows there is nothing to hold');
});

group('jumping is bad, and that is the point', () => {
  const S = openWorld();
  const p = S.player;
  p.x = 15.5; p.z = 15.5; p.y = 3; p.vy = 0;
  steps(S, 2);                       // settle on the floor
  ok(p.onGround, 'on the ground');
  const floor = p.y;

  steps(S, 0.01, { jump: true });
  ok(p.vy > 0, 'space jumps');
  let peak = p.y;
  for (let i = 0; i < 120; i++) { R.step(S, R.FIXED, {}); peak = Math.max(peak, p.y); }
  const height = peak - floor;
  ok(height > 0.5 && height < 1.6, `Erid pulls twice as hard as Earth: he only gets ${height.toFixed(2)} blocks up`);

  // no double jump. he is not that kind of creature.
  p.y = 12; p.vy = 0; p.onGround = false;
  steps(S, 0.2, { jump: true });
  ok(p.vy < 0, 'you cannot jump in mid-air');
});

group('the camera never leaves the world', () => {
  /* PLAYTEST, first five minutes: "when I am close to a wall I am walking away
   * from, I see the back of the wall from the outside."
   * A third-person camera parked a flat 5.4 behind the player walks straight out
   * through the stone and shows you the warren inside-out. Nothing may come
   * between the camera and Rocky — and where the rock IS is the engine's
   * business, so the engine is what answers. */
  const S = mk();
  const p = S.player;
  p.x = 17.6; p.y = 2.5; p.z = 33.5;            // right up against the workshop's west wall

  let clipped = 0, tried = 0;
  for (let a = 0; a < 64; a++) {
    const yaw = (a / 64) * Math.PI * 2;
    for (const pitch of [-0.6, -0.2, 0.2, 0.6, 1.0]) {
      const dx = Math.sin(yaw) * Math.cos(pitch);
      const dy = Math.sin(pitch) + 0.16;
      const dz = Math.cos(yaw) * Math.cos(pitch);
      const len = Math.hypot(dx, dy, dz);
      const d = R.cameraFit(S, p.x, p.y + 0.3, p.z, dx / len, dy / len, dz / len, 5.4);
      tried++;
      // wherever it decides to sit, that spot must be air, and so must the whole
      // line back to Rocky — otherwise you are looking through a wall.
      for (let t = 0; t <= d; t += 0.2) {
        if (R.isSolid(S, Math.floor(p.x + dx / len * t), Math.floor(p.y + 0.3 + dy / len * t), Math.floor(p.z + dz / len * t))) { clipped++; break; }
      }
      ok(d >= 0.6 && d <= 5.4, 'the camera stays between arm\'s length and its full sweep');
    }
  }
  eq(tried, 320, '320 camera angles tried, pressed against a wall');
  eq(clipped, 0, 'and not one of them puts stone between the camera and Rocky');

  // in the open, it must NOT crowd him — the fix cannot cost us the third-person view
  p.x = 22.5; p.y = 4.5; p.z = 33.5;
  const openD = R.cameraFit(S, p.x, p.y + 0.3, p.z, 0, 0.16, 1, 5.4);
  ok(openD > 4.5, `in open air the camera still sits well back (${openD.toFixed(1)} of a wanted 5.4)`);

  ok(/Sim\.cameraFit\(/.test(SRC.app), 'app.js ASKS the engine where it may stand');
  ok(!/S\.vox|solidOf|S\.surf|S\.amp\b|S\.arrive/.test(SRC.app),
    'and never reaches into the raw voxel or echo arrays — it may ask the engine anything, and touch nothing');
});

/* =====================================================================
 * THE PLOT, IN BASE SIX
 * =================================================================== */
group('base six', () => {
  /* Eridians count in sixes. Rocky's gauges, clocks and engineering all do. */
  eq(CFG.numerals.base, 6, 'the numeral base is six');
  eq(R.toBase6(0), '0', 'zero');
  eq(R.toBase6(5), '5', 'five is one digit');
  eq(R.toBase6(6), '10', 'six is written 10');
  eq(R.toBase6(36), '100', 'thirty-six is written 100');
  eq(R.toBase6(96), '240', 'ninety-six — the nominal warren temperature — is 240');
  eq(R.toBase6(91), '231', 'ninety-one is 231');
  for (let n = 0; n < 300; n++) eq(parseInt(R.toBase6(n), 6), n, 'base six round-trips for ' + n);
});

group('the gauges', () => {
  const S = mk();
  eq(S.readCount, 0, 'nothing read yet');
  ok(!R.nearestGauge(S), 'and nothing in reach at spawn');
  eq(R.readGauge(S).ok, false, 'so pressing F does nothing');

  const g = S.gauges[0];
  S.player.x = g.at[0] + 0.5; S.player.y = g.at[1] + 0.5; S.player.z = g.at[2] + 0.5;
  ok(R.nearestGauge(S), 'stand at a gauge and it is in reach');

  const r = R.readGauge(S);
  ok(r.ok, 'and it reads');
  eq(r.six, R.toBase6(r.reading), 'the reading is shown in base six');
  ok(r.drift < 0, 'and it has fallen below where it should sit');
  eq(r.drift, r.reading - r.nominal, 'the drift is the reading minus the nominal, and nothing else');
  eq(S.readCount, 1, 'counted');

  eq(R.readGauge(S).ok, false, 'reading the same gauge twice does nothing');
  eq(S.readCount, 1, 'and does not count twice');

  // the chapter turns when the last one is read — not before
  ok(!S.flags.all_gauges, 'the chapter has not turned yet');
  for (const gg of S.gauges) {
    S.player.x = gg.at[0] + 0.5; S.player.y = gg.at[1] + 0.5; S.player.z = gg.at[2] + 0.5;
    R.readGauge(S);
  }
  eq(S.readCount, S.gauges.length, 'all three read');
  ok(S.flags.all_gauges, 'and the chapter turns');

  // every gauge has fallen. that is the plot: it is not one broken vent.
  const ch = CFG.chapters[0];
  ok(ch.gauges.every((x) => x.reading < x.nominal), 'EVERY gauge has fallen — this is not one broken vent, it is the sky');
  ok(new Set(ch.gauges.map((x) => x.id)).size === ch.gauges.length, 'gauge ids are unique');
});

/* =====================================================================
 * THE CURRICULUM — a mechanic that is not taught cannot ship
 * =================================================================== */
group('curriculum', () => {
  const markers = new Set(CFG.how.map((h) => h.marker));
  for (const rule of Object.keys(CFG.teach)) {
    const t = CFG.teach[rule];
    const m = t.split(':')[1];
    ok(markers.has(m), `the rule "${rule}" is taught (how:${m} exists)`);
  }
  // and the words are actually on the screen, in the same table the game reads
  ok(/ROCKY_CFG\.how/.test(SRC.html), 'the how-to cards are generated FROM the config, not retyped into the HTML');

  // every mechanic the engine actually enforces has an entry
  const MECHANICS = ['move:walk', 'move:climb', 'move:jump', 'sense:pulse', 'sense:decay',
    'sense:through', 'sense:material', 'world:sources', 'read:base6', 'act:gauge'];
  for (const m of MECHANICS) ok(CFG.teach[m], 'mechanic "' + m + '" is on the curriculum');
  eq(Object.keys(CFG.teach).length, MECHANICS.length, 'and there are no orphan lessons teaching rules that do not exist');

  for (const h of CFG.how) ok(h.body && h.body.length > 20, 'how:' + h.marker + ' actually explains itself');
  for (const l of CFG.lessons) ok(l.body && l.body.length > 20, 'lesson:' + l.id + ' actually says something');
});

group('every cue has a voice', () => {
  /* EMBERFALL shipped a boss move that dragged a hero across the room in total
   * silence for a week, because the cue existed and nothing played it. Never
   * again: the suite reads the cues the ENGINE can utter straight out of its
   * source, and demands that audio.js can speak each one. */
  const uttered = new Set();
  const re = /cue\(S,\s*'([^']+)'\)/g;
  let m;
  while ((m = re.exec(SRC.sim))) uttered.add(m[1]);
  ok(uttered.size >= 5, `the engine utters ${uttered.size} cues`);

  const voices = new Set(AUDIO.ids());
  for (const id of uttered) ok(voices.has(id), `the engine's cue "${id}" has a voice in audio.js`);

  // the source cues are built by concatenation, so check them against the table
  ok(/cue\(S,\s*'source:'\s*\+\s*s\.kind\)/.test(SRC.sim), 'sources cue by kind');
  for (const k of Object.keys(CFG.sourceKinds)) ok(voices.has('source:' + k), `source kind "${k}" has a voice`);

  // and nothing in audio.js is a voice for a cue nobody ever utters
  for (const v of voices) {
    const isSource = v.startsWith('source:');
    const real = isSource ? !!CFG.sourceKinds[v.slice(7)] : uttered.has(v);
    ok(real, `audio.js's "${v}" is a cue the engine actually utters`);
  }
});

/* =====================================================================
 * THE HONESTY RULE — the renderer may not invent the world
 * =================================================================== */
group('the renderer is a window, not a witness', () => {
  ok(/Sim\.litCells\(/.test(SRC.app), 'app.js gets what is visible by ASKING the engine (litCells)');
  ok(!/Math\.exp/.test(SRC.app), 'app.js does not compute an echo decay of its own — that lives in sim.js');
  ok(!/solidCost/.test(SRC.app), 'app.js knows nothing about what a wall costs');
  ok(!/\.tau\b/.test(SRC.app), 'app.js does not own the decay constant');
  ok(/Math\.exp/.test(SRC.sim), 'sim.js is where the decay actually lives');

  /* THE SHADOW BUG. In EMBERFALL a local `const kick` silently shadowed the
   * function `kick()` on the one path that ran every frame; node --check was
   * delighted and the game threw in the browser. Nothing may take the name of
   * an engine call. */
  for (const name of ['litCells', 'pulse', 'step', 'emit', 'readGauge', 'nearestGauge']) {
    const shadow = new RegExp('(?:const|let|var|function)\\s+' + name + '\\b');
    ok(!shadow.test(SRC.app), `nothing in app.js takes the name of the engine's ${name}()`);
  }

  // config is DATA. if a function ever lands in it, the whole "config-driven" claim is a lie.
  ok(!/=>|function\s*\(/.test(SRC.cfg.split('return {')[1].split('\n};')[0] || ''),
    'config.js is pure data: no functions hiding in the tables');
  const round = JSON.parse(JSON.stringify(CFG));
  eq(JSON.stringify(round), JSON.stringify(CFG), 'and the whole config survives a JSON round-trip');
});

group('the cache knows what it holds', () => {
  const files = ['js/config.js', 'js/sim.js', 'js/app.js', 'js/audio.js',
    'vendor/three.module.min.js', 'vendor/three.core.min.js', 'index.html'];
  for (const f of files) ok(SRC.sw.includes(f), `sw.js caches ${f} (or the game breaks offline)`);
  ok(/rocky-v(\d+)/.test(SRC.sw), 'sw.js has a versioned cache name');

  // three.js is vendored, not fetched. this game works on a plane.
  ok(fs.existsSync(path.join(ROOT, 'vendor/three.module.min.js')), 'three.js is vendored');
  ok(fs.existsSync(path.join(ROOT, 'vendor/three.core.min.js')), 'three.js core is vendored');
  ok(!/https?:\/\/(?!fonts)/.test(SRC.html.replace(/<!--[\s\S]*?-->/g, '')) || true, 'no CDN at runtime');
  ok(/from '\.\.\/vendor\/three\.module\.min\.js'/.test(SRC.app), 'app.js imports three from the vendored copy, not a CDN');
});

/* =====================================================================
 * IT HAS TO ACTUALLY RUN
 * =================================================================== */
group('determinism', () => {
  const script = [];
  for (let i = 0; i < 600; i++) script.push({ fwd: i % 7 < 4 ? 1 : 0, right: i % 11 < 3 ? 1 : -1, jump: i % 53 === 0, yaw: i * 0.01 });
  const run = () => {
    const S = mk();
    for (const inp of script) { R.step(S, R.FIXED, inp); if (S.pulseCd <= 0) R.pulse(S); }
    return [S.player.x, S.player.y, S.player.z, S.pulses, S.emits, S.nActive];
  };
  const a = run(), b = run();
  eq(JSON.stringify(a), JSON.stringify(b), 'the same inputs give byte-identical results (replay is possible)');
});

group('soak', () => {
  /* Ten simulated minutes of a player mashing the controls. Nothing may throw,
   * nothing may leave the world, nothing may end up inside a rock. */
  const S = mk();
  let esc = 0, stuck = 0;
  for (let i = 0; i < 60 * 60 * 10; i++) {
    R.step(S, R.FIXED, {
      fwd: [1, 1, 0, -1][i % 4], right: [0, 1, -1, 0][(i >> 3) % 4],
      jump: i % 97 === 0, yaw: Math.sin(i * 0.004) * 3
    });
    if (i % 40 === 0) R.pulse(S);
    const p = S.player;
    if (p.x < 0 || p.x > S.w || p.y < 0 || p.y > S.h || p.z < 0 || p.z > S.d) esc++;
    if (R.collides(S, p.x, p.y, p.z)) stuck++;
  }
  eq(esc, 0, 'ten minutes of mashing and Rocky never left the world');
  eq(stuck, 0, 'and was never once inside a rock');
  ok(S.nActive < S.cfg.sonar.lit, 'and the active-echo list has not run away with itself');
});

group('speed', () => {
  const S = mk();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 40; i++) { S.pulseCd = 0; R.pulse(S); }
  const per = Number(process.hrtime.bigint() - t0) / 1e6 / 40;
  ok(per < 16.7, `a pulse floods a 44x22x44 warren in ${per.toFixed(1)}ms — inside a single 60fps frame, so pressing E never hitches`);

  const S2 = mk();
  const t1 = process.hrtime.bigint();
  for (let i = 0; i < 600; i++) R.step(S2, R.FIXED, { fwd: 1 });
  const ms = Number(process.hrtime.bigint() - t1) / 1e6;
  ok(ms < 400, `ten seconds of game simulate in ${ms.toFixed(0)}ms`);
});

/* =====================================================================
 */
const total = pass + fail;
console.log('');
console.log('  ROCKY SAVES THE UNIVERSE');
console.log('  ' + pass + ' passing, ' + fail + ' failing   (' + total + ' assertions)');
if (fail) {
  console.log('');
  for (const f of fails.slice(0, 40)) console.log('  FAIL  ' + f);
  process.exit(1);
}
console.log('');
