/* ROCKY SAVES THE UNIVERSE — decode.js
 *
 * THE TRANSLATION.
 *
 * Nothing on this screen was ever in English. Rocky's name is not "Rocky" — Grace called
 * him that, later, because he couldn't pronounce the real one and the real one isn't a
 * word so much as a chord. The planet has a name an Eridian would know it by, and we write
 * it down in our letters because ours are the ones you can read. Every proper noun in this
 * game is a translation, and this file is the moment the translation happens: the word
 * arrives in its NATIVE script and, in front of you, resolves into English.
 *
 * The native script is BRAILLE — and that is not a costume. Rocky perceives by touch and
 * by sound; his whole world is dots. His numbers are already dots (· : ∴ ⁘ ⁙ ⁚, base six).
 * So his letters are dots too. A word begins as a row of raised cells you could read with
 * a finger, glitches, and settles into the Latin approximation we've agreed to call it.
 *
 * The engine is deterministic where it can be (a given letter always wears the same cell,
 * so the alien spelling of a word is stable and looks like a real orthography) and random
 * only in the shimmer — which is why frame() takes an rng: the test passes one that never
 * fires, so the animation's two ENDS are exact and checkable, and only the middle flickers.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ROCKY_DECODE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* The characters we know how to translate. Order matters: the alien cell a letter wears
   * is derived from its position here, so this string IS the alphabet's mapping. */
  const ALPHA = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:'!?-·";
  const BRAILLE0 = 0x2800;      // U+2800 is blank; U+2801..U+283F are the 63 raised cells
  const CELLS = 63;

  /* A stable, well-spread cell for the n-th glyph. 11 is coprime with 63, so the first 63
   * glyphs each get a DISTINCT cell — no two of our letters look alike. */
  function cell(n) { return String.fromCharCode(BRAILLE0 + 1 + (((n * 11) % CELLS) + CELLS) % CELLS); }

  const MAP = {};
  for (let i = 0; i < ALPHA.length; i++) MAP[ALPHA[i]] = ALPHA[i] === ' ' ? ' ' : cell(i);

  /* The native glyph for one character. Spaces stay spaces (words need gaps to look like
   * words); anything we don't have a letter for is spelled by its code point, so unknown
   * symbols still get a consistent alien cell instead of falling through as Latin. */
  function glyphOf(ch) {
    const u = ch.toUpperCase();
    if (MAP[u] != null) return MAP[u];
    return ch === ' ' ? ' ' : cell(ch.charCodeAt(0));
  }

  /* A whole word in its native script — the state a label boots in, and the state the
   * decode animation begins from. */
  function spell(text) {
    let out = '';
    for (const ch of text) out += glyphOf(ch);
    return out;
  }

  function scramble(rng) { return String.fromCharCode(BRAILLE0 + 1 + (rng() * CELLS | 0)); }

  /* ONE FRAME OF THE TRANSLATION.
   *
   * t runs 0 → 1. A wavefront sweeps left to right (a shade past the end, so the last
   * letter also gets its moment of scramble). Ahead of the front a character wears its
   * native cell, shimmering; AT the front it is pure noise; behind it, it has resolved to
   * English — and even resolved letters glitch back for a single frame now and then, which
   * is the whole cinematic point.
   *
   * Returns [{ c, hot }] so the caller can paint the unsettled cells differently (the
   * RGB-split glitch colour) from the settled ones. rng defaults to Math.random; the suite
   * hands it a constant so both ENDS of the animation are exact.
   */
  function frame(text, t, rng) {
    rng = rng || Math.random;
    const n = text.length;
    const front = t * (n + 3);
    const out = [];
    for (let i = 0; i < n; i++) {
      const ch = text[i];
      if (ch === ' ') { out.push({ c: ' ', hot: false }); continue; }
      const d = front - i;
      if (d >= 1) {
        if (rng() < 0.02) out.push({ c: scramble(rng), hot: true });   // a settled letter, flickering
        else out.push({ c: ch, hot: false });                          // resolved
      } else if (d > 0) {
        out.push({ c: scramble(rng), hot: true });                     // the wavefront: noise
      } else {
        out.push({ c: rng() < 0.22 ? scramble(rng) : glyphOf(ch), hot: false });  // still native, shimmering
      }
    }
    return out;
  }

  function frameStr(text, t, rng) { return frame(text, t, rng).map((p) => p.c).join(''); }

  return { ALPHA, glyphOf, spell, frame, frameStr };
});
