/* ROCKY SAVES THE UNIVERSE — ACT VI — THE FIX, AND THE WAY HOME
 *
 * The answer was alive the whole time. A bug that eats the thing that eats stars.
 *
 * Levels only. The RULES live in config.js; these files are just the rooms the rules
 * happen in. js/chapters.js stitches every act back into one ordered list, and the
 * order in THAT file is the order you play them in — not the order they load.
 *
 * Act VI mechanics (all built in config.js/sim.js before these levels): the taumoeba
 * GROWS (chapter.life), it clears the red (clear), the forge breeds with failure states
 * (bred), the living thing leaks through xenonite and only grit holds it (contain), and
 * the only real choice in the game is here (exits + hold). See docs/ACT6_PLAN.md.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else ((root.ROCKY_ACTS = root.ROCKY_ACTS || {})['act6_home'] = factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    /* ==============================================================
     * ACT VI.25 — TAUMOEBA
     *
     * The answer was alive the whole time. An inversion of the Petrova Line: there, astrophage
     * was the hole you learned to hear by its absence; here that same hole is a WALL sealing you
     * in, and the answer is not a tool you build — it is a thing that is ALIVE. Rocky carries a
     * dish of green (17), sets one sample against the red (14), and does nothing: the green eats
     * the murder on its own, generation by generation, singing where each cell of it used to be
     * silent. `life` does the eating; `clear` is the win. The hardest thing an engineer is ever
     * asked to do — stand back, and let something that is not him do the work.
     * ============================================================== */
    {
      id: 'taumoeba',
      name: 'Taumoeba',
      world: { w: 40, h: 12, d: 14 },
      spawn: [6, 3, 7],
      objective: 'A wall of the murder itself seals the way on — the hole you have hunted all game, made solid. By your feet is a dish of the living green that EATS it. Carry a sample, set it against the red, and listen: it grows into the murder and closes the hole. When the red is gone, the way out rings.',
      exit: [37, 3, 7],
      showAstro: true,   // the murder-WALL must be visible — you set the green against it, not hunt it
      life:  { region: [[29, 2, 4], [32, 6, 9]], eats: 14, period: 0.4 },
      clear: { of: 14, region: [[31, 2, 4], [32, 6, 9]] },
      build: [
        { op: 'fill', from: [0, 0, 0], to: [39, 11, 13], block: 1 },
        { op: 'room', from: [2, 1, 3], to: [30, 8, 10], floor: 2 },
        // THE DISH — a smear of living green by spawn, generous (six samples; you need one)
        { op: 'fill', from: [8, 2, 5], to: [9, 2, 7], block: 17 },
        // THE WALL OF MURDER — astrophage two cells thick, sealing the corridor
        { op: 'fill', from: [31, 2, 4], to: [32, 6, 9], block: 14 },
        // THE BACK CHAMBER — the way on, reachable only through the wall once it is eaten
        { op: 'room', from: [33, 1, 4], to: [38, 8, 9], floor: 2 },
        // GRACE, behind cast xenonite — he found the green; his machine grinds through the hull
        { op: 'fill', from: [10, 1, 11], to: [20, 7, 11], block: 13 },
        { op: 'room', from: [10, 1, 12], to: [20, 6, 12], floor: 2 },

        /* --- MODEST ERIDIAN SHIP-LIFE (west of the murder; Grace's hull/room left bare) ---
         * walls + ceiling of the main hall, capped at x26 (clear of life region x29+ and the wall) */
        { op: 'flora', from: [1, 1, 2], to: [26, 9, 10], amount: 0.15, bloom: 0.45 },
        { op: 'fill', from: [3, 4, 4], to: [6, 4, 4], block: 3 },   // a girder gallery ledge (verticality)
        // A CREW ALCOVE carved 2 deep into the NORTH wall (shell z0 intact) — quiet, away from all mechanics
        { op: 'room', from: [4, 1, 1], to: [7, 4, 2], floor: 2 },
        { op: 'set', at: [5, 1, 1], block: 7 }, { op: 'set', at: [6, 1, 1], block: 7 },  // xenonite crew-pad
        { op: 'flora', from: [4, 1, 1], to: [7, 5, 3], amount: 0.20, bloom: 0.5 },
        { op: 'set', at: [2, 4, 6], block: 4 }     // an ammonia seep in the plain west wall
      ],
      sources: [
        { at: [15, 3, 12], kind: 'grind' },
        // ship-life west of the murder wall — nowhere near the eat/clear region at x29+
        { at: [4, 2, 4], kind: 'skitter' },
        { at: [24, 4, 5], kind: 'drone' },
        { at: [5, 2, 1], kind: 'skitter' }
      ],
      folk: [
        { at: [15, 3, 12], name: 'GRACE', kind: 'human', chord: '—',
          line: 'He is on the far side of the hull, working the way he always is, and the grinding comes to me clean through the xenonite. He scraped this green off a rock at a star nobody sane would stop at — a dead little world, wet with the one thing in the universe that eats the thing that is killing us both. He found it and could not carry it. I could not have found it in a thousand years. Here we are.' }
      ],
      labels: [
        { at: [8, 3, 6],   block: 17, text: 'THE DISH — the living green; Q to lift, R to set it against the red', color: '#39e66a' },
        { at: [31, 4, 7],  block: 14, text: 'THE WALL OF MURDER — astrophage; the hole made solid. Set the green here.', color: '#ff5a4d' },
        { at: [15, 4, 11], block: 13, text: 'HIS HULL — cast xenonite; his machine grinds through it', color: '#a9e8bd' },
        { at: [37, 3, 7],  block: 15, text: 'THE WAY ON — it rings once the red is gone', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'I know this silence. I have known it since the vault under Erid — the patch of the world that does not come home, the hole you find by the shape of what is missing around it. Only now the hole is a WALL, a whole wall of the murder, poured across the only way on, and no shout of mine will ever open it, because there is nothing there to answer. I came forty-two light years and buried twenty-three of my people to stand in front of it, and I have nothing that bites it.' },
        { at: 'start', chord: '♩♩♪',  text: 'Except I do. It is in the dish at my feet, and it is GREEN, and it is alive, and he pulled it out of a puddle on a rock that neither of our peoples would have crossed the road for. It eats the red. That is all it does, and it is everything. So I will not build, and I will not shout. I will lift a little of it, and set it against the wall, and then I will do the hardest thing an engineer is ever asked to do — I will stand back, and wait, and let something that is not me do the work. Listen. It sings where the murder was.' },
        { at: 'solved', chord: '♩♪♪♩', text: 'The red is gone. Every cell of it, eaten and gone green, and the corridor rings now where a moment ago it was a hole in the world. The cure for the thing that eats stars was scum on a planet nobody wanted, and it took a man with no ship to find it and an engineer with no eyes to carry it, and neither of us was ever going to be enough alone — that is not a sad thing, it is the whole of how anything has ever been saved. I lift the living green aside, and I walk through the place where the murder used to be, and it is warm, and it is loud, and it is ALIVE.', banner: 'IT WAS ALIVE THE WHOLE TIME' }
      ]
    },

    /* ==============================================================
     * ACT VI.26 — BREEDING
     *
     * The forge grew up. In Act II it turned dead grit into a voice; here it turns
     * pond-scum into a passenger. One strain has to do three impossible things at once —
     * EAT the astrophage that is killing two stars, SURVIVE Rocky's twenty-nine atmospheres
     * of ammonia, and SURVIVE Grace's air, the slow-fire oxygen that would burn anything of
     * his. No single culture does all three. You get there the only way anyone ever gets
     * anywhere in biology: you try, and it dies, and the way it died tells you the next thing
     * to change.
     *
     * THE TEACHABLE HEART is the FEED ORDER. canMake fires the FIRST satisfied recipe
     * eagerly, and the corpses come first in the tree — so if you drop the living taumoeba in
     * with only ONE partner present, the forge settles for a corpse before you can add the
     * second. Load BOTH DEAD THINGS FIRST (the red astrophage and his orange air, neither of
     * which triggers anything alone) and add the GREEN CULTURE LAST.
     * ============================================================== */
    {
      id: 'breeding',
      name: 'Breeding',
      world: { w: 42, h: 12, d: 14 },
      spawn: [4, 3, 7],
      objective: 'Breed one strain that does three impossible things: eats the red astrophage, survives your ammonia, survives his air. LOAD BOTH DEAD THINGS FIRST — the red, then his air — and drop the living green culture in LAST. Add the culture too early with only one of them and you brew a corpse; read its note to hear which sky you forgot.',
      exit: [32, 3, 7],
      bred: 'breed_live',
      showAstro: true,   // the red is an ingredient you fetch and feed — it must be visible
      forges: [{ at: [24, 2, 7] }],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [41, 11, 13], block: 1 },
        { op: 'room', from: [2, 1, 3], to: [33, 8, 11], floor: 2 },
        // the three bays — generous (6 each), re-fetchable, so a corpse costs a walk
        { op: 'fill', from: [8, 2, 4], to: [10, 2, 5], block: 14 },    // ASTROPHAGE (the red)
        { op: 'fill', from: [8, 2, 9], to: [10, 2, 10], block: 19 },   // HIS AIR (orange)
        { op: 'fill', from: [15, 2, 6], to: [16, 2, 8], block: 17 },   // TAUMOEBA (the culture — add LAST)
        // the shelf where the dead ones pile
        { op: 'fill', from: [27, 2, 6], to: [30, 2, 6], block: 1 },
        // Grace, behind cast xenonite: present, singing, out of reach
        { op: 'fill', from: [34, 1, 3], to: [34, 8, 11], block: 13 },
        { op: 'room', from: [35, 1, 5], to: [38, 6, 9], floor: 2 },

        /* --- THE INCUBATOR HALL, LIVED-IN (all bays are at y2; flora is y4+ only) --- */
        { op: 'flora', from: [1, 4, 2], to: [33, 9, 11], amount: 0.14, bloom: 0.45 },
        { op: 'fill', from: [3, 5, 3], to: [3, 5, 7], block: 3 },   // a girder shelf-gallery (verticality)
        // A CREW ALCOVE carved 2 deep into the NORTH wall at the quiet west end (shell z0 intact)
        { op: 'room', from: [4, 1, 1], to: [7, 4, 2], floor: 2 },
        { op: 'set', at: [5, 1, 1], block: 7 }, { op: 'set', at: [6, 1, 1], block: 7 },  // xenonite crew-pad
        { op: 'flora', from: [4, 1, 1], to: [7, 5, 3], amount: 0.18, bloom: 0.5 },
        { op: 'set', at: [2, 5, 6], block: 4 }     // ammonia seep in the plain west wall
      ],
      sources: [
        { at: [36, 3, 7], kind: 'grind' },
        { at: [20, 3, 10], kind: 'drip' },
        // life along the hall, none of it near the y2 bays
        { at: [4, 2, 4], kind: 'skitter' },
        { at: [13, 5, 3], kind: 'warble' },
        { at: [5, 2, 1], kind: 'skitter' }
      ],
      folk: [
        { at: [36, 3, 7], name: 'GRACE', kind: 'human', chord: '—',
          line: 'He is right there through the glass, at his machine, grinding away, and every time my forge hands me another grey little corpse I hear him go still for a moment, and then start again. He cannot help me. His hands are the wrong shape and his air would kill the very thing we need and he knows it. So he waits. He has been waiting a long time. So have I. This is the one I do alone, with him listening.' }
      ],
      labels: [
        { at: [9, 3, 4],  block: 14, text: 'ASTROPHAGE — the red; the murderer it must learn to EAT',      color: '#ff5a4d' },
        { at: [9, 3, 9],  block: 19, text: 'HIS AIR — the slow fire; a strain must SURVIVE it to ride his ship', color: '#e8730f' },
        { at: [15, 3, 7], block: 17, text: 'TAUMOEBA — the living culture; add THIS ONE LAST',             color: '#39e66a' },
        { at: [24, 3, 7], block: 12, text: 'THE INCUBATOR — load the RED and HIS AIR first, THEN the green', color: '#ff8a3c' },
        { at: [28, 3, 6], block: 1,  text: 'THE SHELF — where the dead strains pile; each one is a sentence', color: '#8a8175' },
        { at: [34, 4, 7], block: 13, text: 'GRACE — through the glass, grinding, waiting for one that lives', color: '#a9e8bd' },
        { at: [32, 3, 7], block: 15, text: 'THE WAY ON — it hums the moment a strain lives',               color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'One bug. It has to do three things that no one bug does. It has to EAT the astrophage — the red, the hole in the world, the thing eating both our stars. It has to live in my ammonia, twenty-nine atmospheres of it, hot. And it has to live in HIS air, the slow fire, the oxygen, which burns anything of mine that so much as thinks about it. Eat the murderer, breathe two skies. There is no such creature. I am going to make one anyway.' },
        { at: 'start', chord: '♩♩♪', text: 'And there is a trick to it, and it is grim, and it is this: the incubator is greedy. Feed it the living green culture while only ONE partner is in the jar and it stops right there and hands me a corpse — it will not wait for the second. So I load the dead things FIRST. The red, then his air. Neither of those does anything on its own; the forge just holds them. THEN, last of all, I drop the green in, and only then are all three in the jar at once. Get it wrong and it dies, but a dead one is not nothing — the little grey body tells me exactly which sky I forgot. Read the corpse. Fetch what it asks for. Try again.' },
        { at: 'solved', chord: '♩♪♪♩', text: 'It is moving. I fed it the red and it ATE — it took the murderer down like it was owed. I gave it my ammonia and it held. I gave it one breath of his, the slow fire, the thing that has killed every strain before it on this shelf — and it is STILL MOVING. One bug. Two skies. It ate the thing that is killing us and it can ride in either ship. There is a small heap of the dead ones beside me who got me here, and I am not going to pretend they were not the whole of it. Grace has gone quiet through the glass. I think he can tell.', banner: 'IT LIVES — ONE BUG, TWO SKIES' }
      ]
    },

    /* ==============================================================
     * ACT VI.27 — THE BETRAYAL OF PHYSICS
     *
     * The one that should not be possible. For twenty-six chapters xenonite has been the good
     * news — it sings, it carries the voice a body cannot cross a vacuum to deliver, it is
     * GREEN, and green is life, and the way out. Now Rocky sets the living cure (taumoeba,
     * greener still) down in a bay, pulses, and hears it ON THE FAR SIDE OF A XENONITE WALL.
     * Not through a gap. Through the solid. The floor under his feet is a sieve and he never
     * knew. The only thing that holds it is the one material he has cursed since the first
     * warren: GRIT, deaf and dead. Death contains life.
     *
     * MECHANIC — LEAK + CONTAIN (no new engine): life.through:[0,7,13,17] makes the taumoeba
     * SPREAD (audibly) into air and xenonite; contain{sample,outside} is a flood that leaks if
     * it reaches the corridor. Grit(9) is in neither set — the only wall that holds. The porous
     * behaviour lives ONLY on this chapter's data; xenonite is untouched everywhere else.
     * ============================================================== */
    {
      id: 'betrayal',
      name: 'The Betrayal of Physics',
      world: { w: 34, h: 12, d: 13 },
      spawn: [4, 3, 8],
      objective: 'The taumoeba is loose in the bay, and it leaks straight through xenonite — the one material this whole game has trusted. Wall the breach. Only grit holds it.',
      exit: [31, 3, 9],
      life: { region: [[14, 2, 4], [16, 4, 7]], through: [0, 7, 13, 17], period: 0.5 },
      contain: {
        sample:  [[15, 2, 4], [15, 2, 5]],
        outside: [[15, 2, 8], [15, 3, 8], [4, 2, 8], [31, 2, 9]]
      },
      build: [
        { op: 'fill', from: [0, 0, 0], to: [33, 11, 12], block: 1 },
        // THE WALKWAY / THE OUTSIDE: where Rocky stands, and where a leak must never reach
        { op: 'room', from: [2, 1, 8], to: [32, 6, 11], floor: 2 },
        // THE BAY: a sealed rock pocket behind the walkway, air inside
        { op: 'fill', from: [14, 2, 4], to: [16, 4, 6], block: 0 },
        // THE BREACH: two open cells through the z=7 wall — THIS is what you wall
        { op: 'fill', from: [15, 2, 7], to: [15, 3, 7], block: 0 },
        // THE SAMPLE: taumoeba, loose in the bay, already spreading
        { op: 'set', at: [15, 2, 4], block: 17 },
        { op: 'set', at: [15, 2, 5], block: 17 },
        // THE WRONG ANSWER (generous): xenonite. Try it first. It will betray you.
        { op: 'fill', from: [9, 2, 11], to: [11, 3, 11], block: 7 },
        // THE RIGHT ANSWER (generous): grit. Deaf, dead, and the only thing that holds.
        { op: 'fill', from: [4, 2, 11], to: [6, 3, 11], block: 9 },
        // GRACE, behind his own cast-xenonite hull — it still SINGS his voice through, the
        // very stuff that will not hold the bug (the cruel joke of the whole chapter)
        { op: 'fill', from: [20, 2, 11], to: [22, 5, 11], block: 13 },
        { op: 'fill', from: [20, 2, 12], to: [22, 4, 12], block: 0 },

        /* --- THE WALKWAY, LIVED-IN (y4+ only; bay/breach region z4-7 and the leak's y2-3 cells
         *     untouched; no new AIR anywhere, so no leak path can open) --- */
        { op: 'flora', from: [1, 4, 8], to: [18, 7, 11], amount: 0.13, bloom: 0.4 },    // west of Grace
        { op: 'flora', from: [24, 4, 8], to: [32, 7, 11], amount: 0.13, bloom: 0.4 },   // east of Grace (x19-23 bare)
        // A RAISED CREW NOOK east of Grace (all SOLID at y4 — cannot open a leak path)
        { op: 'fill', from: [24, 4, 9], to: [27, 4, 9], block: 3 },    // girder gallery ledge (verticality)
        { op: 'fill', from: [25, 4, 10], to: [27, 4, 11], block: 2 },  // a plate shelf-nook
        { op: 'set', at: [26, 4, 11], block: 7 },                      // xenonite rest-pad on the shelf
        { op: 'flora', from: [24, 5, 10], to: [28, 7, 11], amount: 0.16, bloom: 0.5 },
        { op: 'set', at: [2, 4, 9], block: 4 }     // ammonia seep in the plain west wall
      ],
      sources: [
        { at: [21, 3, 12], kind: 'grind' },
        // life along the walkway, all clear of the breach and the monitored outside cells
        { at: [3, 2, 9], kind: 'skitter' },
        { at: [30, 4, 10], kind: 'warble' },
        { at: [27, 4, 11], kind: 'drone' }
      ],
      folk: [
        { at: [21, 3, 12], name: 'GRACE', kind: 'human', chord: '—',
          line: 'He is right there, past a wall of his own hull — and his hull is xenonite, and it sings his machine straight through to me, so I hear HIM perfectly through the very stuff that will not hold the cure. He cannot know what I have just learned: this wall keeps his voice and would lose the bug. If the strain gets loose in my ship there is no him, no home, no point to a single one of the light-years. He is humming to himself. He does not know. I am going to make very sure he never has to.' }
      ],
      labels: [
        { at: [15, 2, 4], block: 17, text: 'TAUMOEBA — the cure, and it will not stay put', color: '#39e66a' },
        { at: [16, 3, 7], block: 1,  text: 'THE BREACH — wall it, or it is loose in the ship', color: '#e8730f' },
        { at: [10, 3, 11], block: 7, text: 'XENONITE — it sings. It leaks. It will betray you.', color: '#57e08a' },
        { at: [5, 3, 11],  block: 9, text: 'GRIT — deaf, dead, cursed. The one thing that HOLDS it.', color: '#8a5a4a' },
        { at: [21, 4, 11], block: 13, text: 'GRACE — his voice still comes through the xenonite', color: '#e8730f' },
        { at: [31, 3, 9], block: 15, text: 'THE WAY ON', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'I have carried this sample across the light of a dead star and I have never once been afraid of it. It is the greenest thing there is. Green is life. Green is xenonite. Green is the way out — green is every good thing this world has ever handed me. And I set it down in the bay, and I pulsed, and it was already on the FAR side of the wall. Not through a gap. Through the wall. Through xenonite. The solid thing under my feet is a sieve, and I trusted it with everything, and I never knew.' },
        { at: 'start', chord: '♩♩♪', text: 'So I do the thing my people have always done: I build it a box. Xenonite, of course — clean panes, airtight, singing. Except I have just watched it walk through xenonite like the wall was a rumour. There is exactly one thing in reach it will not cross, and it is the thing I have cursed since the first warren — grit. Deaf, dead, soundless grit. The material that means death is the only wall that will hold the thing that means life. I hate this. I am going to do it anyway.' },
        { at: 'solved', chord: '♩♪♪♩', text: 'Grit. Of course it was grit. The bloom ran up against the dead wall and stopped like it had reached the edge of the world, and behind it the cure sits quiet, and caged, and mine. Everything I trusted leaks. The one material I buried a curse in is the one that holds. I count the generations in sixes to be sure of it, and it is sure: the green does not cross the grey. Death holds life. I will take that home.', banner: 'XENONITE DOES NOT HOLD IT' }
      ]
    },

    /* ==============================================================
     * ACT VI.28 — THE TURN
     *
     * The only choice in the game, and the game refuses to make it. Grace is dying, and his
     * ship is already turned for home. Rocky is carrying the one cure-and-fuel there will ever
     * be. He can give it to HIS ship (he lives; he reaches a home he will be seen in; he
     * finishes the mission alone, and dies out here doing it) or keep it for the MISSION (the
     * thing twenty-three people died to reach; he lets him go). BOTH STARS WARM EITHER WAY —
     * that is the whole cruelty and the whole mercy of it: the branch is not which world lives
     * (both do), it is which GOODBYE Rocky gets. Which is exactly why it has to be the player's,
     * and why the game will not score it. Two arms of a Y, mirror-image to the cell; both arches
     * hum identically; down one he can hear Grace, alive; down the other, only the beacon. Walk
     * into one and it latches. There is no walking back.
     * ============================================================== */
    {
      id: 'turn',
      name: 'The Turn',
      world: { w: 56, h: 12, d: 25 },
      spawn: [6, 3, 12],
      objective: 'You are carrying the only cure-and-fuel there will ever be. One arch is Grace’s ship, turned for home — give it to him and he lives, and you finish this alone. The other is the mission twenty-three people died to reach. Both stars warm either way; the only difference is the goodbye. This is the one question the game will not answer. Carry the sample — both arches will call — and walk into the one you can live inside.',
      hold: 17,
      exits: [
        { id: 'grace',   at: [44, 3, 18], line: { chord: '♪♩♪', text: 'Go home, Grace. Go and be seen.' } },
        { id: 'mission', at: [44, 3, 6],  line: { chord: '♪♩♪', text: 'I kept it. He would have kept it too. That is why I could let him go.' } }
      ],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [55, 11, 24], block: 1 },
        // THE STEM — on the mirror axis (z 9..15, centre 12). He spawns here; the cure is here.
        { op: 'room', from: [3, 1, 9], to: [26, 8, 15], floor: 2 },
        // GRACE ARM (+z)
        { op: 'room', from: [24, 1, 15], to: [36, 8, 19], floor: 2 },
        { op: 'room', from: [36, 1, 15], to: [46, 8, 21], floor: 2 },
        { op: 'fill', from: [47, 1, 15], to: [47, 8, 21], block: 13 },   // his hull — sings
        { op: 'room', from: [48, 1, 16], to: [50, 6, 20], floor: 2 },
        // MISSION ARM (-z): EXACT MIRROR, every z -> 24-z
        { op: 'room', from: [24, 1, 5], to: [36, 8, 9], floor: 2 },
        { op: 'room', from: [36, 1, 3], to: [46, 8, 9], floor: 2 },
        { op: 'fill', from: [47, 1, 3], to: [47, 8, 9], block: 13 },
        { op: 'room', from: [48, 1, 4], to: [50, 6, 8], floor: 2 },
        // THE CURE, at the stem, at his feet
        { op: 'set', at: [9, 2, 12], block: 17 },

        /* --- SYMMETRIC SHIP-LIFE (mirror across z=12; both arms decorated IDENTICALLY, so the
         *     choice stays pure — Grace grinding down the +z arm is the only intended asymmetry) --- */
        { op: 'flora', from: [3, 4, 9],  to: [26, 9, 15], amount: 0.13, bloom: 0.45 },  // stem (symmetric about z12)
        { op: 'flora', from: [24, 4, 15], to: [46, 9, 21], amount: 0.13, bloom: 0.45 }, // GRACE arm  (hull x47+ excluded)
        { op: 'flora', from: [24, 4, 3],  to: [46, 9, 9],  amount: 0.13, bloom: 0.45 }, // MISSION arm (exact mirror)
        { op: 'fill', from: [10, 4, 10], to: [10, 4, 14], block: 3 },   // mirrored girder gallery on the stem
        // A CREW ALCOVE at the stem's west wall, centred on z12 (shell x0 intact) — symmetric
        { op: 'room', from: [1, 1, 11], to: [2, 4, 13], floor: 2 },
        { op: 'set', at: [1, 1, 12], block: 7 },                        // xenonite crew-pad
        { op: 'flora', from: [1, 1, 11], to: [2, 5, 13], amount: 0.20, bloom: 0.5 },
        { op: 'set', at: [3, 5, 11], block: 4 }, { op: 'set', at: [3, 5, 13], block: 4 }  // mirrored ammonia seeps
      ],
      sources: [
        { at: [49, 3, 17], kind: 'grind' },   // his machine — down the GRACE arm ONLY
        // ambient life on the STEM ONLY, mirrored about z12, so the two arms stay identical
        { at: [5, 2, 10], kind: 'skitter' },
        { at: [5, 2, 14], kind: 'skitter' },
        { at: [20, 4, 12], kind: 'warble' }
      ],
      folk: [
        { at: [49, 3, 18], name: 'GRACE', kind: 'human', chord: '—',
          line: 'He is right there, through a hand-span of singing rock, and he is going. His ship is already pointed home — he turned it before he got too weak to — and if I carry this to him he makes it, and somebody sees him walk off it. I can hear how much of him is left. It is not much. It is enough to get home on, if I give him the thing in my arms.' }
      ],
      labels: [
        { at: [9, 3, 12],  block: 17, text: 'THE CURE — the one sample. Carry it, then choose.', color: '#57e08a' },
        { at: [44, 3, 18], block: 15, text: 'TOWARD GRACE’S SHIP — home, and him alive',      color: '#4dff9e' },
        { at: [44, 3, 6],  block: 15, text: 'TOWARD THE MISSION — the thing they died for',   color: '#4dff9e' },
        { at: [47, 4, 18], block: 13, text: 'HIS HULL — cast xenonite; that grinding is Grace', color: '#a9e8bd' },
        { at: [47, 4, 6],  block: 13, text: 'THE FAR HULL — cast xenonite; quiet beyond it',    color: '#a9e8bd' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'Two ways out, and one sample, and for the first time since I left Erid there is no gauge to read, no number to trust, nobody to ask. I have carried a question the whole voyage and told myself it was "can it be fixed". It can. The question was always going to be this one instead, and it was always going to be mine to answer, and I am standing at the fork of it now with the answer in my arms.' },
        { at: 'start', chord: '♩♩♪', text: 'Down the one arm I can hear him — his machine, his hull, him, turned toward a home he reaches if I give him this. Down the other there is only the mission, humming the exact same as his arch, no louder, no nearer, asking nothing at all. Both of them warm the sky. Only one of them lets me say goodbye to his face. I do not get told which is right — there is no right — there is only the one I can still be inside of, after. So. Which of these can I carry home and live.' },
        { at: 'solved', chord: '♩♪♩', text: 'It is in my arms. Both arches are calling now, exactly alike, the way they should. Whichever one I walk into, I walked into it on purpose.', banner: 'BOTH WAYS ARE OPEN' }
      ]
    },

    /* ==============================================================
     * ACT VI.29 — HOME
     *
     * The end. The Cold (Chapter 1) opened the game with three heat gauges that had all FALLEN —
     * "it is not my vents that are failing, it is the sky." Home is that exact scene played
     * backwards: same warren, same three halls, same nominal, same base six — but the numbers are
     * climbing home, and there is nothing left to solve but the reading of them and the walk to one
     * warm arch. Erid is warm again; a planet Rocky will never stand on is warm again; two dying
     * suns are not dying. And the gut-punch, stated plainly then dropped: Rocky has no eyes, and
     * never will, and is out here in the dark, and NEVER SEES ANY OF IT. It is enough. It has to be.
     * ============================================================== */
    {
      id: 'home',
      name: 'Home',
      world: { w: 28, h: 12, d: 20 },
      spawn: [6, 3, 9],
      exit: [22, 2, 9],
      objective: 'The warren is warm again. Read the three gauges one last time, and go to the arch.',
      build: [
        { op: 'fill', from: [0, 0, 0], to: [27, 11, 19], block: 1 },
        { op: 'room', from: [3, 1, 4], to: [24, 7, 15], floor: 2 },
        // a heat vent by the arch — the warmth come back into the stone
        { op: 'set', at: [22, 4, 9], block: 5 },
        // worn, not built — the same gnawed warren, just no longer cold
        { op: 'roughen', from: [2, 1, 2], to: [25, 8, 17], amount: 0.20, passes: 1 },
        { op: 'rubble', from: [4, 2, 5], to: [23, 5, 14], amount: 0.04 },
        { op: 'set', at: [22, 2, 9], block: 15 },

        /* --- LIFE RETURNING TO THE WARREN (lush, but small; gauges/arch/vent are non-rock, skipped) --- */
        { op: 'flora', from: [2, 1, 3], to: [24, 8, 16], amount: 0.22, bloom: 0.5 },   // moss + bloom creeping back
        { op: 'set', at: [21, 8, 9], block: 21 }, { op: 'set', at: [23, 8, 8], block: 21 },  // a warm bloom-halo over the arch
        // A RESTORED REST-NOOK carved into the south wall (shell z19 intact), away from the gauges
        { op: 'room', from: [6, 1, 16], to: [10, 4, 18], floor: 2 },
        { op: 'set', at: [7, 1, 17], block: 7 }, { op: 'set', at: [8, 1, 17], block: 7 },  // xenonite rest-pad
        { op: 'flora', from: [6, 1, 16], to: [10, 5, 18], amount: 0.28, bloom: 0.55 },     // his nook, lush again
        { op: 'set', at: [4, 4, 5], block: 4 }     // a green life-seep in a plain corner wall
      ],
      sources: [
        { at: [22, 4, 9], kind: 'vent' },
        // life is back: something small in the grit, a call and an answer, a hum by the vent, and the nook inhabited
        { at: [5, 2, 6], kind: 'skitter' },
        { at: [12, 4, 12], kind: 'warble' },
        { at: [22, 5, 9], kind: 'drone' },
        { at: [8, 2, 16], kind: 'skitter' }
      ],
      labels: [
        { at: [10, 1, 8], block: 2,  text: 'WORKSHOP — warm again',       color: '#ffb020' },
        { at: [14, 1, 8], block: 2,  text: 'THROAT — warm again',         color: '#ffb020' },
        { at: [18, 1, 8], block: 2,  text: 'DEEP HALL — still climbing',  color: '#ffb020' },
        { at: [22, 2, 9], block: 15, text: 'HOME', color: '#ffb020' }
      ],
      /* THE SAME GAUGES AS THE COLD, RESTORED. Nominal 96 (base six 240), unchanged. In The Cold
       * these read 91/88/84 and every one had FALLEN; here they read 96/95/93 — at nominal, or a
       * breath under and climbing. The deepest hall, farthest from the sun, warms last. */
      gauges: [
        { id: 'g1', at: [10, 3, 8], name: 'Workshop',  nominal: 96, reading: 96 },
        { id: 'g2', at: [14, 3, 8], name: 'Throat',    nominal: 96, reading: 95 },
        { id: 'g3', at: [18, 3, 8], name: 'Deep hall', nominal: 96, reading: 93 }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'My workshop. I have stood in this exact dark ten thousand times, and every time before this one it was a little colder than the last. Not tonight. Tonight it is warm, and it is warm everywhere, and I keep waiting for that to turn out to be a mistake.' },
        { at: 'start', chord: '♩♩♪',  text: 'Three halls, three gauges. Once they only ever fell. I have come to read them one more time — not because I doubt it. Because I want to hear the numbers climb, in sixes, back up to where they started.' },
        { at: 'all_gauges', chord: '♩♪♪♩',
          text: 'Ninety-six. Home. The workshop reads exactly what it read when I was young; the throat is one breath behind it; the deep hall is still climbing, slow, in sixes, the way heat always came back. Erid is warm. Somewhere I will never stand, a planet I will never hear is warm too, and two suns that were going out are not going out. I did the work. I turned up. And I will never see any of it — I have no eyes, I never will, I am out here in the dark, and the warmth is for someone else, in rooms I will never be in. It is enough. It has to be. It is.',
          alt: 'Ninety-six. Home. The workshop reads exactly what it read when I was young; the throat is one breath behind it; the deep hall is still climbing, slow, in sixes, the way heat always came back. Erid is warm. And Grace is home under his own sun, being seen — a thing I cannot picture and did the arithmetic for anyway. Two suns that were going out are not going out. I did the work. I turned up. And I will never see any of it — I have no eyes, I never will, I am out here in the dark, and the warmth is for someone else, in rooms I will never be in. It is enough. It has to be. It is.',
          banner: 'WARM AGAIN — AND YOU NEVER SEE IT' }
      ]
    }
  ];
});
