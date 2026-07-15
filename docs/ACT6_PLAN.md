# Act VI — The Fix, and the Way Home · Architecture

Roadmap for the final five chapters (drafted by an architect subagent, to be built + verified by the lead). Chapters: `taumoeba, breeding, betrayal, turn, home` in a new file `js/acts/act6_home.js`.

`solved(S)` is a priority-ordered dispatch on chapter fields (`walk → track → seal → count → shifts/doors → gauges → doors → true`). Add each new type as a field + a branch inserted before the generic fallbacks. Keep every new mechanic tick-cadenced, no RNG, double-buffered, region-bounded, testable.

## Shared engine additions (build + test FIRST)
1. **`stepLife(S, dt)`** — deterministic, region-bounded, double-buffered spread pass on a cadence, driven by `chapter.life = {region, eats?, through?, period}`. Taumoeba (block 17) claims eligible face-neighbours: `eats` (block 14 astrophage) in ch25; `through` (porous list incl xenonite 7/13) in ch27. Wire into `step()`; add `S.lifeCd=0` in `create()`. **Riskiest code — region-bound the scan for the pulse budget.**
2. **Forge failure states** — recipes gain optional `live`/`fail`; `feedForge` branches on `r.fail` → `cue('craft:fail')` + hands back the dead block, no `S.made++`. Rely on `canMake`'s existing first-match ordering (complete recipe first, partials after). No change to `canMake`.
3. **Multi-exit + branch commit** — `S.exits` list (single `chapter.exit` wraps to one element, backwards-compatible). `stepExit` hums all solved exits identically (no nudge); on arrival latches `S.flags.done` + `S.flags.chose = ex.id` + `cue('chose:'+id)`.
4. **New `solved()` branches** (before fallbacks): `clear` (ch25: no `of`-block left in region), `bred` (ch26: a forge `made` includes `breed_live`), `contain` (ch27: a `repressurize`-style flood from `sample` never reaches `outside` through the porous set), and the `turn`/`exits` gate (ch28: carrying the cure sample).
5. **New config blocks** — **17 taumoeba** (GREEN, sings: absorb ~0.02, note ~740, cost ~1.4, carry). **18 dead strain** (grey, dull: high absorb, low note, carry). **19 her air** (ORANGE token, carry).
6. **CURRICULUM WIRING IS MANDATORY** — test.js (~line 2147) asserts `Object.keys(CFG.teach).length === MECHANICS.length` (no orphans). Every new *enforced* rule (`world:life`, `act:breed`, `world:leak`) must be added in THREE places at once: `config.teach`, `config.how` (card, body.length>20), and the `MECHANICS` array in test.js — and taught in the chapter that introduces it (25 life, 26 breed-fail, 27 leak).
7. **Every new cue needs a voice** (test.js "every cue has a voice"): `craft:fail`, `chose:grace`/`chose:mission`. Add to audio.js.
8. **Registration** — act6_home.js into chapters.js require-map + ORDER, and index.html + sw.js. chapters.js throws on orphan/missing id.

## 25 · Taumoeba — the answer was alive the whole time
Inverse of Petrova. Astrophage (14) is a hole in perception; taumoeba (17, green, sings) is the living opposite. Carry a sample, set it against a wall of astrophage; `life` eats a hole through it (green spreads into red, holes close and ring); the back chamber (with the exit) opens. Verbs: carry/place + hear. `life:{region, eats:14, period:.4}` + `clear:{of:14, region}`. **Teaches `world:life`.** Wonder + vindication: the cure was pond-scum on a planet nobody wanted; Grace found it, Rocky has the ship, neither could have done it alone.

## 26 · Breeding — one bug, two skies, and the failures teach you
The forge grown up. Strain must eat astrophage AND survive Rocky's ammonia AND survive Grace's air. Recipe with a FAILURE state: feed the incubator; get a live flight strain (17) or a dead strain (18) whose note tells you which sky killed it. Recipes ordered complete-first:
- `breed_live` needs [{17,1},{14,1},{19,1}] gives 17, live — the one.
- `breed_deadHers` needs [{17,1},{14,1}] gives 18, fail — loved my air, her air killed it.
- `breed_deadFood` needs [{17,1},{19,1}] gives 18, fail — survives both skies, won't touch astrophage.
`solved`: `bred` = a forge made `breed_live`. **Teaches `act:breed`.** Ingredient piles generous/re-fetchable so a corpse costs a walk, not the level. Grace present (grind/human) through xenonite.

## 27 · The Betrayal of Physics — the greenest thing has a hole in it
Taumoeba LEAKS through xenonite. Build the obvious green box, pulse, hear the green appear on the wrong side. The cure is loose in your ship. The answer is the villain material: **grit (9), deaf/dead, is the only thing that holds it.** Death contains life. `life:{region, through:[0,7,13,17], period:.5}` (spreads, no eats) makes the leak audible; win-gate `contain:{sample, outside}` = a `repressurize`-style flood (cross set {0,7,13,17}) that must NOT reach `outside`. **Porous list is chapter-scoped data — earlier chapters' xenonite untouched (protects the honesty suite).** **Teaches `world:leak`.** **RISKIEST chapter** — stacks stepLife + contain flood + rebuildSurface + perf; chapter-scope the porous list rigorously, region-bound the scan, lean on `contain` being a pure flood. Banner: XENONITE DOES NOT HOLD IT.

## 28 · The Turn — the only decision in the game
Grace is dying, pointed the wrong way (home). Rocky has one cure-and-fuel to give. Genuine either/or, honoured both ways: **two exits, physically apart, both humming identically, both reachable, nothing says which is right** (same amp/range/distance, symmetric Y geometry, objective states both stakes and refuses to choose). `chapter.exits=[{id:'grace',at,line},{id:'mission',at,line}]`. `solved` gates only on carrying the sample (17) so he can't leave empty-handed; both arches then hum. `S.flags.done` latches on first arrival + `S.flags.chose`. Both worlds warm regardless — the branch is which goodbye Rocky gets, which is why it must be the player's and must not be scored. GRACE: "Go home, Grace. Go and be seen." MISSION: "I kept it. She would have kept it too. That is why I could let her go."

## 29 · Home — you never see either of them
Mirror of Ch1 (The Cold, three fallen gauges) — same gauges, RESTORED (heat back, AMBER returning). Read them, walk to one last amber arch. No new engine (reuses `gauges` + one exit; optionally reads `S.flags.chose` for one of two epilogue lines). Erid warm, Adrian warm, and Rocky — no eyes, out in the dark — never sees either. Banner: WARM AGAIN — AND YOU NEVER SEE IT. Almost no sources; the quiet is the point, like `alone`.
