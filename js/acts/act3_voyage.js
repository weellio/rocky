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
     * ACT III.15 — TAU CETI
     *
     * Arrival. And something else is here.
     *
     * Forty-two light years, everyone he came with dead, and Rocky does the thing he came
     * to do: he goes to the array and he listens to the star. And there is a sound.
     *
     * It is not a wall — walls do not move. It is not one of his — his are all silent now.
     * It is a thing crossing the dark outside the hull, and the hull is cast xenonite, and
     * xenonite SINGS, so as the thing passes he can hear it ring the length of the ship: a
     * strange, two-tone, wrong little voice, HERE, and then over there, and then nearer. The
     * first moving sound in the whole game — the first thing that is not where he left it.
     *
     * The array gives him three bearings, and every one is closer than the last. Whatever
     * it is, it has seen his ship, and it is coming. Which is the rest of the game.
     * ============================================================== */
    {
      id: 'tauceti',
      name: 'Tau Ceti',
      world: { w: 50, h: 12, d: 16 },
      spawn: [5, 3, 7],
      objective: 'You are here. Read the array — three bearings — and mind the thing that is not a wall.',
      exit: [45, 3, 7],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [49, 11, 15], block: 1 },
        { op: 'room', from: [3, 1, 4], to: [46, 8, 10], floor: 2 },
        // THE HULL SKIN: a wall of CAST xenonite down the outboard side. It cannot be lifted
        // (it is the hull), and it carries sound almost for free — so a thing passing OUTSIDE
        // it rings the whole length of the ship, and that is how you hear what you cannot see.
        { op: 'fill', from: [3, 1, 11], to: [46, 8, 11], block: 13 },
        // the airlock, forward — the way into the rest of the story
        { op: 'room', from: [43, 1, 5], to: [47, 6, 9], floor: 2 }
      ],
      /* THE CONTACT. A moving source, out past the hull, patrolling the length of the ship
       * and back. It is faint and it is wrong and it will not hold still. */
      sources: [
        { kind: 'contact', path: [[4, 4, 12], [45, 4, 12]], speed: 7 }
      ],
      /* THE ARRAY: three bearings to the thing outside. There should be NOTHING here —
       * nominal zero — and every reading says something, closer each time. */
      gauges: [
        { id: 'g1', at: [12, 3, 7], name: 'Contact · range', nominal: 0, reading: 88 },
        { id: 'g2', at: [24, 3, 7], name: 'Contact · range', nominal: 0, reading: 40 },
        { id: 'g3', at: [36, 3, 7], name: 'Contact · range', nominal: 0, reading: 14 }
      ],
      labels: [
        { at: [12, 3, 7], block: 6, text: 'ARRAY I · bearing' },
        { at: [24, 3, 7], block: 6, text: 'ARRAY II · bearing' },
        { at: [36, 3, 7], block: 6, text: 'ARRAY III · bearing' },
        { at: [24, 3, 11], block: 13, text: 'THE HULL — it rings when something passes', color: '#a9e8bd' },
        { at: [45, 3, 7], block: 15, text: 'THE AIRLOCK', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'Tau Ceti. I am here. I came all this way to listen to a star that is not dying, and I have been listening for an hour, and the star is fine — the star is exactly as clean as they hoped. It worked. It all worked, and there is no one left to tell.' },
        { at: 'start', chord: '♩♩♪', text: 'And then — no. That is not the star. That is not a wall. Walls do not move. Something is out there, past the hull, and I can hear it because the hull SINGS, and it is going one way and then the other, and it is not one of mine, because mine are all quiet now.' },
        { at: 'gauge', chord: '♪♩', text: 'Another bearing. Closer.' },
        { at: 'all_gauges', chord: '♩♪♪♩', text: 'Three bearings and every one nearer than the last. It is not drifting. It is not wreckage. It has a heading, and the heading is me. Something crossed forty-two light years to the same dying star I did, and it has seen my ship, and it is coming to it.', banner: 'IT IS NOT A WALL — AND IT IS COMING' }
      ]
    },

    /* ==============================================================
     * ACT IV.16 — THE BLIP
     *
     * A contact that does not answer.
     *
     * At Tau Ceti he heard it pass. Now he has to TRACK it — and it will not help him. You
     * cannot open it like a door or ring it like a bell; you pulse at it and nothing comes
     * back but the same wrong little voice, somewhere new. So you do the only thing there
     * is: you catch WHERE it is, and then where it is next, and then again, and you join the
     * dots into a heading. Standing still and pulsing at the same passing point tells you
     * nothing — the fix only counts if it is a fresh stretch of the thing's course — so you
     * have to run it down the dark, staying with it, pinning it at a spread of places.
     *
     * This is the first chapter that is entirely about a thing that is NOT WHERE YOU LEFT
     * IT. Plot four points and you have its line, and its line goes exactly where you feared
     * it did: to your airlock.
     * ============================================================== */
    {
      id: 'blip',
      name: 'The Blip',
      world: { w: 58, h: 12, d: 16 },
      spawn: [5, 3, 7],
      objective: 'It will not answer. Plot its course — catch it at four different points — and you will know where it is headed.',
      exit: [53, 3, 7],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [57, 11, 15], block: 1 },
        { op: 'room', from: [3, 1, 4], to: [54, 8, 10], floor: 2 },
        // the observation hull: cast xenonite the length of the deck, so the blip outside
        // rings through it and you can hear where it is well enough to chase
        { op: 'fill', from: [3, 1, 11], to: [54, 8, 11], block: 13 },
        { op: 'room', from: [51, 1, 5], to: [55, 6, 9], floor: 2 }
      ],
      /* The contact, faster now and closer in, running the length of the deck and back. */
      sources: [
        { kind: 'contact', path: [[4, 4, 12], [52, 4, 12]], speed: 6 }
      ],
      /* PLOT ITS COURSE. Four fixes, each a fresh stretch of its path — you cannot get them
       * all from one spot; you have to keep up with it. */
      track: { kind: 'contact', need: 4, range: 14, minSep: 9 },
      labels: [
        { at: [27, 3, 11], block: 13, text: 'THE HULL — the blip rings through it', color: '#a9e8bd' },
        { at: [53, 3, 7], block: 15, text: 'THE AIRLOCK', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'It is still out there. I have been awake for a day and a night listening to it and it has not once held still. It does not answer. I pulse at it — the way you would knock on a wall to see what is behind it — and nothing comes back but the thing itself, moved on, somewhere I did not leave it.' },
        { at: 'start', chord: '♩♩♪', text: 'So I will do what you do with a thing that will not answer: I will follow it. Catch where it is, and where it goes next, and again, until the dots are a line. Four should do it. I have to keep up with it — it will not wait for me to work it out.' },
        { at: 'plotted', chord: '♩♪♪♩', text: 'There. Four points, and they are a straight line, and the line ends at my airlock. It is not lost and it is not drifting. It knows exactly where I am, and it has known for a while, and it is on its way in.', banner: 'ITS COURSE ENDS AT YOUR DOOR' }
      ]
    },

    /* ==============================================================
     * ACT IV.17 — APPROACH
     *
     * It docked. And now Rocky is standing inside it, and it is wrong.
     *
     * His whole world is thick — twenty-nine atmospheres of hot ammonia pressing on
     * everything, so everything that holds it in is basalt, metres of it, and a pulse in
     * his ship shows him one room because the next room is behind a wall that eats sound.
     * This ship is not like that. This ship is THIN. Every wall is a single skin, and the
     * skin barely slows a sound at all — so when he pulses, the shout goes straight through
     * the walls and he hears the WHOLE ship at once, all of it, every chamber, ringing like
     * one struck thing. A huge flat panel, pointed at nothing. Thin struts, sticking out
     * into the dark. It is a ship built by somebody who has never once had to hold the sky
     * out, and Rocky cannot decide if it is the most fragile thing he has ever touched or
     * the bravest.
     *
     * There is no puzzle. There is just the crossing of it, in wonder, to the hatch at the
     * far end, where the thing that built it is waiting.
     * ============================================================== */
    {
      id: 'approach',
      name: 'Approach',
      world: { w: 52, h: 12, d: 16 },
      spawn: [4, 3, 8],
      objective: 'You are inside it now. One shout and you hear the whole ship — it is that thin. Cross to the hatch.',
      exit: [47, 3, 8],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [51, 11, 15], block: 1 },
        { op: 'room', from: [2, 1, 3], to: [48, 9, 13], floor: 2 },
        /* THE WALLS ARE WINDOWS. Each partition is ONE cell of cast xenonite — solid, so you
         * still have to walk around it through a gap, but so thin to sound that a pulse
         * pours straight through and lights the chamber beyond. This is the whole feeling of
         * the chapter: you hear far more of this ship at once than you have ever heard of
         * your own. The gaps alternate side to side, so the walk is a zig-zag while your
         * ears have the whole place already. */
        { op: 'fill', from: [12, 1, 3], to: [12, 8, 13], block: 13 },
        { op: 'fill', from: [12, 1, 4], to: [12, 3, 6], block: 0 },
        { op: 'fill', from: [21, 1, 3], to: [21, 8, 13], block: 13 },
        { op: 'fill', from: [21, 1, 10], to: [21, 3, 12], block: 0 },
        { op: 'fill', from: [30, 1, 3], to: [30, 8, 13], block: 13 },
        { op: 'fill', from: [30, 1, 4], to: [30, 3, 6], block: 0 },
        { op: 'fill', from: [39, 1, 3], to: [39, 8, 13], block: 13 },
        { op: 'fill', from: [39, 1, 10], to: [39, 3, 12], block: 0 },
        // THE HUGE FLAT PANEL: a great thin sail of xenonite stretched across the top of the
        // ship, pointed at nothing — the thing that makes no sense to a creature from a
        // world with no light
        { op: 'fill', from: [6, 9, 3], to: [45, 9, 13], block: 13 },
        // thin struts, poking down into the chambers
        { op: 'set', at: [16, 8, 8], block: 13 },
        { op: 'set', at: [25, 8, 5], block: 13 },
        { op: 'set', at: [34, 8, 11], block: 13 },
        // the hatch, at the far end, where it is waiting
        { op: 'room', from: [45, 1, 6], to: [49, 6, 10], floor: 2 }
      ],
      sources: [],
      labels: [
        { at: [25, 8, 8], block: 13, text: 'THE PANEL — flat, and vast, and pointed at nothing', color: '#a9e8bd' },
        { at: [12, 4, 8], block: 13, text: 'A WALL ONE CELL THICK — it barely stops a sound', color: '#a9e8bd' },
        { at: [47, 3, 8], block: 15, text: 'THE HATCH', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'I have crossed into it, and I have made one sound, and the sound did not stop. In my ship a shout dies at the first wall — the walls are the whole point, they hold the sky out. Here the shout went through the wall, and the next one, and the one after that, and I heard the entire ship ring at once, like a single struck bell. Every wall in this place is a window.' },
        { at: 'start', chord: '♩♩♪', text: 'It is so THIN. There is a panel up there the size of a hall, flat, pointed at nothing I can find, thin as a leaf. Struts like reeds. This whole ship would fold like wet paper under one atmosphere of mine, and it has crossed the same impossible distance I have, and I do not understand how, and I have never in my life wanted so badly to ask.' }
      ]
    },

    /* ==============================================================
     * ACT IV.18 — THE AIRLOCK
     *
     * The first meeting. And the room the whole palette has been saving its ORANGE for.
     *
     * There is a shape on the other side of the lock. It is upright and thin and it is not
     * an Eridian, and it holds a flat panel on the front of its head and points it at Rocky
     * and does something with it — and there is NO SOUND. Whatever it is trying, it is trying
     * in a way Rocky has no organ for; he stands in front of it while it works and works and
     * gets nothing at all, and it is the loneliest thing that has happened to him yet, to be
     * addressed and not be able to hear it. Behind it, a machine grinds and grinds and will
     * not stop.
     *
     * But the wall between them is cast xenonite, and xenonite carries sound. So Rocky does
     * the only thing he knows how to do: he goes up to the wall and he SHOUTS at it. And on
     * the far side, a thing hears him — the first thing that is not Erid, and not one of his
     * dead, and not a machine, to answer. That is the whole chapter. Not language. Just: it
     * heard me. We can be heard by each other. Everything else is the rest of the game.
     * ============================================================== */
    {
      id: 'airlock',
      name: 'The Airlock',
      world: { w: 44, h: 12, d: 16 },
      spawn: [4, 3, 8],
      objective: 'Something is on the other side, and it makes no sound you can use. Go to the window and SHOUT — the wall will carry it.',
      exit: [8, 3, 1],
      build: [
        { op: 'fill', from: [0, 0, 0], to: [43, 11, 15], block: 1 },
        // Rocky's side — his own ship, thick basalt
        { op: 'room', from: [2, 1, 4], to: [20, 8, 12], floor: 2 },
        // THE AIRLOCK WINDOW: a wall of cast xenonite between the two of them. Solid — he
        // cannot cross it, and must not, their airs would kill each other — but it SINGS, so
        // a shout goes through it even though a body never could.
        { op: 'fill', from: [21, 1, 4], to: [21, 8, 12], block: 13 },
        // the other's side, beyond the window
        { op: 'room', from: [22, 1, 4], to: [40, 8, 12], floor: 2 },
        // the hatch back into his ship, that opens once contact is made
        { op: 'fill', from: [8, 1, 3], to: [8, 3, 3], block: 8 },
        { op: 'room', from: [6, 1, 1], to: [10, 5, 3], floor: 2 }
      ],
      /* The machine on her side that never stops. */
      sources: [
        { at: [34, 3, 8], kind: 'grind' }
      ],
      /* THE OTHER. A biped, orange, thin, with a flat panel on its head — drawn nothing like
       * an Eridian, because it is nothing like one. Rocky has no name for it yet. */
      folk: [
        { at: [30, 3, 8], name: 'THE OTHER', kind: 'human', chord: '—',
          line: 'It is pointing the flat part of its head at me again. It is doing something with it, something that matters to it, I can tell — and there is nothing. No sound at all. It is talking and I am deaf to whatever this is, and it does not know that yet, and I cannot think of anything sadder.' }
      ],
      /* THE WINDOW HEARS. A resonator on the far side of the xenonite, set to need a good
       * loud shout — so you have to come right up to the glass, where it is standing, and
       * make your noise there. Then it hears you, and the hatch behind you opens: not a
       * puzzle solved, a hand held up against a window from the other side. */
      ears: [
        { id: 'win', at: [22, 3, 8], needs: 0.45, name: 'IT HEARD YOU', opens: 'back' }
      ],
      doors: [
        { id: 'back', cells: [[8, 1, 3], [8, 2, 3], [8, 3, 3]] }
      ],
      labels: [
        { at: [21, 4, 8], block: 13, text: 'THE WINDOW — shout here; the wall carries it', color: '#a9e8bd' },
        { at: [8, 3, 3], block: 8, text: 'THE WAY BACK', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'It is right there. On the other side of a hand-span of xenonite, a shape, upright, thin, not one of mine and not one of anything I have ever heard of. It is holding a flat panel to the front of its head and pointing it at me and WAITING, and I have no idea for what, because whatever it is doing makes no sound, and sound is the only thing I have.' },
        { at: 'start', chord: '♩♩♪', text: 'So I will do the one thing I know. The wall is xenonite. Xenonite carries. I am going to go right up to it, and I am going to shout, and I am going to find out if this thing can hear.' },
        { at: 'ear', chord: '♩♪♪♩♩', text: 'It moved. The moment my shout hit the wall, the whole shape of it changed — it FELT that. It cannot see me any more than I can see it, and it cannot hear the way I hoped, but it felt the wall ring and it knows what that means: there is somebody here. We found the one door that is open. Everything else we will have to build, but we found the door.', banner: 'IT HEARD YOU' }
      ]
    },

    /* ==============================================================
     * ACT IV.19 — TWENTY-NINE ATMOSPHERES
     *
     * The thing will die in your ship. You will die in its. Neither of you can breathe the
     * other's air, and you both work it out inside a minute, and you both keep talking.
     *
     * There is a hole in the join between the two ships and Rocky's air is going out of it,
     * fast, into nothing — his chamber is emptying while he stands in it. He has to seal it.
     * He has exactly two things to seal it with: a lump of grit, and a pane of xenonite.
     *
     * The grit will do it. Grit stops anything; his air would come back and he would be
     * safe. And he would never hear her again, because grit is DEAF — it is the one material
     * that eats a sound whole, and the far side of a grit wall is silence. He would be
     * alive, and sealed, and alone, a hand-span from the only other mind for forty light
     * years, and unable to say so.
     *
     * The xenonite also stops the air. And xenonite SINGS. Seal the hole with xenonite and
     * he is safe AND he can still shout through the wall and be heard on the other side. It
     * is the only answer, and it is not a compromise — it is the whole thesis of the game,
     * standing in one cell: the wall between them is not the obstacle. The wall is the only
     * reason the two of them can talk at all.
     * ============================================================== */
    {
      id: 'atmospheres',
      name: 'Twenty-Nine Atmospheres',
      world: { w: 32, h: 12, d: 12 },
      spawn: [4, 3, 6],
      objective: 'Your air is pouring out of a hole in the wall. Seal it — and only xenonite seals it AND lets you keep talking through it.',
      exit: [9, 3, 1],
      seal: [13, 3, 6],
      space: [[13, 3, 6]],   // the hole vents Rocky's chamber to nothing until he plugs it
      build: [
        { op: 'fill', from: [0, 0, 0], to: [31, 11, 11], block: 1 },
        // Rocky's chamber — his air, twenty-nine atmospheres of it, and going
        { op: 'room', from: [2, 1, 3], to: [12, 8, 9], floor: 2 },
        // THE HOLE, in the join — a single empty cell his whole atmosphere is leaving through
        { op: 'set', at: [13, 3, 6], block: 16 },
        // the other ship's hull, intact: cast xenonite, so it already sings — her wall was
        // never the problem, and it is how he knows she is there at all
        { op: 'fill', from: [14, 1, 3], to: [14, 8, 9], block: 13 },
        { op: 'room', from: [15, 1, 3], to: [25, 8, 9], floor: 2 },
        // the two things he has to plug it with: the trap and the answer
        { op: 'set', at: [6, 2, 6], block: 9 },   // grit — airtight, and deaf
        { op: 'set', at: [8, 2, 6], block: 7 },   // xenonite — airtight, and it sings
        // the way on, once he is sealed and still able to speak
        { op: 'room', from: [7, 1, 1], to: [11, 5, 3], floor: 2 }
      ],
      sources: [
        { at: [22, 3, 6], kind: 'grind' }
      ],
      folk: [
        { at: [20, 3, 6], name: 'THE OTHER', kind: 'human', chord: '—',
          line: 'It is still there. On the far side of a wall I am about to reseal, doing its silent thing with the panel on its head, alive in an air that would kill me in a breath — and I would kill it, if my air got to it, and we both know this now, and neither of us has moved away from the wall.' }
      ],
      labels: [
        { at: [13, 4, 6], block: 16, text: 'THE HOLE — your air is going', color: '#ff5a4d' },
        { at: [6, 3, 6], block: 9, text: 'GRIT — seals it, and goes deaf', color: '#8a5a4a' },
        { at: [8, 3, 6], block: 7, text: 'XENONITE — seals it, and sings', color: '#57e08a' },
        { at: [9, 3, 1], block: 15, text: 'THE WAY ON', color: '#4dff9e' }
      ],
      lines: [
        { at: 'start', chord: '♪♩♪♩', text: 'There is a hole in the wall between us and my air is leaving through it. I can feel the chamber going thin. I have to close it now, and I have two things in reach to close it with, and this is the most important choice I have made since I left home, and I have about a minute to make it.' },
        { at: 'start', chord: '♩♩♪', text: 'Grit would do it. Grit stops everything — including the sound of it, on the other side. I would be safe and I would be deaf and it would be right there and I could never tell it so. Xenonite stops the air AND carries my voice. The wall is not the thing keeping us apart. The wall is the only thing letting us be together. So it is xenonite. Of course it is xenonite.' },
        { at: 'pressure', chord: '♩♪♩', text: 'Air. The chamber is full again, and the wall is whole, and it SINGS — I can hear the grinding of its machine straight through the seal. We are two sealed jars a hand-span apart, and we can shout to each other all night, and neither of us will ever open the lid. That is the deal. I will take it.' }
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
