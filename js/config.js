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
      { id: 1,  key: 'rock',     name: 'Erid basalt',    solid: true,  color: '#4a5a6e', absorb: 0.35, cost: 6.5,  tex: 'mottle', carry: false , note: 174 },
      { id: 2,  key: 'plate',    name: 'Floor plate',    solid: true,  color: '#6f7f93', absorb: 0.22, cost: 6.0,  tex: 'plate',  carry: false , note: 233 },
      { id: 3,  key: 'girder',   name: 'Girder',         solid: true,  color: '#c88a3a', absorb: 0.10, cost: 4.0,  tex: 'stripe', carry: true  , note: 311 },
      { id: 4,  key: 'pipe',     name: 'Ammonia pipe',   solid: true,  color: '#3fd3c0', absorb: 0.08, cost: 3.0,  tex: 'rings',  carry: false , note: 415 },
      { id: 5,  key: 'vent',     name: 'Heat vent',      solid: true,  color: '#ff6a2b', absorb: 0.05, cost: 3.0,  tex: 'grille', carry: false , note: 139 },
      { id: 6,  key: 'gauge',    name: 'Heat gauge',     solid: true,  color: '#ffd23c', absorb: 0.04, cost: 3.0,  tex: 'dial',   carry: false , note: 523 },
      { id: 7,  key: 'xenonite', name: 'Xenonite',       solid: true,  color: '#b46bff', absorb: 0.02, cost: 1.4,  tex: 'facet',  carry: true  , note: 659 },
      { id: 8,  key: 'door',     name: 'Warren door',    solid: true,  color: '#8fe36b', absorb: 0.30, cost: 9.0,  tex: 'panel',  carry: false , note: 277 },
      { id: 9,  key: 'sand',     name: 'Grit',           solid: true,  color: '#2f3743', absorb: 0.72, cost: 22.0, tex: 'grain',  carry: true  , note: 87 },
      { id: 10, key: 'ear',      name: 'Resonator',      solid: true,  color: '#ff4fa3', absorb: 0.01, cost: 5.0,  tex: 'ear',    carry: false , note: 784 },
      /* A BELL is a resonator that SHOUTS BACK. Ring it and it answers, loudly,
       * from where it stands — so a chain of them carries a sound clean across a
       * warren far too big to shout across. It is also how you find a blockage:
       * fire the chain and watch where it stops. */
      { id: 11, key: 'bell',     name: 'Relay bell',     solid: true,  color: '#7cf7ff', absorb: 0.01, cost: 5.0,  tex: 'bell',   carry: true  , note: 880 },
      { id: 12, key: 'forge',    name: 'Xenonite forge', solid: true,  color: '#ff8a3c', absorb: 0.06, cost: 5.0,  tex: 'forge',  carry: false , note: 196 },
      /* CAST xenonite — poured in place, part of the structure, and it does not
       * come up again. A loose block of xenonite you can lift is a window you can
       * simply REMOVE and crawl through, which quietly unlocks every chamber in
       * the game that was supposed to be reachable only by sound. */
      { id: 13, key: 'pane',     name: 'Cast xenonite',  solid: true,  color: '#c9a4ff', absorb: 0.02, cost: 1.4,  tex: 'pane',   carry: false , note: 698 },
      /* ASTROPHAGE.
       * It eats light. Of course it eats sound — it eats everything that arrives,
       * which is what it is FOR. It returns nothing at all, so Rocky cannot hear
       * it: he can only hear the hole where it is. You find the thing that is
       * killing your star by looking for the part of the room that is not there. */
      { id: 14, key: 'astro',    name: 'Astrophage',     solid: true,  color: '#120a1c', absorb: 0.995, cost: 26.0, tex: 'void', carry: true , note: 55 },
      /* THE WAY OUT.
       * PLAYTEST: "there is not a clear exit to the room... each level needs a
       * distinct similar finishing spot, or door, or portal."  Fair, and it was worse
       * than that: in the tutorial the only exit was the way in.
       *
       * So every chapter now ends at the same thing, and it is findable the way this
       * game finds EVERYTHING: solve the room and the way out starts to HUM. Pulse
       * anywhere and you will hear it calling. Walk into it and you are through. */
      { id: 15, key: 'exit',     name: 'The way out',    solid: true,  color: '#7cffb0', absorb: 0.0,  cost: 2.0,  tex: 'arch',   carry: false, note: 988 }
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
      pipe:  { period: 4.0, amp: 0.40, range: 12, hue: '#3fd3c0' },
      drip:  { period: 1.7, amp: 0.30, range: 8,  hue: '#8fd8ff' },
      /* The way out calls, and it calls LOUD and far, because a player who cannot
       * find the door is a player who is not playing. It only starts once the room is
       * solved — before that it is a dead arch and it says nothing. */
      exit:  { period: 1.4, amp: 1.0, range: 34, hue: '#7cffb0' }
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
      'world:astro':  'how:astro'
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
      { marker: 'astro', group: 'Hearing',    title: 'Astrophage',  body: 'It eats light. Of course it eats sound — it eats everything that arrives, which is what it is FOR. So it gives NOTHING back, and Rocky cannot hear it. He can only hear the HOLE where it is: pulse, and a patch of the wall simply does not come home. That is how you find the thing that is killing your star — you look for the part of the room that is not there. And a sample in your vest eats your own voice too: carry three and you are down to a sixth of yourself, whispering in the dark, and you will need to build something that can shout for you.' },
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
