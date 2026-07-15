/* ROCKY SAVES THE UNIVERSE — chapters.js
 *
 * THE RUNNING ORDER. This is the only file that knows what comes after what.
 *
 * The acts load in whatever order the script tags happen to fire; the ORDER YOU PLAY
 * THEM IN is the list below, and nothing else. That means moving a chapter between acts
 * is a filing decision, not a gameplay one, and reordering the game is a one-line edit
 * here rather than a cut-and-paste through two thousand lines of level data.
 *
 * Two things are checked, loudly, at load:
 *
 *   1. EVERY CHAPTER THAT EXISTS IS LISTED. Write a beautiful level, forget to name it
 *      here, and the game will tell you -- instead of silently shipping without it.
 *   2. EVERY CHAPTER LISTED EXISTS. Rename an id and the game refuses to boot rather
 *      than dropping the player into an undefined room.
 *
 * A split that can silently lose a level is worse than the long file it replaced.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./config.js'),
      {
        act0_workshop: require('./acts/act0_workshop.js'),
        act1_erid: require('./acts/act1_erid.js'),
        act2_ship: require('./acts/act2_ship.js'),
        act3_voyage: require('./acts/act3_voyage.js')
      }
    );
  } else {
    root.ROCKY_CFG = factory(root.ROCKY_CFG, root.ROCKY_ACTS || {});
  }
})(typeof self !== 'undefined' ? self : this, function (CFG, ACTS) {
  'use strict';

  /* The game, in order. */
  const ORDER = [
    'workshop',     /* 0 · the tutorial: every material, every verb, no story */
    'cold',         /* I · his star is going out and nobody can see it */
    'deep',
    'consensus',
    'astronomers',
    'forge',        /* II · they stop making anything else */
    'petrova',
    'hull',
    'drive',
    'volunteers',   /*      twenty-three of them, and nobody argued */
    'launch',       /*      the one chapter you can see everything */
    'sleep',        /* III · four shifts, and the ship changes while you are out */
    'failure',      /*      the crew go silent one by one; a death is a sound that stops */
    'alone',        /*      the quiet middle: the only sound is the one you make */
    'tauceti',      /*      arrival — and the first sound that is not where you left it */
    'blip',         /* IV · a contact that will not answer; plot its course by ear */
    'approach',     /*      board the thin ship: one shout, and you hear all of it */
    'airlock',      /*      first contact — the palette spends its orange; "it heard me" */
    'atmospheres',  /*      seal the breach with xenonite: airtight AND still able to talk */
    'numbers',      /* V · base six becomes a language: say her count in sixes and ones */
    'names',        /*      every material's note becomes a shared word */
    'wall',         /*      the engineer BUILDS the xenonite wall between the ships */
    'question',     /*      she ASKS — the first time somebody wants something back */
    'grief',        /*      say your dead in sixes and ones — twenty-three */
    'longdark'      /*      forty-two light years of quiet */
  ];

  const all = [];
  Object.keys(ACTS).sort().forEach(function (k) {
    (ACTS[k] || []).forEach(function (ch) { all.push(ch); });
  });

  const byId = {};
  all.forEach(function (ch) {
    if (byId[ch.id]) throw new Error('chapters: two chapters answer to "' + ch.id + '"');
    byId[ch.id] = ch;
  });

  const orphans = all.filter(function (ch) { return ORDER.indexOf(ch.id) < 0; });
  if (orphans.length) {
    throw new Error('chapters: written but never played -- ' +
      orphans.map(function (c) { return c.id; }).join(', ') +
      ' (add it to ORDER in js/chapters.js)');
  }

  CFG.chapters = ORDER.map(function (id) {
    if (!byId[id]) throw new Error('chapters: ORDER wants "' + id + '" and no act file has it');
    return byId[id];
  });

  return CFG;
});
