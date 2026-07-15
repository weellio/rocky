/* ROCKY SAVES THE UNIVERSE — ACT III — THE VOYAGE
 *
 * Forty-two light years, and then quiet.
 *
 * Levels only. The RULES live in config.js; these files are just the rooms the rules
 * happen in. js/chapters.js stitches every act back into one ordered list, and the
 * order in THAT file is the order you play them in — not the order they load.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else ((root.ROCKY_ACTS = root.ROCKY_ACTS || {})['act3_voyage'] = factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    /* ==============================================================
     * ACT III.12 — SLEEP
     *
     * Forty-two light years. You cannot see relativity and you cannot see the distance, so
     * the chapter is the one thing an engineer on a long haul actually does: your rounds,
     * and then you sleep, and then you get up and do them again. Four shifts.
     *
     * And the ship CHANGES while you are out, and nobody tells you what. A bulkhead you
     * have never had to think about has settled. A drift of grit has come down in a corner
     * that was clean when you lay down. A way has opened further forward that was not there
     * before. You pulse into a room you knew, and something is different, and the only way
     * to know what is to have been listening.
     *
     * The rule is honest: you do not sleep through your rounds. Each shift owns a gauge,
     * and the bunk will not have you until you have read it — and the gauges tell the story
     * the portholes cannot, because there are no portholes: the reactor creeps hot, and
     * then the shielding numbers start to climb, and climb, and by the fourth shift the
     * xenonite is not holding the radiation the way anyone promised it would. Which is the
     * whole of the next chapter, arriving early, in a number, in the dark.
     * ============================================================== */
    {
      id: 'sleep',
      name: 'Sleep',
      world: { w: 48, h: 12, d: 14 },
      spawn: [6, 3, 7],
      objective: 'Four shifts. Read the shift\'s gauge, sleep at the bunk (F), and mind what the ship does while you are out.',
      exit: [44, 3, 7],
      bunk: [3, 3, 7],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [47, 11, 13], block: 1 },
        { op: 'room', from: [2, 1, 3], to: [45, 8, 11], floor: 2 },

        // three bulkheads between the four shift-chambers; the door cells are carved back
        // to doors by the doors array, and each opens only when you sleep into that shift
        { op: 'fill', from: [14, 1, 3], to: [14, 7, 11], block: 1 },
        { op: 'fill', from: [24, 1, 3], to: [24, 7, 11], block: 1 },
        { op: 'fill', from: [34, 1, 3], to: [34, 7, 11], block: 1 },

        // THE BUNK, aft: a pad of xenonite (green — life, rest) against the back wall
        { op: 'fill', from: [3, 1, 6], to: [3, 1, 8], block: 7 },

        // the way out, fore
        { op: 'room', from: [43, 1, 5], to: [46, 6, 9], floor: 2 }
      ],
      // a little life in each chamber, so a room that goes quiet later is a room you KNEW
      sources: [
        { at: [10, 3, 4], kind: 'pipe' },
        { at: [20, 3, 10], kind: 'drip' },
        { at: [30, 3, 4], kind: 'pipe' },
        { at: [40, 3, 10], kind: 'vent' }
      ],
      /* Four gauges, one per shift. The reactor creeps, then the shielding fails. The
       * numbers are the plot; base six is how Rocky reads them. */
      gauges: [
        { id: 'g1', at: [10, 3, 7], name: 'Reactor · heat',    nominal: 40, reading: 41 },
        { id: 'g2', at: [20, 3, 7], name: 'Reactor · heat',    nominal: 40, reading: 46 },
        { id: 'g3', at: [30, 3, 7], name: 'Shielding · rads',  nominal: 6,  reading: 27 },
        { id: 'g4', at: [40, 3, 7], name: 'Shielding · rads',  nominal: 6,  reading: 90 }
      ],
      doors: [
        { id: 'd2', cells: [[14, 1, 7], [14, 2, 7], [14, 3, 7]] },
        { id: 'd3', cells: [[24, 1, 7], [24, 2, 7], [24, 3, 7]] },
        { id: 'd4', cells: [[34, 1, 7], [34, 2, 7], [34, 3, 7]] }
      ],
      labels: [
        { at: [3, 3, 7], block: 7, text: 'THE BUNK — F to sleep', color: '#57e08a' },
        { at: [10, 3, 7], block: 6, text: 'SHIFT I · reactor' },
        { at: [20, 3, 7], block: 6, text: 'SHIFT II · reactor' },
        { at: [30, 3, 7], block: 6, text: 'SHIFT III · shielding' },
        { at: [40, 3, 7], block: 6, text: 'SHIFT IV · shielding' }
      ],
      /* THE SHIFTS. Read the named gauge, come back to the bunk, and this is what the ship
       * does while you are asleep: it opens the next way forward, and it drops a little more
       * of itself on the floor behind you. Grit in the corners — a ship coming apart a
       * grain at a time, in rooms you have to walk back through to notice. */
      shifts: [
        { check: 'g1', opens: 'd2', ops: [{ op: 'fill', from: [8, 1, 11], to: [9, 2, 11], block: 9 }],
          line: { chord: '♩♪♩', text: 'Second shift. I slept, I think — it is hard to tell in here, there is no morning. Something has come down in the corner of the first hall while I was out. Grit. The ship is shedding itself, quietly, and only when nobody is listening.' } },
        { check: 'g2', opens: 'd3', ops: [{ op: 'fill', from: [18, 1, 3], to: [19, 2, 3], block: 9 }],
          line: { chord: '♪♩♩', text: 'Third shift. The reactor is running hot and the hall behind me is a little smaller than it was — more grit, a different corner. I am forty-two light years from anyone who could tell me whether that is normal. It is not normal. I know it is not normal.' } },
        { check: 'g3', opens: 'd4', ops: [{ op: 'fill', from: [28, 1, 11], to: [29, 2, 11], block: 9 }],
          line: { chord: '♩♩♪♩', text: 'Fourth shift, and I do not want to read the last gauge. The shielding is xenonite. Xenonite is supposed to stop this. Every number I have taken since I woke says it is not stopping this, and the last chamber is the one with the worst of it in.' } }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'Forty-two light years, and no windows — windows are for eyes. So this is the voyage: my rounds, and the bunk, and my rounds again. Read the gauge in each hall. Sleep when it is read. And listen to what the ship gets up to while I am not.' },
        { at: 'start', chord: '♩♩♪', text: 'The bunk is behind me, in the green. Walk into it and press F when the shift is done.' },
        { at: 'all_gauges', chord: '♩♪♪♩', text: 'Ninety, against a promised six. The shielding is not shielding. Whatever we thought xenonite did to this radiation, it does not do it — and there are twenty-two other people asleep on this ship who do not know that yet.', banner: 'THE XENONITE IS NOT HOLDING' }
      ]
    },

    /* ==============================================================
     * ACT III.13 — THE FAILURE
     *
     * You have known where everybody is for the whole game. Not by looking — nobody here
     * has ever looked at anything — but by the noise they make. An Eridian is always
     * working, so an Eridian is a sound, and you have navigated by those sounds since the
     * first room: the tap and scrape of somebody alive in the next chamber.
     *
     * The xenonite is not stopping the radiation. Sleep told you that in a number; this is
     * the number happening to people. You go down the ship on your rounds, and at each
     * station you check the gauge, and you learn the section is lethal — and the crew
     * member working it goes quiet. Not dramatically. There is no announcement, no banner,
     * no body. A hum you have heard all game simply stops, and you are standing there, and
     * the only way you know somebody has died is that a sound you were not even listening
     * for is not there any more.
     *
     * By the last gauge you are the only voice left on the ship. Which is the next chapter.
     * ============================================================== */
    {
      id: 'failure',
      name: 'The Failure',
      world: { w: 54, h: 12, d: 16 },
      spawn: [6, 3, 8],
      objective: 'The shielding is failing. Check each section — and listen to what is still there when you do.',
      exit: [50, 3, 8],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [53, 11, 15], block: 1 },
        { op: 'room', from: [2, 1, 3], to: [51, 8, 13], floor: 2 },
        // low ribs between the sections you can step over — the ship has a spine, but the
        // way is open: nothing is LOCKED here, the loss is not a puzzle you can fail
        { op: 'fill', from: [15, 1, 3], to: [15, 3, 13], block: 1 },
        { op: 'fill', from: [15, 1, 7], to: [15, 3, 9], block: 0 },
        { op: 'fill', from: [25, 1, 3], to: [25, 3, 13], block: 1 },
        { op: 'fill', from: [25, 1, 7], to: [25, 3, 9], block: 0 },
        { op: 'fill', from: [35, 1, 3], to: [35, 3, 13], block: 1 },
        { op: 'fill', from: [35, 1, 7], to: [35, 3, 9], block: 0 },
        { op: 'fill', from: [45, 1, 3], to: [45, 3, 13], block: 1 },
        { op: 'fill', from: [45, 1, 7], to: [45, 3, 9], block: 0 },
        { op: 'room', from: [49, 1, 6], to: [52, 6, 10], floor: 2 }
      ],
      // the ship's own machines keep running — it is the PEOPLE who stop
      sources: [
        { at: [8, 3, 4], kind: 'pipe' },
        { at: [46, 3, 12], kind: 'vent' }
      ],
      /* Four sections, four gauges. Reading one is checking that section — and finding it
       * lethal. The numbers only ever get worse. */
      gauges: [
        { id: 'g1', at: [11, 3, 8], name: 'Section 1 · rads', nominal: 6, reading: 44 },
        { id: 'g2', at: [21, 3, 8], name: 'Section 2 · rads', nominal: 6, reading: 61 },
        { id: 'g3', at: [31, 3, 8], name: 'Section 3 · rads', nominal: 6, reading: 78 },
        { id: 'g4', at: [41, 3, 8], name: 'Section 4 · rads', nominal: 6, reading: 95 }
      ],
      /* THE CREW. The volunteers from Tau Ceti, working the ship they chose to die on. Each
       * hums at their station until you check their section — and then they do not. `dies`
       * names the gauge whose reading ends their sound. ARK is last, because ARK asked you
       * to write his name down, and you did. */
      folk: [
        { at: [12, 3, 11], name: 'VOTH',   chord: '♩♪♩',  dies: 'g1',
          line: 'Still here, Rocky. Still working. Do not stop on my account — go and read your gauge. I know what it says. I have known for a while.' },
        { at: [22, 3, 5],  name: 'SEVEN',  chord: '♪♪♩',  dies: 'g2',
          line: 'I told you it did not matter whether we came back. I did not think it would be this that got us, though. Not the shielding. We were so sure about the shielding.' },
        { at: [32, 3, 11], name: 'BRIDGE', chord: '♩♩♪♩', dies: 'g3',
          line: 'I built this hull. I built it to hold twenty-nine atmospheres and it holds them beautifully. Nobody asked me to build it to hold this. Go on. Check my section. I can hear you not wanting to.' },
        { at: [42, 3, 5],  name: 'ARK',    chord: '♪♩♩♪', dies: 'g4',
          line: 'Three children. You wrote my name down, in that order, like I asked. I am glad it was you doing the rounds, Rocky. Read the last gauge. I do not want you to, and I want you to. Both.' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'I have known where every one of them is since we launched. Not by looking — by listening. Voth tapping. Seven filing something down, always. Bridge, humming, that low thing he does not know he does. This is how you know a ship is alive: it is full of noises that are people.' },
        { at: 'start', chord: '♩♩♪',  text: 'The shielding is failing and I have to check each section to see how far. I already know how far. I can hear how far.' },
        { at: 'gauge', chord: '♪♩',   text: '...and the sound stops.' },
        { at: 'all_gauges', chord: '♩♪♪♩', text: 'There. That was the last of it — the last voice but mine. I have read every gauge and I have lost every one of them doing it, and the ship is exactly as loud now as a ship with nobody on it, because that is what it is.', banner: 'YOU ARE THE ONLY SOUND LEFT' }
      ]
    },

    /* ==============================================================
     * ACT III.14 — ALONE
     *
     * The quiet middle of the game, and it is supposed to hurt.
     *
     * Every room until now has had something in it making a sound — a vent, a drip, a
     * person. You have never once been in a silence you had to fill entirely by yourself.
     * Now the ship is empty. There are no sources. Nothing hums, nothing works, nothing
     * answers except the rock, and the rock only answers when you shout at it. So the
     * chapter is navigation through a place where the ONLY noise is the one you make — and
     * the pulse has a long cooldown here, on purpose, so that between one shout and the
     * next there are seconds of dark you cannot do anything about but wait. That wait is
     * the loudest thing in the game.
     *
     * The way runs past the stations where the crew were. They are labelled, and they are
     * silent, and walking a dead man's post in the dark is the whole chapter. At the end is
     * the bridge, and the way on.
     * ============================================================== */
    {
      id: 'alone',
      name: 'Alone',
      world: { w: 58, h: 14, d: 18 },
      spawn: [5, 3, 9],
      objective: 'There is no one left to make a sound but you. Pulse, and wait, and find the bridge.',
      exit: [53, 3, 9],
      cooldown: 1.5,
      build: [
        { op: 'fill', from: [0, 0, 0], to: [57, 13, 17], block: 1 },
        // the dead ship: a run of chambers, joined by low crawls, dog-legged so you cannot
        // see end to end and must pulse your way along it a length at a time
        { op: 'room', from: [3, 1, 6], to: [16, 8, 12], floor: 2 },
        { op: 'room', from: [16, 1, 3], to: [24, 6, 8], floor: 2 },
        { op: 'room', from: [24, 1, 8], to: [34, 9, 14], floor: 2 },
        { op: 'room', from: [34, 1, 4], to: [44, 7, 10], floor: 2 },
        { op: 'room', from: [44, 1, 7], to: [55, 8, 12], floor: 2 },
        // the crawls between them (carved so the flood connects; short and low)
        { op: 'fill', from: [16, 1, 6], to: [16, 3, 8], block: 0 },
        { op: 'fill', from: [24, 1, 7], to: [24, 3, 9], block: 0 },
        { op: 'fill', from: [34, 1, 7], to: [34, 3, 9], block: 0 },
        { op: 'fill', from: [44, 1, 8], to: [44, 3, 10], block: 0 },
        // a little wreck underfoot — grit come down in the empty halls, nobody to clear it
        { op: 'rubble', from: [5, 2, 7], to: [54, 4, 11], amount: 0.04 },
        // the bridge bay
        { op: 'room', from: [52, 1, 7], to: [56, 6, 11], floor: 2 }
      ],
      // NOTHING makes a sound here. The empty `sources` is the whole design.
      sources: [],
      /* The dead crew's posts, in the order you pass them. Silent now — labels you walk up
       * to in the dark, where a voice used to be. */
      labels: [
        { at: [10, 3, 9],  block: 2, text: 'VOTH’S STATION — quiet now', color: '#7d93aa' },
        { at: [20, 3, 5],  block: 2, text: 'SEVEN’S BENCH — the filing has stopped', color: '#7d93aa' },
        { at: [29, 3, 11], block: 2, text: 'BRIDGE’S POST — no one humming', color: '#7d93aa' },
        { at: [39, 3, 7],  block: 2, text: 'ARK’S BUNK — three children', color: '#7d93aa' },
        { at: [53, 3, 9],  block: 15, text: 'THE BRIDGE', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'I have never heard a quiet like this. Not once, in my whole life. There has always been something — the warren settling, a machine, somebody in the next room. Now there is the ship, and there is me, and when I stop shouting there is nothing at all.' },
        { at: 'start', chord: '♩♩♪', text: 'So I shout, and I wait for the wall to answer, and I count the seconds until I can shout again. That counting is the loudest thing left on this ship. I am going to walk to the bridge past every station I used to be able to hear, and every one of them is going to be silent, and I am going to do it anyway.' }
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
  ];
});
