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
