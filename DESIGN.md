# ROCKY SAVES THE UNIVERSE

A story adventure-puzzle game told from Rocky's side of *Project Hail Mary*. Voxel,
third-person, browser (three.js, vendored). Faithful science, older player.

## The one idea

**Rocky has no eyes, so sound is the renderer.**

Every visible thing on screen is an echo the engine actually computed. A pulse is a
Dijkstra wavefront through the voxel grid: air costs 1 to cross, rock costs 6.5 —
expensive, but **finite**, which is why he can hear a machine humming through a wall,
and why sound turns corners a raycast would call opaque. The cost buys two things at
once:

* **amplitude** — how loud the echo comes back
* **arrival** — *when* it comes back; the far wall answers late

`sim.js` keeps `amp` and `arrive` per cell and derives `heat` each tick. `app.js`
reads `heat`. That is the entire rendering model.

## Rules that must not be broken

**THE HONESTY RULE.** The renderer may not re-implement anything the engine owns.
It asks (`litCells`, `cameraFit`, `costAt`) and it touches nothing (`S.vox`, `S.amp`
and friends are off limits — the suite enforces this by source scan).

**THERE IS NO WAVEFRONT OBJECT.** A wireframe sphere around Rocky is a sphere the
camera is standing *inside*: it renders as a spiderweb across the whole screen (it
did, for one screenshot), and it is a second opinion about where the sound has got
to. The wave shows itself by **striking** surfaces — bright on landing, then settling
— in the order the engine says they were struck. So that order must be a true sphere,
which is why the wavefront crosses **26** neighbours weighted 1/√2/√3 and not the 6
faces (taxicab distance makes the sweep come out as a *diamond*, and the eye reads
that instantly as a lie).

**A MACHINE IS NOT A FLOODLIGHT.** Ambient sources carry 8–15 cells; Rocky's pulse
carries 32. Give sources the pulse's range and the whole warren glows permanently and
the game quietly stops being about listening. Near a vent you are never blind; in a
dead corridor you are. The suite asserts this.

**COST IS SCRATCH.** `S.cost` is only meaningful for the *last* emission. An unreached
cell holds a stale value, or a flat zero, which reads as "no distance at all" — the
most dangerous wrong answer available. Ask `costAt()`, which says Infinity and means it.

**THE CURRICULUM.** Every rule the engine enforces has a lesson in `config.teach`, and
the briefing cards are generated *from* that table. A mechanic that is not taught
fails the suite by design.

## Bugs that were only ever found by playing it

* **A pending echo could be stolen by a quieter one.** An echo in flight has `heat` 0,
  so comparing new arrivals against heat let every faint vent tick overwrite the loud
  pulse still racing toward that wall, and reset its clock. The room stayed dark.
  Compare against the *steady* value instead. (node: green. browser: black.)
* **Reflections were billed for penetrating the surface they bounced off.** The near
  wall came back at distance 18 instead of 14 — a quarter-second late and a third too
  quiet. It still *looked* like sonar.
* **The camera walked out through the stone** when Rocky backed into a wall, showing
  the warren from outside. Reported by the player, in the first five minutes.

## Shape

| file | owns |
|---|---|
| `js/config.js` | all data. Pure JSON. Blocks, sonar constants, physics, chapters, the curriculum. |
| `js/sim.js` | the world, the body, the sound. Runs headless. |
| `js/app.js` | three.js. A window, not a witness. |
| `js/audio.js` | cue id → what it sounds like. |
| `scripts/test.js` | `node scripts/test.js`. |

## The story (six beats)

1. **The Cold** — the warren is cooling; Eridians never *saw* their star, they felt it. ← *shipped*
2. **The Ship** — a species with no metallurgy problem and no idea what a vacuum is, building one anyway.
3. **The Long Dark** — where do we go, and how do we know when we get there.
4. **The Other** — something else is out here, and it is doing something inexplicable.
5. **The Word** — finding a way to talk. (The heart of the whole thing.)
6. **The Fix** and **The Way Home**.
