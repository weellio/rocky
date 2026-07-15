/* ROCKY SAVES THE UNIVERSE — ACT I — THE COLD
 *
 * Erid is dying and nobody can see it happen. Rocky is a maintenance engineer. He is not chosen; he is simply the one who is there.
 *
 * Levels only. The RULES live in config.js; these files are just the rooms the rules
 * happen in. js/chapters.js stitches every act back into one ordered list, and the
 * order in THAT file is the order you play them in — not the order they load.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else ((root.ROCKY_ACTS = root.ROCKY_ACTS || {})['act1_erid'] = factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    {
      id: 'cold',
      name: 'The Cold',
      world: { w: 44, h: 22, d: 44 },
      spawn: [22, 6, 34],
      exit: [34, 2, 10],
      objective: 'The warren is cooling. Find the heat gauges and read them.',
      /* The room is DATA. A level is a list of ops, not a hand-placed array. */
      build: [
        { op: 'fill', from: [0, 0, 0], to: [43, 21, 43], block: 1 },
        { op: 'room', from: [16, 1, 26], to: [30, 8, 40], floor: 2 },
        { op: 'room', from: [20, 1, 14], to: [26, 6, 26], floor: 2 },
        { op: 'room', from: [6, 1, 4], to: [30, 10, 16], floor: 2 },
        { op: 'room', from: [30, 1, 6], to: [38, 14, 14], floor: 2 },
        { op: 'fill', from: [22, 1, 12], to: [24, 4, 15], block: 0 },
        { op: 'fill', from: [29, 1, 8], to: [31, 5, 12], block: 0 },
        { op: 'fill', from: [17, 8, 27], to: [29, 8, 39], block: 3 },
        { op: 'fill', from: [17, 8, 30], to: [29, 8, 36], block: 0 },
        { op: 'fill', from: [18, 1, 27], to: [18, 5, 27], block: 4 },
        { op: 'fill', from: [18, 5, 27], to: [18, 5, 39], block: 4 },
        { op: 'fill', from: [28, 1, 39], to: [28, 6, 39], block: 4 },
        { op: 'fill', from: [7, 1, 5], to: [7, 9, 5], block: 3 },
        { op: 'fill', from: [29, 1, 15], to: [29, 9, 15], block: 3 },
        { op: 'fill', from: [8, 5, 6], to: [14, 5, 10], block: 3 },
        { op: 'fill', from: [10, 6, 7], to: [12, 6, 9], block: 9 },
        { op: 'fill', from: [31, 1, 7], to: [37, 1, 13], block: 9 },
        { op: 'set', at: [24, 2, 39], block: 5 },
        { op: 'set', at: [25, 2, 39], block: 5 },
        { op: 'set', at: [12, 3, 4], block: 5 },
        { op: 'set', at: [34, 6, 6], block: 7 },
        { op: 'set', at: [35, 6, 6], block: 7 },
        { op: 'fill', from: [6, 4, 16], to: [10, 7, 16], block: 8 },

        /* ERID IS A WARREN. It was not built, it was WORN — so gnaw the walls until
         * nothing is flat, hang teeth off the ceilings, and drop the rubble that came
         * down long ago. (These ops only ever eat ROCK, so every alcove a puzzle
         * depends on stays exactly as thick as it was measured to be.) */
        /* A PULSE HAS TO FIT INSIDE ONE FRAME, and air is what a pulse costs: every
         * cell of rock you chew away is another cell the wavefront has to cross
         * twenty-six ways. So the warren is gnawed where you walk (y 1-10) and left
         * alone in the roof, and the rubble and the teeth put some of the stone back. */
        { op: 'roughen', from: [2, 1, 2], to: [41, 13, 41], amount: 0.30, passes: 2 },
        { op: 'cave', at: [22, 5, 21], r: 6, ry: 4, wobble: 0.45 },
        { op: 'cave', at: [10, 5, 33], r: 4, ry: 3, wobble: 0.5 },
        { op: 'tunnel', from: [22, 4, 30], to: [22, 4, 17], r: 1.9, wander: 0.8 },
        { op: 'spikes', from: [3, 4, 3], to: [40, 13, 40], amount: 0.13 },
        { op: 'rubble', from: [3, 2, 3], to: [40, 8, 40], amount: 0.13 },
        { op: 'set', at: [34, 2, 10], block: 15 }
      ],
      sources: [
        { at: [24, 3, 39], kind: 'vent' },
        { at: [12, 4, 4], kind: 'vent' },
        { at: [18, 3, 33], kind: 'pipe' },
        { at: [28, 4, 39], kind: 'drip' }
      ],
      /* The gauges. Each reads a temperature, in base six, and each has
       * drifted DOWN from where it should sit. That drift is the plot. */
      gauges: [
        { id: 'g1', at: [20, 3, 30], name: 'Workshop', nominal: 96, reading: 91 },
        { id: 'g2', at: [25, 3, 20], name: 'Throat',   nominal: 96, reading: 88 },
        { id: 'g3', at: [14, 3, 8],  name: 'Deep hall', nominal: 96, reading: 84 }
      ],
      /* Rocky thinks in chords. The screen shows the chord and the meaning. */
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'My workshop. Twenty-two years of my life, and I know every stone of it by sound.' },
        { at: 'start', chord: '♩♩♪',  text: 'The heat is wrong. Not broken-wrong. Slow-wrong. Everywhere-wrong.' },
        { at: 'gauge', chord: '♪♪♩',  text: 'Cold. Again. Three halls, three gauges, and every one has fallen.' },
        { at: 'all_gauges', chord: '♩♪♪♩', text: 'It is not my vents that are failing. It is the sky.', banner: 'IT IS NOT MY VENTS THAT ARE FAILING. IT IS THE SKY.' }
      ]
    },
    /* ==============================================================
     * ACT I.2 — THE DEEP HALL
     * The first real puzzle, and the one that states the law the rest of the
     * game is played under: A LOCKED DOOR IS A ROUTING PROBLEM.
     *
     * A resonator sits in an alcove behind a grit plug. Grit costs 22 to cross
     * — it is a wall to sound — so no matter how hard Rocky shouts from the
     * hall, the ear hears nothing. There is no key. There are, deliberately,
     * several answers:
     *   1. LIFT THE GRIT OUT. It is carryable. The hole becomes air (cost 1) and
     *      your pulse walks straight in.
     *   2. BRIDGE IT WITH XENONITE. There is a block of it on the ledge. Xenonite
     *      costs 1.4 — very nearly a wire. Plug the channel with it instead and
     *      the sound conducts through.
     *   3. DROP THE GRIT ITSELF into the near alcove and let the BANG do it —
     *      a landing block is a loud noise, and it is loud right next to the ear.
     *   4. Climb the shaft and shout from the top, where the rock is thin.
     * All four work. None of them is special-cased anywhere in the code: they
     * are all just sound arriving at a listener.
     * ============================================================== */
    {
      id: 'deep',
      name: 'The Deep Hall',
      world: { w: 40, h: 20, d: 40 },
      spawn: [20, 3, 33],
      exit: [20, 2, 8],
      /* The two channels ARE the puzzle — every number in this level was measured
       * against how much rock sits around them. The cave ops do not touch them. */
      protect: [[[2, 1, 24], [14, 12, 34]]],
      objective: 'The council is behind that door. Get a sound to the resonator — any way you can.',
      build: [
        { op: 'fill', from: [0, 0, 0], to: [39, 19, 39], block: 1 },
        { op: 'room', from: [12, 1, 24], to: [28, 9, 38], floor: 2 },   // the hall you start in
        { op: 'room', from: [14, 1, 6], to: [26, 7, 16], floor: 2 },    // the council chamber, sealed
        { op: 'fill', from: [19, 1, 17], to: [21, 5, 23], block: 0 },   // the throat between them
        { op: 'fill', from: [19, 1, 17], to: [21, 5, 17], block: 8 },   // <- THE DOOR

        /* THE RESONATOR sits in an alcove buried in five cells of rock, so no
         * amount of shouting from the hall will ever reach it through the stone.
         * There are exactly two ways sound can get in, and both are honest: */

        // the alcove, and the ear at the back of it
        { op: 'fill', from: [4, 2, 29], to: [6, 4, 31], block: 0 },

        // CHANNEL A, low, at floor level — and its mouth is PACKED WITH GRIT,
        // which costs 22 to cross and is therefore stone deaf. Pull the plug and
        // the channel is air. Or seal it back up with xenonite, which costs 1.4,
        // and be heard straight through a solid wall.
        { op: 'fill', from: [7, 3, 30], to: [11, 3, 30], block: 0 },
        { op: 'set', at: [11, 3, 30], block: 9 },                       // <- THE GRIT PLUG

        // CHANNEL B, high, wide open, and a long way round — its mouth is eight
        // blocks up the hall's west wall. From the floor it is far too far and
        // too crooked for a shout to survive. CLIMB to it and shout down it, and
        // the ear hears you perfectly well. (Or drop something heavy in.)
        { op: 'fill', from: [5, 8, 30], to: [11, 8, 30], block: 0 },
        { op: 'fill', from: [5, 5, 30], to: [5, 7, 30], block: 0 },

        // a block of xenonite on a ledge, and a girder to reach it
        { op: 'fill', from: [24, 4, 33], to: [27, 4, 36], block: 3 },
        { op: 'set', at: [25, 5, 34], block: 7 },
        { op: 'set', at: [26, 5, 35], block: 7 },

        { op: 'fill', from: [16, 1, 36], to: [17, 3, 36], block: 4 },
        { op: 'set', at: [24, 2, 37], block: 5 },

        // worn, not built
        { op: 'roughen', from: [2, 1, 2], to: [37, 14, 37], amount: 0.32, passes: 2 },
        { op: 'cave', at: [20, 5, 31], r: 6, ry: 4, wobble: 0.45 },
        { op: 'spikes', from: [3, 5, 3], to: [36, 12, 36], amount: 0.06 },
        { op: 'rubble', from: [3, 2, 3], to: [36, 8, 36], amount: 0.07 },
        { op: 'set', at: [20, 2, 8], block: 15 }
      ],
      sources: [
        { at: [24, 3, 37], kind: 'vent' },
        { at: [16, 2, 36], kind: 'pipe' }
      ],
      gauges: [],
      /* `needs` is tuned against MEASURED numbers, not guessed ones. The suite
       * plays every route and prints what the ear actually heard:
       *     shout from the hall floor .............. 20%   (nothing happens)
       *     shout with your nose against the wall .. 38%   (still nothing)
       *     drop a block at the wall ............... 41%   (still nothing)
       *   --------------------------------------------- needs 45%
       *     CLIMB to channel B and shout down it ... 53%   OPEN
       *     seal channel A with xenonite ........... 66%   OPEN
       *     pull the grit plug out of channel A .... 67%   OPEN
       * Set it at 35 and a player solves it by accident, standing near a wall,
       * having understood nothing. The threshold is where the puzzle lives. */
      ears: [
        { id: 'e1', at: [4, 3, 30], needs: 0.45, opens: 'd1' }
      ],
      doors: [
        { id: 'd1', cells: [[19, 1, 17], [20, 1, 17], [21, 1, 17], [19, 2, 17], [20, 2, 17], [21, 2, 17], [19, 3, 17], [20, 3, 17], [21, 3, 17], [19, 4, 17], [20, 4, 17], [21, 4, 17], [19, 5, 17], [20, 5, 17], [21, 5, 17]] }
      ],
      lines: [
        { at: 'start', chord: '♩♪♪', text: 'The council will not meet me. Forty-one engineers, and every one of them wants to hear it from the gauges, not from me.' },
        { at: 'start', chord: '♪♩♩♪', text: 'Their door listens. It always has. But somebody has packed the listening-channel with grit, and grit is DEAF. Amusing. Somebody did not want to be disturbed.' },
        { at: 'ear', chord: '♪♪♩♩', text: 'It heard me!' },
        { at: 'all_doors', chord: '♩♩♪♩', text: 'Now they will hear me too. Question: will they believe me.' }
      ]
    },
    /* ==============================================================
     * ACT I.3 — CONSENSUS
     * Eridians have no government, no war, and no way to make anybody do
     * anything. To act, the engineers must AGREE — so this door has THREE
     * resonators on it and opens for none of them alone. You must make the
     * same argument three times, from three places, and each one is deaf in a
     * different way:
     *
     *   VOTH  is behind a grit wall. Pull it out, or bridge it with xenonite.
     *   ARK   is at the bottom of a shaft. Sound will not turn that corner
     *         loudly enough — so climb DOWN the shaft (SHIFT) and shout in it,
     *         or drop something heavy down it and let the bang argue for you.
     *   SEVEN is across a room floored with GRIT, which eats every footfall and
     *         every echo. Get closer, or bridge the grit with xenonite, or go
     *         over it along the girder.
     *
     * The point of the level is that no single trick opens it. You need the
     * whole vocabulary at once, and that is what makes it the last level of the
     * act rather than the first.
     * ============================================================== */
    {
      id: 'consensus',
      name: 'Consensus',
      world: { w: 44, h: 20, d: 44 },
      spawn: [22, 3, 36],
      exit: [22, 2, 6],
      objective: 'Forty-one engineers, and not one of them can be ordered. All three must hear you.',
      build: [
        { op: 'fill', from: [0, 0, 0], to: [43, 19, 43], block: 1 },
        { op: 'room', from: [14, 1, 26], to: [30, 9, 40], floor: 2 },     // the assembly floor

        // the chamber behind the door, and the throat that leads to it
        { op: 'room', from: [16, 1, 4], to: [28, 7, 12], floor: 2 },
        { op: 'fill', from: [21, 1, 13], to: [23, 5, 25], block: 0 },
        { op: 'fill', from: [21, 1, 13], to: [23, 5, 13], block: 8 },     // <- THE DOOR

        /* --- VOTH, behind two cells of grit ---
         * A channel at floor level, packed with grit, which costs 22 a cell. Two
         * of them is 44, and Rocky's whole voice only carries 32. He is not
         * quiet to Voth. He is INAUDIBLE. Pull them out. */
        { op: 'fill', from: [6, 2, 34], to: [10, 4, 38], block: 0 },      // Voth's cell
        { op: 'fill', from: [11, 3, 36], to: [13, 3, 36], block: 0 },     // the channel
        { op: 'set', at: [12, 3, 36], block: 9 },
        { op: 'set', at: [13, 3, 36], block: 9 },                         // <- TWO cells of grit

        /* --- ARK, at the bottom of a shaft ---
         * No grit at all: just geometry. He is buried five cells deep in rock and
         * the only way sound reaches him is a long crooked crawl over the ceiling
         * and then straight DOWN. Shouting from the floor is hopeless. Climb the
         * wall, crawl, and walk down the shaft on your claws. */
        { op: 'fill', from: [35, 2, 31], to: [37, 3, 33], block: 0 },     // Ark's cell
        { op: 'fill', from: [36, 4, 32], to: [36, 13, 32], block: 0 },    // the shaft
        { op: 'fill', from: [30, 13, 32], to: [36, 13, 32], block: 0 },   // the crawl
        { op: 'fill', from: [30, 9, 32], to: [30, 13, 32], block: 0 },    // and the climb up to it

        /* --- SEVEN, UNDER a floor of grit ---
         * You will walk right over the top of him and he will not hear a step,
         * because grit eats sound and there is a whole floor of it between you.
         * Lift ONE block out and shout through the hole. Or drop xenonite into
         * the hole, seal it, and be heard through the floor anyway. */
        { op: 'fill', from: [27, 4, 16], to: [33, 7, 22], block: 0 },     // the annex you stand in
        { op: 'fill', from: [27, 3, 16], to: [33, 3, 22], block: 9 },     // <- ITS FLOOR IS GRIT
        { op: 'fill', from: [27, 2, 16], to: [33, 2, 22], block: 0 },     // the void beneath it
        { op: 'fill', from: [24, 4, 19], to: [26, 4, 19], block: 0 },     // the way in, off the throat

        // the tools: xenonite on a girder ledge you have to climb
        { op: 'fill', from: [26, 4, 36], to: [29, 4, 39], block: 3 },
        { op: 'set', at: [27, 5, 37], block: 7 },
        { op: 'set', at: [28, 5, 38], block: 7 },
        { op: 'set', at: [27, 5, 38], block: 7 },
        { op: 'set', at: [16, 2, 39], block: 5 },

        // worn, not built
        { op: 'roughen', from: [2, 1, 2], to: [41, 14, 41], amount: 0.32, passes: 2 },
        { op: 'cave', at: [22, 5, 33], r: 5, ry: 3.5, wobble: 0.45 },
        { op: 'spikes', from: [3, 5, 3], to: [40, 13, 40], amount: 0.10 },
        { op: 'rubble', from: [3, 2, 3], to: [40, 8, 40], amount: 0.11 },
        { op: 'set', at: [22, 2, 6], block: 15 }
      ],
      sources: [
        { at: [16, 3, 39], kind: 'vent' }
      ],
      gauges: [],
      /* MEASURED, all three, and printed by the suite. From anywhere on the
       * assembly floor every one of them is stone deaf; each opens only to a
       * different idea, and no idea opens two of them. */
      ears: [
        { id: 'voth',  at: [6, 3, 36],  needs: 0.42, opens: 'council', name: 'VOTH' },
        { id: 'ark',   at: [35, 2, 32], needs: 0.42, opens: 'council', name: 'ARK' },
        { id: 'seven', at: [31, 2, 19], needs: 0.42, opens: 'council', name: 'SEVEN' }
      ],
      doors: [
        { id: 'council', cells: [[21, 1, 13], [22, 1, 13], [23, 1, 13], [21, 2, 13], [22, 2, 13], [23, 2, 13], [21, 3, 13], [22, 3, 13], [23, 3, 13], [21, 4, 13], [22, 4, 13], [23, 4, 13], [21, 5, 13], [22, 5, 13], [23, 5, 13]] }
      ],
      lines: [
        { at: 'start', chord: '♩♪♩♪', text: 'Three of them will speak for the rest. Voth, who is old. Ark, who is careful. Seven, who is right more often than anyone likes.' },
        { at: 'start', chord: '♪♩♩', text: 'No Eridian can be made to do anything. That is not a weakness. It is why we are still here. But it does mean I must convince all three, and they are not sitting where I can reach them.' },
        { at: 'ear', chord: '♪♪♩', text: 'One.' },
        { at: 'all_doors', chord: '♩♪♪♩♩', text: 'Agreed. Forty-one engineers, and we agree. Now we build a ship, and none of us has ever seen the sky.' }
      ]
    },
    /* ==============================================================
     * ACT I.4 — THE ASTRONOMERS
     *
     * A species that has never seen its star has to measure it anyway. The
     * sensor is at the bottom of the deep bore, where the rock is warm. The
     * instrument that reads it is right across the warren — and the warren is
     * ninety cells wide, while Rocky's entire voice carries thirty-two.
     *
     * So you do not shout. You RING. A bell is a resonator that shouts back, and
     * a line of them carries the reading the whole way. Fire the chain and it
     * runs: bell, bell, bell, instrument.
     *
     * Except it does not, the first time. Somebody packed the third bell's
     * gallery with grit years ago, and the chain dies there — and THAT is the
     * mechanic. You do not hunt for a switch. You fire the chain, watch exactly
     * where it stops, and go and fix that.
     * ============================================================== */
    {
      id: 'astronomers',
      name: 'The Astronomers',
      world: { w: 60, h: 18, d: 30 },
      spawn: [5, 3, 15],
      exit: [57, 2, 12],
      objective: 'The bore is warm and the instrument is a long way off. Ring the chain — and find where it dies.',
      /* A ROOM IS ONLY SEALED IF THE ROCK IS THICK.
       * Rock costs 6.5 a cell against a bell's 30-cell voice, so sound walks
       * through three or four cells of it without much trouble. A one-cell plug
       * in a one-cell corridor is not a barrier at all — the wave simply goes
       * AROUND it, through the wall, and I watched it do exactly that. Every
       * chamber here is separated by SEVEN cells of rock, and the grit plug is
       * four cells deep, so there is no way round: through, or nothing. */
      build: [
        { op: 'fill', from: [0, 0, 0], to: [59, 17, 29], block: 1 },

        { op: 'room', from: [2, 1, 8], to: [10, 6, 16], floor: 2 },     // the bore head
        { op: 'room', from: [15, 1, 8], to: [23, 6, 16], floor: 2 },    // BELL I
        { op: 'room', from: [29, 1, 8], to: [37, 6, 16], floor: 2 },    // BELL II
        { op: 'room', from: [43, 1, 8], to: [51, 6, 16], floor: 2 },    // BELL III
        { op: 'room', from: [54, 1, 9], to: [58, 6, 15], floor: 2 },    // THE INSTRUMENT, sealed

        // the crawls between them: one cell square, two above the floor, so you
        // climb the wall and go in on your claws
        { op: 'fill', from: [11, 3, 12], to: [14, 3, 12], block: 0 },
        { op: 'fill', from: [24, 3, 12], to: [28, 3, 12], block: 0 },
        { op: 'fill', from: [38, 3, 12], to: [42, 3, 12], block: 0 },

        // <- THE BLOCKAGE. Four cells of grit, packed into the third crawl years
        //    ago by somebody who wanted a quiet gallery. 22 a cell, 88 for the
        //    lot, and a bell's whole voice carries 30. The chain dies HERE.
        { op: 'fill', from: [39, 3, 12], to: [42, 3, 12], block: 9 },

        /* And the instrument's chamber has no door at all — only a XENONITE
         * WINDOW, three cells of it, solid as the rock around it and very nearly
         * transparent to sound. You cannot walk to your own instrument. You can
         * only be heard by it. (The door it opens is underneath, and it is the
         * instrument that decides to let you in.) */
        { op: 'fill', from: [52, 4, 12], to: [53, 4, 12], block: 13 },  // CAST xenonite: it does not come up
        { op: 'fill', from: [52, 2, 12], to: [53, 2, 12], block: 8 },   // <- the door it opens
        { op: 'fill', from: [52, 3, 12], to: [53, 3, 12], block: 1 },

        { op: 'set', at: [4, 2, 10], block: 5 },
        { op: 'set', at: [57, 2, 12], block: 15 }
      ],
      sources: [
        { at: [4, 3, 10], kind: 'vent' }
      ],
      gauges: [],
      /* MEASURED. A bell's shout carries 30 cells: far enough to reach the next
       * bell down the line and nowhere near far enough to skip one. Rocky's own
       * voice reaches BELL I from the bore head and gets nothing else. */
      ears: [
        { id: 'b1',   at: [22, 3, 12], needs: 0.30, name: 'BELL I',   rings: { amp: 1.0, range: 30 }, rearm: 2.5 },
        { id: 'b2',   at: [36, 3, 12], needs: 0.30, name: 'BELL II',  rings: { amp: 1.0, range: 30 }, rearm: 2.5 },
        { id: 'b3',   at: [50, 3, 12], needs: 0.30, name: 'BELL III', rings: { amp: 1.0, range: 30 }, rearm: 2.5 },
        { id: 'inst', at: [57, 3, 12], needs: 0.30, name: 'THE INSTRUMENT', opens: 'vault' }
      ],
      doors: [
        { id: 'vault', cells: [[52, 2, 12], [53, 2, 12]] }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩♪', text: 'The bore is warm. Warmer than the rock above it, and colder than it was when I was young. That is the whole of the evidence, and it is not enough. I have to MEASURE it.' },
        { at: 'start', chord: '♩♩♪♪', text: 'The instrument is at the far end of the warren. My voice will not carry a third of the way. So I will not carry it. The bells will.' },
        { at: 'bell', chord: '♪♩', text: 'Ring.' },
        { at: 'all_doors', chord: '♩♪♪♩', text: 'The instrument agrees with me, and the instrument cannot be frightened, and cannot be polite. The star is going out.' }
      ]
    }
  ];
});
