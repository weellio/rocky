/* ROCKY SAVES THE UNIVERSE — config.js
 * The single source of truth. Pure JSON-safe data: no functions, no logic.
 * sim.js reads it. app.js reads it. scripts/test.js derives its rule list FROM it.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ROCKY_CFG = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    version: 1,

    /* ---------------------------------------------------------------
     * THE PALETTE MEANS SOMETHING.
     *
     * This is a story about a thing that eats stars, told by somebody who cannot see.
     * So the colours are not decoration — they are the argument:
     *
     *     GREEN  is LIFE. Xenonite, which carries sound. Resonators, which listen.
     *            Bells, which answer. The way out. Everything that connects.
     *     RED    is DEATH. Astrophage, which eats everything that reaches it, and grit,
     *            which is the same crime on a smaller scale: it eats what you say.
     *     AMBER  is HEAT — the vents, the forge, the gauges. On Erid heat IS life, and
     *            it is going out.
     *     ORANGE is reserved. It belongs to the OTHER SPECIES, and to the inside of a
     *            ship called the Hail Mary, and we do not spend it until we get there.
     *
     * THE WORLD IS MADE OF SOUND.
     * Rocky has no eyes. Every material returns a different echo, and the
     * colour you see IS that echo. Learn the colours, learn the world.
     * ------------------------------------------------------------- */
    /* Every material rings differently, and its ECHO has a shape as well as a
     * colour: `tex` is the grain you hear when the wave comes off it. Rocky is
     * not seeing a texture, he is resolving a surface — coarse basalt scatters,
     * a machined plate returns a hard grid, grit returns almost nothing. */
    /* `absorb` is what a material does to the echo that BOUNCES off it — its
     * colour and its loudness, what Rocky "sees".
     * `cost` is what it charges sound to pass THROUGH it, against 1 for a cell of
     * air. That second number is the whole puzzle game. Grit is nearly
     * soundproof. Xenonite is nearly free — it does not scatter sound, it CARRIES
     * it, which is why Eridians build ships out of the stuff and why you can run
     * a noise through a wall if you bring the right block with you.
     * `carry` says whether Rocky can pick it up and put it somewhere better. */
    blocks: [
      { id: 0,  key: 'air',      name: 'Air',            solid: false, color: '#000000', absorb: 0.0,  cost: 1.0,  tex: 'none',   carry: false , note: 0 },
      { id: 1,  key: 'rock',     name: 'Erid basalt',    solid: true,  color: '#6b6055', absorb: 0.35, cost: 6.5,  tex: 'mottle', carry: false , note: 174 },
      { id: 2,  key: 'plate',    name: 'Floor plate',    solid: true,  color: '#8b8175', absorb: 0.22, cost: 6.0,  tex: 'plate',  carry: false , note: 233 },
      { id: 3,  key: 'girder',   name: 'Girder',         solid: true,  color: '#c88a3a', absorb: 0.10, cost: 4.0,  tex: 'stripe', carry: true  , note: 311 },
      { id: 4,  key: 'pipe',     name: 'Ammonia pipe',   solid: true,  color: '#4fbf7a', absorb: 0.08, cost: 3.0,  tex: 'rings',  carry: false , note: 415 },
      { id: 5,  key: 'vent',     name: 'Heat vent',      solid: true,  color: '#ff6a2b', absorb: 0.05, cost: 3.0,  tex: 'grille', carry: false , note: 139 },
      { id: 6,  key: 'gauge',    name: 'Heat gauge',     solid: true,  color: '#ffd23c', absorb: 0.04, cost: 3.0,  tex: 'dial',   carry: false , note: 523 },
      { id: 7,  key: 'xenonite', name: 'Xenonite',       solid: true,  color: '#57e08a', absorb: 0.02, cost: 1.4,  tex: 'facet',  carry: true  , note: 659 },
      { id: 8,  key: 'door',     name: 'Warren door',    solid: true,  color: '#8fe36b', absorb: 0.30, cost: 9.0,  tex: 'panel',  carry: false , note: 277 },
      { id: 9,  key: 'sand',     name: 'Grit',           solid: true,  color: '#4a2a26', absorb: 0.72, cost: 22.0, tex: 'grain',  carry: true  , note: 87 },
      { id: 10, key: 'ear',      name: 'Resonator',      solid: true,  color: '#9be86b', absorb: 0.01, cost: 5.0,  tex: 'ear',    carry: false , note: 784 },
      /* A BELL is a resonator that SHOUTS BACK. Ring it and it answers, loudly,
       * from where it stands — so a chain of them carries a sound clean across a
       * warren far too big to shout across. It is also how you find a blockage:
       * fire the chain and watch where it stops. */
      { id: 11, key: 'bell',     name: 'Relay bell',     solid: true,  color: '#d0ff5c', absorb: 0.01, cost: 5.0,  tex: 'bell',   carry: true  , note: 880 },
      { id: 12, key: 'forge',    name: 'Xenonite forge', solid: true,  color: '#ff8a3c', absorb: 0.06, cost: 5.0,  tex: 'forge',  carry: false , note: 196 },
      /* CAST xenonite — poured in place, part of the structure, and it does not
       * come up again. A loose block of xenonite you can lift is a window you can
       * simply REMOVE and crawl through, which quietly unlocks every chamber in
       * the game that was supposed to be reachable only by sound. */
      { id: 13, key: 'pane',     name: 'Cast xenonite',  solid: true,  color: '#a9e8bd', absorb: 0.02, cost: 1.4,  tex: 'pane',   carry: false , note: 698 },
      /* ASTROPHAGE.
       * It eats light. Of course it eats sound — it eats everything that arrives,
       * which is what it is FOR. It returns nothing at all, so Rocky cannot hear
       * it: he can only hear the hole where it is. You find the thing that is
       * killing your star by looking for the part of the room that is not there. */
      { id: 14, key: 'astro',    name: 'Astrophage',     solid: true,  color: '#2a0508', absorb: 0.995, cost: 26.0, tex: 'void', carry: true , note: 55 },
      /* THE WAY OUT.
       * PLAYTEST: "there is not a clear exit to the room... each level needs a
       * distinct similar finishing spot, or door, or portal."  Fair, and it was worse
       * than that: in the tutorial the only exit was the way in.
       *
       * So every chapter now ends at the same thing, and it is findable the way this
       * game finds EVERYTHING: solve the room and the way out starts to HUM. Pulse
       * anywhere and you will hear it calling. Walk into it and you are through. */
      { id: 15, key: 'exit',     name: 'The way out',    solid: true,  color: '#4dff9e', absorb: 0.0,  cost: 2.0,  tex: 'arch',   carry: false, note: 988 },
      /* VACUUM.
       * SOUND NEEDS SOMETHING TO BE SOUND IN. Erid is twenty-nine atmospheres of hot
       * ammonia and no Eridian has ever been anywhere that was not — they have no word
       * for this and no reason to have invented one.
       *
       * It is not solid: he can WALK straight through it. It just costs 240 to cross,
       * which is to say sound does not cross it at all. Stand in a vacuum and you are
       * blind — except for what you are TOUCHING, because the wave still runs out of
       * your feet into the hull, and the hull still rings. In space you hear through
       * the structure or you hear nothing. */
      { id: 16, key: 'vac',      name: 'Vacuum',         solid: false, color: '#000000', absorb: 0.0,  cost: 240.0, tex: 'none', carry: false, note: 0 }
    ],

    /* And a pocketful of the stuff eats YOUR voice too. Every sample in the vest
     * muffles him: carry three and he is down to a sixth of himself, whispering in
     * the dark, and he has to find another way to be heard. */
    astro: { muffle: 0.55 },

    /* ---------------------------------------------------------------
     * THE FORGE
     * Rocky is an engineer, and his people's entire civilisation rests on one
     * trick: they can make xenonite. He carries ONE block at a time — five arms
     * and no pockets — so he does not carry a recipe around, he FEEDS the forge.
     * Drop a block in the hopper, go and get another. When the hopper holds what
     * a recipe wants, the forge makes the thing and puts it in his arms.
     *
     * The tree is the story: the stuff that DEAFENS you becomes the stuff that
     * CARRIES sound, and then it becomes a voice of its own.
     *
     *      grit x3  ->  xenonite
     *      xenonite x2 + girder  ->  a relay bell you can put anywhere
     * ------------------------------------------------------------- */
    recipes: [
      {
        id: 'xenonite',
        name: 'Xenonite',
        needs: [{ block: 9, n: 3 }],
        gives: 7,
        note: 'Grit is dead rock. It is the deafest thing on Erid, and under enough heat and enough pressure it becomes the loudest thing we know. Nobody has ever explained this to my satisfaction.'
      },
      {
        id: 'bell',
        name: 'Relay bell',
        needs: [{ block: 7, n: 2 }, { block: 3, n: 1 }],
        gives: 11,
        note: 'Two of xenonite to sing, and a girder to hang it from. Put it down anywhere and it will answer when it hears you.'
      }
    ],

    /* THE VEST AND THE TOOL BELT.
     * Rocky wears a leather harness across his carapace with a satchel on it and
     * strap-bands on his arms, and he is never not pulling something out of it.
     * SIX pockets, because Eridians count in six and it would not occur to him to
     * build five or seven. */
    belt: { pockets: 6 },

    /* Eridian names, for the people you meet in the dark. They are engineers, so they
     * are named the way engineers name things: after what they DO, or what number they
     * were, or what they are known for being right about. */
    folkNames: ['VOTH', 'ARK', 'SEVEN', 'BRIDGE', 'QUIET', 'NINE', 'TALL', 'COUNTER', 'SIX'],

    /* A bell Rocky builds is the same OBJECT as any other bell — same list, same
     * rules, same field — but it is a better bell than the old ones in the walls,
     * because he is a better engineer than whoever hung those. And it had better
     * be: A BELL MUST BE LOUDER THAN A PERSON. If it is not, then building one and
     * standing it where you are already standing gains you precisely nothing, and
     * the entire craft is decoration. It shouts further than he can (40 cells
     * against his 32) and that is the only reason it is worth making. */
    bell: { needs: 0.30, rings: { amp: 1.15, range: 40 }, rearm: 2.5 },

    /* Rocky is small, five-legged, and strong. Erid pulls about twice as hard
     * as Earth. He does not jump well. He climbs anything. */
    physics: {
      gravity: 24,
      moveSpeed: 5.2,
      accel: 40,
      friction: 14,
      jump: 7.4,
      climbSpeed: 3.4,
      terminal: 34,
      halfWidth: 0.34,
      halfHeight: 0.34,
      stepRate: 60
    },

    /* THE PULSE.
     * A wavefront leaves Rocky at `speed` cells/sec. Air costs 1 per cell to
     * cross; solid rock costs `solidCost` — expensive, but not infinite, which
     * is why he can hear a machine humming through a wall. Everything the
     * screen shows is derived from this. */
    sonar: {
      speed: 19,
      /* How far Rocky's own voice carries. Also, directly, the cost of a pulse:
       * 40 floods the whole warren at 15.6ms — a dropped frame every press —
       * and lets him hear the far wall from his own bench, which is worse. At 32
       * a pulse costs 10.8ms, and there are still corners he has to walk to. */
      maxDist: 32,
      /* What a cell of rock charges the wave to pass through it, against 1 for a
       * cell of air. This one number is how OPAQUE the world is. At 5 a machine
       * two cells of stone away comes back barely dimmer than the wall in front
       * of it, and the ghosts stop reading as ghosts. At 6.5 the far side of a
       * wall is half as loud as the near side, which is what a wall is for. */
      solidCost: 6.5,
      falloff: 1.35,
      tau: 2.6,
      /* THE STRIKE. A surface is brightest at the instant the wave lands on it,
       * then settles to its echo. This is what makes the pulse visibly SWEEP
       * across a wall instead of the room simply switching on. */
      flash: 2.4,
      flashTau: 0.10,
      minHeat: 0.02,
      pulseAmp: 1.0,
      cooldown: 0.55,
      lit: 6000,

      /* A dropped block lands with a bang, and a bang is a sound like any other —
       * which means you can THROW your voice by throwing something else. */
      placeAmp: 0.9,
      placeRange: 16,

      /* FOOTFALL.
       * Five legs on stone are five small sounds. Rocky cannot help hearing the
       * ground he is standing on, so he is never a body floating in the dark —
       * the floor beneath him keeps answering as he walks. Move and you can see
       * where you are. Stand perfectly still in a dead corridor and you cannot.
       * It costs nothing and it is the difference between the game being
       * playable and the game being a black screen with an orange crab in it. */
      footAmp: 0.42,
      footRange: 7,
      stride: 0.85,
      landAmp: 0.75,
      landRange: 11
    },

    /* Things that make noise on their own. The warren is never fully silent:
     * machinery keeps its own corner of the world visible. */
    /* A machine is not a floodlight. `range` is how far its noise carries — far
     * shorter than Rocky's own pulse, so the warren stays DARK between the
     * machines. Near a vent you are never blind. In a dead corridor you are.
     * (Give these the pulse's range and the whole map glows forever, and the
     * game quietly stops being about listening.) */
    sourceKinds: {
      vent:  { period: 2.2, amp: 0.85, range: 15, hue: '#ff6a2b' },
      gauge: { period: 3.1, amp: 0.55, range: 10, hue: '#ffd23c' },
      pipe:  { period: 4.0, amp: 0.40, range: 12, hue: '#4fbf7a' },
      drip:  { period: 1.7, amp: 0.30, range: 8,  hue: '#8fd8ff' },
      /* The way out calls, and it calls LOUD and far, because a player who cannot
       * find the door is a player who is not playing. It only starts once the room is
       * solved — before that it is a dead arch and it says nothing. */
      exit:  { period: 1.4, amp: 1.0, range: 34, hue: '#4dff9e' },
      /* AN ERIDIAN IS A NOISE. They are always working — tapping, filing, shifting
       * things about — so you find a person exactly the way you find a wall: you shout,
       * and something answers that is not a wall. */
      folk:  { period: 2.0, amp: 0.62, range: 18, hue: '#ffb36b' }
    },

    audio: {
      master: 0.5,
      pulseHz: 660,
      echoHz: 240,
      shakeCap: 18
    },

    /* Eridians count in SIX. Rocky's numerals are dot-chords: a value is read
     * as groups of six. Every number the game shows him, it shows in base six. */
    numerals: { base: 6, digits: ['·', ':', '∴', '⁘', '⁙', '⁚'] },

    /* --------------------------------------------------------------- */
    /* THE PROLOGUE.
     * Eighteen how-to cards on the front door is a manual, not an opening. This is
     * the story, in his voice, and the words that carry a RULE are the words in
     * bold — so the thing you have to learn and the thing you want to read are the
     * same sentence. The manual still exists: it is the codex, and it is one key
     * away, and it is generated from the same table the suite checks. */
    story: {
      title: 'ROCKY SAVES THE UNIVERSE',
      subtitle: 'Chapter One — The Cold',
      prologue: [
        'I am an engineer. I have five arms, a leather harness I am never not pulling something out of, and **no eyes** — nobody on my world has ever had them, because my world has never had light. Twenty-nine atmospheres of hot ammonia, and under it, the warren, and in the warren, me.',
        'I know a room the way you know a song. I **make a sound, and I listen to what comes back**. The wave leaves me at the speed of sound and it has to come *home* again, so the far wall answers late — and that delay is the only ruler I have ever owned.',
        'Everything here has a voice. Basalt is loud. **Grit is deaf** — pack a channel with the stuff and it goes silent. **Xenonite sings**: it does not scatter sound, it carries it, which is why we build our ships out of it and why a wall of it is a doorway. Sound crosses stone badly, but it crosses, so the machines humming on the other side will always show me where the wall ends.',
        'Something is wrong with the heat. Not broken-wrong. **Slow-wrong. Everywhere-wrong.** Every gauge in the warren has fallen and not one of my vents is at fault, and I have checked, and I have checked again.',
        'It is not my vents that are failing. It is the sky.'
      ]
    },

    chapters: [
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
          { op: 'room', from: [43, 1, 12], to: [48, 6, 18], floor: 2 }
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
          { at: [32, 3, 11], kind: 'vent' }
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
      },

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
          { at: 'all_gauges', chord: '♩♪♪♩', text: 'It is not my vents that are failing. It is the sky.' }
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
      },

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
          { op: 'set', at: [30, 2, 12], block: 15 }
        ],
        sources: [
          { at: [3, 3, 11], kind: 'vent' }
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
          { op: 'set', at: [44, 2, 17], block: 15 }
        ],
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
          { op: 'fill', from: [8, 2, 16], to: [10, 2, 16], block: 9 }      // and more grit, if he wastes the plug
        ],
        sources: [
          { at: [6, 3, 11], kind: 'vent' },
          { at: [10, 3, 19], kind: 'pipe' }
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
          { op: 'set', at: [14, 2, 20], block: 3 },
          { op: 'set', at: [18, 2, 20], block: 7 },

          // and the astrophage, in its own cell, behind cast xenonite so it cannot eat
          // the rest of the ship's hearing
          { op: 'fill', from: [28, 2, 18], to: [30, 4, 20], block: 0 },
          { op: 'set', at: [29, 2, 19], block: 14 },

          // the door the drive opens, and the way out beyond it
          { op: 'fill', from: [41, 2, 15], to: [41, 4, 15], block: 8 },
          { op: 'room', from: [42, 1, 12], to: [46, 7, 18], floor: 2 }
        ],
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
          { op: 'room', from: [17, 1, 2], to: [23, 6, 6], floor: 2 }
        ],
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
      },

      /* ==============================================================
       * THE LONG DARK — a warren nobody has mapped.
       *
       * Every other chapter in this game is measured to the cell, because every other
       * chapter is a PUZZLE and a puzzle you can accidentally solve is not one. This
       * one is the opposite: it is GENERATED, fresh, every single time you walk into
       * it, and nobody — not you, not Rocky, not me — has ever seen it before.
       *
       * Which is only possible because of what this game already is. You cannot look at
       * a cave you have never seen. You can only SHOUT at it, and stand still, and wait
       * for it to answer, and build the place in your head out of what comes back. That
       * is what an Eridian does with every room they have ever been in, and it is the
       * one thing this engine can do that nothing else can.
       *
       * The generator finds the two most distant points in the whole cave system — the
       * actual graph diameter, not "far apart by eye" — and puts you at one end and the
       * way out at the other. So every seed is a real journey, every seed is solvable,
       * and the suite proves it across forty of them before it lets any of them ship.
       * ============================================================== */
      {
        id: 'longdark',
        name: 'The Long Dark  (a new warren every time)',
        world: { w: 52, h: 20, d: 52 },
        spawn: [26, 10, 26],
        objective: 'Nobody has mapped this. Shout, and listen, and build it in your head.',
        exit: [26, 10, 26],
        reseed: true,
        build: [
          { op: 'fill', from: [0, 0, 0], to: [51, 19, 51], block: 1 },
          { op: 'warren', from: [1, 1, 1], to: [50, 16, 50], density: 0.57, passes: 5, smooth: 2, folk: 3 }
        ],
        sources: [],
        gauges: [],
        lines: [
          { at: 'start', chord: '♪♩♩♪', text: 'Nobody has been down here. Not me, not my father, not anybody — this is not a warren, it is just what the rock did while nobody was looking.' },
          { at: 'start', chord: '♩♪♩', text: 'So I do what I have always done. I shout, and I stand still, and I wait, and I build the place in my head out of what comes back. There is a way out of here. Everything has a way out.' }
        ]
      }
    ],

    /* THE CURRICULUM (carried over from EMBERFALL).
     * Every rule the engine enforces must be taught somewhere. The test suite
     * derives the rule list from the engine's own tables and fails if a rule
     * has no lesson — so a mechanic can never ship untaught. */
    teach: {
      'move:walk':    'how:walk',
      'move:climb':   'how:climb',
      'move:jump':    'how:jump',
      'sense:pulse':  'how:pulse',
      'sense:return': 'how:return',
      'sense:footfall': 'how:footfall',
      'sense:decay':  'how:decay',
      'sense:through': 'how:through',
      'sense:material': 'how:material',
      'world:sources': 'how:sources',
      'read:base6':   'how:base6',
      'act:gauge':    'how:gauge',
      'act:carry':    'how:carry',
      'world:conduct': 'how:conduct',
      'world:ear':    'how:ear',
      'world:bell':   'how:bell',
      'act:forge':    'how:forge',
      'act:build':    'how:build',
      'world:astro':  'how:astro',
      'world:vacuum': 'how:vacuum',
      'world:tuned':  'how:tuned',
      'world:folk':   'how:folk'
    },

    how: [
      { marker: 'walk', group: 'Moving',     title: 'Move',        body: 'WASD or the ARROW KEYS move Rocky — they do the same thing, so use whichever hand you like. Five legs, no hurry, and he never trips.' },
      { marker: 'climb', group: 'Moving',    title: 'Climb',       body: 'Walk into a wall and hold forward. Eridians climb, and five legs do not let go — stop pressing and Rocky simply holds on. Hold SHIFT to walk back down.' },
      { marker: 'jump', group: 'Moving',     title: 'Jump',        body: 'SPACE. Erid pulls twice as hard as Earth, so Rocky jumps badly. Climb instead.' },
      { marker: 'pulse', group: 'Hearing',    title: 'Pulse',       body: 'Rocky has no eyes. Press E to pulse, and listen to what comes back. A ring leaves him at the speed of sound — watch it go.' },
      { marker: 'return', group: 'Hearing',   title: 'Out, and back', body: 'A wall does not appear when the sound reaches it. It appears when the echo gets back to ROCKY. Out and home again — so the far wall answers late, and that delay IS the distance. It is the only ruler he has.' },
      { marker: 'footfall', group: 'Hearing', title: 'Five legs',   body: 'Five legs on stone are five small sounds. Rocky cannot help hearing the floor he walks on, so while you move you can always see where you are standing. Stand perfectly still in a dead corridor and you cannot.' },
      { marker: 'decay', group: 'Hearing',    title: 'Memory',      body: 'An echo fades. What you saw a moment ago is memory, and memory dims. Pulse again.' },
      { marker: 'through', group: 'Hearing',  title: 'Through walls', body: 'Sound crosses rock — poorly, but it crosses. A machine humming behind a wall shows up as a faint ghost. That is not a bug in his hearing. That is a doorway.' },
      { marker: 'material', group: 'Hearing', title: 'Materials',   body: 'Every material rings differently, and the colour you see IS that ring. Basalt is dull blue. Girder is orange. Xenonite sings violet. Grit swallows sound and shows almost nothing.' },
      { marker: 'sources', group: 'Hearing',  title: 'The warren breathes', body: 'Machines make their own noise on their own rhythm. Near a vent you are never blind. In a dead corridor you are.' },
      { marker: 'base6', group: 'Reading',    title: 'Six',         body: 'Eridians count in sixes, because they have five arms and think of the hand itself as the sixth thing. Every number here is base six.' },
      { marker: 'gauge', group: 'Reading',    title: 'Gauges',      body: 'Stand at a gauge and press F to read it. It gives you a temperature, and what that temperature is supposed to be.' },
      { marker: 'carry', group: 'Making',    title: 'The tool belt', body: 'Rocky wears a leather harness with a satchel on it and strap-bands on his arms, and he is never not pulling something out of it. SIX pockets, because Eridians count in six. Q lifts the block you are facing into a pocket, R puts the selected one down, and 1–6 (or the mouse wheel) choose which pocket your hands are on. A block dropped lands with a BANG — and a bang is a sound like any other.' },
      { marker: 'conduct', group: 'Making',  title: 'What sound costs', body: 'Every material charges the sound a different price to pass through it. Air is free. Basalt is dear. GRIT is very nearly soundproof — pack a channel with grit and it goes deaf. XENONITE is very nearly free: it does not scatter sound, it CARRIES it, which is why Eridians build ships out of it. Bring the right block and you can run a noise through a wall.' },
      { marker: 'ear', group: 'Making',      title: 'Resonators',  body: 'A resonator is a listener, and it opens a door when enough sound REACHES it. So a locked door is never a key hunt — it is a routing problem. Walk over and shout. Clear the grit. Bridge the gap with xenonite. Drop something heavy beside it. Open a vent and let a machine do it for you. Every one of those is a real answer.' },
      { marker: 'forge', group: 'Making',    title: 'The forge',   body: 'Rocky is an engineer, and his people build everything out of xenonite. Stand at a forge with a block in your arms and press F to FEED it. He carries one block at a time — five arms and no pockets — so he does not carry a recipe about with him. He feeds the hopper, one trip at a time, and the forge remembers.' },
      { marker: 'build', group: 'Making',    title: 'Making things', body: 'GRIT x3 makes XENONITE: the deafest stuff on Erid becomes the loudest, which nobody has ever explained to Rocky\'s satisfaction. XENONITE x2 and a GIRDER make a RELAY BELL — and a bell you build is a bell like any other. Stand it anywhere and it listens, and when it hears you it shouts back, further than you can shout yourself. That is the whole trade: you make the thing that was not there.' },
      { marker: 'vacuum',   group: 'Hearing',    title: 'Vacuum',      body: 'SOUND NEEDS SOMETHING TO BE SOUND IN. Erid is twenty-nine atmospheres of hot ammonia and no Eridian has ever been anywhere that was not, so we have no word for this. Where there is no air you are not quiet — you are DEAF. You can still WALK through it. You just cannot hear across it: all you can hear is what you are TOUCHING, because the sound still runs out of your feet into the hull and the hull still rings. And pressure is not a switch. Any space that can reach the hole has already emptied out. Close the hole and the air comes back, all of it, at once.' },
      { marker: 'astro', group: 'Hearing',    title: 'Astrophage',  body: 'It eats light. Of course it eats sound — it eats everything that arrives, which is what it is FOR. So it gives NOTHING back, and Rocky cannot hear it. He can only hear the HOLE where it is: pulse, and a patch of the wall simply does not come home. That is how you find the thing that is killing your star — you look for the part of the room that is not there. And a sample in your vest eats your own voice too: carry three and you are down to a sixth of yourself, whispering in the dark, and you will need to build something that can shout for you.' },
      { marker: 'tuned',    group: 'Making',     title: 'Tuned resonators', body: 'Some resonators are DEAF to everything but one note. Not quieter — deaf. You can stand in front of one and shout until your carapace splits and it will not hear you, because your voice is a CLICK and a click is not a pitch. But every material has a voice: a girder rings at 311, xenonite sings at 659, astrophage answers with a 55Hz thud you feel in your legs rather than hear. And a block DROPPED on the deck bangs in its own voice. So a tuned resonator is not a lock — it is a question, and the answer is a material. Go and fetch it, and put it down where the question is.' },
      { marker: 'folk',     group: 'Hearing',    title: 'The others',  body: 'You are not alone down here. Eridians cannot do anything alone — no government, no war, no way to make anybody do anything — so the whole species runs on turning up and TALKING to each other. And you find a person the way you find everything else: an Eridian is always working, and work makes NOISE. Pulse, and something answers that is not a wall. Go and find out who. They will tell you the truth about where you are, and they will have walked it themselves, because an Eridian would be insulted to give you an estimate.' },
      { marker: 'bell', group: 'Making',     title: 'Bells',       body: 'A BELL is a resonator that shouts back. Ring it and it answers, loudly, from where it stands — so a line of bells carries a sound clean across a warren far too big for one voice. And when a chain of them dies halfway, the bell it died at is telling you exactly where the blockage is. Do not go hunting for a switch. Fire the chain, and watch.' }
    ],

    lessons: [
      { id: 'pulse',   title: 'The world is made of sound', body: 'You are not looking at Erid. You are hearing it, and the screen is only a convenience.' },
      { id: 'cold',    title: 'The Cold',                   body: 'Eridians have never seen their star. They know it the way you know a fire in the next room: by its warmth. So when 40 Eridani began to dim, nobody saw it. Everybody FELT it.' },
      { id: 'six',     title: 'Base six',                   body: 'Rocky counts in sixes. So does his engineering, his clock, and his gauges.' }
    ],

    settings: [
      { key: 'rocky.sound',  name: 'Sound',           def: true },
      { key: 'rocky.shake',  name: 'Screen shake',    def: true },
      { key: 'rocky.assist', name: 'Persistent echo', def: false, note: 'Echoes never fade. Easier, and much less like being Rocky.' }
    ]
  };
});
