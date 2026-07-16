/* ROCKY SAVES THE UNIVERSE — ACT II — THE SHIP
 *
 * The whole planet stops making anything else. Nine ships. Twenty-three volunteers who will not be coming back.
 *
 * Levels only. The RULES live in config.js; these files are just the rooms the rules
 * happen in. js/chapters.js stitches every act back into one ordered list, and the
 * order in THAT file is the order you play them in — not the order they load.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else ((root.ROCKY_ACTS = root.ROCKY_ACTS || {})['act2_ship'] = factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    /* ==============================================================
     * ACT II.1 — THE FORGE
     *
     * The council has agreed and the ship must be built, and everything an
     * Eridian has ever built is made of xenonite. So: the forge.
     *
     * The level cannot be solved by finding anything. There is one bell, and
     * the gap to the vault is forty cells — further than any bell can shout.
     * You have to MAKE the second one:
     *
     *      grit x3               ->  xenonite
     *      xenonite x2 + girder  ->  a relay bell
     *
     * and there is exactly enough grit in the walls to do it. He carries one
     * block at a time, so it is six trips to the forge, and the sixth one hands
     * him a bell. Then he has to work out where to STAND it — halfway, in the
     * gallery, where both ends can hear it.
     * ============================================================== */
    {
      id: 'forge',
      name: 'The Forge',
      world: { w: 56, h: 16, d: 26 },
      spawn: [6, 3, 12],
      exit: [30, 2, 12],
      objective: 'The gap is too wide for one voice and there is only one bell. Make another.',
      build: [
        { op: 'fill', from: [0, 0, 0], to: [55, 15, 25], block: 1 },

        { op: 'room', from: [2, 1, 7], to: [14, 7, 17], floor: 2 },     // the workshop, with the forge
        { op: 'room', from: [21, 1, 8], to: [31, 6, 16], floor: 2 },    // the middle gallery
        { op: 'room', from: [38, 1, 8], to: [48, 6, 16], floor: 2 },    // the far gallery, and the ear

        { op: 'fill', from: [15, 3, 12], to: [20, 3, 12], block: 0 },   // the crawl he can get through

        /* ...and the one he CANNOT. Six cells of cast xenonite through six cells
         * of rock: solid, permanent, and very nearly transparent to sound. He can
         * never walk to that vault. He can only be heard by it — and he is not
         * loud enough. Nothing he owns is loud enough. That is the level. */
        { op: 'fill', from: [32, 3, 12], to: [37, 3, 12], block: 13 },

        // THE FORGE
        { op: 'set', at: [3, 2, 12], block: 12 },
        { op: 'set', at: [3, 2, 11], block: 5 },
        { op: 'set', at: [3, 2, 13], block: 5 },                        // the heat it runs on

        /* THE STOCK. Exactly enough, and not a block more: six of grit (two
         * xenonite worth) and one girder. Count them — the level is a sum. */
        { op: 'fill', from: [5, 2, 8], to: [7, 2, 8], block: 9 },
        { op: 'fill', from: [5, 2, 16], to: [7, 2, 16], block: 9 },
        { op: 'set', at: [12, 2, 12], block: 3 },

        // the one bell the warren already had, on a ledge in the workshop
        { op: 'fill', from: [10, 4, 8], to: [12, 4, 10], block: 3 },
        { op: 'set', at: [11, 5, 9], block: 11 },

        // and the vault, sealed, at the far end
        { op: 'fill', from: [49, 2, 11], to: [49, 4, 13], block: 8 },
        { op: 'set', at: [30, 2, 12], block: 15 },

        /* --- A WORKING SHOP, LIVED-IN (flora is rock->moss, acoustically identical, skips all stock) --- */
        { op: 'flora', from: [2, 2, 7], to: [14, 6, 17], amount: 0.15, bloom: 0.45 },   // the workshop
        { op: 'flora', from: [21, 2, 8], to: [31, 5, 16], amount: 0.11, bloom: 0.4 },   // middle gallery
        { op: 'flora', from: [38, 2, 8], to: [48, 5, 16], amount: 0.11, bloom: 0.4 },   // far gallery + ear
        // a green ammonia seep and a girder rib in the workshop
        { op: 'set', at: [2, 4, 9], block: 4 },
        { op: 'set', at: [2, 5, 15], block: 3 }
      ],
      sources: [
        { at: [3, 3, 11], kind: 'vent' },
        // one small thing in the workshop — well out of range of the vault ear at the far end
        { at: [6, 3, 9], kind: 'skitter' }
      ],
      gauges: [],
      forges: [
        { at: [3, 2, 12] }
      ],
      /* The vault's ear is forty cells from the workshop. Rocky's voice carries
       * 32 and a bell's carries 30, so NOTHING you already own can reach it —
       * not by shouting, not by carrying the old bell to the crawl, not by any
       * cleverness at all. You have to build the relay. */
      /* MEASURED. From the closest he can stand, Rocky's own voice reaches this
       * ear at 28%. A bell he builds and stands in the same spot reaches it at
       * 47%, because a bell is louder than a person. The threshold sits between
       * them, and that gap is the whole reason to build anything. */
      ears: [
        { id: 'vaultear', at: [48, 3, 12], needs: 0.35, name: 'THE VAULT', opens: 'vault' }
      ],
      doors: [
        { id: 'vault', cells: [[49, 2, 11], [49, 2, 12], [49, 2, 13], [49, 3, 11], [49, 3, 12], [49, 3, 13], [49, 4, 11], [49, 4, 12], [49, 4, 13]] }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'Everything my people have ever built is xenonite. Ships, tools, the walls of my own workshop. And nobody outside this room can tell you how it is made, which I find funny, and which the council does not.' },
        { at: 'start', chord: '♩♪♩', text: 'Grit is the deafest stuff on Erid. Squeeze it hot enough and it becomes the loudest. I have never understood it. I have only ever done it.' },
        { at: 'craft', chord: '♪♪♩', text: 'Made.' },
        { at: 'all_doors', chord: '♩♩♪♪♩', text: 'A bell where there was no bell. This is the entire trade, and it is the whole reason we will reach that star: we make the thing that was not there.' }
      ]
    },
    /* ==============================================================
     * ACT I.5 — THE PETROVA LINE
     *
     * The end of Act I, and the first time he touches the thing itself.
     *
     * Astrophage eats light. Of course it eats sound — it eats everything that
     * arrives, which is what it is FOR. So it returns NOTHING, and Rocky cannot
     * hear it. He can only hear the HOLE where it is: pulse into the deep bore
     * and three patches of the wall simply do not come back.
     *
     * That is the whole hunt. You find the thing that is killing your star by
     * looking for the part of the room that is not there.
     *
     * And then you have to carry it. A sample in the vest eats HIS voice too —
     * one sample and he is muffled, three and he is down to a sixth of himself,
     * whispering in the dark with the murderer of his sun in his pocket. The
     * vault will not hear him. So he has to make something that CAN shout, and
     * stand it where it will be heard — which is every verb the act has taught,
     * used at once, in the dark, while going deaf.
     * ============================================================== */
    {
      id: 'petrova',
      name: 'The Petrova Line',
      world: { w: 48, h: 18, d: 34 },
      spawn: [8, 3, 17],
      exit: [44, 2, 17],
      objective: 'Astrophage returns no echo. Find the three holes in the world, and carry them home.',
      build: [
        { op: 'fill', from: [0, 0, 0], to: [47, 17, 33], block: 1 },

        // the bore: one long cavern, and everything in it answers except three patches
        { op: 'room', from: [3, 1, 8], to: [34, 10, 27], floor: 2 },
        { op: 'fill', from: [12, 1, 12], to: [16, 6, 16], block: 1 },     // pillars, to hide behind
        { op: 'fill', from: [24, 1, 19], to: [28, 7, 23], block: 1 },
        { op: 'fill', from: [20, 1, 9], to: [22, 5, 10], block: 3 },

        /* THE THREE HOLES. Astrophage, sitting in the rock, giving nothing back. */
        { op: 'set', at: [3, 5, 10], block: 14 },
        { op: 'set', at: [28, 8, 25], block: 14 },
        { op: 'set', at: [13, 2, 26], block: 14 },

        // the forge, and enough grit and a girder to make ONE bell
        { op: 'set', at: [5, 2, 20], block: 12 },
        { op: 'set', at: [5, 2, 19], block: 5 },
        { op: 'fill', from: [7, 2, 24], to: [9, 2, 24], block: 9 },
        { op: 'fill', from: [7, 2, 26], to: [9, 2, 26], block: 9 },
        { op: 'set', at: [10, 2, 12], block: 3 },

        // THE VAULT, behind cast xenonite. He can never walk to it.
        { op: 'room', from: [40, 1, 13], to: [45, 6, 21], floor: 2 },
        { op: 'fill', from: [35, 3, 17], to: [39, 3, 17], block: 13 },
        { op: 'fill', from: [35, 2, 17], to: [39, 2, 17], block: 8 },

        // the deep bore: the oldest rock on Erid, and it looks it
        { op: 'roughen', from: [2, 1, 2], to: [33, 12, 31], amount: 0.30, passes: 2 },
        { op: 'cave', at: [18, 5, 17], r: 6, ry: 4, wobble: 0.45 },
        { op: 'spikes', from: [3, 5, 3], to: [33, 10, 30], amount: 0.08 },
        { op: 'rubble', from: [3, 2, 3], to: [33, 8, 30], amount: 0.09 },
        { op: 'set', at: [44, 2, 17], block: 15 },

        /* --- SPARSE DEEP-BORE LICHEN (moss echoes exactly like rock, so the three silent
         *     holes still read as the ONLY things that give nothing back) --- */
        { op: 'flora', from: [3, 1, 8], to: [34, 9, 27], amount: 0.05, bloom: 0.3 }
      ],
      // no fauna in the deep bore: it is the oldest, deadest rock on Erid, and the ear margin is tight
      sources: [
        { at: [5, 3, 19], kind: 'vent' }
      ],
      gauges: [],
      forges: [{ at: [5, 2, 20] }],
      /* MEASURED, and the threshold is where the level lives.
       * NO PERSON IS LOUD ENOUGH FOR THIS DOOR. Empty-handed, from the closest he
       * can stand, Rocky reaches it at 46% of the 55% it wants — so a bell is not
       * a convenience, it is the only way in.
       *
       * And a bell has to be RUNG. With three samples of astrophage in his vest he
       * is at 17% of his own voice and cannot even ring his own bell (it wants
       * 30%). So either he rings it before he goes collecting... or he remembers
       * that a DROPPED BLOCK bangs on its own, and the astrophage in his pocket
       * cannot muffle a noise he did not make with his mouth. */
      ears: [
        { id: 'vaultear', at: [45, 3, 17], needs: 0.55, name: 'THE VAULT', opens: 'vault' }
      ],
      doors: [
        { id: 'vault', cells: [[35, 2, 17], [36, 2, 17], [37, 2, 17], [38, 2, 17], [39, 2, 17]] }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♪', text: 'Something in this bore does not answer me. I have pulsed at that wall a hundred times in my life and it has always come back. Today there is a piece of it that simply is not there.' },
        { at: 'start', chord: '♩♩♪♩', text: 'It eats light. Of course it eats sound. It eats everything that arrives — that is what it is FOR. Question: how do you catch a thing you cannot hear.' },
        { at: 'take', chord: '♪♩', text: 'Quiet. It is so quiet.' },
        { at: 'all_doors', chord: '♩♪♩♪♩', text: 'Three samples of the thing that is killing my star, and I had to build a voice to be heard past it. Everything after today is engineering. The hard part was believing the gauges.' }
      ]
    },
    /* ==============================================================
     * ACT II.2 — THE HULL
     *
     * A species with no word for vacuum is building a ship.
     *
     * SOUND NEEDS SOMETHING TO BE SOUND IN. Erid is twenty-nine atmospheres of hot
     * ammonia, and no Eridian has ever in their history been anywhere that was not,
     * so nobody has ever needed the concept and nobody has got one. Rocky is about
     * to get one, standing in it, in the dark, in the middle of a job.
     *
     * There is a BREACH in the outer hull. Everything the breach can reach has no
     * air in it — and where there is no air, HE IS DEAF. Not quiet: deaf. He walks
     * into the forward compartment and the world simply stops existing, except for
     * the hull he is touching, because the wave still runs out of his feet into the
     * structure and the structure still rings. In space you hear through what you
     * are standing on, or you hear nothing at all.
     *
     * So: find the hole by walking the ringing metal until it ends. Seal it with
     * xenonite. And the moment it is sealed, the compartment is no longer connected
     * to the outside, and the air comes back, and the room comes back with it.
     *
     * Nothing in the code knows what a "compartment" is. Pressure is not a flag —
     * it is a fact about what is connected to what.
     * ============================================================== */
    {
      id: 'hull',
      name: 'The Hull',
      world: { w: 46, h: 18, d: 30 },
      spawn: [6, 3, 15],
      objective: 'There is a hole in the ship. Find it in the dark, and close it.',
      exit: [42, 3, 15],

      /* THE SHIP IS IN A VACUUM CHAMBER, because a species that has never met vacuum
       * has to build one before it can build a ship — and Rocky is the engineer who
       * has to stand in it. `space` is where the nothing starts. Everything the
       * nothing can REACH has no air in it. */
      space: [[2, 14, 2]],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [45, 17, 29], block: 1 },
        { op: 'fill', from: [1, 1, 1], to: [44, 16, 28], block: 0 },     // the test chamber: evacuated

        // THE SHIP: a cast xenonite hull, two compartments and a way out
        { op: 'fill', from: [3, 1, 8], to: [44, 10, 22], block: 13 },
        { op: 'room', from: [4, 2, 9], to: [20, 9, 21], floor: 2 },      // AFT: sealed, and it rings
        { op: 'room', from: [24, 2, 9], to: [39, 9, 21], floor: 2 },     // FORWARD: breached, and it does not
        { op: 'room', from: [41, 2, 13], to: [43, 8, 17], floor: 2 },    // the way out, beyond a door
        /* THE HATCH. One cell, plugged with ONE BLOCK OF XENONITE — and pulling it
         * out is how you get forward, and also how you kill your own ship. The moment
         * the hatch is open, aft is connected to forward, forward is connected to the
         * hole, and the hole is connected to the dark. The air in the room you are
         * standing in goes with it.
         *
         * And that same block is the patch. There is exactly one, and it belongs in
         * two places, and you have to choose which. */
        { op: 'fill', from: [21, 3, 15], to: [23, 3, 15], block: 0 },
        { op: 'set', at: [22, 3, 15], block: 7 },                        // <- THE PLUG
        { op: 'fill', from: [40, 2, 15], to: [40, 4, 15], block: 8 },    // <- the door the resonator opens

        /* THE BREACH. One cell of hull, missing — and everything it can reach has
         * emptied out into the dark. It sits at head height, where a creature standing
         * on the deck can put a block into it, because a hole you have to fight the
         * wall to reach is a hole nobody patches. */
        { op: 'set', at: [36, 4, 22], block: 0 },

        // stock, AFT, where he can still hear himself think
        { op: 'set', at: [6, 2, 12], block: 12 },
        { op: 'set', at: [6, 2, 11], block: 5 },
        { op: 'fill', from: [8, 2, 12], to: [10, 2, 12], block: 9 },
        { op: 'fill', from: [8, 2, 14], to: [10, 2, 14], block: 9 },
        { op: 'set', at: [12, 2, 12], block: 3 },
        { op: 'fill', from: [8, 2, 16], to: [10, 2, 16], block: 9 },     // and more grit, if he wastes the plug

        /* --- NO FLORA: this is a xenonite ship in a vacuum. Character comes from STEEL. ---
         *     an aft catwalk (verticality) in the one compartment that still holds air */
        { op: 'fill', from: [8, 6, 10], to: [16, 6, 10], block: 3 },
        { op: 'set', at: [12, 7, 10], block: 3 },
        // cradle struts bracing the hull to the test-chamber wall, out in the vacuum (decorative, unreachable)
        { op: 'fill', from: [10, 1, 5], to: [10, 7, 5], block: 3 },
        { op: 'fill', from: [30, 1, 25], to: [30, 7, 25], block: 3 },
        { op: 'fill', from: [10, 8, 6], to: [10, 8, 7], block: 3 }
      ],
      sources: [
        { at: [6, 3, 11], kind: 'vent' },
        { at: [10, 3, 19], kind: 'pipe' },
        // one small thing, deep in the sealed aft where there is still air to carry it
        { at: [8, 3, 12], kind: 'skitter' }
      ],
      gauges: [],
      forges: [{ at: [6, 2, 12] }],
      labels: [
        { at: [22, 3, 15], block: 7, text: 'THE HATCH — one block of xenonite (Q)' },
        { at: [36, 4, 22], block: 0, text: 'THE BREACH — put it here (R)', color: '#9be86b' },
        { at: [6, 2, 12], block: 12, text: 'THE FORGE — 3 grit make more xenonite' },
        { at: [39, 3, 15], block: 10, text: 'RESONATOR — it cannot hear you in a vacuum' }
      ],
      /* MEASURED. In the vacuum his voice cannot cross the room — it can only run
       * out of his feet and along the hull — and the hull alone does not carry it
       * loudly enough. Seal the breach, get the AIR back, and the room is his again. */
      ears: [
        { id: 'e1', at: [39, 3, 15], needs: 0.42, name: 'THE HATCH', opens: 'out' }
      ],
      doors: [
        { id: 'out', cells: [[40, 2, 15], [40, 3, 15], [40, 4, 15]] }
      ],
      lines: [
        { at: 'start', chord: '♪♩♩♪', text: 'The forward compartment has gone quiet. Not quiet like grit. Quiet like NOTHING. I pulse and nothing comes back, not one stone of it, and I have never in my life met a room that did not answer.' },
        { at: 'start', chord: '♩♩♪', text: 'There is a hole in my ship, and everything the hole can reach has emptied out into the dark. I cannot hear the air because there is no air. I can only hear what I am STANDING ON. So I will walk the hull until the ringing stops, and that is where the hole will be.' },
        { at: 'pressure', chord: '♪♪♩♩♪', text: 'AIR. The room came back. Twenty-nine atmospheres of it, all at once, and I have never been so pleased to be shouted at by a wall.' },
        { at: 'all_doors', chord: '♩♪♪♩', text: 'We have no word for what was in that room. We will need one. I am going to have to go OUT there, and so is everyone I know.' }
      ]
    },
    /* ==============================================================
     * ACT II.3 — THE DRIVE
     *
     * Astrophage is eating your star. So you are going to ride it.
     *
     * THE NEW IDEA: A TUNED RESONATOR IS DEAF TO EVERYTHING BUT ONE NOTE. Not
     * quieter — DEAF. You can stand in front of one and shout until your carapace
     * cracks and it will not hear you, because your voice is a CLICK and a click is
     * not a pitch. Every material, though, has a voice of its own: a girder rings at
     * 311, xenonite sings at 659, astrophage answers with a 55Hz thud you feel in
     * your legs rather than hear. And a block dropped on the deck bangs IN ITS OWN
     * VOICE.
     *
     * So the drive's three intakes are not locks. They are QUESTIONS, and each one
     * has exactly one right answer, and the answer is a material you have to go and
     * fetch and put down in the right place.
     *
     * And the last of them wants astrophage — which, in your vest, eats your own
     * voice. You will carry the murderer of your sun across your own ship, going
     * quietly deafer with every step, to feed it to the engine that will take you to
     * the thing it is murdering.
     * ============================================================== */
    {
      id: 'drive',
      name: 'The Drive',
      world: { w: 48, h: 18, d: 30 },
      spawn: [6, 3, 15],
      objective: 'Three intakes. Each is deaf to everything but one material. Shouting will not do it.',
      exit: [44, 3, 15],
      showAstro: true,   // you must SEE the sample here to carry it — this is not the Petrova hunt
      build: [
        { op: 'fill', from: [0, 0, 0], to: [47, 17, 29], block: 1 },

        // the drive room: one long hall, the core at the far end
        { op: 'room', from: [3, 1, 8], to: [40, 10, 22], floor: 2 },

        // THE THREE INTAKES, each tuned to one material and deaf to the rest
        { op: 'fill', from: [12, 2, 8], to: [12, 4, 8], block: 0 },
        { op: 'fill', from: [24, 2, 8], to: [24, 4, 8], block: 0 },
        { op: 'fill', from: [36, 2, 8], to: [36, 4, 8], block: 0 },

        // the stock: a girder, xenonite, and the grit to make more of it
        { op: 'set', at: [6, 2, 12], block: 12 },
        { op: 'set', at: [6, 2, 11], block: 5 },
        { op: 'fill', from: [8, 2, 18], to: [10, 2, 18], block: 9 },
        { op: 'fill', from: [8, 2, 20], to: [10, 2, 20], block: 9 },
        /* A PILE of girders and xenonite, not one of each — the intake wants a GIRDER dropped on
         * it, but the forge will also eat a girder into a (useless) bell, and one girder made that
         * a soft-lock. Give enough that a wrong turn at the forge is a lesson, not a dead end. */
        { op: 'fill', from: [13, 2, 20], to: [15, 2, 20], block: 3 },   // girders
        { op: 'fill', from: [17, 2, 20], to: [18, 2, 20], block: 7 },   // xenonite (and 6 grit forges more)

        // and the astrophage, in its own cell, behind cast xenonite so it cannot eat
        // the rest of the ship's hearing
        { op: 'fill', from: [28, 2, 18], to: [30, 4, 20], block: 0 },
        { op: 'set', at: [29, 2, 19], block: 14 },

        // the door the drive opens, and the way out beyond it
        { op: 'fill', from: [41, 2, 15], to: [41, 4, 15], block: 8 },
        { op: 'room', from: [42, 1, 12], to: [46, 7, 18], floor: 2 },

        /* --- CEILING-BAND LIFE (y>=6): high over the tuned intakes, so no wall feeds them --- */
        { op: 'flora', from: [3, 6, 8], to: [40, 9, 22], amount: 0.11, bloom: 0.4 },
        { op: 'set', at: [3, 6, 10], block: 4 }   // a green seep on the drive-hall wall
      ],
      // no ambient fauna: the three intakes must hear only the block Rocky sets, never the room
      sources: [
        { at: [6, 3, 11], kind: 'vent' }
      ],
      gauges: [],
      forges: [{ at: [6, 2, 12] }],
      labels: [
        { at: [6, 2, 12], block: 12, text: 'THE FORGE' },
        { at: [14, 2, 20], block: 3, text: 'GIRDER' },
        { at: [18, 2, 20], block: 7, text: 'XENONITE' },
        { at: [29, 2, 19], block: 14, text: 'ASTROPHAGE — it will eat your voice' },
        { at: [12, 3, 9], block: 0, text: 'INTAKE I — it hears only GIRDER', color: '#c88a3a' },
        { at: [24, 3, 9], block: 0, text: 'INTAKE II — it hears only XENONITE', color: '#57e08a' },
        { at: [36, 3, 9], block: 0, text: 'INTAKE III — it hears only ASTROPHAGE', color: '#9be86b' }
      ],
      /* Each intake is DEAF to everything but its own note. Shout at them all day.
       * The only thing that will do it is the right block, dropped on the deck. */
      ears: [
        { id: 'i1', at: [12, 3, 8], needs: 0.30, tuned: 311, name: 'INTAKE I · girder',    opens: 'burn' },
        { id: 'i2', at: [24, 3, 8], needs: 0.30, tuned: 659, name: 'INTAKE II · xenonite', opens: 'burn' },
        { id: 'i3', at: [36, 3, 8], needs: 0.30, tuned: 55,  name: 'INTAKE III · astrophage', opens: 'burn' }
      ],
      doors: [
        { id: 'burn', cells: [[41, 2, 15], [41, 3, 15], [41, 4, 15]] }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'The drive will not take fuel from a stranger. Three intakes, and each one is deaf to everything in the universe except one single note. I could shout at them until my carapace split.' },
        { at: 'start', chord: '♩♪♩♩', text: 'But everything HAS a note. A girder rings. Xenonite sings. And astrophage answers with a thud so low you feel it in your legs and never hear it at all. So I do not shout. I go and get the answer, and I put it down where the question is.' },
        { at: 'ear', chord: '♪♩', text: 'It took it.' },
        { at: 'all_doors', chord: '♩♩♪♪♩♩', text: 'Fed. On the thing that is killing my star. We are going to ride the murderer to the scene of the crime, and I have never in my life been so pleased with a piece of engineering, or so frightened of one.' }
      ]
    }
,

    /* ==============================================================
     * ACT II.4 — THE VOLUNTEERS
     *
     * Twenty-three Eridians are going to Tau Ceti. Every one of them will die there.
     *
     * And an Eridian cannot be ORDERED. No government, no war, no way to make anybody
     * do anything — so there is no draft, no lottery, no speech, and no hero. There is
     * only this: you go to each of them, in a room, and you SHOW THEM THE THING THAT
     * WILL KILL THEM, and you let them decide.
     *
     * So the mechanic is the ugliest one in the game and it is the honest one. Each of
     * them is TUNED TO ASTROPHAGE — 55Hz, a note you feel in your legs rather than hear.
     * You cannot talk them into it. You cannot shout them into it. You pick the sample
     * up, you carry the murderer of your star across the room to somebody you have known
     * for twenty years, and you put it down in front of them.
     *
     * And it eats your voice while you carry it. You do this at 55% of yourself,
     * quietly, five times.
     * ============================================================== */
    {
      id: 'volunteers',
      name: 'The Volunteers',
      world: { w: 40, h: 16, d: 34 },
      spawn: [20, 3, 28],
      objective: 'They cannot be ordered. Show them what it is, and let them decide.',
      exit: [20, 2, 4],
      showAstro: true,   // you carry the sample to each of them — it must be visible to lift
      build: [
        { op: 'fill', from: [0, 0, 0], to: [39, 15, 33], block: 1 },
        { op: 'room', from: [4, 1, 8], to: [35, 9, 30], floor: 2 },
        { op: 'roughen', from: [2, 1, 4], to: [37, 11, 32], amount: 0.24, passes: 1 },
        { op: 'spikes', from: [4, 5, 6], to: [35, 11, 31], amount: 0.08 },
        { op: 'rubble', from: [5, 2, 9], to: [34, 6, 29], amount: 0.06 },

        // the case it came in, on a plinth in the middle of the floor
        { op: 'fill', from: [19, 2, 20], to: [21, 2, 22], block: 13 },
        { op: 'set', at: [20, 3, 21], block: 14 },

        { op: 'set', at: [7, 2, 10], block: 5 },
        { op: 'fill', from: [20, 2, 6], to: [20, 4, 6], block: 8 },
        { op: 'room', from: [17, 1, 2], to: [23, 6, 6], floor: 2 },

        /* --- THE GATHERING HALL, worn and lived-in, but solemn (no fauna: the room is holding
         *     its breath). Flora skips the plinth/astrophage; moss echoes like rock. --- */
        { op: 'flora', from: [4, 2, 8], to: [35, 8, 30], amount: 0.10, bloom: 0.4 },
        { op: 'set', at: [4, 4, 12], block: 4 },   // green seeps in the old walls
        { op: 'set', at: [35, 5, 24], block: 4 }
      ],
      // no ambient fauna: the volunteers are tuned to astrophage, and the room is meant to be still
      sources: [
        { at: [7, 3, 10], kind: 'vent' }
      ],
      gauges: [],
      labels: [
        { at: [20, 3, 21], block: 14, text: 'ASTROPHAGE — show it to them (Q, then R)' }
      ],
      /* Each of them is TUNED TO ASTROPHAGE. You cannot argue with them and you cannot
       * shout at them. You can only show them. */
      folk: [
        { at: [8, 3, 14], name: 'VOTH', chord: '♩♪♩',
          line: 'You have brought it with you. Of course you have. Show me the thing, Rocky, and stop looking at me like that — I am four hundred years old and I have been bored for two of them.' },
        { at: [31, 3, 14], name: 'ARK', chord: '♪♩♩♪',
          line: 'I have three children. I want you to say that out loud, and then I want you to show me the sample, and then I want you to write my name down. In that order. I am not being brave. I am being CAREFUL.' },
        { at: [8, 3, 26], name: 'SEVEN', chord: '♪♪♩',
          line: 'I am right more often than anybody likes, and I am right about this: it does not matter whether we come back. Put it down. I am watching.' },
        { at: [31, 3, 26], name: 'BRIDGE', chord: '♩♩♪♩',
          line: 'I built the hull you are going to die in. I would like to be inside it when it happens, if that is all the same to you.' },
        { at: [20, 3, 11], name: 'QUIET', chord: '♪♩',
          line: '...' }
      ],
      ears: [
        { id: 'voth',   at: [7, 3, 14],  needs: 0.30, tuned: 55, name: 'VOTH',   opens: 'go', keepOut: 3 },
        { id: 'ark',    at: [32, 3, 14], needs: 0.30, tuned: 55, name: 'ARK',    opens: 'go', keepOut: 3 },
        { id: 'seven',  at: [7, 3, 26],  needs: 0.30, tuned: 55, name: 'SEVEN',  opens: 'go', keepOut: 3 },
        { id: 'bridge', at: [32, 3, 26], needs: 0.30, tuned: 55, name: 'BRIDGE', opens: 'go', keepOut: 3 },
        { id: 'quiet',  at: [20, 3, 10], needs: 0.30, tuned: 55, name: 'QUIET',  opens: 'go', keepOut: 3 }
      ],
      doors: [
        { id: 'go', cells: [[20, 2, 6], [20, 3, 6], [20, 4, 6]] }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'Twenty-three of us are going. All of us will die there. Nobody has been told to go, because nobody can be told anything — so I have to go round this room, one at a time, and show each of them what it is.' },
        { at: 'start', chord: '♩♪♩♩', text: 'It eats my voice while I carry it. That is fitting. I do not think this should be easy to say.' },
        { at: 'ear', chord: '♪♩', text: 'Yes. All right. Yes.' },
        { at: 'all_doors', chord: '♩♪♪♩♩', text: 'Twenty-three. Nobody argued. Not one of them argued, and I think I would have felt better if somebody had.' }
      ]
    }
,

    /* ==============================================================
     * ACT II.5 — LAUNCH
     *
     * The one chapter you can see everything.
     *
     * Every other room in this game is dark until you make it answer. This one is not:
     * the drive's burn is a sound source of colossal amplitude, and it lights the WHOLE
     * SHIP at once, throbbing, amber, from stem to stern. For the length of one chapter
     * Rocky does not have to pulse. He just walks through his ship in the loudest light it
     * will ever hold, running the launch checklist — three boards, read on the way past —
     * and climbs into the crash couch at the far end.
     *
     * And the moment he straps in, the burn cuts. Nothing relights the chambers, so they
     * fade to black on their own (stepSources simply stops emitting the burn once
     * flags.done is set — there is no darkness special-case in the renderer, the ship just
     * stops making the sound). That black is the forty-two years of quiet, arriving on cue.
     *
     * There is no puzzle here and there should not be. It is a held breath. He is leaving
     * a sky he has never seen, and for once the game lets him look at where he is standing.
     * ============================================================== */
    {
      id: 'launch',
      name: 'Launch',
      world: { w: 58, h: 16, d: 20 },
      spawn: [6, 3, 10],
      objective: 'The drive lights the whole ship — you do not need to pulse. Run the launch boards and get to the couch.',
      exit: [52, 3, 10],
      floodlit: true,   // the drive is a STEADY light, not a sweeping pulse — draw the whole ship, always
      build: [
        { op: 'fill', from: [0, 0, 0], to: [57, 15, 19], block: 1 },

        // the ship's spine: one long hull, aft to fore, floored in plate
        { op: 'room', from: [3, 1, 4], to: [54, 11, 15], floor: 2 },

        // THE DRIVE, aft. A cage of heat vents around the core — the burn lifts off here
        // and floods everything ahead of it. Cast xenonite screens it, and xenonite SINGS,
        // so the roar carries clean through the whole ship instead of stopping at a wall.
        { op: 'fill', from: [3, 1, 7], to: [4, 6, 12], block: 5 },
        { op: 'fill', from: [5, 1, 7], to: [5, 6, 12], block: 13 },
        { op: 'set', at: [4, 3, 10], block: 5 },

        // a mid-ship bulkhead you step through — the ship has ribs, and you feel them in
        // the light as much as underfoot
        { op: 'fill', from: [28, 1, 4], to: [28, 8, 15], block: 1 },
        { op: 'fill', from: [28, 1, 8], to: [28, 4, 11], block: 0 },

        // a raised aft-of-couch deck: a step up toward the front, all of it plainly lit
        { op: 'fill', from: [40, 1, 5], to: [48, 2, 14], block: 2 },

        // the crash couch, fore: a bay, an arch, the way out of the only home he has
        { op: 'fill', from: [50, 3, 10], to: [50, 5, 10], block: 7 },
        { op: 'room', from: [51, 1, 7], to: [55, 6, 13], floor: 2 }
      ],
      /* THE BURN. The whole point of the chapter, in one line of data: a source so loud
       * and so far-reaching it lights the ship end to end, on its own clock, until you
       * strap in. */
      sources: [
        { at: [5, 3, 10], kind: 'burn' },
        // a breath of shipboard life clinging to the warm aft, near the drive — the burn all but drowns it
        { at: [6, 3, 10], kind: 'drone' },
        { at: [4, 2, 6], kind: 'skitter' }
      ],
      /* THE LAUNCH CHECKLIST. Three boards, read on the way forward. Reading them is the
       * only thing that opens the couch — a crossing with a reason, not a corridor. */
      gauges: [
        { id: 'g1', at: [12, 3, 10], name: 'Drive pressure', nominal: 29, reading: 29 },
        { id: 'g2', at: [34, 3, 10], name: 'Hull stress',    nominal: 44, reading: 44 },
        { id: 'g3', at: [46, 3, 12], name: 'Heading · Tau Ceti', nominal: 100, reading: 100 }
      ],
      labels: [
        { at: [4, 3, 10], block: 5, text: 'THE DRIVE — it is doing the listening for you', color: '#ffb020' },
        { at: [12, 3, 10], block: 6, text: 'BOARD I · drive pressure' },
        { at: [34, 3, 10], block: 6, text: 'BOARD II · hull stress' },
        { at: [46, 3, 12], block: 6, text: 'BOARD III · heading' },
        { at: [52, 3, 10], block: 15, text: 'THE COUCH — strap in', color: '#ffb020' }
      ],
      /* Two of the crew, at their stations, calling into the roar. */
      folk: [
        { at: [20, 3, 6], name: 'ARK', chord: '♩♪♩',
          line: 'Loud, isn\'t it. First time in my life I have walked a room without asking it a question. I do not like it. Read your boards, Rocky — the drive will not wait for us to make our peace.' },
        { at: [38, 3, 13], name: 'BRIDGE', chord: '♪♩♩♪',
          line: 'Hull is holding. I built her to hold. When the burn stops you will hear nothing at all for a very long time, and I want you to remember that the nothing means she is working.' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'I have never heard anything like this. The drive is a sound with no edges — it fills the whole ship at once, and for the first time in my life I can hear a room without asking it anything. Everything is lit. Everything.' },
        { at: 'start', chord: '♩♩♪',  text: 'Three boards to read and then the couch. I am not going to pulse. I am just going to walk through my ship, once, in the light, and look at all of it.' },
        { at: 'gauge', chord: '♪♪♩',  text: 'Green. She is ready.' },
        { at: 'all_gauges', chord: '♩♪♪♩', text: 'All three. Nothing to do now but lie down in the couch and let the murderer of my star carry me to it.' },
        { at: 'done', chord: '♪', text: 'And then the burn stopped. And it was quiet. It stayed quiet for forty-two years, and I was asleep for most of them, and this — this nothing — is the sound of the plan working.' }
      ]
    }
  ];
});
