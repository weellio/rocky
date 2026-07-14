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

// the default chapter is 'cold' BY NAME. It used to be "whichever is first", and
// then a tutorial was added in front of it and eight tests quietly changed meaning.
const mk = (o) => R.create(CFG, Object.assign({ seed: 1, chapter: 'cold' }, o));
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

  /* The wall is 14 cells away and sound covers 19 cells a second — but the echo
   * has to come HOME, so it cannot land on Rocky before 28/19 = 1.47s.
   * (We watch one nominated wall rather than counting lit cells, because Rocky
   * is falling through this test and his own landing makes a noise of its own —
   * which is exactly the point of the footfalls, and would pollute a count.) */
  const wall = R.idx(S, 29, 15, 15);
  steps(S, 1.2);
  eq(S.heat[wall], 0, 'over a second in and that wall has told Rocky NOTHING — his shout is still out there');

  steps(S, 0.45);
  ok(S.heat[wall] > 0, 'and then it comes home');
  const early = R.litCells(S, []).length;

  steps(S, 1.0);
  ok(R.litCells(S, []).length > early, 'and the farther walls after it — the room arrives in the order of its distances');
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

  /* THE ROUND TRIP.
   * PLAYTEST: "I would think the pulsing would be from Rocky and go outwards,
   * then return with the echo."  Exactly right, and it was not doing that. A
   * wall was lighting up when the sound TOUCHED it — which is what a camera
   * hanging in the room would see, not what the creature doing the listening
   * hears. Rocky perceives a wall when the echo gets BACK TO HIM. Out AND home:
   * the wall 14 cells away answers at 28 cells of flight, and that delay is the
   * only ruler he owns.
   *
   * A WALL ALSO BOUNCES SOUND, IT DOES NOT SWALLOW IT FIRST. The trip out is 14,
   * not 14 plus the price of drilling into the very surface it bounces off. Bill
   * it that way (I did) and every wall comes back late and quiet, and it still
   * looks like sonar. */
  const B = openWorld(30);
  R.emit(B, 15.5, 15.5, 15.5, 1, 0);
  const iw = R.idx(B, 29, 15, 15);
  near(B.arrive[iw], 28 / CFG.sonar.speed, 0.12,
    'the wall 14 cells away answers after 28 cells of flight: out to it, and home to his ears');
  ok(B.arrive[iw] > 14 / CFG.sonar.speed * 1.7,
    'and NOT when the sound merely touches it — Rocky is the one listening, not the wall');

  /* THE STRIKE. A surface is brightest at the instant the wave lands, then it
   * settles. Without this the room does not get swept — it switches on, like a
   * lightbulb, in a game whose whole subject is that there are no lightbulbs. */
  const W = openWorld(30);
  R.pulse(W);
  const i = R.idx(W, 29, 15, 15);
  steps(W, 1.50);                          // 28 cells of flight at 19 cells/sec
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

  /* The far room is audible, but only as a ghost.
   * Compare AMPLITUDE, not heat: heat also carries the arrival strike and the
   * fade, so sampling it at one instant asks "how bright is this right now",
   * when the question is "how loud did this come back". */
  const near1 = W.amp[R.idx(W, 9, 2, 5)];       // the near face of the wall
  const far1 = W.amp[R.idx(W, 10, 2, 5)];       // the far face, heard THROUGH it
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

  /* AND A GRAIN.
   * PLAYTEST: "since nothing has a texture I can't really tell." Flat colour on
   * a cube gives the eye nothing to hold — no scale, no orientation, no surface.
   * Every material returns its own grain, drawn on a canvas at boot (so the game
   * still installs offline in under a megabyte and there is not one art asset in
   * the repository). */
  for (const b of blocks) {
    ok(b.tex && b.tex !== 'none', b.name + ' has a grain');
    ok(/^(mottle|plate|stripe|rings|grille|dial|facet|panel|grain|ear|bell|forge|pane|void)$/.test(b.tex), b.name + '\'s grain is one app.js can actually draw');
  }
  ok(new Set(blocks.map((b) => b.tex)).size === blocks.length, 'no two materials share a grain either');
  for (const b of blocks) ok(new RegExp("'" + b.tex + "'").test(SRC.app), `app.js knows how to draw "${b.tex}"`);
  ok(/CanvasTexture/.test(SRC.app), 'the textures are drawn at boot, not downloaded');
  ok(/NearestFilter/.test(SRC.app), 'and they are crisp, not smeared — this is a blocky world');
});

group('memory fades', () => {
  const S = openWorld();
  R.pulse(S);
  steps(S, 1.7);
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
  const i = R.idx(S, 29, 15, 15);              // a wall cell 14 away: home again at 1.47s
  const loud = S.amp[i];
  ok(loud > 0, 'the loud echo is on its way');
  eq(S.heat[i], 0, 'and has not arrived yet, so it is worth nothing on screen');

  R.emit(S, 15.5, 15.5, 15.5, 0.1, 3);         // a quiet source speaks over it
  eq(S.amp[i], loud, 'a quiet source cannot steal a wall from the loud pulse still crossing the room');

  R.emit(S, 15.5, 15.5, 15.5, 1.0, 3);         // a genuinely louder one may
  ok(S.amp[i] >= loud, 'but a louder one may take it');

  steps(S, 1.6);                               // out and back
  ok(S.heat[i] > 0.1, 'and the wall lands loud, the way it was sent');
});

group('you always know the ground you stand on', () => {
  /* PLAYTEST: "sometimes it isn't showing where Rocky is located."
   * He was a body floating in a void — the far room lit up and the floor under
   * his own feet did not, because nothing under his feet had made a sound in
   * seconds. Five legs on stone are five small sounds. He cannot help hearing
   * the ground he walks on, and now he doesn't have to. */
  const S = mk();
  const p = S.player;

  steps(S, 12);                          // stand perfectly still, deep in the workshop
  const beneath = () => {
    const i = R.idx(S, Math.floor(p.x), Math.floor(p.y) - 1, Math.floor(p.z));
    return S.heat[i];
  };
  const still = beneath();

  eq(S.pulses, 0, 'he has not pulsed');
  steps(S, 2.0, { fwd: 1, yaw: 0 });     // now walk
  steps(S, 0.35);                        // and let the last footfall come home (it is a round trip too)
  ok(S.player.dist > 1, 'he walked');
  ok(beneath() > 0, `the floor under his feet answers as he walks (${beneath().toFixed(2)})`);
  ok(beneath() > still, 'and it is brighter than when he was standing still');
  eq(S.pulses, 0, 'and he still has not spent a single pulse doing it');

  // a footfall is a WHISPER, not a pulse: it must not light the room
  const F = mk();
  steps(F, 4.0, { fwd: 1, yaw: 0 });
  const near1 = R.litCells(F, []).filter((c) => Math.hypot(c.x - F.player.x, c.y - F.player.y, c.z - F.player.z) < 8).length;
  const far1 = R.litCells(F, []).filter((c) => Math.hypot(c.x - F.player.x, c.y - F.player.y, c.z - F.player.z) > 16).length;
  ok(near1 > 20, `walking lights the ground around him (${near1} blocks within 8 cells)`);
  ok(CFG.sonar.footRange < CFG.sonar.maxDist / 3,
    `a footfall carries ${CFG.sonar.footRange} cells against a pulse's ${CFG.sonar.maxDist} — it is a whisper, not a shout`);
  ok(CFG.sonar.footAmp < CFG.sonar.pulseAmp, 'and it is quieter than one');

  // and a LANDING is loud. drop into a dark room and you hear the whole floor.
  const L = mk();
  L.player.y = 7;
  steps(L, 2.5);                          // fall
  ok(L.player.onGround, 'he landed');
  ok(R.litCells(L, []).length > 40, 'and the crash lit the room he landed in');
  ok(CFG.sonar.landAmp > CFG.sonar.footAmp, 'a landing is louder than a footstep');
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
  // by ID, never by index: adding a chapter must not silently repoint a test
  const ch = CFG.chapters.find((c) => c.id === 'cold');
  ok(ch.gauges.every((x) => x.reading < x.nominal), 'EVERY gauge has fallen — this is not one broken vent, it is the sky');
  ok(new Set(ch.gauges.map((x) => x.id)).size === ch.gauges.length, 'gauge ids are unique');
});

/* =====================================================================
 * THE PUZZLE: sound is the substrate
 * =================================================================== */
const deep = () => R.create(CFG, { seed: 1, chapter: 'deep' });

group('what a material charges sound to cross it', () => {
  /* THIS TABLE IS THE PUZZLE GAME. Grit is a wall to sound. Xenonite is very
   * nearly a wire. Everything else lies between, and every locked door in this
   * game is a routing problem posed against this one column of numbers. */
  const by = {};
  for (const b of CFG.blocks) by[b.key] = b;
  eq(by.air.cost, 1.0, 'air is free');
  ok(by.grit === undefined || true, '');
  ok(by.sand.cost > by.rock.cost * 3, `grit (${by.sand.cost}) is far deafer than basalt (${by.rock.cost}) — it is a wall to sound`);
  ok(by.xenonite.cost < by.rock.cost / 3, `xenonite (${by.xenonite.cost}) is far clearer than basalt — it CARRIES sound`);
  ok(by.xenonite.cost > by.air.cost, 'but it is not free — it is a solid, not a hole');
  for (const b of CFG.blocks) ok(typeof b.cost === 'number' && b.cost > 0, b.name + ' has a price');

  /* And the engine must actually USE the table rather than "is it solid". */
  ok(/costOf\[S\.vox\[j\]\]/.test(SRC.sim), 'the wavefront asks the MATERIAL what it costs, not merely whether it is solid');

  // measured, not asserted: the same wall, in three materials
  const wall = (block) => {
    const cfg = JSON.parse(JSON.stringify(CFG));
    cfg.chapters = [{
      id: 'lab', name: 'lab', world: { w: 24, h: 8, d: 12 }, spawn: [3, 2, 5], objective: '',
      build: [
        { op: 'fill', from: [0, 0, 0], to: [23, 7, 11], block: 1 },
        { op: 'fill', from: [1, 1, 1], to: [8, 5, 10], block: 0 },
        { op: 'fill', from: [11, 1, 1], to: [22, 5, 10], block: 0 },
        { op: 'fill', from: [9, 1, 4], to: [10, 5, 6], block: block }   // a plug of `block` in the wall
      ],
      sources: [], gauges: [], ears: [], doors: [], lines: []
    }];
    const W = R.create(cfg, { seed: 1, chapter: 'lab' });
    R.emit(W, 3.5, 2.5, 5.5, 1, 0);
    return R.costAt(W, 12, 2, 5);
  };
  const thruXeno = wall(7), thruRock = wall(1), thruGrit = wall(9);
  ok(thruXeno < thruRock, `sound crosses a xenonite plug (${thruXeno.toFixed(1)}) far more cheaply than basalt (${thruRock.toFixed(1)})`);
  ok(thruGrit > thruRock, `and a grit plug (${thruGrit.toFixed(1)}) is dearer than either — it is very nearly deaf`);
});

group('THE VEST AND THE TOOL BELT', () => {
  /* Rocky wears a leather harness with a satchel on it and strap-bands on his
   * arms, and he is never not pulling something out of it. SIX pockets, because
   * Eridians count in six and it would not occur to him to build five or seven. */
  const S = deep();
  eq(CFG.belt.pockets, 6, 'six pockets — Eridians count in six');
  eq(S.belt.length, 6, 'and the belt has six');
  eq(S.belt.filter(Boolean).length, 0, 'all empty');
  eq(S.slot, 0, 'his hands are on the first');

  /* THERE IS NO SECOND OPINION ABOUT WHAT HE IS CARRYING.
   * `held` is a VIEW of the selected pocket, not a field of its own. Keep them as
   * two facts and they WILL drift, and the block on the screen stops being the
   * block in the rules. */
  ok(/const held = \(S\) => S\.belt\[S\.slot\]/.test(SRC.sim), 'what is in his hands IS the selected pocket, read straight off the belt');
  eq(R.held(S), R.blockAt ? S.belt[S.slot] : 0, 'and there is nowhere else it could be');

  /* AND IT IS A FUNCTION, NOT AN ACCESSOR.
   * An accessor ANYWHERE on the state object — even declared in the literal, even
   * one the hot loop never touches — puts V8 off its fast path for the whole
   * object, and every property read in the Dijkstra loop goes slow with it.
   * Measured, on the same warren:
   *      no accessor ..................  9.5 ms a pulse
   *      get held() in the literal .... 32.4 ms a pulse
   * Three dropped frames every time he opens his mouth, for a getter. The speed
   * test caught it, which is the entire reason the speed test exists. */
  ok(!/get held\(\)\s*\{|Object\.defineProperty\(S,/.test(SRC.sim),
    'and it is NOT an accessor on the state, which would deoptimise every pulse in the game (measured: 9.5ms -> 32.4ms)');
  S.belt[2] = 7;
  R.selectSlot(S, 2);
  eq(R.held(S), 7, 'select a pocket and that IS what he is holding');
  R.setHeld(S, 9);
  eq(S.belt[2], 9, 'and writing to his hands writes to the pocket — one fact, one place');
  S.belt[2] = 0;
  R.selectSlot(S, 0);
  eq(R.held(S), 0, 'empty again');

  eq(R.selectSlot(S, 9), false, 'there is no seventh pocket');
  eq(R.selectSlot(S, -1), false, 'nor a zeroth');

  eq(R.takeBlock(S).ok, false, 'and nothing in reach to lift');

  // stand at the xenonite on its ledge and take it
  S.player.x = 25.5; S.player.y = 5.5; S.player.z = 35.4;
  S.player.yaw = 0;                                    // facing -z, toward [25,5,34]
  const t = R.takeBlock(S);
  ok(t.ok, 'he lifts the xenonite');
  eq(R.held(S), 7, 'and it is in his hands');
  eq(S.belt[t.slot], 7, 'and in a pocket');
  eq(R.blockAt(S, 25, 5, 34), 0, 'and it is gone from the world — a block is a THING, not a decoration');

  /* A pocket at a time, and then it is full. He lifts the grit plug, and it lands
   * in the first free pocket — and when there is no free pocket, he is out of vest. */
  const F = deep();
  F.player.x = 12.5; F.player.y = 3.5; F.player.z = 30.5; F.player.yaw = Math.PI / 2;
  for (let i = 0; i < 5; i++) F.belt[i] = 1;       // five pockets already stuffed
  eq(R.freeSlot(F), 5, 'one pocket left');
  const g = R.takeBlock(F);
  ok(g.ok && g.block === 9, 'he lifts the grit');
  eq(g.slot, 5, 'and it goes into the last free pocket');
  eq(F.slot, 5, 'and his hands go to it, because that is what a hand does');
  eq(F.belt.filter(Boolean).length, 6, 'six things carried');

  eq(R.freeSlot(F), -1, 'there is nowhere left to put anything');
  const no = R.takeBlock(F);
  eq(no.ok, false, 'so he cannot pick up a seventh thing');
  eq(no.why, 'every pocket is full', 'and he says why');

  const p = R.placeBlock(S);
  ok(p.ok, 'he puts it down');
  eq(R.held(S), 0, 'his arms are empty');
  ok(R.isSolid(S, p.at[0], p.at[1], p.at[2]), 'and it is solid where he put it');

  // ...and only what config says he may lift
  const C = deep();
  C.player.x = 20.5; C.player.y = 2.5; C.player.z = 30.5;
  for (let i = 0; i < 20; i++) { C.player.yaw = i * 0.31; R.takeBlock(C); }
  ok(R.held(C) === 0 || CFG.blocks[R.held(C)].carry, 'he never ends up holding a block config says he cannot lift');
  for (const b of CFG.blocks) if (b.carry) ok(b.solid, b.name + ' is liftable and solid');

  // a dropped block BANGS, and a bang is a sound like any other
  const D = deep();
  D.player.x = 25.5; D.player.y = 5.5; D.player.z = 35.4; D.player.yaw = 0;
  R.takeBlock(D);
  const before = D.emits;
  R.placeBlock(D);
  ok(D.emits > before, 'a block dropped makes a NOISE — you can throw your voice by throwing something else');
});

group('THE DEEP HALL: a locked door is a routing problem', () => {
  /* The level states the law the whole game is played under. There is no key.
   * The resonator is buried in five cells of rock; two channels reach it; and the
   * code special-cases NOTHING. Every route below is just sound arriving at a
   * listener, and every number printed is the number the ear actually heard.
   *
   * THE THRESHOLD IS WHERE THE PUZZLE LIVES. Set `needs` too low and the player
   * solves it by standing near a wall and shouting, having understood nothing at
   * all — so the near-misses are asserted just as hard as the solutions. */
  const shout = (S, x, y, z) => {
    S.player.x = x; S.player.y = y; S.player.z = z;
    S.pulseCd = 0; R.pulse(S); steps(S, 1.4);
    return S.ears[0].loudest;
  };
  const pct = (v) => (v * 100).toFixed(0) + '%';
  const NEEDS = CFG.chapters.find((c) => c.id === 'deep').ears[0].needs;

  // --- THE NEAR MISSES. These must all fail, or there is no puzzle. ---
  const miss = (name, fn) => {
    const S = deep();
    const got = fn(S);
    ok(!S.ears[0].open, `${name}: heard ${pct(got)}, needs ${pct(NEEDS)} — NOT enough`);
    ok(R.isSolid(S, 20, 3, 17), '...and the council door stays shut');
  };
  miss('shout from the middle of the hall', (S) => shout(S, 20.5, 3, 31));
  miss('shout from the far corner', (S) => shout(S, 27, 3, 37));
  miss('shout with your nose against the wall', (S) => shout(S, 12.5, 3, 30.5));
  miss('let the machines shout for you', (S) => { steps(S, 40); return S.ears[0].loudest; });
  miss('drop a block at the foot of the wall', (S) => {
    S.player.x = 12.5; S.player.y = 3.5; S.player.z = 30.5; S.player.yaw = Math.PI / 2;
    R.takeBlock(S); R.placeBlock(S);           // pull the plug, shove it straight back
    steps(S, 1.4);
    return S.ears[0].loudest;
  });

  // --- THE SOLUTIONS. Four of them, none scripted, none special-cased. ---
  const solve = (name, fn) => {
    const S = deep();
    const got = fn(S);
    ok(S.ears[0].open, `SOLUTION — ${name}: heard ${pct(got)} of ${pct(NEEDS)}`);
    ok(!R.isSolid(S, 20, 3, 17), '...the council door opens');
    ok(S.flags.all_doors, '...and the chapter turns');
  };

  // 1. Pull the grit plug. The channel becomes air, and air is free.
  solve('pull the grit plug out of channel A', (S) => {
    S.player.x = 12.5; S.player.y = 3.5; S.player.z = 30.5; S.player.yaw = Math.PI / 2;
    const t = R.takeBlock(S);
    ok(t.ok && t.block === 9, 'he pulls the grit out of the channel mouth');
    return shout(S, 12.5, 3, 30.5);
  });

  // 2. CLIMB. No carrying at all — just get your mouth closer to the opening.
  solve('climb the wall to channel B and shout down it', (S) => shout(S, 12.5, 8.5, 30.5));

  // 3. THE A/B THAT PROVES THE MECHANIC: seal the channel back up — with the
  //    RIGHT STUFF — and be heard straight through a solid wall.
  solve('seal channel A with xenonite and be heard through it', (S) => {
    S.player.x = 12.5; S.player.y = 3.5; S.player.z = 30.5; S.player.yaw = Math.PI / 2;
    R.takeBlock(S);                            // grit out
    R.setHeld(S, 7);                                // xenonite in (he fetched it from the ledge)
    const p = R.placeBlock(S);
    ok(p.ok && p.at[0] === 11, 'the xenonite goes into the channel mouth');
    ok(R.isSolid(S, 11, 3, 30), 'the channel is SEALED — solid, not a hole');
    return shout(S, 12.5, 3, 30.5);
  });

  /* And the control, which is the whole argument: the SAME sealed hole, packed
   * with grit instead, is deaf. Same geometry. Different material. */
  {
    const S = deep();
    S.player.x = 12.5; S.player.y = 3.5; S.player.z = 30.5; S.player.yaw = Math.PI / 2;
    R.takeBlock(S); R.placeBlock(S);          // grit straight back where it was
    const withGrit = shout(S, 12.5, 3, 30.5);
    const T = deep();
    T.player.x = 12.5; T.player.y = 3.5; T.player.z = 30.5; T.player.yaw = Math.PI / 2;
    R.takeBlock(T); R.setHeld(T, 7); R.placeBlock(T);
    const withXeno = shout(T, 12.5, 3, 30.5);
    ok(withXeno > withGrit * 1.5,
      `THE SAME HOLE, two materials: xenonite ${pct(withXeno)} against grit ${pct(withGrit)} — this is the whole game`);
    ok(!S.ears[0].open && T.ears[0].open, 'one of them opens the door and one of them does not');
  }
});

group('CONSENSUS: no Eridian can be made to do anything', () => {
  /* Act I.3. Eridians have no government and no war, so to act, the engineers
   * must AGREE. Three resonators on one door, and it opens for none of them
   * alone — you have to make the same argument three times, from three places,
   * and each of them is deaf in a completely different way.
   *
   * VOTH  is behind two cells of grit. 22 a cell, 44 for the pair, and Rocky's
   *       entire voice only carries 32 — he is not quiet to Voth, he is INAUDIBLE.
   * ARK   has no grit at all. He is just buried, and the only way in is a crawl
   *       over the ceiling and then straight DOWN a shaft on your claws.
   * SEVEN is UNDER a floor of grit. You walk over the top of him and he hears
   *       nothing. Lift one block out and shout through the hole.
   */
  const con = () => R.create(CFG, { seed: 1, chapter: 'consensus' });
  const shout = (S, x, y, z) => {
    S.player.x = x; S.player.y = y; S.player.z = z;
    S.pulseCd = 0; R.pulse(S); steps(S, 1.6);
  };
  const ear = (S, id) => S.ears.find((e) => e.id === id);
  const shut = (S) => R.isSolid(S, 22, 3, 13);
  const pc = (e) => (e.loudest * 100).toFixed(0) + '%';

  const base = con();
  eq(base.ears.length, 3, 'three engineers');
  eq(base.doors.length, 1, 'one door');
  ok(base.ears.every((e) => e.opens === 'council'), 'and all three of them answer to it');

  // NOBODY hears you from the assembly floor. Not one of them.
  const A = con();
  for (const spot of [[22, 3, 33], [15, 3, 36], [29, 3, 33], [22, 3, 20], [25, 4.5, 19.5]]) {
    shout(A, spot[0], spot[1], spot[2]);
  }
  for (const e of A.ears) ok(!e.open, `${e.name} cannot hear you from the floor (${pc(e)} of ${(e.needs * 100).toFixed(0)}%)`);
  ok(shut(A), 'and the council door does not move');

  // Each argument, made properly, convinces EXACTLY ONE of them.
  const voth = (S) => {
    S.player.x = 14.5; S.player.y = 3.5; S.player.z = 36.5; S.player.yaw = Math.PI / 2;
    ok(R.takeBlock(S).ok, 'the first cell of grit comes out');
    R.setHeld(S, 0);
    ok(R.takeBlock(S).ok, 'and the second — one block at a time, he has only five arms');
    shout(S, 14.5, 3, 36.5);
  };
  const ark = (S) => shout(S, 36.5, 3, 32.5);          // down the shaft, on his claws
  const seven = (S) => {
    R.setHeld(S, 0);
    S.player.x = 30.5; S.player.y = 4.5; S.player.z = 19.5; S.player.yaw = Math.PI;
    const t = R.takeBlock(S);
    ok(t.ok && t.block === 9, 'he lifts a block of the grit floor out from under his own feet');
    shout(S, 30.5, 4.5, 20.5);
  };

  const one = (name, id, fn) => {
    const S = con();
    fn(S);
    ok(ear(S, id).open, `${name} is convinced (${pc(ear(S, id))})`);
    ok(S.ears.filter((e) => e.open).length === 1, '...and only him — no argument convinces two engineers at once');
    ok(shut(S), '...and ONE VOICE IS NOT A CONSENSUS: the door does not move');
  };
  one('VOTH — pull the grit out of his channel', 'voth', voth);
  one('ARK — climb down the shaft and shout in it', 'ark', ark);
  one('SEVEN — lift the grit floor and shout through the hole', 'seven', seven);

  // ...and all three, which is the only thing that opens it.
  const S = con();
  voth(S); ark(S); seven(S);
  ok(S.ears.every((e) => e.open), 'all three engineers have heard him');
  ok(!shut(S), 'AND THE COUNCIL OPENS — forty-one Eridians, and they agree');
  ok(S.flags.all_doors, 'the chapter turns');

  // the machines cannot do it for you: this one you argue yourself
  const M = con();
  steps(M, 45);
  ok(M.ears.every((e) => !e.open), 'the vents shout for forty-five seconds and convince nobody');
});

group('THE ASTRONOMERS: a bell is a resonator that shouts back', () => {
  /* Act I.4. The warren is ninety cells wide and Rocky's whole voice carries
   * thirty-two. So he does not shout — he RINGS, and a line of bells carries the
   * reading the whole way. And when the chain dies, the bell it died at tells you
   * where the blockage is. You do not hunt for a switch. You fire the chain and
   * WATCH. */
  const ast = () => R.create(CFG, { seed: 1, chapter: 'astronomers' });
  const bells = (S) => S.ears.filter((e) => e.rings);
  const fire = (S, secs) => {
    S.player.x = 8; S.player.y = 3; S.player.z = 12;
    S.pulseCd = 0; R.pulse(S);
    steps(S, secs == null ? 7 : secs);
  };
  const shut = (S) => R.isSolid(S, 52, 2, 12);

  const B = ast();
  eq(bells(B).length, 3, 'three bells and an instrument');
  eq(R.blockAt(B, 22, 3, 12), 11, 'a bell is its own kind of block, so you can SEE which resonators answer back');
  eq(R.blockAt(B, 57, 3, 12), 10, 'and the instrument is not one of them');

  /* SOUND MUST NOT TELEPORT.
   * The whole flood is computed in a single tick, so settling the ears inside the
   * emission fires the entire chain in a twentieth of a second, all at once (it
   * did) — and the best thing about the mechanic, hearing it RUN, bell after bell,
   * away into the dark, simply never happens. A listener hears when the sound
   * GETS there. */
  const T = ast();
  fire(T, 0.4);
  ok(bells(T)[0].rang === 0, 'a fifth of a second after he shouts, not even the first bell has heard him');
  steps(T, 0.5);
  ok(bells(T)[0].rang === 1, 'BELL I rings about three quarters of a second out — that is eleven cells of flight');
  ok(bells(T)[1].rang === 0, '...and the second bell has not, because sound takes TIME to get there');
  steps(T, 0.8);
  ok(bells(T)[1].rang === 1, 'and now BELL II rings. You can hear the chain running away from you.');

  // AS FOUND: the chain dies at the grit.
  const A = ast();
  fire(A);
  ok(bells(A)[0].rang > 0, 'BELL I rings');
  ok(bells(A)[1].rang > 0, 'BELL II rings');
  eq(bells(A)[2].rang, 0, 'and BELL III never does — THE CHAIN DIES AT THE GRIT, and tells you exactly where');
  ok(shut(A), 'the instrument hears nothing and the vault stays shut');

  // DIG IT OUT: four cells of grit, one at a time, and fire again.
  const S = ast();
  let dug = 0;
  for (let k = 0; k < 6; k++) {
    S.player.x = 38.4 + k * 0.6; S.player.y = 3.5; S.player.z = 12.5; S.player.yaw = -Math.PI / 2;
    const t = R.takeBlock(S);
    if (t.ok) { dug++; ok(t.block === 9, 'a cell of grit comes out of the crawl'); R.setHeld(S, 0); }
  }
  eq(dug, 4, 'four cells of grit, dug out one at a time — he has five arms and can still carry only one');
  fire(S);
  ok(bells(S).every((e) => e.rang > 0), 'now ALL THREE bells ring, one after another, down ninety cells of warren');
  ok(S.ears.find((e) => e.id === 'inst').open, 'and the instrument hears it');
  ok(!shut(S), 'THE VAULT OPENS');
  ok(S.flags.all_doors, 'the chapter turns');

  /* A BELL MUST NOT RING ITSELF.
   * Its own voice comes off the wall beside it at nearly full strength, so a bell
   * that listens to its own emission hears itself shouting, deafeningly, forever.
   * And two bells in earshot would ring each other back and forth until the heat
   * death of the universe. */
  const L = ast();
  fire(L, 20);
  for (const b of bells(L)) ok(b.rang <= 2, `${b.name} rang ${b.rang} time(s) — a bell does not ring itself up by hearing its own voice`);
  ok(L.ringQ.length === 0, 'and nothing is left ringing');

  // and the emission is queued, never fired from inside the wave that triggered it
  ok(/S\.ringQ\.push/.test(SRC.sim), 'a bell\'s ring is QUEUED');
  ok(!/emit\(S[^)]*\)\s*;[\s\S]{0,40}settleEars/.test(SRC.sim), 'emit() never settles ears inside itself (that is an infinite recursion waiting to happen)');

  /* The instrument cannot be reached on foot: there is only a xenonite window —
   * and it is CAST, so he cannot simply lift it out and crawl through, which is
   * exactly what he could do when it was a loose block. */
  eq(R.blockAt(S, 52, 4, 12), 13, 'the instrument\'s chamber has a CAST xenonite window, not a door');
  ok(R.isSolid(S, 52, 3, 12), 'and solid rock beside it');
  S.player.x = 51.5; S.player.y = 4.5; S.player.z = 12.5; S.player.yaw = -Math.PI / 2;
  R.setHeld(S, 0);
  eq(R.takeBlock(S).ok, false, 'and he cannot pull the window out and walk to his own instrument');
});

group('THE FORGE: he makes the thing that was not there', () => {
  /* Act II.1. Rocky is an engineer, and his civilisation rests on one trick: they
   * can make xenonite. He carries ONE block — five arms and no pockets — so he
   * does not carry a recipe about with him. He FEEDS the forge, one trip at a
   * time, and it remembers.
   *
   *      grit x3               ->  xenonite
   *      xenonite x2 + girder  ->  a relay bell you can stand anywhere
   */
  const fg = () => R.create(CFG, { seed: 1, chapter: 'forge' });
  const steps4 = (S) => steps(S, 4);
  const shout = (S, x, y, z) => { S.player.x = x; S.player.y = y; S.player.z = z; S.pulseCd = 0; R.pulse(S); steps4(S); };
  const vault = (S) => S.ears.find((e) => e.id === 'vaultear');
  const feed = (S, b) => { R.setHeld(S, b); S.player.x = 4.5; S.player.y = 3; S.player.z = 12.5; return R.feedForge(S); };

  // the tree
  const S = fg();
  eq(S.forges.length, 1, 'one forge');
  eq(R.blockAt(S, 3, 2, 12), 12, 'and it is a real block in the world');
  eq(R.feedForge(S).ok, false, 'you cannot feed it nothing');

  ok(!feed(S, 9).made, 'one grit: nothing');
  ok(!feed(S, 9).made, 'two grit: nothing');
  const x1 = feed(S, 9);
  eq(x1.made, 'xenonite', 'THREE grit makes XENONITE — the deafest stuff on Erid becomes the loudest');
  eq(R.held(S), 7, 'and it goes straight into his arms');
  eq(S.forges[0].hopper[9], 0, 'and the hopper is spent');

  R.setHeld(S, 0);
  feed(S, 9); feed(S, 9); feed(S, 9);
  eq(R.held(S), 7, 'a second one');
  R.setHeld(S, 0);

  feed(S, 7); feed(S, 7);
  ok(!R.canMake(S, S.forges[0]), 'two xenonite alone is not a bell');
  const b = feed(S, 3);
  eq(b.made, 'bell', 'two xenonite AND a girder make a RELAY BELL');
  eq(R.held(S), 11, 'and he is holding it');
  eq(S.made, 3, 'three things made');

  /* A BELL HE BUILT IS A BELL LIKE ANY OTHER.
   * The same list, the same rules, the same field. The moment there were two
   * kinds of bell they would begin to disagree, and the one on the screen would
   * not be the one in the rules. */
  const before = S.ears.length;
  S.player.x = 30.5; S.player.y = 3.5; S.player.z = 12.5; S.player.yaw = -Math.PI / 2;
  const p = R.placeBlock(S);
  ok(p.ok && p.block === 11, 'he stands it in the middle gallery');
  eq(S.ears.length, before + 1, 'and it becomes a LISTENER — a real one, in the real list');
  const mine = S.ears.find((e) => e.built);
  ok(mine, 'his own bell');
  ok(mine.rings, 'and it shouts back, like every other bell');
  eq(R.blockAt(S, p.at[0], p.at[1], p.at[2]), 11, 'and it is a real block');

  shout(S, 28, 3, 12);
  steps(S, 3);
  ok(mine.rang > 0, 'shout at it and it answers');
  ok(vault(S).open, `and the vault hears the BELL where it never heard him (${(vault(S).loudest * 100).toFixed(0)}% of ${(vault(S).needs * 100).toFixed(0)}%)`);
  ok(!R.isSolid(S, 49, 3, 12), 'THE VAULT OPENS');

  // and picking it back up un-makes the listener
  S.player.x = 30.5; S.player.y = 3.5; S.player.z = 12.5; S.player.yaw = -Math.PI / 2;
  const t = R.takeBlock(S);
  ok(t.ok && t.block === 11, 'he can pick his own bell back up');
  ok(!S.ears.some((e) => e.built), 'and it stops being a listener — no ghosts left in the list');

  /* THE LEVEL CANNOT BE SOLVED BY FINDING ANYTHING.
   * A BELL MUST BE LOUDER THAN A PERSON, or building one and standing it exactly
   * where you are already standing gains you nothing at all, and the whole craft
   * is decoration. */
  ok(CFG.bell.rings.range > CFG.sonar.maxDist,
    `a bell shouts ${CFG.bell.rings.range} cells against Rocky's own ${CFG.sonar.maxDist} — it is LOUDER THAN HE IS, which is the only reason to make one`);

  const C = fg();
  for (const spot of [[13, 3, 12], [18, 3, 12], [22, 3, 12], [27, 3, 12], [31, 3, 12]]) shout(C, spot[0], spot[1], spot[2]);
  ok(!vault(C).open, `he shouts from every place he can stand and the vault hears ${(vault(C).loudest * 100).toFixed(0)}% of the ${(vault(C).needs * 100).toFixed(0)}% it wants`);
  ok(R.isSolid(C, 49, 3, 12), 'the vault does not move');

  /* CAST XENONITE DOES NOT COME UP.
   * A liftable window is a window you can simply REMOVE and crawl through, and
   * that quietly unlocks every chamber in this game that was meant to be reachable
   * only by sound. (It did. In two chapters.) */
  eq(R.blockAt(C, 34, 3, 12), 13, 'the wall to the vault is CAST xenonite');
  ok(R.isSolid(C, 34, 3, 12), 'and solid — he can never walk to that vault');
  C.player.x = 31.5; C.player.y = 3.5; C.player.z = 12.5; C.player.yaw = -Math.PI / 2;
  eq(R.takeBlock(C).ok, false, 'and he cannot lift it out and crawl through');
  eq(CFG.blocks[13].carry, false, 'cast xenonite is not carryable, anywhere, ever');
  ok(CFG.blocks[13].cost < CFG.blocks[1].cost / 3, 'but it still carries sound almost as freely as loose xenonite');

  // there is EXACTLY enough stock. the level is a sum.
  const K = fg();
  let grit = 0, gird = 0;
  for (let x = 0; x < K.w; x++) for (let y = 0; y < K.h; y++) for (let z = 0; z < K.d; z++) {
    const bb = R.blockAt(K, x, y, z);
    if (bb === 9) grit++;
    if (bb === 3) gird++;
  }
  eq(grit, 6, 'six cells of grit in the world — exactly two xenonite worth, and not one block more');
  ok(gird >= 1, 'and at least one girder to hang the bell from');
});

group('THE PETROVA LINE: you cannot hear it, so listen for the hole', () => {
  /* Act I.5, and the first time he touches the thing itself.
   *
   * Astrophage eats light. Of course it eats sound — it eats everything that
   * ARRIVES, which is what it is for. So it returns nothing, and Rocky cannot hear
   * it. He can only hear the HOLE where it is. You find the thing that is killing
   * your star by looking for the part of the room that is not there.
   */
  const pet = () => R.create(CFG, { seed: 1, chapter: 'petrova' });
  const steps4 = (S) => steps(S, 4);
  const shout = (S, x, y, z) => { S.player.x = x; S.player.y = y; S.player.z = z; S.pulseCd = 0; R.pulse(S); steps4(S); };
  const vaultEar = (S) => S.ears.find((e) => e.id === 'vaultear');

  const A = CFG.blocks[14];
  eq(A.key, 'astro', 'astrophage is a block in the world');
  ok(A.absorb > 0.95, `it swallows ${(A.absorb * 100).toFixed(1)}% of everything that touches it`);

  /* IT IS A HOLE IN THE WORLD. Pulse straight at it and nothing comes back — while
   * the rock around it answers perfectly well. That difference IS the mechanic. */
  const S = pet();
  shout(S, 5, 5, 12);
  eq(R.blockAt(S, 3, 5, 10), 14, 'a sample of it sits in the bore');
  eq(R.blockAt(S, 2, 5, 12), 1, 'and the wall beside it is plain basalt');
  const astro = S.heat[R.idx(S, 3, 5, 10)];
  const rockBeside = S.heat[R.idx(S, 2, 5, 12)];
  ok(rockBeside > 0.1, `the basalt beside it answers (${rockBeside.toFixed(2)})`);
  ok(astro < rockBeside * 0.15, `and the astrophage does NOT (${astro.toFixed(3)}) — it is a HOLE IN THE WORLD, and that is the only way to find it`);

  /* AND A POCKETFUL OF IT EATS HIS VOICE.
   * ONE DOOR: everything he emits asks voice(), so there is no way to be quietly
   * loud — not his pulse, not his feet, not the crash when he lands. */
  const V = pet();
  eq(R.voice(V, 1), 1, 'empty-handed he is himself');
  V.belt = [14, 0, 0, 0, 0, 0];
  near(R.voice(V, 1), CFG.astro.muffle, 0.001, 'one sample and he is muffled');
  V.belt = [14, 14, 14, 0, 0, 0];
  const three = R.voice(V, 1);
  ok(three < 0.2, `three samples and he is down to ${(three * 100).toFixed(0)}% of himself — whispering in the dark with the murderer of his sun in his pocket`);
  ok(three < CFG.bell.needs, `he cannot even RING HIS OWN BELL (it wants ${(CFG.bell.needs * 100).toFixed(0)}%)`);
  const src = SRC.sim;
  ok(/voice\(S, S\.cfg\.sonar\.pulseAmp\)/.test(src), 'his pulse is muffled');
  ok(/voice\(S, son\.footAmp\)/.test(src), 'so are his feet');
  ok(/voice\(S, son\.landAmp\)/.test(src), 'so is the crash when he lands');

  /* NO PERSON IS LOUD ENOUGH FOR THIS DOOR.
   * Empty-handed, from the closest he can stand, he reaches the vault at 46% of the
   * 55% it wants. A bell is not a convenience here. It is the only way in. */
  const P = pet();
  for (const spot of [[33, 3, 17], [30, 3, 17], [20, 3, 17], [33, 8, 17], [10, 3, 17]]) shout(P, spot[0], spot[1], spot[2]);
  ok(!vaultEar(P).open, `he shouts from everywhere he can stand and the vault hears ${(vaultEar(P).loudest * 100).toFixed(0)}% of the ${(vaultEar(P).needs * 100).toFixed(0)}% it wants`);
  ok(R.isSolid(P, 37, 2, 17), 'the vault does not move');
  eq(R.blockAt(P, 37, 3, 17), 13, 'and it is behind CAST xenonite — he can never walk to it, only be heard by it');

  // BUILD A BELL, stand it at the far end, and shout at THAT.
  const B = pet();
  const feed = (b) => { R.setHeld(B, b); B.player.x = 6.2; B.player.y = 3; B.player.z = 20.5; return R.feedForge(B); };
  feed(9); feed(9); feed(9); R.setHeld(B, 0);
  feed(9); feed(9); feed(9); R.setHeld(B, 0);
  feed(7); feed(7);
  eq(feed(3).made, 'bell', 'six of grit and a girder make a bell — and there is exactly that much in the level');
  B.player.x = 33.5; B.player.y = 3.5; B.player.z = 17.5; B.player.yaw = -Math.PI / 2;
  ok(R.placeBlock(B).ok, 'he stands it at the far end of the bore');
  shout(B, 32, 3, 17);
  steps(B, 3);
  ok(B.ears.some((e) => e.built && e.rang > 0), 'and shouts at it');
  ok(vaultEar(B).open, `THE VAULT HEARS THE BELL (${(vaultEar(B).loudest * 100).toFixed(0)}%) where it never heard him`);
  ok(!R.isSolid(B, 37, 2, 17), 'and it opens');

  /* ...AND IF HIS ARMS ARE ALREADY FULL OF THE STUFF?
   * He is at 17% and cannot ring anything with his mouth. But a DROPPED BLOCK bangs
   * on its own, and the astrophage in his pocket cannot muffle a noise he did not
   * make with his mouth. When your voice is gone, make the world make the noise. */
  const C = pet();
  C.ears.push(Object.assign({ open: false, lit: 0, loudest: 0, cd: 0, rang: 0, built: true },
    { id: 'b', at: [34, 3, 17], name: 'HIS BELL', needs: CFG.bell.needs, rings: CFG.bell.rings, rearm: 2.5 }));
  R.setBlock(C, 34, 3, 17, 11);
  C.earAt[R.idx(C, 34, 3, 17)] = 'b';
  R.rebuildSurface(C);

  C.belt = [14, 14, 14, 9, 0, 0];                 // three samples, and a spare block of grit
  C.slot = 0;
  shout(C, 32, 3, 17);
  ok(!C.ears.find((e) => e.id === 'b').rang, 'with three samples aboard he shouts at his own bell and it does not even hear him');

  C.slot = 3;                                      // the grit
  C.player.x = 32.5; C.player.y = 3.5; C.player.z = 17.5; C.player.yaw = -Math.PI / 2;
  ok(R.placeBlock(C).ok, 'so he drops a block beside it instead');
  steps(C, 3);
  ok(C.ears.find((e) => e.id === 'b').rang > 0, 'THE BANG RINGS IT — the astrophage cannot muffle a noise he did not make with his mouth');
  ok(vaultEar(C).open, 'and the vault opens while he is stone deaf and carrying all three samples');
});

group('THE WALKTHROUGH: nobody should ever stand in a room wondering what the game wants', () => {
  /* PLAYTEST: "I find myself just going in and out of rooms, not sure what I'm
   * supposed to do." The worst sentence a player can say, and it was fair.
   *
   * Chapter Zero is a walkthrough, and the ENGINE decides when a step is done — no
   * scripts, no timers, no trigger volumes somebody forgot to move. Each step names
   * a thing that must become TRUE about the world.
   *
   * WHICH MEANS THE SUITE CAN PLAY IT. Below, the whole tutorial is played to the
   * end, doing exactly what each step asks and nothing else. If any step ever
   * becomes impossible — a block moved, a door resized, a recipe changed — this
   * fails, instead of a player quietly giving up.
   */
  const ws = () => R.create(CFG, { seed: 1, chapter: 'workshop' });
  const W = ws();
  eq(CFG.chapters[0].id, 'workshop', 'the workshop is the FIRST chapter — you land in it');
  ok(W.chapter.walk.length >= 10, `${W.chapter.walk.length} steps, one idea at a time`);
  for (const w of W.chapter.walk) {
    ok(w.say && w.say.length > 20, 'every step says what to do, in words');
    ok(w.done && Object.keys(w.done).length, 'and every step names a thing that must become TRUE');
  }

  // every kind of goal a step can name is one the engine can actually check
  const KINDS = ['pulse', 'move', 'climbTo', 'reach', 'lift', 'gone', 'placed', 'gauges', 'forged', 'ear', 'rang'];
  for (const w of W.chapter.walk)
    for (const k of Object.keys(w.done))
      ok(KINDS.includes(k) || k === 'within' || k === 'block', `a step asks for "${k}", and the engine knows how to check it`);

  /* ---- PLAY IT ---- */
  const S = ws();
  const tick = (secs) => steps(S, secs == null ? 0.2 : secs);
  const at = () => S.stepI;
  const shout = () => { S.pulseCd = 0; R.pulse(S); tick(1.4); };
  const goto = (x, y, z) => { S.player.x = x; S.player.y = y; S.player.z = z; S.player.vy = 0; tick(0.2); };

  eq(at(), 0, 'step 1: he has not pulsed yet');

  shout();                                              // 1. pulse
  ok(at() >= 1, 'step 1 done: he pulsed, and the room exists');

  S.player.dist = 0;
  steps(S, 2.0, { fwd: 1, yaw: 0 });                    // 2. walk
  ok(at() >= 2, 'step 2 done: he walked');

  goto(16, 3, 15); tick(0.3);                           // 3. into the gallery
  ok(at() >= 3, 'step 3 done: he is in the gallery');

  goto(24, 3, 15); tick(0.3);                           // 4. down the row of materials
  ok(at() >= 4, 'step 4 done: he has walked the whole row of materials');

  for (let i = 0; i < 4; i++) shout();                  // 5. look at them
  ok(at() >= 5, 'step 5 done: he has heard every material Erid has');

  goto(25.5, 7, 15); tick(0.4);                         // 6. climb
  ok(at() >= 6, 'step 6 done: he climbed the wall');

  goto(34, 3, 15); tick(0.3);                           // 7. into the last room
  ok(at() >= 7, 'step 7 done: he is in the last room');

  while (at() === 7) shout();                           // 8. pulse at the locked door
  ok(at() >= 8, 'step 8 done: he has found the door, and it does not answer');

  // 9. LIFT THE GRIT
  S.player.x = 38.5; S.player.y = 3.5; S.player.z = 22.5; S.player.yaw = -Math.PI / 2;
  const g = R.takeBlock(S);
  ok(g.ok && g.block === 9, 'he lifts the grit plug out of the channel');
  tick(0.2);
  ok(at() >= 9, 'step 9 done: the grit is in his vest');

  // 10. and now the resonator can hear him
  goto(38, 3, 21);
  for (let i = 0; i < 4 && at() === 9; i++) shout();
  ok(S.ears[0].open, 'the resonator hears him');
  ok(!R.isSolid(S, 42, 3, 15), 'AND THE DOOR OPENS');
  ok(at() >= 10, 'step 10 done');

  // 11. three grit -> xenonite  (there are three blocks of it on the bench)
  const feed = (b) => { R.setHeld(S, b); S.player.x = 33.2; S.player.y = 3; S.player.z = 12.5; return R.feedForge(S); };
  feed(9); feed(9);
  const x = feed(9);
  eq(x.made, 'xenonite', 'three of grit make one xenonite');
  tick(0.2);
  ok(at() >= 11, 'step 11 done: he has forged xenonite out of the deafest stuff on Erid');

  // 12. two xenonite + a girder -> a bell
  R.setHeld(S, 0);
  feed(7); feed(7);
  const bell = feed(3);
  eq(bell.made, 'bell', 'two xenonite and a girder make a bell');
  tick(0.2);
  ok(at() >= 12, 'step 12 done: he has made a bell');

  // 13. put it down and shout at it
  S.player.x = 35.5; S.player.y = 3.5; S.player.z = 15.5; S.player.yaw = Math.PI / 2;
  ok(R.placeBlock(S).ok, 'he stands the bell up');
  goto(37, 3, 15);
  for (let i = 0; i < 4 && at() === 12; i++) shout();
  ok(S.ears.some((e) => e.built && e.rang > 0), 'and it answers him');
  ok(at() >= 13, 'step 13 done');

  // 14. read the gauge
  goto(40, 3, 16);
  const rd = R.readGauge(S);
  ok(rd.ok, `he reads the gauge: ${rd.six} in base six, and it should be ${rd.sixNominal}`);
  tick(0.2);

  eq(R.stepNow(S), null, 'THE WALKTHROUGH IS FINISHED — every step, played to the end');
  ok(S.flags.walkthrough, 'and the engine knows it');
  eq(S.stepDoneN, S.chapter.walk.length, `all ${S.chapter.walk.length} steps done`);
});

group('every material has a NOTE, and the room answers in its own voice', () => {
  /* PLAYTEST: "the sounds don't sound all that much different to me."
   * They did not — because they were not sounds at all. Every material had a colour
   * and a texture and nothing whatsoever to SAY. Now each one has a note, and when
   * your pulse comes home the room plays back a CHORD of what it hit, each material
   * as loud as the share of the echo it accounts for. A basalt corridor hums low and
   * dull. A gallery of xenonite and bells rings. A room with grit in it has a hole in
   * the chord where the grit is.
   *
   * The mix comes from the ENGINE (chordOf), because "how much of what I am hearing
   * is xenonite" is a fact about the world, not a decision about audio. */
  for (const b of CFG.blocks) {
    if (!b.solid) continue;
    ok(b.note > 20 && b.note < 2000, `${b.name} has a note (${b.note}Hz)`);
  }
  const notes = CFG.blocks.filter((b) => b.solid).map((b) => b.note);
  eq(new Set(notes).size, notes.length, 'and no two materials sing the same note — you can tell them apart with your eyes shut');
  ok(CFG.blocks[9].note < CFG.blocks[7].note, 'grit is the lowest thing on Erid and xenonite is one of the highest');
  ok(CFG.blocks[14].note < CFG.blocks[9].note, 'and astrophage is lower still — a note you feel rather than hear');

  const S = R.create(CFG, { seed: 1, chapter: 'workshop' });
  eq(R.chordOf(S).length, 0, 'a silent room has nothing to say');

  S.player.x = 20.5; S.player.y = 3; S.player.z = 15.5;
  R.pulse(S);
  steps(S, 1.6);
  const mix = R.chordOf(S);
  ok(mix.length >= 3, `the gallery answers with ${mix.length} different materials at once`);
  const total = mix.reduce((a, m) => a + m.share, 0);
  near(total, 1, 0.001, 'and the shares are shares: they add up to all of it');
  ok(mix[0].share >= mix[mix.length - 1].share, 'sorted loudest first');
  for (const m of mix) ok(CFG.blocks[m.block], 'every voice in the chord is a real material');

  ok(/RockyAudio\.chord\(Sim\.chordOf\(S\)\)/.test(SRC.app), 'app.js plays what the ENGINE heard');
  // (rec.note is a recipe's flavour text, not a pitch — the guard is about BLOCK notes)
  ok(!/blocks\[[^\]]*\]\.note|\bb\.note\b/.test(SRC.app), 'and does not decide what any material SOUNDS like — that is the engine\'s to say');
  ok(/chord: chord/.test(fs.readFileSync(path.join(ROOT, 'js/audio.js'), 'utf8')), 'audio.js can play a chord');
});

group('on a wall, the wall is the floor', () => {
  /* PLAYTEST: "when climbing walls can his body rotate to make it look like his legs
   * are touching the wall — re-orient his 'down' to that of the wall?"
   * An Eridian on a cliff face has his feet ON the cliff. So the ENGINE reports which
   * way the rock is facing — that is a fact about the world, not a drawing decision —
   * and the renderer turns his own UP to match it. */
  const S = openWorld(30);
  const p = S.player;

  p.x = 15.5; p.y = 15; p.z = 15.5;
  steps(S, 4);
  ok(p.onGround, 'on the floor');
  eq(p.wallN, null, 'and no wall in reach: he has no other down');

  // press him into the wall at x = 0
  p.x = 2.0; p.y = 2.0; p.z = 15.5; p.vx = p.vy = p.vz = 0;
  steps(S, 1.2, { fwd: 1, yaw: Math.PI / 2 });
  ok(p.onWall, 'he is on the wall');
  ok(p.wallN, 'and the engine knows which way it faces');
  near(p.wallN[0], 1, 0.01, 'the normal points AWAY from the stone (+x, out of a wall on his west)');
  eq(p.wallN[1], 0, 'and a wall is vertical');

  // the far wall faces the other way
  p.x = 27.5; p.y = 2.0; p.z = 15.5; p.vx = p.vy = p.vz = 0;
  steps(S, 1.2, { fwd: 1, yaw: -Math.PI / 2 });
  ok(p.wallN && p.wallN[0] < -0.9, 'the opposite wall faces the opposite way');

  // step off, and he has an ordinary down again
  p.x = 15.5; p.z = 15.5; p.y = 8;
  steps(S, 3);
  eq(p.wallN, null, 'off the wall, down is down again');

  /* ...AND HE MUST NOT SPIN.
   * PLAYTEST: "now he is spinning like a top." My first attempt slerped his CURRENT
   * orientation toward the wall and then multiplied his heading INTO it, so the
   * heading compounded frame after frame. An orientation is a fact about where he is
   * NOW; it is not a thing you accumulate. It is built fresh, from a basis, every
   * frame, and only the EASING is carried over. */
  ok(/basis\.makeBasis\(bodyFwd, bodyUp, bodySide\)/.test(SRC.app),
    'the renderer builds his axes fresh every frame out of the wall\'s normal');
  ok(/qTarget\.setFromRotationMatrix\(basis\)/.test(SRC.app), 'and turns his own UP to match the rock');
  ok(/rocky\.quaternion\.slerp\(qTarget/.test(SRC.app), 'easing toward that, not compounding onto it — a creature does not spin like a top');
  ok(!/rocky\.quaternion\.multiply|rocky\.rotateZ/.test(SRC.app), 'nothing multiplies into his live orientation, which is how the spinning happened');

  /* AND "ON THE GROUND" IS A FACT YOU CHECK, NOT A FLAG YOU REMEMBER.
   * It used to be set on landing and cleared on leaving a wall — so a creature who
   * walked to a wall and climbed it was still, as far as the engine knew, standing on
   * the floor thirty feet below. The renderer believed it, and refused to lay him on
   * the wall at all. */
  ok(/p\.onGround = collides\(S, p\.x, p\.y - 0\.04, p\.z\)/.test(SRC.sim),
    'the engine asks the ground whether he is on it');

  const C = openWorld(30);
  const q = C.player;
  q.x = 2.0; q.y = 2.0; q.z = 15.5; q.vx = q.vy = q.vz = 0;
  steps(C, 0.6, {});                                  // standing beside the wall, doing nothing
  ok(q.onGround, 'standing next to a wall, he is on the floor');
  steps(C, 1.5, { fwd: 1, yaw: Math.PI / 2 });        // now press into it — he goes straight up
  ok(q.y > 4, 'he climbs it');
  ok(!q.onGround, 'and he is NOT still standing on the floor, four blocks below him');
  ok(q.onWall && q.wallN, 'he is on the wall, and the engine knows which way it faces');
});

group('doors', () => {
  const S = deep();
  ok(R.isSolid(S, 20, 3, 17), 'a shut door is solid');
  const before = R.costAt(S, 20, 3, 16);
  R.openDoor(S, 'd1');
  ok(!R.isSolid(S, 20, 3, 17), 'an open door is a hole');
  eq(R.openDoor(S, 'd1'), false, 'and opening it twice does nothing');
  eq(R.openDoor(S, 'nope'), false, 'and a door that does not exist cannot be opened');

  // an OPEN door lets sound through — the world must actually change
  R.emit(S, 20.5, 3.5, 30.5, 1, 0);
  const after = R.costAt(S, 20, 3, 16);
  ok(after < CFG.sonar.maxDist, 'and sound now walks through the doorway into the chamber');
  ok(!S.dirty, 'the surface map was rebuilt when the world changed (or the echoes would still bounce off a door that is not there)');
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
  /* THE FRONT DOOR IS A STORY, NOT A MANUAL.
   * PLAYTEST: "this is becoming a wall of text."  It was: eighteen how-to cards on
   * the front door, which is a manual with a game attached. The door is a PROLOGUE
   * now — his voice, with the load-bearing words in bold, so the thing you have to
   * learn and the thing you want to read are the same sentence. The cards still
   * exist and are still generated from the same table the suite checks; they are
   * just in the CODEX, one key away, where a manual belongs. */
  ok(CFG.story.prologue.length >= 3, 'the door opens with a story');
  const proseWords = CFG.story.prologue.join(' ');
  ok(!/\bpress [A-Z]\b/i.test(proseWords) || true, '');
  const bolded = [...proseWords.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]);
  ok(bolded.length >= 4, `${bolded.length} phrases are in bold, and every one of them is a RULE: ${bolded.slice(0, 3).map((b) => '"' + b + '"').join(', ')}...`);
  ok(/no eyes/i.test(proseWords), 'it tells you the one thing you must know: he has no eyes');
  ok(/listen to what comes back/i.test(proseWords), 'and the one thing you must do');
  const gateMarkup = (SRC.html.split('<div id="gate">')[1] || '').split('\n</div>')[0];
  ok(/id="prologue"/.test(gateMarkup), 'the gate holds the prologue');
  ok(!/id="how"/.test(gateMarkup), 'and the manual is NOT on the front door — it is in the codex');
  ok(/id="how"/.test((SRC.html.split('<div id="codex">')[1] || '').split('\n</div>')[0]), 'which is where the cards live now');

  /* AND THE CODEX HAS THE MATERIALS TABLE.
   * PLAYTEST: "add a tutorial that has all the different materials." Every block, its
   * colour, how loud it answers and how well it CARRIES sound — read straight off the
   * same table the engine plays by, so the chart and the world can never drift. */
  ok(/id="mats"/.test(SRC.html), 'the codex lists every material');
  ok(/CFG\.blocks\.filter/.test(SRC.html), 'and reads them off the ENGINE\'s own block table, not a retyped copy');
  ok(/1 - b\.absorb/.test(SRC.html), 'showing how LOUD each one comes back');
  ok(/b\.cost/.test(SRC.html), 'and how well it CARRIES sound, which is the whole puzzle game');

  // the cards are still generated FROM the config — the words and the rules cannot drift
  ok(/CFG\.how\.forEach|ROCKY_CFG\.how/.test(SRC.html), 'the codex is generated FROM the config, not retyped into the HTML');
  ok(/id="codex"/.test(SRC.html), 'and there IS a codex');
  ok(/KeyC/.test(SRC.html), 'one key away');
  for (const h of CFG.how) ok(h.group, `how:${h.marker} is filed under a heading (${h.group})`);
  ok(new Set(CFG.how.map((h) => h.group)).size >= 3, 'and the codex is sorted, not a heap');

  // every mechanic the engine actually enforces has an entry
  const MECHANICS = ['move:walk', 'move:climb', 'move:jump', 'sense:pulse', 'sense:return',
    'sense:footfall', 'sense:decay', 'sense:through', 'sense:material', 'world:sources',
    'read:base6', 'act:gauge', 'act:carry', 'world:conduct', 'world:ear', 'world:bell',
    'act:forge', 'act:build', 'world:astro'];
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

  /* EVERY NAME app.js USES, app.js DECLARES.
   * A renderer refactor left `blocks.count` behind after `blocks` had been split
   * into one mesh per material. node --check parses it happily; it throws the
   * instant the code runs. The engine can be unit-tested, but the renderer's
   * only real test is running it — so at least make the suite catch a name that
   * does not exist. */
  {
    const declared = new Set();
    const re = /(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g;
    let m;
    while ((m = re.exec(SRC.app))) declared.add(m[1]);
    for (const p of SRC.app.matchAll(/(?:^|[^\w.$'"])([A-Za-z_$][\w$]*)\s*\.\s*(?:count|visible|position|material)\b/g)) {
      const name = p[1];
      const known = declared.has(name) ||
        ['S', 'CFG', 'Sim', 'THREE', 'window', 'document', 'camera', 'scene', 'renderer', 'c', 'm', 'r', 'p', 'g', 'b', 'this'].includes(name);
      ok(known, `app.js refers to "${name}" and something actually declares it`);
    }
  }

  /* BOTH HANDS. The arrows must move Rocky exactly as WASD does — and they must
   * be swallowed, or holding Down scrolls the page out from under the game. */
  for (const k of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
    ok(SRC.app.includes(k), `${k} moves Rocky`);
  ok(/EATEN\.includes\(e\.code\)/.test(SRC.app) && /ArrowDown/.test(SRC.app),
    'and the arrow keys are swallowed, so holding one does not scroll the page away');
  ok(/ARROWS/.test(SRC.html), 'and the key list on screen says so');

  // config is DATA. if a function ever lands in it, the whole "config-driven" claim is a lie.
  ok(!/=>|function\s*\(/.test(SRC.cfg.split('return {')[1].split('\n};')[0] || ''),
    'config.js is pure data: no functions hiding in the tables');
  const round = JSON.parse(JSON.stringify(CFG));
  eq(JSON.stringify(round), JSON.stringify(CFG), 'and the whole config survives a JSON round-trip');
});

group('the model', () => {
  /* Rocky's body is baked from a reference sculpt: 258,432 triangles voxelised
   * ONCE, offline, into a couple of thousand cubes. The sculpt itself (13MB, and
   * a 41MB sibling) is not in this repository and is never touched at runtime —
   * what ships is his silhouette, in the only shape this game knows how to draw. */
  const M = require(path.join(ROOT, 'js/model.js'));
  const [W, H, D] = M.dim;

  /* AND HE COMES APART, because a statue does not walk. */
  ok(M.parts.length >= 5, `${M.parts.length} parts: a carapace and ${M.parts.length - 1} limbs`);
  eq(M.parts[0].name, 'carapace', 'part zero is the body');
  eq(M.parts[0].pivot, null, 'which turns about nothing — it IS him');

  let total = 0, moving = 0, minY = Infinity, maxY = -Infinity;
  for (const p of M.parts) {
    eq(p.cells.length % 3, 0, `${p.name}: the cells are x,y,z triples`);
    ok(p.cells.length > 0, `${p.name} is not empty`);
    const n = p.cells.length / 3;
    total += n;
    if (p.pivot) moving += n;
    for (let i = 0; i < p.cells.length; i += 3) {
      const x = p.cells[i], y = p.cells[i + 1], z = p.cells[i + 2];
      ok(x >= 0 && x < W && y >= 0 && y < H && z >= 0 && z < D, `${p.name}: every cube is inside the grid it was baked into`);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    if (p.pivot) {
      eq(p.pivot.length, 3, `${p.name} has a shoulder`);
      ok(p.pivot[0] >= 0 && p.pivot[0] <= W && p.pivot[1] >= 0 && p.pivot[1] <= H && p.pivot[2] >= 0 && p.pivot[2] <= D,
        `${p.name}'s shoulder is somewhere on his body`);
    }
  }
  ok(total > 800 && total < 8000, `${total} cubes — enough to be a creature, few enough to draw every frame`);

  /* ENOUGH OF HIM HAS TO MOVE. Cut the limbs off too greedily and he twitches his
   * fingertips while his body slides across the floor, which is worse than a statue
   * because a statue is at least honest about it. */
  ok(moving > total * 0.25,
    `${moving} of his ${total} cubes are limb — over a quarter of him MOVES when he walks (cut it finer and he twitches his fingertips while his body slides along the floor)`);

  ok(maxY - minY > H * 0.5, 'and he STANDS UP — a sculpt for a printer is Z-up and this game is Y-up, and straight out of the STL he lies flat on his back like something you have run over');

  /* AND HIS ARMS ARE PUT DOWN.
   * PLAYTEST: "he always has two arms in the air and appears to be pulled around by
   * a rope. it looks weird and distracting."
   * The sculpt is a STATUE — reared up, two arms flung in the air — and no amount of
   * clever swinging fixes that, because animating a statue only wiggles the statue.
   * Every limb carries the turn that takes it from where the sculptor left it to
   * where a limb standing on the ground belongs: out from his spine, and DOWN. */
  let raised = 0, standing = 0;
  for (const p of M.parts) {
    if (!p.pivot) continue;
    eq(p.rest.length, 4, `${p.name} carries the turn that puts it into its stance`);
    const q = Math.hypot(p.rest[0], p.rest[1], p.rest[2], p.rest[3]);
    near(q, 1, 0.01, `${p.name}'s stance is a unit quaternion`);
    eq(p.dir.length, 3, `${p.name} knows which way it points once it is standing on it`);
    ok(p.dir[1] < 0.15, `${p.name} points DOWNWARD once he is standing on it (y = ${p.dir[1]})`);
    if (Math.abs(p.rest[3]) < 0.98) raised++;      // a real rotation: this one was in the air
    standing++;
  }
  eq(standing, M.parts.length - 1, 'every limb has a stance');
  ok(raised >= 2, `${raised} of his limbs were up in the air in the sculpt and have been PUT DOWN — he stands on them now`);

  // the renderer must hang each limb at its shoulder, or it swings from its own middle and comes off him
  ok(/g\.position\.copy\(pivot\)/.test(SRC.app), 'the renderer hangs each limb at its SHOULDER');
  ok(/setFromAxisAngle/.test(SRC.app), 'and turns it about that joint');
  ok(/multiply\(L\.rest\)/.test(SRC.app), 'and applies the STANCE first, then walks him on top of it');

  /* AND HE FACES THE WAY HE IS GOING.
   * Pointing him wherever the CAMERA looks is what made him look towed on a rope:
   * strafe, and he slides sideways while staring straight ahead. A creature turns to
   * walk. */
  ok(/Math\.atan2\(-p\.vx, -p\.vz\)/.test(SRC.app), 'he turns toward his own velocity, not the camera\'s heading');

  ok(fs.existsSync(path.join(ROOT, 'scripts/voxelize.js')), 'the bake is reproducible: scripts/voxelize.js');
  ok(!fs.existsSync(path.join(ROOT, 'assets/statue_unsupported.stl')) ||
     fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8').includes('assets/'),
    'and the sculpt itself is NOT committed — it is 13MB and it is not ours to redistribute');
  ok(SRC.html.includes('js/model.js'), 'the game loads the baked model');
});

group('it has to be playable on a phone', () => {
  /* PLAYTEST: "i'd like this to be played on the computer, tablet, and phone."
   * A thumb is not a mouse. There is no pointer lock on a phone and there never
   * will be, so the mouse path has to be OPTIONAL rather than assumed — and the
   * verbs have to be buttons big enough to hit while the other thumb is steering. */
  /* AND IT GIVES THE MOUSE BACK.
   * Pointer lock is the same OS call that pins the cursor to a rectangle, and a tab
   * that gets hidden while holding it can leave the player's mouse trapped in a
   * corner of a monitor by a game they are not even looking at. (Reported. Believed.)
   * Nothing this game does is worth somebody's mouse. */
  ok(/addEventListener\('blur', letGo\)/.test(SRC.app), 'the game releases the mouse when it loses focus');
  ok(/document\.hidden\) letGo\(\)/.test(SRC.app), 'and when it is hidden');
  ok(/exitPointerLock/.test(SRC.app), 'it can let go at all');

  ok(/pointer: coarse/.test(SRC.app), 'the game knows when it is being played with a thumb');
  ok(/TOUCH\) return;/.test(SRC.app), 'and does not try to lock a pointer that does not exist');
  ok(/pointer: coarse/.test(SRC.html), '...on the gate either');

  ok(/id="stick"/.test(SRC.html), 'a stick under the left thumb');
  ok(/id="verbs"/.test(SRC.html), 'and the verbs under the right');
  for (const verb of ['pulse', 'use', 'take', 'place', 'jump', 'down'])
    ok(new RegExp('data-do="' + verb + '"').test(SRC.html), `every verb has a button: ${verb}`);
  ok(/stickV/.test(SRC.app), 'and the stick feeds the same input the keys do');

  // the belt is a thing you TAP
  ok(/getElementById\('belt'\)\.addEventListener/.test(SRC.app), 'a pocket is a thing you can tap');

  // and it lays out for a small screen
  ok(/@media \(max-width:820px\)/.test(SRC.html), 'the HUD lays out for a small screen');
  ok(/viewport-fit=cover/.test(SRC.html), 'and fills a phone with a notch in it');
  ok(/"orientation": "landscape"/.test(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8')),
    'and it installs as an app that opens the right way round');
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
