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
    blocks: [
      { id: 0, key: 'air',      name: 'Air',            solid: false, color: '#000000', absorb: 0.0,  tex: 'none' },
      { id: 1, key: 'rock',     name: 'Erid basalt',    solid: true,  color: '#4a5a6e', absorb: 0.35, tex: 'mottle' },
      { id: 2, key: 'plate',    name: 'Floor plate',    solid: true,  color: '#6f7f93', absorb: 0.22, tex: 'plate' },
      { id: 3, key: 'girder',   name: 'Girder',         solid: true,  color: '#c88a3a', absorb: 0.10, tex: 'stripe' },
      { id: 4, key: 'pipe',     name: 'Ammonia pipe',   solid: true,  color: '#3fd3c0', absorb: 0.08, tex: 'rings' },
      { id: 5, key: 'vent',     name: 'Heat vent',      solid: true,  color: '#ff6a2b', absorb: 0.05, tex: 'grille' },
      { id: 6, key: 'gauge',    name: 'Heat gauge',     solid: true,  color: '#ffd23c', absorb: 0.04, tex: 'dial' },
      { id: 7, key: 'xenonite', name: 'Xenonite',       solid: true,  color: '#b46bff', absorb: 0.02, tex: 'facet' },
      { id: 8, key: 'door',     name: 'Warren door',    solid: true,  color: '#8fe36b', absorb: 0.30, tex: 'panel' },
      { id: 9, key: 'sand',     name: 'Grit',           solid: true,  color: '#2f3743', absorb: 0.72, tex: 'grain' }
    ],

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
      drip:  { period: 1.7, amp: 0.30, range: 8,  hue: '#8fd8ff' }
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
    story: {
      title: 'ROCKY SAVES THE UNIVERSE',
      subtitle: 'Chapter One — The Cold'
    },

    chapters: [
      {
        id: 'cold',
        name: 'The Cold',
        world: { w: 44, h: 22, d: 44 },
        spawn: [22, 6, 34],
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
          { op: 'fill', from: [6, 4, 16], to: [10, 7, 16], block: 8 }
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
      'act:gauge':    'how:gauge'
    },

    how: [
      { marker: 'walk',     title: 'Move',        body: 'WASD moves Rocky. Five legs, no hurry, and he never trips.' },
      { marker: 'climb',    title: 'Climb',       body: 'Walk into a wall and hold forward. Eridians climb, and five legs do not let go — stop pressing and Rocky simply holds on. Hold SHIFT to walk back down.' },
      { marker: 'jump',     title: 'Jump',        body: 'SPACE. Erid pulls twice as hard as Earth, so Rocky jumps badly. Climb instead.' },
      { marker: 'pulse',    title: 'Pulse',       body: 'Rocky has no eyes. Press E to pulse, and listen to what comes back. A ring leaves him at the speed of sound — watch it go.' },
      { marker: 'return',   title: 'Out, and back', body: 'A wall does not appear when the sound reaches it. It appears when the echo gets back to ROCKY. Out and home again — so the far wall answers late, and that delay IS the distance. It is the only ruler he has.' },
      { marker: 'footfall', title: 'Five legs',   body: 'Five legs on stone are five small sounds. Rocky cannot help hearing the floor he walks on, so while you move you can always see where you are standing. Stand perfectly still in a dead corridor and you cannot.' },
      { marker: 'decay',    title: 'Memory',      body: 'An echo fades. What you saw a moment ago is memory, and memory dims. Pulse again.' },
      { marker: 'through',  title: 'Through walls', body: 'Sound crosses rock — poorly, but it crosses. A machine humming behind a wall shows up as a faint ghost. That is not a bug in his hearing. That is a doorway.' },
      { marker: 'material', title: 'Materials',   body: 'Every material rings differently, and the colour you see IS that ring. Basalt is dull blue. Girder is orange. Xenonite sings violet. Grit swallows sound and shows almost nothing.' },
      { marker: 'sources',  title: 'The warren breathes', body: 'Machines make their own noise on their own rhythm. Near a vent you are never blind. In a dead corridor you are.' },
      { marker: 'base6',    title: 'Six',         body: 'Eridians count in sixes, because they have five arms and think of the hand itself as the sixth thing. Every number here is base six.' },
      { marker: 'gauge',    title: 'Gauges',      body: 'Stand at a gauge and press F to read it. It gives you a temperature, and what that temperature is supposed to be.' }
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
