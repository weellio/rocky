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
      folk:  { period: 2.0, amp: 0.62, range: 18, hue: '#ffb36b' },
      /* THE BURN. For one chapter, and one chapter only, you do not have to make a sound
       * to know where you are — the drive does it for you, and it does it to the WHOLE
       * SHIP at once. It is the loudest thing in the game by a mile: it floods every
       * chamber, it throbs (the period is short, so it re-lights before the last echo has
       * faded), and it is AMBER because it is heat — the same heat that is eating the star,
       * turned into the thing that carries you to it. It ends when you strap in, and after
       * that it is quiet for forty-two light years. */
      burn:  { period: 0.55, amp: 2.3, range: 74, hue: '#ffb020' },
      /* THE CONTACT. Something at Tau Ceti that is not a wall and is not one of yours. It is
       * deliberately COLOURLESS — a pale, uncertain white — because Rocky does not know what
       * it is yet, and the palette will not spend its orange on the humans until he is close
       * enough to be sure. You hear it only when it passes near; it is faint, and it moves. */
      contact: { period: 1.1, amp: 0.7, range: 15, hue: '#e8eef2' }
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
      /* THE LEVELS LIVE IN js/acts/*.js AND ARE STITCHED IN BY js/chapters.js.
       * They were in here once, all eleven of them, and this file stopped being
       * readable as a RULEBOOK -- which is the only reason it exists. Anything in
       * config.js is a law of the universe; anything in an act file is a room. If you
       * are reading a chapter and it feels like a rule, it is in the wrong file.
       *
       * Load config.js, then the acts, then chapters.js. Nothing works until you do. */
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
