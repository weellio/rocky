/* ROCKY SAVES THE UNIVERSE — ACT 0 — THE WORKSHOP
 *
 * Before the story: a room, five materials, and every rule the rest of the game will assume you know.
 *
 * Levels only. The RULES live in config.js; these files are just the rooms the rules
 * happen in. js/chapters.js stitches every act back into one ordered list, and the
 * order in THAT file is the order you play them in — not the order they load.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else ((root.ROCKY_ACTS = root.ROCKY_ACTS || {})['act0_workshop'] = factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    /* ==============================================================
     * CHAPTER ZERO — THE WORKSHOP.  The walkthrough.
     *
     * PLAYTEST: "I find myself just going in and out of rooms, not sure what I'm
     * supposed to do." Which is the worst sentence a player can say, and it was
     * a fair one.
     *
     * So: one room at a time, one idea at a time, and the ENGINE decides when you
     * have done it (see stepWalk in sim.js) — no scripts, no timers, no trigger
     * volumes somebody forgot to move. It walks through every verb he has and
     * every material in the world, and the suite PLAYS IT TO THE END, so a step
     * can never quietly become impossible.
     * ============================================================== */
    {
      id: 'workshop',
      name: 'The Workshop  (start here)',
      world: { w: 50, h: 16, d: 30 },
      spawn: [5, 3, 15],
      objective: 'Rocky teaches you how to hear.',
      exit: [47, 3, 15],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [43, 15, 29], block: 1 },

        // ROOM 1 — the dark. You pulse, and the world exists.
        { op: 'room', from: [2, 1, 10], to: [11, 7, 20], floor: 2 },

        // ROOM 2 — THE GALLERY. One block of every material, in a row, to hear.
        { op: 'room', from: [14, 1, 9], to: [26, 8, 21], floor: 2 },
        { op: 'fill', from: [12, 3, 15], to: [13, 3, 15], block: 0 },   // the crawl in
        { op: 'set', at: [16, 2, 11], block: 1 },                       // basalt
        { op: 'set', at: [18, 2, 11], block: 2 },                       // plate
        { op: 'set', at: [20, 2, 11], block: 3 },                       // girder
        { op: 'set', at: [22, 2, 11], block: 4 },                       // pipe
        { op: 'set', at: [24, 2, 11], block: 5 },                       // vent
        { op: 'set', at: [16, 2, 19], block: 6 },                       // gauge
        { op: 'set', at: [18, 2, 19], block: 7 },                       // xenonite
        { op: 'set', at: [20, 2, 19], block: 9 },                       // grit
        { op: 'set', at: [22, 2, 19], block: 13 },                      // cast xenonite
        { op: 'set', at: [24, 2, 19], block: 11 },                      // a bell
        { op: 'set', at: [24, 3, 10], block: 5 },                       // and a vent that hums

        /* THE WAY OUT OF THE GALLERY. It used to be a 1x1 hole at head height above
         * a solid girder — you could not stand in it, could not enter it, and the
         * only exit really was the way in. It is a LEDGE you climb onto and a crawl
         * two blocks tall that you can plainly walk into. */
        { op: 'fill', from: [25, 5, 14], to: [26, 5, 16], block: 3 },   // a step up to it
        { op: 'fill', from: [26, 6, 14], to: [29, 7, 16], block: 0 },   // and the crawl, walkable

        /* ROOM 3 — GRIT IS DEAF. An ear behind a plug you must pull.
         *
         * The plug used to sit in a channel three cells of solid rock BEHIND the
         * room's south wall, where no player could ever reach it. The step said
         * "lift the grit" and would accept ANY grit — so picking a block up off the
         * bench ticked it off while the real plug stayed exactly where it was, and
         * the resonator could never hear you, ever. The tutorial was unwinnable.
         *
         * The plug is now in the room's own wall, at arm's length, labelled. */
        { op: 'room', from: [30, 1, 10], to: [41, 8, 20], floor: 2 },
        { op: 'fill', from: [36, 3, 21], to: [36, 3, 23], block: 0 },   // the channel, into the wall
        { op: 'set', at: [36, 3, 21], block: 9 },                       // <- THE GRIT PLUG, reachable
        { op: 'fill', from: [33, 2, 24], to: [38, 5, 26], block: 0 },   // the ear's alcove beyond it

        /* the forge, and ENOUGH STOCK TO ACTUALLY FINISH.
         * A bell is two xenonite and a girder, and a xenonite is three grit — so a
         * bell is SIX grit, and there were three in the room. The player could pull
         * the plug, forge one xenonite, and then stand there for the rest of their
         * life. (My own test fabricated the blocks into his hands instead of taking
         * them off the floor, so it never noticed.) */
        { op: 'set', at: [32, 2, 12], block: 12 },
        { op: 'set', at: [32, 2, 11], block: 5 },
        { op: 'fill', from: [34, 2, 12], to: [36, 2, 12], block: 9 },
        { op: 'fill', from: [34, 2, 14], to: [36, 2, 14], block: 9 },
        { op: 'set', at: [38, 2, 12], block: 3 },

        // a gauge to read, and the door out
        { op: 'set', at: [41, 3, 16], block: 6 },
        { op: 'fill', from: [42, 2, 15], to: [42, 4, 15], block: 8 },

        // and THE WAY OUT, behind it
        { op: 'room', from: [43, 1, 12], to: [48, 6, 18], floor: 2 },

        /* --- LIVED-IN WORKSHOP (decoration only; gallery + all walkthrough cells untouched) ---
         * Room 1 (the dark): a low mossy warmth on the home walls — inert until you pulse it */
        { op: 'flora', from: [1, 1, 9], to: [12, 8, 21], amount: 0.10, bloom: 0.35 },
        // Room 3 CEILING ONLY (y5+), high above the forge stock/labels at y2
        { op: 'flora', from: [30, 5, 10], to: [41, 9, 20], amount: 0.12, bloom: 0.45 },
        // the way-out arch, framed in bloom (exit block 15 is skipped)
        { op: 'flora', from: [43, 1, 12], to: [48, 6, 18], amount: 0.14, bloom: 0.5 },
        // two blooms hung on the gallery's out-of-reach ceiling rock (y9), warms it without touching the row
        { op: 'set', at: [17, 9, 14], block: 21 },
        { op: 'set', at: [23, 9, 17], block: 21 },
        // A REST-NICHE off Room 1's south wall — Rocky's home nook (Room 1 has NO puzzle cell)
        { op: 'fill', from: [4, 2, 9], to: [5, 3, 9], block: 0 },       // low crawl through the z9 wall
        { op: 'room', from: [3, 1, 6], to: [6, 4, 8], floor: 2 },       // the carved nook (shell z0-5 intact)
        { op: 'set', at: [4, 1, 7], block: 7 }, { op: 'set', at: [5, 1, 7], block: 7 },  // worn xenonite rest-pad
        { op: 'flora', from: [3, 1, 6], to: [6, 5, 9], amount: 0.20, bloom: 0.5 },       // his little garden
        // COLOUR — a green ammonia seep + a girder rib in Room 1's plain west wall
        { op: 'set', at: [1, 4, 15], block: 4 },
        { op: 'set', at: [1, 5, 17], block: 3 }
      ],
      /* THE LABELS. A name in a sentence and a lump of colour in a room are only
       * the same thing if somebody says so. They fade in when you are close enough
       * to read them, and every one of them names the block it stands on. */
      labels: [
        { at: [16, 2, 11], block: 1 },
        { at: [18, 2, 11], block: 2 },
        { at: [20, 2, 11], block: 3 },
        { at: [22, 2, 11], block: 4 },
        { at: [24, 2, 11], block: 5 },
        { at: [16, 2, 19], block: 6 },
        { at: [18, 2, 19], block: 7, text: 'XENONITE — carries sound' },
        { at: [20, 2, 19], block: 9, text: 'GRIT — deaf' },
        { at: [22, 2, 19], block: 13 },
        { at: [24, 2, 19], block: 11 },
        { at: [26, 7, 15], block: 0, text: 'THE CRAWL — climb the step, go through', color: '#8fe36b' },
        { at: [32, 2, 12], block: 12, text: 'THE FORGE — F to feed it' },
        { at: [36, 3, 21], block: 9, text: 'GRIT — pull it out (Q)' },
        { at: [34, 3, 25], block: 10, text: 'RESONATOR — get a sound to it' },
        { at: [41, 3, 16], block: 6, text: 'GAUGE — F to read it' },
        { at: [42, 3, 15], block: 8 },
        { at: [47, 3, 15], block: 15 }
      ],
      sources: [
        { at: [24, 4, 10], kind: 'vent' },
        { at: [32, 3, 11], kind: 'vent' },
        // home is inhabited: something small in the rest-nook, a vent-garden hum, a call across the shop
        { at: [4, 2, 7], kind: 'skitter' },
        { at: [23, 4, 11], kind: 'drone' },
        { at: [39, 4, 13], kind: 'warble' }
      ],
      gauges: [
        { id: 'g1', at: [41, 3, 16], name: 'Workshop', nominal: 96, reading: 91 }
      ],
      forges: [{ at: [32, 2, 12] }],
      ears: [
        { id: 'e1', at: [34, 3, 25], needs: 0.35, name: 'THE DOOR', opens: 'out' }
      ],
      doors: [
        { id: 'out', cells: [[42, 2, 15], [42, 3, 15], [42, 4, 15]] }
      ],

      /* THE WALKTHROUGH. Every step names a thing that must become TRUE, and the
       * engine checks it. One idea at a time, and you are never once left standing
       * in a room wondering what the game wants. */
      walk: [
        { say: 'You cannot see. Nobody on Erid ever could. PULSE — press E, or the PULSE button — and listen to what comes back.',
          done: { pulse: 1 } },
        { say: 'That is the room. It is already fading, because an echo is a memory. Pulse whenever you want it back. Now WALK — WASD, the arrows, or the stick.',
          done: { move: 6 } },
        { say: 'There is a crawl in the east wall. Go through it, into the gallery.',
          done: { reach: [16, 3, 15], within: 3.5 } },
        { say: 'THE GALLERY. One block of every material Erid has. Pulse, and look at the colours — the colour you see IS the sound it gives back. Walk down the row.',
          done: { reach: [24, 3, 15], within: 3.5 } },
        { say: 'The BLACK one is grit: it swallows sound and shows you almost nothing. The VIOLET one is xenonite: it does not scatter sound, it carries it. Remember those two. They are the whole game.',
          done: { pulse: 4 } },
        { say: 'The way out is up. Walk INTO a wall and hold forward — Eridians climb, and five legs never let go. (SHIFT walks you back down.)',
          done: { climbTo: 6.2 } },
        { say: 'The way on is a CRAWL, in the east wall, one step up from the ledge you just climbed — it is labelled. Go through it.',
          done: { reach: [34, 3, 15], within: 5 } },
        { say: 'That door is locked, and a locked door here is never a key hunt. It listens. Get a sound to the RESONATOR and it opens — but somebody has packed its channel with GRIT, and grit is deaf.',
          done: { pulse: 6 } },
        { say: 'So take the grit out. It is in the south wall, labelled, at head height. Face it and press Q to LIFT it — it goes in a pocket of your vest.',
          done: { gone: [36, 3, 21] } },
        { say: 'The channel is open. Now pulse, and let the resonator hear you.',
          done: { ear: 'e1' } },
        { say: 'THE DOOR IS OPEN. Now the other half of the trade: you are an engineer. Take the grit to the FORGE and press F to feed it. Three of grit make one XENONITE.',
          done: { forged: 'xenonite' } },
        { say: 'That is xenonite — the loudest thing we know, made from the deafest. Now feed it two xenonite and a GIRDER, and it will make you a BELL: a resonator that shouts BACK, further than you can shout yourself.',
          done: { forged: 'bell' } },
        { say: 'Put the bell down anywhere (R) and shout at it. It will answer.',
          done: { rang: true } },
        { say: 'Last thing. There is a heat gauge on the east wall. Stand at it and press F to READ it. We count in sixes.',
          done: { gauges: 1 } },
        { say: 'Listen. That hum is THE WAY OUT — every room in this warren has one, and it starts calling as soon as the room is done with you. Pulse if you cannot place it, and walk into it.',
          done: { exit: true } }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'My workshop. I will show you how to hear. Do exactly as I say and you will be fine, and if you get lost, pulse — you can always pulse.' },
        { at: 'walkthrough', chord: '♩♪♪♩♩', text: 'That is everything. Sound, stone, grit, xenonite, a forge and a bell. Now: something is wrong with the heat, and I need you to help me prove it.' }
      ]
    }
  ];
});
